import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, Clock, CheckCircle2, Circle, 
  Loader2, AlertCircle, RefreshCw 
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

  useEffect(() => {
    if (!auth.currentUser) return;

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
