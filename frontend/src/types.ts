/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PeerFeedback {
  id: string;
  toUserId: string;
  message: string;
  badgeType: 'helpful' | 'focus' | 'creative' | 'logic';
  isAnonymized: boolean;
  timestamp: string;
}

export interface AudioNote {
  id: string;
  studentId: string;
  mentorName: string;
  audioUrl: string;
  duration: string;
  timestamp: string;
}

export interface AchievementBadge {
  id: string;
  type: 'earlyBird' | 'deepFocusMaster' | 'streakHealer' | 'collaborator';
  title: string;
  dateAwarded: string;
}

export interface AcademicInfo {
  level: 'primary' | 'secondary' | 'high_secondary' | 'undergraduate';
  className?: string; // For primary/secondary/high secondary
  stream?: string; // For high secondary (Science, Commerce, Arts)
  entranceExam?: string; // For class 12 high secondary
  ugStream?: 'Engineering' | 'Medical';
  ugCourse?: string;
  ugYear?: string;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: 'student' | 'mentor';
  specialty: string;
  preferredLanguage: string;
  focusStreak: number;
  bestFocusStreak: number;
  taskCompletionRate: number;
  lastFocusDate?: string;
  dailyFocusGoal: number; // in minutes
  todayFocusMinutes: number; // in minutes
  academicInfo?: AcademicInfo;
  achievements: AchievementBadge[];
  createdAt: string;
}

export type AppView = 'login' | 'register' | 'landing' | 'map' | 'chamber' | 'insights' | 'cohort' | 'sos' | 'profile' | 'settings' | 'courses';

export interface StudentSeat {
  id: string;
  name: string;
  load: number; // Percentage
  state: 'engaged' | 'flow' | 'deep_focus' | 'friction' | 'low_motivation';
  preferredLanguage: string;
  avatarSeed: string;
  currentTask?: string;
  row: number;
  col: number;
}

export interface InterventionAlert {
  id: string;
  studentName: string;
  condition: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  resolved?: boolean;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface HomeworkTask {
  id: string;
  teacherId: string;
  teacherName: string;
  assignedTo: string; // "all" or specific student UID
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
}

export interface SynthesisTask {
  id: string;
  title: string;
  moduleName: string;
  estimatedMinutes: number;
  completed: boolean;
}

export interface deployedPrompt {
  id: string;
  target: string;
  payload: string;
  timestamp: string;
}

export interface Course {
  id: string;
  classLevel: string;
  subject: string;
  title: string;
  description?: string;
  order?: number;
}

export interface CourseModule {
  id: string;
  courseId: string;
  term: string;
  title: string;
  learningObjectives: string[];
  order?: number;
}

export interface LessonStep {
  step: string;
  duration: string;
  activity: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  month?: string;
  theme?: string;
  topic: string;
  learningOutcome: string;
  instructionalFlow: LessonStep[];
  resources?: string[];
  order?: number;
}
