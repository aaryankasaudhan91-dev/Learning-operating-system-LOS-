import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, Code, Network, Lock, HelpCircle, 
  BrainCircuit, LayoutGrid, Check, Play, Pause, Plus, AlertCircle,
  ClipboardCheck, Flame, Shield, Trophy, SplitSquareHorizontal, Users, Map, BatteryLow, Clock,
  Radio, X
} from 'lucide-react';
import { useFirebase } from './FirebaseProvider';

const DeepFocusStreak = ({ streak, bestStreak }: { streak: number, bestStreak: number }) => {
  const isNewRecord = streak > 0 && streak >= bestStreak;

  return (
    <div className="relative overflow-hidden group/streak bg-gradient-to-br from-orange-500/10 to-transparent p-4 rounded-xl border border-orange-500/20 flex items-center justify-between cursor-pointer hover:border-orange-500/40 transition-all">
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover/streak:rotate-12 group-hover/streak:scale-125 transition-transform duration-700">
        <Flame className="w-20 h-20 text-orange-500" />
      </div>
      
      <div className="flex items-center gap-4 relative z-10">
        <motion.div 
          animate={isNewRecord ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
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

import { SynthesisTask, AppView } from '../types';
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
  const [selectedNode, setSelectedNode] = useState<string | null>('Graph Theory');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [flowTimerActive, setFlowTimerActive] = useState(true);
  const [flowTime, setFlowTime] = useState<string>('01:45:22');
  const [activeRightTab, setActiveRightTab] = useState<'focus' | 'homework' | 'social'>('focus');
  const [activeBroadcastPrompt, setActiveBroadcastPrompt] = useState<string | null>(null);
  const [lowMotivationMode, setLowMotivationMode] = useState(false);

  useEffect(() => {
    const fetchLatestPrompt = async () => {
      try {
        const response = await fetch('/api/prompts/latest');
        if (response.ok) {
          const data = await response.json();
          if (data && data.text) {
            setActiveBroadcastPrompt(data.text);
          }
        }
      } catch (err) {}
    };
    fetchLatestPrompt();
    const interval = setInterval(fetchLatestPrompt, 10000);
    return () => clearInterval(interval);
  }, []);

  const roadmapNodes = [
    { id: 'ds', name: 'Data Structures', icon: Database, status: 'Mastered', color: 'bg-synapse-green/20 text-synapse-green border-synapse-green' },
    { id: 'algo', name: 'Algorithms I', icon: Code, status: 'Mastered', color: 'bg-synapse-green/20 text-synapse-green border-synapse-green' },
    { id: 'graph', name: 'Graph Theory', icon: BrainCircuit, status: 'Active (65%)', color: 'bg-electric-cyan/20 text-electric-cyan border-electric-cyan', isLearning: true, progress: 65 },
    { id: 'ml', name: 'Machine Learning', icon: Lock, status: 'Locked', color: 'bg-void-black text-on-surface-variant border-glass-stroke opacity-60', locked: true },
    { id: 'ai', name: 'Artificial Intelligence', icon: Lock, status: 'Locked', color: 'bg-void-black text-on-surface-variant border-glass-stroke opacity-60', locked: true }
  ];

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const nextState = !task.completed;
        setCognitiveLoad(load => {
          const delta = nextState ? -8 : 8;
          return Math.max(Math.min(load + delta, 98), 20);
        });
        return { ...task, completed: nextState };
      }
      return task;
    }));
  };

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

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[85vh] select-none relative">
      
      {/* Mentor Broadcasted Metacognitive Prompt */}
      {activeBroadcastPrompt && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-void-black/95 border border-plasma-violet/60 text-white px-6 py-4 rounded-2xl flex flex-col gap-2 max-w-md shadow-[0_0_20px_rgba(112,0,255,0.3)] backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center gap-2 text-plasma-violet">
            <Radio className="w-4 h-4 text-plasma-violet animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest font-extrabold">Cohort Broadcast Nudge</span>
          </div>
          <p className="text-sm font-sans font-medium text-on-surface leading-relaxed pr-6">
            "{activeBroadcastPrompt}"
          </p>
          <button 
            onClick={() => setActiveBroadcastPrompt(null)} 
            className="absolute top-3 right-3 text-on-surface-variant hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      )}

      {/* LEFT CANVAS: Linear Roadmap */}
      <section className="flex-[2] glass-panel rounded-2xl border border-glass-stroke relative overflow-hidden flex flex-col glow-cyan h-[650px] xl:h-auto">
        <div className="p-6 border-b border-glass-stroke flex justify-between items-center z-10 bg-void-black/40 backdrop-blur-md">
          <div>
            <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
              <Map className="w-5 h-5 text-electric-cyan" /> Academic Journey
            </h2>
            <p className="text-xs text-on-surface-variant font-medium">Your linear mastery roadmap</p>
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setLowMotivationMode(!lowMotivationMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${lowMotivationMode ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-white/5 border-glass-stroke text-on-surface-variant hover:text-white'}`}
            >
              <BatteryLow className="w-4 h-4" />
              Low Energy Mode
            </button>
          </div>
        </div>

        {/* Linear Path Scroller */}
        <div className="flex-1 overflow-y-auto w-full relative py-12 custom-scrollbar">
          {/* Main vertical track line */}
          <div className="absolute top-12 bottom-12 w-1 bg-glass-stroke left-1/2 -translate-x-1/2" />
          
          <div className="flex flex-col items-center gap-16 relative z-10">
            {roadmapNodes.map((node, i) => {
              const isSelected = selectedNode === node.name;
              return (
                <div 
                  key={node.id} 
                  className="relative group flex flex-col items-center cursor-pointer"
                  onClick={() => !node.locked && setSelectedNode(node.name)}
                >
                  {/* The Node Icon */}
                  <div className={`w-20 h-20 rounded-full border-[3px] flex items-center justify-center transition-all bg-void-black ${node.color} ${isSelected ? 'scale-110 shadow-[0_0_30px_rgba(0,229,255,0.3)] ring-4 ring-electric-cyan/20' : 'hover:scale-105'}`}>
                    <node.icon className="w-8 h-8" />
                    
                    {/* Progress Circle for active node */}
                    {node.isLearning && (
                      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                        <circle cx="40" cy="40" fill="none" r="38" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                        <circle 
                          cx="40" 
                          cy="40" 
                          fill="none" 
                          r="38" 
                          stroke="#00e5ff" 
                          strokeWidth="3.5" 
                          strokeDasharray="238" 
                          strokeDashoffset={238 - (238 * (node.progress || 0)) / 100}
                        />
                      </svg>
                    )}
                  </div>

                  {/* Title and Status Label */}
                  <div className={`mt-4 text-center px-4 py-2 rounded-xl border border-glass-stroke backdrop-blur-md transition-all ${isSelected ? 'bg-electric-cyan/10 border-electric-cyan/50' : 'bg-void-black/80'}`}>
                    <p className="font-bold text-sm text-on-surface group-hover:text-electric-cyan transition-colors">{node.name}</p>
                    <p className={`text-[10px] uppercase font-mono mt-0.5 font-bold tracking-wider ${node.isLearning ? 'text-electric-cyan animate-pulse' : 'text-on-surface-variant'}`}>
                      {node.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
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
                Clear
              </button>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              {selectedNode === 'Graph Theory' 
                ? 'Currently tracing connections in Dijkstra Map theory. Completed review loops: 4/6. Synchronize synaptic integrity by practicing active synthesis tasks.'
                : selectedNode === 'Data Structures' 
                ? 'Completed module. Verified Mastery index score: 98.2%. Linked nodes: Graph Theory.'
                : 'All baseline structural modules analyzed successfully.'}
            </p>
            {selectedNode === 'Graph Theory' && (
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => alert("Synthesizing Node...")}
                  className="w-full py-2 rounded-lg bg-synapse-green/20 hover:bg-synapse-green/30 border border-synapse-green/40 text-synapse-green font-mono text-xs font-semibold tracking-wide transition-all uppercase flex items-center justify-center gap-1.5"
                >
                  <Network className="w-3.5 h-3.5" />
                  Attempt Manual Synapse Sync (+5%)
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* RIGHT TELEMETRY & TASKS COLUMN */}
      <aside className="flex-1 flex flex-col gap-4 max-w-md w-full scroll-smooth">
        <div className="flex bg-void-black/40 rounded-2xl p-1 border border-glass-stroke">
          <button 
            onClick={() => setActiveRightTab('focus')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeRightTab === 'focus' ? 'bg-plasma-violet text-white shadow-lg shadow-plasma-violet/20' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            Focus
          </button>
          <button 
            onClick={() => setActiveRightTab('homework')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeRightTab === 'homework' ? 'bg-synapse-green text-void-black shadow-lg shadow-synapse-green/20' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            Homework
          </button>
          <button 
            onClick={() => setActiveRightTab('social')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeRightTab === 'social' ? 'bg-electric-cyan text-void-black shadow-lg shadow-electric-cyan/20' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Insights
          </button>
        </div>

        {activeRightTab === 'focus' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Memory Load */}
            <div className="glass-panel rounded-2xl p-6 border border-glass-stroke glow-violet flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="font-sans font-bold text-lg text-on-surface flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-plasma-violet animate-pulse" />
                  Cognitive Telemetry
                </h3>
                <span className="font-mono text-[10px] text-synapse-green bg-synapse-green/10 border border-synapse-green/30 px-2 py-0.5 rounded-full uppercase font-bold">
                  Realtime Sync
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-void-black/50 rounded-xl p-4 border border-glass-stroke flex flex-col">
                  <p className="font-sans text-[11px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">Memory Load</p>
                  <div className="flex items-end gap-1 mt-1">
                    <span className="text-4xl font-sans font-extrabold text-electric-cyan tracking-tight">{cognitiveLoad}</span>
                    <span className="font-mono text-xs text-on-surface-variant mb-1">%</span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 mt-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${cognitiveLoad > 75 ? 'bg-red-400' : cognitiveLoad > 55 ? 'bg-yellow-400' : 'bg-electric-cyan'}`}
                      style={{ width: `${cognitiveLoad}%` }} 
                    />
                  </div>
                </div>

                <div className="bg-void-black/50 rounded-xl p-4 border border-glass-stroke flex flex-col justify-between">
                  <p className="font-sans text-[11px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">Focus State</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-10 h-10 rounded-full bg-synapse-green/20 flex items-center justify-center shadow-lg shadow-synapse-green/10 pulse-indicator">
                      <BrainCircuit className="w-5 h-5 text-synapse-green" />
                    </div>
                    <span className="font-sans text-sm font-bold text-on-surface">{cognitiveLoad > 80 ? 'Heavy Load' : 'Optimal'}</span>
                  </div>
                </div>
              </div>

              <DeepFocusStreak streak={profile?.focusStreak || 0} bestStreak={profile?.bestFocusStreak || 0} />
              <DailyMilestone currentMinutes={profile?.todayFocusMinutes || 0} goalMinutes={profile?.dailyFocusGoal || 120} />

              <div className="bg-gradient-to-br from-white/5 to-transparent rounded-xl p-4 border border-glass-stroke flex justify-between items-center transition-all hover:bg-white/10">
                <div>
                  <p className="font-sans text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Current Flow Session</p>
                  <p className="font-mono text-2xl font-bold text-plasma-violet mt-1 tracking-tight">{flowTime}</p>
                </div>
                <button 
                  onClick={() => setFlowTimerActive(!flowTimerActive)}
                  className="p-3 rounded-full bg-plasma-violet/15 text-plasma-violet hover:bg-plasma-violet/25 hover:scale-105 active:scale-95 transition-all mb-0.5 border border-plasma-violet/30"
                >
                  {flowTimerActive ? <Pause className="w-5 h-5 fill-plasma-violet" /> : <Play className="w-5 h-5 fill-plasma-violet ml-0.5" />}
                </button>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-glass-stroke flex-1 flex flex-col min-h-[350px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-sans font-bold text-lg text-on-surface flex items-center gap-2">
                  <Check className="w-5 h-5 text-electric-cyan" />
                  Active Synthesis {lowMotivationMode && <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded ml-2">Minimal Workload</span>}
                </h3>
              </div>
              <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                <input 
                  type="text"
                  placeholder="Inject new revision target..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 bg-surface-container-low border border-glass-stroke rounded-xl px-3 py-2 text-sm text-on-surface placeholder-outline-variant focus:outline-none focus:border-electric-cyan transition-all"
                />
                <button type="submit" className="p-2.5 rounded-xl bg-electric-cyan text-void-black hover:bg-electric-cyan/85 transition-all">
                  <Plus className="w-4 h-4 font-extrabold" />
                </button>
              </form>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[240px]">
                {tasks.slice(0, lowMotivationMode ? 1 : tasks.length).map((task) => (
                  <div key={task.id} className={`group flex flex-col gap-2 bg-void-black/35 border rounded-xl p-3.5 hover:border-electric-cyan/50 transition-all ${task.completed ? 'opacity-40 border-glass-stroke line-through' : 'border-glass-stroke'}`}>
                    <div className="flex items-start gap-3 cursor-pointer" onClick={() => handleToggleTask(task.id)}>
                      <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${task.completed ? 'border-electric-cyan bg-electric-cyan/10' : 'border-glass-stroke'}`}>
                        {task.completed && <Check className="w-3.5 h-3.5 text-electric-cyan font-bold" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-sans font-medium text-sm text-on-surface group-hover:text-electric-cyan transition-colors">{task.title}</h4>
                      </div>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-on-surface-variant">
                    <AlertCircle className="w-8 h-8 opacity-40 mb-2" />
                    <p className="text-xs font-sans">No tasks currently queued.</p>
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
            <div className="glass-panel rounded-2xl p-6 border border-glass-stroke bg-synapse-green/5 border-synapse-green/30">
              <h3 className="font-bold text-synapse-green flex items-center gap-2 mb-2"><Users className="w-5 h-5" /> Peer-Led Growth Circle</h3>
              <p className="text-xs text-on-surface-variant mb-3">Your circle 'Code Masters' is 1 module away from a shared reward!</p>
            </div>
            <div className="glass-panel rounded-2xl p-6 border border-glass-stroke">
              <AudioNotes notes={[]} />
            </div>
            <div className="glass-panel rounded-2xl p-6 border border-glass-stroke">
              <PeerInsight receivedFeedback={[]} sendToUserId="random" onSend={() => alert('Sent!')} />
            </div>
            <div className="glass-panel rounded-2xl p-6 border border-glass-stroke">
              <AchievementGallery achievements={[]} />
            </div>
          </div>
        )}
      </aside>

      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={onSosClick}
          className="w-14 h-14 rounded-full bg-void-black/40 border border-glass-stroke backdrop-blur-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:border-error/50 hover:shadow-[0_0_35px_rgba(255,180,171,0.25)]"
        >
          <HelpCircle className="w-7 h-7 text-on-surface hover:text-error transition-colors" />
        </button>
      </div>
    </div>
  );
}
