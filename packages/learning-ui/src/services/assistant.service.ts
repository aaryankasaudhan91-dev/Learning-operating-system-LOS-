import type {AssistantReply, AssistantStatus} from './assistant.types';
export const desktopAssistant = () => window.losAssistant;
export async function assistantStatus(): Promise<AssistantStatus | null> {
  const bridge = desktopAssistant(); if (!bridge) return null;
  const result = await bridge.status(); return result.ok ? result.value : null;
}
export function assistantValue<T>(reply: AssistantReply<T>): T {
  if (reply.ok === true) return reply.value;
  const messages: Record<string, string> = {
    STALE_CONTEXT: 'The active account changed. Please try again.',
    PRIVACY_DISABLED: 'Local commands are paused in Settings.',
    PRIVACY_UNAVAILABLE: 'Privacy choices could not be saved. Local commands are paused.',
    CONFLICT: 'Privacy choices changed. Refresh or reopen Settings before saving.',
    LOCAL_UNAVAILABLE: 'Local commands are not installed. Run the local assistant setup, then restart Synapse.',
    CANCELLED: 'Request cancelled.', BUSY: 'A local request is still finishing. Try again shortly.',
    RATE_LIMIT: 'Please wait a moment before asking again.', INVALID: 'Enter a shorter command.',
    NATIVE_TIMEOUT: 'The local model took too long. Try a shorter command.',
    DENIED: 'This app view cannot use local commands. Reopen Synapse.'
  };
  throw new Error(messages[reply.code] || 'Local commands are temporarily unavailable. Try again.');
}
