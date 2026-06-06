import { auth } from '../lib/firebase';
import { HomeworkTask, TaskStatus } from '../types';

export const taskService = {
  /**
   * Fetch tasks for a specific student
   */
  async getStudentTasks(uid: string, email: string, name: string): Promise<HomeworkTask[]> {
    try {
      const response = await fetch(`/api/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const allTasks: HomeworkTask[] = await response.json();
      
      return allTasks.filter(data => 
        data.assignedTo === 'all' || 
        data.assignedTo === uid || 
        data.assignedTo === email ||
        data.assignedTo === name
      );
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  /**
   * Subscribe to tasks using polling
   */
  subscribeToStudentTasks(uid: string, email: string, name: string, callback: (tasks: HomeworkTask[]) => void) {
    let isSubscribed = true;
    
    const poll = async () => {
      if (!isSubscribed) return;
      const tasks = await this.getStudentTasks(uid, email, name);
      if (isSubscribed) callback(tasks);
      setTimeout(poll, 5000);
    };

    poll();

    return () => {
      isSubscribed = false;
    };
  },

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: TaskStatus) {
    const response = await fetch(`/api/tasks/${taskId}`, {
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
    const response = await fetch('/api/tasks', {
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
