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
export interface AssistantBridge {
  status(): Promise<AssistantReply<AssistantStatus>>;
  propose(text: string, id: string): Promise<AssistantReply<AssistantProposal>>;
  cancel(id: string): Promise<AssistantReply<null>>;
  reset(): Promise<AssistantReply<null>>;
}
declare global {interface Window {losAssistant?: AssistantBridge}}
