import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, Clock, CheckCircle2, Circle, 
  Loader2, AlertCircle, RefreshCw, BrainCircuit
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { taskService } from '../services/task.service';
import { dbService } from '../services/db.service';
import { HomeworkTask, TaskStatus, UserProfile } from '../types';

interface StudentTaskBoardProps {
  onStatusChange?: () => void;
}

export default function StudentTaskBoard({ onStatusChange }: StudentTaskBoardProps) {
  const [tasks, setTasks] = useState<HomeworkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskHints, setTaskHints] = useState<Record<string, string>>({});
  const [loadingHints, setLoadingHints] = useState<Record<string, boolean>>({});

  const fetchHint = async (e: React.MouseEvent, task: HomeworkTask) => {
    e.stopPropagation();
    if (taskHints[task.id] || loadingHints[task.id]) return;

    setLoadingHints(prev => ({ ...prev, [task.id]: true }));
    try {
      const response = await fetch('/api/agent/task-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: task.title, description: task.description })
      });
      const data = await response.json();
      const fallbacks = [
        "Start by identifying the very first, smallest step required. Don't worry about the rest yet.",
        "Try explaining the goal of this task out loud to yourself as if you were teaching it.",
        "Look for keywords in the description that hint at the core problem to solve.",
        "If you're stuck, try writing out what you *do* know on a piece of scratch paper."
      ];
      if (data.hint) {
        setTaskHints(prev => ({ ...prev, [task.id]: data.hint }));
      } else {
        setTaskHints(prev => ({ ...prev, [task.id]: fallbacks[Math.floor(Math.random() * fallbacks.length)] }));
      }
    } catch (err) {
      console.error(err);
      const fallbacks = [
        "Start by identifying the very first, smallest step required. Don't worry about the rest yet.",
        "Try explaining the goal of this task out loud to yourself as if you were teaching it.",
        "Look for keywords in the description that hint at the core problem to solve.",
        "If you're stuck, try writing out what you *do* know on a piece of scratch paper."
      ];
      setTaskHints(prev => ({ ...prev, [task.id]: fallbacks[Math.floor(Math.random() * fallbacks.length)] }));
    } finally {
      setLoadingHints(prev => ({ ...prev, [task.id]: false }));
    }
  };

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const unsubscribe = taskService.subscribeToStudentTasks(
      auth.currentUser.uid,
      auth.currentUser.email || '',
      auth.currentUser.displayName || '',
      (taskList) => {
        setTasks(taskList);
        setLoading(false);
        
        // Update user profile completion rate
        const completed = taskList.filter(t => t.status === 'completed').length;
        const rate = taskList.length > 0 ? Math.round((completed / taskList.length) * 100) : 0;
        if (auth.currentUser) {
          dbService.updateUserProfile(auth.currentUser.uid, { taskCompletionRate: rate });
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleStatus = async (task: HomeworkTask) => {
    let nextStatus: TaskStatus = 'pending';
    if (task.status === 'pending') nextStatus = 'in-progress';
    else if (task.status === 'in-progress') nextStatus = 'completed';
    else nextStatus = 'pending';

    try {
      await taskService.updateTaskStatus(task.id, nextStatus);
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.warn("Failed to update task status", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 text-electric-cyan animate-spin" />
      </div>
    );
  }

  if (!auth.currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center glass-panel rounded-xl border border-glass-stroke p-6">
        <AlertCircle className="w-8 h-8 text-on-surface-variant mb-2" />
        <p className="text-sm font-bold text-on-surface">Authentication Required</p>
        <p className="text-xs text-on-surface-variant mt-1">Please sign in to view your academic tasks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-sans font-bold text-lg text-on-surface flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-synapse-green" />
          Mentor Assignments
        </h3>
        <span className="font-mono text-[10px] text-synapse-green bg-synapse-green/10 px-2.5 py-1 rounded-md border border-synapse-green/20 font-bold">
          {tasks.filter(t => t.status !== 'completed').length} Pending
        </span>
      </div>

      {/* COMPLETION PULSE PROGRESS BAR */}
      {tasks.length > 0 && (
        <div className="glass-panel p-4 rounded-xl bg-gradient-to-r from-synapse-green/10 to-transparent border-glass-stroke">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant font-bold">Completion Pulse</span>
            <span className="text-xs font-mono font-bold text-synapse-green">
              {Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-void-black/50 h-2 rounded-full overflow-hidden border border-white/5 p-0.5">
            <div 
              className="h-full bg-synapse-green rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,255,163,0.5)]"
              style={{ width: `${(tasks.filter(t => t.status === 'completed').length / tasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tasks.map(task => (
          <div 
            key={task.id}
            onClick={() => toggleStatus(task)}
            className={`group p-4 rounded-xl border transition-all cursor-pointer ${
              task.status === 'completed' 
                ? 'bg-synapse-green/5 border-synapse-green/20 opacity-60' 
                : task.status === 'in-progress'
                ? 'bg-electric-cyan/5 border-electric-cyan/30'
                : 'bg-void-black/40 border-glass-stroke hover:border-white/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-synapse-green" />
                ) : task.status === 'in-progress' ? (
                  <RefreshCw className="w-5 h-5 text-electric-cyan animate-spin-slow" />
                ) : (
                  <Circle className="w-5 h-5 text-on-surface-variant group-hover:text-white transition-colors" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-on-surface">{task.title}</h4>
                  <span className="text-[10px] font-mono text-on-surface-variant uppercase">{task.teacherName}</span>
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">{task.description}</p>
                
                {/* AI Hint Section */}
                {task.status !== 'completed' && (
                  <div className="mt-2" onClick={e => e.stopPropagation()}>
                    {!taskHints[task.id] && !loadingHints[task.id] ? (
                      <button 
                        onClick={(e) => fetchHint(e, task)}
                        className="text-[10px] flex items-center gap-1 text-electric-cyan border border-electric-cyan/30 bg-electric-cyan/5 px-2 py-1 rounded hover:bg-electric-cyan/20 transition-all"
                      >
                        <BrainCircuit className="w-3 h-3" /> Get AI Hint
                      </button>
                    ) : (
                      <div className="bg-electric-cyan/5 border border-electric-cyan/20 rounded p-2 mt-2">
                        {loadingHints[task.id] ? (
                          <span className="text-[10px] text-electric-cyan flex items-center gap-1">
                            <span className="w-2 h-2 border border-electric-cyan border-t-transparent rounded-full animate-spin"></span>
                            Deconstructing task...
                          </span>
                        ) : (
                          <p className="text-[10px] text-electric-cyan leading-relaxed font-sans">{taskHints[task.id]}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant font-mono">
                    <Clock className="w-3 h-3" />
                    <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Limit'}</span>
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${
                    task.status === 'completed' ? 'text-synapse-green' : task.status === 'in-progress' ? 'text-electric-cyan' : 'text-on-surface-variant'
                  }`}>
                    {task.status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-on-surface-variant border-2 border-dashed border-glass-stroke rounded-2xl">
            <AlertCircle className="w-10 h-10 opacity-20 mb-3" />
            <p className="text-sm font-bold">No mentor tasks found</p>
            <p className="text-[10px] font-mono uppercase mt-1 opacity-50">System workload optimal</p>
          </div>
        )}
      </div>
    </div>
  );
}
