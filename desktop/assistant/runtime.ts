import path from 'node:path';
import {readFile} from 'node:fs/promises';
import type {AssistantStatus, AssistantProposal} from '../../packages/learning-ui/src/services/assistant.types';
import {proposal} from './contracts';
import {childEnvironment, runNative, verifyArtifacts, type Manifest} from './native';
export function createLocalRuntime(root: string, manifestPath: string) {
  let local: AssistantStatus['local'] = process.platform === 'win32' && process.arch === 'x64' ? 'checking' : 'unsupported-platform';
  let executable: string | undefined;
  const status = (): AssistantStatus => ({local, web: 'disabled', cloud: 'disabled'});
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
    } catch (error) {
      local = (error as NodeJS.ErrnoException).code === 'ENOENT' ? 'missing' : 'invalid';
      executable = undefined;
    }
  }
  function ready() {return initializing ||= initialize()}
  return {
    async status() {await ready(); return status()},
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
