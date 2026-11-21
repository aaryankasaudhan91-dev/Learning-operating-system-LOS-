import type {Express,Request,Response,NextFunction} from 'express';
import {ApiError,body,check,text} from '../security';
import {assertCloudGrant} from '../assistant-privacy';
import {cloudConfiguration} from './policy';
import {reserveCloud} from './quota';
import {cloudMessages,groqCompletion,COMPLETION_LIMIT,ProviderError} from './provider';
import {CLOUD_AI_NOTICE,type CloudTask} from '../../../packages/learning-ui/src/services/assistant.types';

export function setupCloudRoutes(app:Express) {
  app.post('/api/assistant/cloud/explain',(req:Request,res:Response,next:NextFunction)=>{
    const lifetime=new AbortController();
    const requestSignal=AbortSignal.any([lifetime.signal,AbortSignal.timeout(30000)]);
    const close=()=>{if(!res.writableEnded)lifetime.abort()};
    req.once('aborted',close);res.once('close',close);
    void (async()=>{
      const input=body(req.body);
      check(Object.keys(input).every(key=>['requestId','noticeVersion','consentRevision','grantToken','task','prompt','context'].includes(key)),400,'Unsupported cloud field.');
      check(typeof input.requestId==='string' && /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i.test(input.requestId),400,'Invalid cloud request ID.');
      check(input.noticeVersion===CLOUD_AI_NOTICE,409,'Review the current cloud notice.');
      check(Number.isSafeInteger(input.consentRevision)&&input.consentRevision>0,400,'Invalid consent revision.');
      check(typeof input.grantToken==='string' && /^[a-f\d-]{36}$/i.test(input.grantToken),400,'Invalid consent binding.');
      check(['explain','hint','deep-explain'].includes(input.task),400,'Unsupported cloud task.');
      const prompt=text(input.prompt,'Question',2000)!,context=text(input.context,'Context',2000,false)??'';
      check(Buffer.byteLength(prompt+context,'utf8')<=4000,400,'Cloud question and context are too long.');
      const uid=res.locals.identity.uid as string,config=cloudConfiguration();
      await assertCloudGrant(uid,input.consentRevision,input.grantToken);
      const messages=cloudMessages(input.task as CloudTask,prompt,context);
      // Reserve a conservative byte bound plus framing and the full completion
      // budget, including reasoning. Failed attempts are never refunded/retried.
      const tokens=Buffer.byteLength(JSON.stringify(messages),'utf8')+512+COMPLETION_LIMIT;
      const release=await reserveCloud(config,uid,input.requestId,tokens);
      let cooldown=0,poll:ReturnType<typeof setInterval>|undefined,checking=false;
      let answer:Awaited<ReturnType<typeof groqCompletion>>;
      try {
        await assertCloudGrant(uid,input.consentRevision,input.grantToken);
        check(!requestSignal.aborted,499,'Cloud request cancelled or timed out.');
        const signal=AbortSignal.any([requestSignal,AbortSignal.timeout(25000)]);
        poll=setInterval(()=>{
          if(checking)return;checking=true;
          void assertCloudGrant(uid,input.consentRevision,input.grantToken).catch(()=>lifetime.abort()).finally(()=>{checking=false});
        },500);
        answer=await groqCompletion(input.task as CloudTask,messages,signal);
        await assertCloudGrant(uid,input.consentRevision,input.grantToken);
        check(!signal.aborted,499,'Cloud request cancelled.');
      } catch(error){if(error instanceof ProviderError)cooldown=error.cooldownSeconds;throw error}
      finally {if(poll)clearInterval(poll);await release(cooldown)}
      await assertCloudGrant(uid,input.consentRevision,input.grantToken);
      check(!requestSignal.aborted,499,'Cloud request cancelled or timed out.');
      if(!res.destroyed)res.json(answer);
    })().catch(error=>{if(!res.destroyed && !res.headersSent){if(error instanceof ApiError && error.status===429)res.setHeader('Retry-After',error instanceof ProviderError?Math.max(1,error.cooldownSeconds):60);next(error instanceof ApiError?error:new ApiError(503,'Cloud service is unavailable.'))}})
      .finally(()=>{req.off('aborted',close);res.off('close',close)});
  });
}
