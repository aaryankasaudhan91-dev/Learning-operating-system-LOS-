import {useEffect,useRef,useState,type FormEvent} from 'react';
import {assistantConsent} from '../services/assistant-privacy.service';
import {sendCloudQuestion} from '../services/cloud-assistant.service';
import {CLOUD_AI_MODELS,CLOUD_AI_NOTICE,type AssistantConsent,type CloudAnswer,type CloudTask} from '../services/assistant.types';
export default function AssistantCloud({account,owner}:{account?:string;owner:string|null}) {
  const [consent,setConsent]=useState<AssistantConsent|null>(null),[prompt,setPrompt]=useState(''),[context,setContext]=useState('');
  const [task,setTask]=useState<CloudTask>('explain'),[reviewed,setReviewed]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [answer,setAnswer]=useState<{owner:string;value:CloudAnswer}|null>(null),[draftOwner,setDraftOwner]=useState<string|null>(null);
  const active=useRef<AbortController|null>(null),epoch=useRef(0);
  useEffect(()=>{
    const version=++epoch.current;active.current?.abort();active.current=null;setConsent(null);setPrompt('');setContext('');setReviewed(false);setBusy(false);setAnswer(null);setError('');
    if(account && owner)void assistantConsent.read(account).then(value=>{if(version===epoch.current)setConsent(value)}).catch(()=>{if(version===epoch.current)setError('Cloud privacy choices could not load.')});
    return()=>{epoch.current++;active.current?.abort()};
  },[account,owner]);
  function cancel(){epoch.current++;active.current?.abort();active.current=null;setBusy(false);setReviewed(false)}
  async function submit(event:FormEvent){
    event.preventDefault();if(!account || !owner || !reviewed || busy || draftOwner!==owner || !consent?.features.cloud)return;
    const version=++epoch.current,controller=new AbortController();active.current=controller;setBusy(true);setAnswer(null);setError('');setReviewed(false);
    try{const value=await sendCloudQuestion(account,task,prompt,context,controller.signal);if(version===epoch.current)setAnswer({owner,value})}
    catch(reason){if(version===epoch.current)setError(reason instanceof Error?reason.message:'Cloud response unavailable.')}
    finally{if(version===epoch.current){setBusy(false);active.current=null}}
  }
  const owned=draftOwner===owner,visible=answer?.owner===owner?answer.value:null,ready=!!account && !!owner && consent?.features.cloud===true && consent.cloud?.available===true && consent.cloud.eligible && consent.noticeVersion===CLOUD_AI_NOTICE && typeof consent.grantToken==='string';
  return <section className="assistant-cloud" aria-labelledby="cloud-question-title"><h3 id="cloud-question-title">Optional cloud explanation</h3>
    <p>Groq receives only the question and context entered below. No commands, page text or learning records are added automatically. Responses may be inaccurate.</p>
    {!ready&&<p role="status">{!account?'Sign in to check cloud access.':!consent?.cloud?.available?'Cloud AI is off for this deployment.':!consent.cloud.eligible?'This account needs operator-approved adult and regional eligibility.':'Review and enable cloud consent in Privacy settings.'}</p>}
    <form onSubmit={submit}><fieldset disabled={!ready || busy}>
      <label htmlFor="cloud-task">Help type</label><select id="cloud-task" value={task} onChange={event=>{setTask(event.target.value as CloudTask);setReviewed(false)}}><option value="explain">Brief explanation</option><option value="hint">Hint</option><option value="deep-explain">Deeper explanation</option></select>
      <p>Recipient: Groq · {task==='deep-explain'?CLOUD_AI_MODELS.deep:CLOUD_AI_MODELS.fast}</p>
      <label htmlFor="cloud-question">Question to send</label><textarea id="cloud-question" maxLength={2000} value={owned?prompt:''} onChange={event=>{setPrompt(event.target.value);setDraftOwner(owner);setReviewed(false)}}/>
      <label htmlFor="cloud-context">Optional context to send</label><textarea id="cloud-context" maxLength={2000} value={owned?context:''} onChange={event=>{setContext(event.target.value);setDraftOwner(owner);setReviewed(false)}}/>
      <label><input type="checkbox" checked={reviewed&&owned} onChange={event=>setReviewed(event.target.checked)}/>I reviewed this text and want to send it to Groq.</label>
      <button className="ink-button" disabled={!reviewed || !owned || !prompt.trim()}>Send to Groq</button>
    </fieldset></form>
    {busy&&<button className="text-button" onClick={cancel}>Cancel cloud request</button>}
    {error&&<p role="alert">{error}</p>}
    {visible&&<article className="assistant-cloud-answer"><p><strong>AI-generated answer</strong> · {visible.provider} · {visible.model}</p><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',fontFamily:'inherit'}}>{visible.text}</pre><button className="text-button" onClick={()=>{setAnswer(null);setPrompt('');setContext('')}}>Clear cloud text</button></article>}
  </section>;
}
