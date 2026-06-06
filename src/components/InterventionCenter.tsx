import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, Heart, Coffee, MessageCircle, 
  ChevronRight, Activity, TrendingUp, Zap
} from 'lucide-react';
import { StudentSeat } from '../types';

interface InterventionCenterProps {
  students: StudentSeat[];
  onAction: (studentId: string, action: string) => void;
}

export default function InterventionCenter({ students, onAction }: InterventionCenterProps) {
  const atRiskStudents = students.filter(s => s.state === 'friction' || s.state === 'low_motivation' || s.load > 85);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-sans font-bold text-base text-on-surface flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Active Interventions
        </h3>
        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-mono font-bold border border-red-500/20">
          {atRiskStudents.length} Students At-Risk
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {atRiskStudents.map((student) => (
            <motion.div
              key={student.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-panel p-4 rounded-2xl border border-glass-stroke bg-gradient-to-br from-red-500/5 to-transparent hover:border-red-500/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-void-black/50 border border-white/10 flex items-center justify-center relative overflow-hidden">
                    {/* Tiny Neural Spark */}
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <Activity className="w-5 h-5 text-on-surface-variant" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">{student.name}</h4>
                    <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
                      {student.state.replace('_', ' ')} • Load: {student.load}%
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-mono text-red-400 font-bold">24m Friction</span>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-4 h-1 rounded-full bg-red-500" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => onAction(student.id, 'encouragement')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-glass-stroke hover:bg-synapse-green/10 hover:border-synapse-green/30 transition-all group/btn"
                >
                  <Heart className="w-4 h-4 text-on-surface-variant group-hover/btn:text-synapse-green" />
                  <span className="text-[8px] font-bold uppercase tracking-tighter">Nudge</span>
                </button>
                <button 
                  onClick={() => onAction(student.id, 'break')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-glass-stroke hover:bg-plasma-violet/10 hover:border-plasma-violet/30 transition-all group/btn"
                >
                  <Coffee className="w-4 h-4 text-on-surface-variant group-hover/btn:text-plasma-violet" />
                  <span className="text-[8px] font-bold uppercase tracking-tighter">Break</span>
                </button>
                <button 
                  onClick={() => onAction(student.id, 'chat')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-glass-stroke hover:bg-electric-cyan/10 hover:border-electric-cyan/30 transition-all group/btn"
                >
                  <MessageCircle className="w-4 h-4 text-on-surface-variant group-hover/btn:text-electric-cyan" />
                  <span className="text-[8px] font-bold uppercase tracking-tighter">Voice</span>
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-glass-stroke flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[9px] text-on-surface-variant italic">Suggestion: Logic-flow module re-engagement</p>
                <ChevronRight className="w-3 h-3 text-on-surface-variant" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {atRiskStudents.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center glass-panel rounded-2xl border-dashed border-2 border-glass-stroke opacity-60">
            <div className="w-16 h-16 rounded-full bg-synapse-green/10 flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-synapse-green animate-pulse" />
            </div>
            <p className="text-sm font-bold text-on-surface">Neural Stability Maintained</p>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase mt-1 tracking-widest">0 Critical Alarms in Cohort</p>
          </div>
        )}
      </div>
    </div>
  );
}
