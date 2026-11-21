import https from 'node:https';
import {lookup} from 'node:dns/promises';
import {approvedUrl} from './contracts';
import {publicIPv4,robotsAllowed} from './web-policy';

export interface PageResponse {status:number; headers:Record<string,string|undefined>; body:Buffer}
export interface WebTransport {
  resolve(host:string):Promise<string[]>;
  exchange(url:URL,address:string,signal:AbortSignal,cap:number):Promise<PageResponse>;
}
const transport:WebTransport={
  resolve:async host=>(await lookup(host,{family:4,all:true})).map(item=>item.address),
  exchange:(url,address,signal,cap)=>new Promise((resolve,reject)=>{
    // Keep original host for TLS certificate verification/SNI; pin only DNS.
    const request=https.request(url,{method:'GET',agent:false,signal,family:4,
      headers:{'User-Agent':'LOSReader/1.0','Accept':'text/html,text/plain;q=0.9','Accept-Encoding':'identity'},
      lookup:(_hostname,_options,callback)=>callback(null,address,4)},response=>{
      let size=0;const body=Buffer.allocUnsafe(cap);
      response.on('error',()=>reject(new Error('WEB_FETCH_FAILED')));
      response.on('data',(chunk:Buffer)=>{if(size+chunk.length>cap){response.destroy();request.destroy();reject(new Error('WEB_TOO_LARGE'))}else{chunk.copy(body,size);size+=chunk.length}});
      response.on('end',()=>resolve({status:response.statusCode??0,headers:{
        location:response.headers.location,'content-type':response.headers['content-type'],
        'content-encoding':response.headers['content-encoding']},body:Buffer.from(body.subarray(0,size))}));
    });
    request.setTimeout(7000,()=>request.destroy(new Error('WEB_TIMEOUT')));
    request.on('error',()=>reject(new Error(signal.aborted?'CANCELLED':'WEB_FETCH_FAILED')));request.end();
  })
};
async function boundedGet(raw:string,signal:AbortSignal,cap:number,network:WebTransport,authorize:(url:string)=>void=()=>{}) {
  let current=approvedUrl(raw);
  for(let redirects=0;redirects<=3;redirects++) {
    signal.throwIfAborted();authorize(current);const url=new URL(current);
    const addresses=await abortable(network.resolve(url.hostname),signal);signal.throwIfAborted();
    if(!addresses.length || addresses.some(ip=>!publicIPv4(ip)))throw new Error('URL_DENIED');
    const result=await network.exchange(url,addresses[0],signal,cap);signal.throwIfAborted();
    if(result.body.length>cap)throw new Error('WEB_TOO_LARGE');
    if(result.status>=300 && result.status<400 && result.headers.location) {
      // Validate before the next DNS lookup or socket. Never forward credentials.
      current=approvedUrl(new URL(result.headers.location,url).href);continue;
    }
    if(result.headers['content-encoding'] && result.headers['content-encoding']!=='identity')throw new Error('WEB_CONTENT_DENIED');
    return {...result,finalUrl:current};
  }
  throw new Error('WEB_REDIRECT_LIMIT');
}
function abortable<T>(work:Promise<T>,signal:AbortSignal):Promise<T> {
  return new Promise((resolve,reject)=>{
    const abort=()=>reject(new Error('CANCELLED'));
    signal.addEventListener('abort',abort,{once:true});
    work.then(resolve,reject).finally(()=>signal.removeEventListener('abort',abort));
    if(signal.aborted)abort();
  });
}
export async function fetchPublicPage(raw:string,signal:AbortSignal,network:WebTransport=transport) {
  const requestedUrl=approvedUrl(raw), robots=new URL('/robots.txt',requestedUrl).href;
  const sameOrigin=(url:string)=>{if(new URL(url).origin!==new URL(requestedUrl).origin)throw new Error('URL_DENIED')};
  const policy=await boundedGet(robots,signal,131072,network,sameOrigin);
  // Cross-origin robots redirects are refused rather than treated as another site's policy.
  if(new URL(policy.finalUrl).origin!==new URL(requestedUrl).origin)throw new Error('WEB_ROBOTS_DENIED');
  if(policy.status!==404 && (policy.status!==200 || !robotsAllowed(policy.body.toString('utf8'),requestedUrl)))throw new Error('WEB_ROBOTS_DENIED');
  const page=await boundedGet(requestedUrl,signal,2*1024*1024,network,url=>{
    sameOrigin(url);
    if(!robotsAllowed(policy.status===404?'':policy.body.toString('utf8'),url))throw new Error('WEB_ROBOTS_DENIED');
  });
  // Redirects to another approved origin need that origin's own robots policy.
  // Keep initial implementation same-origin, including redirects, to avoid ambiguity.
  if(new URL(page.finalUrl).origin!==new URL(requestedUrl).origin)throw new Error('URL_DENIED');
  if(page.status<200 || page.status>=300)throw new Error('WEB_HTTP_FAILED');
  if(!robotsAllowed(policy.status===404?'':policy.body.toString('utf8'),page.finalUrl))throw new Error('WEB_ROBOTS_DENIED');
  const type=page.headers['content-type']??'';
  if(!/^text\/(html|plain)(?:;|$)/i.test(type) || (/charset=/i.test(type) && !/charset=["']?utf-8(?:["';\s]|$)/i.test(type)))throw new Error('WEB_CONTENT_DENIED');
  return {requestedUrl,finalUrl:page.finalUrl,status:page.status,body:page.body,plain:/^text\/plain/i.test(type)};
}
