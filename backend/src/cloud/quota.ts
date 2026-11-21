import {createHash} from 'node:crypto';
import mongoose,{Schema} from 'mongoose';
import {ApiError,check} from '../security';
import type {cloudConfiguration} from './policy';
type Config=ReturnType<typeof cloudConfiguration>;
interface State {
  day:string; requests:number; tokens:number; users:Record<string,number>;
  events:{at:number;tokens:number;user:string}[];
  attempts:Record<string,number>;active:Record<string,number>;cooldownUntil:number;
}
const budgetSchema=new Schema({
  _id:String,revision:{type:Number,required:true},state:{type:Schema.Types.Mixed,required:true}
},{timestamps:true,strict:true,minimize:false});
budgetSchema.index({updatedAt:1},{expireAfterSeconds:3*86400});
export const CloudBudget=mongoose.models.CloudBudget || mongoose.model('CloudBudget',budgetSchema);
const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
const key=(config:Config)=>'groq:'+hash(config.scope);
const initial=(now:number):State=>({day:new Date(now).toISOString().slice(0,10),requests:0,tokens:0,users:{},events:[],attempts:{},active:{},cooldownUntil:0});
/** One organization document and revision CAS cover every dimension atomically.
 * Works on standalone MongoDB too; no in-memory counters or transaction fallback. */
async function change<T>(config:Config,work:(state:State,now:number)=>T):Promise<T> {
  const id=key(config);
  for(let retry=0;retry<32;retry++) {
    const [document]:any[]=await CloudBudget.aggregate([{$match:{_id:id}},{$addFields:{serverNow:{$toLong:'$$NOW'}}}]);
    const now=document?.serverNow??Date.now();
    if(!document) {
      try{await CloudBudget.create({_id:id,revision:0,state:initial(now)})}catch(error){if((error as any).code!==11000)throw error}
      continue;
    }
    const state:State=structuredClone(document.state);
    check(Number.isSafeInteger(document.revision)&&state && typeof state.day==='string' &&
      Number.isSafeInteger(state.requests)&&Number.isSafeInteger(state.tokens)&&Array.isArray(state.events)&&
      state.users&&state.attempts&&state.active&&Number.isFinite(state.cooldownUntil),503,'Cloud quota storage needs repair.');
    check(state.requests>=0 && state.tokens>=0 && state.events.every(e=>Number.isSafeInteger(e.at)&&Number.isSafeInteger(e.tokens)&&e.tokens>=0&&typeof e.user==='string') &&
      Object.values(state.users).every(n=>Number.isSafeInteger(n)&&n>=0) &&
      Object.values(state.attempts).every(Number.isSafeInteger) && Object.values(state.active).every(Number.isSafeInteger),503,'Cloud quota storage needs repair.');
    if(state.day!==new Date(now).toISOString().slice(0,10)) {
      state.day=new Date(now).toISOString().slice(0,10);state.requests=0;state.tokens=0;state.users={};
    }
    state.events=state.events.filter(e=>e.at>now-60000);
    state.attempts=Object.fromEntries(Object.entries(state.attempts).filter(([,at])=>at>now-48*3600000));
    state.active=Object.fromEntries(Object.entries(state.active).filter(([,until])=>until>now));
    const value=work(state,now);
    const updated=await CloudBudget.updateOne({_id:id,revision:document.revision},{$set:{state},$inc:{revision:1}});
    if(updated.modifiedCount===1)return value;
  }
  throw new ApiError(429,'Cloud requests are busy. Please wait before trying again.');
}
export async function reserveCloud(config:Config,uid:string,requestId:string,tokens:number) {
  const attempt=hash(JSON.stringify({uid,requestId})),user=hash(uid);
  await change(config,(state,now)=>{
    check(!state.attempts[attempt],409,'This cloud request was already submitted. Create a new request to try again.');
    check(state.cooldownUntil<=now,429,'The provider is cooling down. Please try later.');
    check(Object.keys(state.active).length<config.parallel,429,'Cloud requests are busy. Try later.');
    check((state.users[user]??0)<config.userDaily,429,'Your daily cloud allowance is exhausted.');
    check(state.requests<config.rpd && state.tokens+tokens<=config.tpd &&
      state.events.length<config.rpm && state.events.reduce((sum,e)=>sum+e.tokens,0)+tokens<=config.tpm,
      429,'The shared cloud allowance is exhausted. Local commands remain available.');
    check(state.events.filter(e=>e.user===user).length<3,429,'Please wait before sending another cloud request.');
    state.requests++;state.tokens+=tokens;state.users[user]=(state.users[user]??0)+1;
    state.events.push({at:now,tokens,user});state.attempts[attempt]=now;state.active[attempt]=now+60000;
  });
  return async(cooldownSeconds=0)=>change(config,(state,now)=>{
    delete state.active[attempt];
    state.cooldownUntil=Math.max(state.cooldownUntil,now+Math.min(3600,Math.max(0,cooldownSeconds))*1000);
  });
}
