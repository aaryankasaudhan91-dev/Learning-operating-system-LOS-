import type { AppView } from '../types';
import { navigation } from './navigation';
export default function MobileNavigation({currentView,setView,userRole}:{currentView:AppView;setView:(v:AppView)=>void;userRole:'student'|'mentor'}){
 return <nav className="study-bottom-nav" aria-label="Main navigation">{navigation(userRole).map(({view,label,icon:Icon})=><button key={view} aria-current={currentView===view?'page':undefined} onClick={()=>setView(view)}><Icon size={21}/><span>{label}</span></button>)}</nav>;
}
