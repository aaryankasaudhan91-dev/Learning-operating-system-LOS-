import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {mkdir,mkdtemp,copyFile,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {existsSync} from 'node:fs';
const root=process.cwd(),parent=path.join(root,'build/reader-containment');
await mkdir(parent,{recursive:true});const temporary=await mkdtemp(path.join(parent,'run-'));
const runtime=path.join(temporary,'runtime'),job=path.join(temporary,'job');
await mkdir(runtime);await mkdir(job);
const host=path.join(runtime,'los-reader-host.exe'),page=path.join(job,'page.html'),secret=path.join(temporary,'private.txt');
const invoke=(args,options={})=>new Promise((resolve,reject)=>{
  const child=spawn(host,args,{windowsHide:true,stdio:['pipe','pipe','pipe'],env:{...process.env,LOS_TEST_SECRET:'must-not-inherit'},...options});
  let out='',err='';const timer=setTimeout(()=>child.kill(),20000);
  child.stdout.on('data',chunk=>out+=chunk);child.stderr.on('data',chunk=>err+=chunk);
  child.on('error',reject);child.on('close',code=>{clearTimeout(timer);code===0?resolve(out):reject(new Error('Native containment test failed: '+code+' '+err))});child.stdin.end();
});
let server;
try {
  await copyFile(path.join(root,'resources/native/win32-x64/obscura/los-reader-host.exe'),host);
  const compile=spawnSync('gcc',['-O2','-Wall','-Wextra','-Werror','-static','-o',path.join(runtime,'obscura.exe'),path.join(root,'native/obscura/containment-probe.c'),'-lws2_32','-ladvapi32'],{windowsHide:true,encoding:'utf8'});
  assert.equal(compile.status,0,compile.stderr);
  await invoke(['--prepare']);await invoke(['--cleanup']);
  await writeFile(secret,'PRIVATE_CANARY_MUST_NEVER_BE_READ');
  let connections=0;
  server=http.createServer((_request,response)=>{connections++;response.end('PRIVATE_NETWORK_CANARY')});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;
  await new Promise((resolve,reject)=>http.get('http://127.0.0.1:'+port+'/',response=>{response.resume();response.on('end',resolve)}).on('error',reject));
  assert.equal(connections,1);connections=0;
  await writeFile(page,'probe\n'+secret+'\n'+port+'\n');
  const result=JSON.parse(await invoke([job]));
  assert.deepEqual(result,{container:1,capabilities:0,privateReadDenied:1,writeDenied:1,privateNetworkDenied:1,publicNetworkDenied:1,childDenied:1,job:1,activeLimit:1,memoryLimit:1073741824,environmentClean:1});
  assert.equal(connections,0,'contained probe reached the known live loopback listener');
  console.log('PASS: real AppContainer token, no capabilities, denied private file/read-write/network/children, bounded job, clean environment');
  // Force-kill the trusted launcher and independently verify its child dies.
  await writeFile(page,'hang\n');
  const hanging=spawn(host,[job],{windowsHide:true,stdio:['pipe','pipe','pipe']});hanging.stdin.end();
  const pid=await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('No contained child PID')),5000);hanging.stdout.once('data',chunk=>{clearTimeout(timeout);resolve(Number(String(chunk).trim()))});hanging.once('error',reject)});
  const closed=new Promise(resolve=>hanging.once('close',resolve));hanging.kill();await closed;
  await new Promise(resolve=>setTimeout(resolve,300));
  assert.throws(()=>process.kill(pid,0),error=>error.code==='ESRCH');
  await invoke(['--cleanup']);console.log('PASS: launcher termination kills its contained child and profile cleanup recovers');
  // Test the actual pinned Obscura engine against hostile offline markup.
  await copyFile(path.join(root,'resources/native/win32-x64/obscura/obscura.exe'),path.join(runtime,'obscura.exe'));
  await invoke(['--prepare']);
  await writeFile(page,`<html><body><h1>LOS offline reader works</h1><img src="http://127.0.0.1:${port}/image"><iframe src="http://127.0.0.1:${port}/frame"></iframe><script>fetch('http://127.0.0.1:${port}/xhr').then(r=>r.text()).then(t=>document.body.append(t)).catch(()=>{});</script></body></html>`);
  const text=await invoke([job]);assert.match(text,/LOS offline reader works/);assert.doesNotMatch(text,/PRIVATE_.*CANARY/);assert.equal(connections,0);
  await new Promise((resolve,reject)=>http.get('http://127.0.0.1:'+port+'/',response=>{response.resume();response.on('end',resolve)}).on('error',reject));
  assert.equal(connections,1,'the local listener remained reachable outside the container');
  console.log('PASS: pinned Obscura extracts document text; hostile image/iframe/script requests do not reach loopback');
}finally{
  if(server)await new Promise(resolve=>server.close(resolve));
  try{if(existsSync(host))await invoke(['--cleanup'])}finally{await rm(temporary,{recursive:true,force:true,maxRetries:5,retryDelay:100})}
}
