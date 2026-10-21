import React,{Suspense,lazy} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import './app-design.css';
import StartupGate from './components/StartupGate';
import AppLoading from './components/AppLoading';
const App=lazy(()=>import('./App'));
createRoot(document.getElementById('root')!).render(<React.StrictMode><StartupGate><Suspense fallback={<AppLoading/>}><App/></Suspense></StartupGate></React.StrictMode>);
