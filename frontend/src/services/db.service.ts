import { UserProfile, Course, CourseModule, Lesson } from '../types';

export const dbService = {
  // User Profile Methods
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`/api/users/${uid}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch user profile');
      }
      const data = await response.json();
      return {
        ...data,
        dailyFocusGoal: data.dailyFocusGoal ?? 120,
        todayFocusMinutes: data.todayFocusMinutes ?? 0
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    const response = await fetch(`/api/users/${uid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update user profile');
  },

  async createUserProfile(profile: UserProfile) {
    const response = await fetch(`/api/users/${profile.uid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!response.ok) throw new Error('Failed to create user profile');
  },

  // Course Methods
  async getCourses(): Promise<Course[]> {
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return await response.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async getCourseModules(courseId: string): Promise<CourseModule[]> {
    try {
      const response = await fetch(`/api/courses/${courseId}/modules`);
      if (!response.ok) throw new Error('Failed to fetch modules');
      return await response.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async getModuleLessons(courseId: string, moduleId: string): Promise<Lesson[]> {
    try {
      const response = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons`);
      if (!response.ok) throw new Error('Failed to fetch lessons');
      return await response.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async getLesson(courseId: string, moduleId: string, lessonId: string): Promise<Lesson | null> {
    try {
      const response = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch lesson');
      }
      return await response.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  }
};
