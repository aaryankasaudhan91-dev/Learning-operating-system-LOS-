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
    <div className="login-page-root bg-[#f8f9ff] text-[#161b24] min-h-screen w-full flex flex-col justify-center items-center relative overflow-hidden select-none font-sans">
      {/* Scope-specific custom stylesheet to perfectly render Mockup's styling inside the light container */}
      <style dangerouslySetInnerHTML={{ __html: `
        .login-page-root {
          font-family: 'Geist', sans-serif;
        }

        .ambient-orb-login {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          z-index: 1;
          opacity: 0.4;
          animation: pulse-slow-login 8s infinite alternate ease-in-out;
          pointer-events: none;
        }

        .orb-cyan-login {
          background-color: #cbdbf5;
          width: 40vw;
          height: 40vw;
          top: 10%;
          left: 5%;
        }

        .orb-violet-login {
          background-color: #f4d9ff;
          width: 50vw;
          height: 50vw;
          bottom: -10%;
          right: -10%;
        }

        @keyframes pulse-slow-login {
          0% { transform: scale(1) translate(0, 0); opacity: 0.2; }
          100% { transform: scale(1.1) translate(20px, -20px); opacity: 0.5; }
        }

        /* Glassmorphism Classes */
        .glass-panel-login {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.04);
        }

        /* Form Inputs */
        .ethereal-input-login {
          background: rgba(255, 255, 255, 0.5);
          border: none;
          border-bottom: 2px solid #c0c7d5;
          transition: all 0.3s ease;
        }
        
        .ethereal-input-login:focus {
          outline: none;
          border-bottom-color: #0f5fb2;
          box-shadow: 0 10px 20px -10px rgba(15, 95, 178, 0.15);
          background: rgba(255, 255, 255, 0.8);
        }

        /* Buttons */
        .btn-primary-glow-login {
          background: #0f5fb2;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(15, 95, 178, 0.3);
          transition: all 0.3s ease;
        }
        
        .btn-primary-glow-login:hover {
          box-shadow: 0 6px 20px rgba(15, 95, 178, 0.4);
          transform: scale(1.02);
          background: #004789;
        }
        
        .btn-ghost-glass-login {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid #c0c7d5;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          color: #161b24;
        }
        
        .btn-ghost-glass-login:hover {
          background: rgba(255, 255, 255, 0.8);
          border-color: #717784;
          transform: scale(1.02);
        }

        /* Active Tab Underline */
        .tab-active-login {
          position: relative;
          color: #0f5fb2;
        }
        
        .tab-active-login::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #0f5fb2;
          box-shadow: 0 0 10px rgba(15, 95, 178, 0.3);
        }
      ` }} />

      {/* Interactive Background Particle Canvas */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none" />

      {/* Ambient Radial Glows */}
      <div className="ambient-orb-login orb-cyan-login" />
      <div className="ambient-orb-login orb-violet-login" />

      {/* Main Container */}
      <main className="w-full max-w-md px-5 md:px-0 z-10 flex flex-col items-center">
        
        {/* Brand Header */}
        <header className="mb-8 text-center flex flex-col items-center gap-2">
          <AppLogo className="w-16 h-16 sm:w-20 sm:h-20 mb-4" />
          <p className="font-mono text-xs text-[#414753] tracking-widest uppercase font-semibold mt-2">
            Cognitive Sync Protocol Active
          </p>
        </header>

        {/* Glassmorphic Login Card */}
        <div className="glass-panel-login w-full rounded-2xl p-8 relative overflow-hidden group">
          {/* Subtle internal glow highlight */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/40 rounded-full blur-3xl group-hover:bg-white/60 transition-all duration-700"></div>

          {/* Role Selector Tabs */}
          <div className="flex border-b border-[rgba(0,0,0,0.1)] mb-8 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`flex-1 text-sm md:text-base font-semibold text-center py-2 transition-colors ${
                activeTab === 'student'
                  ? 'tab-active-login'
                  : 'text-[#414753] hover:text-[#161b24]'
              }`}
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mentor')}
              className={`flex-1 text-sm md:text-base font-semibold text-center py-2 transition-colors ${
                activeTab === 'mentor'
                  ? 'tab-active-login'
                  : 'text-[#414753] hover:text-[#161b24]'
              }`}
            >
              Educator Portal
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {errorMessage && (
              <div id="login-error-alert" className="p-3 rounded-lg bg-red-50/90 border border-red-200 text-red-700 font-medium text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-sm flex-shrink-0 text-red-500">report_gmailerrorred</span>
                <span>{errorMessage}</span>
              </div>
            )}
            
            {/* Cognitive ID */}
            <div className="flex flex-col gap-2">
              <label 
                className="font-mono text-xs text-[#161b24] font-semibold flex items-center gap-2" 
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
                className="ethereal-input-login w-full px-4 py-3 rounded-t-lg text-[#161b24] text-base focus:ring-0 placeholder:text-[#cbd5e1] border-none"
              />
            </div>

            {/* Secure Sync Key */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label 
                  className="font-mono text-xs text-[#161b24] font-semibold flex items-center gap-2" 
                  htmlFor="secure-sync"
                >
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Secure Sync
                </label>
                <button
                  type="button"
                  onClick={() => alert('Secure reset link dispatched to authorized cognitive address.')}
                  className="text-xs text-[#0f5fb2] hover:text-[#004789] transition-colors"
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
                className="ethereal-input-login w-full px-4 py-3 rounded-t-lg text-[#161b24] text-base focus:ring-0 placeholder:text-[#cbd5e1] border-none"
              />
             </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col gap-4">
              <button 
                type="submit"
                disabled={loading}
                className="btn-primary-glow-login w-full py-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Synchronizing Protocols...' : 'Initialize Sync'}</span>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined">arrow_forward</span>
                )}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[rgba(0,0,0,0.1)]"></div>
                <span className="flex-shrink-0 mx-4 text-[#414753] font-mono text-xs font-semibold">OR</span>
                <div className="flex-grow border-t border-[rgba(0,0,0,0.1)]"></div>
              </div>

              <button
                type="button"
                onClick={() => setView('register')}
                className="btn-ghost-glass-login w-full py-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2 group"
              >
                <span>Create Signature</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">how_to_reg</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Minimalist Footer */}
      <footer className="fixed bottom-0 w-full p-6 flex justify-center items-center gap-6 z-10 text-xs text-[#414753]">
        <button
          type="button"
          onClick={() => alert('Access governed by Cognitive Sync Protocol. Dynamic auditing active.')}
          className="hover:text-[#0f5fb2] transition-colors flex items-center gap-1 font-semibold"
        >
          <span className="material-symbols-outlined text-[14px]">policy</span>
          Privacy Protocol
        </button>
        <span className="text-gray-300">|</span>
        <button
          type="button"
          onClick={() => alert('Neural connection normal. Operational latency: 14ms')}
          className="hover:text-[#0f5fb2] transition-colors flex items-center gap-1 font-semibold"
        >
          <span className="material-symbols-outlined text-[14px]">support_agent</span>
          Neural Support
        </button>
      </footer>
    </div>
  );
}
