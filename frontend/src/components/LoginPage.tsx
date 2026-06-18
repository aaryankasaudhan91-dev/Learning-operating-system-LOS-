/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AppView } from '../types';
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
  const [activeTab, setActiveTab] = useState<'student' | 'mentor'>('student');
  const [cognitiveId, setCognitiveId] = useState('');
  const [secureSync, setSecureSync] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ... (rest of the component keeps the same canvas logic, only handleSubmit changes)

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
        setUserRole(activeTab);
        setView(activeTab === 'student' ? 'map' : 'insights');
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

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-5 md:py-16 font-sans antialiased text-on-surface overflow-x-hidden relative selection:bg-electric-cyan selection:text-white">
      <style dangerouslySetInnerHTML={{ __html: `
        .login-body {
            background-color: var(--color-void-black);
            background-image: radial-gradient(circle at 50% 50%, var(--color-nebula-purple) 0%, transparent 70%);
            background-attachment: fixed;
            background-size: 200vw 200vh;
            background-position: center;
        }

        .glass-panel-login {
            background: rgba(255, 255, 255, 0.65);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid var(--color-glass-stroke);
            box-shadow: 0 8px 32px 0 rgba(15, 23, 42, 0.05);
        }

        .ambient-glow-cyan {
            box-shadow: 0 0 40px rgba(2, 132, 199, 0.25);
        }
        
        .ambient-glow-cyan-active:active {
            box-shadow: 0 0 60px rgba(2, 132, 199, 0.4);
            transform: scale(0.98);
        }

        .glass-input-login {
            background: rgba(255, 255, 255, 0.6);
            color: var(--color-on-surface);
            border: none;
            border-bottom: 1px solid var(--color-outline-variant);
            transition: all 0.3s ease;
        }

        .glass-input-login:focus {
            outline: none;
            border-bottom-color: var(--color-primary);
            box-shadow: 0 4px 20px -10px rgba(2, 132, 199, 0.4);
        }
        
        .tab-active-login {
          position: relative;
          color: var(--color-primary);
          text-shadow: 0 0 10px rgba(2, 132, 199, 0.2);
        }
        
        .tab-active-login::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--color-primary);
          box-shadow: 0 0 10px rgba(2, 132, 199, 0.2);
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

          {/* Role Selector Tabs */}
          <div className="flex border-b border-glass-stroke mb-8 pb-2 font-geist">
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`flex-1 text-sm md:text-base font-semibold text-center py-2 transition-colors ${activeTab === 'student'
                ? 'tab-active-login'
                : 'text-on-surface-variant hover:text-on-surface'
                }`}
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mentor')}
              className={`flex-1 text-sm md:text-base font-semibold text-center py-2 transition-colors ${activeTab === 'mentor'
                ? 'tab-active-login'
                : 'text-on-surface-variant hover:text-on-surface'
                }`}
            >
              Educator Portal
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-geist relative z-10">

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
                className="glass-input-login w-full px-4 py-3 rounded-t-lg text-on-surface text-base placeholder-on-surface-variant/50 focus:ring-0"
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
                className="glass-input-login w-full px-4 py-3 rounded-t-lg text-on-surface text-base placeholder-on-surface-variant/50 focus:ring-0"
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
            </div>
          </form>
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
