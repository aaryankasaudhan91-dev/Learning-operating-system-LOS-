/** Only application API requests are redirected; media and external requests stay intact. */
const backend = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
 const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
 if (!url.startsWith('/api/')) return fetch(input, init);
 if (!backend && location.protocol !== 'http:' && location.protocol !== 'https:') {
  return Promise.reject(new Error('Set VITE_BACKEND_URL to your HTTPS backend before building the installed app.'));
 }
 const target = backend + url;
 return fetch(input instanceof Request ? new Request(target, input) : target, init);
}
