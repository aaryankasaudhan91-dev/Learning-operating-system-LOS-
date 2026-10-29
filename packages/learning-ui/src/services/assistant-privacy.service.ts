import {useSyncExternalStore} from 'react';
import {desktopAssistant, assistantValue} from './assistant.service';
import type {AssistantContext, AssistantChange, AssistantConsent} from './assistant.types';
import {ASSISTANT_PRIVACY_NOTICE} from './assistant.types';
import {apiFetch} from './http';
import {auth} from '../lib/firebase';

interface Snapshot {context:AssistantContext|null; account:string|null; binding:boolean; clearEpoch:number; error:string}
const initial:Snapshot={context:null,account:null,binding:true,clearEpoch:0,error:''};
let state=initial, version=0, requested:string|null|undefined, pending:Promise<void>|undefined;
const listeners=new Set<()=>void>();
let listening=false;
function publish(change:Partial<Snapshot>) {state={...state,...change};for(const notify of listeners)notify()}
export const assistantPrivacySnapshot=()=>state;
export const subscribeAssistantPrivacy=(notify:()=>void)=>{listeners.add(notify);return()=>{listeners.delete(notify)}};
export function useAssistantPrivacy() {return useSyncExternalStore(subscribeAssistantPrivacy,assistantPrivacySnapshot,()=>initial)}
function listen() {
  if(listening || !desktopAssistant())return;
  listening=true;
  desktopAssistant()!.onChanged((change:AssistantChange)=>{
    const context=change.context;
    // Ignore a different account's late event. A forget/bind response installs its new token.
    publish({clearEpoch:state.clearEpoch+1,...(!state.binding && (!context || context.token===state.context?.token)?{context}:{} )});
  });
}
export function bindAssistantAccount(account?:string):Promise<void> {
  const bridge=desktopAssistant();if(!bridge)return Promise.resolve();
  const key=account??null;
  if(requested===key && pending)return pending;
  listen();requested=key;const current=++version;
  publish({account:key,context:null,binding:true,clearEpoch:state.clearEpoch+1,error:''});
  pending=bridge.bindAccount(key).then(result=>{
    if(current===version)publish({context:assistantValue(result),binding:false});
  }).catch(()=>{if(current===version)publish({context:null,binding:false,error:'Privacy choices could not load. Local commands are paused.'})});
  return pending;
}
export async function saveLocalAssistantPreference(enabled:boolean) {
  const context=state.context, current=version;
  if(!context || state.binding)throw new Error('Privacy choices are still loading.');
  const value=assistantValue(await desktopAssistant()!.preferences(context.token,context.preferences.revision,enabled));
  if(current!==version)throw new Error('The active account changed.');
  publish({context:value,error:''});return value;
}
export async function forgetLocalAssistantPreferences() {
  const context=state.context, current=version;
  if(!context || state.binding)throw new Error('Privacy choices are still loading.');
  const value=assistantValue(await desktopAssistant()!.forgetPreferences(context.token));
  if(current!==version)throw new Error('The active account changed.');
  publish({context:value,clearEpoch:state.clearEpoch+1,error:''});return value;
}
export async function clearAssistantContent() {
  publish({clearEpoch:state.clearEpoch+1});
  const bridge=desktopAssistant();if(bridge)assistantValue(await bridge.reset());
}
async function consentRequest(account:string,method='GET',body?:unknown):Promise<AssistantConsent> {
  if(auth.currentUser?.uid!==account)throw new Error('The active account changed.');
  const response=await apiFetch('/api/assistant/privacy',{method,...(body===undefined?{}:{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})});
  if(auth.currentUser?.uid!==account)throw new Error('The active account changed.');
  const result=await response.json();
  if(auth.currentUser?.uid!==account)throw new Error('The active account changed.');
  if(!response.ok)throw new Error(result.error || 'Privacy choices could not be saved.');
  return result;
}
export const assistantConsent={
  read:(account:string)=>consentRequest(account),
  saveOff:(account:string,revision:number)=>consentRequest(account,'PUT',{revision,noticeVersion:ASSISTANT_PRIVACY_NOTICE,cloudConsent:false,webConsent:false}),
  remove:(account:string,revision:number)=>consentRequest(account,'DELETE',{revision})
};
