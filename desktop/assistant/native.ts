import {spawn, type ChildProcessWithoutNullStreams} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile, realpath, readdir, lstat} from 'node:fs/promises';
import path from 'node:path';

export function childEnvironment(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  // Never inherit API keys, NODE_OPTIONS, proxies, PYTHONPATH or Electron flags.
  for (const key of ['SystemRoot', 'WINDIR', 'TEMP', 'TMP']) {
    if (process.env[key]) env[key] = process.env[key];
  }
  return {...env, NEEDLE_TELEMETRY: '0', DO_NOT_TRACK: '1', HF_HUB_OFFLINE: '1',
    HF_HUB_DISABLE_TELEMETRY: '1', OBSCURA_ALLOW_PRIVATE_NETWORK: '0',
    OBSCURA_NAV_TIMEOUT_MS: '10000', OBSCURA_FETCH_TIMEOUT_MS: '10000',
    OBSCURA_SCRIPT_DEADLINE_MS: '10000', OBSCURA_NAV_CHAIN_LIMIT: '4',
    OBSCURA_TIMEZONE: 'Asia/Kolkata', RUST_LOG: 'off'};
}
export interface RunOptions {
  executable: string; args: string[]; cwd: string; env: NodeJS.ProcessEnv;
  input?: string; signal: AbortSignal; timeoutMs?: number; maxBytes?: number;
}
// Fixed leaf processes only. A child process is NOT an OS security sandbox.
export function runNative(options: RunOptions): Promise<string> {
  if (!path.isAbsolute(options.executable) || !path.isAbsolute(options.cwd)) return Promise.reject(new Error('INVALID'));
  if (options.signal.aborted) return Promise.reject(new Error('CANCELLED'));
  return new Promise((resolve, reject) => {
    let child: ChildProcessWithoutNullStreams;
    let error: string | undefined;
    let total = 0;
    const output: Buffer[] = [];
    const cap = options.maxBytes ?? 131072;
    try {
      child = spawn(options.executable, options.args, {cwd: options.cwd, env: options.env,
        shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe']});
    } catch { reject(new Error('NATIVE_START')); return; }
    const stop = (code: string) => {
      error ||= code;
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
    };
    const abort = () => stop('CANCELLED');
    const timer = setTimeout(() => stop('NATIVE_TIMEOUT'), options.timeoutMs ?? 20000);
    options.signal.addEventListener('abort', abort, {once: true});
    // Covers cancellation between the first check and listener installation.
    if (options.signal.aborted) abort();
    const consume = (chunk: Buffer, keep: boolean) => {
      total += chunk.length;
      if (total > cap) { stop('NATIVE_OUTPUT_LIMIT'); return; }
      if (keep) output.push(chunk);
      // stderr is drained but never retained or exposed: it can contain prompts/URLs.
    };
    child.stdout.on('data', chunk => consume(chunk, true));
    child.stderr.on('data', chunk => consume(chunk, false));
    child.stdin.on('error', () => stop('NATIVE_INPUT'));
    child.once('error', () => { error ||= 'NATIVE_START'; });
    child.once('close', code => {
      clearTimeout(timer); options.signal.removeEventListener('abort', abort);
      if (error || code !== 0) reject(new Error(error || 'NATIVE_FAILED'));
      else resolve(Buffer.concat(output).toString('utf8'));
    });
    child.stdin.end(options.input ?? '');
  });
}

export type Manifest = Readonly<Record<string, string>>;
export async function verifyArtifacts(root: string, manifest: Manifest): Promise<Map<string, string>> {
  const base = await realpath(root);
  const files = new Map<string, string>();
  if (!Object.keys(manifest).length) throw new Error('ARTIFACT_INVALID');
  // Unlisted DLLs can affect native loading too; reject additions, not only changes.
  async function inventory(directory: string): Promise<void> {
    for (const entry of await readdir(directory, {withFileTypes: true})) {
      const file = path.join(directory, entry.name);
      if ((await lstat(file)).isSymbolicLink()) throw new Error('ARTIFACT_INVALID');
      if (entry.isDirectory()) await inventory(file);
      else if (entry.isFile() && !Object.hasOwn(manifest, path.relative(base, file).split(path.sep).join('/'))) throw new Error('ARTIFACT_INVALID');
    }
  }
  await inventory(base);
  for (const [relative, expected] of Object.entries(manifest)) {
    if (!/^[a-f0-9]{64}$/i.test(expected) || path.isAbsolute(relative)) throw new Error('ARTIFACT_INVALID');
    const actualPath = await realpath(path.resolve(base, relative));
    const remaining = path.relative(base, actualPath);
    if (!remaining || remaining === '..' || remaining.startsWith('..' + path.sep) || path.isAbsolute(remaining)) throw new Error('ARTIFACT_INVALID');
    const bytes = await readFile(actualPath);
    if (createHash('sha256').update(bytes).digest('hex') !== expected.toLowerCase()) throw new Error('ARTIFACT_INVALID');
    files.set(relative, actualPath);
  }
  return files;
}
