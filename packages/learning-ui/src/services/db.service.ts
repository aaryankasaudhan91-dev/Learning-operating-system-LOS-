import { apiFetch } from './http';
import { auth } from '../lib/firebase';
import { UserProfile, Course, CourseModule, Lesson } from '../types';

export const dbService = {
  // User Profile Methods
  async getStudents(mentorEmail?: string): Promise<UserProfile[]> {
      const url = mentorEmail ? `/api/users?role=student&teacherEmail=${encodeURIComponent(mentorEmail)}` : `/api/users?role=student`;
      const response = await apiFetch(url);
      if (!response.ok) throw new Error('Failed to fetch students');
      return await response.json();
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
      const response = await apiFetch(`/api/users/${uid}`);
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
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    if(auth.currentUser && uid!==auth.currentUser.uid && Array.isArray((data as any).courses)){
      const response=await apiFetch(`/api/learners/${uid}/courses`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({courses:(data as any).courses})});if(!response.ok)throw new Error('Course assignment was not saved');return;
    }
    const response = await apiFetch(`/api/users/${uid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update user profile');
  },

  async createUserProfile(profile: UserProfile) {
    const response = await apiFetch(`/api/users/${profile.uid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!response.ok) throw new Error('Failed to create user profile');
  },

  // Course Methods
  async getCourses(): Promise<Course[]> {
      const response = await apiFetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return await response.json();
  },

  async getCourseModules(courseId: string): Promise<CourseModule[]> {
      const response = await apiFetch(`/api/courses/${courseId}/modules`);
      if (!response.ok) throw new Error('Failed to fetch modules');
      return await response.json();
  },

  async getModuleLessons(courseId: string, moduleId: string): Promise<Lesson[]> {
      const response = await apiFetch(`/api/courses/${courseId}/modules/${moduleId}/lessons`);
      if (!response.ok) throw new Error('Failed to fetch lessons');
      return await response.json();
  },

  async getLesson(courseId: string, moduleId: string, lessonId: string): Promise<Lesson | null> {
      const response = await apiFetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch lesson');
      }
      return await response.json();
  },

  async createCourse(course: Course): Promise<Course> {
    const response = await apiFetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course)
    });
    if (!response.ok) throw new Error('Failed to create course');
    return await response.json();
  },

  async createModule(courseId: string, module: CourseModule): Promise<CourseModule> {
    const response = await apiFetch(`/api/courses/${courseId}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(module)
    });
    if (!response.ok) throw new Error('Failed to create module');
    return await response.json();
  },

  async createLesson(courseId: string, moduleId: string, lesson: Lesson): Promise<Lesson> {
    const response = await apiFetch(`/api/courses/${courseId}/modules/${moduleId}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lesson)
    });
    if (!response.ok) throw new Error('Failed to create lesson');
    return await response.json();
  }
};
