import os from 'node:os';
import path from 'node:path';
import {mkdtemp,rm} from 'node:fs/promises';
import {createLocalRuntime} from './assistant/runtime';

/** Fixed offline maintenance operation; no arbitrary URLs, paths or commands. */
export async function checkInstallation(nativeRoot:string,manifest:string) {
  const temporary=await mkdtemp(path.join(os.tmpdir(),'los-install-'));
  try {
    const runtime=createLocalRuntime(nativeRoot,manifest,path.join(temporary,'web-work'));
    const status=await runtime.status();
    if(status.local!=='ready' || status.web!=='ready')throw new Error('NATIVE_NOT_READY');
    const proposal=await runtime.propose('open courses',AbortSignal.timeout(20000));
    if(proposal.kind!=='proposal' || proposal.action.name!=='open_view' || proposal.action.arguments.view!=='courses')throw new Error('MODEL_CHECK_FAILED');
    return {ok:true,status,offline:true};
  }finally{await rm(temporary,{recursive:true,force:true,maxRetries:5,retryDelay:100})}
}
