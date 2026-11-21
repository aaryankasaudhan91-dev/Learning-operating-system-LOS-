/** Shared data only: safe in React, mobile, and Electron. */
export type AssistantView = 'map' | 'courses' | 'chamber' | 'profile' | 'settings' | 'help';
export type AssistantAction =
  | {name: 'open_view'; arguments: {view: AssistantView}}
  | {name: 'prepare_focus'; arguments: {topic: string; minutes: number}};
export type AssistantProposal = {kind: 'proposal'; action: AssistantAction; confidence: number | null}
  | {kind: 'unsupported'};
export type AssistantReply<T> = {ok: true; value: T} | {ok: false; code: string};
export interface AssistantStatus {
  local: 'ready' | 'missing' | 'invalid' | 'unsupported-platform' | 'checking';
  web: 'disabled' | 'ready' | 'unavailable'; cloud: 'disabled';
}
export interface AssistantWebPage {
  requestedUrl:string; finalUrl:string; status:number; text:string; truncated:boolean;
  fetchedAt:string; mode:'offline-document'; untrusted:true;
}
export interface FocusDraft {id: string; topic: string; minutes: number}
export const ASSISTANT_PRIVACY_NOTICE = '2026-10-29.v1';
export const CLOUD_AI_NOTICE='2026-10-29.groq-zdr.v1';
export const CLOUD_AI_MODELS={fast:'openai/gpt-oss-20b',deep:'openai/gpt-oss-120b'} as const;
export type CloudTask='explain'|'hint'|'deep-explain';
export interface CloudAvailability {available:boolean;eligible:boolean;provider:'groq';models:typeof CLOUD_AI_MODELS;noticeVersion:string;reason:string}
export interface CloudAnswer {text:string;provider:'groq';model:string}
export interface AssistantPreferences {localCommandsEnabled: boolean; revision: number; noticeVersion: string}
export interface AssistantContext {token: string; preferences: AssistantPreferences; storage: 'ready' | 'unavailable'}
export interface AssistantChange {context: AssistantContext | null; clearContent: true; invalidatedToken?:string|null}
export interface AssistantConsent {
  revision: number; noticeVersion: string; cloudConsent: boolean; webConsent: false;
  updatedAt: string | null; features: {cloud: boolean; web: false}; cloud?:CloudAvailability;grantToken?:string;
}
export interface AssistantBridge {
  status(): Promise<AssistantReply<AssistantStatus>>;
  bindAccount(account: string | null): Promise<AssistantReply<AssistantContext>>;
  propose(text: string, id: string, context: string): Promise<AssistantReply<AssistantProposal>>;
  readPage(url:string,id:string,context:string):Promise<AssistantReply<AssistantWebPage>>;
  preferences(context: string, revision: number, localCommandsEnabled: boolean): Promise<AssistantReply<AssistantContext>>;
  forgetPreferences(context: string): Promise<AssistantReply<AssistantContext>>;
  cancel(id: string): Promise<AssistantReply<null>>;
  reset(): Promise<AssistantReply<null>>;
  onChanged(callback: (change: AssistantChange) => void): () => void;
}
declare global {interface Window {losAssistant?: AssistantBridge}}
