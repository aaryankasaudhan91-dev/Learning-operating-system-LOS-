/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CookieConsent from './components/CookieConsent';
import SplashScreen from './components/SplashScreen';
import HelpChatBot from './components/HelpChatBot';
import { AppView, StudentSeat, InterventionAlert, SynthesisTask } from './types';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
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
const CognitiveMap = lazy(() => import('./components/CognitiveMap'));
const FocusChamber = lazy(() => import('./components/FocusChamber'));
const SOSToolkit = lazy(() => import('./components/SOSToolkit'));
const InsightsHub = lazy(() => import('./components/InsightsHub'));
const CohortTelemetry = lazy(() => import('./components/CohortTelemetry'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./components/TermsConditions'));
const NotFoundPage = lazy(() => import('./components/NotFoundPage'));

// High-fidelity fallback loading screen during view transitions
function ViewLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center select-none animate-[fadeIn_0.2s_ease-out]">
      <div className="relative">
        <AppLogo className="w-12 h-12 animate-pulse" showText={false} />
        <div className="absolute inset-0 rounded-full border border-electric-cyan/40 animate-ping pointer-events-none" />
      </div>
      <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-electric-cyan uppercase">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Calibrating Neural View...</span>
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setView] = useState<AppView>('landing');
  const [userRole, setUserRole] = useState<'student' | 'mentor'>('student');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Shared Live Simulation States
  const [cognitiveLoad, setCognitiveLoad] = useState<number>(42);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Student Tasks Checklist & Classroom data
  const [tasks, setTasks] = useState<SynthesisTask[]>([]);
  const [seats, setSeats] = useState<StudentSeat[]>([]);
  const [alerts, setAlerts] = useState<InterventionAlert[]>([]);

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
    if (!currentUser || userRole !== 'student') return;
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
    const demoUserStr = localStorage.getItem('los_demo_user');
    if (demoUserStr) {
      try {
        const demoData = JSON.parse(demoUserStr);
        setCurrentUser(demoData.user);
        setUserProfile(demoData.profile);
        const role = demoData.profile.role as 'student' | 'mentor';
        setUserRole(role);
        setCognitiveLoad(demoData.profile.cognitiveLoad || 50);

        if (role === 'mentor') {
          dbService.getStudents(demoData.profile.email).then(students => {
            if (students.length === 0) {
              const mockNames = ['Alex M.', 'Sarah K.', 'Elias V.', 'Jordan P.', 'Taylor S.', 'Casey R.', 'Morgan L.', 'Riley D.', 'Jamie C.', 'Quinn B.', 'Avery T.', 'Drew H.'];
              const mockStudents = mockNames.map((name, i) => {
                const load = i === 2 || i === 7 ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 50) + 30;
                return {
                  id: `mock-student-${i}`,
                  name: name,
                  load: load,
                  state: load > 80 ? 'friction' : (load > 60 ? 'engaged' : 'flow') as any,
                  preferredLanguage: 'English',
                  avatarSeed: name,
                  row: Math.floor(i / 4),
                  col: i % 4
                };
              });
              setSeats(mockStudents);
            } else {
              setSeats(students.map((s, idx) => ({
                id: s.uid,
                name: s.fullName || s.email,
                load: s.cognitiveLoad || 50,
                state: (s.cognitiveLoad || 50) > 80 ? 'friction' : 'flow',
                preferredLanguage: s.preferredLanguage || 'English',
                avatarSeed: s.fullName || s.email,
                row: Math.floor(idx / 4),
                col: idx % 4
              })));
            }
          });
        }
      } catch (err) {
        console.warn("Failed to parse demo session", err);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const profile = await dbService.getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
            const role = profile.role as 'student' | 'mentor';
            setUserRole(role);
            setCognitiveLoad(profile.cognitiveLoad || 45);

            setView(prev => {
              if (prev === 'login' || prev === 'landing') {
                return 'courses';
              }
              return prev;
            });
          } else {
            setUserProfile({ fullName: user.email?.split('@')[0] || 'User', email: user.email });
            setView(prev => (prev === 'login' || prev === 'landing' ? 'courses' : prev));
          }
        } catch (error) {
          console.error("Failure synchronizing active profile:", error);
          setView(prev => (prev === 'login' || prev === 'register' || prev === 'landing' ? 'courses' : prev));
        }
      } else {
        const demoUser = localStorage.getItem('los_demo_user');
        if (!demoUser) {
          setUserProfile(null);
          setCurrentUser(null);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('los_demo_user');
      await signOut(auth);
      setView('landing');
      addNotification("Session securely logged out.");
    } catch (err) {
      console.error("Logout anomaly:", err);
    }
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Views that don't need persistent app sidebar or top bar chrome
  const isDocumentOrLandingView = ['landing', 'about', 'privacy', 'terms', '404'].includes(currentView);

  return (
    <div className="relative min-h-screen bg-void-black text-on-surface">

      {/* GLOBAL SYSTEM STATUS HEAD BANNER INTERFACE */}
      <Navbar
        currentView={currentView}
        setView={setView}
        userRole={userRole}
        setUserRole={setUserRole}
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
        <main className={`flex-1 w-full mx-auto transition-all ${
          !isDocumentOrLandingView && currentView !== 'login' && currentView !== 'register'
            ? 'p-6 md:p-12 md:pl-6 max-w-[1440px]' 
            : 'p-0 w-full'
        }`}>
          <Suspense fallback={<ViewLoadingFallback />}>
            {currentView === 'landing' && (
              <LandingPage setView={setView} setUserRole={setUserRole} />
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
                setView={setView}
                setCognitiveLoad={setCognitiveLoad}
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

      <HelpChatBot uid={currentUser?.uid} />

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

      {/* MOBILE BOTTOM NAVIGATION BAR (Only for active workspace/dashboard views) */}
      {!isDocumentOrLandingView && currentView !== 'login' && currentView !== 'register' && (
        userRole === 'student' ? (
          <footer className="md:hidden fixed bottom-1.5 left-2 right-2 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-1.5 rounded-full backdrop-blur-2xl z-40 flex justify-around shadow-2xl">
            <button
              onClick={() => setView('courses')}
              className={`flex flex-col items-center p-2 rounded-full transition-all ${currentView === 'courses' ? 'text-electric-cyan bg-electric-cyan/10 font-bold' : 'text-on-surface-variant'}`}
            >
              <span className="text-[10px] font-sans uppercase px-2 py-0.5">Courses</span>
            </button>
            <button
              onClick={() => setView('map')}
              className={`flex flex-col items-center p-2 rounded-full transition-all ${currentView === 'map' ? 'text-electric-cyan bg-electric-cyan/10 font-bold' : 'text-on-surface-variant'}`}
            >
              <span className="text-[10px] font-sans uppercase px-2 py-0.5">Map</span>
            </button>
            <button
              onClick={() => setView('sos')}
              className={`flex flex-col items-center p-2 rounded-full transition-all ${currentView === 'sos' ? 'text-error bg-red-400/10 font-bold' : 'text-on-surface-variant'}`}
            >
              <span className="text-[10px] font-sans uppercase px-2 py-0.5">SOS</span>
            </button>
          </footer>
        ) : (
          <footer className="md:hidden fixed bottom-1.5 left-2 right-2 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-1.5 rounded-full backdrop-blur-2xl z-40 flex justify-around shadow-2xl">
            <button
              onClick={() => setView('courses')}
              className={`flex flex-col items-center p-2 rounded-full transition-all ${currentView === 'courses' ? 'text-plasma-violet bg-plasma-violet/10 font-bold' : 'text-on-surface-variant'}`}
            >
              <span className="text-[10px] font-sans uppercase px-2 py-0.5">Courses</span>
            </button>
            <button
              onClick={() => setView('insights')}
              className={`flex flex-col items-center p-2 rounded-full transition-all ${currentView === 'insights' ? 'text-plasma-violet bg-plasma-violet/10 font-bold' : 'text-on-surface-variant'}`}
            >
              <span className="text-[10px] font-sans uppercase px-2 py-0.5">Seat Matrix</span>
            </button>
          </footer>
        )
      )}

    </div>
  );
}
