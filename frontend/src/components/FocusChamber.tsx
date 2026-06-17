/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Play, Pause, Volume2, Users, LogOut, Disc, LayoutGrid, Brain, MessageSquare, Target, Settings2, Image as ImageIcon, FileText, Zap, Gift, Loader2 } from 'lucide-react';
import { AppView } from '../types';

interface FocusChamberProps {
  setView: (view: AppView) => void;
  setCognitiveLoad: React.Dispatch<React.SetStateAction<number>>;
}

export default function FocusChamber({ setView, setCognitiveLoad }: FocusChamberProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45 * 60); // 45:00 default
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [soundPlaying, setSoundPlaying] = useState<boolean>(false);
  const [soundVolume, setSoundVolume] = useState<number>(65);

  // Frequency visualizer mockup state (7 bars)
  const [barHeights, setBarHeights] = useState<number[]>([40, 80, 60, 90, 50, 70, 30]);

  const [pledgeActive, setPledgeActive] = useState<boolean>(true);
  const [distractionShieldAlert, setDistractionShieldAlert] = useState<boolean>(false);
  const [showReflection, setShowReflection] = useState<boolean>(false);
  const [contentMode, setContentMode] = useState<'text'|'audio'|'visual'>('text');
  const [analogyMode, setAnalogyMode] = useState<boolean>(false);
  const [complexitySteppedDown, setComplexitySteppedDown] = useState<boolean>(false);
  const [milestoneUnlocked, setMilestoneUnlocked] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>("Dijkstra's Algorithm");
  
  // AI Agent States
  const [aiContent, setAiContent] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Feature 13: Smart Distraction Interception Shields
  useEffect(() => {
    const handleBlur = () => {
      if (timerRunning) {
        setDistractionShieldAlert(true);
        setTimeout(() => setDistractionShieldAlert(false), 5000);
      }
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [timerRunning]);

  // Fetch contextual content from AI Agent backend
  useEffect(() => {
    setIsAiLoading(true);
    const controller = new AbortController();
    const signal = controller.signal;
    let isMounted = true;

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch('/api/agent/focus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            contentMode,
            analogyMode,
            complexitySteppedDown
          }),
          signal
        });
        const data = await response.json();
        if (isMounted) {
          if (data.content) {
            setAiContent(data.content);
          } else {
            const fallbacks = ["Take a moment to absorb this concept. Knowledge consolidation occurs during quiet reflection.", "Consider how this ties into the broader architecture of your current studies.", "Your neural pathways are strengthening. Keep focusing on the core principles."];
            setAiContent(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted due to rapid state changes.');
          return;
        }
        if (isMounted) {
          const fallbacks = ["Take a moment to absorb this concept. Knowledge consolidation occurs during quiet reflection.", "Consider how this ties into the broader architecture of your current studies.", "Your neural pathways are strengthening. Keep focusing on the core principles."];
          setAiContent(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
        }
      } finally {
        if (isMounted) setIsAiLoading(false);
      }
    }, 600); // 600ms debounce
    
    return () => { 
      isMounted = false; 
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [contentMode, analogyMode, complexitySteppedDown, topic]);

  // Handle countdown ticking
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setTimerRunning(false);
      setCognitiveLoad(30); // Significantly reduced!
      alert("Congratulations! Flow Session fully integrated. Memory load has stabilized.");
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsRemaining]);

  // Simulating the dynamic equalizer visualizer heights shift
  useEffect(() => {
    let animationInterval: any = null;
    if (soundPlaying) {
      animationInterval = setInterval(() => {
        setBarHeights(prev => prev.map(() => Math.floor(Math.random() * 70) + 20));
      }, 250);
    } else {
      setBarHeights([5, 5, 5, 5, 5, 5, 5]);
    }
    return () => clearInterval(animationInterval);
  }, [soundPlaying]);

  // Format Helper
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Circular stroke bounds
  const circumference = 2 * Math.PI * 140; // R=140 => ~880
  const progressRatio = secondsRemaining / (45 * 60);
  const strokeOffset = circumference - progressRatio * circumference;

  const handleConcludeSession = () => {
    setTimerRunning(false);
    setShowReflection(true); // Feature 11: Metacognitive Reflection Prompts
  };

  const submitReflection = () => {
    setShowReflection(false);
    setMilestoneUnlocked(true); // Feature 19: Rewards-Based Cognitive Milestones
    setTimeout(() => {
      setCognitiveLoad(load => Math.max(load - 15, 25));
      setView('map');
    }, 2000);
  };

  return (
    <div className="relative w-full min-h-[85vh] flex flex-col justify-start select-none">
      
      {/* Top Left Floating Shield Indicator */}
      <div className="absolute top-4 left-0 glass-panel px-4 py-2 rounded-xl flex items-center gap-2 z-10 glow-violet border border-plasma-violet/30 animate-pulse">
        <Shield className="w-4 h-4 text-plasma-violet" />
        <span className="font-mono text-xs text-plasma-violet uppercase font-extrabold tracking-wider">
          Shield Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-20 pt-14">
        
        {/* Feature 13: Smart Distraction Interception Shields */}
        {distractionShieldAlert && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-void-black/90 backdrop-blur-md">
            <div className="bg-red-500/20 border border-red-500 rounded-xl p-8 max-w-md text-center">
              <Shield className="w-12 h-12 text-red-400 mx-auto mb-4 animate-bounce" />
              <h3 className="text-xl font-bold text-white mb-2">Distraction Shield Activated!</h3>
              <p className="text-red-200 mb-4">We detected you trying to leave the focus tab. Remember your current goal!</p>
              <button onClick={() => setDistractionShieldAlert(false)} className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold">Return to Focus</button>
            </div>
          </div>
        )}

        {/* Feature 11: Metacognitive Reflection Prompts */}
        {showReflection && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-void-black/90 backdrop-blur-md">
            <div className="bg-surface-container border border-glass-stroke rounded-xl p-8 max-w-md text-center">
              <Brain className="w-12 h-12 text-plasma-violet mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Metacognitive Reflection</h3>
              <p className="text-on-surface-variant mb-4">What was the trickiest part of today's lesson?</p>
              <textarea className="w-full bg-void-black border border-glass-stroke rounded p-2 text-white mb-4" rows={3}></textarea>
              <button onClick={submitReflection} className="px-6 py-2 bg-plasma-violet text-white rounded-lg font-bold">Submit & Conclude</button>
            </div>
          </div>
        )}

        {/* Feature 19: Rewards-Based Cognitive Milestones */}
        {milestoneUnlocked && (
          <div className="absolute top-20 right-10 z-50 animate-[bounce_1s_ease-out_infinite]">
            <div className="bg-orange-500/20 border border-orange-500 rounded-xl p-4 flex items-center gap-3">
              <Gift className="w-8 h-8 text-orange-400" />
              <div>
                <p className="font-bold text-orange-400">Milestone Unlocked!</p>
                <p className="text-xs text-orange-200">+50 Focus Points</p>
              </div>
            </div>
          </div>
        )}

        {/* Feature 9: Social Contract Commitment Pledges */}
        {pledgeActive && (
          <div className="absolute top-10 inset-x-0 mx-auto w-max z-40 bg-synapse-green/10 border border-synapse-green/30 px-6 py-3 rounded-full flex items-center gap-3 shadow-lg backdrop-blur-md">
            <Target className="w-5 h-5 text-synapse-green" />
            <span className="text-synapse-green font-bold text-sm">Pledge: I commit to 45 mins of deep focus with peer Sarah M.</span>
            <button onClick={() => setPledgeActive(false)} className="text-xs ml-4 bg-synapse-green text-black px-2 py-1 rounded font-bold hover:bg-white">Acknowledge</button>
          </div>
        )}

        {/* LEFT COLUMN: Radial Countdown Timer & Ambience Controls */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-10">
          
          {/* Radial Countdown display */}
          <div className="relative w-80 h-80 flex items-center justify-center glow-cyan rounded-full bg-surface-variant/5 border border-glass-stroke">
            
            {/* SVG Circular countdown border */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 320 320">
              <circle 
                cx="160" 
                cy="160" 
                fill="none" 
                r="140" 
                stroke="rgba(255, 255, 255, 0.05)" 
                strokeWidth="10" 
              />
              <circle 
                cx="160" 
                cy="160" 
                fill="none" 
                r="140" 
                stroke="url(#timerGradient)" 
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round" 
                strokeWidth="11" 
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="100%" stopColor="#7000ff" />
                </linearGradient>
              </defs>
            </svg>

            {/* Core Clock display */}
            <div className="text-center z-10">
              <div 
                onClick={() => setTimerRunning(!timerRunning)}
                className="font-sans font-black text-6xl text-electric-cyan tracking-tighter drop-shadow-[0_0_15px_rgba(0,229,255,0.45)] cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              >
                {formatTime(secondsRemaining)}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#bac9cc]/55 mt-2 flex items-center justify-center gap-1.5 font-bold">
                <span className={`w-2 h-2 rounded-full ${timerRunning ? 'bg-synapse-green animate-ping' : 'bg-outline-variant'}`} />
                {timerRunning ? 'Deep Work Flowing' : 'Paused'}
              </div>
            </div>
          </div>

          {/* Ambience Audio Simulation Mixer Control */}
          <div className="glass-panel w-full p-6 p-y-5 rounded-2xl flex flex-col space-y-4 border border-glass-stroke">
            <div className="flex justify-between items-center">
              <span className="font-sans font-bold text-base text-on-surface">Ambient Synthesizer</span>
              <Disc className={`w-5 h-5 text-on-surface-variant ${soundPlaying ? 'animate-[spin_4s_linear_infinite] text-electric-cyan' : ''}`} />
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSoundPlaying(!soundPlaying)}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-glass-stroke text-electric-cyan hover:scale-105 active:scale-95 transition-all"
                title={soundPlaying ? 'Pause Ambient Loops' : 'Play Ambient Music'}
              >
                {soundPlaying ? (
                  <Pause className="w-5 h-5 fill-electric-cyan" />
                ) : (
                  <Play className="w-5 h-5 fill-electric-cyan ml-0.5" />
                )}
              </button>

              {/* Fluctuating equalizer sound bars */}
              <div className="flex-1 h-12 flex items-end justify-between px-4 space-x-1 border-l border-glass-stroke">
                {barHeights.map((ht, idx) => (
                  <div 
                    key={idx}
                    className={`w-1.5 rounded-t-sm transition-all duration-300 ${idx % 2 === 0 ? 'bg-electric-cyan/85' : 'bg-plasma-violet/85'}`}
                    style={{ height: `${ht}%` }}
                  />
                ))}
              </div>

              <span className="font-mono text-xs text-on-surface-variant uppercase font-medium mr-1">
                Lo-Fi Flow
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Silent Chamber Virtual Peer Room */}
        <div className="lg:col-span-7 h-[500px] relative rounded-2xl overflow-hidden border border-glass-stroke shadow-2xl flex flex-col justify-between">
          
          <div className="absolute inset-0 z-0 select-none opacity-40">
            {/* Elegant high fidelity virtual ambient backdrop */}
            <img 
              alt="Deep workspace visualizer" 
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-void-black via-void-black/25 to-transparent z-1" />

          {/* Silent Room Info */}
          <div className="p-6 relative z-10 flex flex-col gap-1 pt-32">
            <div className="absolute top-6 left-6 right-6 z-20 flex justify-between gap-4">
              {/* Feature 15: Multi-Modal Content Adapter */}
              <div className="flex bg-void-black/60 rounded-lg border border-glass-stroke p-1 backdrop-blur-md">
                <button onClick={() => setContentMode('text')} className={`p-2 rounded ${contentMode==='text'?'bg-electric-cyan text-black':'text-white'}`} title="Text Mode"><FileText className="w-4 h-4"/></button>
                <button onClick={() => setContentMode('audio')} className={`p-2 rounded ${contentMode==='audio'?'bg-electric-cyan text-black':'text-white'}`} title="Audio Mode"><Volume2 className="w-4 h-4"/></button>
                <button onClick={() => setContentMode('visual')} className={`p-2 rounded ${contentMode==='visual'?'bg-electric-cyan text-black':'text-white'}`} title="Visual Mode"><ImageIcon className="w-4 h-4"/></button>
              </div>

              {/* Feature 12 & 6: Automated Cognitive Load Stepping & Contextual Real-World Analogy */}
              <div className="flex gap-2">
                <button onClick={() => setComplexitySteppedDown(!complexitySteppedDown)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${complexitySteppedDown ? 'bg-plasma-violet text-white border-plasma-violet' : 'bg-void-black/60 text-white border-glass-stroke'}`}>
                  <Settings2 className="w-4 h-4"/> Load Step-Down
                </button>
                <button onClick={() => setAnalogyMode(!analogyMode)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${analogyMode ? 'bg-orange-500 text-white border-orange-500' : 'bg-void-black/60 text-white border-glass-stroke'}`}>
                  <Zap className="w-4 h-4"/> Real-World Analogy
                </button>
              </div>
            </div>
            
            {/* Dynamic AI Agent Contextual Content Display */}
            <div className="absolute top-24 left-6 right-6 z-20 bg-void-black/85 border border-glass-stroke rounded-xl p-4 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3 pb-3 border-b border-glass-stroke/50">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Brain className="w-4 h-4 text-plasma-violet" />
                  AI Contextual Agent
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#bac9cc]/55 uppercase font-bold">Topic:</span>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-void-black/60 border border-glass-stroke rounded-lg px-2.5 py-1 text-xs text-white placeholder-on-surface-variant focus:outline-none focus:border-electric-cyan transition-colors w-36 sm:w-48 font-sans"
                    placeholder="e.g. Dijkstra's Algorithm"
                  />
                </div>
              </div>
              <p className="text-sm text-on-surface-variant min-h-[40px]">
                {isAiLoading ? (
                  <span className="animate-pulse text-plasma-violet flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-plasma-violet" />
                    Synthesizing Neural Path...
                  </span>
                ) : (
                  aiContent || "No context generated."
                )}
              </p>
            </div>

            <h2 className="font-sans font-bold text-2xl text-white tracking-tight">
              Silent Chamber Beta
            </h2>
            <p className="font-sans text-xs text-on-surface-variant flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-synapse-green animate-pulse" />
              4 Peers flow-docked in deep work
            </p>
          </div>

          {/* Transparent active peer avatars indicating social focus */}
          <div className="p-6 relative z-10 self-end flex items-center gap-3 bg-surface-container-low/40 backdrop-blur-md rounded-2xl border border-glass-stroke m-6 max-w-sm">
            <Users className="w-5 h-5 text-electric-cyan" />
            <div className="flex -space-x-2 mr-2">
              <img className="w-8 h-8 rounded-full border-2 border-void-black object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=70" alt="Peer Avatar" />
              <img className="w-8 h-8 rounded-full border-2 border-void-black object-cover" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=70" alt="Peer Avatar" />
              <img className="w-8 h-8 rounded-full border-2 border-void-black object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=70" alt="Peer Avatar" />
              <div className="w-8 h-8 rounded-full border-2 border-void-black bg-surface-variant flex items-center justify-center text-[10px] font-mono text-on-surface">
                +1
              </div>
            </div>
            <span className="text-xs font-mono text-on-surface-variant font-medium uppercase tracking-wider">
              Syncing
            </span>
          </div>
          
        </div>
      </div>

      {/* Action central button to conclude and exit back */}
      <div className="mt-12 flex justify-center w-full z-20">
        <button 
          onClick={handleConcludeSession}
          className="glass-panel px-8 py-4 rounded-xl flex items-center gap-3 hover:scale-102 hover:bg-white/10 active:scale-95 transition-all text-on-surface group relative overflow-hidden"
        >
          <LogOut className="w-5 h-5 text-plasma-violet group-hover:translate-x-1 transition-transform" />
          <span className="font-sans font-bold text-base">Conclude Flow Session</span>
        </button>
      </div>

    </div>
  );
}
