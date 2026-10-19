/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Compass, Home, BookOpen, LifeBuoy, ArrowLeft, RefreshCw } from 'lucide-react';
import { AppView } from '../types';
import { AppLogo } from './AppLogo';

interface NotFoundPageProps {
  setView: (view: AppView) => void;
}

export default function NotFoundPage({ setView }: NotFoundPageProps) {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-6 py-16 animate-[fadeIn_0.3s_ease-out]">
      {/* Visual Glitch / Error Node Illustration */}
      <div className="relative mb-8">
        <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-error/20 via-plasma-violet/15 to-electric-cyan/20 border border-glass-stroke flex items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-radial from-error/15 to-transparent animate-pulse" />
          <AppLogo className="w-16 h-16 opacity-80" showText={false} />
        </div>

        {/* Floating 404 badge */}
        <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-error text-white font-mono text-xs font-black uppercase tracking-widest shadow-lg">
          Error 404
        </div>
      </div>

      {/* Headline & Description */}
      <div className="max-w-xl space-y-3 mb-10">
        <span className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-error px-3 py-1 rounded-full bg-error/10 inline-block">
          Synapse Misdirection // Route Null
        </span>

        <h1 className="font-sans font-black text-3xl md:text-5xl text-on-surface uppercase tracking-tight">
          Cognitive Path Not Found
        </h1>

        <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed">
          The requested coordinate or module address does not exist, has undergone memory decay, or requires authorized security synchronization.
        </p>
      </div>

      {/* Quick Action Pathways */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-12">
        <button
          onClick={() => setView('landing')}
          className="p-5 rounded-2xl glass-panel border border-glass-stroke hover:border-electric-cyan hover:scale-[1.02] transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-electric-cyan/15 flex items-center justify-center text-electric-cyan mb-3 group-hover:scale-110 transition-transform">
            <Home className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-sm text-on-surface">Home Portal</h2>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">Return to public overview</p>
          </div>
        </button>

        <button
          onClick={() => setView('courses')}
          className="p-5 rounded-2xl glass-panel border border-glass-stroke hover:border-plasma-violet hover:scale-[1.02] transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-plasma-violet/15 flex items-center justify-center text-plasma-violet mb-3 group-hover:scale-110 transition-transform">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-sm text-on-surface">Course Hub</h2>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">Access syllabus modules</p>
          </div>
        </button>

        <button
          onClick={() => setView('help')}
          className="p-5 rounded-2xl glass-panel border border-glass-stroke hover:border-synapse-green hover:scale-[1.02] transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-synapse-green/15 flex items-center justify-center text-synapse-green mb-3 group-hover:scale-110 transition-transform">
            <LifeBuoy className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-sm text-on-surface">Help Center</h2>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">Resolve technical errors</p>
          </div>
        </button>
      </div>

      {/* Return button */}
      <button
        onClick={() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            setView('landing');
          }
        }}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-electric-cyan transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Navigate to Previous Step</span>
      </button>
    </div>
  );
}
