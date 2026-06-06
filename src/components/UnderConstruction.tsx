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
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 bg-void-black">
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-plasma-violet/30 blur-[100px] rounded-full"></div>
        <div className="relative w-32 h-32 rounded-3xl bg-void-black border border-plasma-violet/30 flex items-center justify-center shadow-2xl shadow-plasma-violet/20 group">
          <Hammer className="w-14 h-14 text-plasma-violet group-hover:rotate-12 transition-transform duration-500" />
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-void-black border border-glass-stroke flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-plasma-violet animate-ping"></div>
          </div>
        </div>
      </div>
      
      <h1 className="text-4xl font-sans font-black text-white mb-6 tracking-tighter uppercase italic">
        {featureName} <span className="text-plasma-violet">Locked</span>
      </h1>
      
      <p className="max-w-lg text-on-surface-variant text-base leading-relaxed mb-12 font-sans tracking-wide">
        Our engineers are currently synchronizing the neural pathways for this module. 
        The <span className="text-plasma-violet font-bold font-mono text-sm uppercase">Course Hub</span> is our primary focal point during this deployment cycle.
      </p>
      
      <button
        onClick={() => setView('courses')}
        className="flex items-center gap-3 px-10 py-4 rounded-full bg-plasma-violet text-void-black font-sans font-extrabold text-xs uppercase tracking-[0.25em] hover:bg-plasma-violet/90 hover:scale-105 transition-all shadow-xl shadow-plasma-violet/20 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
        Back to Course Hub
      </button>
      
      <div className="mt-24 w-full max-w-2xl grid grid-cols-1 gap-4 opacity-10">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-plasma-violet to-transparent"></div>
        <div className="flex justify-between text-[10px] font-mono text-plasma-violet uppercase tracking-[0.5em] px-12">
          <span>System Latency: Nominal</span>
          <span>Sync Status: Pending</span>
        </div>
      </div>
    </div>
  );
}
