import React from 'react';
import {createRoot} from 'react-dom/client';
import StartupGate from '../../../packages/learning-ui/src/components/StartupGate';
import WebPortal from './WebPortal';
import './website.css';
import '../../../packages/learning-ui/src/index.css';
import '../../../packages/learning-ui/src/app-design.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><StartupGate><WebPortal/></StartupGate></React.StrictMode>);
