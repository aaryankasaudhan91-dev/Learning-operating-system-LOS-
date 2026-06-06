/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, TrendingUp, RefreshCw, Zap, Radio, 
  Activity, GraduationCap, BarChart4, AlertCircle, Filter 
} from 'lucide-react';
import { StudentSeat, InterventionAlert, AppView } from '../types';

interface CohortTelemetryProps {
  setView: (view: AppView) => void;
  seats: StudentSeat[];
  setSeats: React.Dispatch<React.SetStateAction<StudentSeat[]>>;
  alerts: InterventionAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<InterventionAlert[]>>;
  addNotification: (msg: string) => void;
}

export default function CohortTelemetry({
  setView,
  seats,
  setSeats,
  alerts,
  setAlerts,
  addNotification
}: CohortTelemetryProps) {
  const [resonanceLevel, setResonanceLevel] = useState<number>(78);
  const [showAtRiskOnly, setShowAtRiskOnly] = useState(false);

  const displayedSeats = showAtRiskOnly 
    ? seats.filter(s => s.state === 'friction' || s.state === 'low_motivation' || s.load > 80)
    : seats;

  const keyVitals = [
    { label: 'Avg Synaptic Sync', value: '82.4%', change: '+3.1%', status: 'optimal' },
    { label: 'Active Attention Span', value: '38 mins', change: '-2%', status: 'warning' },
    { label: 'Stress Indices Baseline', value: '42.1%', change: '-8.5%', status: 'optimal' },
    { label: 'Bhashini Proxy Health', value: '99.8%', change: 'Stable', status: 'optimal' }
  ];

  // Critical student checklist details
  const criticalStudents = [
    { name: 'John Doe', module: 'Module 4: Graph Tracing', stressLevel: 88, state: 'Stuck loop (Logic anomaly)' },
    { name: 'Alice Smith', module: 'Module 3: BST Trees', stressLevel: 81, state: 'High friction (Vernacular mismatch)' },
    { name: 'Elton J.', module: 'Module 5: Neural Backpropagation', stressLevel: 76, state: 'Low engagement response rate' }
  ];

  // Simulated Stress Surge Function
  const handleTriggerLoadSurge = () => {
    // Generate random load values for some student seats
    setSeats(prev => prev.map(seat => {
      if (Math.random() > 0.6) {
        const surgeLoad = Math.floor(Math.random() * 25) + 72; // High stress load
        return { ...seat, load: surgeLoad, state: 'friction' };
      }
      return seat;
    }));

    // Inject alert to queue
    const targetStudentNames = ['John Doe', 'Alice Smith', 'Elias V.', 'Sarah M.'];
    const selectedName = targetStudentNames[Math.floor(Math.random() * targetStudentNames.length)];
    
    // Check if alert already exists to prevent duplicate lists
    if (!alerts.some(al => al.studentName === selectedName)) {
      const newAlert: InterventionAlert = {
        id: Date.now().toString(),
        studentName: selectedName,
        condition: 'Load Surge Alert',
        reason: 'Mental alpha-stress surge detected. Vernacular proxy translation latency exceeded 200ms.',
        severity: 'high'
      };
      setAlerts(prev => [newAlert, ...prev]);
    }

    setResonanceLevel(prev => Math.max(prev - 12, 55));
    addNotification(`Warning: Artificial Cognitive Stress Surge injected to verify system reliability.`);
    alert(`Success! Sudden mental fatigue waves propagated.\nHigh-wear student indicators registered in the Spatial Load Seat grid and alerts launched.`);
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-sans font-extrabold text-3xl text-on-surface flex items-center gap-3">
            <Radio className="w-8 h-8 text-plasma-violet" />
            Cohort Synaptic Telemetry
          </h1>
          <p className="font-sans text-base text-on-surface-variant max-w-2xl leading-relaxed mt-1">
            Baseline analysis of overall class progression, cognitive resonance metrics, and neural feedback loops.
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setShowAtRiskOnly(!showAtRiskOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${
              showAtRiskOnly 
                ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                : 'bg-white/5 text-on-surface-variant border-glass-stroke hover:border-white/20'
            }`}
          >
            <Filter className={`w-4 h-4 ${showAtRiskOnly ? 'animate-pulse' : ''}`} />
            {showAtRiskOnly ? 'Friction Nodes Only' : 'Filter At-Risk'}
          </button>

          {/* Surge Simulation Interactive Button */}
          <button
            onClick={handleTriggerLoadSurge}
          className="px-6 py-3 rounded-full bg-red-400/10 text-red-300 border border-red-500/30 font-semibold text-xs tracking-wider uppercase hover:bg-red-400/20 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-red-500/10 hover:border-red-400"
          title="Inject random stress patterns down students grid to experience full diagnostic"
        >
          <Zap className="w-4 h-4 text-red-400 animate-bounce" />
          Simulate Cognitive Surge
        </button>
        </div>
      </header>

      {/* QUICK STAT VITALS CARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyVitals.map((vit, idx) => (
          <div key={idx} className="glass-panel rounded-2xl p-5 border border-glass-stroke">
            <p className="font-sans text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
              {vit.label}
            </p>
            <div className="flex justify-between items-end mt-2">
              <span className="font-sans font-black text-2xl text-on-surface">
                {vit.value}
              </span>
              <span className={`font-mono text-xs font-bold ${vit.status === 'optimal' ? 'text-synapse-green' : 'text-yellow-400'}`}>
                {vit.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* GRAPH ROW SHEETS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: Critical Risk Indices */}
        <section className="glass-panel rounded-2xl xl:col-span-6 p-6 border border-glass-stroke flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-sans font-bold text-lg text-on-surface flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
                Synaptic Wear Check
              </h3>
              <span className="font-mono text-[10px] text-on-surface-variant bg-white/5 border border-glass-stroke px-2 py-0.5 rounded-full font-bold">
                Student Wear List
              </span>
            </div>

            <div className="space-y-4">
              {displayedSeats.filter(s => s.load > 60).slice(0, 5).map((stud, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-void-black/20 border border-glass-stroke/60 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-sans font-bold text-sm text-on-surface">{stud.name}</span>
                      <span className={`font-mono text-xs font-semibold ${stud.load > 85 ? 'text-red-400' : 'text-yellow-400'}`}>{stud.load}% Wear</span>
                    </div>
                    <p className="font-sans text-[11px] text-on-surface-variant uppercase">{stud.state.replace('_', ' ')}</p>
                    <p className="font-mono text-[9px] text-[#bac9cc]/50 uppercase tracking-wide mt-1">Module Sync Active</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full ${stud.load > 85 ? 'bg-red-400/10' : 'bg-yellow-400/10'} flex items-center justify-center`}>
                    <span className={`w-2 h-2 rounded-full ${stud.load > 85 ? 'bg-red-400 animate-ping' : 'bg-yellow-400'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-glass-stroke pt-4 mt-6">
            <button 
              onClick={() => { setView('insights'); }}
              className="w-full py-2.5 rounded-xl bg-plasma-violet text-on-secondary-container font-mono text-xs font-extrabold uppercase tracking-widest hover:scale-101 active:scale-95 transition-all text-center border-l-4 border-[#c3f5ff]"
            >
              Examine Interventions Map
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: Interactive High-Tech SVG Radar Visual */}
        <section className="glass-panel rounded-2xl xl:col-span-6 p-6 border border-glass-stroke flex flex-col items-center justify-center relative overflow-hidden h-[450px]">
          <div className="absolute top-6 left-6 select-none z-10 text-left">
            <h3 className="font-sans font-bold text-lg text-on-surface">Cognitive Resonance</h3>
            <p className="text-xs text-on-surface-variant">Synapse performance loop correlation versus static target goal</p>
          </div>

          <div className="relative w-72 h-72 flex items-center justify-center pt-8 pointer-events-none select-none">
            {/* SVG radar blueprint wireframes */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
              {/* Concentric rings */}
              <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.06)" />
              <circle cx="100" cy="100" r="35" fill="none" stroke="rgba(255,255,255,0.04)" strokeDasharray="2 2" />

              {/* Diagonal axis guides representation */}
              <line x1="15" y1="100" x2="185" y2="100" stroke="rgba(255,255,255,0.05)" />
              <line x1="100" y1="15" x2="100" y2="185" stroke="rgba(255,255,255,0.05)" />

              {/* Path layout 1: Target limits boundaries */}
              <polygon 
                points="100,25 155,75 145,145 55,145 45,75" 
                fill="none" 
                stroke="rgba(0, 229, 255, 0.25)" 
                strokeWidth="1.5" 
                style={{ strokeDasharray: '3 3' }}
              />

              {/* Path layout 2: Observed class-wide resonance vector map */}
              <polygon 
                points={`100,${45 + (100 - resonanceLevel)/3} ${130 + resonanceLevel/5},85 140,135 65,120 ${35 + resonanceLevel/4},90`} 
                fill="rgba(112, 0, 255, 0.155)" 
                stroke="#7000ff" 
                strokeWidth="2.5" 
                className="transition-all duration-1000"
              />
            </svg>

            <span className="absolute font-sans font-black text-2xl text-[#c3f5ff] glow-hover drop-shadow-[0_0_10px_rgba(0,229,255,0.25)]">
              {resonanceLevel}%
            </span>
          </div>

          <div className="absolute bottom-6 right-6 flex items-center gap-1">
            <span className="font-mono text-[9px] uppercase text-on-surface-variant font-bold mr-1">Resonance Class Vector</span>
            <span className="w-2.5 h-2.5 rounded-full bg-plasma-violet" />
          </div>
        </section>

      </div>

    </div>
  );
}
