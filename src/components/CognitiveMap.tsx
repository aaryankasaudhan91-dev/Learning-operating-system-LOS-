/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ZoomIn, ZoomOut, Database, Code, Network, Lock, HelpCircle, 
  BrainCircuit, LayoutGrid, Check, Play, Pause, Plus, AlertCircle,
  ClipboardCheck, Flame, Shield, Trophy, Smile, Bell, SplitSquareHorizontal, Users, Map, BatteryLow, Clock, Zap
} from 'lucide-react';
import { useFirebase } from './FirebaseProvider';

// New specialized component for animated streak
const DeepFocusStreak = ({ streak, bestStreak }: { streak: number, bestStreak: number }) => {
  const isNewRecord = streak > 0 && streak >= bestStreak;

  return (
    <div 
      className="relative overflow-hidden group/streak bg-gradient-to-br from-orange-500/10 to-transparent p-4 rounded-xl border border-orange-500/20 flex items-center justify-between cursor-pointer hover:border-orange-500/40 transition-all"
    >
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover/streak:rotate-12 group-hover/streak:scale-125 transition-transform duration-700">
        <Flame className="w-20 h-20 text-orange-500" />
      </div>
      
      <div className="flex items-center gap-4 relative z-10">
        <motion.div 
          animate={isNewRecord ? { 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center shadow-lg shadow-orange-500/20 border border-orange-500/30 group-hover/streak:scale-110 transition-transform"
        >
          <Flame className={`w-6 h-6 text-orange-500 ${streak > 0 ? 'animate-pulse' : 'opacity-40'}`} />
        </motion.div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-400 font-bold leading-none mb-1">
            Focus Streak
          </p>
          <div className="flex items-baseline gap-1.5">
            <AnimatePresence mode="wait">
              <motion.span 
                key={streak}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="text-3xl font-sans font-black text-on-surface tracking-tighter group-hover/streak:text-orange-400 transition-colors"
              >
                {streak}
              </motion.span>
            </AnimatePresence>
            <span className="text-xs font-bold text-orange-400/70">Days</span>
          </div>
        </div>
      </div>

      <div className="text-right relative z-10">
        {isNewRecord && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 text-[8px] font-mono font-black text-synapse-green bg-synapse-green/10 px-1.5 py-0.5 rounded uppercase mb-1"
          >
            <Trophy className="w-2 h-2" />
            New Record
          </motion.div>
        )}
        <p className="text-[9px] font-mono text-on-surface-variant leading-none uppercase">Goal Hub</p>
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i} 
              className={`w-3 h-1 rounded-full transition-all duration-500 ${i <= (streak % 5 || (streak > 0 ? 5 : 0)) ? 'bg-orange-500 shadow-[0_0_8px_rgba(255,107,0,0.5)]' : 'bg-white/10 group-hover/streak:bg-orange-500/20'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
import { SynthesisTask, AppView, PeerFeedback, AudioNote, AchievementBadge } from '../types';
import StudentTaskBoard from './StudentTaskBoard';
import AchievementGallery from './AchievementGallery';
import PeerInsight from './PeerInsight';
import AudioNotes from './AudioNotes';
import DailyMilestone from './DailyMilestone';

interface CognitiveMapProps {
  setView: (view: AppView) => void;
  tasks: SynthesisTask[];
  setTasks: React.Dispatch<React.SetStateAction<SynthesisTask[]>>;
  cognitiveLoad: number;
  setCognitiveLoad: React.Dispatch<React.SetStateAction<number>>;
  onSosClick: () => void;
}

export default function CognitiveMap({
  setView,
  tasks,
  setTasks,
  cognitiveLoad,
  setCognitiveLoad,
  onSosClick
}: CognitiveMapProps) {
  const { profile } = useFirebase();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [selectedNode, setSelectedNode] = useState<string | null>('Graph Theory');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [flowTimerActive, setFlowTimerActive] = useState(true);
  const [flowTime, setFlowTime] = useState<string>('01:45:22');
  const [activeRightTab, setActiveRightTab] = useState<'focus' | 'homework' | 'social'>('focus');

  // New states for Features
  const [moodModalOpen, setMoodModalOpen] = useState(true);
  const [spacedRepetitionPrompt, setSpacedRepetitionPrompt] = useState(true);
  const [lowMotivationMode, setLowMotivationMode] = useState(false);
  const [foggPrompt, setFoggPrompt] = useState(true);

  // Node helper coordinates (with scale)
  const baseNodes = [
    { id: 'ds', name: 'Data Structures', icon: Database, color: 'text-electric-cyan', border: 'border-electric-cyan', bg: 'shadow-[0_0_30px_rgba(0,229,255,0.4)]', x: 260, y: 310, status: 'Mastered' },
    { id: 'algo', name: 'Algorithms I', icon: Code, color: 'text-plasma-violet', border: 'border-plasma-violet', bg: 'shadow-[0_0_20px_rgba(112,0,255,0.2)]', x: 120, y: 360, status: 'Unlocked' },
    { id: 'graph', name: 'Graph Theory', icon: BrainCircuit, color: 'text-synapse-green', border: 'border-synapse-green', bg: 'shadow-[0_0_40px_rgba(0,255,163,0.3)]', x: 200, y: 110, status: 'Active (65% Synced)', isLearning: true, progress: 65 },
    { id: 'ml', name: 'Machine Learning', icon: Lock, color: 'text-outline', border: 'border-outline-variant', bg: '', x: 420, y: 220, status: 'Locked', locked: true }
  ];

  // Adjust zoom handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 15, 140));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 15, 70));

  // Toggle checklist tasks
  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const nextState = !task.completed;
        // Adjust load based on completed activities
        setCognitiveLoad(load => {
          const delta = nextState ? -8 : 8;
          return Math.max(Math.min(load + delta, 98), 20);
        });
        return { ...task, completed: nextState };
      }
      return task;
    }));
  };

  // Add a custom focus / revision targets
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: SynthesisTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      moduleName: 'Cognitive Review',
      estimatedMinutes: 10,
      completed: false
    };
    setTasks(prev => [...prev, newTask]);
    setCognitiveLoad(prev => Math.min(prev + 6, 95));
    setNewTaskTitle('');
  };

  // Click on active node to increase progress simulation
  const handleSyncAttempt = () => {
    alert("Synthesizing Graph Theory Node...\nSynapse alignment: +5%\nKeep completing Active Synthesis tasks to free up memory load.");
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[85vh] select-none">
      
      {/* Feature 2: Emotional State and Mood Check-Ins */}
      {moodModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-void-black/80 backdrop-blur-md">
          <div className="bg-surface-container border border-glass-stroke rounded-xl p-8 max-w-sm text-center">
            <Smile className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">How are you feeling today?</h3>
            <div className="flex gap-4 justify-center mt-6">
              <button onClick={() => { setMoodModalOpen(false); setLowMotivationMode(true); }} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">Tired</button>
              <button onClick={() => setMoodModalOpen(false)} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">Neutral</button>
              <button onClick={() => setMoodModalOpen(false)} className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500">Energized</button>
            </div>
          </div>
        </div>
      )}

      {/* Feature 3: Spaced Repetition Micro-Scheduling */}
      {spacedRepetitionPrompt && !moodModalOpen && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-synapse-green/20 border border-synapse-green text-synapse-green px-6 py-3 rounded-xl flex items-center gap-3 backdrop-blur-md">
          <Bell className="w-5 h-5" />
          <span className="font-bold">Memory decay detected! Quick 2-min review on Graph Theory?</span>
          <button onClick={() => setSpacedRepetitionPrompt(false)} className="ml-4 bg-synapse-green text-black px-3 py-1 rounded font-bold hover:bg-white">Review Now</button>
        </div>
      )}

      {/* Feature 20: Fogg Behavior Model Activation Prompts */}
      {foggPrompt && !moodModalOpen && !spacedRepetitionPrompt && (
        <div className="absolute bottom-10 right-10 z-50 bg-plasma-violet/20 border border-plasma-violet text-white px-6 py-3 rounded-xl flex items-center gap-3 backdrop-blur-md">
          <Zap className="w-5 h-5 text-plasma-violet" />
          <span className="font-bold">You're 5 points away from your goal - unlock it with this 2-min quiz!</span>
          <button onClick={() => setFoggPrompt(false)} className="bg-plasma-violet px-3 py-1 rounded font-bold hover:bg-plasma-violet/80">Start Quiz</button>
        </div>
      )}

      {/* LEFT CANVAS: Interactive SVG Node Graph */}
      <section className="flex-[2] glass-panel rounded-2xl border border-glass-stroke relative overflow-hidden flex flex-col glow-cyan h-[650px] xl:h-auto">
        <div className="p-6 border-b border-glass-stroke flex justify-between items-center z-10 bg-void-black/40 backdrop-blur-md">
          <div>
            {/* Feature 8: Gamified Skill-Tree Progression Maps */}
            <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
              <Map className="w-5 h-5 text-electric-cyan" /> Gamified Skill-Tree Progression Map
            </h2>
            <p className="text-xs text-on-surface-variant font-medium">System Architecture Mastery (Personalized Grid)</p>
          </div>
          <div className="flex gap-4 items-center">
            {/* Feature 18: Low-Motivation Adaptive Workloads */}
            <button 
              onClick={() => setLowMotivationMode(!lowMotivationMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${lowMotivationMode ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-white/5 border-glass-stroke text-on-surface-variant hover:text-white'}`}
            >
              <BatteryLow className="w-4 h-4" />
              Low Energy Mode
            </button>
            <button 
              onClick={handleZoomIn} 
              className="p-2 rounded-full bg-white/5 border border-glass-stroke hover:bg-white/10 text-on-surface hover:text-electric-cyan transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={handleZoomOut} 
              className="p-2 rounded-full bg-white/5 border border-glass-stroke hover:bg-white/10 text-on-surface hover:text-electric-cyan transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Neural Network Draggable Space */}
        <div className="flex-1 relative w-full h-full cursor-grab overflow-hidden">
          {/* Decorative Dot Matrix Background */}
          <div 
            className="absolute inset-0 opacity-15" 
            style={{ 
              backgroundImage: 'radial-gradient(rgba(225, 226, 231, 0.45) 1px, transparent 1px)', 
              backgroundSize: '40px 40px',
              transform: `scale(${zoomLevel / 100})`,
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }} 
          />

          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Draw quadratic curves between mapping coordinates */}
            <path 
              className="stroke-electric-cyan/70 stroke-[2.5]" 
              d="M 260,310 Q 190,335 120,360" 
              fill="none" 
              style={{ strokeDasharray: '4 4' }}
            />
            <path 
              className="stroke-synapse-green stroke-[3] drop-shadow-[0_0_6px_#00ffa3] animate-pulse" 
              d="M 260,310 Q 230,210 200,110" 
              fill="none" 
            />
            <path 
              className="stroke-outline-variant/40 stroke-[2]" 
              d="M 260,310 Q 340,265 420,220" 
              fill="none" 
            />
          </svg>

          {/* Render Nodes with scale */}
          <div 
            className="absolute inset-0 transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
          >
            {baseNodes.map((node) => {
              const IconComp = node.icon;
              const isSelected = selectedNode === node.name;

              return (
                <div
                  key={node.id}
                  onClick={() => !node.locked && setSelectedNode(node.name)}
                  className={`absolute z-10 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer`}
                  style={{ top: `${node.y}px`, left: `${node.x}px` }}
                >
                  <div className={`relative flex items-center justify-center rounded-full bg-void-black border-2 ${node.border} ${node.bg} ${
                    isSelected ? 'scale-115 ring-4 ring-electric-cyan/20' : 'hover:scale-110'
                  } ${node.isLearning ? 'w-20 h-20 pulse-indicator' : 'w-16 h-16'}`}>
                    
                    <IconComp className={`w-7 h-7 ${node.color}`} />

                    {/* Progress Ring for Active Learning Node */}
                    {node.isLearning && (
                      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                        <circle cx="40" cy="40" fill="none" r="38" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                        <circle 
                          cx="40" 
                          cy="40" 
                          fill="none" 
                          r="38" 
                          stroke="#00ffa3" 
                          strokeWidth="3.5" 
                          strokeDasharray="238" 
                          strokeDashoffset={238 - (238 * (node.progress || 0)) / 100}
                        />
                      </svg>
                    )}
                  </div>

                  {/* Bubble labels indicating completion stats */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 text-center whitespace-nowrap bg-void-black/80 px-2 py-1 rounded-md border border-glass-stroke backdrop-blur-md opacity-80 group-hover:opacity-100 transition-opacity">
                    <p className="font-mono text-[11px] font-semibold text-on-surface">{node.name}</p>
                    <p className={`font-sans text-[9px] uppercase tracking-wider font-extrabold ${
                      node.status === 'Mastered' ? 'text-electric-cyan' : node.isLearning ? 'text-synapse-green animate-pulse' : 'text-on-surface-variant'
                    }`}>
                      {node.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Selected Diagnostics Overlay Card */}
          {selectedNode && (
            <div className="absolute bottom-6 left-6 max-w-sm glass-panel p-5 rounded-xl border border-glass-stroke z-20 backdrop-blur-xl animate-[fadeIn_0.5s_ease-out]">
              <div className="flex justify-between items-start mb-2 group">
                <h4 className="font-sans font-bold text-base text-electric-cyan flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-synapse-green" />
                  {selectedNode} Diagnostics
                </h4>
                <button 
                  onClick={() => setSelectedNode(null)} 
                  className="text-on-surface-variant hover:text-white text-xs font-semibold px-2 py-0.5 rounded bg-white/5 border border-glass-stroke"
                >
                  Clear Selection
                </button>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                {selectedNode === 'Graph Theory' 
                  ? 'Currently tracing connections in Dijkstra Map theory. Completed review loops: 4/6. Synchronize synaptic integrity by practicing active synthesis tasks.'
                  : selectedNode === 'Data Structures' 
                  ? 'Completed module. Verified Mastery index score: 98.2%. Linked nodes: Graph Theory. Data persistence safely indexed with local Bhashini support.'
                  : 'All baseline structural modules analyzed successfully.'}
              </p>
              {selectedNode === 'Graph Theory' && (
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleSyncAttempt}
                    className="w-full py-2 rounded-lg bg-synapse-green/20 hover:bg-synapse-green/30 border border-synapse-green/40 text-synapse-green font-mono text-xs font-semibold tracking-wide transition-all uppercase flex items-center justify-center gap-1.5"
                  >
                    <Network className="w-3.5 h-3.5" />
                    Attempt Manual Synapse Sync (+5%)
                  </button>
                  {/* Feature 16: Mastery-Based Knowledge Graph Routing */}
                  <button 
                    onClick={() => alert("Routing backward to Data Structures to fix foundational gap...")}
                    className="w-full py-2 rounded-lg bg-plasma-violet/20 hover:bg-plasma-violet/30 border border-plasma-violet/40 text-plasma-violet font-mono text-xs font-semibold tracking-wide transition-all uppercase flex items-center justify-center gap-1.5"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                    Route to Missing Foundational Concept
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* RIGHT TELEMETRY & TASKS COLUMN */}
      <aside className="flex-1 flex flex-col gap-4 max-w-md w-full scroll-smooth">
        
        {/* TAB NAVIGATION FOR SIDEBAR */}
        <div className="flex bg-void-black/40 rounded-2xl p-1 border border-glass-stroke">
          <button 
            onClick={() => setActiveRightTab('focus')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeRightTab === 'focus' 
                ? 'bg-plasma-violet text-white shadow-lg shadow-plasma-violet/20' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            Focus Diagnostics
          </button>
          <button 
            onClick={() => setActiveRightTab('homework')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeRightTab === 'homework' 
                ? 'bg-synapse-green text-void-black shadow-lg shadow-synapse-green/20' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            Mentor Homework
          </button>
          <button 
            onClick={() => setActiveRightTab('social')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeRightTab === 'social' 
                ? 'bg-electric-cyan text-void-black shadow-lg shadow-electric-cyan/20' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Insights
          </button>
        </div>

        {activeRightTab === 'focus' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Memory Load and focus status telemetry */}
            <div className="glass-panel rounded-2xl p-6 border border-glass-stroke glow-violet flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="font-sans font-bold text-lg text-on-surface flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-plasma-violet animate-pulse" />
                  Cognitive Telemetry
                </h3>
                <span className="font-mono text-[10px] text-synapse-green bg-synapse-green/10 border border-synapse-green/30 px-2 py-0.5 rounded-full uppercase font-bold">
                  Realtime Sync Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Metric Card 1: Memory load */}
                <div className="bg-void-black/50 rounded-xl p-4 border border-glass-stroke flex flex-col">
                  <p className="font-sans text-[11px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">
                    Memory Load
                  </p>
                  <div className="flex items-end gap-1 mt-1">
                    <span className="text-4xl font-sans font-extrabold text-electric-cyan tracking-tight">
                      {cognitiveLoad}
                    </span>
                    <span className="font-mono text-xs text-on-surface-variant mb-1">%</span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 mt-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        cognitiveLoad > 75 
                          ? 'bg-red-400' 
                          : cognitiveLoad > 55 
                          ? 'bg-yellow-400' 
                          : 'bg-electric-cyan'
                      }`}
                      style={{ width: `${cognitiveLoad}%` }} 
                    />
                  </div>
                </div>

                {/* Metric Card 2: State quality */}
                <div className="bg-void-black/50 rounded-xl p-4 border border-glass-stroke flex flex-col justify-between">
                  <p className="font-sans text-[11px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">
                    Focus State
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-10 h-10 rounded-full bg-synapse-green/20 flex items-center justify-center shadow-lg shadow-synapse-green/10 pulse-indicator">
                      <BrainCircuit className="w-5 h-5 text-synapse-green" />
                    </div>
                    <span className="font-sans text-sm font-bold text-on-surface">
                      {cognitiveLoad > 80 ? 'Heavy Load' : 'Optimal'}
                    </span>
                  </div>
                </div>
              </div>

              {/* FOCUS STREAK COMPONENT */}
              <DeepFocusStreak streak={profile?.focusStreak || 0} bestStreak={profile?.bestFocusStreak || 0} />

              {/* DAILY MILESTONE COMPONENT */}
              <DailyMilestone 
                currentMinutes={profile?.todayFocusMinutes || 0} 
                goalMinutes={profile?.dailyFocusGoal || 120} 
              />

              {/* Interactive flow timer status bar */}
              <div className="bg-gradient-to-br from-white/5 to-transparent rounded-xl p-4 border border-glass-stroke flex justify-between items-center transition-all hover:bg-white/10">
                <div>
                  <p className="font-sans text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                    Current Flow Session
                  </p>
                  <p className="font-mono text-2xl font-bold text-plasma-violet mt-1 tracking-tight">
                    {flowTime}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setFlowTimerActive(!flowTimerActive);
                    alert(flowTimerActive ? 'Flow Session paused.' : 'Flow Session resumed! Breathe deeply.');
                  }}
                  className="p-3 rounded-full bg-plasma-violet/15 text-plasma-violet hover:bg-plasma-violet/25 hover:scale-105 active:scale-95 transition-all mb-0.5 border border-plasma-violet/30"
                >
                  {flowTimerActive ? (
                    <Pause className="w-5 h-5 fill-plasma-violet" />
                  ) : (
                    <Play className="w-5 h-5 fill-plasma-violet ml-0.5" />
                  )}
                </button>
              </div>
              </div>
              
              {/* Feature 10: Focus-Window Time Optimization */}
              <div className="bg-electric-cyan/10 border border-electric-cyan/30 rounded-xl p-4 flex items-center gap-3">
                <Clock className="w-6 h-6 text-electric-cyan" />
                <div>
                  <p className="font-bold text-electric-cyan text-sm">Focus-Window Optimization</p>
                  <p className="text-xs text-electric-cyan/70">Your peak focus time is 10:00 AM. Hardest topics are scheduled then!</p>
                </div>
              </div>

            {/* ACTIVE SYNAPSIS / MINI TODO LIST COMPONENT */}
            <div className="glass-panel rounded-2xl p-6 border border-glass-stroke flex-1 flex flex-col min-h-[350px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-sans font-bold text-lg text-on-surface flex items-center gap-2">
                  <Check className="w-5 h-5 text-electric-cyan" />
                  Active Synthesis {lowMotivationMode && <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded ml-2">Minimal Workload</span>}
                </h3>
                <span className="font-mono text-[10px] text-on-surface-variant bg-white/5 px-2.5 py-1 rounded-md border border-glass-stroke font-bold">
                  {lowMotivationMode ? Math.min(1, tasks.filter(t => !t.completed).length) : tasks.filter(t => !t.completed).length} Pending
                </span>
              </div>

              {/* Quick task checklist adding utility form */}
              <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                <input 
                  type="text"
                  placeholder="Inject new revision target..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 bg-surface-container-low border border-glass-stroke rounded-xl px-3 py-2 text-sm text-on-surface placeholder-outline-variant focus:outline-none focus:border-electric-cyan focus:ring-1 focus:ring-electric-cyan/35 transition-all"
                />
                <button 
                  type="submit"
                  className="p-2.5 rounded-xl bg-electric-cyan text-void-black hover:bg-electric-cyan/85 hover:scale-105 active:scale-95 transition-all border border-electric-cyan/35"
                  title="Add Target To List"
                >
                  <Plus className="w-4 h-4 font-extrabold" />
                </button>
              </form>

              {/* List display */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[240px]">
                {tasks.slice(0, lowMotivationMode ? 1 : tasks.length).map((task) => (
                  <div 
                    key={task.id}
                    className={`group flex flex-col gap-2 bg-void-black/35 border rounded-xl p-3.5 hover:border-electric-cyan/50 hover:bg-white/5 transition-all duration-300 ${
                      task.completed ? 'opacity-40 border-glass-stroke line-through' : 'border-glass-stroke'
                    }`}
                  >
                    <div className="flex items-start gap-3 cursor-pointer" onClick={() => handleToggleTask(task.id)}>
                      <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        task.completed 
                          ? 'border-electric-cyan bg-electric-cyan/10' 
                          : 'border-glass-stroke group-hover:border-electric-cyan'
                      }`}>
                        {task.completed && <Check className="w-3.5 h-3.5 text-electric-cyan font-bold" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-sans font-medium text-sm text-on-surface group-hover:text-electric-cyan transition-colors">
                          {task.title}
                        </h4>
                        <p className="font-mono text-[10px] text-on-surface-variant flex items-center gap-1 mt-1">
                          <span>{task.moduleName}</span>
                          <span>•</span>
                          <span>Est. {task.estimatedMinutes}m</span>
                        </p>
                      </div>
                    </div>
                    {/* Feature 4: Frictionless Micro-Tasking Engine */}
                    {!task.completed && (
                      <button onClick={(e) => { e.stopPropagation(); alert("Task broken down into three 3-minute subtasks."); }} className="ml-8 mt-1 flex items-center gap-1 text-[10px] text-plasma-violet font-bold hover:text-white transition-colors bg-plasma-violet/10 px-2 py-1 rounded w-fit">
                        <SplitSquareHorizontal className="w-3 h-3" /> Convert to Micro-tasks
                      </button>
                    )}
                  </div>
                ))}

                {tasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center select-none text-on-surface-variant">
                    <AlertCircle className="w-8 h-8 opacity-40 mb-2" />
                    <p className="text-xs font-sans">No tasks currently queued.</p>
                    <p className="text-[10px] tracking-wide uppercase font-mono mt-0.5">Focus State fully synchronized</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeRightTab === 'homework' ? (
          <div className="glass-panel rounded-2xl p-6 border border-glass-stroke animate-in fade-in slide-in-from-right-4 duration-500 min-h-[600px]">
            <StudentTaskBoard />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Feature 14: Peer-Led Growth Circles */}
            <div className="glass-panel rounded-2xl p-6 border border-glass-stroke bg-synapse-green/5 border-synapse-green/30">
              <h3 className="font-bold text-synapse-green flex items-center gap-2 mb-2"><Users className="w-5 h-5" /> Peer-Led Growth Circle</h3>
              <p className="text-xs text-on-surface-variant mb-3">Your circle 'Code Masters' is 1 module away from a shared reward!</p>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-synapse-green/20 rounded-full flex items-center justify-center border border-synapse-green"><Check className="w-4 h-4 text-synapse-green"/></div>
                <div className="w-8 h-8 bg-synapse-green/20 rounded-full flex items-center justify-center border border-synapse-green"><Check className="w-4 h-4 text-synapse-green"/></div>
                <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center border border-glass-stroke text-xs">You</div>
              </div>
            </div>

            {/* AUDIO NOTES FROM MENTOR */}
            <div className="glass-panel rounded-2xl p-6 border border-glass-stroke">
              <AudioNotes 
                notes={[
                  { id: '1', studentId: 'current', mentorName: 'Dr. Synapse', audioUrl: '#', duration: '0:45', timestamp: '2h ago' }
                ]} 
              />
            </div>

            {/* PEER INSIGHT SYSTEM */}
            <div className="glass-panel rounded-2xl p-6 border border-glass-stroke">
              <PeerInsight 
                receivedFeedback={[
                  { id: '1', toUserId: 'cur', message: 'Your logic flow on the last module was incredible!', badgeType: 'logic', isAnonymized: true, timestamp: '1h ago' },
                  { id: '2', toUserId: 'cur', message: 'Keep pushing! We are all in this cohort together.', badgeType: 'helpful', isAnonymized: true, timestamp: '3h ago' }
                ]}
                sendToUserId="random"
                onSend={(msg, type) => alert(`Anonymized ${type} insight sent to cohort peer!`)}
              />
            </div>

            {/* ACHIEVEMENT GALLERY */}
            <div className="glass-panel rounded-2xl p-6 border border-glass-stroke">
              <AchievementGallery 
                achievements={[
                  { id: '1', type: 'earlyBird', title: 'Early Bird Learner', dateAwarded: '2024-05-12' },
                  { id: '2', type: 'deepFocusMaster', title: 'Deep Focus Master', dateAwarded: '2024-06-01' }
                ]} 
              />
            </div>
          </div>
        )}

      </aside>

      {/* Floating System-wide SOS Trigger button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={onSosClick}
          className="w-14 h-14 rounded-full bg-void-black/40 border border-glass-stroke backdrop-blur-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] group hover:border-error/50 hover:shadow-[0_0_35px_rgba(255,180,171,0.25)]"
          title="Open Mental SOS Toolkit"
        >
          <HelpCircle className="w-7 h-7 text-on-surface group-hover:text-error transition-colors" />
        </button>
      </div>

    </div>
  );
}
