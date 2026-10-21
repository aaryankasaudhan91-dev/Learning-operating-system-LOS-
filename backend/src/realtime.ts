import type { Express } from 'express';
import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import mongoose from 'mongoose';
export type Resource = 'tasks' | 'courses' | 'users' | 'prompts';
type Identity = {uid:string;email?:string};
export async function verifyIdentity(token:string):Promise<Identity> {
 const app=getApps()[0] || initializeApp({credential:applicationDefault(),projectId:process.env.FIREBASE_PROJECT_ID});
 return getAuth(app).verifyIdToken(token);
}
export function attachRealtime(app:Express,http:HttpServer,verify=verifyIdentity) {
 const origins=(process.env.REALTIME_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,https://localhost,capacitor://localhost,null').split(',').map(value=>value.trim()).filter(Boolean);
 const io=new Server(http,{cors:{origin:origins},allowRequest:(req,cb)=>cb(null,!req.headers.origin || origins.includes(req.headers.origin)),maxHttpBufferSize:16384});
 io.use(async(socket,next)=>{try{
  const token=socket.handshake.auth.token;
  if(typeof token!=='string' || !token)throw new Error('Missing token');
  socket.data.identity=await verify(token);next();
 }catch{next(new Error('Sign in to enable live updates.'))}});
 io.on('connection',socket=>{const identity:Identity=socket.data.identity;socket.join(`user:${identity.uid}`);if(identity.email)socket.join(`user:${identity.email}`);socket.join('catalog');});
 // Successful API writes cause invalidation only; no learner records leave through sockets.
 app.use((req,res,next)=>{
  if(!['POST','PUT','PATCH','DELETE'].includes(req.method))return next();
  let resource:Resource|undefined;
  if(/^\/api\/(?:tasks|batch\/tasks)(?:\/|$)/.test(req.path))resource='tasks';
  else if(/^\/api\/(?:courses|batch\/(?:modules|lessons))(?:\/|$)/.test(req.path))resource='courses';
  else if(/^\/api\/users(?:\/|$)/.test(req.path))resource='users';
  else if(/^\/api\/prompts(?:\/|$)/.test(req.path))resource='prompts';
  const token=req.headers.authorization?.replace(/^Bearer /,'');
  if(resource && token)res.once('finish',()=>{void (async()=>{
   if(res.statusCode<200 || res.statusCode>=300)return;
   const actor=await verify(token);const event={resource,changedAt:Date.now()};
   if(resource==='courses'){io.to('catalog').emit('data:changed',event);return}
   const recipients=new Set([actor.uid]);
   if(resource==='users' && req.params.uid)recipients.add(String(req.params.uid));
   if(resource==='tasks'){
    const id=req.params.id || req.body?.id;
    const task=id && mongoose.models.Task?await mongoose.models.Task.findOne({id}).lean():req.body;
    for(const value of [task?.studentId,task?.assignedTo,task?.mentorId])if(typeof value==='string' && value!=='all')recipients.add(value);
   }
   // Broadcast prompts do not expose their contents. Their author is notified;
   // recipient-specific delivery can be added with verified relationship records.
   for(const uid of recipients)io.to(`user:${uid}`).emit('data:changed',event);
  })().catch(()=>{/* No valid identity: skip realtime; REST refresh remains available. */})});
  next();
 });
 return io;
}
