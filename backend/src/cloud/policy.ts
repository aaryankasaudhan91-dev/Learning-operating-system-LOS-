import mongoose,{Schema} from 'mongoose';
import {CLOUD_AI_NOTICE,CLOUD_AI_MODELS} from '../../../packages/learning-ui/src/services/assistant.types';
import {check} from '../security';

/** Operator-owned record. No HTTP route, profile field or client age assertion
 * can create eligibility. No date of birth or verification evidence is stored. */
export const CloudEligibility=mongoose.models.CloudEligibility || mongoose.model('CloudEligibility',new Schema({
  uid:{type:String,required:true,unique:true},adultVerified:{type:Boolean,required:true},
  regionApproved:{type:Boolean,required:true},expiresAt:{type:Date,required:true},
  policyVersion:{type:String,required:true}
},{timestamps:true,strict:true}));
function limit(name:string,fallback:number,max:number) {
  const raw=process.env[name];if(raw===undefined || raw==='')return fallback;
  check(/^\d+$/.test(raw),503,'Cloud quota configuration needs repair.');
  const value=Number(raw);check(Number.isSafeInteger(value)&&value>=1&&value<=max,503,'Cloud quota configuration needs repair.');return value;
}
export function cloudConfiguration() {
  const enabled=process.env.CLOUD_AI_ENABLED==='1' && process.env.GROQ_FREE_PLAN_CONFIRMED==='1' &&
    process.env.GROQ_ZDR_CONFIRMED==='1' && process.env.CLOUD_AI_POLICY_REVIEW===CLOUD_AI_NOTICE &&
    !!process.env.GROQ_API_KEY && /^[A-Za-z0-9_-]{3,100}$/.test(process.env.GROQ_QUOTA_SCOPE??'');
  return {enabled,scope:process.env.GROQ_QUOTA_SCOPE??'',models:CLOUD_AI_MODELS,
    // These conservative local caps are not a claim about account-specific limits.
    rpm:limit('CLOUD_AI_ORG_RPM',10,30),tpm:limit('CLOUD_AI_ORG_TPM',7000,8000),
    rpd:limit('CLOUD_AI_ORG_RPD',100,1000),tpd:limit('CLOUD_AI_ORG_TPD',100000,200000),
    userDaily:limit('CLOUD_AI_USER_RPD',10,100),parallel:limit('CLOUD_AI_PARALLEL',2,4)};
}
export async function cloudAvailability(uid:string) {
  const config=cloudConfiguration();
  const eligible=!!await CloudEligibility.exists({uid,adultVerified:true,regionApproved:true,
    policyVersion:CLOUD_AI_NOTICE,expiresAt:{$gt:new Date()}});
  return {available:config.enabled,eligible,provider:'groq' as const,models:CLOUD_AI_MODELS,
    noticeVersion:CLOUD_AI_NOTICE,reason:!config.enabled?'DEPLOYMENT_DISABLED':!eligible?'ELIGIBILITY_REQUIRED':'READY'};
}
