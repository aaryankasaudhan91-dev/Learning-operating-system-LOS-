/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Compass, MousePointer, Activity, Brain, Heart, ChevronDown } from 'lucide-react';
import { AppView } from '../types';
import { AppLogo } from './AppLogo';

interface LandingPageProps {
  setView: (view: AppView) => void;
  setUserRole: (role: 'student' | 'mentor') => void;
}

// Particle definition for scrollytelling canvas
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  radius: number;
  color: string;
  label?: string;
}

export default function LandingPage({ setView, setUserRole }: LandingPageProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('intro');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Section definitions for Scrollytelling
  const sections = [
    {
      id: 'intro',
      phase: 'PHASE 01',
      title: 'The Cognitive Crisis',
      subtitle: 'Information Overload & Friction',
      description: 'Our working memory is under constant attack. Fragmented notifications, context switching, and static content push our brains into overload. Standard operating environments ignore our mental capacity, causing fatigue, distraction, and burnout.',
      color: 'text-error',
      bgColor: 'bg-error/10',
      accentColor: '#dc2626'
    },
    {
      id: 'calibration',
      phase: 'PHASE 02',
      title: 'Dynamic Calibration',
      subtitle: 'Real-time Neural Telemetry',
      description: 'Learner OS continuously monitors your interaction rhythm, latency, and focus behaviors. It dynamically calibrates interface complexity, adjusts task difficulty, and structures content to match your personal cognitive baseline.',
      color: 'text-plasma-violet',
      bgColor: 'bg-plasma-violet/10',
      accentColor: '#7c3aed'
    },
    {
      id: 'sync',
      phase: 'PHASE 03',
      title: 'The Synapse Loop',
      subtitle: 'Spaced Memory Consolidation',
      description: 'No more cramming or artificial deadlines. LOS integrates active recall and memory decay timers directly into your daily workflow. The system triggers micro-synthesis tasks exactly when memory decay is starting, locking in long-term retention.',
      color: 'text-synapse-green',
      bgColor: 'bg-synapse-green/10',
      accentColor: '#059669'
    },
    {
      id: 'flow',
      phase: 'PHASE 04',
      title: 'Peak Ethereal Flow',
      subtitle: 'Sustainable Focus Chambers',
      description: 'Grind culture is obsolete. We place mental wellness at the core of productivity. When telemetry registers cognitive exhaustion, Learner OS adapts—suggesting restorative breath chambers, reducing sensory overload, and restoring calm.',
      color: 'text-electric-cyan',
      bgColor: 'bg-electric-cyan/10',
      accentColor: '#0284c7'
    }
  ];

  // Track scroll and update active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollTotal > 0) {
        setScrollProgress(window.scrollY / scrollTotal);
      }

      // Check which section is in the viewport
      const sectionElements = sections.map(sec => document.getElementById(`sec-${sec.id}`));
      let currentActive = 'intro';
      const triggerBound = window.innerHeight * 0.45; // trigger halfway up screen

      sectionElements.forEach((el, index) => {
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerBound && rect.bottom >= triggerBound) {
            currentActive = sections[index].id;
          }
        }
      });

      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial run

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Morphing Neural Network Canvas Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = 450);
    let height = (canvas.height = 450);

    const particles: Particle[] = [];
    const particleCount = 28;
    const labels = ['Notifications', 'Slack Alert', 'Exam Prep', 'Context Swapping', 'Telemetry', 'Memory Sync', 'Alpha Waves', 'Flow Zone'];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        targetX: x,
        targetY: y,
        radius: Math.random() * 3.5 + 2,
        color: 'rgba(255, 255, 255, 0.7)',
        label: i < labels.length ? labels[i] : undefined
      });
    }

    let time = 0;
    let calibrationLineY = 0;
    let syncPulseProgress = 0;

    const render = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Update particle targets and styles based on active scrolly section
      particles.forEach((p, i) => {
        if (activeSection === 'intro') {
          // Chaos State: random targets that move slowly, red/orange coloring
          p.targetX = p.x + p.vx;
          p.targetY = p.y + p.vy;

          // Keep in bounds
          if (p.targetX < 20 || p.targetX > width - 20) p.vx *= -1;
          if (p.targetY < 20 || p.targetY > height - 20) p.vy *= -1;

          p.color = 'rgba(239, 68, 68, 0.75)'; // Red
        } else if (activeSection === 'calibration') {
          // Structured Grid/Circle State: nodes align into clean Concentric Rings
          const angle = (i / particleCount) * Math.PI * 2;
          const radius = i % 2 === 0 ? 80 : 130;
          p.targetX = centerX + Math.cos(angle) * radius;
          p.targetY = centerY + Math.sin(angle) * radius;
          p.color = 'rgba(124, 58, 237, 0.75)'; // Purple
        } else if (activeSection === 'sync') {
          // Double Helix State: aligned along sine waves
          const strand = i % 2 === 0 ? 1 : -1;
          const fraction = (i / particleCount);
          const xPos = 40 + fraction * (width - 80);
          const phaseOffset = fraction * Math.PI * 3 + time * 0.03;
          const yPos = centerY + Math.sin(phaseOffset) * 60 * strand;

          p.targetX = xPos;
          p.targetY = yPos;
          p.color = 'rgba(5, 150, 105, 0.75)'; // Green
        } else if (activeSection === 'flow') {
          // Calm Concentric Orbit State: orbiting slowly in perfect alignment
          const orbitIndex = i % 3;
          const radius = 50 + orbitIndex * 50;
          const speed = 0.015 / (orbitIndex + 1);
          const angle = (i / particleCount) * Math.PI * 2 + time * speed;
          
          p.targetX = centerX + Math.cos(angle) * radius;
          p.targetY = centerY + Math.sin(angle) * radius;
          p.color = 'rgba(2, 132, 199, 0.85)'; // Cyan
        }

        // Interpolate to target coordinates smoothly
        p.x += (p.targetX - p.x) * 0.08;
        p.y += (p.targetY - p.y) * 0.08;

        // Draw connections
        particles.forEach((p2, j) => {
          if (i === j) return;
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          let connectionLimit = 75;
          if (activeSection === 'intro') connectionLimit = 95; // more lines = more clutter
          if (activeSection === 'flow') connectionLimit = 60; // clean, concise connections

          if (distance < connectionLimit) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);

            let strokeColor = 'rgba(255,255,255,0.06)';
            if (activeSection === 'intro') {
              strokeColor = `rgba(239, 68, 68, ${0.18 * (1 - distance / connectionLimit)})`;
            } else if (activeSection === 'calibration') {
              strokeColor = `rgba(124, 58, 237, ${0.15 * (1 - distance / connectionLimit)})`;
            } else if (activeSection === 'sync') {
              strokeColor = `rgba(5, 150, 105, ${0.15 * (1 - distance / connectionLimit)})`;
            } else if (activeSection === 'flow') {
              strokeColor = `rgba(2, 132, 199, ${0.25 * (1 - distance / connectionLimit)})`;
            }
            
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = activeSection === 'flow' ? 12 : 0;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Draw Text Labels in Chaos Intro state
        if (activeSection === 'intro' && p.label && i % 3 === 0) {
          ctx.font = '500 10px Courier, monospace';
          ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.fillText(p.label, p.x + 8, p.y + 4);
        }
      });

      // State Specific Graphic Overlays
      if (activeSection === 'intro') {
        // Warning outline
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, width - 20, height - 20);

        ctx.font = '700 11px Courier, monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('CRITICAL LOAD EXCEEDED', 25, 30);
      } else if (activeSection === 'calibration') {
        // Scan line animation
        calibrationLineY = (calibrationLineY + 2.5) % height;
        ctx.beginPath();
        ctx.moveTo(10, calibrationLineY);
        ctx.lineTo(width - 10, calibrationLineY);
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.45)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#7c3aed';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Overlay status info
        ctx.font = '700 10px Courier, monospace';
        ctx.fillStyle = '#7c3aed';
        ctx.fillText(`SWEEP TELEMETRY: ACTIVE`, 25, 30);
        ctx.fillText(`COGNITIVE BANDWIDTH: CALIBRATING 88%`, 25, 45);
      } else if (activeSection === 'sync') {
        // Green memory pulses moving down the double helix
        syncPulseProgress = (syncPulseProgress + 0.005) % 1;
        const pulseIndex = Math.floor(syncPulseProgress * particles.length);
        const pulseParticle = particles[pulseIndex];

        if (pulseParticle) {
          ctx.beginPath();
          ctx.arc(pulseParticle.x, pulseParticle.y, 14, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(5, 150, 105, 0.15)';
          ctx.strokeStyle = 'rgba(5, 150, 105, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();
        }

        ctx.font = '700 10px Courier, monospace';
        ctx.fillStyle = '#059669';
        ctx.fillText(`SYNAPSE LOOP: SYNCHRONIZED`, 25, 30);
        ctx.fillText(`DECAY TIMER: SUSPENDED`, 25, 45);
      } else if (activeSection === 'flow') {
        // Deep focus center pulse
        const pulseRadius = 35 + Math.sin(time * 0.04) * 8;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(2, 132, 199, 0.05)';
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#0284c7';
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '700 10px Courier, monospace';
        ctx.fillStyle = '#0284c7';
        ctx.fillText(`FLOW CHAMBER: STABILIZED`, 25, 30);
        ctx.fillText(`FRICTION COEFFICIENT: 0.00`, 25, 45);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [activeSection]);

  const activeColor = sections.find(s => s.id === activeSection)?.accentColor || '#0284c7';

  return (
    <div ref={containerRef} className="relative min-h-screen bg-void-black text-on-surface select-none pb-24">
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-20 left-0 h-1 z-50 transition-all duration-100"
        style={{ 
          width: `${scrollProgress * 100}%`,
          backgroundColor: activeColor,
          boxShadow: `0 0 8px ${activeColor}`
        }}
      />

      {/* Background ambient glowing lights */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-electric-cyan/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-plasma-violet/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 pt-12">
        <div className="space-y-6 max-w-4xl z-10 animate-[fadeIn_0.6s_ease-out]">
          <AppLogo className="w-24 h-24 mx-auto mb-4 hover:scale-105 transition-transform duration-500" showText={false} />
          
          <h1 className="font-sans font-black text-5xl md:text-8xl tracking-tight leading-[0.9] text-on-surface uppercase italic">
            Close the <span className="bg-gradient-to-r from-electric-cyan via-plasma-violet to-synapse-green bg-clip-text text-transparent">Effectiveness</span> Gap
          </h1>
          
          <p className="font-sans text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed opacity-80 pt-2">
            An ethereal operating system for your mind. Synchronize your cognitive state, calibrate working memory, and master profound focus.
          </p>

          {/* Interactive CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10 w-full max-w-md mx-auto">
            <button
              onClick={() => setView('login')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-electric-cyan to-plasma-violet text-white font-extrabold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(2,132,199,0.35)] active:scale-95 transition-all duration-300 group cursor-pointer"
            >
              <span>Initialize Sync</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => setView('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border border-glass-stroke backdrop-blur-md text-on-surface font-extrabold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/5 hover:border-electric-cyan hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] active:scale-95 transition-all duration-300 group cursor-pointer"
            >
              <span>Register Identity</span>
              <Compass className="w-4 h-4 text-electric-cyan group-hover:rotate-45 transition-transform duration-500" />
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-on-surface-variant animate-bounce pt-8 opacity-60">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll to Unfold</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* STORYTELLING WRAPPER */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 mt-20 relative">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* Scrollable Story Content (Left side) */}
          <div className="w-full md:w-1/2 space-y-[45vh] pr-0 md:pr-10 relative z-10">
            {sections.map((sec, idx) => (
              <div 
                key={sec.id} 
                id={`sec-${sec.id}`}
                className={`transition-all duration-700 min-h-[55vh] flex flex-col justify-center text-left ${
                  activeSection === sec.id ? 'opacity-100 translate-x-0' : 'opacity-25 md:scale-95'
                }`}
              >
                <div className="space-y-4">
                  <span className={`font-mono text-xs font-bold tracking-[0.3em] uppercase ${sec.color} px-3 py-1 rounded-full ${sec.bgColor} w-fit block`}>
                    {sec.phase}
                  </span>
                  
                  <h2 className="font-sans font-black text-3xl md:text-5xl text-on-surface leading-tight uppercase">
                    {sec.title}
                  </h2>
                  
                  <h3 className="font-sans font-extrabold text-lg md:text-xl text-on-surface-variant italic">
                    {sec.subtitle}
                  </h3>

                  <p className="font-sans text-base md:text-lg text-on-surface-variant leading-relaxed pt-2">
                    {sec.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky Canvas Visualizer Panel (Right side) */}
          <div className="hidden md:block w-1/2 sticky top-32 h-[80vh] flex-shrink-0 z-0">
            <div className="glass-panel rounded-3xl w-full h-[60vh] flex flex-col items-center justify-center p-6 relative overflow-hidden bg-white/5 border border-glass-stroke shadow-2xl">
              {/* Internal glow backdrop reflecting the active state */}
              <div 
                className="absolute inset-0 opacity-10 blur-[100px] rounded-full transition-all duration-700 pointer-events-none"
                style={{ 
                  backgroundColor: activeColor,
                  transform: 'scale(1.2)' 
                }} 
              />
              
              <canvas 
                ref={canvasRef} 
                className="max-w-full max-h-full aspect-square z-10 transition-transform duration-700" 
              />

              {/* Status HUD readout at bottom */}
              <div className="absolute bottom-6 left-8 right-8 flex justify-between items-center font-mono text-[9px] text-on-surface-variant uppercase tracking-widest border-t border-glass-stroke pt-4 z-20">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-electric-cyan animate-ping" />
                  Telemetry: Active
                </span>
                <span>Mode: {activeSection}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section className="max-w-4xl mx-auto px-6 mt-40 text-center relative z-10">
        <div className="glass-panel rounded-3xl p-12 md:p-16 border border-glass-stroke bg-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-electric-cyan/5 via-plasma-violet/5 to-transparent pointer-events-none" />
          
          <h2 className="font-sans font-black text-3xl md:text-5xl text-on-surface uppercase italic mb-6">
            Synchronize Your Reality
          </h2>
          
          <p className="font-sans text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-10">
            Step beyond chaotic cognitive friction. Initialize your signature, connect with authorized mentors, and achieve sustainable flow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto">
            <button
              onClick={() => setView('login')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-electric-cyan to-plasma-violet text-white font-extrabold text-sm uppercase tracking-widest hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(2,132,199,0.35)] active:scale-95 transition-all cursor-pointer"
            >
              Enter Portal
            </button>
            <button
              onClick={() => setView('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border border-glass-stroke text-on-surface font-extrabold text-sm uppercase tracking-widest hover:bg-white/5 hover:border-electric-cyan transition-all cursor-pointer"
            >
              Register Signature
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
