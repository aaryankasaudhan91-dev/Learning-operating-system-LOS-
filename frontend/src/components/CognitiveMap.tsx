import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Rocket, Zap, Lock, HelpCircle,
  Star, Sparkles, Check, Play, Pause, Plus, AlertCircle,
  ClipboardCheck, Flame, Heart, Trophy, Users, Map, BatteryLow, Clock,
  MessageCircle, X, Smile
} from 'lucide-react';

// Assumed external imports
import { useFirebase } from './FirebaseProvider';
import { SynthesisTask, AppView } from '../types';
import StudentTaskBoard from './StudentTaskBoard';
import AchievementGallery from './AchievementGallery';
import PeerInsight from './PeerInsight';
import AudioNotes from './AudioNotes';
import DailyMilestone from './DailyMilestone';

// Fun, kid-friendly adventure levels starting at zero!
const ADVENTURE_LEVELS = [
  { id: 'math', name: 'Math Magic', icon: Star, status: 'Not Started', color: 'bg-white/5 text-on-surface-variant border-glass-stroke', isLearning: false, progress: 0, locked: false },
  { id: 'reading', name: 'Reading Quest', icon: BookOpen, status: 'Locked', color: 'bg-void-black text-on-surface-variant border-glass-stroke opacity-60', locked: true },
  { id: 'science', name: 'Science Explorer', icon: Rocket, status: 'Locked', color: 'bg-void-black text-on-surface-variant border-glass-stroke opacity-60', locked: true },
  { id: 'art', name: 'Art & Colors', icon: Lock, status: 'Locked', color: 'bg-void-black text-on-surface-variant border-glass-stroke opacity-60', locked: true },
  { id: 'coding', name: 'Computer Fun', icon: Lock, status: 'Locked', color: 'bg-void-black text-on-surface-variant border-glass-stroke opacity-60', locked: true }
];

const FunStreak = ({ streak, bestStreak }: { streak: number, bestStreak: number }) => {
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
            Learning Streak
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
            New High Score!
          </motion.div>
        )}
        <p className="text-[9px] font-mono text-on-surface-variant leading-none uppercase">My Goals</p>
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

interface LearningMapProps {
  setView: (view: AppView) => void;
  tasks: SynthesisTask[];
  setTasks: React.Dispatch<React.SetStateAction<SynthesisTask[]>>;
  cognitiveLoad: number;
  setCognitiveLoad: React.Dispatch<React.SetStateAction<number>>;
  onSosClick: () => void;
  profile?: any;
}

export default function LearningMap({
  setView,
  tasks,
  setTasks,
  cognitiveLoad, // We'll call this "Brain Energy" in the UI
  setCognitiveLoad,
  onSosClick
}: LearningMapProps) {
  const { profile } = useFirebase();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [activeRightTab, setActiveRightTab] = useState<'brain' | 'homework' | 'friends'>('brain');
  const [teacherMessage, setTeacherMessage] = useState<string | null>(null);
  const [tiredMode, setTiredMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time Timer State starting at 0
  const [timerActive, setTimerActive] = useState(false);
  const [learningSeconds, setLearningSeconds] = useState(0);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        setLearningSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formattedTime = [
    Math.floor(learningSeconds / 3600),
    Math.floor((learningSeconds % 3600) / 60),
    learningSeconds % 60
  ].map(v => v.toString().padStart(2, '0')).join(':');

  // Teacher Message Effect
  useEffect(() => {
    const controller = new AbortController();

    const fetchTeacherMessage = async () => {
      try {
        const response = await fetch('/api/prompts/latest', { signal: controller.signal });
        if (response.ok) {
          const data = await response.json();
          if (data?.text) setTeacherMessage(data.text);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch message:', err);
        }
      }
    };

    fetchTeacherMessage();
    const interval = setInterval(fetchTeacherMessage, 10000);

    return () => {
      clearInterval(interval);
      controller.abort();
    };
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleQuest = (taskId: string) => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const isCompleting = !tasks[taskIndex].completed;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: isCompleting } : t));
    // Updating "Brain Energy"
    setCognitiveLoad(prev => Math.max(Math.min(prev + (isCompleting ? -8 : 8), 98), 20));
  };

  const handleAddQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestTitle.trim()) return;

    const newTask: SynthesisTask = {
      id: Date.now().toString(),
      title: newQuestTitle,
      moduleName: 'Mini Quest',
      estimatedMinutes: 10,
      completed: false
    };

    setTasks(prev => [...prev, newTask]);
    setCognitiveLoad(prev => Math.min(prev + 6, 95));
    setNewQuestTitle('');
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[85vh] select-none relative">

      {/* Fun Pop-up Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-plasma-violet text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-plasma-violet/30 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teacher's Magic Note */}
      {teacherMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-void-black/95 border border-plasma-violet/60 text-white px-6 py-4 rounded-2xl flex flex-col gap-2 max-w-md shadow-[0_0_20px_rgba(112,0,255,0.3)] backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center gap-2 text-plasma-violet">
            <MessageCircle className="w-4 h-4 text-plasma-violet animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest font-extrabold">Teacher's Magic Note</span>
          </div>
          <p className="text-sm font-sans font-medium text-on-surface leading-relaxed pr-6">
            "{teacherMessage}"
          </p>
          <button
            onClick={() => setTeacherMessage(null)}
            className="absolute top-3 right-3 text-on-surface-variant hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
            aria-label="Close message"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      )}

      {/* LEFT CANVAS: The Adventure Map */}
      <section className="flex-[2] glass-panel rounded-2xl border border-glass-stroke relative overflow-hidden flex flex-col glow-cyan h-[650px] xl:h-auto">
        <div className="p-6 border-b border-glass-stroke flex justify-between items-center z-10 bg-void-black/40 backdrop-blur-md">
          <div>
            <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
              <Map className="w-5 h-5 text-electric-cyan" /> My Adventure Map
            </h2>
            <p className="text-xs text-on-surface-variant font-medium">Follow the path to learn new things!</p>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setTiredMode(!tiredMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${tiredMode ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-white/5 border-glass-stroke text-on-surface-variant hover:text-white'}`}
            >
              <BatteryLow className="w-4 h-4" />
              I'm Feeling Tired
            </button>
          </div>
        </div>

        {/* The Path */}
        <div className="flex-1 overflow-y-auto w-full relative py-12 custom-scrollbar">
          <div className="absolute top-12 bottom-12 w-1 bg-glass-stroke left-1/2 -translate-x-1/2" />

          <div className="flex flex-col items-center gap-16 relative z-10">
            {ADVENTURE_LEVELS.map((level) => {
              const isSelected = selectedLevel === level.name;
              return (
                <button
                  key={level.id}
                  className="relative group flex flex-col items-center cursor-pointer bg-transparent border-none outline-none"
                  onClick={() => !level.locked && setSelectedLevel(level.name)}
                  aria-label={`Look at ${level.name}`}
                  disabled={level.locked}
                >
                  {/* Level Icon */}
                  <div className={`w-20 h-20 rounded-full border-[3px] flex items-center justify-center transition-all bg-void-black ${level.color} ${isSelected ? 'scale-110 shadow-[0_0_30px_rgba(0,229,255,0.3)] ring-4 ring-electric-cyan/20' : 'hover:scale-105'}`}>
                    <level.icon className="w-8 h-8" />

                    {/* Progress Circle */}
                    {level.isLearning && level.progress > 0 && (
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
                          strokeDashoffset={238 - (238 * level.progress) / 100}
                        />
                      </svg>
                    )}
                  </div>

                  {/* Level Name */}
                  <div className={`mt-4 text-center px-4 py-2 rounded-xl border border-glass-stroke backdrop-blur-md transition-all ${isSelected ? 'bg-electric-cyan/10 border-electric-cyan/50' : 'bg-void-black/80'}`}>
                    <p className="font-bold text-sm text-on-surface group-hover:text-electric-cyan transition-colors">{level.name}</p>
                    <p className={`text-[10px] uppercase font-mono mt-0.5 font-bold tracking-wider ${level.isLearning ? 'text-electric-cyan animate-pulse' : 'text-on-surface-variant'}`}>
                      {level.status}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Level Details Box */}
        {selectedLevel && (
          <div className="absolute bottom-6 left-6 max-w-sm glass-panel p-5 rounded-xl border border-glass-stroke z-20 backdrop-blur-xl animate-[fadeIn_0.5s_ease-out]">
            <div className="flex justify-between items-start mb-2 group">
              <h4 className="font-sans font-bold text-base text-electric-cyan flex items-center gap-2">
                <Star className="w-5 h-5 text-synapse-green" />
                {selectedLevel}
              </h4>
              <button
                onClick={() => setSelectedLevel(null)}
                className="text-on-surface-variant hover:text-white text-xs font-semibold px-2 py-0.5 rounded bg-white/5 border border-glass-stroke"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              You haven't played this level yet! Are you ready to start learning and earn some stars?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => showToast('Yay! Adventure started!')}
                className="w-full py-2 rounded-lg bg-synapse-green/20 hover:bg-synapse-green/30 border border-synapse-green/40 text-synapse-green font-mono text-xs font-semibold tracking-wide transition-all uppercase flex items-center justify-center gap-1.5"
              >
                <Rocket className="w-3.5 h-3.5" />
                Let's Go!
              </button>
            </div>
          </div>
        )}
      </section>

      {/* RIGHT COLUMN: Quests & Energy */}
      <aside className="flex-1 flex flex-col gap-4 max-w-md w-full scroll-smooth">
        <div className="flex bg-void-black/40 rounded-2xl p-1 border border-glass-stroke">
          {(['brain', 'homework', 'friends'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveRightTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all capitalize ${activeRightTab === tab ? `bg-${tab === 'brain' ? 'plasma-violet' : tab === 'homework' ? 'synapse-green' : 'electric-cyan'} ${tab === 'brain' ? 'text-white' : 'text-void-black'} shadow-lg` : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
            >
              {tab === 'brain' && <Smile className="w-3.5 h-3.5" />}
              {tab === 'homework' && <ClipboardCheck className="w-3.5 h-3.5" />}
              {tab === 'friends' && <Heart className="w-3.5 h-3.5" />}
              {tab === 'brain' ? 'My Brain' : tab === 'friends' ? 'My Friends' : tab}
            </button>
          ))}
        </div>

        {/* Tab 1: My Brain */}
        <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 ${activeRightTab === 'brain' ? 'block' : 'hidden'}`}>
          <div className="glass-panel rounded-2xl p-6 border border-glass-stroke glow-violet flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="font-sans font-bold text-lg text-on-surface flex items-center gap-2">
                <Zap className="w-5 h-5 text-plasma-violet animate-pulse" />
                My Brain Energy
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-void-black/50 rounded-xl p-4 border border-glass-stroke flex flex-col">
                <p className="font-sans text-[11px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">Brain Busy-ness</p>
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
                <p className="font-sans text-[11px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">How I'm Doing</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-full bg-synapse-green/20 flex items-center justify-center shadow-lg shadow-synapse-green/10 pulse-indicator">
                    <Smile className="w-5 h-5 text-synapse-green" />
                  </div>
                  <span className="font-sans text-sm font-bold text-on-surface">{cognitiveLoad > 80 ? 'Need a Break' : 'Doing Great!'}</span>
                </div>
              </div>
            </div>

            <FunStreak streak={profile?.focusStreak || 0} bestStreak={profile?.bestFocusStreak || 0} />
            <DailyMilestone currentMinutes={profile?.todayFocusMinutes || 0} goalMinutes={profile?.dailyFocusGoal || 120} />

            <div className="bg-gradient-to-br from-white/5 to-transparent rounded-xl p-4 border border-glass-stroke flex justify-between items-center transition-all hover:bg-white/10">
              <div>
                <p className="font-sans text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Time Spent Learning</p>
                <p className="font-mono text-2xl font-bold text-plasma-violet mt-1 tracking-tight">{formattedTime}</p>
              </div>
              <button
                onClick={() => setTimerActive(!timerActive)}
                className="p-3 rounded-full bg-plasma-violet/15 text-plasma-violet hover:bg-plasma-violet/25 hover:scale-105 active:scale-95 transition-all mb-0.5 border border-plasma-violet/30"
                aria-label={timerActive ? "Pause Timer" : "Start Timer"}
              >
                {timerActive ? <Pause className="w-5 h-5 fill-plasma-violet" /> : <Play className="w-5 h-5 fill-plasma-violet ml-0.5" />}
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-glass-stroke flex-1 flex flex-col min-h-[350px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-sans font-bold text-lg text-on-surface flex items-center gap-2">
                <Star className="w-5 h-5 text-electric-cyan" />
                My Mini Quests {tiredMode && <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded ml-2">Easy Mode</span>}
              </h3>
            </div>
            <form onSubmit={handleAddQuest} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Type a new quest here..."
                value={newQuestTitle}
                onChange={(e) => setNewQuestTitle(e.target.value)}
                className="flex-1 bg-surface-container-low border border-glass-stroke rounded-xl px-3 py-2 text-sm text-on-surface placeholder-outline-variant focus:outline-none focus:border-electric-cyan transition-all"
              />
              <button type="submit" className="p-2.5 rounded-xl bg-electric-cyan text-void-black hover:bg-electric-cyan/85 transition-all">
                <Plus className="w-4 h-4 font-extrabold" />
              </button>
            </form>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[240px]">
              {tasks.slice(0, tiredMode ? 1 : tasks.length).map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleToggleQuest(task.id)}
                  className={`w-full text-left group flex flex-col gap-2 bg-void-black/35 border rounded-xl p-3.5 hover:border-electric-cyan/50 transition-all ${task.completed ? 'opacity-40 border-glass-stroke line-through' : 'border-glass-stroke'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${task.completed ? 'border-electric-cyan bg-electric-cyan/10' : 'border-glass-stroke'}`}>
                      {task.completed && <Check className="w-3.5 h-3.5 text-electric-cyan font-bold" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-sans font-medium text-sm text-on-surface group-hover:text-electric-cyan transition-colors">{task.title}</h4>
                    </div>
                  </div>
                </button>
              ))}
              {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center text-on-surface-variant">
                  <AlertCircle className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs font-sans">No quests right now. You are all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab 2: Homework */}
        <div className={`glass-panel rounded-2xl p-6 border border-glass-stroke animate-in fade-in slide-in-from-right-4 duration-500 min-h-[600px] ${activeRightTab === 'homework' ? 'block' : 'hidden'}`}>
          <StudentTaskBoard />
        </div>

        {/* Tab 3: Friends */}
        <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 ${activeRightTab === 'friends' ? 'block' : 'hidden'}`}>
          <div className="glass-panel rounded-2xl p-6 border border-glass-stroke bg-synapse-green/5 border-synapse-green/30">
            <h3 className="font-bold text-synapse-green flex items-center gap-2 mb-2"><Users className="w-5 h-5" /> My Team</h3>
            <p className="text-xs text-on-surface-variant mb-3">Join a team with your friends to win prizes together!</p>
          </div>
          <div className="glass-panel rounded-2xl p-6 border border-glass-stroke">
            <AudioNotes notes={[]} />
          </div>
          <div className="glass-panel rounded-2xl p-6 border border-glass-stroke">
            <PeerInsight receivedFeedback={[]} sendToUserId="" onSend={() => showToast('High Five Sent!')} />
          </div>
          <div className="glass-panel rounded-2xl p-6 border border-glass-stroke">
            <AchievementGallery achievements={[]} />
          </div>
        </div>
      </aside>

      {/* SOS Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={onSosClick}
          className="w-14 h-14 rounded-full bg-void-black/40 border border-glass-stroke backdrop-blur-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:border-error/50 hover:shadow-[0_0_35px_rgba(255,180,171,0.25)]"
          aria-label="I need help!"
        >
          <HelpCircle className="w-7 h-7 text-on-surface hover:text-error transition-colors" />
        </button>
      </div>
    </div>
  );
}