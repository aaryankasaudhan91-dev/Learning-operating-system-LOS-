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
            if (currentView !== 'landing') {
              setView('courses');
            }
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

        {/* Navigation moved to Sidebar */}
        {/* Authenticated Portal Badge & Active User Profile */}
        <div id="authenticated-user-profile" className={`flex items-center gap-4 ${currentView === 'landing' ? 'invisible' : ''}`}>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-glass-stroke bg-surface-container bg-opacity-40">
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
            {userName || (userRole === 'student' ? 'Student' : 'Mentor')}
          </div>

          <div className="flex items-center gap-2">
            <div
              onClick={() => setView('courses')}
              className="w-8 h-8 rounded-full border border-glass-stroke bg-surface-container flex items-center justify-center hover:border-electric-cyan hover:scale-105 transition-all cursor-pointer"
              title="Return to Dashboard"
            >
              {userRole === 'student' ? (
                <Brain className="w-4 h-4 text-electric-cyan" />
              ) : (
                <GraduationCap className="w-4 h-4 text-plasma-violet" />
              )}
            </div>

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
      </div>
    </nav>
  );
}
