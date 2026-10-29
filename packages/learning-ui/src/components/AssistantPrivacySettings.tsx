import {useEffect,useRef,useState} from 'react';
import {desktopAssistant} from '../services/assistant.service';
import {assistantConsent,useAssistantPrivacy,saveLocalAssistantPreference,forgetLocalAssistantPreferences,clearAssistantContent} from '../services/assistant-privacy.service';
import type {AssistantConsent} from '../services/assistant.types';

export default function AssistantPrivacySettings({account}:{account?:string}) {
  const privacy=useAssistantPrivacy();
  const [consent,setConsent]=useState<AssistantConsent|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const [localBusy,setLocalBusy]=useState(false),[serverBusy,setServerBusy]=useState(false);
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
    epoch.current++;setConsent(null);setNotice('');setError('');setLocalBusy(false);setServerBusy(false);
    void readConsent();return()=>{epoch.current++};
  },[account]);
  async function localAction(work:()=>Promise<unknown>,message:string) {
    const current=epoch.current;setLocalBusy(true);setError('');setNotice('');
    try{await work();if(current===epoch.current)setNotice(message)}
    catch(reason){if(current===epoch.current)setError(reason instanceof Error?reason.message:'Local privacy choices could not be saved.')}
    finally{if(current===epoch.current)setLocalBusy(false)}
  }
  async function serverAction(remove=false) {
    if(!account || owner.current!==account || !consent)return;
    const current=epoch.current;setServerBusy(true);setError('');setNotice('');
    try{
      const result=await (remove?assistantConsent.remove(account,consent.revision):assistantConsent.saveOff(account,consent.revision));
      if(current===epoch.current){setConsent(result);setNotice(remove?'Saved consent record removed. Cloud AI and web reading remain off.':'Cloud AI and web reading are saved as off for this account.')}
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
      <div className="assistant-privacy-actions"><button className="text-button" onClick={()=>void localAction(clearAssistantContent,'Current command, proposal and focus draft cleared. Downloaded models and learning records were kept.')}>Clear current assistant data</button>
        <button className="text-button" onClick={()=>void localAction(forgetLocalAssistantPreferences,'Saved local choices removed. Local commands use the default on setting; cloud and web stay off.')}>Reset saved local choices</button></div>
    </fieldset>}
    <fieldset disabled={serverBusy}>
      <legend>Cloud AI and public web reading</legend>
      <p>Both are off while integration and eligibility checks are unfinished. Optional cloud requests are blocked on the server, even if a provider key is configured. You will be asked again before either feature becomes available.</p>
      {account?<>
        <p>{consent?consent.revision>0?'Off choices are saved for this account.':'Off by default. No consent record is stored yet.':'Account privacy choices have not loaded.'}</p>
        <div className="assistant-privacy-actions"><button className="text-button" disabled={!consent} onClick={()=>void serverAction()}>Save both as off</button>
          <button className="text-button" disabled={!consent || consent.revision===0} onClick={()=>void serverAction(true)}>Remove saved consent record</button>
          <button className="text-button" onClick={()=>void readConsent()}>Refresh account choices</button></div>
      </>:<p>Sign in to manage your account's saved consent choices.</p>}
    </fieldset>
    {notice&&<p role="status">{notice}</p>}{error&&<p role="alert">{error}</p>}
  </section>;
}
