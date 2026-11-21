import type {Express, Request, Response, NextFunction} from 'express';
import mongoose, {Schema} from 'mongoose';
import {randomUUID} from 'node:crypto';
import {cloudAvailability} from './cloud/policy';
import {ApiError, body, check} from './security';
import {ASSISTANT_PRIVACY_NOTICE,CLOUD_AI_NOTICE, type AssistantConsent} from '../../packages/learning-ui/src/services/assistant.types';

const schema=new Schema({uid:{type:String,required:true,unique:true},revision:{type:Number,required:true,min:1},
  noticeVersion:{type:String,required:true},cloudConsent:{type:Boolean,required:true},
  webConsent:{type:Boolean,required:true,validate:(value:boolean)=>value===false},grantToken:String}, {timestamps:true,strict:true});
export const AssistantConsentModel=mongoose.models.AssistantConsent || mongoose.model('AssistantConsent',schema);
const defaults=():AssistantConsent=>({revision:0,noticeVersion:ASSISTANT_PRIVACY_NOTICE,cloudConsent:false,webConsent:false,
  updatedAt:null,features:{cloud:false,web:false}});
export async function assistantConsent(uid:string):Promise<AssistantConsent> {
  await AssistantConsentModel.init();
  const value:any=await AssistantConsentModel.findOne({uid}).lean(),cloud=await cloudAvailability(uid);
  const granted=value?.cloudConsent===true && value.noticeVersion===CLOUD_AI_NOTICE && typeof value.grantToken==='string';
  return {...defaults(),revision:value?.revision??0,noticeVersion:CLOUD_AI_NOTICE,cloudConsent:granted,
    updatedAt:value?.updatedAt?.toISOString()??null,cloud,features:{cloud:cloud.available&&cloud.eligible&&granted,web:false},...(granted?{grantToken:value.grantToken}:{})};
}
export async function assertCloudGrant(uid:string,revision:number,grantToken:string) {
  const state=await assistantConsent(uid);
  check(state.features.cloud && state.revision===revision && state.grantToken===grantToken,403,'Cloud AI needs current consent and operator-approved eligibility.');
  return state;
}
function fields(input:Record<string,unknown>,names:string[]) {check(Object.keys(input).every(key=>names.includes(key)),400,'Unsupported privacy field')}
function revision(value:unknown):number {check(typeof value==='number' && Number.isSafeInteger(value) && value>=0,400,'Invalid privacy revision');return value}
/** Legacy automatic endpoints never inherit consent for manual questions. */
export function assertAssistantCloudAllowed():void {
  throw new ApiError(403,'Automatic cloud features remain disabled. Use a separately reviewed question in the desktop assistant.');
}
export function setupAssistantPrivacyRoutes(app:Express) {
  const wrap=(work:(req:Request,res:Response)=>Promise<void>)=>(req:Request,res:Response,next:NextFunction)=>{void work(req,res).catch(next)};
  app.get('/api/assistant/privacy',wrap(async(_req,res)=>{
    res.json(await assistantConsent(res.locals.identity.uid));
  }));
  app.put('/api/assistant/privacy',wrap(async(req,res)=>{
    const input=body(req.body);fields(input,['revision','noticeVersion','cloudConsent','webConsent']);
    const expected=revision(input.revision);
    check(input.noticeVersion===CLOUD_AI_NOTICE || (input.noticeVersion===ASSISTANT_PRIVACY_NOTICE && input.cloudConsent===false),409,'The privacy notice changed. Refresh before saving.');
    check(typeof input.cloudConsent==='boolean' && input.webConsent===false,409,'Server-side web access is unavailable.');
    if(input.cloudConsent===true){
      check(input.noticeVersion===CLOUD_AI_NOTICE,409,'Review the current cloud notice first.');
      const available=await cloudAvailability(res.locals.identity.uid);
      check(available.available && available.eligible,409,'Cloud access is not available for this account or deployment.');
    }
    const uid=res.locals.identity.uid;
    const updates={noticeVersion:input.noticeVersion,cloudConsent:input.cloudConsent,webConsent:false,grantToken:input.cloudConsent?randomUUID():null};
    let value:any;
    if(expected===0){
      try{value=await AssistantConsentModel.create({uid,...updates,revision:1})}
      catch(error){if((error as any).code===11000)throw new ApiError(409,'Privacy choices changed. Refresh before saving.');throw error}
    }else{
      value=await AssistantConsentModel.findOneAndUpdate({uid,revision:expected},{$set:updates,$inc:{revision:1}},{returnDocument:'after',runValidators:true});
      check(value,409,'Privacy choices changed. Refresh before saving.');
    }
    res.json(await assistantConsent(uid));
  }));
  app.delete('/api/assistant/privacy',wrap(async(req,res)=>{
    const input=body(req.body);fields(input,['revision']);const expected=revision(input.revision);
    check(expected>0,409,'No saved privacy choices to remove.');
    const result=await AssistantConsentModel.deleteOne({uid:res.locals.identity.uid,revision:expected});
    check(result.deletedCount===1,409,'Privacy choices changed. Refresh before removing.');
    res.json(await assistantConsent(res.locals.identity.uid));
  }));
}
