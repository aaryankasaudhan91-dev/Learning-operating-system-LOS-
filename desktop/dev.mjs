import {stageNative} from './stage-native.mjs';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {build} from 'esbuild';
import {createRequire} from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const url = 'http://127.0.0.1:5173/';
let ready = false;
for (let attempt = 0; attempt < 60; attempt++) {
  try {
    const response = await fetch(url, {signal: AbortSignal.timeout(1000)});
    if (response.ok) {ready = true; break}
  } catch {}
  await new Promise(resolve => setTimeout(resolve, 500));
}
if (!ready) throw new Error('App preview did not start on port 5173. Free that port and retry.');
await build({entryPoints: [path.join(root, 'desktop/main.ts')], bundle: true, platform: 'node', format: 'cjs', external: ['electron'], outfile: path.join(root, 'desktop-app/main.cjs')});
await stageNative();
await build({entryPoints: [path.join(root, 'desktop/preload.ts')], bundle: true, platform: 'node', format: 'cjs', external: ['electron'], outfile: path.join(root, 'desktop-app/preload.cjs')});
const child = spawn(require('electron'), [root], {cwd: root, env: {...process.env, SYNAPSE_DEV_SERVER_URL: url}, stdio: 'inherit'});
child.on('error', () => {console.error('Electron could not start'); process.exitCode = 1});
child.on('exit', code => {process.exitCode = code || 0});
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => child.kill());
