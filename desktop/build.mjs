import { build } from 'esbuild';
await build({entryPoints:['desktop/main.ts'],bundle:true,platform:'node',format:'cjs',external:['electron'],outfile:'desktop-dist/main.cjs'});
