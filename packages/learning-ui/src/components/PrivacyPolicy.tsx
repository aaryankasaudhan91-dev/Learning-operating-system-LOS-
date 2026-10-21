import LegalContent from './LegalContent';
import type {AppView} from '../types';
export default function Policy({setView}:{setView:(view:AppView)=>void}){return <LegalContent kind="privacy" onBack={()=>setView('landing')}/>}
