/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Brain, ShieldCheck, HelpCircle, Users, Activity, ChevronDown } from 'lucide-react';
import { AppView } from '../types';
import { AppLogo } from './AppLogo';

interface AboutPageProps {
  setView: (view: AppView) => void;
}

export default function AboutPage({ setView }: AboutPageProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('genesis');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sections = [
    {
      id: 'genesis',
      title: 'Our Genesis',
      subtitle: 'Bridging Cognition and Code',
      description: 'Learner OS was born out of frustration with static educational platforms that treat human brains as standardized containers. We set out to build a platform that respects cognitive limits, measuring mental state in real-time to shape study patterns dynamically.',
      color: 'text-electric-cyan',
      bgColor: 'bg-electric-cyan/10',
      accentColor: '#00e5ff'
    },
    {
      id: 'philosophy',
      title: 'Cognitive Respect',
      subtitle: 'Flow over Grind',
      description: 'We believe learning should feel like play, not a performance trial. Grades and points are secondary to mental wellness and memory state. By removing artificial barriers and prioritizing sustainable focus, we help you lock in deep mastery without the burnout.',
      color: 'text-plasma-violet',
      bgColor: 'bg-plasma-violet/10',
      accentColor: '#7c3aed'
    },
    {
      id: 'architecture',
      title: 'Telemetry Architecture',
      subtitle: 'Self-correcting Feedback Loops',
      description: 'The LOS engine runs on a dynamic double loop: Telemetry logs interaction friction, state analyzers process cognitive capacity, and the UI adapts on the fly. This continuously updates your course structure, preventing mental congestion before it occurs.',
      color: 'text-synapse-green',
      bgColor: 'bg-synapse-green/10',
      accentColor: '#10b981'
    },
    {
      id: 'pioneers',
      title: 'The Pioneers',
      subtitle: 'Humanity-First Science',
      description: 'Our team comprises cognitive neuroscientists, educational psychologists, and software architects who believe technology should conform to humans, not the other way around. Together, we are engineering the future of human intellectual capability.',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      accentColor: '#f59e0b'
    }
  ];

  // Track scroll and update active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollTotal > 0) {
        setScrollProgress(window.scrollY / scrollTotal);
      }

      const sectionElements = sections.map(sec => document.getElementById(`sec-${sec.id}`));
      let currentActive = 'genesis';
      const triggerBound = window.innerHeight * 0.45;

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
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Canvas visualizer for About Us narrative
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = 450);
    let height = (canvas.height = 450);

    const centerX = width / 2;
    const centerY = height / 2;
    let time = 0;

    const render = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      if (activeSection === 'genesis') {
        // Grow a branching neural tree from center
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
        ctx.lineWidth = 1.5;

        // Draw primary synapses
        const branchCount = 6;
        for (let i = 0; i < branchCount; i++) {
          const angle = (i / branchCount) * Math.PI * 2 + time * 0.003;
          const length = 100 + Math.sin(time * 0.02 + i) * 15;
          const endX = centerX + Math.cos(angle) * length;
          const endY = centerY + Math.sin(angle) * length;

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Sub-branches
          for (let j = 0; j < 3; j++) {
            const subAngle = angle + (j - 1) * 0.4;
            const subLength = length + 40 + Math.sin(time * 0.05 + j) * 8;
            const subEndX = endX + Math.cos(subAngle) * (subLength - length);
            const subEndY = endY + Math.sin(subAngle) * (subLength - length);

            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(subEndX, subEndY);
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
            ctx.stroke();

            // Glow tips
            ctx.beginPath();
            ctx.arc(subEndX, subEndY, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#00e5ff';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00e5ff';
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        // Center nucleus
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15 + Math.sin(time * 0.03) * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.8)';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00e5ff';
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '700 10px Courier, monospace';
        ctx.fillStyle = '#00e5ff';
        ctx.fillText('NUCLEUS: SYNTHESIS ACTIVE', 25, 30);

      } else if (activeSection === 'philosophy') {
        // Balanced rotating rings (respect, calibrate, sustain)
        const ringCount = 3;
        for (let i = 0; i < ringCount; i++) {
          const radius = 60 + i * 35;
          const angleOffset = time * (0.015 / (i + 1)) * (i % 2 === 0 ? 1 : -1);

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(124, 90, 237, 0.08)';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Orbiting node on the ring
          const nodeX = centerX + Math.cos(angleOffset) * radius;
          const nodeY = centerY + Math.sin(angleOffset) * radius;

          ctx.beginPath();
          ctx.arc(nodeX, nodeY, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#7c3aed';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#7c3aed';
          ctx.fill();
          ctx.shadowBlur = 0;

          // Connection line to center
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(nodeX, nodeY);
          ctx.strokeStyle = 'rgba(124, 90, 237, 0.08)';
          ctx.stroke();
        }

        // Draw soft concentric pulses
        const pulseRad = 30 + (time % 80) * 1.5;
        const opacity = 1 - (time % 80) / 80;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(124, 90, 237, ${opacity * 0.25})`;
        ctx.stroke();

        ctx.font = '700 10px Courier, monospace';
        ctx.fillStyle = '#7c3aed';
        ctx.fillText('INTEGRITY INDEX: BALANCE', 25, 30);

      } else if (activeSection === 'architecture') {
        // Feedback loop flowchart schematic with flying particles
        const boxes = [
          { name: 'State', x: centerX - 120, y: centerY },
          { name: 'Analyzer', x: centerX, y: centerY - 80 },
          { name: 'OS Logic', x: centerX + 120, y: centerY },
          { name: 'Calibrated UI', x: centerX, y: centerY + 80 }
        ];

        // Draw path connecting boxes
        ctx.beginPath();
        ctx.moveTo(boxes[0].x, boxes[0].y);
        ctx.lineTo(boxes[1].x, boxes[1].y);
        ctx.lineTo(boxes[2].x, boxes[2].y);
        ctx.lineTo(boxes[3].x, boxes[3].y);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw boxes
        boxes.forEach((box) => {
          ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
          ctx.lineWidth = 1;
          ctx.fillRect(box.x - 35, box.y - 18, 70, 36);
          ctx.strokeRect(box.x - 35, box.y - 18, 70, 36);

          ctx.font = '700 9px Courier, monospace';
          ctx.fillStyle = '#10b981';
          ctx.textAlign = 'center';
          ctx.fillText(box.name, box.x, box.y + 4);
        });
        ctx.textAlign = 'left'; // reset

        // Draw animated data flow particles
        const particleCount = 4;
        for (let i = 0; i < particleCount; i++) {
          const progress = ((time * 0.004 + i / particleCount) % 1);
          // Interpolate along loops
          let px = centerX;
          let py = centerY;

          if (progress < 0.25) {
            const t = progress / 0.25;
            px = boxes[0].x + (boxes[1].x - boxes[0].x) * t;
            py = boxes[0].y + (boxes[1].y - boxes[0].y) * t;
          } else if (progress < 0.5) {
            const t = (progress - 0.25) / 0.25;
            px = boxes[1].x + (boxes[2].x - boxes[1].x) * t;
            py = boxes[1].y + (boxes[2].y - boxes[1].y) * t;
          } else if (progress < 0.75) {
            const t = (progress - 0.5) / 0.25;
            px = boxes[2].x + (boxes[3].x - boxes[2].x) * t;
            py = boxes[2].y + (boxes[3].y - boxes[2].y) * t;
          } else {
            const t = (progress - 0.75) / 0.25;
            px = boxes[3].x + (boxes[0].x - boxes[3].x) * t;
            py = boxes[3].y + (boxes[0].y - boxes[3].y) * t;
          }

          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#10b981';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#10b981';
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.font = '700 10px Courier, monospace';
        ctx.fillStyle = '#10b981';
        ctx.fillText('TELEMETRY STATUS: NOMINAL', 25, 30);

      } else if (activeSection === 'pioneers') {
        // Constellation nodes that draw links, slowly drifting
        const nodes = [
          { x: centerX - 80, y: centerY - 60 },
          { x: centerX + 70, y: centerY - 90 },
          { x: centerX + 90, y: centerY + 50 },
          { x: centerX - 50, y: centerY + 80 },
          { x: centerX + 10, y: centerY + 10 },
          { x: centerX - 120, y: centerY + 10 }
        ];

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.12)';
        ctx.lineWidth = 1;

        // Draw connection web
        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          const wobbleX = Math.sin(time * 0.02 + i) * 6;
          const wobbleY = Math.cos(time * 0.02 + i) * 6;

          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const wobbleX2 = Math.sin(time * 0.02 + j) * 6;
            const wobbleY2 = Math.cos(time * 0.02 + j) * 6;

            ctx.beginPath();
            ctx.moveTo(n1.x + wobbleX, n1.y + wobbleY);
            ctx.lineTo(n2.x + wobbleX2, n2.y + wobbleY2);
            ctx.stroke();
          }

          // Draw node
          ctx.beginPath();
          ctx.arc(n1.x + wobbleX, n1.y + wobbleY, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#f59e0b';
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.font = '700 10px Courier, monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('NETWORK MAP: CONSTELLATED', 25, 30);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [activeSection]);

  const activeColor = sections.find(s => s.id === activeSection)?.accentColor || '#00e5ff';

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

      {/* Hero Header */}
      <section className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6 pt-24 pb-12 animate-[fadeIn_0.5s_ease-out]">
        <div className="max-w-3xl space-y-4">
          <span className="font-mono text-xs font-bold tracking-[0.3em] text-electric-cyan uppercase">
            Cognitive Architects
          </span>
          <h1 className="font-sans font-black text-4xl md:text-7xl uppercase italic leading-none">
            About <span className="bg-gradient-to-r from-electric-cyan to-plasma-violet bg-clip-text text-transparent">Learner OS</span>
          </h1>
          <p className="font-sans text-base md:text-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed opacity-80">
            Discover the philosophy, architecture, and minds behind a system engineered to adapt to human cognitive biology.
          </p>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-on-surface-variant animate-bounce opacity-50">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em]">Our Story</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* STORYTELLING WRAPPER */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 mt-10 relative">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* Scrollable Story Content (Left side) */}
          <div className="w-full md:w-1/2 space-y-[45vh] pr-0 md:pr-10 relative z-10">
            {sections.map((sec, idx) => (
              <div 
                key={sec.id} 
                id={`sec-${sec.id}`}
                className={`transition-all duration-700 min-h-[50vh] flex flex-col justify-center text-left ${
                  activeSection === sec.id ? 'opacity-100 translate-x-0' : 'opacity-25 md:scale-95'
                }`}
              >
                <div className="space-y-4">
                  <span className={`font-mono text-[10px] font-bold tracking-[0.3em] uppercase ${sec.color} px-3 py-1 rounded-full ${sec.bgColor} w-fit block`}>
                    {(idx + 1).toString().padStart(2, '0')} / {sections.length.toString().padStart(2, '0')}
                  </span>
                  
                  <h2 className="font-sans font-black text-3xl md:text-5xl text-on-surface uppercase">
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
              {/* Backglow panel */}
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

              <div className="absolute bottom-6 left-8 right-8 flex justify-between items-center font-mono text-[9px] text-on-surface-variant uppercase tracking-widest border-t border-glass-stroke pt-4 z-20">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-electric-cyan animate-ping" />
                  Telemetry Active
                </span>
                <span>Module: {activeSection}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* BOTTOM ACTION CARD */}
      <section className="max-w-4xl mx-auto px-6 mt-40 text-center relative z-10">
        <div className="glass-panel rounded-3xl p-12 md:p-16 border border-glass-stroke bg-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-electric-cyan/5 via-plasma-violet/5 to-transparent pointer-events-none" />
          
          <h2 className="font-sans font-black text-3xl md:text-5xl text-on-surface uppercase italic mb-6">
            Join the Paradigm Shift
          </h2>
          
          <p className="font-sans text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-10">
            Ready to explore? Register a signature profile now or enter your secure sync to resume protocols.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto">
            <button
              onClick={() => setView('login')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-electric-cyan to-plasma-violet text-white font-extrabold text-sm uppercase tracking-widest hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(2,132,199,0.35)] active:scale-95 transition-all cursor-pointer"
            >
              Enter Portal
            </button>
            <button
              onClick={() => setView('landing')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border border-glass-stroke text-on-surface font-extrabold text-sm uppercase tracking-widest hover:bg-white/5 hover:border-electric-cyan transition-all cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
