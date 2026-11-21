import {isIP} from 'node:net';
import {approvedUrl} from './contracts';

/** Intentionally IPv4-only: IPv6-only sites fail closed in this first reader. */
export function publicIPv4(address:string):boolean {
  if(isIP(address)!==4)return false;
  const [a,b,c]=address.split('.').map(Number);
  return !(a===0 || a===10 || a===127 || a>=224 ||
    (a===100 && b>=64 && b<=127) || (a===169 && b===254) ||
    (a===172 && b>=16 && b<=31) ||
    (a===192 && (b===168 || (b===0 && (c===0 || c===2)) || (b===88 && c===99))) ||
    (a===198 && (b===18 || b===19 || (b===51 && c===100))) || (a===203 && b===0 && c===113));
}

/** Small, conservative robots policy for GET-only pages. Unsupported syntax denies.
 * Exact LOSReader groups take precedence over wildcard groups; Allow wins ties. */
export function robotsAllowed(body:string,url:string):boolean {
  if(body.length>131072)return false;
  const groups:{agents:string[]; rules:{allow:boolean;pattern:string}[]}[]=[];
  let group:typeof groups[number]|undefined,hasRules=false;
  for(const raw of body.split(/\r?\n/)) {
    const line=raw.split('#',1)[0].trim(); if(!line)continue;
    const at=line.indexOf(':');if(at<0)return false;
    const key=line.slice(0,at).trim().toLowerCase(),value=line.slice(at+1).trim();
    if(key==='user-agent') {
      if(!group || hasRules){group={agents:[],rules:[]};groups.push(group);hasRules=false}
      group.agents.push(value.toLowerCase());
    } else if(key==='allow' || key==='disallow') {
      if(!group)return false;hasRules=true;
      if(value){if(!value.startsWith('/') || value.length>2048)return false;group.rules.push({allow:key==='allow',pattern:value})}
    }
  }
  const specific=groups.filter(g=>g.agents.includes('losreader'));
  const selected=specific.length?specific:groups.filter(g=>g.agents.includes('*'));
  let length=-1,allowed=true;
  const pathname=new URL(approvedUrl(url)).pathname;
  for(const rule of selected.flatMap(g=>g.rules)) {
    const terminal=rule.pattern.endsWith('$');
    const pattern=terminal?rule.pattern.slice(0,-1):rule.pattern+'*';
    const size=rule.pattern.replace(/[\*$]/g,'').length;
    if(glob(pattern,pathname) && (size>length || (size===length && rule.allow))){length=size;allowed=rule.allow}
  }
  return allowed;
}
// No page-supplied regular expressions: wildcard matching cannot cause regex
// backtracking explosions. Input lengths are bounded before this routine.
function glob(pattern:string,text:string):boolean {
  let p=0,t=0,star=-1,retry=0;
  while(t<text.length){
    if(pattern[p]===text[t]){p++;t++}
    else if(pattern[p]==='*'){star=p++;retry=t}
    else if(star>=0){p=star+1;t=++retry}
    else return false;
  }
  while(pattern[p]==='*')p++;
  return p===pattern.length;
}
