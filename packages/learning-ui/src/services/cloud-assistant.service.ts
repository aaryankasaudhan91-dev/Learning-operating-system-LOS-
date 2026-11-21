import {auth} from '../lib/firebase';
import {apiFetch} from './http';
import {assistantConsent} from './assistant-privacy.service';
import {CLOUD_AI_NOTICE,type CloudTask,type CloudAnswer} from './assistant.types';
export async function sendCloudQuestion(account:string,task:CloudTask,prompt:string,context:string,signal:AbortSignal):Promise<CloudAnswer> {
  const own=()=>{if(auth.currentUser?.uid!==account || signal.aborted)throw new Error('The account or request changed.');};
  own();const consent=await assistantConsent.read(account);own();
  if(consent.noticeVersion!==CLOUD_AI_NOTICE || typeof consent.grantToken!=='string' || !consent.cloud?.available || !consent.cloud.eligible || !consent.features.cloud || !consent.cloudConsent)throw new Error('Review cloud privacy choices in Settings before sending.');
  const response=await apiFetch('/api/assistant/cloud/explain',{method:'POST',signal,headers:{'Content-Type':'application/json'},
    body:JSON.stringify({requestId:crypto.randomUUID(),noticeVersion:CLOUD_AI_NOTICE,consentRevision:consent.revision,grantToken:consent.grantToken,task,prompt,context})});
  own();const result=await response.json();own();
  if(!response.ok)throw new Error(response.status===429?'The cloud allowance is busy or exhausted. Try later.':result.error||'Cloud response unavailable.');
  if(result.provider!=='groq' || typeof result.text!=='string' || result.text.length>12000)throw new Error('Cloud response was invalid.');
  return result;
}
