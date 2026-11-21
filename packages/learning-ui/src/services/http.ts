import { auth } from '../lib/firebase';
/** Only application API requests are redirected; media and external requests stay intact. */
const backend = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
 const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
 // Legacy automatic endpoints never inherit manual-question cloud consent.
 if (url.startsWith('/api/agent/')) return new Response(JSON.stringify({error:'Cloud AI is paused while consent and provider eligibility controls are being completed.'}),{status:403,headers:{'Content-Type':'application/json'}});
 if (!url.startsWith('/api/')) return fetch(input, init);
 if (!backend && location.protocol !== 'http:' && location.protocol !== 'https:') {
  return Promise.reject(new Error('Set VITE_BACKEND_URL to your HTTPS backend before building the installed app.'));
 }
 const target = backend + url;
 const headers=new Headers(input instanceof Request ? input.headers : undefined); new Headers(init?.headers).forEach((value,key)=>headers.set(key,value));
 const identity=auth.currentUser;
 if(identity){const token=await identity.getIdToken();if(auth.currentUser?.uid!==identity.uid)throw new Error('The active account changed.');headers.set('Authorization',`Bearer ${token}`)}
 if(init?.signal?.aborted)throw new DOMException('Request cancelled','AbortError');
 return fetch(input instanceof Request ? new Request(target, input) : target, {...init,headers});
}
