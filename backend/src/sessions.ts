import {randomBytes,createHash,createCipheriv,createDecipheriv} from 'node:crypto';
import mongoose from 'mongoose';
import {getAuth} from 'firebase-admin/auth';
import {getApps,initializeApp,applicationDefault} from 'firebase-admin/app';
import {ApiError,check} from './security';
const schema=new mongoose.Schema({digest:{type:String,unique:true,required:true},uid:{type:String,required:true,index:true},sealed:{type:String,required:true},expiresAt:{type:Date,required:true}},{timestamps:true});schema.index({expiresAt:1},{expireAfterSeconds:0});export const Session=mongoose.models.AuthSession||mongoose.model('AuthSession',schema);
export const adminAuth=()=>getAuth(getApps()[0]||initializeApp({credential:applicationDefault(),projectId:process.env.FIREBASE_PROJECT_ID}));
const digest=(token:string)=>createHash('sha256').update(token).digest('hex');
function key(){const value=Buffer.from(process.env.AUTH_SESSION_ENCRYPTION_KEY||'','base64');check(value.length===32,503,'Authentication is not configured.');return value}
export function seal(value:string){const iv=randomBytes(12);const cipher=createCipheriv('aes-256-gcm',key(),iv);return Buffer.concat([iv,cipher.update(value,'utf8'),cipher.final(),cipher.getAuthTag()]).toString('base64')}
function open(value:string){const bytes=Buffer.from(value,'base64');const decipher=createDecipheriv('aes-256-gcm',key(),bytes.subarray(0,12));decipher.setAuthTag(bytes.subarray(-16));return Buffer.concat([decipher.update(bytes.subarray(12,-16)),decipher.final()]).toString('utf8')}
export async function saveSession(cookie:string,uid:string,expiresAt:Date){const token='syn_'+randomBytes(32).toString('base64url');await Session.create({digest:digest(token),uid,sealed:seal(cookie),expiresAt});return token}
export async function verifySession(token:string,verify=(value:string)=>adminAuth().verifySessionCookie(value,true)){check(/^syn_[A-Za-z0-9_-]{43}$/.test(token),401,'Sign in required');const record=await Session.findOne({digest:digest(token),expiresAt:{$gt:new Date()}});check(record,401,'Session expired');const identity=await verify(open(record.sealed));check(identity.uid===record.uid,401,'Invalid session');return identity}
export async function removeSession(token:string){if(/^syn_[A-Za-z0-9_-]{43}$/.test(token))await Session.deleteOne({digest:digest(token)})}
export async function issueSession(idToken:string){const expiresIn=7*86400000;const identity=await adminAuth().verifyIdToken(idToken,true);const cookie=await adminAuth().createSessionCookie(idToken,{expiresIn});const token=await saveSession(cookie,identity.uid,new Date(Date.now()+expiresIn));return{token,expiresAt:Date.now()+expiresIn,user:{uid:identity.uid,email:identity.email||'',displayName:identity.name||''}}}
