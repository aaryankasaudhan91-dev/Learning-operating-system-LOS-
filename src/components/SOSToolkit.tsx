/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, Check, Wind, MoveRight, HelpCircle, 
  ChevronRight, Sliders, MessageSquare, ShieldAlert 
} from 'lucide-react';
import { AppView } from '../types';

interface SOSToolkitProps {
  setView: (view: AppView) => void;
  cognitiveLoad: number;
  setCognitiveLoad: React.Dispatch<React.SetStateAction<number>>;
  addNotification: (msg: string) => void;
}

export default function SOSToolkit({
  setView,
  cognitiveLoad,
  setCognitiveLoad,
  addNotification
}: SOSToolkitProps) {
  // Box Breathing States (Inhale, Hold, Exhale, Hold)
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold (Full)' | 'Exhale' | 'Hold (Empty)'>('Inhale');
  const [breathSeconds, setBreathSeconds] = useState<number>(4);
  const [breathActive, setBreathActive] = useState<boolean>(true);

  // Box breathing effect
  useEffect(() => {
    let timer: any = null;
    if (breathActive) {
      timer = setInterval(() => {
        setBreathSeconds(prev => {
          if (prev <= 1) {
            setBreathPhase(current => {
              if (current === 'Inhale') return 'Hold (Full)';
              if (current === 'Hold (Full)') return 'Exhale';
              if (current === 'Exhale') return 'Hold (Empty)';
              return 'Inhale';
            });
            return 4; // Reset to 4s
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [breathActive]);

  // Grounding Checklist step trackers
  const [groundingStep, setGroundingStep] = useState<number>(1);
  const [inputs, setInputs] = useState({
    see: '',
    touch: '',
    hear: '',
    smell: '',
    taste: ''
  });

  // Chat with Mentor interactive simulator
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'mentor'; text: string }>>([
    { sender: 'mentor', text: 'Hello explorer. I observe a load surge in your cognitive metrics. Take a breath. I am details here. What is occurring on your screen?' }
  ]);
  const [userInputField, setUserInputField] = useState('');

  const chatOptions = [
    "I am feeling extremely overwhelmed by this syntax errors.",
    "My focus is completely shattered today.",
    "I need helper tips to stabilize my frustration."
  ];

  const handleSelectPrewrittenChat = (phrase: string) => {
    setChatLog(prev => [...prev, { sender: 'user', text: phrase }]);
    
    // Mentor answers simulating supportive guidance
    let reply = "Deep breaths. Complexity is just information layered together too quickly. Tap the Breathing bubble above to box-breathe for 1 minute. I have requested our Bhashini Translation system to prioritize simplified code schemas.";
    if (phrase.includes("focus")) {
      reply = "A shattered focus is normal. The synaptic pathway is simply over-saturated. Toggle the 'Reduce Study Workload' slider below to set our system into 'Low Density' study pacing. This frees up temporary working memory.";
    }

    setTimeout(() => {
      setChatLog(prev => [...prev, { sender: 'mentor', text: reply }]);
    }, 800);
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInputField.trim()) return;
    const msg = userInputField;
    setChatLog(prev => [...prev, { sender: 'user', text: msg }]);
    setUserInputField('');

    setTimeout(() => {
      setChatLog(prev => [...prev, { 
        sender: 'mentor', 
        text: "I am hear you. Keep breathing calmly. You are in a safe space. Click 'Adjust Workload Density' down below to clear visual items from the primary Cognitive Map view, then proceed in low-density format." 
      }]);
    }, 800);
  };

  // Adjust workload handler
  const handleReduceWorkload = () => {
    setCognitiveLoad(30); // Clear stress metric
    addNotification("Sustained Low Density study pacing activated. Working memory load calibrated to 30%.");
    alert("System Calibration Success!\nYour cognitive map has been reformatted into 'Low Density' format. Cognitive Load metrics adjusted back to baseline (30%).");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16 pt-6 select-none animate-[fadeIn_0.4s_ease-out]">
      
      {/* HEADER SECTION */}
      <header className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-400/20 flex items-center justify-center border border-red-500/30">
          <Heart className="w-6 h-6 text-error fill-error animate-pulse" />
        </div>
        <h1 className="font-sans font-black text-3xl text-on-surface">Emergency SOS Toolkit</h1>
        <p className="font-sans text-sm text-on-surface-variant max-w-xl mx-auto leading-relaxed">
          Follow the expansion and contraction. Sync your breath to regain focus and stabilize logical frustration.
        </p>
      </header>

      {/* CORE TWO COLUMN BOX BREATHE & GROUNDING GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* PANEL 1: Box Breathing expands orb (Spans 6 cols) */}
        <section className="glass-panel rounded-2xl md:col-span-6 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden h-[460px] border border-glass-stroke">
          
          <div className="absolute top-6 left-6 flex items-center gap-1.5 font-mono text-[10px] uppercase text-on-surface-variant font-bold">
            <Wind className="w-4 h-4 text-electric-cyan" />
            Adaptive Rhythm Engine
          </div>

          {/* Synchronized pacing balloon sphere */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Pulsing breathing bubble */}
            <div 
              className={`absolute rounded-full bg-gradient-to-tr from-electric-cyan/20 to-plasma-violet/20 border-2 border-electric-cyan/40 shadow-[0_0_50px_rgba(0,229,255,0.2)] transition-all duration-4000 ease-in-out ${
                breathPhase === 'Inhale' 
                  ? 'w-[85%] h-[85%] scale-100 opacity-90' 
                  : breathPhase === 'Hold (Full)' 
                  ? 'w-[85%] h-[85%] scale-100 opacity-100 shadow-[0_0_60px_rgba(112,0,255,0.35)]' 
                  : breathPhase === 'Exhale'
                  ? 'w-[40%] h-[40%] scale-90 opacity-60'
                  : 'w-[40%] h-[40%] scale-90 opacity-50'
              }`} 
            />

            <div className="absolute inset-0 rounded-full border border-glass-stroke animate-ping opacity-10" style={{ animationDuration: '4s' }} />

            {/* Breathing Phase Text */}
            <div className="z-10 text-center space-y-1">
              <p className="font-sans font-black text-3xl tracking-tight text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                {breathPhase}
              </p>
              <p className="font-mono text-xs text-electric-cyan font-bold tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {breathSeconds}s REMAINING
              </p>
            </div>
          </div>

          <button 
            onClick={() => setBreathActive(!breathActive)}
            className="mt-4 px-5 py-2 rounded-full border border-glass-stroke text-xs font-semibold text-on-surface hover:bg-white/5 hover:text-electric-cyan transition-colors"
          >
            {breathActive ? 'Pause Calibration Timer' : 'Resume Box Breathing'}
          </button>
        </section>

        {/* PANEL 2: 5-4-3-2-1 Grounding steps Game */}
        <section className="glass-panel rounded-2xl md:col-span-6 p-8 flex flex-col justify-between h-[460px] border border-glass-stroke relative group">
          
          <div className="absolute right-0 top-0 w-32 h-32 bg-electric-cyan/5 rounded-full blur-[60px] pointer-events-none" />
          
          <div>
            <h3 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2 mb-2">
              <Check className="w-5 h-5 text-synapse-green" />
              Sensory Grounding
            </h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed mb-6">
              Distract your hyper-focused logic loop by inputting observations.
            </p>

            {/* Stage display checklist */}
            <div className="space-y-4">
              {groundingStep === 1 && (
                <div className="space-y-3.5">
                  <p className="text-sm font-sans font-semibold text-electric-cyan">Step 1: Input 3 things you can SEE around you</p>
                  <input 
                    type="text"
                    placeholder="E.g., Screen, mug, window..."
                    value={inputs.see}
                    onChange={(e)=>setInputs(prev=>({...prev, see: e.target.value}))}
                    className="w-full bg-void-black border border-glass-stroke rounded-xl px-4 py-2.5 text-sm outline-none focus:border-electric-cyan transition-all"
                  />
                </div>
              )}
              {groundingStep === 2 && (
                <div className="space-y-3.5">
                  <p className="text-sm font-sans font-semibold text-electric-cyan">Step 2: Input 2 things you can TOUCH now</p>
                  <input 
                    type="text"
                    placeholder="E.g., Keyboard keys, desk surface..."
                    value={inputs.touch}
                    onChange={(e)=>setInputs(prev=>({...prev, touch: e.target.value}))}
                    className="w-full bg-void-black border border-glass-stroke rounded-xl px-4 py-2.5 text-sm outline-none focus:border-electric-cyan transition-all"
                  />
                </div>
              )}
              {groundingStep === 3 && (
                <div className="space-y-3.5">
                  <p className="text-sm font-sans font-semibold text-electric-cyan">Step 3: Name 1 thing you can HEAR in the room</p>
                  <input 
                    type="text"
                    placeholder="E.g., AC hum, typing clicks..."
                    value={inputs.hear}
                    onChange={(e)=>setInputs(prev=>({...prev, hear: e.target.value}))}
                    className="w-full bg-void-black border border-glass-stroke rounded-xl px-4 py-2.5 text-sm outline-none focus:border-electric-cyan transition-all"
                  />
                </div>
              )}
              {groundingStep >= 4 && (
                <div className="py-8 text-center space-y-3 select-none flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-synapse-green/20 border border-synapse-green/45 flex items-center justify-center">
                    <Check className="w-6 h-6 text-synapse-green" />
                  </div>
                  <h4 className="font-sans font-bold text-base text-on-surface">Sensory Grounding Integrated</h4>
                  <p className="text-xs text-on-surface-variant max-w-xs">Your logical synapses have successfully decentralized. Keep focus soft.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-glass-stroke pt-4 mt-6">
            <span className="font-mono text-[10px] text-on-surface-variant font-bold uppercase">
              {groundingStep >= 4 ? 'Status: Grounded' : `Check Phase: ${groundingStep}/3`}
            </span>
            {groundingStep < 4 ? (
              <button 
                onClick={() => {
                  if (groundingStep === 1 && !inputs.see.trim()) { alert("Please type your observations first to anchor attention."); return; }
                  if (groundingStep === 2 && !inputs.touch.trim()) { alert("Please type your observations first."); return; }
                  if (groundingStep === 3 && !inputs.hear.trim()) { alert("Please type your observations first."); return; }
                  setGroundingStep(prev=>prev+1);
                }}
                className="px-4 py-2 rounded-lg bg-electric-cyan text-void-black text-xs font-bold uppercase tracking-wider hover:bg-electric-cyan/85 transition-all flex items-center gap-1"
              >
                Continue <ChevronRight className="w-4 h-4 font-extrabold" />
              </button>
            ) : (
              <button 
                onClick={() => { setGroundingStep(1); setInputs({see:'', touch:'', hear:'', smell:'', taste:''}); }}
                className="text-xs text-on-surface-variant hover:text-white font-medium"
              >
                Reset Checklist
              </button>
            )}
          </div>
        </section>

      </div>

      {/* LOWER ROW: Support Dialogue simulation with AI Mentor */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch pt-4">
        
        {/* Chat with Mentor Panel (Spans 8 cols) */}
        <section className="glass-panel rounded-2xl md:col-span-8 p-6 flex flex-col justify-between h-[420px] border border-glass-stroke relative">
          
          <div className="flex items-center gap-3 mb-4 select-none">
            <div className="w-10 h-10 rounded-full bg-plasma-violet/20 border border-plasma-violet/40 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-plasma-violet" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-on-surface">Chamber Mentor Conversation</h3>
              <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Sub-cognitive uplink proxy active</p>
            </div>
          </div>

          {/* Scrolling Chat logs area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
            {chatLog.map((log, idx) => (
              <div 
                key={idx}
                className={`flex max-w-[85%] ${log.sender === 'user' ? 'ml-auto justify-end' : ''}`}
              >
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  log.sender === 'user'
                    ? 'bg-plasma-violet text-on-secondary-container rounded-tr-none font-medium'
                    : 'bg-surface-container border border-glass-stroke text-on-surface rounded-tl-none font-sans'
                }`}>
                  {log.text}
                </div>
              </div>
            ))}
          </div>

          {/* Standard user input form + clickable quick feelings prompts */}
          <div className="space-y-3 border-t border-glass-stroke pt-4">
            <div className="flex flex-wrap gap-2">
              {chatOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPrewrittenChat(opt)}
                  className="px-3 py-1.5 rounded-full bg-void-black/70 border border-glass-stroke text-[10px] text-on-surface-variant hover:border-electric-cyan hover:text-white transition-all text-left"
                >
                  {opt}
                </button>
              ))}
            </div>

            <form onSubmit={handleCustomSend} className="flex gap-2">
              <input 
                type="text"
                placeholder="Declare sensory experience to mentor..."
                value={userInputField}
                onChange={(e) => setUserInputField(e.target.value)}
                className="flex-1 bg-void-black border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface placeholder-outline-variant focus:outline-none focus:border-electric-cyan transition-all"
              />
              <button 
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-plasma-violet text-on-secondary-container font-mono text-xs font-bold uppercase tracking-wider hover:bg-plasma-violet/85 hover:scale-103 active:scale-95 transition-all border border-plasma-violet/35"
              >
                Send
              </button>
            </form>
          </div>

        </section>

        {/* Adjust Workload control panel CARD (Spans 4 cols) */}
        <section className="glass-panel rounded-2xl md:col-span-4 p-6 flex flex-col justify-between border border-glass-stroke text-left relative overflow-hidden group">
          
          <div className="absolute right-0 bottom-0 w-36 h-36 bg-red-400/5 rounded-full blur-[70px] pointer-events-none" />
          
          <div className="select-none">
            <div className="w-10 h-10 rounded-full bg-red-400/20 flex items-center justify-center border border-red-500/30 mb-4">
              <Sliders className="w-5 h-5 text-error" />
            </div>
            <h3 className="font-sans font-bold text-lg text-on-surface mb-2">Adjust Workplace Density</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              If intellectual blockages are causing cognitive friction, configure our operating system parameters. This reduces data pipeline clutter, downscales mental wear, and allows you to absorb topics at a sustainable gradient flow.
            </p>
          </div>

          <div className="pt-6">
            <button
              onClick={handleReduceWorkload}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500/10 to-red-500/25 border border-red-500/40 text-error hover:border-red-400 hover:bg-red-500/25 font-mono text-xs font-bold uppercase tracking-widest hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Decrease Study Load Density
            </button>
          </div>

        </section>

      </div>

    </div>
  );
}
