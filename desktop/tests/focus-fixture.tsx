import {clearAssistantContent} from '../../packages/learning-ui/src/services/assistant-privacy.service';
declare global {interface Window {clearAssistantFixture:()=>Promise<void>}}
window.clearAssistantFixture=clearAssistantContent;
import React from 'react';
import {createRoot} from 'react-dom/client';
import FocusChamber from '../../packages/learning-ui/src/components/FocusChamber';
createRoot(document.getElementById('root')!).render(<FocusChamber setView={()=>{}}
  draft={{id:'fixture-draft',topic:'algebra',minutes:20}} onDraftConsumed={()=>{}}/>);
