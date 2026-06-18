/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Brain, GraduationCap, Compass, ShieldAlert, Sliders, LogOut, Lock } from 'lucide-react';
import { AppView } from '../types';
import { AppLogo } from './AppLogo';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  userRole: 'student' | 'mentor';
  setUserRole: (role: 'student' | 'mentor') => void;
  activeAlertCount: number;
  userName?: string;
  onLogout?: () => void;
}

export default function Navbar({
  currentView,
  setView,
  userRole,
  setUserRole,
  activeAlertCount,
  userName,
  onLogout
}: NavbarProps) {

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-void-black/40 border-b border-glass-stroke backdrop-blur-xl">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex justify-between items-center">
        {/* Brand Logo */}
        <div
          onClick={() => {
            setView(userName ? 'courses' : 'landing');
          }}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="group-hover:scale-105 transition-transform">
            <AppLogo className="w-10 h-10" showText={false} />
          </div>
          <span className="font-sans font-bold text-xl tracking-tight text-on-surface group-hover:text-electric-cyan transition-colors mt-1">
            LOS
          </span>
        </div>

        {/* Center Public Links */}
        {(currentView === 'landing' || currentView === 'about') && (
          <div className="flex items-center gap-6 md:gap-8 font-sans text-sm font-semibold">
            <button
              onClick={() => setView('landing')}
              className={`hover:text-electric-cyan transition-colors cursor-pointer ${currentView === 'landing' ? 'text-electric-cyan' : 'text-on-surface-variant'}`}
            >
              Home
            </button>
            <button
              onClick={() => setView('about')}
              className={`hover:text-electric-cyan transition-colors cursor-pointer ${currentView === 'about' ? 'text-electric-cyan' : 'text-on-surface-variant'}`}
            >
              About Us
            </button>
          </div>
        )}

        {/* Right side controls */}
        {userName ? (
          /* Authenticated User Actions */
          <div id="authenticated-user-profile" className="flex items-center gap-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-glass-stroke bg-surface-container bg-opacity-40">
              {userRole === 'student' ? (
                <>
                  <Brain className="w-3.5 h-3.5 text-electric-cyan animate-pulse" />
                  <span className="text-electric-cyan font-bold tracking-wider">STUDENT PORTAL</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-plasma-violet animate-pulse" />
                  <span className="text-plasma-violet font-bold tracking-wider">MENTOR PORTAL</span>
                </>
              )}
            </div>

            {/* User Name Display */}
            <div className="hidden sm:block font-sans text-xs font-medium text-on-surface-variant bg-white/5 px-3 py-1.5 rounded-lg border border-glass-stroke">
              {userName}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('courses')}
                className="px-4 py-1.5 rounded-full border border-glass-stroke bg-surface-container flex items-center justify-center gap-1.5 text-xs font-bold text-on-surface hover:border-electric-cyan hover:scale-105 transition-all cursor-pointer"
                title="Return to Dashboard"
              >
                {userRole === 'student' ? (
                  <>
                    <Brain className="w-3.5 h-3.5 text-electric-cyan" />
                    <span>Dashboard</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-plasma-violet" />
                    <span>Portal</span>
                  </>
                )}
              </button>

              {/* Logout Trigger */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-8 h-8 rounded-full border border-glass-stroke bg-red-900/10 flex items-center justify-center text-red-400 hover:text-red-300 hover:border-red-500 hover:scale-105 transition-all cursor-pointer"
                  title="Secure Logout Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Unauthenticated Public Actions */
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('login')}
              className="text-xs md:text-sm text-on-surface-variant hover:text-on-surface font-semibold px-3 py-2 cursor-pointer transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => setView('register')}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-electric-cyan to-plasma-violet text-white text-xs md:text-sm font-bold tracking-wide hover:scale-105 hover:shadow-[0_0_20px_rgba(2,132,199,0.3)] active:scale-95 transition-all cursor-pointer"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
