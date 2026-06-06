/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Hammer, ArrowLeft } from 'lucide-react';
import { AppView } from '../types';

interface UnderConstructionProps {
  setView: (view: AppView) => void;
  featureName: string;
}

export default function UnderConstruction({ setView, featureName }: UnderConstructionProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-electric-cyan/20 blur-3xl rounded-full"></div>
        <div className="relative w-24 h-24 rounded-2xl bg-void-black border border-glass-stroke flex items-center justify-center animate-pulse">
          <Hammer className="w-12 h-12 text-electric-cyan" />
        </div>
      </div>
      
      <h1 className="text-3xl font-sans font-bold text-white mb-4 tracking-tight uppercase italic">
        {featureName} <span className="text-electric-cyan">Under Construction</span>
      </h1>
      
      <p className="max-w-md text-on-surface-variant text-sm leading-relaxed mb-10 font-sans tracking-wide">
        Our engineers are currently synchronizing the neural pathways for this feature. 
        It will be available shortly as part of our next cognitive update.
      </p>
      
      <button
        onClick={() => setView('courses')}
        className="flex items-center gap-2 px-8 py-3 rounded-full bg-electric-cyan/10 border border-electric-cyan/30 text-electric-cyan font-sans font-bold text-xs uppercase tracking-[0.2em] hover:bg-electric-cyan/20 transition-all group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Return to Course Hub
      </button>
      
      <div className="mt-16 grid grid-cols-3 gap-8 opacity-20 grayscale">
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-electric-cyan to-transparent"></div>
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-plasma-violet to-transparent"></div>
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-electric-cyan to-transparent"></div>
      </div>
    </div>
  );
}
