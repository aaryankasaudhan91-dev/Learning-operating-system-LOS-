import {defineConfig,loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import path from 'node:path';
export default defineConfig(({mode})=>{const env=loadEnv(mode,path.resolve(__dirname,'../../packages/learning-ui'),'');return{plugins:[react(),tailwind()],base:'./',resolve:{dedupe:['react','react-dom']},envDir:path.resolve(__dirname,'../../packages/learning-ui'),publicDir:path.resolve(__dirname,'../../packages/learning-ui/public'),optimizeDeps:{entries:['index.html']},server:{proxy:{'/api':{target:env.VITE_BACKEND_URL||'http://localhost:3000',changeOrigin:true},'/health':{target:env.VITE_BACKEND_URL||'http://localhost:3000',changeOrigin:true},'/socket.io':{target:env.VITE_BACKEND_URL||'http://localhost:3000',ws:true,changeOrigin:true}}},build:{outDir:'dist',emptyOutDir:true}}});
