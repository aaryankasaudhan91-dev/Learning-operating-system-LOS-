import {setupWebsite} from './website';
import dotenv from 'dotenv';
import { createServer } from 'node:http';
import express from 'express';
import path from 'node:path';
import mongoose from 'mongoose';
import { createApp } from './app';
import { attachRealtime } from './realtime';
dotenv.config();
export * from './models';
async function start(){
 const http=createServer();let io:ReturnType<typeof attachRealtime>;const app=createApp({beforeRoutes:application=>{io=attachRealtime(application,http)}});http.on('request',app);
 if(process.env.MONGODB_URI){try{await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:5000});console.log('Database connected')}catch{console.error('Database connection unavailable; API will return 503')}}
 else console.error('MONGODB_URI is not configured; API will return 503');
 if(process.env.NODE_ENV==='production')setupWebsite(app,path.resolve(process.env.WEB_PORTAL_DIR || '../frontends/website/dist'));
 const port=Number(process.env.PORT || 3000);http.listen(port,'0.0.0.0',()=>console.log(`Synapse API listening on ${port}`));
 const shutdown=()=>{io.close();http.close(()=>{void mongoose.disconnect().finally(()=>process.exit(0))})};process.once('SIGTERM',shutdown);process.once('SIGINT',shutdown);
}
void start().catch(()=>{console.error('Server startup failed');process.exitCode=1});
