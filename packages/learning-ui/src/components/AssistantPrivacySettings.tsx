import {useEffect,useRef,useState} from 'react';
import {desktopAssistant} from '../services/assistant.service';
import {assistantConsent,useAssistantPrivacy,saveLocalAssistantPreference,forgetLocalAssistantPreferences,clearAssistantContent} from '../services/assistant-privacy.service';
import {CLOUD_AI_MODELS,type AssistantConsent} from '../services/assistant.types';

export default function AssistantPrivacySettings({account}:{account?:string}) {
  const privacy=useAssistantPrivacy();
  const [consent,setConsent]=useState<AssistantConsent|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const [localBusy,setLocalBusy]=useState(false),[serverBusy,setServerBusy]=useState(false);
  const [cloudReviewed,setCloudReviewed]=useState(false);
  const epoch=useRef(0);
  const owner=useRef(account);owner.current=account;
  const local=!!desktopAssistant();
  const own=privacy.account===(account??null) && !privacy.binding;
  const context=own?privacy.context:null;
  async function readConsent() {
    if(!account)return;
    const current=epoch.current;setServerBusy(true);setError('');
    try{const result=await assistantConsent.read(account);if(current===epoch.current)setConsent(result)}
    catch(reason){if(current===epoch.current)setError(reason instanceof Error?reason.message:'Privacy choices could not load.')}
    finally{if(current===epoch.current)setServerBusy(false)}
  }
  useEffect(()=>{
    epoch.current++;setConsent(null);setNotice('');setError('');setLocalBusy(false);setServerBusy(false);setCloudReviewed(false);
    void readConsent();return()=>{epoch.current++};
  },[account]);
  async function localAction(work:()=>Promise<unknown>,message:string) {
    const current=epoch.current;setLocalBusy(true);setError('');setNotice('');
    try{await work();if(current===epoch.current)setNotice(message)}
    catch(reason){if(current===epoch.current)setError(reason instanceof Error?reason.message:'Local privacy choices could not be saved.')}
    finally{if(current===epoch.current)setLocalBusy(false)}
  }
  async function serverAction(remove=false,enabled=false) {
    if(!account || owner.current!==account || !consent)return;
    const current=epoch.current;setServerBusy(true);setError('');setNotice('');
    try{
      const result=await (remove?assistantConsent.remove(account,consent.revision):assistantConsent.saveCloud(account,consent.revision,enabled));
      if(current===epoch.current){setConsent(result);setCloudReviewed(false);setNotice(remove?'Saved consent record removed. Cloud AI is off.':enabled?'Cloud consent saved. Each question still needs your review before sending.':'Cloud AI is saved as off for this account. In-flight uploads cannot be recalled.')}
    }catch(reason){if(current===epoch.current)setError(reason instanceof Error?reason.message:'Privacy choices could not be saved.')}
    finally{if(current===epoch.current)setServerBusy(false)}
  }
  return <section className="assistant-privacy-settings" aria-labelledby="assistant-privacy-title">
    <h2 id="assistant-privacy-title">Assistant privacy</h2>
    <p>Commands and proposals stay in memory. Synapse does not save an assistant conversation history.</p>
    {local && <fieldset disabled={localBusy || !context}>
      <legend>On this device</legend>
      <label className="assistant-privacy-toggle"><input type="checkbox" checked={!!context?.preferences.localCommandsEnabled}
        disabled={localBusy || !context || context.storage!=='ready'}
        onChange={event=>void localAction(()=>saveLocalAssistantPreference(event.target.checked),'Local command preference saved for this account.')}/><span>Allow local commands</span></label>
      <p>{context?.storage==='unavailable'?'Saved choices could not be read. Commands are paused. Reset saved local choices to repair them.':privacy.error || (account?'This choice is saved separately for your account on this device.':'This choice applies to signed-out use on this device.')}</p>
      <div className="assistant-privacy-actions"><button className="text-button" onClick={()=>void localAction(clearAssistantContent,'Current command, proposal, page text and focus draft cleared. Downloaded models and learning records were kept.')}>Clear current assistant data</button>
        <button className="text-button" onClick={()=>void localAction(forgetLocalAssistantPreferences,'Saved local choices removed. Local commands use the default on setting; cloud consent is separate; public pages still require permission each time.')}>Reset saved local choices</button></div>
    </fieldset>}
    <fieldset disabled={serverBusy}>
      <legend>Account cloud services</legend>
      <p>Cloud AI is optional and off by default. Eligible adults can send reviewed questions and context to Groq using {CLOUD_AI_MODELS.fast} or {CLOUD_AI_MODELS.deep}. Server-side web access remains off. Public page reading uses its own permission.</p>
      <p>Questions pass through the LOS backend to Groq. This integration requires operator-confirmed zero data retention; Groq still keeps usage metadata and may have legal obligations. LOS stores consent and quota metadata, not cloud questions or answers. Provider processing may involve the United States. Do not include personal data about children, credentials or sensitive learner records.</p>
      <p>Revoking consent blocks future requests and attempts to cancel active work; it cannot recall data already sent. Shared free-plan allowances can be exhausted. There is no automatic paid or alternate-provider fallback.</p>
      <p><a href="https://console.groq.com/docs/your-data" target="_blank" rel="noreferrer">Groq data controls</a> · <a href="https://console.groq.com/docs/legal/services-agreement" target="_blank" rel="noreferrer">Groq terms</a></p>
      {account?<>
        <p>{!consent?'Account privacy choices have not loaded.':consent.features.cloud?'Cloud questions are enabled for this account.':!consent.cloud?.available?'Cloud deployment is not enabled.':!consent.cloud.eligible?'Operator-approved adult and regional eligibility is required.':'Cloud consent is off.'}</p>
        <label><input type="checkbox" checked={cloudReviewed} disabled={!consent?.cloud?.available || !consent.cloud.eligible} onChange={event=>setCloudReviewed(event.target.checked)}/>I have reviewed this notice and agree to send only questions and context I explicitly choose to Groq.</label>
        <div className="assistant-privacy-actions"><button className="ink-button" disabled={!cloudReviewed || !consent?.cloud?.available || !consent.cloud.eligible} onClick={()=>void serverAction(false,true)}>Enable reviewed cloud questions</button>
          <button className="text-button" disabled={!consent} onClick={()=>void serverAction()}>Turn cloud AI off</button>
          <button className="text-button" disabled={!consent || consent.revision===0} onClick={()=>void serverAction(true)}>Remove saved consent record</button>
          <button className="text-button" onClick={()=>void readConsent()}>Refresh account choices</button></div>
      </>:<p>Sign in to manage your account's saved consent choices.</p>}
    </fieldset>
    {notice&&<p role="status">{notice}</p>}{error&&<p role="alert">{error}</p>}
  </section>;
}
