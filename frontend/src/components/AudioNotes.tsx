import React from 'react';
import { motion } from 'motion/react';
import { Mic, Play, Volume2, User, Clock } from 'lucide-react';
import { AudioNote } from '../types';

interface AudioNotesProps {
  notes: AudioNote[];
}

export default function AudioNotes({ notes }: AudioNotesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Mic className="w-5 h-5 text-plasma-violet" />
        <h3 className="font-sans font-bold text-base text-on-surface">Mentor Voice Insights</h3>
      </div>

      <div className="space-y-3">
        {notes.map((note) => (
          <motion.div
            key={note.id}
            whileHover={{ x: 4 }}
            className="glass-panel p-4 rounded-2xl bg-gradient-to-r from-plasma-violet/10 to-transparent border-glass-stroke flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-plasma-violet flex items-center justify-center shadow-lg shadow-plasma-violet/20 group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">Audio Snippet from Mentor</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-on-surface-variant" />
                    <span className="text-[10px] text-on-surface-variant font-mono">{note.mentorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-on-surface-variant" />
                    <span className="text-[10px] text-on-surface-variant font-mono">{note.duration}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div 
                  key={i} 
                  className={`w-1 bg-plasma-violet/40 rounded-full group-hover:animate-pulse`} 
                  style={{ height: `${Math.random() * 20 + 10}px`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </motion.div>
        ))}

        {notes.length === 0 && (
          <div className="py-10 text-center flex flex-col items-center border border-dashed border-glass-stroke rounded-2xl opacity-40">
            <Volume2 className="w-8 h-8 mb-2" />
            <p className="text-[10px] font-mono uppercase tracking-widest">No Audio Notes Present</p>
          </div>
        )}
      </div>
    </div>
  );
}
