import { realtimeSocket, watchResource } from './realtime';
import { apiFetch } from './http';
import { auth } from '../lib/firebase';
import { HomeworkTask, TaskStatus } from '../types';

export const taskService = {
  /**
   * Fetch tasks for a specific student
   */
  async getStudentTasks(uid: string, email: string, name: string): Promise<HomeworkTask[]> {
    try {
      const response = await apiFetch(`/api/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const allTasks: HomeworkTask[] = await response.json();
      
      return allTasks; // The server returns only authorized records.

    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  /**
   * Subscribe to tasks using polling
   */
  subscribeToStudentTasks(uid: string, email: string, name: string, callback: (tasks: HomeworkTask[]) => void, onError?: (error:unknown)=>void) {
    let active=true;
    let loading=false;
    const poll=async()=>{
      if(loading)return;
      loading=true;
      try{const tasks=await this.getStudentTasks(uid,email,name);if(active)callback(tasks)}catch(error){if(active)onError?.(error)}finally{loading=false}
    };
    void poll();
    const unwatch=watchResource(['tasks'],()=>{void poll()});
    const timer=setInterval(()=>{void poll()},30000);
    return ()=>{active=false;unwatch();clearInterval(timer)};
  },

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: TaskStatus) {
    const response = await apiFetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update task');
  },

  /**
   * Create a new task (for mentors)
   */
  async createTask(task: Partial<HomeworkTask>) {
    const response = await apiFetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...task,
        createdAt: new Date().toISOString()
      })
    });
    if (!response.ok) throw new Error('Failed to create task');
    return await response.json();
  }
};
