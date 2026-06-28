/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Star, ShieldAlert, Music, Users, LogOut, Sparkles, Brain, Smile, Volume2, VolumeX, Pause, Play, Compass } from 'lucide-react';
import { AppView } from '../types';

interface SpaceMissionProps {
  setView: (view: AppView) => void;
  setCognitiveLoad: React.Dispatch<React.SetStateAction<number>>;
}

export default function SpaceMission({ setView, setCognitiveLoad }: SpaceMissionProps) {
  const TOTAL_DURATION = 15 * 60; // 15 minutes
  const [secondsRemaining, setSecondsRemaining] = useState<number>(TOTAL_DURATION);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [musicPlaying, setMusicPlaying] = useState<boolean>(false);

  // Gamification States
  const [starsEarned, setStarsEarned] = useState<number>(0);
  const [offTrackAlert, setOffTrackAlert] = useState<boolean>(false);
  const [showReflection, setShowReflection] = useState<boolean>(false);
  const [missionComplete, setMissionComplete] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>("Reading Time");

  const [botMessage, setBotMessage] = useState<string>("Welcome to the Focus Sanctuary. Ready to sync your cognitive stream?");

  // --- AUDIO SETUP ---
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Using a stable, non-distracting "Space Room Hum" provided by Google's free sound library.
    // It acts like white noise, which is proven to help kids with ADHD/focus issues.
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/science_fiction/space_room_hum.ogg');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    return () => {
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (musicPlaying) {
      audioRef.current?.play().catch(e => console.log("Audio play failed, waiting for user interaction.", e));
    } else {
      audioRef.current?.pause();
    }
  }, [musicPlaying]);
  // -------------------

  // Distraction Shield
  useEffect(() => {
    const handleBlur = () => {
      if (timerRunning) {
        setTimerRunning(false);
        setOffTrackAlert(true);
      }
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [timerRunning]);

  // Encouraging Messages
  useEffect(() => {
    if (!timerRunning) return;
    const messages = [
      "Your concentration is exceptional. Breathe and keep focus. ✨",
      "Synapses firing in perfect rhythm. You are doing great! 🧠",
      "Almost at the milestone, explorer. Stay with it! 🚀",
      "Great work. Every minute strengthens your core clarity. 🌟",
      "Deep study in progress. Distractions shielded. 🛡️"
    ];
    const interval = setInterval(() => {
      setBotMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 90000); // Change every 1.5 minutes
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && timerRunning) {
      setTimerRunning(false);
      setMusicPlaying(false);
      setMissionComplete(true);
      setStarsEarned(prev => prev + 3);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsRemaining]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const submitReflection = (feeling: string) => {
    setShowReflection(false);
    setMissionComplete(false);
    setCognitiveLoad(prev => prev + 10);
    setView('map');
  };

  // SVG Progress Ring calculations
  const radius = 135;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (secondsRemaining / TOTAL_DURATION) * circumference;

  return (
    // Premium light-themed Zen layout
    <div className="relative w-full min-h-[85vh] flex flex-col justify-start bg-gradient-to-b from-white/90 via-surface-dim/70 to-surface-container-low/90 select-none p-6 rounded-3xl font-sans overflow-hidden border border-outline-variant shadow-2xl relative z-10 transition-colors duration-500">
      
      {/* Subtle Ethereal Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-primary/10 rounded-full filter blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-secondary/10 rounded-full filter blur-[120px] pointer-events-none -z-10 animate-pulse" />

      {/* Decorative Floating Stars Background (Soft & light) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        {[...Array(8)].map((_, i) => (
          <Star
            key={i}
            className="absolute text-primary animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 16 + 8}px`,
              animationDuration: `${Math.random() * 4 + 3}s`
            }}
          />
        ))}
      </div>

      {/* Top Bar: Dashboard Status */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 bg-primary-container/40 px-5 py-2 rounded-xl border border-primary/10 shadow-sm">
          <Star className="w-6 h-6 text-amber-500 fill-amber-400 animate-[spin_8s_linear_infinite]" />
          <span className="text-lg font-bold text-primary-on-primary-container">
            Stars: {starsEarned}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-on-surface-variant font-mono text-xs uppercase tracking-widest font-bold">Focus Stream:</span>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-white hover:bg-slate-50 text-on-surface rounded-xl px-4 py-2 font-bold text-sm outline-none border border-outline-variant shadow-sm cursor-pointer transition-all duration-200"
          >
            <option>📖 Reading Time</option>
            <option>➕ Math Practice</option>
            <option>✍️ Spelling Words</option>
            <option>🎨 Art Project</option>
          </select>
        </div>
      </div>

      {/* Overlay Alerts */}
      {offTrackAlert && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md rounded-3xl p-6">
          <div className="bg-white border border-outline-variant rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-[scaleIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
            <div className="w-20 h-20 bg-error-container/60 rounded-full flex items-center justify-center mx-auto mb-6 border border-error/20">
              <ShieldAlert className="w-10 h-10 text-error animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-on-surface mb-2">Focus Stream Paused</h3>
            <p className="text-on-surface-variant text-base mb-8">
              System detected a window change. Let's redirect our cognitive load back to <strong className="text-primary font-bold">{subject}</strong>.
            </p>
            <button
              onClick={() => { setOffTrackAlert(false); setTimerRunning(true); }}
              className="w-full py-4 bg-primary text-white rounded-full font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all cursor-pointer"
            >
              Resume Study Session
            </button>
          </div>
        </div>
      )}

      {missionComplete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md rounded-3xl p-6">
          <div className="bg-white border border-outline-variant rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-[scaleIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200">
              <Sparkles className="w-10 h-10 text-amber-500 animate-[spin_5s_linear_infinite]" />
            </div>
            <h3 className="text-3xl font-black text-on-surface mb-2">Session Accomplished!</h3>
            <p className="text-on-surface-variant text-base mb-6">
              Fantastic work. You earned <strong className="text-amber-500 font-bold">+3 Star Coins</strong> for this achievement.
            </p>
            <div className="py-2.5 px-4 bg-amber-50 rounded-xl inline-block mb-8 border border-amber-100 text-amber-800 font-bold text-sm">
              Cognitive performance optimized
            </div>
            <button
              onClick={() => setShowReflection(true)}
              className="w-full py-4 bg-primary text-white rounded-full font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all cursor-pointer"
            >
              Log Session Reflection
            </button>
          </div>
        </div>
      )}

      {showReflection && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md rounded-3xl p-6">
          <div className="bg-white border border-outline-variant rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-[scaleIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-100">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-black text-on-surface mb-2">Reflect on Your Session</h3>
            <p className="text-on-surface-variant text-sm mb-8">How did focusing on {subject} feel to you?</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <button 
                onClick={() => submitReflection('easy')} 
                className="flex flex-col items-center p-4 rounded-2xl border border-outline-variant hover:border-primary hover:bg-primary-container/10 active:scale-95 transition-all cursor-pointer"
              >
                <div className="text-4xl">😁</div>
                <span className="text-xs font-bold text-on-surface mt-2">Flow Mode</span>
              </button>
              <button 
                onClick={() => submitReflection('good')} 
                className="flex flex-col items-center p-4 rounded-2xl border border-outline-variant hover:border-primary hover:bg-primary-container/10 active:scale-95 transition-all cursor-pointer"
              >
                <div className="text-4xl">🙂</div>
                <span className="text-xs font-bold text-on-surface mt-2">Engaged</span>
              </button>
              <button 
                onClick={() => submitReflection('hard')} 
                className="flex flex-col items-center p-4 rounded-2xl border border-outline-variant hover:border-primary hover:bg-primary-container/10 active:scale-95 transition-all cursor-pointer"
              >
                <div className="text-4xl">🏋️</div>
                <span className="text-xs font-bold text-on-surface mt-2">Challenging</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Focus Chamber Content Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center justify-center flex-1 w-full max-w-5xl mx-auto py-6">

        {/* LEFT: Central Orb Timer */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">

          {/* Glowing Timer Circle */}
          <div className="relative w-80 h-80 flex items-center justify-center">
            
            {/* SVG Progress Ring */}
            <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 280 280">
              {/* Back track */}
              <circle
                className="text-slate-100"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                r={normalizedRadius}
                cx="140"
                cy="140"
              />
              {/* Active track */}
              <circle
                className="text-primary transition-all duration-300 ease-linear"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={normalizedRadius}
                cx="140"
                cy="140"
              />
            </svg>

            {/* Inner Ethereal Glow Panel */}
            <div className={`w-[230px] h-[230px] flex flex-col items-center justify-center rounded-full border border-white/60 bg-white/75 backdrop-blur-xl shadow-lg transition-all duration-700 ${timerRunning ? 'scale-105 shadow-[0_8px_32px_rgba(2,132,199,0.08)]' : ''}`}>
              {timerRunning ? (
                <Compass className="w-8 h-8 text-primary mb-1 animate-spin" style={{ animationDuration: '6s' }} />
              ) : (
                <Brain className="w-8 h-8 text-slate-400 mb-1 opacity-60" />
              )}

              <div className="font-extrabold text-5xl leading-none text-on-surface tracking-tight font-mono select-all">
                {formatTime(secondsRemaining)}
              </div>

              <div className={`mt-3 px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[9px] ${timerRunning ? 'bg-primary-container text-primary-on-primary-container' : 'bg-slate-100 text-slate-500'}`}>
                {timerRunning ? 'Focus Shield Active' : 'Sanctuary Standby'}
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setTimerRunning(!timerRunning);
                if (!timerRunning && !musicPlaying) setMusicPlaying(true);
              }}
              className={`px-8 py-3.5 rounded-full font-bold text-lg flex items-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${timerRunning
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/10 hover:bg-red-600'
                  : 'bg-primary text-white shadow-md shadow-primary/10 hover:bg-primary/95'
                }`}
            >
              {timerRunning ? (
                <>
                  <Pause className="w-5 h-5" /> Pause Session
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" /> Begin Sync
                </>
              )}
            </button>
          </div>

        </div>

        {/* RIGHT: Helpers and Controls Panel */}
        <div className="flex-1 w-full max-w-md space-y-6">

          {/* Helper Bot Context */}
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-3xl p-6 shadow-sm relative">
            <div className="flex items-start gap-4">
              <div className="bg-primary-container/40 p-3.5 rounded-2xl border border-primary/10 text-primary flex-shrink-0 shadow-inner">
                <Smile className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-on-surface font-extrabold text-lg mb-1">Sanctuary Guide</h3>
                <div className="bg-slate-50 border border-outline-variant p-4 rounded-2xl">
                  <p className="text-on-surface-variant font-medium text-sm leading-relaxed">
                    "{botMessage}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Real Audio Toggle */}
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-3xl p-5 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${musicPlaying ? 'bg-primary-container text-primary animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                <Music className="w-6 h-6" />
              </div>
              <div>
                <span className="block font-bold text-on-surface text-base">Ambient Shield</span>
                <span className="block text-on-surface-variant text-xs font-medium">Binaural space hum to block clutter</span>
              </div>
            </div>

            <button
              onClick={() => setMusicPlaying(!musicPlaying)}
              className={`p-3 rounded-xl transition-all cursor-pointer hover:bg-slate-50 active:scale-95 border border-outline-variant ${musicPlaying
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-white text-slate-600'
                }`}
            >
              {musicPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          {/* Space Co-Pilots (Peers) */}
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-3xl p-5 flex items-center gap-4 shadow-sm">
            <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 text-purple-600 flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-on-surface font-bold text-base">Active Co-Pilots</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p className="text-on-surface-variant text-xs font-semibold">4 active learners in this cluster</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Exit Button */}
      <div className="relative z-10 mt-6 flex justify-center w-full pb-2">
        <button
          onClick={() => {
            setTimerRunning(false);
            setMusicPlaying(false);
            setShowReflection(true);
          }}
          className="bg-transparent border border-outline-variant hover:border-error/20 hover:bg-error-container/20 hover:text-error px-6 py-3 rounded-full flex items-center gap-2 text-on-surface-variant text-sm font-bold transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Focus Chamber</span>
        </button>
      </div>

    </div>
  );
}