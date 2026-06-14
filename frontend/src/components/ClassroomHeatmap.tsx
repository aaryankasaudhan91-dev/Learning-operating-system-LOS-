import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Maximize2, Users, Info, Filter } from 'lucide-react';
import { StudentSeat } from '../types';

interface ClassroomHeatmapProps {
  seats: StudentSeat[];
}

export default function ClassroomHeatmap({ seats }: ClassroomHeatmapProps) {
  const [showAtRiskOnly, setShowAtRiskOnly] = useState(false);

  // Filter logic for at-risk students
  const displayedSeats = showAtRiskOnly 
    ? seats.filter(s => s.state === 'friction' || s.state === 'low_motivation' || s.load > 80)
    : seats;

  // Helpers to map load to colors
  const getHeatColor = (load: number) => {
    if (load > 80) return 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]';
    if (load > 60) return 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]';
    if (load > 40) return 'bg-plasma-violet shadow-[0_0_12px_rgba(112,0,255,0.4)]';
    if (load > 20) return 'bg-electric-cyan shadow-[0_0_10px_rgba(0,229,255,0.3)]';
    return 'bg-synapse-green/40 shadow-none';
  };

  const getIntensityLabel = (load: number) => {
    if (load > 85) return 'Critical Overload';
    if (load > 70) return 'High Demand';
    if (load > 50) return 'Flow State';
    return 'Stable / Ready';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <Layers className="w-6 h-6 text-synapse-green" />
            Classroom Perspective Heatmap
          </h2>
          <p className="text-sm text-on-surface-variant flex items-center gap-1.5 mt-1">
            <Info className="w-3.5 h-3.5" />
            Spatial distribution of neural load index across the cohort grid
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAtRiskOnly(!showAtRiskOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
              showAtRiskOnly 
                ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                : 'bg-white/5 text-on-surface-variant border-glass-stroke hover:border-white/20'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {showAtRiskOnly ? 'Showing At-Risk' : 'All Students'}
          </button>
          
          {['Idle', 'Optimum', 'High', 'Critical'].map((label, i) => (
            <div key={label} className="hidden sm:flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                i === 0 ? 'bg-synapse-green/40' : 
                i === 1 ? 'bg-electric-cyan' : 
                i === 2 ? 'bg-plasma-violet' : 'bg-red-500'
              }`} />
              <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant font-bold">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative glass-panel rounded-[2rem] p-12 overflow-hidden bg-void-black/60 border-white/5 min-h-[600px] flex items-center justify-center">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle, #414753 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />

        {/* 3D Perspective Container */}
        <div className="relative w-full max-w-4xl h-full flex items-center justify-center" style={{ perspective: '1200px' }}>
          <motion.div 
            initial={{ rotateX: 45, rotateZ: -15, scale: 0.8, opacity: 0 }}
            animate={{ rotateX: 30, rotateZ: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4 p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] shadow-2xl relative"
            style={{ 
              transformStyle: 'preserve-3d',
              boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)'
            }}
          >
            {/* Floor Glow */}
            <div className="absolute inset-0 bg-synapse-green/5 blur-3xl rounded-full opacity-20 pointer-events-none" />

            {displayedSeats.map((seat) => (
              <motion.div
                key={seat.id}
                layout
                initial={{ translateZ: 0 }}
                whileHover={{ translateZ: 40, scale: 1.1 }}
                className="relative cursor-pointer group"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Seat Shadow on Grid */}
                <div className="absolute inset-0 blur-md bg-black/40 rounded-xl translate-z-[-10px] scale-95" />
                
                {/* 3D Node Cube/Tile */}
                <div className={`aspect-square rounded-xl p-0.5 border border-white/10 transition-all duration-500 ${getHeatColor(seat.load)} relative`}>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  
                  {/* Miniature Label */}
                  <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-[8px] font-mono font-black text-white bg-black/60 px-1 rounded uppercase">
                      {seat.load}%
                    </span>
                  </div>

                  {/* Vertical Lift Indicator Line */}
                  <div className="absolute left-1/2 -top-12 w-px h-12 bg-gradient-to-t from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Hover Tooltip - Positioned above in 3D space */}
                <div 
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 w-40 z-20"
                  style={{ transform: 'translateZ(100px)' }}
                >
                  <div className="glass-panel p-3 rounded-2xl border-white/20 shadow-2xl space-y-1">
                    <p className="text-xs font-bold text-white truncate">{seat.name}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-on-surface-variant uppercase">{getIntensityLabel(seat.load)}</span>
                      <span className="text-xs font-black text-electric-cyan">{seat.load}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Ambient Room Icons */}
        <div className="absolute top-12 left-12 flex flex-col gap-1 opacity-20">
          <Maximize2 className="w-8 h-8 text-on-surface" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em]">Floor Alpha</span>
        </div>
        <div className="absolute bottom-12 right-12 flex flex-col items-end gap-1 opacity-20">
          <Users className="w-8 h-8 text-on-surface" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em]">Sync Node A1</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-widest text-on-surface-variant font-black">Spatial Clumping</h4>
          <p className="text-sm text-on-surface leading-relaxed">
            The Heatmap identifies localized "Cognitive Hotspots"—areas of the classroom where students are concurrently hitting high neural load thresholds.
          </p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-widest text-on-surface-variant font-black">Sync Thresholds</h4>
          <p className="text-sm text-on-surface leading-relaxed">
            Color intensity correlates to synaptic stability. <span className="text-red-400 font-bold">Red peaks</span> indicate areas requiring immediate intervention or breakout tasks.
          </p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-widest text-on-surface-variant font-black">Interaction Map</h4>
          <p className="text-sm text-on-surface leading-relaxed">
            Hover over any spatial node to inspect individual telemetry without breaking the aggregate perspective flow.
          </p>
        </div>
      </div>
    </div>
  );
}
