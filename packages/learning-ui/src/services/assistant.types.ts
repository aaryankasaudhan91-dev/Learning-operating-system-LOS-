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
  web: 'disabled'; cloud: 'disabled';
}
export interface FocusDraft {id: string; topic: string; minutes: number}
export const ASSISTANT_PRIVACY_NOTICE = '2026-10-29.v1';
export interface AssistantPreferences {localCommandsEnabled: boolean; revision: number; noticeVersion: string}
export interface AssistantContext {token: string; preferences: AssistantPreferences; storage: 'ready' | 'unavailable'}
export interface AssistantChange {context: AssistantContext | null; clearContent: true}
export interface AssistantConsent {
  revision: number; noticeVersion: string; cloudConsent: false; webConsent: false;
  updatedAt: string | null; features: {cloud: false; web: false};
}
export interface AssistantBridge {
  status(): Promise<AssistantReply<AssistantStatus>>;
  bindAccount(account: string | null): Promise<AssistantReply<AssistantContext>>;
  propose(text: string, id: string, context: string): Promise<AssistantReply<AssistantProposal>>;
  preferences(context: string, revision: number, localCommandsEnabled: boolean): Promise<AssistantReply<AssistantContext>>;
  forgetPreferences(context: string): Promise<AssistantReply<AssistantContext>>;
  cancel(id: string): Promise<AssistantReply<null>>;
  reset(): Promise<AssistantReply<null>>;
  onChanged(callback: (change: AssistantChange) => void): () => void;
}
declare global {interface Window {losAssistant?: AssistantBridge}}
