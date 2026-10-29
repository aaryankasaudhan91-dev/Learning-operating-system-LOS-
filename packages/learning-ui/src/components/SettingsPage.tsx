import {useEffect,useState} from 'react';
import {apiFetch} from '../services/http';
import {assistantStatus} from '../services/assistant.service';
import type {AssistantStatus} from '../services/assistant.types';
import {watchConnection,type ConnectionState} from '../services/realtime';
import type {AppView} from '../types';
import AssistantPrivacySettings from './AssistantPrivacySettings';
export default function SettingsPage({setView,userRole,account}:{setView:(view:AppView)=>void;userRole:'student'|'mentor';account?:string}) {
 const[local,setLocal]=useState<AssistantStatus|null>(null),[state,setState]=useState<ConnectionState>('disconnected');
 const[capabilities,setCapabilities]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function refresh(){
  void assistantStatus().then(setLocal).catch(()=>setLocal(null));setBusy(true);setError('');
  if(!account){setCapabilities(null);setBusy(false);return}
  try{const response=await apiFetch('/api/capabilities');if(!response.ok)throw new Error();setCapabilities(await response.json())}
  catch{setCapabilities(null);setError('Service status could not load. Local privacy choices remain separate from the server connection.')}
  finally{setBusy(false)}
 }
 useEffect(()=>{void refresh();return watchConnection(setState)},[account]);
 return <section className="real-form page-opening"><span className="editorial-kicker">YOUR WORKSPACE</span><h1>Settings.</h1>
  <p>Change your appearance with the theme switch in the navigation.</p><p>Live connection: <strong>{state}</strong></p>
  {capabilities&&<p>Cloud AI: disabled until consent and provider checks are ready.</p>}
  {local&&<p>Local model: <strong>{local.local==='ready'?'Ready on this device':local.local==='invalid'?'Files need repair':'Not installed for this device'}</strong>.</p>}
  {error&&<p role="alert">{error}</p>}
  <button className="ink-button" disabled={busy} onClick={()=>void refresh()}>{busy?'Checking…':'Refresh service status'}</button>
  <AssistantPrivacySettings account={account}/>
  <button className="text-button" onClick={()=>setView('profile')}>Edit {userRole==='mentor'?'teacher':'learner'} profile</button><button className="text-button" onClick={()=>setView('help')}>Get help</button>
 </section>;
}
