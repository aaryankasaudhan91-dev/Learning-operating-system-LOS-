import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,readdir,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createServer} from 'node:http';
import mongoose from 'mongoose';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {PrivacyStore,accountScope} from '../../desktop/assistant/privacy-store';
import {PrivacyContext} from '../../desktop/assistant/privacy-context';
import {ASSISTANT_PRIVACY_NOTICE} from '../../packages/learning-ui/src/services/assistant.types';
import {AssistantConsentModel} from '../src/assistant-privacy';
import {UserProfileModel} from '../src/models';
import {createApp} from '../src/app';

test('local choices persist independently for accounts and never write prompt or identity data',async()=>{
 const directory=await mkdtemp(path.join(os.tmpdir(),'los-privacy-'));
 try{
  const store=new PrivacyStore(directory),alice=accountScope('alice-private-id'),bob=accountScope('bob-private-id');
  assert.notEqual(alice,accountScope(null));assert.notEqual(accountScope('null'),accountScope(null));
  assert.equal((await store.read(alice)).localCommandsEnabled,true);
  const saved=await store.update(alice,0,false);assert.equal(saved.revision,1);
  assert.equal((await new PrivacyStore(directory).read(alice)).localCommandsEnabled,false);
  assert.equal((await store.read(bob)).localCommandsEnabled,true);
  const files=await readdir(directory);assert.equal(files.length,1);assert.ok(!files[0].includes('alice'));
  const raw=await readFile(path.join(directory,files[0]),'utf8');assert.ok(!raw.includes('alice-private-id'));
  assert.deepEqual(Object.keys(JSON.parse(raw)).sort(),['localCommandsEnabled','noticeVersion','revision']);
  await assert.rejects(store.update(alice,0,true),/CONFLICT/);
  assert.equal((await store.read(alice)).localCommandsEnabled,false);
  await store.forget(alice);assert.equal((await store.read(alice)).localCommandsEnabled,true);
 }finally{await rm(directory,{recursive:true,force:true})}
});
test('corrupt local preferences pause inference and can be reset without touching other accounts',async()=>{
 const directory=await mkdtemp(path.join(os.tmpdir(),'los-corrupt-'));
 try{
  const store=new PrivacyStore(directory);await store.update(accountScope('bob'),0,false);
  await writeFile(path.join(directory,accountScope('alice')+'.json'),'not JSON');
  const context=new PrivacyContext(store,()=>{});const value=await context.bind('alice');
  assert.equal(value.storage,'unavailable');assert.equal(value.preferences.localCommandsEnabled,false);
  let called=false;await assert.rejects(context.propose(value.token,'one',async()=>{called=true}),/PRIVACY_UNAVAILABLE/);assert.equal(called,false);
  const repaired=await context.forget(value.token);assert.equal(repaired.storage,'ready');assert.equal(repaired.preferences.localCommandsEnabled,true);
  assert.equal((await store.read(accountScope('bob'))).localCommandsEnabled,false);
 }finally{await rm(directory,{recursive:true,force:true})}
});
test('disable, account switch, content clear and reset invalidate in-flight work and old context tokens',async()=>{
 const directory=await mkdtemp(path.join(os.tmpdir(),'los-context-'));
 try{
  const context=new PrivacyContext(new PrivacyStore(directory),()=>{});const alice=await context.bind('alice');
  let finish!:(value:string)=>void,signal!:AbortSignal;
  const pending=context.propose(alice.token,'running',async value=>{signal=value;return new Promise<string>(resolve=>finish=resolve)});
  const disabled=await context.update(alice.token,0,false);assert.ok(signal.aborted);
  finish('old result');await assert.rejects(pending,/CANCELLED/);
  await assert.rejects(context.propose(alice.token,'two',async()=>''),/PRIVACY_DISABLED/);
  const bob=await context.bind('bob');assert.equal(bob.preferences.localCommandsEnabled,true);
  await assert.rejects(context.propose(alice.token,'three',async()=>''),/STALE_CONTEXT/);
  const switched=await context.bind('alice');assert.equal(switched.preferences.localCommandsEnabled,false);
  const reset=await context.forget(switched.token);assert.notEqual(reset.token,switched.token);
  await assert.rejects(context.propose(switched.token,'four',async()=>''),/STALE_CONTEXT/);
  const clearPending=context.propose(reset.token,'five',async()=>new Promise<string>(resolve=>finish=resolve));
  context.resetContent();finish('cleared');await assert.rejects(clearPending,/CANCELLED/);
  assert.equal(disabled.preferences.noticeVersion,ASSISTANT_PRIVACY_NOTICE);
 }finally{await rm(directory,{recursive:true,force:true})}
});
test('concurrent local saves honor revisions rather than silently overwriting choices',async()=>{
 const directory=await mkdtemp(path.join(os.tmpdir(),'los-revision-'));
 try{
  const store=new PrivacyStore(directory),scope=accountScope('account');
  const results=await Promise.allSettled([store.update(scope,0,false),store.update(scope,0,true)]);
  assert.equal(results.filter(value=>value.status==='fulfilled').length,1);
  assert.equal((await store.read(scope)).localCommandsEnabled,false);
 }finally{await rm(directory,{recursive:true,force:true})}
});
test('authenticated consent records are account-scoped, reject premature grants and block provider calls before quota use',async t=>{
 const db=await MongoMemoryServer.create({binary:{version:'7.0.14'}});await mongoose.connect(db.getUri());
 await AssistantConsentModel.init();await UserProfileModel.init();
 await UserProfileModel.create([{uid:'alice',email:'alice@example.test',fullName:'Alice',role:'student'},
  {uid:'bob',email:'bob@example.test',fullName:'Bob',role:'student'}]);
 const environment=['AI_PROVIDER','AI_MODEL','GROQ_API_KEY'];const previous=environment.map(key=>process.env[key]);
 process.env.AI_PROVIDER='groq';process.env.AI_MODEL='openai/gpt-oss-20b';process.env.GROQ_API_KEY='fixture-key';
 const originalFetch=globalThis.fetch;let providerCalls=0;
 globalThis.fetch=async(input,init)=>{if(String(input).startsWith('https://api.groq.com/')){providerCalls++;throw new Error('Provider I/O was forbidden')}return originalFetch(input,init)};
 const server=createServer(createApp({verify:async token=>{if(!['alice','bob'].includes(token))throw new Error();return{uid:token}}}));
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(async()=>{globalThis.fetch=originalFetch;environment.forEach((key,index)=>{if(previous[index]===undefined)delete process.env[key];else process.env[key]=previous[index]});await new Promise<void>(resolve=>server.close(()=>resolve()));await mongoose.disconnect();await db.stop()});
 const base='http://127.0.0.1:'+(server.address() as any).port;
 async function call(method='GET',data?:unknown,user='alice',route='/api/assistant/privacy'){
  const response=await fetch(base+route,{method,headers:{Authorization:'Bearer '+user,...(data===undefined?{}:{'Content-Type':'application/json'})},...(data===undefined?{}:{body:JSON.stringify(data)})});return{status:response.status,data:await response.json()};
 }
 assert.equal((await call('GET',undefined,'invalid')).status,401);
 const empty=await call();assert.equal(empty.data.revision,0);assert.equal(empty.data.cloudConsent,false);assert.equal(await AssistantConsentModel.countDocuments(),0);
 const input={revision:0,noticeVersion:ASSISTANT_PRIVACY_NOTICE,cloudConsent:false,webConsent:false};
 assert.equal((await call('PUT',{...input,uid:'bob'})).status,400);
 assert.equal((await call('PUT',{...input,noticeVersion:'outdated'})).status,409);
 assert.equal((await call('PUT',{...input,cloudConsent:true})).status,409);
 const results=await Promise.all([call('PUT',input),call('PUT',input)]);
 assert.deepEqual(results.map(result=>result.status).sort(),[200,409]);
 assert.equal((await call()).data.revision,1);assert.equal((await call('GET',undefined,'bob')).data.revision,0);
 assert.equal((await call('DELETE',{revision:1},'bob')).status,409);
 const blocked=await call('POST',{chatHistory:[{role:'user',text:'Explain fractions'}]},'alice','/api/agent/guide-chat');
 assert.equal(blocked.status,403);assert.equal(providerCalls,0);
 assert.equal(await mongoose.models.AiDailyUsage.countDocuments(),0);
 const capabilities=await call('GET',undefined,'alice','/api/capabilities');assert.equal(capabilities.data.ai.enabled,false);
 assert.equal((await call('DELETE',{revision:1})).data.revision,0);assert.equal(await AssistantConsentModel.countDocuments(),0);
 assert.equal((await call('POST',{chatHistory:[]},'alice','/api/agent/guide-chat')).status,403);
 assert.equal(providerCalls,0);
});
