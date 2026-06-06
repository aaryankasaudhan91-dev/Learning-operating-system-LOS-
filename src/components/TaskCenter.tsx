import React, { useState, useEffect } from 'react';
import { 
  Plus, Calendar, Clock, CheckCircle2, Circle, 
  Loader2, ClipboardList, User, Users, Trash2 
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { StudentSeat, HomeworkTask, TaskStatus } from '../types';

interface TaskCenterProps {
  seats: StudentSeat[];
  addNotification: (msg: string) => void;
}

export default function TaskCenter({ seats, addNotification }: TaskCenterProps) {
  const [tasks, setTasks] = useState<HomeworkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('all');

  useEffect(() => {
    if (!auth.currentUser) return;
    
    let isSubscribed = true;
    
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/tasks?teacherId=${auth.currentUser!.uid}`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const tasks = await response.json();
        if (isSubscribed) {
          setTasks(tasks);
          setLoading(false);
        }
      } catch (error) {
        console.error("Task fetch error:", error);
        if (isSubscribed) setLoading(false);
      }
    };

    fetchTasks();
    const intervalId = setInterval(fetchTasks, 5000);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      const newTask = {
        teacherId: auth.currentUser.uid,
        teacherName: auth.currentUser.displayName || 'Teacher',
        assignedTo,
        title,
        description,
        dueDate,
        status: 'pending' as TaskStatus,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      });
      if (!response.ok) throw new Error('Failed to create task');
      
      addNotification(`New task "${title}" assigned to ${assignedTo === 'all' ? 'all students' : 'selected student'}.`);
      setIsAdding(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssignedTo('all');
      
      // refresh manually
      const refreshResponse = await fetch(`/api/tasks?teacherId=${auth.currentUser!.uid}`);
      if (refreshResponse.ok) {
        setTasks(await refreshResponse.json());
      }

    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete task');
      
      addNotification('Task removed successfully.');
      setTasks(tasks => tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return 'text-synapse-green bg-synapse-green/10 border-synapse-green/20';
      case 'in-progress': return 'text-electric-cyan bg-electric-cyan/10 border-electric-cyan/20';
      default: return 'text-on-surface-variant bg-surface-container border-glass-stroke';
    }
  };

  const getStudentName = (uid: string) => {
    if (uid === 'all') return 'All Students';
    // Note: In a real app, we'd fetch the student's name from their UID.
    // For this prototype, we'll try to find them in the 'seats' prop if we used email/name as ID.
    // Assuming assignedTo stores an identifier that matches seat.name for simplicity in this prototype.
    return uid;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-plasma-violet" />
            Task Management
          </h2>
          <p className="text-sm text-on-surface-variant">Assign and monitor cohort progress</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-plasma-violet text-white text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-plasma-violet/20"
        >
          {isAdding ? 'Cancel' : <><Plus className="w-4 h-4" /> New Task</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddTask} className="glass-panel p-6 rounded-2xl space-y-4 border-plasma-violet/30 animate-in zoom-in-95 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Task Title</label>
              <input 
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Quantum Mechanics Quiz"
                className="w-full bg-surface-container/50 border border-glass-stroke rounded-xl px-4 py-2.5 text-sm outline-none focus:border-plasma-violet"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Assign To</label>
              <select 
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="w-full bg-surface-container/50 border border-glass-stroke rounded-xl px-4 py-2.5 text-sm outline-none focus:border-plasma-violet"
              >
                <option value="all">All Students (Cohort)</option>
                {seats.map(student => (
                  <option key={student.id} value={student.name}>{student.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Description</label>
            <textarea 
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide detailed instructions..."
              className="w-full bg-surface-container/50 border border-glass-stroke rounded-xl px-4 py-2.5 text-sm outline-none focus:border-plasma-violet resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input 
                  type="date"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-surface-container/50 border border-glass-stroke rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:border-plasma-violet"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button 
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-plasma-violet to-electric-cyan text-white font-bold text-sm shadow-lg shadow-plasma-violet/20 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Launch Task
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-plasma-violet animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel p-20 rounded-2xl text-center flex flex-col items-center gap-4 opacity-60">
          <ClipboardList className="w-16 h-16 text-on-surface-variant" />
          <div>
            <p className="text-lg font-bold">No active tasks</p>
            <p className="text-xs font-mono uppercase tracking-widest mt-1">Initialize cognitive workflow above</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map(task => (
            <div key={task.id} className="glass-panel p-5 rounded-2xl border-white/5 hover:border-white/10 transition-all group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-on-surface">{task.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl">{task.description}</p>
                </div>
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 rounded-full hover:bg-red-500/10 text-on-surface-variant hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-glass-stroke pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                    {task.assignedTo === 'all' ? <Users className="w-4 h-4 text-electric-cyan" /> : <User className="w-4 h-4 text-plasma-violet" />}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold leading-none">Recipient</p>
                    <p className="text-xs font-semibold text-on-surface mt-1">{getStudentName(task.assignedTo)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                    <Clock className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold leading-none">Dead-line</p>
                    <p className="text-xs font-semibold text-on-surface mt-1">{new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="ml-auto w-full md:w-48 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    <span>Sync Status</span>
                    <span>{task.status === 'completed' ? '100%' : task.status === 'in-progress' ? '45%' : '0%'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        task.status === 'completed' ? 'bg-synapse-green' : task.status === 'in-progress' ? 'bg-electric-cyan' : 'bg-surface-container-highest'
                      }`}
                      style={{ width: task.status === 'completed' ? '100%' : task.status === 'in-progress' ? '45%' : '0%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
