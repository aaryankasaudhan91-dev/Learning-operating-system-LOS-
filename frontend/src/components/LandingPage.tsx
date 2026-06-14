/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Compass, Cpu, HelpCircle, Activity, HeartHandshake } from 'lucide-react';
import { AppView } from '../types';
import { AppLogo } from './AppLogo';

interface LandingPageProps {
  setView: (view: AppView) => void;
  setUserRole: (role: 'student' | 'mentor') => void;
}

export default function LandingPage({ setView, setUserRole }: LandingPageProps) {
  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-start text-center pt-16 px-4 overflow-hidden select-none">
      {/* Background radial glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-electric-cyan/15 rounded-full blur-[110px]" />
      <div className="absolute bottom-1/4 right-[10%] w-[500px] h-[500px] bg-plasma-violet/15 rounded-full blur-[140px]" />

      {/* Main hero showcase text section */}
      <section className="min-h-[700px] flex flex-col items-center justify-center relative max-w-4xl z-10 space-y-8 px-6 pt-12">
        <AppLogo className="w-24 h-24 mb-6" showText={false} />
        
        <h1 className="font-sans font-extrabold text-5xl md:text-7xl tracking-tighter leading-tight animate-pulse bg-gradient-to-r from-electric-cyan to-plasma-violet bg-clip-text text-transparent">
          Close the Effectiveness Gap
        </h1>
        <p className="font-sans text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          An ethereal operating system for your mind. Synchronize your cognitive state, calibrate working memory, and master profound focus.
        </p>

        {/* Hero Interactive CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 w-full max-w-md mx-auto">
          <button
            onClick={() => { setView('login'); }}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-electric-cyan to-plasma-violet text-void-black font-extrabold text-base tracking-wide flex items-center justify-center gap-2 hover:scale-105 hover:shadow-lg hover:shadow-plasma-violet/30 active:scale-95 transition-all"
          >
            <span>Log In</span>
            <ArrowRight className="w-5 h-5 font-bold" />
          </button>
          
          <button
            onClick={() => { setView('register'); }}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border border-glass-stroke backdrop-blur-md text-on-surface font-semibold text-base flex items-center justify-center gap-2 hover:bg-white/5 hover:border-electric-cyan hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span>Create Signature</span>
            <Compass className="w-5 h-5 text-electric-cyan" />
          </button>
        </div>

        {/* Sentient Neural Graphic Placeholder (3D neural mesh) */}
        <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto flex items-center justify-center pointer-events-none mt-12 opacity-30 select-none">
          <div className="absolute inset-0 rounded-full border border-electric-cyan/20 animate-ping" style={{ animationDuration: '6s' }} />
          <div className="absolute w-[80%] h-[80%] rounded-full border border-plasma-violet/20 animate-[spin_10s_linear_infinite]" />
          <div className="absolute w-[60%] h-[60%] rounded-full border border-synapse-green/25 animate-[spin_15s_linear_infinite_reverse]" />
          <img 
            alt="Abstract neural network" 
            className="w-full h-full object-contain mix-blend-screen filter hue-rotate-15"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDi1FrkItjY4ZFT7dlzgbTV9tTlPoSxeWO6Agl0HjIXFgKZEZxSeHJzp3A0H_-7ZV8_57xH_mszGyOsTS_J3Z_R-oix2KuTYKcCbwsMROupksl4_SmRKVl6ysXWBWU4oRrc0EJ3DzPOIPB2jJARkOvXwBp4r7i5i7klLm6fwMk43_4TY9VdpY9HfktMrY4HX_CI2d_IAyo5pn2otbg7fLwSuRLs-5H9PlTWCuWEry3xY6F3H0Gj-rvhtsYVWfCKTQLHNUo0zTLQEw"
          />
        </div>
      </section>

      {/* Narrative Scrollytelling Sections */}
      <section className="mt-28 px-6 max-w-5xl mx-auto w-full space-y-40 pb-20">
        
        {/* Real-time Personalization block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[400px]">
          <div className="md:col-span-6 text-left space-y-6">
            <h2 className="font-sans font-bold text-3xl text-electric-cyan flex items-center gap-3">
              <Activity className="w-8 h-8 text-electric-cyan" />
              Real-time Personalization
            </h2>
            <p className="font-sans text-on-surface-variant leading-relaxed">
              The system observes your cognitive load and adapts the learning environment instantly. By analyzing interaction rhythms and comprehension speeds, it shapes the informational flow to match your peak receptive state.
            </p>
          </div>
          <div className="md:col-span-6 flex justify-center">
            <div className="glass-panel rounded-2xl w-full max-w-sm aspect-square p-8 glow-hover flex flex-col items-center justify-center text-center group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-electric-cyan/10 to-plasma-violet/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Cpu className="w-24 h-24 text-plasma-violet mb-6 group-hover:scale-110 transition-transform duration-500" />
              <h3 className="font-sans font-extrabold text-xl text-on-surface">
                Dynamic Working Memory Calibration
              </h3>
            </div>
          </div>
        </div>

        {/* Second block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[400px]">
          <div className="md:col-span-6 flex justify-center order-2 md:order-1">
            <div className="glass-panel rounded-2xl w-full max-w-sm aspect-square p-8 glow-hover flex flex-col items-center justify-center text-center group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-plasma-violet/10 to-synapse-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="text-7xl font-sans font-extrabold bg-gradient-to-tr from-sun-yellow to-synapse-green bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500 mb-6">
                ∞
              </span>
              <h3 className="font-sans font-extrabold text-xl text-on-surface">
                Spaced Repetition Engine
              </h3>
            </div>
          </div>
          <div className="md:col-span-6 text-left space-y-6 order-1 md:order-2">
            <h2 className="font-sans font-bold text-3xl text-synapse-green flex items-center gap-3">
              <HeartHandshake className="w-8 h-8 text-synapse-green" />
              Mental Well-being at the Core
            </h2>
            <p className="font-sans text-on-surface-variant leading-relaxed">
              Learning should not lead to burnout. LOS integrates ambient mental health checks, offering restorative breaks and breathing exercises when it detects cognitive fatigue, ensuring a sustainable intellectual journey.
            </p>
          </div>
        </div>

      </section>
    </div>
  );
}
