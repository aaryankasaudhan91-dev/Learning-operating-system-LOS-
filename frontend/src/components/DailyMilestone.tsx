import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Target, Sparkles, PartyPopper } from 'lucide-react';

interface DailyMilestoneProps {
  currentMinutes: number;
  goalMinutes: number;
}

export default function DailyMilestone({ currentMinutes, goalMinutes }: DailyMilestoneProps) {
  const percentage = Math.min(Math.round((currentMinutes / goalMinutes) * 100), 100);
  const isGoalReached = currentMinutes >= goalMinutes;
  
  // SVG Circle parameters
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative glass-panel rounded-2xl p-6 border border-glass-stroke overflow-hidden group/milestone">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover/milestone:scale-110 transition-transform duration-500">
        <Target className="w-24 h-24 text-plasma-violet" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-full flex justify-between items-center">
          <h3 className="font-sans font-bold text-lg text-on-surface flex items-center gap-2">
            <Sparkles className={`w-5 h-5 text-synapse-green ${isGoalReached ? 'animate-spin-slow' : 'animate-pulse'}`} />
            Daily Milestone
          </h3>
          <span className="font-mono text-[10px] text-on-surface-variant bg-white/5 border border-glass-stroke px-2 py-1 rounded-md uppercase font-bold">
            Protocol {isGoalReached ? 'Completed' : 'Tracking'}
          </span>
        </div>

        <div className="relative flex items-center justify-center">
          {/* Progress Circle */}
          <svg className="w-32 h-32 -rotate-90">
            {/* Background Circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-white/5"
            />
            {/* Progress Circle with Animation */}
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke={isGoalReached ? "#00ffa3" : "#7000FF"}
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ strokeDasharray: circumference }}
              className="drop-shadow-[0_0_8px_rgba(112,0,255,0.4)]"
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {isGoalReached ? (
                <motion.div
                  key="reached"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="flex flex-col items-center"
                >
                  <Trophy className="w-8 h-8 text-synapse-green mb-1" />
                  <span className="text-[10px] font-mono font-black text-synapse-green uppercase">Goal Met</span>
                </motion.div>
              ) : (
                <motion.div
                  key="ongoing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-2xl font-black text-on-surface tracking-tighter">
                    {percentage}%
                  </span>
                  <span className="text-[8px] font-mono font-bold text-on-surface-variant uppercase tracking-widest">
                    Synchronized
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Celebratory Particles (simplified CSS/motion animation) */}
          <AnimatePresence>
            {isGoalReached && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1.2, 0.5],
                      x: (i % 2 === 0 ? 1 : -1) * (Math.random() * 60 + 20),
                      y: (i < 3 ? -1 : 1) * (Math.random() * 60 + 20),
                      rotate: 360
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      repeatDelay: Math.random() * 2,
                      delay: i * 0.2
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <PartyPopper className={`w-4 h-4 ${i % 2 === 0 ? 'text-synapse-green' : 'text-electric-cyan'}`} />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full flex flex-col gap-1.5 text-center">
          <div className="flex justify-between items-baseline mb-1 px-1">
            <span className="text-[10px] font-mono font-bold text-on-surface-variant uppercase">Temporal Progress</span>
            <span className="text-xs font-sans font-bold text-on-surface">
              {currentMinutes} / {goalMinutes} <span className="text-[10px] text-on-surface-variant">MINS</span>
            </span>
          </div>
          
          <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${isGoalReached ? 'bg-synapse-green shadow-[0_0_10px_rgba(0,255,163,0.5)]' : 'bg-plasma-violet'}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>

          {isGoalReached && (
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-[10px] font-medium text-synapse-green/80 italic"
            >
              Excellence achieved. Your neural pathways are perfectly aligned for the day.
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
