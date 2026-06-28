/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import AboutPage from './components/AboutPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import HelpChatBot from './components/HelpChatBot';
import HelpCenter from './components/HelpCenter';
import CourseHub from './components/CourseHub';
import UnderConstruction from './components/UnderConstruction';
import CognitiveMap from './components/CognitiveMap';
import FocusChamber from './components/FocusChamber';
import SOSToolkit from './components/SOSToolkit';
import InsightsHub from './components/InsightsHub';
import CohortTelemetry from './components/CohortTelemetry';
import { AppView, StudentSeat, InterventionAlert, SynthesisTask } from './types';
import SplashScreen from './components/SplashScreen';
import { Sparkles, MessageSquare, Check, X, ShieldAlert, Heart, Loader2 } from 'lucide-react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { dbService } from './services/db.service';
import { taskService } from './services/task.service';

export default function App() {
  const [currentView, setView] = useState<AppView>('landing');
  const [userRole, setUserRole] = useState<'student' | 'mentor'>('student');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Shared Live Simulation States
  const [cognitiveLoad, setCognitiveLoad] = useState<number>(42); // Student default load
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Student Tasks Checklist
  const [tasks, setTasks] = useState<SynthesisTask[]>([]);

  // Student Classroom Seat data grid
  const [seats, setSeats] = useState<StudentSeat[]>([]);

  // Intervention alerts
  const [alerts, setAlerts] = useState<InterventionAlert[]>([]);

  // Show customized action toast banner message
  const addNotification = (msg: string) => {
    if (currentView === 'chamber') return; // Stop notifications in focus mode
    setActiveNotification(msg);
  };

  // Close toast banner
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

  // Synchronise Student workload changes dynamically into visual seats array to show deep sync
  // Realtime updates handled via components or services
  useEffect(() => {
    // Websocket hooks for real-time load will go here in production
  }, []);

  // Persist cognitive load changes back to MongoDB (debounced 2s)
  useEffect(() => {
    if (!currentUser || userRole !== 'student') return;
    const timer = setTimeout(async () => {
      try {
        await dbService.updateUserProfile(currentUser.uid, { cognitiveLoad });
        console.log("Persisted cognitiveLoad to DB:", cognitiveLoad);
      } catch (err) {
        console.warn("Could not persist cognitive load:", err);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [cognitiveLoad, currentUser, userRole]);

  // Load current user profile and session synchronizations
  useEffect(() => {
    // 1. Check if we have a demo session active
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
                  state: load > 75 ? 'friction' : 'flow',
                  preferredLanguage: i % 4 === 0 ? 'Spanish' : 'English',
                  avatarSeed: `mock-${i}`,
                  row: Math.floor(i / 6) + 1,
                  col: (i % 6) + 1
                };
              });
              setSeats(mockStudents);
            } else {
              setSeats(students.map((s: any, index) => ({
                id: s.uid,
                name: s.fullName || s.name || 'Student',
                load: s.cognitiveLoad || 50,
                state: (s.cognitiveLoad || 50) > 75 ? 'friction' : 'flow',
                preferredLanguage: 'English',
                avatarSeed: s.uid,
                row: Math.floor(index / 6) + 1,
                col: (index % 6) + 1
              })));
            }
          });
        } else {
          taskService.getStudentTasks(demoData.profile.uid, demoData.profile.email, demoData.profile.fullName).then(data => {
            setTasks(data.map((t: any) => ({
              id: t.id || Math.random().toString(),
              title: t.title || 'Untitled Task',
              moduleName: t.moduleName || 'General',
              estimatedMinutes: t.estimatedMinutes || 15,
              completed: t.status === 'completed'
            })));
          });
        }

        setView(prev => {
          if (prev === 'login' || prev === 'landing') {
            return 'courses';
          }
          return prev;
        });
        setAuthLoading(false);
        return; // Bypass normal Firebase listener setup
      } catch (err) {
        console.error("Failure restoring demo session:", err);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // If a demo user session was initiated concurrently, ignore Firebase auth changes
      if (localStorage.getItem('los_demo_user')) {
        setAuthLoading(false);
        return;
      }

      setCurrentUser(user);
      if (user) {
        try {
          let userDocData: any = null;
          try {
            const response = await fetch(`/api/users/${user.uid}`);
            if (response.ok) {
              userDocData = await response.json();
            } else if (response.status !== 404) {
              console.warn("Profile fetch error:", await response.text());
            }
          } catch (fetchError: any) {
            console.warn("Profile fetch warning (offline or unavailable):", fetchError.message);
          }

          if (userDocData) {
            setUserProfile(userDocData);
            const role = userDocData.role as 'student' | 'mentor';
            setUserRole(role);
            setCognitiveLoad(userDocData.cognitiveLoad || 50);

            if (role === 'mentor') {
              dbService.getStudents(user.email || '').then(students => {
                if (students.length === 0) {
                  // Fallback: Generate Mock Cohort if empty (fixes Heatmap empty state)
                  const mockNames = ['Alex M.', 'Sarah K.', 'Elias V.', 'Jordan P.', 'Taylor S.', 'Casey R.', 'Morgan L.', 'Riley D.', 'Jamie C.', 'Quinn B.', 'Avery T.', 'Drew H.'];
                  const mockStudents = mockNames.map((name, i) => {
                    const load = i === 2 || i === 7 ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 50) + 30; // High load for a couple
                    return {
                      id: `mock-student-${i}`,
                      name: name,
                      load: load,
                      state: load > 75 ? 'friction' : 'flow',
                      preferredLanguage: i % 4 === 0 ? 'Spanish' : 'English',
                      avatarSeed: `mock-${i}`,
                      row: Math.floor(i / 6) + 1,
                      col: (i % 6) + 1
                    };
                  });
                  setSeats(mockStudents);
                } else {
                  setSeats(students.map((s: any, index) => ({
                    id: s.uid,
                    name: s.fullName || s.name || 'Student',
                    load: s.cognitiveLoad || 50,
                    state: (s.cognitiveLoad || 50) > 75 ? 'friction' : 'flow',
                    preferredLanguage: 'English',
                    avatarSeed: s.uid,
                    row: Math.floor(index / 6) + 1,
                    col: (index % 6) + 1
                  })));
                }
              });
            } else {
              taskService.getStudentTasks(user.uid, user.email || '', userDocData.name || '').then(data => {
                setTasks(data.map((t: any) => ({
                  id: t.id || Math.random().toString(),
                  title: t.title || 'Untitled Task',
                  moduleName: t.moduleName || 'General',
                  estimatedMinutes: t.estimatedMinutes || 15,
                  completed: t.status === 'completed'
                })));
              });
            }

            // Route auth pages to Course Hub as the primary active view
            setView(prev => {
              if (prev === 'login' || prev === 'landing') {
                return 'courses';
              }
              return prev;
            });
          } else {
            // Profile backup standard
            setUserProfile({ fullName: user.email?.split('@')[0] || 'User', email: user.email });
            setView(prev => (prev === 'login' || prev === 'landing' ? 'courses' : prev));
          }
        } catch (error) {
          console.error("Failure synchronizing active profile:", error);
          setView(prev => (prev === 'login' || prev === 'register' || prev === 'landing' ? 'courses' : prev));
        }
      } else {
        setUserProfile(null);
        setView('landing');
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

  if (currentView === 'login') {
    return (
      <LoginPage
        setView={setView}
        setUserRole={setUserRole}
        setUserProfile={setUserProfile}
        addNotification={addNotification}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <RegisterPage
        setView={setView}
        setUserRole={setUserRole}
        setUserProfile={setUserProfile}
        addNotification={addNotification}
      />
    );
  }

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

      {/* DETAILED DOUBLE GRID LAYOUT HOUSING SIDEBAR AND COMPONENT SHEETS */}
      <div className="pt-20 flex min-h-[92vh]">

        {/* Render persistent Left Desktop Sidebar in high-fidelity control views */}
        {currentView !== 'landing' && currentView !== 'about' && (
          <div className="hidden md:block w-64 flex-shrink-0">
            <Sidebar
              currentView={currentView}
              setView={setView}
              userRole={userRole}
              cognitiveLoad={cognitiveLoad}
              userName={userProfile?.fullName}
              onLogout={handleLogout}
            />
          </div>
        )}

        {/* Dynamic Main Workspace display view */}
        <main className={`flex-1 w-full p-6 md:p-12 mx-auto max-w-[1440px] transition-all ${
          currentView !== 'landing' && currentView !== 'about' ? 'md:pl-6' : ''
        }`}>
          {currentView === 'landing' && (
            <LandingPage
              setView={setView}
              setUserRole={setUserRole}
            />
          )}

          {currentView === 'about' && (
            <AboutPage
              setView={setView}
            />
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
        </main>
      </div>

      <HelpChatBot uid={currentUser?.uid} />

      {/* FLOATING ACTION NOTIFICATION TOAST FEEDBACKS BANNER */}
      {activeNotification && currentView !== 'chamber' && (
        <div className="fixed bottom-6 left-6 z-50 glass-panel p-4 rounded-xl border-l-4 border-l-electric-cyan max-w-sm animate-[fadeIn_0.3s_ease-out] flex gap-3 shadow-lg shadow-electric-cyan/15 items-start justify-between">
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-full bg-electric-cyan/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4.5 h-4.5 text-electric-cyan" />
            </div>
            <div>
              <p className="font-sans font-bold text-xs text-white">System Synchronized</p>
              <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
                {activeNotification}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveNotification(null)}
            className="text-on-surface-variant hover:text-white p-0.5 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {userRole === 'student' ? (
        <footer className="md:hidden fixed bottom-1 left-1.5 right-1.5 bg-void-black/80 border border-glass-stroke p-1.5 rounded-full backdrop-blur-2xl z-40 flex justify-around shadow-2xl">
          <button
            onClick={() => { setView('courses'); }}
            className={`flex flex-col items-center p-2 rounded-full transition-all ${currentView === 'courses' ? 'text-electric-cyan bg-white/5' : 'text-on-surface-variant'}`}
          >
            <span className="text-[10px] font-sans font-extrabold uppercase px-1.5 py-0.5">Courses</span>
          </button>
          <button
            onClick={() => { setView('map'); }}
            className={`flex flex-col items-center p-2 rounded-full transition-all ${currentView === 'map' ? 'text-electric-cyan bg-white/5' : 'text-on-surface-variant'}`}
          >
            <span className="text-[10px] font-sans font-extrabold uppercase px-1.5 py-0.5">Map</span>
          </button>
          <button
            onClick={() => { setView('sos'); }}
            className={`flex flex-col items-center p-2 rounded-full transition-all ${currentView === 'sos' ? 'text-error bg-red-400/5' : 'text-on-surface-variant'}`}
          >
            <span className="text-[10px] font-sans font-extrabold uppercase px-1.5 py-0.5">SOS</span>
          </button>
        </footer>
      ) : (
        <footer className="md:hidden fixed bottom-1 left-1.5 right-1.5 bg-void-black/80 border border-glass-stroke p-1.5 rounded-full backdrop-blur-2xl z-40 flex justify-around shadow-2xl">
          <button
            onClick={() => { setView('courses'); }}
            className={`flex flex-col items-center p-2 rounded-full transition-all ${currentView === 'courses' ? 'text-plasma-violet bg-white/5' : 'text-on-surface-variant'}`}
          >
            <span className="text-[10px] font-sans font-extrabold uppercase px-2 py-0.5">Courses</span>
          </button>
          <button
            onClick={() => { setView('insights'); }}
            className={`flex flex-col items-center p-2 rounded-full transition-all ${currentView === 'insights' ? 'text-plasma-violet bg-white/5' : 'text-on-surface-variant'}`}
          >
            <span className="text-[10px] font-sans font-extrabold uppercase px-2 py-0.5">Seat Matrix</span>
          </button>
        </footer>
      )}

    </div>
  );
}
