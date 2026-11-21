import type {AssistantReply, AssistantStatus} from './assistant.types';
export const desktopAssistant = () => window.losAssistant;
export async function assistantStatus(): Promise<AssistantStatus | null> {
  const bridge = desktopAssistant(); if (!bridge) return null;
  const result = await bridge.status(); return result.ok ? result.value : null;
}
export function assistantValue<T>(reply: AssistantReply<T>): T {
  if (reply.ok === true) return reply.value;
  const messages: Record<string, string> = {
    URL_DENIED: 'Use an approved HTTPS page on en.wikipedia.org, developer.mozilla.org or www.khanacademy.org, without a query or fragment.',
    WEB_UNAVAILABLE:'The public reader needs Windows setup or repair. Restart Synapse after setup.',
    WEB_FETCH_FAILED:'The website could not be reached securely. Try again later.',
    WEB_TIMEOUT:'The page took too long to read.', WEB_TOO_LARGE:'This page is too large for the public reader.',
    WEB_CONTENT_DENIED:'This reader accepts UTF-8 HTML and plain text pages only.',
    WEB_ROBOTS_DENIED:'This website does not permit this page to be read automatically.',
    WEB_REDIRECT_LIMIT:'This page redirects too many times.', WEB_HTTP_FAILED:'The website did not return a successful page.',
    WEB_EMPTY:'No readable text was found.', WEB_CLEANUP_FAILED:'The reader could not clear its temporary data. Restart Synapse before reading another page.',
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
