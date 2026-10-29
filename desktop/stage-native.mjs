import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {readdir, readFile, writeFile, mkdir, lstat} from 'node:fs/promises';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export async function stageNative() {
  const native = path.join(root, 'resources/native/win32-x64');
  await mkdir(native, {recursive: true});
  const manifest = {};
  async function visit(directory) {
    for (const entry of await readdir(directory, {withFileTypes: true})) {
      const file = path.join(directory, entry.name);
      if ((await lstat(file)).isSymbolicLink()) throw new Error('Native artifact links are not allowed');
      if (entry.isDirectory()) await visit(file);
      else if (entry.isFile()) manifest[path.relative(native, file).split(path.sep).join('/')] = createHash('sha256').update(await readFile(file)).digest('hex');
    }
  }
  for (const name of ['needle', 'licenses']) {
    try {await visit(path.join(native, name))} catch (error) {if (error.code !== 'ENOENT') throw error}
  }
  if (Object.keys(manifest).length && !['needle/los-needle.exe','needle/libneedle.dll','needle/needle3.cact','needle/tools.json'].every(file => manifest[file])) throw new Error('Incomplete local assistant artifacts. Run npm run assistant:setup.');
  await mkdir(path.join(root, 'desktop-app'), {recursive: true});
  await writeFile(path.join(root, 'desktop-app/native-manifest.json'), JSON.stringify(manifest, null, 2));
  return Object.keys(manifest).length;
}
