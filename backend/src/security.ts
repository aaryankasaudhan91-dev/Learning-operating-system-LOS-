import {verifySession} from './sessions';
import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { Request, Response, NextFunction } from 'express';
export interface Identity { uid:string; email?:string; email_verified?:boolean }
export type VerifyIdentity=(token:string)=>Promise<Identity>;
export async function verifyIdentity(token:string):Promise<Identity>{
 if(token.startsWith('syn_'))return verifySession(token);
 const app=getApps()[0] || initializeApp({credential:applicationDefault(),projectId:process.env.FIREBASE_PROJECT_ID});
 return getAuth(app).verifyIdToken(token,true);
}
export class ApiError extends Error {constructor(public status:number,message:string){super(message)}}
export function check(condition:unknown,status:number,message:string):asserts condition{if(!condition)throw new ApiError(status,message)}
export function body(value:unknown):Record<string,any>{check(value && typeof value==='object' && !Array.isArray(value),400,'JSON object required');const inspect=(v:any):void=>{if(v && typeof v==='object')for(const [key,item] of Object.entries(v)){check(!key.startsWith('$') && !key.includes('.') && !['__proto__','constructor','prototype'].includes(key),400,'Invalid input key');inspect(item)}};inspect(value);return value as Record<string,any>}
export function text(value:unknown,name:string,max=200,required=true){if(!required && value===undefined)return undefined;check(typeof value==='string' && (!required || value.trim().length>0) && value.length<=max,400,`${name} is invalid`);return value.trim()}
export function fields(value:Record<string,any>,allowed:string[]){const result:Record<string,any>={};for(const key of allowed)if(value[key]!==undefined)result[key]=value[key];return result}
export function ids(value:unknown){check(Array.isArray(value) && value.length>0 && value.length<=100 && value.every(v=>typeof v==='string' && v.length<=200),400,'Provide 1–100 IDs');return [...new Set(value)] as string[]}
export function limitedNumber(value:unknown,min:number,max:number){check(typeof value==='number' && Number.isFinite(value) && value>=min && value<=max,400,'Number is out of range');return value}
export function authentication(verify:VerifyIdentity){return async(req:Request,res:Response,next:NextFunction)=>{try{const header=req.headers.authorization;check(header?.startsWith('Bearer '),401,'Sign in required');res.locals.identity=await verify(header!.slice(7));next()}catch{res.status(401).json({error:'Sign in required or session expired',code:'UNAUTHENTICATED'})}}}
export function rateLimit(limit:number,windowMs:number){const hits=new Map<string,{count:number,until:number}>();return(req:Request,res:Response,next:NextFunction)=>{const now=Date.now();if(hits.size>5000)for(const [key,value]of hits)if(value.until<now)hits.delete(key);const key=res.locals.identity?.uid || req.ip || 'unknown';if(hits.size>=5000&&!hits.has(key)){res.status(429).json({error:'Please try again later.'});return}let hit=hits.get(key);if(!hit || hit.until<now){hit={count:0,until:now+windowMs};hits.set(key,hit)}if(++hit.count>limit){res.setHeader('Retry-After',Math.ceil((hit.until-now)/1000));res.status(429).json({error:'Too many requests. Try again shortly.'});return}next()}}
