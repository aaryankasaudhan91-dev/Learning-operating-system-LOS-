/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Compass, MousePointer, Activity, Brain, Heart, ChevronDown, Sparkles, CheckCircle2, Terminal, Cpu, Layers, HardDrive, Binary, Code2, ShieldCheck, Wrench, RotateCcw } from 'lucide-react';
import { AppView } from '../types';
import { AppLogo } from './AppLogo';
import Footer from './Footer';

interface LandingPageProps {
  setView: (view: AppView) => void;
  setUserRole: (role: 'student' | 'mentor') => void;
  theme?: 'dark' | 'light';
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

export default function LandingPage({ setView, setUserRole, theme = 'dark' }: LandingPageProps) {
  const isDark = theme === 'dark';
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('cramming');

  // Cinematic Dribbble Entry Animation State (0% -> 100% counter + orchestrated reveal)
  const [introProgress, setIntroProgress] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Continuous Kinetic Word Cycling
  const kineticWords = [
    { word: 'mind', gradient: 'from-pink-300 via-fuchsia-200 to-purple-300', glow: 'rgba(217,70,239,0.95)', bg: 'bg-fuchsia-500/25', label: 'Cognitive Calm' },
    { word: 'focus', gradient: 'from-cyan-300 via-sky-200 to-blue-300', glow: 'rgba(6,182,212,0.95)', bg: 'bg-cyan-500/25', label: 'Deep Attention' },
    { word: 'memory', gradient: 'from-emerald-300 via-teal-200 to-green-300', glow: 'rgba(16,185,129,0.95)', bg: 'bg-emerald-500/25', label: 'Active Retention' },
    { word: 'clarity', gradient: 'from-purple-300 via-violet-200 to-indigo-300', glow: 'rgba(168,85,247,0.95)', bg: 'bg-purple-500/25', label: 'Zero Burnout' },
    { word: 'rhythm', gradient: 'from-amber-300 via-rose-200 to-pink-300', glow: 'rgba(244,63,94,0.95)', bg: 'bg-rose-500/25', label: 'Daily Flow' }
  ];
  const [activeWordIdx, setActiveWordIdx] = useState(0);

  // Continuous Floating Sine Wave Phase
  const [floatPhase, setFloatPhase] = useState(0);

  // Continuous Live Study Flow Telemetry Stream
  const [sessionSeconds, setSessionSeconds] = useState(2745); // 45m 45s
  const [activeLogIdx, setActiveLogIdx] = useState(0);

  const liveLogs = [
    { text: "> Today's Plan: 3 Key Syllabus Concepts Scheduled", tag: 'SCHEDULED', color: 'text-slate-300' },
    { text: '> Active Recall: 5 Essential Formulas Refreshed', tag: '94% RECALL', color: 'text-emerald-400' },
    { text: '> Focus Chamber: 45 Minutes of Deep Flow Active', tag: 'ZERO DISTRACTION', color: 'text-cyan-400' },
    { text: '> Memory Decay Curve Defeated (+18% Retention)', tag: 'LOCKED', color: 'text-fuchsia-400' },
    { text: '> Study Streak: 14 Days Consistently Strong 🔥', tag: 'OPTIMAL', color: 'text-amber-400' }
  ];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Continuous kinetic animation timers (Cycling words, ticking study seconds, rotating micro-events)
  useEffect(() => {
    const wordTimer = setInterval(() => {
      setActiveWordIdx(prev => (prev + 1) % kineticWords.length);
    }, 2200);

    const clockTimer = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);

    const logTimer = setInterval(() => {
      setActiveLogIdx(prev => (prev + 1) % liveLogs.length);
    }, 2700);

    let animId: number;
    let start = performance.now();
    const floatLoop = (t: number) => {
      setFloatPhase((t - start) * 0.002);
      animId = requestAnimationFrame(floatLoop);
    };
    animId = requestAnimationFrame(floatLoop);

    return () => {
      clearInterval(wordTimer);
      clearInterval(clockTimer);
      clearInterval(logTimer);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Smooth cinematic counter sequence (replicates video: 3% -> 100%, draws border, then reveals UI)
  useEffect(() => {
    setIsRevealed(false);
    setIntroProgress(0);

    const duration = 2400; // 2.4 seconds to reach 100%
    const startTime = performance.now();
    let animId: number;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Quad ease-out curve matching video pacing
      const eased = 1 - Math.pow(1 - progress, 2);
      const value = Math.min(Math.round(eased * 100), 100);
      setIntroProgress(value);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setIntroProgress(100);
        // Small cinematic pause at 100% before unfolding UI elements
        const timer = setTimeout(() => {
          setIsRevealed(true);
        }, 320);
        return () => clearTimeout(timer);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Section definitions for Scrollytelling translated into friendly, accessible Study Terms
  const sections = [
    {
      id: 'cramming',
      phase: 'STAGE 01',
      title: 'The Cramming Trap',
      subtitle: 'Overcoming Study Fatigue & Memory Loss',
      role: 'Breaks the stressful cycle of all-night cramming and exam anxiety.',
      mechanisms: [
        'Automated review reminders that defeat the natural forgetting curve',
        'Distraction blocker that keeps your working memory fresh and focused',
        'Replaces panic study sessions with calm, effortless 30-minute daily blocks'
      ],
      description: 'Most students study by re-reading dense textbooks for hours, only to forget 70% within two days. LOS replaces chaotic cramming with structured, bite-sized study blocks that keep your mind energized.',
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      accentColor: '#f43f5e',
      iconName: 'Brain'
    },
    {
      id: 'daily_rhythm',
      phase: 'STAGE 02',
      title: 'Smart Daily Rhythm',
      subtitle: 'Personalized Study Plans Tailored to Your Energy',
      role: 'Automatically organizes your day so you always know what to study next.',
      mechanisms: [
        'Intelligent timetable that splits giant exam syllabi into easy daily milestones',
        'Adapts study difficulty dynamically to your individual learning pace',
        'Schedules heavy topics during peak focus hours and light revision in the evening'
      ],
      description: 'No two learners are identical. LOS calculates your personal focus baseline, scheduling demanding math or science concepts when your brain is sharpest, and lighter reading when energy dips.',
      color: 'text-plasma-violet',
      bgColor: 'bg-plasma-violet/10',
      accentColor: '#a855f7',
      iconName: 'Activity'
    },
    {
      id: 'memory_vault',
      phase: 'STAGE 03',
      title: 'The Memory Vault',
      subtitle: 'Active Recall & Spaced Practice That Never Fades',
      role: 'Ensures concepts stay locked in permanent memory for exams and beyond.',
      mechanisms: [
        'Smart micro-quizzes delivered right before memory decay begins',
        'Interactive flashcards that strengthen deep neural retention pathways',
        'Color-coded syllabus mastery maps showing exactly where you stand'
      ],
      description: 'Never blank out on an exam question again. LOS applies scientifically proven spaced repetition intervals, prompting you with quick active recall questions to transfer facts directly into lifelong memory.',
      color: 'text-synapse-green',
      bgColor: 'bg-synapse-green/10',
      accentColor: '#10b981',
      iconName: 'Sparkles'
    },
    {
      id: 'flow_chamber',
      phase: 'STAGE 04',
      title: 'Calm Focus Chamber',
      subtitle: 'Distraction-Free Deep Work & Stress Relief',
      role: 'Creates a peaceful study zone with zero anxiety and peak mental clarity.',
      mechanisms: [
        'Custom Pomodoro study timer with ambient lo-fi soundscapes and white noise',
        'Guided 2-minute restorative breathwork when study fatigue is detected',
        'Teacher & mentor feedback loops so you never stay stuck on tough problems'
      ],
      description: 'Top grades shouldn\'t cost your mental health. When study fatigue sets in, LOS gently guides you through calming restorative breaks, ensuring you remain confident, energized, and exam-ready.',
      color: 'text-electric-cyan',
      bgColor: 'bg-electric-cyan/10',
      accentColor: '#06b6d4',
      iconName: 'Heart'
    }
  ];

  // Track scroll and update active section using nearest-center distance calculation
  useEffect(() => {
    const handleScroll = () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollTotal > 0) {
        setScrollProgress(window.scrollY / scrollTotal);
      }

      // Check which section is closest to viewport active trigger zone
      const sectionElements = sections.map(sec => document.getElementById(`sec-${sec.id}`));
      const triggerPoint = window.innerHeight * 0.45;
      let closestSection = sections[0].id;
      let minDistance = Infinity;

      sectionElements.forEach((el, index) => {
        if (el) {
          const rect = el.getBoundingClientRect();
          const sectionCenter = (rect.top + rect.bottom) / 2;
          const distance = Math.abs(sectionCenter - triggerPoint);
          if (distance < minDistance) {
            minDistance = distance;
            closestSection = sections[index].id;
          }
        }
      });

      setActiveSection(closestSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial run

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Kinetic Typography & Glow Motion Canvas Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = 460);
    let height = (canvas.height = 460);

    const particles: Particle[] = [];
    const particleCount = 28;
    const studyKeywords = [
      'MIND', 'FOCUS', 'RECALL', 'FLOW', 'CALM',
      'RETAIN', 'MEMORY', 'CLARITY', 'INSIGHT', 'STREAK',
      'PEACE', 'CONFIDENCE', 'MASTERY', 'GROWTH', 'LEARN'
    ];

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
        label: i < studyKeywords.length ? studyKeywords[i] : undefined
      });
    }

    let time = 0;
    let pulseStep = 0;

    const render = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Update particle targets based on active study stage
      particles.forEach((p, i) => {
        if (activeSection === 'cramming') {
          // Stage 01: Scattered chaotic thoughts calming into orbit
          const angle = (i / particleCount) * Math.PI * 2 + time * 0.01;
          const radius = 80 + (i % 3) * 35;
          p.targetX = centerX + Math.cos(angle) * radius;
          p.targetY = centerY + Math.sin(angle) * radius;
          p.color = 'rgba(244, 63, 94, 0.85)';
        } else if (activeSection === 'daily_rhythm') {
          // Stage 02: Balanced study-rest sine rhythm
          const fraction = (i / particleCount);
          const xPos = 40 + fraction * (width - 80);
          const phaseOffset = fraction * Math.PI * 3 + time * 0.025;
          const yPos = centerY + Math.sin(phaseOffset) * 60;
          p.targetX = xPos;
          p.targetY = yPos;
          p.color = 'rgba(168, 85, 247, 0.85)';
        } else if (activeSection === 'memory_vault') {
          // Stage 03: Radiant memory retention network
          const angle = (i / particleCount) * Math.PI * 2;
          const radius = i % 2 === 0 ? 70 : 135;
          p.targetX = centerX + Math.cos(angle) * radius;
          p.targetY = centerY + Math.sin(angle) * radius;
          p.color = 'rgba(16, 185, 129, 0.9)';
        } else if (activeSection === 'flow_chamber') {
          // Stage 04: Calm concentric breathing flow rings
          const orbitIndex = i % 3;
          const breatheOffset = Math.sin(time * 0.03) * 12;
          const radius = 50 + orbitIndex * 45 + breatheOffset;
          const speed = 0.012 / (orbitIndex + 1);
          const angle = (i / particleCount) * Math.PI * 2 + time * speed;
          p.targetX = centerX + Math.cos(angle) * radius;
          p.targetY = centerY + Math.sin(angle) * radius;
          p.color = 'rgba(6, 182, 212, 0.9)';
        }

        // Smooth interpolation
        p.x += (p.targetX - p.x) * 0.08;
        p.y += (p.targetY - p.y) * 0.08;

        // Draw connections
        particles.forEach((p2, j) => {
          if (i === j) return;
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const limit = 75;

          if (distance < limit) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);

            let strokeColor = 'rgba(255,255,255,0.06)';
            if (activeSection === 'cramming') {
              strokeColor = `rgba(244, 63, 94, ${0.18 * (1 - distance / limit)})`;
            } else if (activeSection === 'daily_rhythm') {
              strokeColor = `rgba(168, 85, 247, ${0.2 * (1 - distance / limit)})`;
            } else if (activeSection === 'memory_vault') {
              strokeColor = `rgba(16, 185, 129, ${0.2 * (1 - distance / limit)})`;
            } else if (activeSection === 'flow_chamber') {
              strokeColor = `rgba(6, 182, 212, ${0.25 * (1 - distance / limit)})`;
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
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Render kinetic study keywords next to nodes
        if (p.label && (i % 2 === 0 || i < 8)) {
          ctx.font = '700 9px "Outfit", sans-serif';
          ctx.fillStyle = activeSection === 'cramming' ? 'rgba(251, 113, 133, 0.85)' :
                          activeSection === 'daily_rhythm' ? 'rgba(216, 180, 254, 0.85)' :
                          activeSection === 'memory_vault' ? 'rgba(110, 231, 183, 0.85)' :
                          'rgba(103, 232, 249, 0.85)';
          ctx.fillText(p.label, p.x + 8, p.y + 3);
        }
      });

      // Central Kinetic Glowing Study Badge (Inspired by Moxel Motion "control your mind with coolness")
      ctx.save();
      const glowColor = activeSection === 'cramming' ? '#f43f5e' :
                        activeSection === 'daily_rhythm' ? '#a855f7' :
                        activeSection === 'memory_vault' ? '#10b981' : '#06b6d4';

      ctx.shadowBlur = 25;
      ctx.shadowColor = glowColor;

      ctx.beginPath();
      ctx.arc(centerX, centerY, 38, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 15, 25, 0.9)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = glowColor;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Illuminated Word Inside Core
      ctx.font = '800 12px "Outfit", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const coreWord = activeSection === 'cramming' ? 'CLARITY' :
                        activeSection === 'daily_rhythm' ? 'RHYTHM' :
                        activeSection === 'memory_vault' ? 'RECALL' : 'PEACE';
      ctx.fillText(coreWord, centerX, centerY);
      ctx.restore();

      // Top Status Info Readout
      ctx.font = '700 10px monospace';
      ctx.fillStyle = glowColor;
      const stageText = activeSection === 'cramming' ? 'FATIGUE OVERCOME • FOCUS ORGANIZING' :
                        activeSection === 'daily_rhythm' ? 'DAILY STUDY FLOW • BALANCED PACE' :
                        activeSection === 'memory_vault' ? 'ACTIVE RECALL • 94% RETENTION' :
                        'CALM FOCUS CHAMBER • ZERO DISTRACTIONS';
      ctx.fillText(stageText, 25, 32);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [activeSection]);

  const activeColor = sections.find(s => s.id === activeSection)?.accentColor || '#0284c7';

  return (
    <div ref={containerRef} className="relative min-h-screen bg-void-black text-on-surface select-none pb-0">
      {/* Scroll Progress Bar (hidden when resting on hero section) */}
      <div 
        className="fixed top-20 left-0 h-1.5 z-50 transition-all duration-150"
        style={{ 
          width: `${scrollProgress * 100}%`,
          opacity: scrollProgress > 0.02 ? 1 : 0,
          background: 'linear-gradient(90deg, #0284c7, #7c3aed, #059669)',
          boxShadow: '0 0 12px rgba(2, 132, 199, 0.6)'
        }}
      />

      {/* Background ambient glowing lights */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-electric-cyan/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-plasma-violet/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* KINETIC TYPOGRAPHY & GLOW MOTION HERO SECTION (STUDY SANCTUARY WITH STRICT SEPARATED THEMES) */}
      <section className="relative px-3 sm:px-6 pt-2 pb-12">
        {/* Outer Curved Atmospheric Capsule Container */}
        <div 
          className={`relative mx-auto max-w-[1440px] rounded-[32px] sm:rounded-[44px] border overflow-hidden min-h-[85vh] flex flex-col justify-between p-6 sm:p-10 md:p-12 relative transition-all duration-500 ${
            isDark
              ? 'border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.9)] bg-[#060a10]'
              : 'border-slate-300 shadow-[0_20px_50px_rgba(15,23,42,0.08)] bg-slate-100/90'
          }`}
          onClick={() => { if (!isRevealed) setIsRevealed(true); }}
        >
          {/* Animated Neon Border Path (Directly Replicating Dribbble Video Progress Trace) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" preserveAspectRatio="none">
            <defs>
              <linearGradient id="introBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="45%" stopColor="#d946ef" />
                <stop offset="85%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <rect
              x="2"
              y="2"
              width="calc(100% - 4px)"
              height="calc(100% - 4px)"
              rx="40"
              fill="none"
              stroke="url(#introBorderGrad)"
              strokeWidth="2.5"
              strokeDasharray="4600"
              strokeDashoffset={4600 - (introProgress / 100) * 4600}
              style={{
                transition: 'stroke-dashoffset 80ms linear, opacity 600ms ease',
                filter: isDark ? 'drop-shadow(0 0 10px rgba(217, 70, 239, 0.8))' : 'drop-shadow(0 0 8px rgba(217, 70, 239, 0.5))',
                opacity: isRevealed ? 0.35 : 0.95
              }}
            />
          </svg>

          {/* PROJECT-RELATED ATMOSPHERIC ANIMATED BACKGROUND (GIF / VIDEO) */}
          <div className="absolute inset-0 z-0 overflow-hidden rounded-[32px] sm:rounded-[44px]">
            {/* Ambient Study Sanctuary Animated GIF */}
            <img 
              src="/study_bg.gif" 
              alt="LOS Study Sanctuary Ambient Background" 
              className="w-full h-full object-cover object-center scale-105 transition-all duration-1000 ease-out select-none"
              style={{ 
                filter: isDark
                  ? (isRevealed ? 'brightness(0.36) contrast(1.15) saturate(1.1)' : 'brightness(0.62) contrast(1.08) saturate(1.05)')
                  : (isRevealed ? 'brightness(0.92) contrast(1.05) saturate(1.1)' : 'brightness(0.98) contrast(1.02)')
              }}
            />

            {/* Theme-Adaptive Vignette & Gradients for Peak Legibility */}
            <div className={`absolute inset-0 transition-colors duration-500 ${
              isDark 
                ? 'bg-gradient-to-t from-[#060a10] via-[#060a10]/75 to-[#060a10]/45' 
                : 'bg-gradient-to-t from-slate-100 via-slate-100/75 to-slate-100/35'
            }`} />
            <div className={`absolute inset-0 transition-colors duration-500 ${
              isDark 
                ? 'bg-gradient-to-r from-[#060a10]/85 via-transparent to-[#060a10]/85' 
                : 'bg-gradient-to-r from-slate-100/85 via-transparent to-slate-100/85'
            }`} />

            {/* Multi-Color Ambient Glow Flares */}
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-fuchsia-600/15 rounded-full blur-[170px] pointer-events-none" />
            <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
          </div>

          {/* CINEMATIC INTRO PERCENTAGE COUNTER (Bottom-Left) */}
          <div 
            className={`absolute bottom-8 sm:bottom-14 left-8 sm:left-14 z-30 transition-all duration-700 select-none ${
              isRevealed 
                ? 'opacity-0 translate-y-8 pointer-events-none' 
                : 'opacity-100 translate-y-0'
            }`}
          >
            <div className={`text-6xl sm:text-8xl md:text-9xl font-black tracking-tight font-sans ${
              isDark 
                ? 'text-white/90 drop-shadow-[0_10px_35px_rgba(0,0,0,0.95)]' 
                : 'text-slate-900 drop-shadow-sm'
            }`}>
              {introProgress}%
            </div>
            <div className={`flex items-center gap-2.5 text-xs font-mono tracking-widest uppercase mt-2 pl-1 ${
              isDark ? 'text-fuchsia-300' : 'text-fuchsia-700 font-bold'
            }`}>
              <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 animate-ping" />
              <span>Loading Study Sanctuary &amp; Neural Rhythms...</span>
            </div>
          </div>

          {/* Main Hero Split Grid */}
          <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-auto py-6">
            
            {/* Left Column: Kinetic Typography & Glow Motion Showcase */}
            <div 
              className={`lg:col-span-7 space-y-6 text-left transition-all duration-800 delay-100 ease-out ${
                isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
              }`}
            >
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono text-xs uppercase tracking-widest backdrop-blur-md shadow-sm border ${
                isDark 
                  ? 'bg-fuchsia-950/60 border-fuchsia-500/30 text-fuchsia-300 shadow-[0_0_20px_rgba(217,70,239,0.2)]' 
                  : 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-500 animate-spin" style={{ animationDuration: '6s' }} />
                <span>AI-Powered Learning Operating System</span>
              </div>

              {/* 3D Kinetic Typography Showcase with Continuous Dynamic Changes */}
              <div className="relative py-2 select-none" style={{ perspective: '1000px' }}>
                {/* Mirrored Upper Row (Continuous Gentle Oscillating Wave) */}
                <div 
                  className={`text-2xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3 transition-transform duration-300 pointer-events-none ${
                    isDark ? 'text-slate-400/40' : 'text-slate-500/50'
                  }`}
                  style={{ 
                    transform: `rotateX(${30 + Math.sin(floatPhase) * 3}deg) translateY(${Math.sin(floatPhase) * 4}px) scale(0.92)`,
                    transformOrigin: 'bottom center' 
                  }}
                >
                  <span>master your</span>
                  <span className={isDark ? 'text-purple-400/40 blur-[0.5px]' : 'text-purple-600/50'}>focus</span>
                  <span>without fatigue</span>
                </div>

                {/* Primary Center Row (Pin Sharp with Continuous Glowing Word Morph) */}
                <div className={`text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight flex flex-wrap items-center gap-x-3.5 gap-y-2 py-1 ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}>
                  <span className={isDark ? 'text-slate-100' : 'text-slate-900'}>control your</span>
                  
                  {/* The Continuously Morphing Glowing Focal Word */}
                  <span 
                    key={activeWordIdx}
                    className="relative inline-block px-3 py-1 font-black text-transparent bg-clip-text transition-all duration-500 transform"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${
                        activeWordIdx === 0 ? '#f472b6, #e879f9, #c084fc' :
                        activeWordIdx === 1 ? '#06b6d4, #0284c7, #3b82f6' :
                        activeWordIdx === 2 ? '#10b981, #059669, #22c55e' :
                        activeWordIdx === 3 ? '#a855f7, #9333ea, #6366f1' :
                        '#eab308, #ea580c, #e11d48'
                      })`,
                      filter: isDark 
                        ? `drop-shadow(0 0 35px ${kineticWords[activeWordIdx].glow}) drop-shadow(0 0 70px ${kineticWords[activeWordIdx].glow})`
                        : `drop-shadow(0 0 20px ${kineticWords[activeWordIdx].glow})`
                    }}
                  >
                    {kineticWords[activeWordIdx].word}
                    
                    {/* Atmospheric Glow Underlay */}
                    <span 
                      className="absolute inset-0 blur-xl -z-10 rounded-full transition-colors duration-700" 
                      style={{ backgroundColor: kineticWords[activeWordIdx].glow.replace('0.95', isDark ? '0.25' : '0.15') }}
                    />
                  </span>
                  
                  <span className={isDark ? 'text-slate-100' : 'text-slate-900'}>with coolness</span>
                </div>

                {/* Mirrored Lower Row (Continuous Gentle Oscillating Wave) */}
                <div 
                  className={`text-2xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3 transition-transform duration-300 pointer-events-none ${
                    isDark ? 'text-slate-400/40' : 'text-slate-500/50'
                  }`}
                  style={{ 
                    transform: `rotateX(${-30 - Math.sin(floatPhase) * 3}deg) translateY(${-Math.sin(floatPhase) * 4}px) scale(0.92)`,
                    transformOrigin: 'top center' 
                  }}
                >
                  <span>retain every</span>
                  <span className={isDark ? 'text-cyan-400/40 blur-[0.5px]' : 'text-cyan-600/50'}>lesson</span>
                  <span>with clarity</span>
                </div>
              </div>

              <p className={`text-base sm:text-lg max-w-xl leading-relaxed pt-1 ${
                isDark 
                  ? 'text-slate-200 font-light opacity-95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]' 
                  : 'text-slate-700 font-medium'
              }`}>
                Stop chaotic cramming and painful all-nighters. LOS organizes your daily study schedule, uses active recall to lock concepts into long-term memory, and provides peaceful focus chambers so you ace your exams without burnout.
              </p>

              {/* Trust & Social Proof Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono">
                <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md ${
                  isDark 
                    ? 'bg-black/60 border-fuchsia-500/30 text-slate-200 shadow-[0_0_15px_rgba(217,70,239,0.2)]' 
                    : 'bg-white border-fuchsia-300 text-slate-800 shadow-sm'
                }`}>
                  <span className="text-fuchsia-500 font-bold text-sm">★ 4.9</span>
                  <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>• 24,000+ Students</span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm ${
                  isDark ? 'text-slate-200 bg-black/40 border-white/10' : 'text-slate-700 bg-white border-slate-200 shadow-xs'
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>94% Exam Retention Rate</span>
                </div>
                <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm ${
                  isDark ? 'text-slate-300 bg-black/40 border-white/10' : 'text-slate-700 bg-white border-slate-200 shadow-xs'
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                  <span>Free for Schools &amp; Learners</span>
                </div>
              </div>
            </div>

            {/* Right Column: Signature Floating Glassmorphism Study Card */}
            <div 
              className={`lg:col-span-5 flex justify-center lg:justify-end transition-all duration-800 delay-200 ease-out ${
                isRevealed ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-16 opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <div className={`w-full max-w-md rounded-3xl p-6 sm:p-7 text-left relative overflow-hidden group transition-all duration-300 ${
                isDark 
                  ? 'bg-[#0b111a]/90 backdrop-blur-2xl border border-white/20 text-white shadow-[0_25px_60px_rgba(0,0,0,0.85)]' 
                  : 'bg-white/95 backdrop-blur-2xl border border-slate-300 text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.1)]'
              }`}>
                
                {/* Radiant Glow Bloom in Card Header */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-[70px] pointer-events-none" />

                {/* Card Title & Icon */}
                <div className={`flex items-center justify-between pb-4 border-b ${
                  isDark ? 'border-white/10' : 'border-slate-200'
                }`}>
                  <div>
                    <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${
                      isDark ? 'text-white' : 'text-slate-950'
                    }`}>
                      Smart Study Hub
                    </h2>
                    <p className={`text-xs font-mono tracking-wider mt-0.5 ${
                      isDark ? 'text-fuchsia-400' : 'text-fuchsia-600 font-bold'
                    }`}>
                      Personalized AI Learning Schedule
                    </p>
                  </div>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    isDark ? 'bg-white/5 border border-white/10 text-slate-300 group-hover:text-fuchsia-400' : 'bg-slate-100 border border-slate-200 text-slate-700 group-hover:text-fuchsia-600'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>

                {/* Dual Study Selector Pills */}
                <div className="grid grid-cols-2 gap-3 my-5">
                  {/* Selector 1: Study Mode */}
                  <div className={`p-3.5 rounded-2xl flex flex-col justify-between transition-colors border ${
                    isDark 
                      ? 'bg-black/60 border-white/10 hover:border-fuchsia-500/50' 
                      : 'bg-slate-50 border-slate-200 hover:border-fuchsia-400'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-bold flex items-center gap-1.5 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        <Activity className="w-3.5 h-3.5 text-fuchsia-500" />
                        Deep Focus
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-slate-500">
                      <span className={`block font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>50 min session</span>
                      <span>10 min calm break</span>
                    </div>
                  </div>

                  {/* Selector 2: Memory Recall Mode */}
                  <div className={`p-3.5 rounded-2xl flex flex-col justify-between transition-colors border ${
                    isDark 
                      ? 'bg-black/60 border-white/10 hover:border-emerald-500/50' 
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-500'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-bold flex items-center gap-1.5 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        <Brain className="w-3.5 h-3.5 text-emerald-500" />
                        Active Recall
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-slate-500">
                      <span className={`block font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Spaced Practice</span>
                      <span>94% memory lock</span>
                    </div>
                  </div>
                </div>

                {/* Live Animated Study Flow Simulation Terminal */}
                <div className="rounded-2xl bg-black/90 border border-fuchsia-500/30 p-3.5 mb-5 font-mono text-[11px] text-fuchsia-300 space-y-1.5 shadow-inner relative overflow-hidden">
                  <div className="flex items-center justify-between text-[9px] text-slate-400 uppercase tracking-widest border-b border-fuchsia-500/20 pb-1 mb-1.5">
                    <span className="flex items-center gap-1.5 text-fuchsia-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-ping" />
                      Session Active: {Math.floor(sessionSeconds / 60)}:{(sessionSeconds % 60).toString().padStart(2, '0')}
                    </span>
                    <span className="text-emerald-400 font-bold">Shield Active</span>
                  </div>
                  
                  {/* Dynamic rotating micro-telemetry log */}
                  <div className="min-h-[22px] transition-all duration-300">
                    <p className={`${liveLogs[activeLogIdx].color} flex items-center justify-between text-[11px]`}>
                      <span>{liveLogs[activeLogIdx].text}</span>
                    </p>
                  </div>
                  
                  <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Focus Quality: <strong className="text-emerald-400">Optimal (98%)</strong></span>
                    <span className="text-cyan-400">Recall Locked</span>
                  </div>
                </div>

                {/* Metrics Stats Bar */}
                <div className="flex items-center justify-between text-xs font-mono pb-5">
                  <div>
                    <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>94% Retained</span>
                    <span className="text-slate-500 ml-1">/Memory</span>
                  </div>
                  <div className="text-slate-500 font-semibold text-right">
                    <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>Zero Burnout</span>
                    <span className="block text-[10px]">Calm Daily Rhythm</span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  onClick={() => setView('register')}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 text-white font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all duration-300 shadow-[0_0_30px_rgba(217,70,239,0.4)] hover:shadow-[0_0_45px_rgba(217,70,239,0.6)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                >
                  <span>Start Smart Study Session</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Trust Line & Scroll Cue */}
          <div 
            className={`relative z-20 flex flex-col sm:flex-row items-center justify-between text-xs font-mono pt-6 border-t gap-4 transition-all duration-700 delay-300 ease-out ${
              isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'
            } ${
              isDark ? 'text-slate-400 border-white/10' : 'text-slate-600 border-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Personalized for Grade School, High School, &amp; College Students</span>
            </span>

            <div className="flex items-center gap-4">
              <a href="#sec-cramming" className={`flex items-center gap-2 transition-colors ${
                isDark ? 'text-fuchsia-400 hover:text-white' : 'text-fuchsia-600 hover:text-slate-900 font-semibold'
              }`}>
                <span>Explore 4-Stage Study Journey</span>
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* STORYTELLING WRAPPER */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 mt-16 relative">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* Scrollable Story Content (Left side) */}
          <div className="w-full md:w-1/2 space-y-10 md:space-y-14 pr-0 md:pr-10 relative z-10">
            {sections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <div 
                  key={sec.id} 
                  id={`sec-${sec.id}`}
                  className={`transition-all duration-500 min-h-[50vh] flex flex-col justify-center text-left p-6 md:p-8 rounded-3xl ${
                    isActive 
                      ? 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-xl shadow-slate-200/60 dark:shadow-none translate-x-2' 
                      : 'opacity-40 hover:opacity-75 bg-transparent border-2 border-transparent'
                  }`}
                >
                  <div className="space-y-4">
                    <span className={`font-mono text-xs font-bold tracking-[0.25em] uppercase ${sec.color} px-3.5 py-1.5 rounded-full ${sec.bgColor} w-fit inline-flex items-center gap-2 border border-current/20`}>
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'animate-ping' : ''}`} style={{ backgroundColor: sec.accentColor }} />
                      {sec.phase}
                    </span>
                    
                    <h2 className="font-sans font-black text-2xl md:text-4xl text-on-surface leading-tight uppercase tracking-tight">
                      {sec.title}
                    </h2>
                    
                    <h3 className="font-sans text-sm md:text-base font-bold text-on-surface-variant flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-fuchsia-500" />
                      <span>{sec.subtitle}</span>
                    </h3>

                    {/* Study Purpose Banner */}
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-medium text-on-surface-variant">
                      <strong className="text-on-surface uppercase tracking-wider block mb-1">Study Purpose:</strong>
                      {sec.role}
                    </div>

                    {/* Key Mechanisms List */}
                    <div className="space-y-2 pt-1">
                      <span className="font-mono text-xs uppercase tracking-wider text-slate-400 block font-bold">How It Helps You:</span>
                      <ul className="space-y-1.5">
                        {sec.mechanisms.map((mech, mIdx) => (
                          <li key={mIdx} className="flex items-start gap-2 text-xs md:text-sm text-on-surface-variant">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{mech}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed pt-2 border-t border-slate-200 dark:border-slate-800">
                      {sec.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Canvas Visualizer Panel (Right side) */}
          <div className="hidden md:block w-1/2 sticky top-28 h-[78vh] flex-shrink-0 z-0">
            <div className="rounded-3xl w-full h-[68vh] flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#070b14] border-2 border-slate-800 shadow-2xl">
              {/* Internal glow backdrop reflecting the active state */}
              <div 
                className="absolute inset-0 opacity-25 blur-[100px] rounded-full transition-all duration-700 pointer-events-none"
                style={{ 
                  backgroundColor: activeColor,
                  transform: 'scale(1.3)' 
                }} 
              />
              
              <canvas 
                ref={canvasRef} 
                className="max-w-full max-h-full aspect-square z-10 transition-transform duration-700 relative" 
              />

              {/* Status HUD readout at bottom */}
              <div className="absolute bottom-5 left-7 right-7 flex justify-between items-center font-mono text-[10px] text-slate-300 uppercase tracking-widest border-t border-slate-800/80 pt-3.5 z-20 bg-[#070b14]/90 backdrop-blur-md px-2">
                <span className="flex items-center gap-2 font-bold text-fuchsia-400">
                  <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
                  Study State: Optimal Focus Flow
                </span>
                <span className="text-slate-300 font-semibold px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700">
                  Stage: {activeSection.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CLEAR PRIMARY CALL TO ACTION SECTION */}
      <section className="max-w-4xl mx-auto px-6 mt-40 text-center relative z-10">
        <div className="glass-panel-heavy rounded-3xl p-12 md:p-16 border border-glass-stroke shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-purple-500/10 to-transparent pointer-events-none" />
          
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-400 px-3 py-1 rounded-full bg-fuchsia-500/10 inline-block mb-4 border border-fuchsia-500/20">
            Join 24,000+ Happy Learners
          </span>

          <h2 className="font-sans font-black text-3xl md:text-5xl text-on-surface uppercase tracking-tight mb-6">
            Study Smarter, Remember More, Stress Less
          </h2>
          
          <p className="font-sans text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-10">
            Experience a calm, intelligent operating system built for students. Master your exams with personalized study rhythms, active memory recall, and peaceful focus chambers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto">
            <button
              onClick={() => setView('register')}
              className="w-full sm:w-auto px-10 py-5 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 text-white font-extrabold text-sm md:text-base uppercase tracking-widest hover:scale-[1.04] shadow-[0_0_35px_rgba(217,70,239,0.35)] active:scale-95 transition-all cursor-pointer border border-white/20"
            >
              Start Free Learning Journey &rarr;
            </button>
            <button
              onClick={() => setView('login')}
              className="w-full sm:w-auto px-8 py-5 rounded-full bg-white/5 border border-glass-stroke text-on-surface font-extrabold text-sm uppercase tracking-widest hover:bg-white/10 hover:border-fuchsia-400 transition-all cursor-pointer"
            >
              Existing Sign-In
            </button>
          </div>
        </div>
      </section>

      {/* GLOBAL FOOTER */}
      <Footer setView={setView} />
    </div>
  );
}
