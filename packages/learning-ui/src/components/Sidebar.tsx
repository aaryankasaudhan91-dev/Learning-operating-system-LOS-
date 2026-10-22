import { ChevronLeft, ChevronRight, LogOut, ArrowUpRight } from 'lucide-react';
import type { AppView } from '../types';
import { navigation, accountNavigation } from './navigation';
interface Props { currentView: AppView; setView: (view: AppView) => void; userRole: 'student' | 'mentor'; cognitiveLoad: number; userName?: string; onLogout?: () => void; isOpen: boolean; setIsOpen: (open: boolean) => void }
export default function Sidebar({currentView,setView,userRole,userName,onLogout,isOpen,setIsOpen}: Props) {
 return <aside className={`study-sidebar ${isOpen ? '' : 'is-collapsed'}`}>
  <div className="study-sidebar-heading"><span>{isOpen ? 'YOUR WORKSPACE' : 'SYN'}</span><button aria-label={isOpen ? 'Collapse navigation' : 'Expand navigation'} onClick={()=>setIsOpen(!isOpen)}>{isOpen ? <ChevronLeft size={16}/> : <ChevronRight size={16}/>}</button></div>
  <nav aria-label="Workspace">{navigation(userRole).map(({view,label,icon:Icon})=><button key={view} title={label} aria-current={currentView===view?'page':undefined} className={currentView===view?'is-active':''} onClick={()=>setView(view)}><Icon size={20}/>{isOpen && <span>{label}</span>}</button>)}</nav>
  {isOpen && <div className="study-sidebar-note"><span className="study-eyebrow">A LITTLE EVERY DAY</span><h3>Make room<br/>for your next idea.</h3><p>Your learning, at your pace.</p><button onClick={()=>setView(userRole==='student'?'chamber':'courses')}>Let's begin <ArrowUpRight size={17}/></button></div>}
  <nav aria-label="Account" className="study-account">{accountNavigation.map(({view,label,icon:Icon})=><button key={view} title={label} aria-current={currentView===view?'page':undefined} className={currentView===view?'is-active':''} onClick={()=>setView(view)}><Icon size={19}/>{isOpen && <span>{label}</span>}</button>)}</nav>
  <div className="study-profile"><button title="Open profile" onClick={()=>setView('profile')}><span className="study-avatar">{(userName || userRole).slice(0,1).toUpperCase()}</span>{isOpen && <span><strong>{userName || (userRole==='student'?'Learner':'Mentor')}</strong><small>{userRole==='student'?'Personal workspace':'Teaching workspace'}</small></span>}</button>{isOpen && <button title="Sign out" onClick={onLogout}><LogOut size={18}/></button>}</div>
 </aside>;
}
