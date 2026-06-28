/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AppView, UserProfile } from '../types';
import { authService } from '../services/auth.service';
import { dbService } from '../services/db.service';
import { AppLogo } from './AppLogo';

interface LoginPageProps {
  setView: (view: AppView) => void;
  setUserRole: (role: 'student' | 'mentor') => void;
  setUserProfile: (profile: any) => void;
  addNotification?: (msg: string) => void;
}

export default function LoginPage({ setView, setUserRole, setUserProfile, addNotification }: LoginPageProps) {
  const [cognitiveId, setCognitiveId] = useState('');
  const [secureSync, setSecureSync] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ... (Keep your existing canvas logic/useEffect here if you have it) ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      // Authenticate via service
      const userCredential = await authService.login(cognitiveId, secureSync);
      const user = userCredential.user;

      // Fetch accompanying user profile document from service
      let userData;
      try {
        userData = await dbService.getUserProfile(user.uid);
      } catch (err) {
        console.warn("Failed to fetch user profile", err);
      }

      if (userData) {
        const role = userData.role as 'student' | 'mentor';
        setUserProfile(userData);
        setUserRole(role);
        setView(role === 'student' ? 'map' : 'insights');
        if (addNotification) {
          addNotification(`Sync Successful. Verified as ${userData.fullName} (${role.toUpperCase()})`);
        }
      } else {
        // Fallback if the user profile hasn't finished replication
        // Since tab is removed, defaulting to 'student' and 'map'
        setUserRole('student');
        setView('map');
        if (addNotification) {
          addNotification(`Sync Complete. Connected as ${user.email}`);
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = err.message || 'Authentication sequence failed.';

      // Provide actionable feedback on common errors
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password Authentication is not enabled in Firebase. Please enable it in the Firebase Console.';
      } else if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-email'
      ) {
        msg = 'Invalid Cognitive credentials / Secure keys. Verify selection.';
      }

      setErrorMessage(msg);
      if (addNotification) {
        addNotification(`Sync Failure info: ${msg.slice(0, 50)}...`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'student' | 'mentor') => {
    setLoading(true);
    setErrorMessage(null);
    if (addNotification) {
      addNotification(`Initializing secure bypass protocols for Demo ${role.toUpperCase()}...`);
    }

    try {
      const demoUid = role === 'student' ? 'demo-student' : 'demo-mentor';
      const demoEmail = role === 'student' ? 'demo-student@example.com' : 'demo-mentor@example.com';
      const demoName = role === 'student' ? 'Alex Mercer (Demo Student)' : 'Dr. Clara Oswald (Demo Mentor)';

      // 1. Try to fetch this profile from backend database
      let profileData = await dbService.getUserProfile(demoUid);

      if (!profileData) {
        // 2. If it doesn't exist, create it in the database
        const defaultProfile: UserProfile = {
          uid: demoUid,
          fullName: demoName,
          email: demoEmail,
          role: role,
          specialty: role === 'student' ? 'Cognitive Explorer' : 'Cohort Architect',
          preferredLanguage: 'English (Default)',
          focusStreak: role === 'student' ? 5 : 0,
          bestFocusStreak: role === 'student' ? 12 : 0,
          taskCompletionRate: role === 'student' ? 85 : 0,
          dailyFocusGoal: 120,
          todayFocusMinutes: role === 'student' ? 45 : 0,
          cognitiveLoad: role === 'student' ? 42 : 50,
          teacherEmail: role === 'student' ? 'demo-mentor@example.com' : undefined,
          academicInfo: role === 'student' ? {
            level: 'high_secondary',
            className: '12',
            stream: 'Science',
            entranceExam: 'JEE'
          } : undefined,
          achievements: role === 'student' ? [
            { id: 'earlyBird', type: 'earlyBird', title: 'Early Bird', dateAwarded: new Date().toISOString() },
            { id: 'deepFocusMaster', type: 'deepFocusMaster', title: 'Deep Focus Master', dateAwarded: new Date().toISOString() }
          ] : [],
          createdAt: new Date().toISOString()
        };

        await dbService.createUserProfile(defaultProfile);
        profileData = defaultProfile;
      }

      // If logging in as a student, let's also ensure a mentor profile exists in the DB so they are linked
      if (role === 'student') {
        const mentorProfile = await dbService.getUserProfile('demo-mentor');
        if (!mentorProfile) {
          const defaultMentor: UserProfile = {
            uid: 'demo-mentor',
            fullName: 'Dr. Clara Oswald (Demo Mentor)',
            email: 'demo-mentor@example.com',
            role: 'mentor',
            specialty: 'Cohort Architect',
            preferredLanguage: 'English (Default)',
            focusStreak: 0,
            bestFocusStreak: 0,
            taskCompletionRate: 0,
            dailyFocusGoal: 120,
            todayFocusMinutes: 0,
            cognitiveLoad: 50,
            achievements: [],
            createdAt: new Date().toISOString()
          };
          await dbService.createUserProfile(defaultMentor);
        }
      } else {
        // Mentor: ensure the demo student and a couple of other demo students exist so the cohort dashboard is loaded
        const studentProfile = await dbService.getUserProfile('demo-student');
        if (!studentProfile) {
          const defaultStudent: UserProfile = {
            uid: 'demo-student',
            fullName: 'Alex Mercer (Demo Student)',
            email: 'demo-student@example.com',
            role: 'student',
            teacherEmail: 'demo-mentor@example.com',
            specialty: 'Cognitive Explorer',
            preferredLanguage: 'English (Default)',
            focusStreak: 5,
            bestFocusStreak: 12,
            taskCompletionRate: 85,
            dailyFocusGoal: 120,
            todayFocusMinutes: 45,
            cognitiveLoad: 42,
            academicInfo: {
              level: 'high_secondary',
              className: '12',
              stream: 'Science',
              entranceExam: 'JEE'
            },
            achievements: [
              { id: 'earlyBird', type: 'earlyBird', title: 'Early Bird', dateAwarded: new Date().toISOString() }
            ],
            createdAt: new Date().toISOString()
          };
          await dbService.createUserProfile(defaultStudent);
        }

        // Add 2 more demo students for a rich matrix
        const demoStudent2 = await dbService.getUserProfile('demo-student-2');
        if (!demoStudent2) {
          const student2: UserProfile = {
            uid: 'demo-student-2',
            fullName: 'Sarah Connor',
            email: 'sarah.c@example.com',
            role: 'student',
            teacherEmail: 'demo-mentor@example.com',
            specialty: 'Friction Solver',
            preferredLanguage: 'English',
            focusStreak: 2,
            bestFocusStreak: 4,
            taskCompletionRate: 40,
            dailyFocusGoal: 120,
            todayFocusMinutes: 10,
            cognitiveLoad: 89, // High load!
            achievements: [],
            createdAt: new Date().toISOString()
          };
          await dbService.createUserProfile(student2);
        }
        
        const demoStudent3 = await dbService.getUserProfile('demo-student-3');
        if (!demoStudent3) {
          const student3: UserProfile = {
            uid: 'demo-student-3',
            fullName: 'Marcus Vance',
            email: 'marcus.v@example.com',
            role: 'student',
            teacherEmail: 'demo-mentor@example.com',
            specialty: 'Flow State Master',
            preferredLanguage: 'English',
            focusStreak: 15,
            bestFocusStreak: 20,
            taskCompletionRate: 98,
            dailyFocusGoal: 180,
            todayFocusMinutes: 120,
            cognitiveLoad: 25, // Low load!
            achievements: [
              { id: 'deepFocusMaster', type: 'deepFocusMaster', title: 'Deep Focus Master', dateAwarded: new Date().toISOString() }
            ],
            createdAt: new Date().toISOString()
          };
          await dbService.createUserProfile(student3);
        }
      }

      // 3. Store the demo session in localStorage
      localStorage.setItem('los_demo_user', JSON.stringify({
        user: { uid: demoUid, email: demoEmail, emailVerified: true },
        profile: profileData
      }));

      // 4. Set state and views
      setUserProfile(profileData);
      setUserRole(role);
      setView(role === 'student' ? 'map' : 'insights');

      if (addNotification) {
        addNotification(`Demo Session Active. Verified as ${profileData.fullName} (${role.toUpperCase()})`);
      }
    } catch (err: any) {
      console.error("Demo login error:", err);
      setErrorMessage(err.message || "Bypass sequence failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-5 md:py-16 font-sans antialiased text-on-surface overflow-x-hidden relative selection:bg-electric-cyan selection:text-white">
      <style dangerouslySetInnerHTML={{
        __html: `
        .login-body {
            background-color: var(--color-void-black);
            background-image: radial-gradient(circle at 50% 50%, var(--color-nebula-purple) 0%, transparent 80%);
            background-attachment: fixed;
            background-size: 200vw 200vh;
            background-position: center;
        }

        .glass-panel-login {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04);
        }

        .ambient-glow-cyan {
            box-shadow: 0 0 40px rgba(2, 132, 199, 0.15);
        }
        
        .ambient-glow-cyan-active:active {
            box-shadow: 0 0 60px rgba(2, 132, 199, 0.25);
            transform: scale(0.98);
        }

        .glass-input-login {
            background: rgba(255, 255, 255, 0.85);
            color: var(--color-on-surface);
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .glass-input-login:focus {
            outline: none;
            border-color: var(--color-primary);
            box-shadow: 0 0 15px rgba(2, 132, 199, 0.2);
        }

        .font-geist { font-family: 'Geist', sans-serif; }
      ` }} />
      <div className="absolute inset-0 login-body -z-10" />

      {/* Interactive Background Particle Canvas */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none opacity-30" />

      {/* Main Container */}
      <main className="w-full max-w-md relative z-10 flex flex-col items-center my-auto">

        {/* Brand Header */}
        <header className="mb-10 text-center font-geist flex flex-col items-center gap-2">
          <AppLogo className="w-20 h-20 sm:w-24 sm:h-24 mb-4" showText={false} />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight text-on-surface">
            LOS
          </h1>
          <p className="font-mono text-xs text-on-surface-variant tracking-[0.2em] uppercase font-semibold mt-1">
            Cognitive Sync Protocol Active
          </p>
        </header>

        {/* Glassmorphic Login Card */}
        <div className="glass-panel-login w-full rounded-2xl p-8 relative overflow-hidden group">
          {/* Subtle internal glow highlight */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-electric-cyan rounded-full mix-blend-multiply filter blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"></div>

          {/* Animated Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-center mb-10 font-geist"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
              className="p-3 bg-surface-variant/30 rounded-full mb-4 border border-glass-stroke shadow-sm text-on-surface"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight"
            >
              Welcome Back
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-sm md:text-base text-on-surface-variant mt-2 text-center max-w-xs"
            >
              Please enter your credentials to access your account.
            </motion.p>

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 48, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5, ease: "easeInOut" }}
              className="h-1 bg-glass-stroke rounded-full mt-6"
            />
          </motion.div>

          {/* Login Form - Added subtle fade in after header finishes */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 font-geist relative z-10"
          >
            {errorMessage && (
              <div id="login-error-alert" className="p-3 rounded-lg bg-error-container border border-error/50 text-on-error-container font-medium text-xs flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
                <span className="material-symbols-outlined text-sm flex-shrink-0">report</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Cognitive ID */}
            <div className="flex flex-col gap-2">
              <label
                className="font-mono text-xs text-on-surface-variant font-semibold flex items-center gap-2 tracking-wide"
                htmlFor="cognitive-id"
              >
                <span className="material-symbols-outlined text-sm">fingerprint</span>
                Cognitive ID
              </label>
              <input
                id="cognitive-id"
                type="email"
                required
                value={cognitiveId}
                onChange={(e) => setCognitiveId(e.target.value)}
                placeholder="Enter identifier..."
                className="glass-input-login w-full px-4 py-3 rounded-lg text-on-surface text-base placeholder-on-surface-variant/50 focus:ring-0"
              />
            </div>

            {/* Secure Sync Key */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label
                  className="font-mono text-xs text-on-surface-variant font-semibold flex items-center gap-2 tracking-wide"
                  htmlFor="secure-sync"
                >
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Secure Sync
                </label>
                <button
                  type="button"
                  onClick={() => alert('Secure reset link dispatched to authorized cognitive address.')}
                  className="text-xs text-electric-cyan hover:text-on-surface transition-colors tracking-wide"
                >
                  Reset Link
                </button>
              </div>
              <input
                id="secure-sync"
                type="password"
                required
                value={secureSync}
                onChange={(e) => setSecureSync(e.target.value)}
                placeholder="••••••••"
                className="glass-input-login w-full px-4 py-3 rounded-lg text-on-surface text-base placeholder-on-surface-variant/50 focus:ring-0"
              />
            </div>

            {/* Actions */}
            <div className="pt-6 flex flex-col gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-gradient-to-r from-electric-cyan to-plasma-violet text-white text-sm font-bold uppercase tracking-widest ambient-glow-cyan ambient-glow-cyan-active transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Synchronizing Protocols...' : 'Initialize Sync'}</span>
                {loading ? (
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                )}
              </button>

              <div className="relative flex py-2 items-center opacity-50">
                <div className="flex-grow border-t border-glass-stroke"></div>
                <span className="flex-shrink-0 mx-4 text-on-surface-variant font-mono text-[10px] uppercase tracking-widest font-semibold">Or New Identity</span>
                <div className="flex-grow border-t border-glass-stroke"></div>
              </div>

              <button
                type="button"
                onClick={() => setView('register')}
                className="w-full py-4 rounded-full bg-transparent border border-glass-stroke backdrop-blur-md text-on-surface-variant text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black/5 hover:border-electric-cyan hover:text-on-surface hover:scale-[1.02] active:scale-95 transition-all group"
              >
                <span>Create Signature</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">how_to_reg</span>
              </button>

              <div className="relative flex py-2 items-center opacity-50">
                <div className="flex-grow border-t border-glass-stroke"></div>
                <span className="flex-shrink-0 mx-4 text-on-surface-variant font-mono text-[10px] uppercase tracking-widest font-semibold">Quick Demo Access</span>
                <div className="flex-grow border-t border-glass-stroke"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('student')}
                  className="py-3 px-2 rounded-xl bg-gradient-to-br from-electric-cyan/10 to-transparent border border-electric-cyan/30 text-electric-cyan text-[11px] font-bold uppercase tracking-wider hover:border-electric-cyan hover:bg-electric-cyan/20 hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center gap-1.5 justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">psychology</span>
                  <span>Demo Learner</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('mentor')}
                  className="py-3 px-2 rounded-xl bg-gradient-to-br from-plasma-violet/10 to-transparent border border-plasma-violet/30 text-plasma-violet text-[11px] font-bold uppercase tracking-wider hover:border-plasma-violet hover:bg-plasma-violet/20 hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center gap-1.5 justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">architecture</span>
                  <span>Demo Mentor</span>
                </button>
              </div>
            </div>
          </motion.form>
        </div>
      </main>

      {/* Minimalist Footer */}
      <footer className="mt-12 w-full pb-6 flex justify-center items-center gap-6 z-10 text-[10px] uppercase tracking-widest text-on-surface-variant font-mono opacity-60">
        <button
          type="button"
          onClick={() => alert('Access governed by Cognitive Sync Protocol. Dynamic auditing active.')}
          className="hover:text-electric-cyan transition-colors"
        >
          Protocol Terms
        </button>
        <span className="text-glass-stroke">|</span>
        <button
          type="button"
          onClick={() => alert('Neural connection normal. Operational latency: 14ms')}
          className="hover:text-electric-cyan transition-colors"
        >
          System Status
        </button>
      </footer>
    </div>
  );
}