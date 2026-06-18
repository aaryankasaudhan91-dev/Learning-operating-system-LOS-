/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Star, ShieldAlert, Music, Users, LogOut, Sparkles, Brain, Smile, Volume2, VolumeX } from 'lucide-react';
import { AppView } from '../types';

interface SpaceMissionProps {
  setView: (view: AppView) => void;
  setCognitiveLoad: React.Dispatch<React.SetStateAction<number>>;
}

export default function SpaceMission({ setView, setCognitiveLoad }: SpaceMissionProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [musicPlaying, setMusicPlaying] = useState<boolean>(false);

  // Gamification States
  const [starsEarned, setStarsEarned] = useState<number>(0);
  const [offTrackAlert, setOffTrackAlert] = useState<boolean>(false);
  const [showReflection, setShowReflection] = useState<boolean>(false);
  const [missionComplete, setMissionComplete] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>("Reading Time");

  const [botMessage, setBotMessage] = useState<string>("Ready for liftoff! Let's focus on our mission.");

  // --- AUDIO SETUP ---
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Using a stable, non-distracting "Space Room Hum" provided by Google's free sound library.
    // It acts like white noise, which is proven to help kids with ADHD/focus issues.
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/science_fiction/space_room_hum.ogg');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

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
      "You are doing a great job! Keep it up! 🌟",
      "Your brain is getting stronger every minute! 🧠",
      "Almost there, space cadet! 👨‍🚀",
      "Wow, look at you focus! 🚀",
      "Cruising through the galaxy of learning! ✨"
    ];
    const interval = setInterval(() => {
      setBotMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 120000); // Change every 2 minutes
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

  return (
    // Deep Space Background with radial gradient
    <div className="relative w-full min-h-[85vh] flex flex-col justify-start bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black select-none p-6 rounded-3xl font-sans overflow-hidden border-8 border-indigo-950 shadow-2xl">

      {/* Decorative Floating Stars Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            className={`absolute text-yellow-200 animate-pulse`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 20 + 10}px`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      {/* Top Bar: Dashboard Status */}
      <div className="relative z-10 flex justify-between items-center mb-8 bg-white/10 backdrop-blur-md p-4 rounded-2xl border-4 border-indigo-500/50 shadow-lg">
        <div className="flex items-center gap-3 bg-indigo-900/80 px-6 py-2 rounded-xl border-2 border-indigo-400">
          <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-[spin_4s_linear_infinite]" />
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
            Stars: {starsEarned}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-indigo-200 font-black tracking-wider uppercase text-sm">Mission Log:</span>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-3 font-black outline-none border-b-4 border-indigo-800 cursor-pointer transition-colors shadow-inner"
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
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md rounded-2xl">
          <div className="bg-gradient-to-b from-orange-500 to-red-600 border-8 border-white rounded-[2rem] p-10 max-w-lg text-center shadow-[0_0_50px_rgba(249,115,22,0.6)]">
            <ShieldAlert className="w-24 h-24 text-white mx-auto mb-6 animate-bounce" />
            <h3 className="text-4xl font-black text-white mb-4 drop-shadow-md">Spaceship Drifting!</h3>
            <p className="text-white/90 text-2xl font-bold mb-8">Looks like you left the dashboard. Let's get back to {subject}!</p>
            <button
              onClick={() => { setOffTrackAlert(false); setTimerRunning(true); }}
              className="px-10 py-4 bg-white text-red-600 rounded-full font-black text-2xl border-b-8 border-gray-300 hover:border-b-4 hover:translate-y-1 active:border-b-0 active:translate-y-2 transition-all"
            >
              🚀 Back to Mission!
            </button>
          </div>
        </div>
      )}

      {missionComplete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-indigo-900/95 backdrop-blur-md rounded-2xl">
          <div className="bg-gradient-to-b from-yellow-300 to-yellow-500 border-8 border-white rounded-[2rem] p-10 max-w-lg text-center shadow-[0_0_50px_rgba(253,224,71,0.6)]">
            <Sparkles className="w-24 h-24 text-white mx-auto mb-4 animate-spin" />
            <h3 className="text-5xl font-black text-indigo-900 mb-4 drop-shadow-sm">MISSION ACCOMPLISHED!</h3>
            <p className="text-indigo-900 text-2xl font-bold mb-2 bg-white/30 rounded-xl py-2">+3 Star Coins Earned!</p>
            <p className="text-indigo-800 text-lg font-bold mb-8">Your brain power grew so much today.</p>
            <button
              onClick={() => setShowReflection(true)}
              className="px-10 py-4 bg-indigo-600 text-white rounded-full font-black text-2xl border-b-8 border-indigo-900 hover:border-b-4 hover:translate-y-1 active:border-b-0 active:translate-y-2 transition-all"
            >
              🎁 Claim Rewards!
            </button>
          </div>
        </div>
      )}

      {showReflection && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md rounded-2xl">
          <div className="bg-slate-800 border-8 border-indigo-500 rounded-[2rem] p-10 max-w-lg text-center shadow-2xl">
            <Brain className="w-20 h-20 text-pink-400 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-white mb-8">How did {subject} feel today?</h3>
            <div className="flex justify-center gap-6 mb-6">
              <button onClick={() => submitReflection('easy')} className="flex flex-col items-center group">
                <div className="text-6xl bg-slate-700 p-6 rounded-3xl border-b-8 border-slate-900 group-hover:border-b-4 group-hover:translate-y-1 group-active:border-b-0 group-active:translate-y-2 group-hover:bg-green-500/20 transition-all">😁</div>
                <span className="text-xl text-green-400 font-black mt-4">Easy!</span>
              </button>
              <button onClick={() => submitReflection('good')} className="flex flex-col items-center group">
                <div className="text-6xl bg-slate-700 p-6 rounded-3xl border-b-8 border-slate-900 group-hover:border-b-4 group-hover:translate-y-1 group-active:border-b-0 group-active:translate-y-2 group-hover:bg-yellow-500/20 transition-all">🙂</div>
                <span className="text-xl text-yellow-400 font-black mt-4">Good</span>
              </button>
              <button onClick={() => submitReflection('hard')} className="flex flex-col items-center group">
                <div className="text-6xl bg-slate-700 p-6 rounded-3xl border-b-8 border-slate-900 group-hover:border-b-4 group-hover:translate-y-1 group-active:border-b-0 group-active:translate-y-2 group-hover:bg-red-500/20 transition-all">🏋️</div>
                <span className="text-xl text-red-400 font-black mt-4">Hard work</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center justify-center flex-1 w-full max-w-5xl mx-auto">

        {/* LEFT: Central Orb Timer */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-10">

          {/* Glowing Window/Orb */}
          <div className={`relative w-80 h-80 flex items-center justify-center rounded-full border-[12px] shadow-[0_0_60px_rgba(0,0,0,0.5)] transition-all duration-700 ${timerRunning ? 'bg-indigo-900 border-green-400 shadow-[0_0_80px_rgba(74,222,128,0.4)]' : 'bg-slate-800 border-slate-600'}`}>

            {/* Inner glass reflection */}
            <div className="absolute inset-2 rounded-full border-2 border-white/10 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

            <div className="text-center z-10 flex flex-col items-center transform transition-transform">
              {timerRunning ? (
                <Rocket className="w-16 h-16 text-green-300 mb-2 animate-[bounce_2s_ease-in-out_infinite]" />
              ) : (
                <Rocket className="w-16 h-16 text-slate-500 mb-2 opacity-50" />
              )}

              <div className="font-black text-[5.5rem] leading-none text-white tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                {formatTime(secondsRemaining)}
              </div>

              <div className={`mt-4 px-6 py-2 rounded-full font-black uppercase tracking-widest text-sm ${timerRunning ? 'bg-green-500/20 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
                {timerRunning ? 'Engine Firing' : 'Ready on pad'}
              </div>
            </div>
          </div>

          {/* 3D Action Button */}
          <button
            onClick={() => {
              setTimerRunning(!timerRunning);
              // Auto-start music if they launch for the first time
              if (!timerRunning && !musicPlaying) setMusicPlaying(true);
            }}
            className={`w-72 py-5 rounded-[2rem] font-black text-3xl uppercase tracking-wider transition-all duration-200 active:border-b-0 active:translate-y-4 shadow-2xl ${timerRunning
                ? 'bg-red-500 text-white border-b-[12px] border-red-700 hover:bg-red-400 hover:border-b-8 hover:translate-y-1'
                : 'bg-green-500 text-white border-b-[12px] border-green-700 hover:bg-green-400 hover:border-b-8 hover:translate-y-1'
              }`}
          >
            {timerRunning ? 'Stop Engine' : 'LAUNCH! 🚀'}
          </button>

        </div>

        {/* RIGHT: Helpers and Controls Panel */}
        <div className="flex-1 w-full max-w-md space-y-6">

          {/* Helper Bot Context */}
          <div className="bg-white/10 backdrop-blur-md border-4 border-indigo-400/50 rounded-3xl p-6 shadow-xl relative mt-8">
            <div className="absolute -top-10 -left-6 bg-gradient-to-b from-yellow-300 to-yellow-500 w-20 h-20 rounded-full border-4 border-indigo-900 flex items-center justify-center shadow-[0_0_20px_rgba(253,224,71,0.5)] animate-[bounce_4s_ease-in-out_infinite]">
              <Smile className="w-12 h-12 text-indigo-900" />
            </div>
            <h3 className="text-indigo-200 font-black text-xl mb-3 ml-12 uppercase tracking-wide">Helper Bot</h3>
            <div className="bg-indigo-950/50 p-4 rounded-2xl border-2 border-indigo-500/30">
              <p className="text-white font-bold text-xl leading-snug">
                "{botMessage}"
              </p>
            </div>
          </div>

          {/* Real Audio Toggle */}
          <div className="bg-white/10 backdrop-blur-md border-4 border-indigo-400/50 rounded-3xl p-5 flex justify-between items-center group">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${musicPlaying ? 'bg-indigo-500 text-white animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                <Music className="w-6 h-6" />
              </div>
              <div>
                <span className="block font-black text-white text-xl">Space Ambience</span>
                <span className="block text-indigo-200 text-sm font-bold">Helps brains focus</span>
              </div>
            </div>

            <button
              onClick={() => setMusicPlaying(!musicPlaying)}
              className={`p-4 rounded-2xl font-black transition-all active:translate-y-2 active:border-b-0 ${musicPlaying
                  ? 'bg-indigo-500 border-b-8 border-indigo-700 text-white hover:border-b-4 hover:translate-y-1'
                  : 'bg-slate-700 border-b-8 border-slate-900 text-slate-300 hover:border-b-4 hover:translate-y-1'
                }`}
            >
              {musicPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
          </div>

          {/* Space Co-Pilots (Peers) */}
          <div className="bg-white/10 backdrop-blur-md border-4 border-indigo-400/50 rounded-3xl p-5 flex items-center gap-5">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-4 rounded-2xl shadow-inner border-2 border-cyan-300">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-xl mb-1">Co-Pilots Online</p>
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <p className="text-cyan-200 text-base font-bold">4 friends studying right now!</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Exit Button */}
      <div className="relative z-10 mt-10 flex justify-center w-full pb-4">
        <button
          onClick={() => {
            setTimerRunning(false);
            setMusicPlaying(false);
            setShowReflection(true);
          }}
          className="bg-slate-800/80 backdrop-blur border-4 border-slate-600 px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-slate-700 hover:-translate-y-1 active:translate-y-1 text-slate-300 transition-all font-black text-lg"
        >
          <LogOut className="w-6 h-6" />
          <span>Exit Spaceship Early</span>
        </button>
      </div>

    </div>
  );
}