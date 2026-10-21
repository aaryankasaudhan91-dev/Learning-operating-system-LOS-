import { build } from 'esbuild';
import { mkdir, cp, writeFile, readFile } from 'node:fs/promises';
await mkdir('desktop-app',{recursive:true});
await build({entryPoints:['desktop/main.ts'],bundle:true,platform:'node',format:'cjs',external:['electron'],outfile:'desktop-app/main.cjs'});
await cp('frontends/desktop/dist','desktop-app/frontend-dist',{recursive:true});
await cp('desktop/icon.png','desktop-app/icon.png');
await writeFile('desktop-app/package.json',JSON.stringify({name:'synapse-desktop',version:JSON.parse(await readFile('package.json','utf8')).version,description:'Synapse learning workspace',main:'main.cjs',private:true,dependencies:{}}));
