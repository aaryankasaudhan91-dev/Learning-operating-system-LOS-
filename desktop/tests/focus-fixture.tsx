import React from 'react';
import {createRoot} from 'react-dom/client';
import FocusChamber from '../../packages/learning-ui/src/components/FocusChamber';
createRoot(document.getElementById('root')!).render(<FocusChamber setView={()=>{}}
  draft={{id:'fixture-draft',topic:'algebra',minutes:20}} onDraftConsumed={()=>{}}/>);
