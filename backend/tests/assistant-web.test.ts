import test from 'node:test';
import assert from 'node:assert/strict';
import {approvedUrl} from '../../desktop/assistant/contracts';
import {publicIPv4,robotsAllowed} from '../../desktop/assistant/web-policy';
import {fetchPublicPage,type WebTransport,type PageResponse} from '../../desktop/assistant/web-fetch';
const url='https://en.wikipedia.org/wiki/Physics',signal=()=>new AbortController().signal;
const response=(body:string,status=200,headers:Record<string,string>={}):PageResponse=>({body:Buffer.from(body),status,headers:{'content-type':'text/html; charset=utf-8',...headers}});
function fixture(answer:(url:URL)=>PageResponse,addresses=['93.184.215.14']) {
  const calls:string[]=[],pins:string[]=[];
  const network:WebTransport={resolve:async()=>addresses,exchange:async(url,ip)=>{calls.push(url.href);pins.push(ip);return answer(url)}};
  return {network,calls,pins};
}
test('web policy denies non-public addresses, mapped IPv6, schemes, credentials and unapproved hosts',()=>{
  for(const ip of ['0.0.0.0','10.1.1.1','100.64.0.1','127.0.0.1','169.254.169.254','172.16.1.2','192.0.2.1','192.168.1.1','198.18.0.1','198.51.100.1','203.0.113.1','224.0.0.1','255.255.255.255','::1','::ffff:127.0.0.1','fd00::1','not-an-ip'])assert.equal(publicIPv4(ip),false,ip);
  assert.equal(publicIPv4('1.1.1.1'),true);assert.equal(publicIPv4('8.8.8.8'),true);
  for(const value of ['http://en.wikipedia.org/','file:///C:/secret','data:text/html,hello','https://127.0.0.1/','https://en.wikipedia.org.evil.test/','https://user:pass@en.wikipedia.org/','https://en.wikipedia.org:444/','https://en.wikipedia.org/?token=secret','https://en.wikipedia.org/#x','not a URL'])assert.throws(()=>approvedUrl(value));
  assert.equal(approvedUrl(url),url);
});
test('robots longest rule, wildcard, end anchor, specific agent and malformed policy are handled conservatively',()=>{
  assert.equal(robotsAllowed('User-agent: *\nDisallow: /wiki/\nAllow: /wiki/Physics',url),true);
  assert.equal(robotsAllowed('User-agent: *\nDisallow: /wiki/*ics$',url),false);
  assert.equal(robotsAllowed('User-agent: other\nDisallow: /\nUser-agent: *\nDisallow:',url),true);
  assert.equal(robotsAllowed('User-agent: *\nDisallow: /\nUser-agent: LOSReader\nAllow: /wiki/',url),true);
  assert.equal(robotsAllowed('Disallow: /',url),false);
  assert.equal(robotsAllowed('User-agent: *\nDisallow: invalid',url),false);
});
test('broker pins validated public DNS, checks robots and reports final successful URL',async()=>{
  const f=fixture(u=>u.pathname==='/robots.txt'?response('User-agent: *\nDisallow:'):response('<h1>Physics</h1>'));
  const page=await fetchPublicPage(url,signal(),f.network);
  assert.equal(page.finalUrl,url);assert.equal(page.status,200);assert.equal(page.plain,false);
  assert.deepEqual(f.pins,['93.184.215.14','93.184.215.14']);assert.equal(f.calls.length,2);
  const mixed=fixture(()=>response(''),['93.184.215.14','127.0.0.1']);
  await assert.rejects(fetchPublicPage(url,signal(),mixed.network),/URL_DENIED/);assert.equal(mixed.calls.length,0);
});
test('redirect targets are checked before DNS and sockets, including rebinding and robots denied paths',async()=>{
  for(const destination of ['http://127.0.0.1/','https://169.254.169.254/','file:///C:/secret','https://developer.mozilla.org/en-US/','https://en.wikipedia.org/wiki/Blocked']){
    const f=fixture(u=>u.pathname==='/robots.txt'?response('User-agent: *\nDisallow: /wiki/Blocked'):response('',302,{location:destination}));
    await assert.rejects(fetchPublicPage(url,signal(),f.network),/URL_DENIED|WEB_ROBOTS_DENIED/);
    assert.equal(f.calls.length,2,'redirect was not requested');
  }
  const f=fixture(u=>u.pathname==='/robots.txt'?response(''):response('',302,{location:'/wiki/Other'}));
  let lookups=0;f.network.resolve=async()=>++lookups<3?['1.1.1.1']:['127.0.0.1'];
  await assert.rejects(fetchPublicPage(url,signal(),f.network),/URL_DENIED/);assert.equal(f.calls.length,2);
});
test('unsuccessful status, compression, unexpected encodings, robots denial and oversized pages fail closed',async()=>{
  for(const page of [response('missing',404),response('x',200,{'content-type':'application/pdf'}),response('x',200,{'content-type':'text/html; charset=shift_jis'}),response('x',200,{'content-encoding':'gzip'}),response('x'.repeat(2*1024*1024+1))]){
    const f=fixture(u=>u.pathname==='/robots.txt'?response(''):page);
    await assert.rejects(fetchPublicPage(url,signal(),f.network),/WEB_HTTP_FAILED|WEB_CONTENT_DENIED|WEB_TOO_LARGE/);
  }
  const f=fixture(()=>response('User-agent: *\nDisallow: /'));
  await assert.rejects(fetchPublicPage(url,signal(),f.network),/WEB_ROBOTS_DENIED/);assert.equal(f.calls.length,1);
});
test('redirect loops are bounded and DNS cancellation does not issue a later request',async()=>{
  const f=fixture(u=>u.pathname==='/robots.txt'?response(''):response('',302,{location:'/wiki/Loop'}));
  await assert.rejects(fetchPublicPage(url,signal(),f.network),/WEB_REDIRECT_LIMIT/);assert.equal(f.calls.length,5);
  let finish!:(ips:string[])=>void;const delayed=fixture(()=>response(''));
  delayed.network.resolve=()=>new Promise(resolve=>{finish=resolve});
  const controller=new AbortController();const pending=fetchPublicPage(url,controller.signal,delayed.network);
  controller.abort();await assert.rejects(pending,/CANCELLED/);finish(['1.1.1.1']);await Promise.resolve();assert.equal(delayed.calls.length,0);
});
