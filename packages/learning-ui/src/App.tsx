import {bindAssistantAccount, useAssistantPrivacy} from './services/assistant-privacy.service';
import { apiFetch } from './services/http';
import { watchResource } from './services/realtime';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import MobileNavigation from './components/MobileNavigation';
import Sidebar from './components/Sidebar';
import CookieConsent from './components/CookieConsent';
import AppLoading from './components/AppLoading';
import HelpChatBot from './components/HelpChatBot';
import AssistantPanel from './components/AssistantPanel';
import {desktopAssistant} from './services/assistant.service';
import type {AssistantAction, FocusDraft} from './services/assistant.types';
import { AppView, StudentSeat, InterventionAlert, SynthesisTask } from './types';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { onAuthStateChanged, User, signOut } from './lib/firebase';
import { auth } from './lib/firebase';
import { dbService } from './services/db.service';
import { analytics } from './services/analytics.service';
import { AppLogo } from './components/AppLogo';

// Route-based Code Splitting: Lazy-load heavy views to keep initial bundle tiny (< 180 KB)
const LandingPage = lazy(() => import('./components/LandingPage'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const RegisterPage = lazy(() => import('./components/RegisterPage'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const HelpCenter = lazy(() => import('./components/HelpCenter'));
const CourseHub = lazy(() => import('./components/CourseHub'));
const CognitiveMap = lazy(() => import('./components/LearningDashboard')); 
const FocusChamber = lazy(() => import('./components/FocusChamber'));
const SOSToolkit = lazy(() => import('./components/SOSToolkit'));
const InsightsHub = lazy(() => import('./components/InsightsHub'));
const CohortTelemetry = lazy(() => import('./components/CohortTelemetry'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./components/TermsConditions'));
const NotFoundPage = lazy(() => import('./components/NotFoundPage'));

// High-fidelity fallback loading screen during view transitions
function ViewLoadingFallback(){return <AppLoading label="Opening your next view…"/>}

export default function App() {
  const assistantPrivacy=useAssistantPrivacy();
  const [currentView, setView] = useState<AppView>('landing');
  const [focusDraft, setFocusDraft] = useState<(FocusDraft & {account:string;context:string;privacyEpoch:number}) | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'mentor'>('student');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('los_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('los_theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(value => value === 'light' ? 'dark' : 'light');

  // Learner-reported difficulty and real classroom records
  const [cognitiveLoad, setCognitiveLoad] = useState<number>(42);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Student Tasks Checklist & Classroom data
  const [tasks, setTasks] = useState<SynthesisTask[]>([]);
  const [seats, setSeats] = useState<StudentSeat[]>([]);
  const [alerts, setAlerts] = useState<InterventionAlert[]>([]);

  const previousCompleted = useRef<Set<string> | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  useEffect(() => {
    const completed = new Set(tasks.filter(task => task.completed).map(task => task.id));
    if (userRole === 'student' && previousCompleted.current && [...completed].some(id => !previousCompleted.current!.has(id))) {
      setCelebrating(true);
    }
    previousCompleted.current = completed;
  }, [tasks, userRole]);
  useEffect(() => {
    if (!celebrating) return;
    const timeout = window.setTimeout(() => setCelebrating(false), 2600);
    return () => window.clearTimeout(timeout);
  }, [celebrating]);

  // Show customized action toast banner message
  const addNotification = (msg: string) => {
    if (currentView === 'chamber') return;
    setActiveNotification(msg);
  };

  // Close toast banner after 5s
  useEffect(() => {
    if (activeNotification) {
      const timer = setTimeout(() => {
        setActiveNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeNotification]);

  // Clear active notifications when entering Focus mode
  useEffect(() => {
    if (currentView === 'chamber') {
      setActiveNotification(null);
    }
  }, [currentView]);

  // Persist cognitive load changes back to DB (debounced 2s)
  useEffect(() => {
    if (!currentUser || !userProfile?.uid || userRole !== 'student') return;
    const timer = setTimeout(async () => {
      try {
        await dbService.updateUserProfile(currentUser.uid, { cognitiveLoad });
      } catch (err) {
        console.warn("Could not persist cognitive load:", err);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [cognitiveLoad, currentUser, userRole]);

  // Deep URL Hash Navigation and Browser History sync (Resolves broken links & direct navigation)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (!hash) return;
      const validViews: AppView[] = [
        'landing', 'about', 'courses', 'map', 'chamber', 'insights', 
        'cohort', 'sos', 'profile', 'settings', 'help', 'login', 'register', 
        'privacy', 'terms', '404'
      ];
      if (validViews.includes(hash as AppView)) {
        setView(hash as AppView);
      } else {
        setView('404');
      }
    };

    window.addEventListener('hashchange', handleHash);
    if (window.location.hash) {
      handleHash();
    }
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => { window.scrollTo({top:0, behavior:"instant"}); }, [currentView]);

  // Track pageviews & synchronize hash when currentView changes
  useEffect(() => {
    analytics.trackPageView(currentView);
    if (currentView !== 'splash') {
      const currentHash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (currentView === 'landing' && currentHash) {
        window.history.replaceState(null, '', window.location.pathname);
      } else if (currentView !== 'landing' && currentHash !== currentView) {
        window.location.hash = currentView;
      }
    }
  }, [currentView]);

  // Load current user profile and session synchronizations
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);setProfileError('');
        try {
          const profile = await dbService.getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
            const role = profile.role as 'student' | 'mentor';
            setUserRole(role);
            setCognitiveLoad(profile.cognitiveLoad ?? 50);

            setView(prev => {
              if (prev === 'login' || prev === 'landing') {
                return 'courses';
              }
              return prev;
            });
          } else {
            setUserProfile(null);setView('register');
          }
        } catch (error) {
          console.error("Failure synchronizing active profile:", error);
          setUserProfile(null);setProfileError('Your account is signed in, but learning records could not load. Check the server connection and retry.');
        }
      } else {
        setUserProfile(null);setCurrentUser(null);setProfileError('');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if(!currentUser || !auth.currentUser)return;
    let active=true;
    const stop=watchResource(['users'],()=>{void dbService.getUserProfile(currentUser.uid).then(profile=>{if(active && profile){setUserProfile(profile);setProfileError('')}}).catch(()=>{if(active)setProfileError('Learning records could not refresh. Please retry.')})});
    return()=>{active=false;stop()};
  },[currentUser?.uid]);

  useEffect(()=>{
    if(!currentUser)return;let active=true;
    const refresh=async()=>{try{
      if(userRole==='mentor'){
        const students=await dbService.getStudents(userProfile?.email);
        if(active)setSeats(students.map((student,index)=>({id:student.uid,name:student.fullName,load:student.cognitiveLoad ?? 50,state:(student.cognitiveLoad ?? 50)>80?'friction':'flow',preferredLanguage:student.preferredLanguage || 'English',avatarSeed:student.uid,row:Math.floor(index/4),col:index%4})));
      }else{const response=await apiFetch('/api/progress');if(response.ok){const progress=await response.json();if(active)setUserProfile((previous:any)=>({...previous,...progress}))}}
    }catch{if(active)addNotification('Live learning records could not be refreshed. Please retry.')}};
    void refresh();const stop=watchResource(['users','tasks'],()=>{void refresh()});return()=>{active=false;stop()};
  },[currentUser?.uid,userRole]);

  useEffect(()=>{
    const publicViews=['landing','about','privacy','terms','404','login','register','settings'];
    if(!authLoading && !currentUser && !publicViews.includes(currentView))setView('login');
  },[authLoading,currentUser,currentView]);

  useEffect(() => {void bindAssistantAccount(currentUser?.uid)}, [currentUser?.uid]);
  useEffect(() => {setFocusDraft(null)}, [currentUser?.uid, assistantPrivacy.clearEpoch]);
  function applyAssistantAction(action: AssistantAction) {
    if (action.name === 'open_view') {setView(action.arguments.view); return}
    if (!currentUser) {setView('login'); return}
    if(!assistantPrivacy.context || assistantPrivacy.account!==currentUser.uid)return;
    setFocusDraft({id: crypto.randomUUID(), ...action.arguments,account:currentUser.uid,context:assistantPrivacy.context.token,privacyEpoch:assistantPrivacy.clearEpoch}); setView('chamber');
  }
  const handleLogout = async () => {
    setFocusDraft(null);
    await desktopAssistant()?.reset().catch(() => {});
    try {
      localStorage.removeItem('los_demo_user'); // Retire legacy demo sessions; never restore them.
      await signOut(auth);
      setView('landing');
      addNotification("Session securely logged out.");
    } catch (err) {
      console.error("Logout anomaly:", err);
    }
  };


  // Views that don't need persistent app sidebar or top bar chrome
  if(profileError && currentUser && !['landing','about','privacy','terms','login','register','settings'].includes(currentView)) return <section className="real-form page-opening"><AppLogo className="w-14 h-14" showText={false}/><h1>Reconnect your space.</h1><p role="alert">{profileError}</p><button className="ink-button" onClick={()=>window.location.reload()}>Retry connection</button><button className="text-button" onClick={handleLogout}>Sign out</button></section>;
  const isDocumentOrLandingView = ['landing', 'about', 'privacy', 'terms', '404'].includes(currentView);

  return (
    <div data-role={userRole} className="relative min-h-screen bg-void-black text-on-surface">
      {celebrating && userRole === 'student' && <div className="quest-celebration" role="status"><span aria-hidden="true">â˜…</span><strong>Quest complete!</strong><small>One more step forward. Nicely done.</small>{Array.from({length:12},(_,i)=><i key={i} style={{'--piece':i} as React.CSSProperties} aria-hidden="true" />)}</div>}

      {/* GLOBAL SYSTEM STATUS HEAD BANNER INTERFACE */}
      <Navbar
        currentView={currentView}
        setView={setView}
        userRole={userRole}
        setUserRole={setUserRole}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeAlertCount={alerts.length}
        userName={userProfile?.fullName}
        onLogout={handleLogout}
      />

      {/* MAIN CONTAINER HOUSING SIDEBAR AND COMPONENT SHEETS */}
      <div className="pt-20 flex min-h-[92vh]">

        {/* Persistent Left Desktop Sidebar in authenticated/workspace views */}
        {!isDocumentOrLandingView && currentView !== 'login' && currentView !== 'register' && (
          <div className={`hidden md:block flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
            <Sidebar
              currentView={currentView}
              setView={setView}
              userRole={userRole}
              cognitiveLoad={cognitiveLoad}
              userName={userProfile?.fullName}
              onLogout={handleLogout}
              isOpen={isSidebarOpen}
              setIsOpen={setIsSidebarOpen}
            />
          </div>
        )}

        {/* Dynamic Main Workspace with Suspense code splitting */}
        <main key={currentView} className={`page-opening flex-1 w-full mx-auto transition-all ${
          !isDocumentOrLandingView && currentView !== 'login' && currentView !== 'register'
            ? 'study-workspace p-4 sm:p-6 md:p-10 max-w-[1440px]' 
            : 'p-0 w-full'
        }`}>
          <Suspense fallback={<ViewLoadingFallback />}>
            {currentView === 'landing' && (
              <LandingPage setView={setView} setUserRole={setUserRole} theme={theme} />
            )}

            {currentView === 'about' && (
              <AboutPage setView={setView} />
            )}

            {currentView === 'login' && (
              <LoginPage
                setView={setView}
                setUserRole={setUserRole}
                setUserProfile={setUserProfile}
                addNotification={addNotification}
              />
            )}

            {currentView === 'register' && (
              <RegisterPage
                setView={setView}
                setUserRole={setUserRole}
                setUserProfile={setUserProfile}
                addNotification={addNotification}
              />
            )}

            {currentView === 'privacy' && (
              <PrivacyPolicy setView={setView} />
            )}

            {currentView === 'terms' && (
              <TermsConditions setView={setView} />
            )}

            {currentView === '404' && (
              <NotFoundPage setView={setView} />
            )}

            {currentView === 'map' && (
              <CognitiveMap 
                setView={setView}
                tasks={tasks}
                setTasks={setTasks}
                cognitiveLoad={cognitiveLoad}
                setCognitiveLoad={setCognitiveLoad}
                onSosClick={() => setView('sos')}
                profile={userProfile}
              />
            )}

            {currentView === 'chamber' && (
              <FocusChamber 
                key={currentUser?.uid}
                setView={setView}
                draft={focusDraft?.account===currentUser?.uid && focusDraft?.context===assistantPrivacy.context?.token && focusDraft?.privacyEpoch===assistantPrivacy.clearEpoch?focusDraft:null}
                onDraftConsumed={() => setFocusDraft(null)}
              />
            )}

            {currentView === 'insights' && (
              <InsightsHub
                setView={setView}
                seats={seats}
                setSeats={setSeats}
                alerts={alerts}
                setAlerts={setAlerts}
                addNotification={addNotification}
              />
            )}

            {currentView === 'cohort' && (
              <CohortTelemetry
                setView={setView}
                seats={seats}
                setSeats={setSeats}
                alerts={alerts}
                setAlerts={setAlerts}
                addNotification={addNotification}
              />
            )}

            {currentView === 'sos' && (
              <SOSToolkit 
                setView={setView}
                cognitiveLoad={cognitiveLoad}
                setCognitiveLoad={setCognitiveLoad}
                addNotification={addNotification}
              />
            )}

            {currentView === 'profile' && (
              <ProfilePage
                setView={setView}
                userRole={userRole}
                userName={userProfile?.fullName}
                userProfile={userProfile}
              />
            )}

            {currentView === 'settings' && (
              <SettingsPage
                account={currentUser?.uid}
                setView={setView}
                userRole={userRole}
              />
            )}

            {currentView === 'courses' && (
              <CourseHub profile={userProfile} loading={authLoading} />
            )}

            {currentView === 'help' && (
              <HelpCenter
                setView={setView}
                userRole={userRole}
                uid={currentUser?.uid}
              />
            )}
          </Suspense>
        </main>
      </div>

      {desktopAssistant() ? <AssistantPanel account={currentUser?.uid} onApply={applyAssistantAction}/> : <HelpChatBot uid={currentUser?.uid} />}

      {/* FLOATING ACTION NOTIFICATION TOAST FEEDBACKS BANNER */}
      {activeNotification && currentView !== 'chamber' && (
        <div className="fixed bottom-6 left-6 z-50 glass-panel-heavy p-4 rounded-xl border-l-4 border-l-electric-cyan max-w-sm animate-[fadeIn_0.3s_ease-out] flex gap-3 shadow-xl shadow-electric-cyan/15 items-start justify-between">
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-full bg-electric-cyan/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4.5 h-4.5 text-electric-cyan" />
            </div>
            <div>
              <p className="font-sans font-bold text-xs text-on-surface">System Synchronized</p>
              <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
                {activeNotification}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveNotification(null)}
            className="text-on-surface-variant hover:text-on-surface p-0.5 rounded cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* COOKIES CONSENT BANNER (Item 6) */}
      <CookieConsent setView={setView} />

      {!isDocumentOrLandingView && currentView !== 'login' && currentView !== 'register' && <MobileNavigation currentView={currentView} setView={setView} userRole={userRole} />}

    </div>
  );
}
