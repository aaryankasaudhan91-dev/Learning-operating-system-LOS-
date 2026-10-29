import os from 'node:os';
import {build} from 'esbuild';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import path from 'node:path';
import {mkdir, writeFile, readFile, mkdtemp, rm} from 'node:fs/promises';
const require=createRequire(import.meta.url);
await mkdir('build/assistant-ui-test',{recursive:true});
await build({entryPoints:['desktop/tests/focus-fixture.tsx'],bundle:true,platform:'browser',format:'iife',jsx:'automatic',define:{'import.meta.env':'{}'},outfile:'build/assistant-ui-test/focus.js',plugins:[{
  name:'isolated-focus-service',setup(builder){builder.onResolve({filter:/services\/focus\.service$/},()=>({path:path.resolve('desktop/tests/focus-service-fixture.ts')}))}
}]});
await writeFile('build/assistant-ui-test/index.html','<!doctype html><div id="root"></div><script src="focus.js"></script>');
await build({entryPoints:['desktop/tests/electron-assistant.ts'],bundle:true,platform:'node',format:'cjs',external:['electron'],outfile:'build/assistant-electron-test.cjs'});
const profile=await mkdtemp(path.join(os.tmpdir(),'synapse-electron-profile-'));
const resultFile=path.resolve('build/assistant-electron-result.json');
await writeFile(resultFile,JSON.stringify({ok:false}));
const child=spawn(require('electron'),['build/assistant-electron-test.cjs'],{cwd:process.cwd(),windowsHide:true,stdio:'inherit',env:{...process.env,SYNAPSE_ASSISTANT_PROJECT_ROOT:path.resolve('.'),SYNAPSE_ASSISTANT_RESULT:resultFile,SYNAPSE_TEST_PROFILE:profile}});
const timeout=setTimeout(()=>{child.kill();process.exitCode=1},60000);
child.on('error',()=>{clearTimeout(timeout);process.exitCode=1});
child.on('exit',async code=>{clearTimeout(timeout);let ok=false;try{ok=JSON.parse(await readFile(resultFile,'utf8')).ok===true}catch{}await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100}).catch(()=>{});process.exitCode=code===0 && ok?0:1});
