/** Isolated browser fixture: no external account, database or provider. */
import React from 'react';
import {createRoot} from 'react-dom/client';
import {auth} from '../../packages/learning-ui/src/lib/firebase';
import {apiFetch} from '../../packages/learning-ui/src/services/http';
import {clearAssistantContent,useAssistantPrivacy} from '../../packages/learning-ui/src/services/assistant-privacy.service';
import {CLOUD_AI_NOTICE,CLOUD_AI_MODELS} from '../../packages/learning-ui/src/services/assistant.types';
import AssistantPrivacySettings from '../../packages/learning-ui/src/components/AssistantPrivacySettings';
import AssistantCloud from '../../packages/learning-ui/src/components/AssistantCloud';
declare global {interface Window {cloudUploads:any[];cloudFixtureClear:()=>Promise<void>;cloudFixtureLegacy:()=>Promise<void>;cloudFixtureAuthRace:()=>Promise<boolean>}}
auth.currentUser={uid:'cloud-ui-alice',email:'fixture@example.test',getIdToken:async()=>'fixture-session'};
let revision=0,granted=false,legacy=false;
const record=()=>({revision,noticeVersion:CLOUD_AI_NOTICE,cloudConsent:granted,webConsent:false,grantToken:granted?'11111111-1111-4111-8111-111111111111':undefined,updatedAt:null,features:{cloud:granted,web:false},...(!legacy?{cloud:{available:true,eligible:true,provider:'groq',models:CLOUD_AI_MODELS,noticeVersion:CLOUD_AI_NOTICE,reason:'READY'}}:{})});
window.cloudUploads=[];window.cloudFixtureClear=clearAssistantContent;
window.cloudFixtureLegacy=async()=>{legacy=true;granted=true;await clearAssistantContent()};
window.cloudFixtureAuthRace=async()=>{
  const previous=auth.currentUser;
  auth.currentUser={uid:'cloud-ui-alice',email:null,getIdToken:async()=>{auth.currentUser={uid:'cloud-ui-bob',email:null,getIdToken:async()=>'other-session'};return 'fixture-session'}};
  try{await apiFetch('/api/assistant/cloud/explain',{method:'POST',body:'must-not-upload'});return false}
  catch(error){return (error as Error).message==='The active account changed.'}finally{auth.currentUser=previous}
};
window.fetch=async(input,init)=>{
  const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
  if(!url.startsWith('https://fixture.invalid/api/'))throw new Error('Unexpected fixture network request');
  if(new Headers(init?.headers).get('Authorization')!=='Bearer fixture-session')throw new Error('Missing fixture identity');
  if(url.endsWith('/api/assistant/privacy')){
    if(init?.method==='PUT'){const data=JSON.parse(String(init.body));granted=data.cloudConsent;revision++}
    if(init?.method==='DELETE'){granted=false;revision=0}
    return new Response(JSON.stringify(record()),{headers:{'Content-Type':'application/json'}});
  }
  if(url.endsWith('/api/assistant/cloud/explain')){
    if(!granted)throw new Error('Fixture upload before consent');
    window.cloudUploads.push(JSON.parse(String(init?.body)));
    return new Response(JSON.stringify({text:'Cloud <img src=x onerror=alert(1)> answer',provider:'groq',model:CLOUD_AI_MODELS.fast}),{headers:{'Content-Type':'application/json'}});
  }
  throw new Error('Unknown fixture endpoint');
};
function Fixture(){const privacy=useAssistantPrivacy();return <><AssistantPrivacySettings account="cloud-ui-alice"/><AssistantCloud account="cloud-ui-alice" owner={'fixture-'+privacy.clearEpoch}/></>}
createRoot(document.getElementById('root')!).render(<Fixture/>);
