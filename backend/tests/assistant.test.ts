import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {request, action, proposal} from '../../desktop/assistant/contracts';
import {isTrustedDocument} from '../../desktop/assistant/origin';
import {AssistantSession} from '../../desktop/assistant/session';
import {childEnvironment, runNative, verifyArtifacts} from '../../desktop/assistant/native';
import {createLocalRuntime} from '../../desktop/assistant/runtime';
const id = '12345678-1234-1234-1234-123456789abc';
test('assistant contracts reject native execution, extra properties and invalid drafts', () => {
  assert.equal(request({id, text:'open courses'}, 'text').value, 'open courses');
  for (const input of [{id,text:'hi',executable:'cmd.exe'},{id,text:'a'.repeat(4097)},{id,text:'\0'},[]]) assert.throws(() => request(input,'text'));
  for (const input of [{name:'exec',arguments:{}},{name:'open_view',arguments:{view:'admin'}},
    {name:'prepare_focus',arguments:{topic:'math',minutes:0}},
    {name:'prepare_focus',arguments:{topic:'math',minutes:20,uid:'other'}}]) assert.throws(() => action(input));
  assert.deepEqual(proposal({kind:'unsupported'}), {kind:'unsupported'});
  assert.throws(() => proposal({kind:'proposal',action:{name:'open_view',arguments:{view:'courses'}},confidence:NaN}));
});
test('only the exact app document retains access; hashes remain valid', () => {
  const doc='file:///C:/app/frontend-dist/index.html';
  assert.ok(isTrustedDocument(doc+'#settings',doc));
  assert.equal(isTrustedDocument('file:///C:/other.html',doc),false);
  assert.equal(isTrustedDocument(doc+'?injected=1',doc),false);
  assert.equal(isTrustedDocument('http://127.0.0.1:5173/other','http://127.0.0.1:5173/'),false);
});
test('account reset cancels a running request and rejects stale results', async () => {
  const session=new AssistantSession(); let finish!:(value:string)=>void; let signal!:AbortSignal;
  const pending=session.run(id, async value => {signal=value; return new Promise<string>(resolve=>{finish=resolve})});
  session.reset(); assert.equal(signal.aborted,true);
  await assert.rejects(session.run('new',async()=>''),/BUSY/);
  finish('stale'); await assert.rejects(pending,/CANCELLED/);
  assert.equal(await session.run('new',async()=>'fresh'),'fresh');
});
test('request admission limits repeated attempts and refills over time', async () => {
  let time=0;const session=new AssistantSession(()=>time);
  for(let n=0;n<10;n++) await session.run(String(n),async()=>n);
  await assert.rejects(session.run('overflow',async()=>''),/RATE_LIMIT/);
  time=6000;assert.equal(await session.run('refill',async()=>'ok'),'ok');
});
const invoke=(script:string, extra:Partial<Parameters<typeof runNative>[0]>={})=>runNative({
  executable:process.execPath,args:['-e',script],cwd:process.cwd(),env:childEnvironment(),signal:new AbortController().signal,...extra});
test('native input uses pipes and child environment excludes secrets/injection', async () => {
  const env=childEnvironment();assert.equal(env.GROQ_API_KEY,undefined);assert.equal(env.NODE_OPTIONS,undefined);assert.equal(env.PYTHONPATH,undefined);
  assert.equal(await invoke("let s='';process.stdin.on('data',v=>s+=v);process.stdin.on('end',()=>process.stdout.write(s))",{input:'private command'}),'private command');
});
test('native supervisor handles crashes, missing files, floods, timeouts and aborts', async () => {
  await assert.rejects(invoke('process.exit(7)'),/NATIVE_FAILED/);
  await assert.rejects(invoke("process.stdout.write('x'.repeat(5000))",{maxBytes:1024}),/NATIVE_OUTPUT_LIMIT/);
  await assert.rejects(invoke("process.stderr.write('x'.repeat(5000))",{maxBytes:1024}),/NATIVE_OUTPUT_LIMIT/);
  await assert.rejects(invoke('setInterval(()=>{},1000)',{timeoutMs:300}),/NATIVE_TIMEOUT/);
  const controller=new AbortController();const pending=invoke('setInterval(()=>{},1000)',{signal:controller.signal});
  setTimeout(()=>controller.abort(),100);await assert.rejects(pending,/CANCELLED/);
  await assert.rejects(invoke('',{executable:path.join(process.cwd(),'nonexistent-assistant.exe')}),/NATIVE_START/);
});
test('modified artifacts fail closed and missing assets do not break the application', async () => {
  const folder=await mkdtemp(path.join(os.tmpdir(),'los-assistant-'));
  try {
    await writeFile(path.join(folder,'model'),'test');
    const hash=createHash('sha256').update('test').digest('hex');
    assert.ok((await verifyArtifacts(folder,{model:hash})).has('model'));
    await writeFile(path.join(folder,'injected.dll'),'unlisted');
    await assert.rejects(verifyArtifacts(folder,{model:hash}),/ARTIFACT_INVALID/);
    await rm(path.join(folder,'injected.dll'));
    await assert.rejects(verifyArtifacts(folder,{model:'0'.repeat(64)}),/ARTIFACT_INVALID/);
    await assert.rejects(verifyArtifacts(folder,{}),/ARTIFACT_INVALID/);
    const runtime=createLocalRuntime(folder,path.join(folder,'missing-manifest.json'));
    const status=await runtime.status();assert.ok(['missing','unsupported-platform'].includes(status.local));
    await assert.rejects(runtime.propose('open courses',new AbortController().signal),/LOCAL_UNAVAILABLE/);
  } finally {await rm(folder,{recursive:true,force:true})}
});
