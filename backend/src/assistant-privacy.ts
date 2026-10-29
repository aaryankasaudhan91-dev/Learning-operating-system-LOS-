import type {Express, Request, Response, NextFunction} from 'express';
import mongoose, {Schema} from 'mongoose';
import {ApiError, body, check} from './security';
import {ASSISTANT_PRIVACY_NOTICE, type AssistantConsent} from '../../packages/learning-ui/src/services/assistant.types';

const schema=new Schema({uid:{type:String,required:true,unique:true},revision:{type:Number,required:true,min:1},
  noticeVersion:{type:String,required:true},cloudConsent:{type:Boolean,required:true,validate:(value:boolean)=>value===false},
  webConsent:{type:Boolean,required:true,validate:(value:boolean)=>value===false}}, {timestamps:true,strict:true});
export const AssistantConsentModel=mongoose.models.AssistantConsent || mongoose.model('AssistantConsent',schema);
const defaults=():AssistantConsent=>({revision:0,noticeVersion:ASSISTANT_PRIVACY_NOTICE,cloudConsent:false,webConsent:false,
  updatedAt:null,features:{cloud:false,web:false}});
function publicRecord(value:any):AssistantConsent {
  return value ? {...defaults(),revision:value.revision,updatedAt:value.updatedAt?.toISOString() ?? null} : defaults();
}
function fields(input:Record<string,unknown>,names:string[]) {check(Object.keys(input).every(key=>names.includes(key)),400,'Unsupported privacy field')}
function revision(value:unknown):number {check(typeof value==='number' && Number.isSafeInteger(value) && value>=0,400,'Invalid privacy revision');return value}
/** Fail closed before quota reservation or provider I/O. Phase 4 must replace this
 * gate with current-notice consent AND trusted audience/provider eligibility. */
export function assertAssistantCloudAllowed():void {
  throw new ApiError(403,'Cloud AI is paused while consent and provider eligibility controls are being completed. Lessons and progress remain available.');
}
export function setupAssistantPrivacyRoutes(app:Express) {
  const wrap=(work:(req:Request,res:Response)=>Promise<void>)=>(req:Request,res:Response,next:NextFunction)=>{void work(req,res).catch(next)};
  app.get('/api/assistant/privacy',wrap(async(_req,res)=>{
    res.json(publicRecord(await AssistantConsentModel.findOne({uid:res.locals.identity.uid}).lean()));
  }));
  app.put('/api/assistant/privacy',wrap(async(req,res)=>{
    const input=body(req.body);fields(input,['revision','noticeVersion','cloudConsent','webConsent']);
    const expected=revision(input.revision);
    check(input.noticeVersion===ASSISTANT_PRIVACY_NOTICE,409,'The privacy notice changed. Refresh before saving.');
    check(input.cloudConsent===false && input.webConsent===false,409,'Cloud AI and public web reading are unavailable. Consent cannot be granted yet.');
    const uid=res.locals.identity.uid;
    const updates={noticeVersion:ASSISTANT_PRIVACY_NOTICE,cloudConsent:false,webConsent:false};
    let value:any;
    if(expected===0){
      try{value=await AssistantConsentModel.create({uid,...updates,revision:1})}
      catch(error){if((error as any).code===11000)throw new ApiError(409,'Privacy choices changed. Refresh before saving.');throw error}
    }else{
      value=await AssistantConsentModel.findOneAndUpdate({uid,revision:expected},{$set:updates,$inc:{revision:1}},{returnDocument:'after',runValidators:true});
      check(value,409,'Privacy choices changed. Refresh before saving.');
    }
    res.json(publicRecord(value));
  }));
  app.delete('/api/assistant/privacy',wrap(async(req,res)=>{
    const input=body(req.body);fields(input,['revision']);const expected=revision(input.revision);
    check(expected>0,409,'No saved privacy choices to remove.');
    const result=await AssistantConsentModel.deleteOne({uid:res.locals.identity.uid,revision:expected});
    check(result.deletedCount===1,409,'Privacy choices changed. Refresh before removing.');
    res.json(defaults());
  }));
}
