import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createServer} from 'node:http';
import mongoose from 'mongoose';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {createApp} from '../src/app';
import {AssistantConsentModel} from '../src/assistant-privacy';
import {CloudEligibility,cloudConfiguration} from '../src/cloud/policy';
import {CloudBudget,reserveCloud} from '../src/cloud/quota';
import {CLOUD_AI_NOTICE,CLOUD_AI_MODELS,ASSISTANT_PRIVACY_NOTICE} from '../../packages/learning-ui/src/services/assistant.types';

test('phase 4 consent, trusted eligibility, isolated provider routing and shared Mongo budgets',async t=>{
  const db=await MongoMemoryServer.create({binary:{version:'7.0.14'}});await mongoose.connect(db.getUri());
  await Promise.all([AssistantConsentModel.init(),CloudEligibility.init(),CloudBudget.init()]);
  const settings={CLOUD_AI_ENABLED:'1',GROQ_FREE_PLAN_CONFIRMED:'1',GROQ_ZDR_CONFIRMED:'1',CLOUD_AI_POLICY_REVIEW:CLOUD_AI_NOTICE,GROQ_QUOTA_SCOPE:'fixture-organization',GROQ_API_KEY:'fixture-not-a-real-key'};
  const before=Object.fromEntries(Object.keys(settings).map(key=>[key,process.env[key]]));Object.assign(process.env,settings);
  await CloudEligibility.create(['alice','bob'].map(uid=>({uid,adultVerified:true,regionApproved:true,policyVersion:CLOUD_AI_NOTICE,expiresAt:new Date(Date.now()+86400000)})));
  const originalFetch=globalThis.fetch;let calls:any[]=[];
  let provider:(input:any,signal:AbortSignal)=>Promise<Response>=async()=>new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:'A helpful answer'}}]}),{headers:{'Content-Type':'application/json'}});
  globalThis.fetch=async(input,init)=>{
    if(String(input).startsWith('https://')) {
      assert.equal(String(input),'https://api.groq.com/openai/v1/chat/completions');
      const value=JSON.parse(String(init?.body));calls.push(value);
      assert.equal(new Headers(init?.headers).get('authorization'),'Bearer fixture-not-a-real-key');
      return provider(value,init?.signal as AbortSignal);
    }
    return originalFetch(input,init);
  };
  const server=createServer(createApp({verify:async token=>{if(!['alice','bob','minor'].includes(token))throw new Error();return{uid:token}}}));
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+(server.address() as any).port;
  const call=async(route:string,method='GET',data?:unknown,uid='alice',signal?:AbortSignal)=>{
    const response=await originalFetch(base+route,{method,signal,headers:{Authorization:'Bearer '+uid,...(data===undefined?{}:{'Content-Type':'application/json'})},...(data===undefined?{}:{body:JSON.stringify(data)})});
    return{status:response.status,data:await response.json(),headers:response.headers};
  };
  const privacy='/api/assistant/privacy',cloud='/api/assistant/cloud/explain';
  const tokens:Record<string,string>={};
  const grant=async(uid='alice',revision=0,enabled=true)=>{const value=await call(privacy,'PUT',{revision,noticeVersion:CLOUD_AI_NOTICE,cloudConsent:enabled,webConsent:false},uid);tokens[uid]=value.data.grantToken;return value};
  const question=(extra:Record<string,unknown>={})=>({requestId:randomUUID(),noticeVersion:CLOUD_AI_NOTICE,consentRevision:1,grantToken:tokens.alice??'00000000-0000-4000-8000-000000000000',task:'explain',prompt:'Explain fractions',context:'A general arithmetic question',...extra});
  const reset=async()=>{calls=[];await AssistantConsentModel.deleteMany({});await CloudBudget.deleteMany({});provider=async()=>new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:'A helpful answer'}}]}),{headers:{'Content-Type':'application/json'}})};
  t.after(async()=>{globalThis.fetch=originalFetch;for(const [key,value]of Object.entries(before)){if(value===undefined)delete process.env[key];else process.env[key]=value}await new Promise<void>(resolve=>server.close(()=>resolve()));await mongoose.disconnect();await db.stop()});

  await t.test('missing consent, forged eligibility, old notices and disabled deployments never reserve or contact a provider',async()=>{
    assert.equal((await call(cloud,'POST',question())).status,403);
    assert.equal((await grant('minor')).status,409);
    assert.equal((await call(privacy,'PUT',{revision:0,noticeVersion:ASSISTANT_PRIVACY_NOTICE,cloudConsent:true,webConsent:false})).status,409);
    assert.equal((await call(privacy,'PUT',{revision:0,noticeVersion:CLOUD_AI_NOTICE,cloudConsent:true,webConsent:false,adultVerified:true})).status,400);
    assert.equal((await grant()).status,200);
    for(const extra of [{uid:'bob'},{model:'paid-model'},{provider:'openai'},{webText:'private page'},{noticeVersion:'old'}])assert.ok((await call(cloud,'POST',question(extra))).status>=400);
    process.env.CLOUD_AI_ENABLED='0';assert.equal((await call(cloud,'POST',question())).status,403);process.env.CLOUD_AI_ENABLED='1';
    assert.equal(calls.length,0);assert.equal(await CloudBudget.countDocuments(),0);
  });
  await t.test('explicit requests route only to approved Groq models, omit identity and reject replay IDs',async()=>{
    await reset();await grant();
    const payload=question();assert.equal((await call(cloud,'POST',payload)).status,200);
    assert.equal((await call(cloud,'POST',payload)).status,409);
    assert.equal((await call(cloud,'POST',question({task:'deep-explain'}))).status,200);
    assert.deepEqual(calls.map(value=>value.model),[CLOUD_AI_MODELS.fast,CLOUD_AI_MODELS.deep]);
    for(const value of calls){assert.equal(value.max_completion_tokens,1024);assert.equal(value.include_reasoning,false);assert.equal(value.tools,undefined);assert.equal(value.messages[0].role,'system');assert.doesNotMatch(JSON.stringify(value),/alice|fixture-not-a-real-key/)}
    const raw=JSON.stringify(await CloudBudget.findOne().lean());assert.doesNotMatch(raw,/Explain fractions|helpful answer|alice|arithmetic/);
  });
  await t.test('account consent remains isolated and expired operator approval blocks current grants',async()=>{
    await reset();await grant();
    assert.equal((await call(privacy,'GET',undefined,'bob')).data.cloudConsent,false);
    assert.equal((await call(cloud,'POST',question(),'bob')).status,403);
    await CloudEligibility.updateOne({uid:'alice'},{$set:{expiresAt:new Date(0)}});
    assert.equal((await call(cloud,'POST',question())).status,403);assert.equal(calls.length,0);
    await CloudEligibility.updateOne({uid:'alice'},{$set:{expiresAt:new Date(Date.now()+86400000)}});
  });
  await t.test('deleting and recreating consent cannot revive an earlier request with the same revision',async()=>{
    await reset();await grant();const old=question();
    assert.equal((await call(privacy,'DELETE',{revision:1})).status,200);
    await grant();assert.notEqual(tokens.alice,old.grantToken);
    assert.equal((await call(cloud,'POST',old)).status,403);assert.equal(calls.length,0);
    assert.equal((await call(cloud,'POST',question())).status,200);
  });
  await t.test('organization reservations are atomic across concurrent users and persist across router instances',async()=>{
    await reset();const config={...cloudConfiguration(),rpd:3,parallel:4,rpm:30,userDaily:10};
    const results=await Promise.allSettled(Array.from({length:20},(_,i)=>reserveCloud({...config},'user-'+i,randomUUID(),100)));
    const successes=results.filter((r):r is PromiseFulfilledResult<()=>Promise<void>>=>r.status==='fulfilled');
    if(successes.length!==3)console.error('Reservation failure:',results.find(r=>r.status==='rejected'));
    assert.equal(successes.length,3);await Promise.all(successes.map(r=>r.value()));
    const saved:any=await CloudBudget.findOne().lean();assert.equal(saved.state.requests,3);assert.equal(saved.state.tokens,300);
    await assert.rejects(reserveCloud({...config},'another',randomUUID(),100),/shared cloud allowance/);
  });
  await t.test('provider 429 creates shared cooldown and never retries or chooses a paid fallback',async()=>{
    await reset();await grant();await grant('bob');provider=async()=>new Response('private provider diagnostic',{status:429,headers:{'Retry-After':'120'}});
    assert.equal((await call(cloud,'POST',question())).status,429);
    const blocked=await call(cloud,'POST',question({grantToken:tokens.bob}),'bob');assert.equal(blocked.status,429);assert.equal(calls.length,1);
    assert.doesNotMatch(JSON.stringify(blocked.data),/diagnostic/);const saved:any=await CloudBudget.findOne().lean();assert.ok(saved.state.cooldownUntil>Date.now()+100000);assert.equal(saved.state.requests,1);
  });
  await t.test('token-minute and per-user daily caps survive release; rolling-minute expiration does not reset daily usage',async()=>{
    await reset();const config={...cloudConfiguration(),tpm:250,userDaily:1};
    const finish=await reserveCloud(config,'alice',randomUUID(),200);await finish();
    await assert.rejects(reserveCloud(config,'bob',randomUUID(),100),/shared cloud allowance/);
    await assert.rejects(reserveCloud(config,'alice',randomUUID(),1),/daily cloud allowance/);
    const saved:any=await CloudBudget.findOne().lean();saved.state.events[0].at=Date.now()-61000;
    await CloudBudget.updateOne({_id:saved._id},{$set:{state:saved.state}});
    await (await reserveCloud(config,'bob',randomUUID(),100))();
    const after:any=await CloudBudget.findOne().lean();assert.equal(after.state.requests,2);assert.equal(after.state.tokens,300);assert.equal(after.state.events.length,1);
  });
  await t.test('malformed, oversized or truncated provider answers fail without storing content or refunding attempts',async()=>{
    for(const body of ['not-json','x'.repeat(65537),JSON.stringify({choices:[{finish_reason:'length',message:{content:'partial'}}]})]) {
      await reset();await grant();provider=async()=>new Response(body,{headers:{'Content-Type':'application/json'}});
      assert.equal((await call(cloud,'POST',question())).status,502);assert.equal(calls.length,1);
      const saved:any=await CloudBudget.findOne().lean();assert.equal(saved.state.requests,1);assert.equal(Object.keys(saved.state.active).length,0);
    }
  });
  await t.test('revocation cancels an in-flight provider call and prevents its answer from being delivered',async()=>{
    await reset();await grant();let entered!:()=>void,aborted=false;
    const start=new Promise<void>(resolve=>entered=resolve);
    provider=async(_input,signal)=>{entered();return new Promise((_resolve,reject)=>{signal.addEventListener('abort',()=>{aborted=true;reject(new Error('abort'))},{once:true})})};
    const pending=call(cloud,'POST',question());await Promise.race([start,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Provider was never admitted')),4000))]);assert.equal((await grant('alice',1,false)).status,200);
    assert.ok((await pending).status>=400);assert.equal(aborted,true);assert.equal(calls.length,1);
    assert.equal((await call(cloud,'POST',question({consentRevision:2}))).status,403);assert.equal(calls.length,1);
  });
  await t.test('legacy routes stay denied and database/quota misconfiguration fails closed',async()=>{
    await reset();await grant();process.env.CLOUD_AI_ORG_TPM='NaN';
    assert.equal((await call(cloud,'POST',question())).status,503);delete process.env.CLOUD_AI_ORG_TPM;
    const config=cloudConfiguration();await CloudBudget.create({_id:'groq:'+ (await import('node:crypto')).createHash('sha256').update(config.scope).digest('hex'),revision:0,state:{broken:true}});
    assert.equal((await call(cloud,'POST',question())).status,503);assert.equal(calls.length,0);
  });
});
