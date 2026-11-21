import path from 'node:path';
import {mkdir,mkdtemp,readdir,lstat,rm,writeFile} from 'node:fs/promises';
import type {AssistantWebPage} from '../../packages/learning-ui/src/services/assistant.types';
import {childEnvironment,runNative} from './native';
import {fetchPublicPage} from './web-fetch';

/** Main-process broker downloads one document. Obscura has NO network capabilities,
 * no persistent storage option, no CDP listener, and no account/provider secrets. */
export function createWebReader(host:string,workRoot:string) {
  let blocked=false;
  const environment=()=>({...childEnvironment(),LOCALAPPDATA:process.env.LOCALAPPDATA});
  async function cleanupProfile() {
    await runNative({executable:host,args:['--cleanup'],cwd:path.dirname(host),env:environment(),
      signal:new AbortController().signal,timeoutMs:5000,maxBytes:4096});
  }
  async function removeJob(folder:string) {
    if(path.dirname(folder)!==workRoot || !path.basename(folder).startsWith('read-') || (await lstat(folder)).isSymbolicLink())throw new Error('WEB_UNAVAILABLE');
    await rm(folder,{recursive:true,force:true,maxRetries:5,retryDelay:100});
  }
  return {
    async initialize() {
      if(!path.isAbsolute(workRoot))throw new Error('WEB_UNAVAILABLE');
      await mkdir(workRoot,{recursive:true});
      if((await lstat(workRoot)).isSymbolicLink())throw new Error('WEB_UNAVAILABLE');
      // Recover only our explicitly owned work directories after an interrupted app.
      await cleanupProfile();
      for(const entry of await readdir(workRoot,{withFileTypes:true})) {
        if(!entry.isDirectory() || !/^read-[A-Za-z0-9]+$/.test(entry.name))throw new Error('WEB_UNAVAILABLE');
        await removeJob(path.join(workRoot,entry.name));
      }
      const smoke=await mkdtemp(path.join(workRoot,'read-'));
      try {
        await writeFile(path.join(smoke,'page.html'),'<html><body>LOS_READER_READY</body></html>',{flag:'wx',mode:0o600});
        const check=()=>runNative({executable:host,args:[smoke],cwd:path.dirname(host),env:environment(),
          signal:new AbortController().signal,timeoutMs:18000,maxBytes:4096});
        let text:string;
        try{text=await check()}
        catch {
          // A copied/per-user installation can lack this installation's SID ACL.
          // Repair only read/execute on the already hash-verified browser binary.
          // System-wide installs without permission must provision it at install.
          await cleanupProfile();
          await runNative({executable:host,args:['--prepare'],cwd:path.dirname(host),env:environment(),
            signal:new AbortController().signal,timeoutMs:5000,maxBytes:4096});
          text=await check();
        }
        if(!text.includes('LOS_READER_READY'))throw new Error('WEB_UNAVAILABLE');
      }finally{await cleanupProfile();await removeJob(smoke)}
    },
    async read(url:string,signal:AbortSignal):Promise<AssistantWebPage> {
      if(blocked)throw new Error('WEB_UNAVAILABLE');
      let folder:string|undefined;
      const deadline=AbortSignal.timeout(22000), lifetime=AbortSignal.any([signal,deadline]);
      try {
        const page=await fetchPublicPage(url,lifetime);
        lifetime.throwIfAborted();
        folder=await mkdtemp(path.join(workRoot,'read-'));
        const html=page.plain?'<html><meta charset="utf-8"><body><pre>'+page.body.toString('utf8').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</pre></body></html>':page.body;
        await writeFile(path.join(folder,'page.html'),html,{flag:'wx',mode:0o600});
        const raw=await runNative({executable:host,args:[folder],cwd:path.dirname(host),env:environment(),
          signal:lifetime,timeoutMs:18000,maxBytes:262144});
        const text=raw.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,'').trim();
        if(!text)throw new Error('WEB_EMPTY');
        return {requestedUrl:page.requestedUrl,finalUrl:page.finalUrl,status:page.status,
          text:text.slice(0,40000),truncated:text.length>40000,fetchedAt:new Date().toISOString(),
          mode:'offline-document',untrusted:true};
      } catch(error) {
        if(signal.aborted)throw new Error('CANCELLED');
        if(deadline.aborted)throw new Error('WEB_TIMEOUT');
        throw error;
      } finally {
        // Child closure occurs before runNative settles; kill-on-close already
        // terminated the contained job even if the launcher was force-killed.
        try {await cleanupProfile();if(folder)await removeJob(folder)}
        catch {blocked=true;throw new Error('WEB_CLEANUP_FAILED')}
      }
    }
  };
}
