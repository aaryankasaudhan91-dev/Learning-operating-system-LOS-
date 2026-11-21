import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import type {AssistantStatus, AssistantProposal} from '../../packages/learning-ui/src/services/assistant.types';
import {proposal} from './contracts';
import {childEnvironment, runNative, verifyArtifacts, type Manifest} from './native';
import {createWebReader} from './web-reader';
export function createLocalRuntime(root: string, manifestPath: string, workRoot=path.join(os.tmpdir(),'synapse-reader-'+createHash('sha256').update(root).digest('hex').slice(0,12))) {
  let local: AssistantStatus['local'] = process.platform === 'win32' && process.arch === 'x64' ? 'checking' : 'unsupported-platform';
  let executable: string | undefined;
  let web:AssistantStatus['web']='disabled',reader:ReturnType<typeof createWebReader>|undefined,webBusy=false;
  const status = (): AssistantStatus => ({local, web, cloud: 'disabled'});
  let initializing: Promise<void> | undefined;
  async function initialize() {
    if (local === 'unsupported-platform') return;
    try {
      const manifest: Manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      const files = await verifyArtifacts(root, manifest);
      for (const file of ['needle/los-needle.exe', 'needle/libneedle.dll', 'needle/needle3.cact', 'needle/tools.json']) {
        if (!files.has(file)) throw new Error('ARTIFACT_INVALID');
      }
      executable = files.get('needle/los-needle.exe'); local = 'ready';
      if(files.has('obscura/obscura.exe') && files.has('obscura/los-reader-host.exe')) {
        try {
          reader=createWebReader(files.get('obscura/los-reader-host.exe')!,workRoot);
          await reader.initialize();web='ready';
        }catch {reader=undefined;web='unavailable'}
      }
    } catch (error) {
      local = (error as NodeJS.ErrnoException).code === 'ENOENT' ? 'missing' : 'invalid';
      executable = undefined;
    }
  }
  function ready() {return initializing ||= initialize()}
  return {
    async status() {await ready(); return status()},
    async readPage(url:string,signal:AbortSignal) {
      await ready();if(!reader || web!=='ready')throw new Error('WEB_UNAVAILABLE');
      if(webBusy)throw new Error('BUSY');webBusy=true;
      try {return await reader.read(url,signal)}
      catch(error){if((error as Error).message==='WEB_CLEANUP_FAILED')web='unavailable';throw error}
      finally {webBusy=false}
    },
    async propose(text: string, signal: AbortSignal): Promise<AssistantProposal> {
      await ready();
      if (!executable) throw new Error('LOCAL_UNAVAILABLE');
      const raw = await runNative({executable, args: [], cwd: path.dirname(executable),
        env: childEnvironment(), input: JSON.stringify({text}), signal, maxBytes: 65536});
      return proposal(JSON.parse(raw));
    }
  };
}
export type LocalRuntime = ReturnType<typeof createLocalRuntime>;
