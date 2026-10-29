import {apiFetch} from '../../packages/learning-ui/src/services/http';
declare global {interface Window {testBlockedCloud:()=>Promise<{status:number;calls:number}>}}
window.testBlockedCloud=async()=>{const previous=window.fetch;let calls=0;window.fetch=async()=>{calls++;throw new Error('Unexpected network request')};try{const response=await apiFetch('/api/agent/guide-chat',{method:'POST',body:JSON.stringify({chatHistory:[]})});return{status:response.status,calls}}finally{window.fetch=previous}};
import {clearAssistantContent} from '../../packages/learning-ui/src/services/assistant-privacy.service';
declare global {interface Window {clearAssistantFixture:()=>Promise<void>}}
window.clearAssistantFixture=clearAssistantContent;
import React from 'react';
import {createRoot} from 'react-dom/client';
import FocusChamber from '../../packages/learning-ui/src/components/FocusChamber';
createRoot(document.getElementById('root')!).render(<FocusChamber setView={()=>{}}
  draft={{id:'fixture-draft',topic:'algebra',minutes:20}} onDraftConsumed={()=>{}}/>);
