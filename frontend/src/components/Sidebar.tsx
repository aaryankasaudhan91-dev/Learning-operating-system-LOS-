/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Compass, Shield, Rocket, Activity, Sliders, LogOut, BookOpen, Lock } from 'lucide-react';
import { AppView } from '../types';
import { AppLogo } from './AppLogo';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  userRole: 'student' | 'mentor';
  cognitiveLoad: number;
  userName?: string;
  onLogout?: () => void;
}

export default function Sidebar({
  currentView,
  setView,
  userRole,
  cognitiveLoad,
  userName,
  onLogout
}: SidebarProps) {
  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-void-black/40 border-r border-glass-stroke backdrop-blur-2xl z-40 pt-28 pb-8 flex flex-col justify-between select-none">
      <div>
        {/* Core Profile Area */}
        <div className="px-6 mb-8 flex flex-col gap-2">
          <div 
            className="relative w-12 h-12 rounded-full border border-glass-stroke overflow-hidden flex items-center justify-center glow-violet bg-surface-container-high/60 group cursor-pointer"
            onClick={() => setView('profile')}
            title="View Cognitive Profile"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-plasma-violet/20 to-electric-cyan/20 animate-pulse" />
            <img 
              alt="System Avatar" 
              className="w-full h-full object-cover relative z-10 transition-transform duration-500 group-hover:scale-110" 
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200"
            />
          </div>
          <div className="mt-2 text-left cursor-pointer" onClick={() => setView('profile')}>
            <h2 className="font-sans font-bold text-base text-plasma-violet flex items-center gap-1.5 truncate max-w-[180px]" title={userName || 'Synapse Patient'}>
              {userName || (userRole === 'student' ? 'Student Account' : 'Mentor Account')}
              <span className="w-2 h-2 rounded-full bg-synapse-green flex-shrink-0 animate-pulse" />
            </h2>
            <p className="font-mono text-[9px] uppercase text-on-surface-variant tracking-wider mt-0.5">
              Role: {userRole === 'mentor' ? 'Certified Mentor' : 'Cognitive Student'}
            </p>
            {userRole === 'student' && (
              <p className="font-mono text-[9px] uppercase text-on-surface-variant tracking-wider">
                State: {cognitiveLoad > 80 ? 'Heavy Load' : 'Flow'} ({cognitiveLoad}%)
              </p>
            )}
          </div>

          {userRole === 'student' && (
            <button 
              onClick={() => setView(currentView === 'chamber' ? 'map' : 'chamber')}
              className="mt-4 w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-electric-cyan to-plasma-violet text-void-black font-semibold text-sm tracking-wide shadow-lg shadow-electric-cyan/20 hover:scale-[1.02] active:scale-95 transition-all text-center"
            >
              {currentView === 'chamber' ? 'Exit Silent Room' : 'Enter Chamber'}
            </button>
          )}
        </div>

        {/* Modular Navigation List */}
        <div id="sidebar-navigation-links" className="flex flex-col gap-1.5 px-4">
          {userRole === 'student' ? (
            <>
              <button
                onClick={() => setView('courses')}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  currentView === 'courses'
                    ? 'bg-secondary-container/20 text-secondary border-r-4 border-plasma-violet'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                <span>Course Hub</span>
              </button>

              <button
                onClick={() => setView('map')}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all group opacity-60 ${
                  currentView === 'map'
                    ? 'bg-secondary-container/20 text-secondary border-r-4 border-plasma-violet'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <Activity className="w-4 h-4 text-electric-cyan group-hover:scale-110 transition-transform" />
                  <Lock className="absolute -top-2 -right-2 w-2.5 h-2.5 text-on-surface-variant" />
                </div>
                <span>Cognitive Map</span>
              </button>

              <button
                onClick={() => setView('chamber')}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all group opacity-60 ${
                  currentView === 'chamber'
                    ? 'bg-secondary-container/20 text-secondary border-r-4 border-plasma-violet'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <Compass className="w-4 h-4 text-synapse-green group-hover:rotate-45 transition-transform" />
                  <Lock className="absolute -top-2 -right-2 w-2.5 h-2.5 text-on-surface-variant" />
                </div>
                <span>Focus Mode</span>
              </button>

              <button
                onClick={() => setView('sos')}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all group opacity-60 ${
                  currentView === 'sos'
                    ? 'bg-secondary-container/20 text-secondary border-r-4 border-plasma-violet'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <Sliders className="w-4 h-4 text-red-400 group-hover:rotate-90 transition-transform" />
                  <Lock className="absolute -top-2 -right-2 w-2.5 h-2.5 text-on-surface-variant" />
                </div>
                <span>SOS Panel</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setView('courses')}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  currentView === 'courses'
                    ? 'bg-secondary-container/20 text-secondary border-r-4 border-plasma-violet'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                <span>Course Hub</span>
              </button>

              <button
                onClick={() => setView('insights')}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all group opacity-60 ${
                  currentView === 'insights'
                    ? 'bg-secondary-container/20 text-secondary border-r-4 border-plasma-violet'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <Sliders className="w-4 h-4 text-plasma-violet group-hover:rotate-90 transition-transform" />
                  <Lock className="absolute -top-2 -right-2 w-2.5 h-2.5 text-on-surface-variant" />
                </div>
                <span>Seat Matrix</span>
              </button>

              <button
                onClick={() => setView('cohort')}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all group opacity-60 ${
                  currentView === 'cohort'
                    ? 'bg-secondary-container/20 text-secondary border-r-4 border-plasma-violet'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <Activity className="w-4 h-4 text-electric-cyan group-hover:scale-110 transition-transform" />
                  <Lock className="absolute -top-2 -right-2 w-2.5 h-2.5 text-on-surface-variant" />
                </div>
                <span>Cohort Telemetry</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer Settings & Support Controls */}
      <div className="px-4 flex flex-col gap-2 mt-auto">
          <button 
            onClick={onLogout || (() => {
              if (confirm("Execute Cognitive Dissociation Sync (Logout)? Your local session will be securely sealed.")) {
                setView('landing');
              }
            })}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors mt-2 text-sm font-semibold"
            title="Logout Session"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Dissociate Sync</span>
          </button>

          <div className="flex justify-around py-3 mt-2">
            <button 
              onClick={() => setView('settings')} 
              className="text-on-surface-variant hover:text-white transition-colors"
              title="System Preferences"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button 
              onClick={() => alert(`Contacting Synapse Support...\nEmergency Breathing Assistant available 24/7. Use SOS trigger directly for immediate grounding.`)} 
              className="text-on-surface-variant hover:text-white transition-colors"
              title="Documentation Help"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>
    </nav>
  );
}
