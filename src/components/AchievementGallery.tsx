import React from 'react';
import { motion } from 'motion/react';
import { Award, Zap, Bird, Star, Users } from 'lucide-react';
import { AchievementBadge } from '../types';

interface AchievementGalleryProps {
  achievements: AchievementBadge[];
}

export default function AchievementGallery({ achievements }: AchievementGalleryProps) {
  const badgeColors = {
    earlyBird: 'text-[#FFD700] bg-[#FFD700]/10 border-[#FFD700]/30',
    deepFocusMaster: 'text-plasma-violet bg-plasma-violet/10 border-plasma-violet/30',
    streakHealer: 'text-synapse-green bg-synapse-green/10 border-synapse-green/30',
    collaborator: 'text-electric-cyan bg-electric-cyan/10 border-electric-cyan/30',
  };

  const badgeIcons = {
    earlyBird: Bird,
    deepFocusMaster: BrainCircuit,
    streakHealer: Zap,
    collaborator: Users,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Award className="w-5 h-5 text-synapse-green" />
        <h3 className="font-sans font-bold text-base text-on-surface">Digital Achievements</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((badge) => {
          const Icon = (badgeIcons as any)[badge.type] || Star;
          const colorClass = (badgeColors as any)[badge.type] || 'text-on-surface-variant bg-white/5 border-glass-stroke';
          
          return (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.02, translateY: -2 }}
              className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${colorClass}`}
            >
              <div className="p-2 rounded-full bg-white/5">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-tight leading-tight">{badge.title}</p>
                <p className="text-[9px] opacity-60 font-mono mt-0.5">{badge.dateAwarded}</p>
              </div>
            </motion.div>
          );
        })}
        {achievements.length === 0 && (
          <div className="col-span-2 py-8 flex flex-col items-center justify-center border border-dashed border-glass-stroke rounded-xl opacity-40">
            <Star className="w-8 h-8 mb-2" />
            <p className="text-[10px] font-mono uppercase tracking-widest">No Milestones Yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { BrainCircuit } from 'lucide-react';
