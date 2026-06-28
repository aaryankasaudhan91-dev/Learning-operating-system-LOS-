/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Compass, Shield, Rocket, Activity, Sliders, LogOut, BookOpen, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppView } from '../types';
import { AppLogo } from './AppLogo';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  userRole: 'student' | 'mentor';
  cognitiveLoad: number;
  userName?: string;
  onLogout?: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({
  currentView,
  setView,
  userRole,
  cognitiveLoad,
  userName,
  onLogout,
  isOpen,
  setIsOpen
}: SidebarProps) {
  return (
    <nav className={`fixed left-0 top-0 h-full bg-void-black/40 border-r border-glass-stroke backdrop-blur-2xl z-40 pt-28 pb-8 flex flex-col justify-between select-none transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'} animate-slide-in-left`}>
      
      {/* Collapse Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-24 w-6 h-6 rounded-full border border-glass-stroke bg-surface-container-high hover:bg-surface-container-highest text-on-surface hover:text-electric-cyan hover:scale-110 active:scale-95 transition-all shadow-md z-50 flex items-center justify-center cursor-pointer"
        title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {isOpen ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>

      <div>
        {/* Core Profile Area */}
        <div className={`mb-8 flex flex-col gap-2 transition-all duration-300 ${isOpen ? 'px-6' : 'px-4 items-center'}`}>
          <div 
            className="relative w-12 h-12 rounded-full border border-glass-stroke overflow-hidden flex items-center justify-center glow-violet bg-surface-container-high/60 group cursor-pointer flex-shrink-0"
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
          
          <div className={`text-left cursor-pointer transition-all duration-300 origin-left ${isOpen ? 'opacity-100 h-auto scale-100 mt-2' : 'opacity-0 h-0 scale-75 overflow-hidden pointer-events-none'}`}>
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

          {userRole === 'student' && isOpen && (
            <button 
              onClick={() => setView(currentView === 'chamber' ? 'map' : 'chamber')}
              className="mt-4 w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-electric-cyan to-plasma-violet text-void-black font-semibold text-sm tracking-wide shadow-lg shadow-electric-cyan/20 hover:scale-[1.02] active:scale-95 transition-all text-center"
            >
              {currentView === 'chamber' ? 'Exit Silent Room' : 'Enter Chamber'}
            </button>
          )}
        </div>

        {/* Modular Navigation List */}
        <div id="sidebar-navigation-links" className={`flex flex-col gap-1.5 transition-all duration-300 ${isOpen ? 'px-4' : 'px-2'}`}>
          {userRole === 'student' ? (
            <>
              <button
                onClick={() => setView('courses')}
                title={isOpen ? "" : "Course Hub"}
                className={`flex items-center rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                  isOpen ? 'gap-4 px-4 py-3' : 'justify-center p-3'
                } ${
                  currentView === 'courses'
                    ? 'bg-secondary-container/20 text-secondary border-r-4 border-plasma-violet'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                {isOpen && <span>Course Hub</span>}
              </button>

              <button
                onClick={() => setView('map')}
                title={isOpen ? "" : "Cognitive Map"}
                className={`flex items-center rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                  isOpen ? 'gap-4 px-4 py-3' : 'justify-center p-3'
                } ${
                  currentView === 'map'
                    ? 'bg-secondary-container/20 text-secondary border-r-4 border-plasma-violet'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <Activity className="w-4 h-4 text-electric-cyan group-hover:scale-110 transition-transform" />
                {isOpen && <span>Cognitive Map</span>}
              </button>

              <button
                onClick={() => setView('chamber')}
                title={isOpen ? "" : "Focus Mode"}
                className={`flex items-center rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                  isOpen ? 'gap-4 px-4 py-3' : 'justify-center p-3'
                } ${
                  currentView === 'chamber'
                    ? 'bg-secondary-container/20 text-secondary border-r-4 border-plasma-violet'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <Compass className="w-4 h-4 text-synapse-green group-hover:rotate-45 transition-transform" />
                {isOpen && <span>Focus Mode</span>}
              </button>

              <button
                onClick={() => setView('sos')}
                title={isOpen ? "" : "SOS Panel"}
                className={`flex items-center rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                  isOpen ? 'gap-4 px-4 py-3' : 'justify-center p-3'
                } ${
                  currentView === 'sos'
                    ? 'bg-secondary-container/20 text-secondary border-r-4 border-plasma-violet'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <Sliders className="w-4 h-4 text-red-400 group-hover:rotate-90 transition-transform" />
                {isOpen && <span>SOS Panel</span>}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setView('courses')}
                title={isOpen ? "" : "Course Hub"}
                className={`flex items-center rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                  isOpen ? 'gap-4 px-4 py-3' : 'justify-center p-3'
                } ${
                  currentView === 'courses'
                    ? 'bg-secondary-container/20 text-secondary border-r-4 border-plasma-violet'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                {isOpen && <span>Course Hub</span>}
              </button>

              <button
                onClick={() => setView('insights')}
                title={isOpen ? "" : "Seat Matrix"}
                className={`flex items-center rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                  isOpen ? 'gap-4 px-4 py-3' : 'justify-center p-3'
                } ${
                  currentView === 'insights'
                    ? 'bg-secondary-container/20 text-secondary border-r-4 border-plasma-violet'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <Sliders className="w-4 h-4 text-plasma-violet group-hover:rotate-90 transition-transform" />
                {isOpen && <span>Seat Matrix</span>}
              </button>

              <button
                onClick={() => setView('cohort')}
                title={isOpen ? "" : "Cohort Telemetry"}
                className={`flex items-center rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                  isOpen ? 'gap-4 px-4 py-3' : 'justify-center p-3'
                } ${
                  currentView === 'cohort'
                    ? 'bg-secondary-container/20 text-secondary border-r-4 border-plasma-violet'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <Activity className="w-4 h-4 text-electric-cyan group-hover:scale-110 transition-transform" />
                {isOpen && <span>Cohort Telemetry</span>}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer Settings & Support Controls */}
      <div className={`flex flex-col gap-2 mt-auto transition-all duration-300 ${isOpen ? 'px-4' : 'px-2'}`}>
        <button 
          onClick={onLogout || (() => {
            setView('landing');
          })}
          className={`flex items-center justify-center border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all mt-2 text-sm font-semibold cursor-pointer ${
            isOpen ? 'w-full py-2.5 gap-2 rounded-lg' : 'w-12 h-12 p-0 mx-auto rounded-xl'
          }`}
          title="Logout Session"
        >
          <LogOut className="w-4 h-4 text-red-400 flex-shrink-0" />
          {isOpen && <span>Dissociate Sync</span>}
        </button>

        <div className={`flex mt-2 transition-all ${isOpen ? 'justify-around py-3' : 'flex-col items-center gap-4 py-2'}`}>
          <button 
            onClick={() => setView('settings')} 
            className="text-on-surface-variant hover:text-white transition-colors cursor-pointer"
            title="System Preferences"
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('help')} 
            className={`transition-colors p-1.5 rounded-lg border cursor-pointer ${
              currentView === 'help' 
                ? 'text-plasma-violet border-plasma-violet/40 bg-plasma-violet/10' 
                : 'text-on-surface-variant hover:text-white border-transparent'
            }`}
            title="Help Center"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
