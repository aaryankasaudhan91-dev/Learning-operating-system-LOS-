/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Brain, GraduationCap, Compass, ShieldAlert, Sliders, LogOut, Lock, Menu, X, BookOpen, Shield } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: AppView) => {
    setView(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 dark:bg-slate-950/95 border-b border-slate-200/90 dark:border-slate-800 backdrop-blur-xl shadow-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 h-20 flex justify-between items-center">
        
        {/* Brand Logo */}
        <div
          onClick={() => handleNav(userName ? 'courses' : 'landing')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="group-hover:scale-105 transition-transform">
            <AppLogo className="w-10 h-10" showText={false} />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-black text-xl tracking-tight text-on-surface group-hover:text-electric-cyan transition-colors leading-none">
              LOS
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">
              Learner OS
            </span>
          </div>
        </div>

        {/* Center Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 font-sans text-sm font-semibold">
          <button
            onClick={() => handleNav('landing')}
            className={`hover:text-electric-cyan transition-colors cursor-pointer py-1 ${
              currentView === 'landing' ? 'text-electric-cyan border-b-2 border-electric-cyan font-bold' : 'text-on-surface-variant'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('about')}
            className={`hover:text-electric-cyan transition-colors cursor-pointer py-1 ${
              currentView === 'about' ? 'text-electric-cyan border-b-2 border-electric-cyan font-bold' : 'text-on-surface-variant'
            }`}
          >
            About Us
          </button>
          <button
            onClick={() => handleNav('courses')}
            className={`hover:text-electric-cyan transition-colors cursor-pointer py-1 ${
              currentView === 'courses' ? 'text-electric-cyan border-b-2 border-electric-cyan font-bold' : 'text-on-surface-variant'
            }`}
          >
            Curriculum
          </button>
          <button
            onClick={() => handleNav('help')}
            className={`hover:text-electric-cyan transition-colors cursor-pointer py-1 ${
              currentView === 'help' ? 'text-electric-cyan border-b-2 border-electric-cyan font-bold' : 'text-on-surface-variant'
            }`}
          >
            Help &amp; FAQ
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {userName ? (
            /* Authenticated User Actions */
            <div id="authenticated-user-profile" className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80">
                {userRole === 'student' ? (
                  <>
                    <Brain className="w-3.5 h-3.5 text-electric-cyan animate-pulse" />
                    <span className="text-electric-cyan font-bold tracking-wider">STUDENT</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-plasma-violet animate-pulse" />
                    <span className="text-plasma-violet font-bold tracking-wider">MENTOR</span>
                  </>
                )}
              </div>

              <div className="hidden sm:block font-sans text-xs font-medium text-on-surface-variant bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 truncate max-w-[140px]">
                {userName}
              </div>

              <button
                onClick={() => handleNav('courses')}
                className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center gap-1.5 text-xs font-bold text-on-surface hover:border-electric-cyan hover:scale-105 transition-all cursor-pointer shadow-xs"
                title="Return to Dashboard"
              >
                {userRole === 'student' ? (
                  <>
                    <Brain className="w-3.5 h-3.5 text-electric-cyan" />
                    <span className="hidden xs:inline">Dashboard</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-plasma-violet" />
                    <span className="hidden xs:inline">Portal</span>
                  </>
                )}
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-9 h-9 rounded-full border border-red-500/30 bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500 hover:text-red-600 hover:border-red-500 hover:scale-105 transition-all cursor-pointer"
                  title="Logout Session"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* Unauthenticated Public Actions */
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => handleNav('login')}
                className="text-xs md:text-sm text-on-surface font-semibold px-3 py-2 cursor-pointer hover:text-electric-cyan transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => handleNav('register')}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-electric-cyan via-plasma-violet to-synapse-green text-white text-xs md:text-sm font-bold tracking-wide hover:scale-105 hover:shadow-[0_0_20px_rgba(2,132,199,0.35)] active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile menu toggle hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-on-surface hover:text-electric-cyan cursor-pointer transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-6 space-y-4 animate-[fadeIn_0.2s_ease-out] shadow-xl">
          <div className="flex flex-col space-y-3 font-sans text-sm font-semibold text-left">
            <button
              onClick={() => handleNav('landing')}
              className={`p-2 rounded-lg text-left ${currentView === 'landing' ? 'bg-electric-cyan/10 text-electric-cyan font-bold' : 'text-on-surface'}`}
            >
              Home Portal
            </button>
            <button
              onClick={() => handleNav('about')}
              className={`p-2 rounded-lg text-left ${currentView === 'about' ? 'bg-electric-cyan/10 text-electric-cyan font-bold' : 'text-on-surface'}`}
            >
              About Philosophy
            </button>
            <button
              onClick={() => handleNav('courses')}
              className={`p-2 rounded-lg text-left ${currentView === 'courses' ? 'bg-electric-cyan/10 text-electric-cyan font-bold' : 'text-on-surface'}`}
            >
              Curriculum Hub
            </button>
            <button
              onClick={() => handleNav('help')}
              className={`p-2 rounded-lg text-left ${currentView === 'help' ? 'bg-electric-cyan/10 text-electric-cyan font-bold' : 'text-on-surface'}`}
            >
              Help &amp; FAQ
            </button>
            <button
              onClick={() => handleNav('privacy')}
              className={`p-2 rounded-lg text-left ${currentView === 'privacy' ? 'bg-electric-cyan/10 text-electric-cyan font-bold' : 'text-on-surface-variant'}`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleNav('terms')}
              className={`p-2 rounded-lg text-left ${currentView === 'terms' ? 'bg-electric-cyan/10 text-electric-cyan font-bold' : 'text-on-surface-variant'}`}
            >
              Terms &amp; Conditions
            </button>
          </div>

          {!userName && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
              <button
                onClick={() => handleNav('login')}
                className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-on-surface font-bold text-sm text-center"
              >
                Log In
              </button>
              <button
                onClick={() => handleNav('register')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-electric-cyan to-plasma-violet text-white font-bold text-sm text-center shadow-md"
              >
                Register Signature
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
