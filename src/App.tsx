/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import HelpChatBot from './components/HelpChatBot';
import CourseHub from './components/CourseHub';
import UnderConstruction from './components/UnderConstruction';
import { AppView, StudentSeat, InterventionAlert, SynthesisTask } from './types';
import SplashScreen from './components/SplashScreen';
import { Sparkles, MessageSquare, Check, X, ShieldAlert, Heart, Loader2 } from 'lucide-react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { mockApi } from './services/api';

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

  // Initial Student Tasks Checklist matching Screen 2
  const [tasks, setTasks] = useState<SynthesisTask[]>([
    { id: 't1', title: "Review Dijkstra's Shortest Path Algorithm", moduleName: 'Graph Theory', estimatedMinutes: 15, completed: false },
    { id: 't2', title: "Complete Cognitive Knowledge Check", moduleName: 'Data Structures', estimatedMinutes: 5, completed: false },
    { id: 't3', title: "Verify Bhashini translation mode queries baseline", moduleName: 'Regional Dialect OS', estimatedMinutes: 8, completed: true }  
  ]);

  // Initial Student Classroom Seat data grid (6x4 = 24 seats) matching Screen 4
  const [seats, setSeats] = useState<StudentSeat[]>([
    { id: '1', name: 'Elias V.', load: 92, state: 'friction', preferredLanguage: 'Hindi-Dialect', avatarSeed: 'elias', row: 1, col: 1 },
    { id: '2', name: 'Sarah M.', load: 84, state: 'friction', preferredLanguage: 'English-Proxy', avatarSeed: 'sarah', row: 1, col: 2 },
    { id: '3', name: 'John Doe', load: 38, state: 'flow', preferredLanguage: 'Hindi-Dialect', avatarSeed: 'john', row: 1, col: 3 },
    { id: '4', name: 'Alice Smith', load: 81, state: 'low_motivation', preferredLanguage: 'Marathi-Context', avatarSeed: 'alice', row: 1, col: 4 },    
    { id: '5', name: 'Tony Stark', load: 45, state: 'deep_focus', preferredLanguage: 'English-Proxy', avatarSeed: 'tony', row: 1, col: 5 },
    { id: '6', name: 'Bruce B.', load: 50, state: 'engaged', preferredLanguage: 'English-Proxy', avatarSeed: 'bruce', row: 1, col: 6 },

    { id: '7', name: 'Natasha R.', load: 41, state: 'deep_focus', preferredLanguage: 'Hindi-Dialect', avatarSeed: 'natasha', row: 2, col: 1 },
    { id: '8', name: 'Clint B.', load: 30, state: 'flow', preferredLanguage: 'Marathi-Context', avatarSeed: 'clint', row: 2, col: 2 },
    { id: '9', name: 'Wanda M.', load: 88, state: 'friction', preferredLanguage: 'Hindi-Dialect', avatarSeed: 'wanda', row: 2, col: 3 },
    { id: '10', name: 'Peter P.', load: 49, state: 'flow', preferredLanguage: 'English-Proxy', avatarSeed: 'peter', row: 2, col: 4 },
    { id: '11', name: 'Steve R.', load: 32, state: 'engaged', preferredLanguage: 'English-Proxy', avatarSeed: 'steve', row: 2, col: 5 },
    { id: '12', name: 'Sam W.', load: 44, state: 'flow', preferredLanguage: 'Hindi-Dialect', avatarSeed: 'sam', row: 2, col: 6 },

    { id: '13', name: 'James B.', load: 39, state: 'deep_focus', preferredLanguage: 'Marathi-Context', avatarSeed: 'james', row: 3, col: 1 },
    { id: '14', name: 'Carol D.', load: 28, state: 'engaged', preferredLanguage: 'English-Proxy', avatarSeed: 'carol', row: 3, col: 2 },
    // Rest of seats initialized standard
    { id: '15', name: 'Scott L.', load: 41, state: 'flow', preferredLanguage: 'Hindi', avatarSeed: 'scott', row: 3, col: 3 },
    { id: '16', name: 'Hope V.', load: 36, state: 'deep_focus', preferredLanguage: 'English', avatarSeed: 'hope', row: 3, col: 4 },
    { id: '17', name: 'TChalla K.', load: 42, state: 'engaged', preferredLanguage: 'Hindi', avatarSeed: 'tc', row: 3, col: 5 },
    { id: '18', name: 'Shuri K.', load: 22, state: 'flow', preferredLanguage: 'Marathi', avatarSeed: 'shuri', row: 3, col: 6 },

    { id: '19', name: 'Stephen S.', load: 59, state: 'deep_focus', preferredLanguage: 'English', avatarSeed: 'stephen', row: 4, col: 1 },
    { id: '20', name: 'Wong L.', load: 31, state: 'engaged', preferredLanguage: 'Hindi', avatarSeed: 'wong', row: 4, col: 2 },
    { id: '21', name: 'Loki L.', load: 79, state: 'friction', preferredLanguage: 'English', avatarSeed: 'loki', row: 4, col: 3 },
    { id: '22', name: 'Sylvie L.', load: 38, state: 'flow', preferredLanguage: 'Marathi', avatarSeed: 'sylvie', row: 4, col: 5 },
    { id: '23', name: 'Thor O.', load: 52, state: 'engaged', preferredLanguage: 'Hindi', avatarSeed: 'thor', row: 4, col: 5 },
    { id: '24', name: 'Arthur P.', load: 48, state: 'deep_focus', preferredLanguage: 'English', avatarSeed: 'arthur', row: 4, col: 6 }
  ]);

  // Initial Intervention alerts matching Screen 4
  const [alerts, setAlerts] = useState<InterventionAlert[]>([
    { id: 'al1', studentName: 'Elias V.', condition: '92% Frustration', reason: 'Repeated compile sequence anomalies identified down Node Loop.', severity: 'high' },
    { id: 'al2', studentName: 'Sarah M.', condition: 'Exceeded Idle', reason: 'State inactivity detected for 15+ minutes in Focus Chamber.', severity: 'medium' }
  ]);

  // Show customized action toast banner message
  const addNotification = (msg: string) => {
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

  // Synchronise Student workload changes dynamically into visual seats array to show deep sync
  useEffect(() => {
    // Initialize Real-time Cognitive Telemetry Mock Stream
    mockApi.startTelemetryStream();

    // Subscribe to periodic load updates from the mock WebSocket
    const unsubscribe = mockApi.subscribeToCognitiveLoad((load) => {
      setCognitiveLoad(load);
    });

    return () => {
      unsubscribe();
      mockApi.stopTelemetryStream();
    };
  }, []);

  useEffect(() => {
    setSeats(prev => prev.map(seat => {
      // Elias V represents the synced student node in the simulation!
      if (seat.name === 'Elias V.') {
        return { ...seat, load: cognitiveLoad, state: cognitiveLoad > 75 ? 'friction' : 'flow' };
      }
      return seat;
    }));
  }, [cognitiveLoad]);

  // Load current user profile and session synchronizations
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
    if (confirm("Execute Cognitive Dissociation Sync (Logout)? Your local session will be securely sealed.")) {
      try {
        await signOut(auth);
        setView('landing');
        if (activeNotification) {
          setActiveNotification("Session securely logged out.");
        }
      } catch (err) {
        console.error("Logout anomaly:", err);
      }
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
        {currentView !== 'landing' && (
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
          currentView !== 'landing' ? 'md:pl-6' : ''
        }`}>
          {currentView === 'landing' && (
            <LandingPage
              setView={setView}
              setUserRole={setUserRole}
            />
          )}

          {currentView === 'map' && (
            <UnderConstruction setView={setView} featureName="Cognitive Map" />
          )}

          {currentView === 'chamber' && (
            <UnderConstruction setView={setView} featureName="Focus Chamber" />
          )}

          {currentView === 'insights' && (
            <UnderConstruction setView={setView} featureName="Insights Hub" />
          )}

          {currentView === 'cohort' && (
            <UnderConstruction setView={setView} featureName="Cohort Telemetry" />
          )}

          {currentView === 'sos' && (
            <UnderConstruction setView={setView} featureName="SOS Toolkit" />
          )}

          {currentView === 'profile' && (
            <ProfilePage
              setView={setView}
              userRole={userRole}
              userName={userProfile?.fullName}
            />
          )}

          {currentView === 'settings' && (
            <SettingsPage
              setView={setView}
              userRole={userRole}
            />
          )}

          {currentView === 'courses' && (
            <CourseHub />
          )}
        </main>
      </div>

      <HelpChatBot />

      {/* FLOATING ACTION NOTIFICATION TOAST FEEDBACKS BANNER */}
      {activeNotification && (
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
