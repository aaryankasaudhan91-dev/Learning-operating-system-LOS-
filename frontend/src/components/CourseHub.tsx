/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Video, FileText, PlayCircle, Clock,
  ChevronRight, Construction, Lock, ArrowLeft,
  Search, Book, GraduationCap, Target, ListChecks,
  Lightbulb, Activity, Layers, Download, Users
} from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { dbService } from '../services/db.service';
import { Course, CourseModule, Lesson, LessonStep, UserProfile } from '../types';

type HubView = 'selection' | 'details' | 'lesson';

interface CourseHubProps {
  profile?: UserProfile | null;
  loading?: boolean;
}

export default function CourseHub({ profile: propProfile, loading: propLoading }: CourseHubProps = {}) {
  const context = useFirebase();
  const profile = propProfile !== undefined ? propProfile : context.profile;
  const firebaseLoading = propLoading !== undefined ? propLoading : context.loading;
  const [view, setView] = useState<HubView>('selection');

  // Selection State
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const [loading, setLoading] = useState(true);

  // Mentor Mode State
  const [mentorMode, setMentorMode] = useState<'explorer' | 'creator' | 'students'>('explorer');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);

  // Creator Mode State
  const [creatorTab, setCreatorTab] = useState<'course' | 'module' | 'lesson'>('course');
  
  // New Course state
  const [newCourseClass, setNewCourseClass] = useState('Class 10');
  const [newCourseSubject, setNewCourseSubject] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');

  // New Module state
  const [selectedCourseForModule, setSelectedCourseForModule] = useState('');
  const [newModuleTerm, setNewModuleTerm] = useState('Term 1');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleObjectives, setNewModuleObjectives] = useState('');

  // New Lesson state
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState('');
  const [modulesForLesson, setModulesForLesson] = useState<CourseModule[]>([]);
  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState('');
  const [newLessonTopic, setNewLessonTopic] = useState('');
  const [newLessonMonth, setNewLessonMonth] = useState('April');
  const [newLessonTheme, setNewLessonTheme] = useState('');
  const [newLessonOutcome, setNewLessonOutcome] = useState('');
  const [newLessonPersonalVideo, setNewLessonPersonalVideo] = useState('');
  const [newLessonVideoTutorial, setNewLessonVideoTutorial] = useState('');
  const [newLessonNotes, setNewLessonNotes] = useState('');
  const [newLessonTest, setNewLessonTest] = useState('');
  
  // Editable steps state for new lesson
  const [instructionalSteps, setInstructionalSteps] = useState<LessonStep[]>([
    { step: 'Hook', duration: '5 mins', activity: 'Introduce the topic with a real-world scenario.' },
    { step: 'Direct Instruction', duration: '15 mins', activity: 'Deliver core instructional content.' },
    { step: 'Practice', duration: '15 mins', activity: 'Interactive assessment/guided problem-solving.' },
    { step: 'Closure', duration: '5 mins', activity: 'Summarize key learnings.' }
  ]);

  // Quick Lesson add in Student View
  const [quickLessonCourseId, setQuickLessonCourseId] = useState('');
  const [quickLessonModuleId, setQuickLessonModuleId] = useState('');
  const [quickLessonModules, setQuickLessonModules] = useState<CourseModule[]>([]);
  const [quickLessonTopic, setQuickLessonTopic] = useState('');
  const [quickLessonMonth, setQuickLessonMonth] = useState('April');
  const [quickLessonTheme, setQuickLessonTheme] = useState('');
  const [quickLessonOutcome, setQuickLessonOutcome] = useState('');
  const [quickLessonPersonalVideo, setQuickLessonPersonalVideo] = useState('');
  const [quickLessonVideoTutorial, setQuickLessonVideoTutorial] = useState('');
  const [quickLessonNotes, setQuickLessonNotes] = useState('');
  const [quickLessonTest, setQuickLessonTest] = useState('');
  const [quickLessonSteps] = useState<LessonStep[]>([
    { step: 'Hook', duration: '5 mins', activity: 'Introduce the topic with a real-world scenario.' },
    { step: 'Direct Instruction', duration: '15 mins', activity: 'Deliver core instructional content.' },
    { step: 'Practice', duration: '15 mins', activity: 'Interactive assessment/guided problem-solving.' },
    { step: 'Closure', duration: '5 mins', activity: 'Summarize key learnings.' }
  ]);
  const [assigningClass, setAssigningClass] = useState(false);

  useEffect(() => {
    if (quickLessonCourseId) {
      dbService.getCourseModules(quickLessonCourseId).then(data => {
        setQuickLessonModules(data);
        if (data.length > 0) {
          setQuickLessonModuleId(data[0].id);
        } else {
          setQuickLessonModuleId('');
        }
      });
    } else {
      setQuickLessonModules([]);
      setQuickLessonModuleId('');
    }
  }, [quickLessonCourseId]);

  const handleAssignClass = async (className: string) => {
    if (!selectedStudent) return;
    try {
      setAssigningClass(true);
      const updatedProfile = {
        ...selectedStudent,
        academicInfo: {
          level: 'high_secondary' as const,
          className: className,
          stream: 'Science',
          entranceExam: 'JEE'
        }
      };
      await dbService.updateUserProfile(selectedStudent.uid, updatedProfile);
      
      setSelectedStudent(updatedProfile);
      setStudents(prev => prev.map(s => s.uid === selectedStudent.uid ? updatedProfile : s));
      
      const matched = courses.filter(c => c.classLevel === className);
      setStudentCourses(matched);
      
      alert(`Successfully assigned Class ${className} to ${selectedStudent.fullName}!`);
    } catch (err) {
      console.error(err);
      alert('Failed to assign class.');
    } finally {
      setAssigningClass(false);
    }
  };

  const handleAutoCreateModule = async () => {
    if (!quickLessonCourseId) return;
    try {
      const moduleId = `mod-${Date.now()}`;
      const newModule = {
        id: moduleId,
        courseId: quickLessonCourseId,
        term: 'Term 1',
        title: 'Core Fundamentals',
        learningObjectives: ['Establish fundamental core concepts']
      };
      await dbService.createModule(quickLessonCourseId, newModule);
      
      const data = await dbService.getCourseModules(quickLessonCourseId);
      setQuickLessonModules(data);
      setQuickLessonModuleId(moduleId);
      alert('Default Module "Core Fundamentals" created successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to create default module.');
    }
  };

  const handleAddQuickLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLessonCourseId || !quickLessonModuleId || !quickLessonTopic || !quickLessonOutcome) {
      alert('Course, Module, Topic, and Learning Outcome are required.');
      return;
    }
    try {
      const lessonId = `les-${Date.now()}`;
      const resourceList = [quickLessonPersonalVideo, quickLessonVideoTutorial, quickLessonNotes, quickLessonTest].filter(Boolean);
      
      await dbService.createLesson(quickLessonCourseId, quickLessonModuleId, {
        id: lessonId,
        moduleId: quickLessonModuleId,
        month: quickLessonMonth,
        theme: quickLessonTheme,
        topic: quickLessonTopic,
        learningOutcome: quickLessonOutcome,
        instructionalFlow: quickLessonSteps,
        resources: resourceList,
        personalVideo: quickLessonPersonalVideo || undefined,
        videoTutorial: quickLessonVideoTutorial || undefined,
        notes: quickLessonNotes || undefined,
        test: quickLessonTest || undefined
      });
      alert('Topic/Lesson successfully added to Student\'s Course!');
      setQuickLessonTopic('');
      setQuickLessonTheme('');
      setQuickLessonOutcome('');
      setQuickLessonPersonalVideo('');
      setQuickLessonVideoTutorial('');
      setQuickLessonNotes('');
      setQuickLessonTest('');
      
      await fetchCourses();
      if (selectedStudent) {
        handleStudentSelect(selectedStudent);
      }
    } catch (err) {
      console.error(err);
      alert('Error adding topic/lesson.');
    }
  };

  // Available Classes from Blueprint
  const allClasses = ["Class 1", "Class 2", "Class 3", "Class 6", "Class 8", "Class 10", "Class 11", "Class 12"];

  // Helper to normalize class name
  const getUserClassName = () => {
    const cls = profile?.academicInfo?.className;
    if (!cls) return null;
    return cls.toString().includes('Class') ? cls : `Class ${cls}`;
  };

  const userClass = getUserClassName();

  // Filter classes based on role
  const classes = profile?.role === 'student' 
    ? (userClass ? [userClass] : [])
    : allClasses;

  const fetchCourses = async () => {
    setLoading(true);
    const data = await dbService.getCourses();
    
    let allowedCourses = data;
    if (profile?.role === 'student') {
      if (userClass) {
        allowedCourses = data.filter(c => c.classLevel === userClass);
      } else {
        allowedCourses = [];
      }
    }
      
    setCourses(allowedCourses);
    setLoading(false);
  };

  useEffect(() => {
    if (!firebaseLoading) {
      fetchCourses();
    }
  }, [profile, firebaseLoading, userClass]);

  useEffect(() => {
    if (classes.length === 1 && !selectedClass) {
      setSelectedClass(classes[0]);
    }
  }, [classes, selectedClass]);

  // Fetch students if user is a mentor
  useEffect(() => {
    if (profile?.role === 'mentor') {
      const fetchStudentsData = async () => {
        const data = await dbService.getStudents();
        setStudents(data);
      };
      fetchStudentsData();
    }
  }, [profile]);

  // Fetch modules for dynamic lesson creation dropdown
  useEffect(() => {
    if (selectedCourseForLesson) {
      const fetchModulesData = async () => {
        const data = await dbService.getCourseModules(selectedCourseForLesson);
        setModulesForLesson(data);
        if (data.length > 0) {
          setSelectedModuleForLesson(data[0].id);
        } else {
          setSelectedModuleForLesson('');
        }
      };
      fetchModulesData();
    } else {
      setModulesForLesson([]);
      setSelectedModuleForLesson('');
    }
  }, [selectedCourseForLesson]);

  const handleClassSelect = (cls: string) => {
    setSelectedClass(cls);
    setSelectedCourse(null);
  };

  const handleCourseSelect = async (course: Course) => {
    setSelectedCourse(course);
    setLoading(true);
    const moduleData = await dbService.getCourseModules(course.id);
    setModules(moduleData);
    setView('details');
    setLoading(false);
  };

  const handleLessonSelect = async (module: CourseModule, lesson: Lesson) => {
    setSelectedModule(module);
    setSelectedLesson(lesson);
    setView('lesson');
  };

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    const sClass = student.academicInfo?.className
      ? (student.academicInfo.className.toString().includes('Class') ? student.academicInfo.className : `Class ${student.academicInfo.className}`)
      : null;
      
    if (sClass) {
      const matched = courses.filter(c => c.classLevel === sClass);
      setStudentCourses(matched);
    } else {
      setStudentCourses([]);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseSubject || !newCourseTitle) {
      alert('Subject and Course Title are required.');
      return;
    }
    try {
      const courseId = `course-${Date.now()}`;
      await dbService.createCourse({
        id: courseId,
        classLevel: newCourseClass,
        subject: newCourseSubject,
        title: newCourseTitle,
        description: newCourseDesc,
        order: courses.length + 1
      });
      alert('Course created successfully!');
      setNewCourseSubject('');
      setNewCourseTitle('');
      setNewCourseDesc('');
      await fetchCourses();
    } catch (err) {
      console.error(err);
      alert('Error creating course.');
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForModule || !newModuleTitle) {
      alert('Please select a course and enter module title.');
      return;
    }
    try {
      const moduleId = `mod-${Date.now()}`;
      await dbService.createModule(selectedCourseForModule, {
        id: moduleId,
        courseId: selectedCourseForModule,
        term: newModuleTerm,
        title: newModuleTitle,
        learningObjectives: newModuleObjectives.split(',').map(o => o.trim()).filter(Boolean)
      });
      alert('Module created successfully!');
      setNewModuleTitle('');
      setNewModuleObjectives('');
      await fetchCourses();
    } catch (err) {
      console.error(err);
      alert('Error creating module.');
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForLesson || !selectedModuleForLesson || !newLessonTopic || !newLessonOutcome) {
      alert('Course, Module, Topic, and Learning Outcome are required.');
      return;
    }
    try {
      const lessonId = `les-${Date.now()}`;
      const resourceList = [newLessonPersonalVideo, newLessonVideoTutorial, newLessonNotes, newLessonTest].filter(Boolean);
      
      await dbService.createLesson(selectedCourseForLesson, selectedModuleForLesson, {
        id: lessonId,
        moduleId: selectedModuleForLesson,
        month: newLessonMonth,
        theme: newLessonTheme,
        topic: newLessonTopic,
        learningOutcome: newLessonOutcome,
        instructionalFlow: instructionalSteps,
        resources: resourceList,
        personalVideo: newLessonPersonalVideo || undefined,
        videoTutorial: newLessonVideoTutorial || undefined,
        notes: newLessonNotes || undefined,
        test: newLessonTest || undefined
      });
      alert('Lesson/Topic created successfully!');
      setNewLessonTopic('');
      setNewLessonTheme('');
      setNewLessonOutcome('');
      setNewLessonPersonalVideo('');
      setNewLessonVideoTutorial('');
      setNewLessonNotes('');
      setNewLessonTest('');
      await fetchCourses();
    } catch (err) {
      console.error(err);
      alert('Error creating topic.');
    }
  };

  const handleStepChange = (index: number, field: keyof LessonStep, value: string) => {
    const updated = [...instructionalSteps];
    updated[index] = { ...updated[index], [field]: value };
    setInstructionalSteps(updated);
  };

  const filteredCourses = selectedClass
    ? courses.filter(c => c.classLevel === selectedClass)
    : [];

  const renderSelection = () => (
    <div className="space-y-10">
      {/* Class Selection Chips */}
      <div className="flex flex-wrap gap-3">
        {classes.map((cls) => (
          <button
            key={cls}
            onClick={() => handleClassSelect(cls)}
            className={`px-6 py-2.5 rounded-full font-sans font-bold text-[10px] uppercase tracking-widest transition-all border cursor-pointer ${selectedClass === cls
              ? 'bg-plasma-violet border-plasma-violet text-white shadow-lg shadow-plasma-violet/20'
              : 'bg-white/5 border-glass-stroke text-on-surface-variant hover:border-plasma-violet/40 hover:text-on-surface'
              }`}
          >
            {cls}
          </button>
        ))}
      </div>

      {selectedClass ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleCourseSelect(course)}
                className="glass-panel border border-glass-stroke rounded-2xl overflow-hidden group hover:border-plasma-violet/50 hover:shadow-lg hover:shadow-plasma-violet/10 transition-all flex flex-col cursor-pointer"
              >
                <div className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-plasma-violet/10 border border-plasma-violet/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Book className="w-6 h-6 text-plasma-violet" />
                  </div>
                  <h4 className="text-xl font-bold text-on-surface mb-2 group-hover:text-plasma-violet transition-colors">
                    {course.subject}
                  </h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-6 line-clamp-2">
                    {course.title}
                  </p>
                  <div className="flex items-center text-[10px] font-mono text-plasma-violet uppercase tracking-widest font-bold">
                    View Syllabus <ChevronRight className="ml-1 w-3 h-3" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 glass-panel border-dashed border-glass-stroke rounded-3xl flex flex-col items-center justify-center text-center">
              <Construction className="w-12 h-12 text-on-surface-variant/30 mb-4" />
              <p className="text-on-surface-variant font-sans text-sm italic">
                {profile?.role === 'student' ? (
                  "No Course Available"
                ) : (
                  <>Course modules for <span className="text-white font-bold">{selectedClass}</span> are currently being synchronized.</>
                )}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center opacity-40">
          <GraduationCap className="w-16 h-16 text-on-surface-variant mb-6" />
          <h3 className="text-2xl font-bold text-on-surface mb-2 tracking-tight uppercase italic">
            {profile?.role === 'student' ? 'No Course Available' : 'Select Academic Grade'}
          </h3>
          <p className="text-sm text-on-surface-variant">
            {profile?.role === 'student' 
              ? "You do not have any courses assigned to your profile. Please contact your mentor."
              : "Synchronize your cognitive path by selecting a class above."}
          </p>
        </div>
      )}
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <button
        onClick={() => setView('selection')}
        className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors group mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-sans font-bold uppercase tracking-widest">Back to Courses</span>
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-glass-stroke pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded bg-plasma-violet/20 border border-plasma-violet/40 text-[10px] font-bold text-plasma-violet uppercase tracking-widest">
              {selectedCourse?.classLevel}
            </span>
            <span className="text-on-surface-variant">/</span>
            <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
              {selectedCourse?.subject}
            </span>
          </div>
          <h2 className="text-4xl font-bold text-white tracking-tight italic">
            {selectedCourse?.title}
          </h2>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => alert(`Downloading Syllabus PDF for ${selectedCourse?.title}...`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-glass-stroke text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Full Syllabus PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Learning Objectives & Structure */}
        <div className="lg:col-span-2 space-y-8">
          {modules.map((module) => (
            <div key={module.id} className="glass-panel border border-glass-stroke rounded-2xl overflow-hidden bg-white/5">
              <div className="bg-white/5 px-6 py-4 border-b border-glass-stroke flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-plasma-violet uppercase tracking-widest font-bold block mb-1">
                    {module.term}
                  </span>
                  <h3 className="text-xl font-bold text-white">{module.title}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-plasma-violet/10 border border-plasma-violet/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-plasma-violet" />
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                    <ListChecks className="w-3.5 h-3.5" />
                    Learning Objectives
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {module.learningObjectives.map((obj, i) => (
                      <li key={i} className="flex gap-3 text-xs text-on-surface-variant leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-plasma-violet/40 mt-1 flex-shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>

                <ModuleLessonList
                  courseId={selectedCourse!.id}
                  moduleId={module.id}
                  onLessonSelect={(lesson) => handleLessonSelect(module, lesson)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Resources & Info */}
        <div className="space-y-6">
          <div className="glass-panel border border-glass-stroke rounded-2xl p-6 bg-white/5">
            <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white mb-6">
              <Layers className="w-4 h-4 text-plasma-violet" />
              Course Structure
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-glass-stroke">
                  <BookOpen className="w-5 h-5 text-on-surface-variant" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface uppercase tracking-widest">3 Academic Terms</p>
                  <p className="text-[10px] text-on-surface-variant">April through March cycle</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-glass-stroke">
                  <Activity className="w-5 h-5 text-on-surface-variant" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface uppercase tracking-widest">CPA Approach</p>
                  <p className="text-[10px] text-on-surface-variant">Concrete-Pictorial-Abstract</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-glass-stroke">
                  <Lightbulb className="w-5 h-5 text-on-surface-variant" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface uppercase tracking-widest">NEP Aligned</p>
                  <p className="text-[10px] text-on-surface-variant">2020 Pedagogical Standards</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel border border-glass-stroke rounded-2xl p-6 bg-gradient-to-br from-plasma-violet/5 to-transparent bg-white/5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">Recommended Resources</h4>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-glass-stroke hover:bg-white/10 transition-all cursor-pointer">
                <p className="text-xs font-bold text-on-surface">NCERT Marigold Textbook</p>
                <p className="text-[10px] text-on-surface-variant mt-1">Digital Edition available</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-glass-stroke hover:bg-white/10 transition-all cursor-pointer">
                <p className="text-xs font-bold text-on-surface">Skill Progression Guide</p>
                <p className="text-[10px] text-on-surface-variant mt-1">Focus: Phonics & Fluency</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLesson = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <button
        onClick={() => setView('details')}
        className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-sans font-bold uppercase tracking-widest">Back to Modules</span>
      </button>

      <div className="glass-panel border border-glass-stroke rounded-3xl overflow-hidden bg-white/5">
        <div className="bg-white/5 p-8 md:p-12 border-b border-glass-stroke relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-plasma-violet/10 blur-[100px] -mr-32 -mt-32" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded bg-plasma-violet/20 border border-plasma-violet/40 text-[10px] font-bold text-plasma-violet uppercase tracking-widest">
                {selectedModule?.term}
              </span>
              {selectedLesson?.month && (
                <span className="px-3 py-1 rounded bg-white/5 border border-glass-stroke text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  {selectedLesson.month}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4 italic">
              {selectedLesson?.topic}
            </h1>

            {selectedLesson?.theme && (
              <p className="text-lg text-plasma-violet font-sans font-bold uppercase tracking-[0.2em]">
                Theme: {selectedLesson.theme}
              </p>
            )}
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Learning Outcome */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <Target className="w-4 h-4" />
              Learning Outcome
            </h4>
            <p className="text-xl text-white font-sans leading-relaxed italic">
              "{selectedLesson?.learningOutcome}"
            </p>
          </div>

          {/* Custom Teacher Resources */}
          {(selectedLesson?.personalVideo || selectedLesson?.videoTutorial || selectedLesson?.notes || selectedLesson?.test) && (
            <div className="pt-8 border-t border-glass-stroke space-y-4">
              <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-plasma-violet">
                <Lightbulb className="w-4 h-4" />
                Course Resources
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedLesson.personalVideo && (
                  <a
                    href={selectedLesson.personalVideo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-glass-stroke hover:border-plasma-violet/40 hover:bg-white/10 transition-all group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Personal Video</p>
                      <p className="text-[10px] text-on-surface-variant">Watch teacher's recording</p>
                    </div>
                  </a>
                )}
                {selectedLesson.videoTutorial && (
                  <a
                    href={selectedLesson.videoTutorial}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-glass-stroke hover:border-plasma-violet/40 hover:bg-white/10 transition-all group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Video Tutorial</p>
                      <p className="text-[10px] text-on-surface-variant">External lesson walkthrough</p>
                    </div>
                  </a>
                )}
                {selectedLesson.notes && (
                  <a
                    href={selectedLesson.notes}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-glass-stroke hover:border-plasma-violet/40 hover:bg-white/10 transition-all group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Study Notes</p>
                      <p className="text-[10px] text-on-surface-variant">Download topic materials</p>
                    </div>
                  </a>
                )}
                {selectedLesson.test && (
                  <a
                    href={selectedLesson.test}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-glass-stroke hover:border-plasma-violet/40 hover:bg-white/10 transition-all group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Topic Test</p>
                      <p className="text-[10px] text-on-surface-variant">Take the topic quiz</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Instructional Flow */}
          <div className="space-y-6">
            <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <Activity className="w-4 h-4" />
              Instructional Flow (40-Minute Period)
            </h4>

            <div className="space-y-4">
              {selectedLesson?.instructionalFlow.map((step, idx) => (
                <div key={idx} className="flex gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-glass-stroke flex items-center justify-center text-[10px] font-bold text-on-surface-variant group-hover:border-plasma-violet group-hover:text-plasma-violet transition-colors">
                      {idx + 1}
                    </div>
                    {idx < selectedLesson.instructionalFlow.length - 1 && (
                      <div className="w-px flex-1 bg-glass-stroke my-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-bold text-white uppercase tracking-wider">{step.step}</h5>
                      <span className="text-[10px] font-mono text-on-surface-variant bg-white/5 px-2 py-0.5 rounded border border-glass-stroke">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {step.activity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          {selectedLesson?.resources && selectedLesson.resources.length > 0 && (
            <div className="pt-8 border-t border-glass-stroke space-y-4">
              <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                <Layers className="w-4 h-4" />
                Teaching Aids & Resources
              </h4>
              <div className="flex flex-wrap gap-3">
                {selectedLesson.resources.map((res, i) => (
                  <div key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-glass-stroke text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {res}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCreator = () => (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
      <div className="flex gap-3 border-b border-glass-stroke pb-3">
        {(['course', 'module', 'lesson'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setCreatorTab(tab)}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
              creatorTab === tab 
                ? 'bg-plasma-violet text-white shadow-lg' 
                : 'bg-white/5 border border-glass-stroke text-on-surface-variant hover:text-white'
            }`}
          >
            Create {tab}
          </button>
        ))}
      </div>

      {creatorTab === 'course' && (
        <form onSubmit={handleAddCourse} className="glass-panel border border-glass-stroke rounded-2xl p-8 bg-white/5 space-y-6">
          <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wider italic">Create New Course</h3>
          
          <div>
            <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Class Level</label>
            <select
              value={newCourseClass}
              onChange={(e) => setNewCourseClass(e.target.value)}
              className="w-full bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
            >
              {allClasses.map(c => <option key={c} value={c} className="bg-void-black">{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Subject (e.g., Physics, Math)</label>
            <input
              type="text"
              required
              placeholder="e.g. Physics"
              value={newCourseSubject}
              onChange={(e) => setNewCourseSubject(e.target.value)}
              className="w-full bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet placeholder:text-on-surface-variant/40"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Course Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Introduction to Kinematics"
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              className="w-full bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet placeholder:text-on-surface-variant/40"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Description</label>
            <textarea
              placeholder="Provide a syllabus summary..."
              value={newCourseDesc}
              onChange={(e) => setNewCourseDesc(e.target.value)}
              className="w-full h-24 bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet placeholder:text-on-surface-variant/40 resize-none"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-plasma-violet to-electric-cyan text-white text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Deploy Course
          </button>
        </form>
      )}

      {creatorTab === 'module' && (
        <form onSubmit={handleAddModule} className="glass-panel border border-glass-stroke rounded-2xl p-8 bg-white/5 space-y-6">
          <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wider italic">Add Module to Syllabus</h3>

          <div>
            <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Select Parent Course</label>
            <select
              value={selectedCourseForModule}
              onChange={(e) => setSelectedCourseForModule(e.target.value)}
              className="w-full bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
            >
              <option value="" className="bg-void-black">-- Choose Course --</option>
              {courses.map(c => <option key={c.id} value={c.id} className="bg-void-black">{c.classLevel} - {c.subject}: {c.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Term</label>
            <select
              value={newModuleTerm}
              onChange={(e) => setNewModuleTerm(e.target.value)}
              className="w-full bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
            >
              <option value="Term 1" className="bg-void-black">Term 1</option>
              <option value="Term 2" className="bg-void-black">Term 2</option>
              <option value="Term 3" className="bg-void-black">Term 3</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Module Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Mechanics & Waves"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              className="w-full bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet placeholder:text-on-surface-variant/40"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Learning Objectives (comma separated)</label>
            <textarea
              placeholder="Understand vectors, Calculate velocity thresholds, Apply Newton's laws..."
              value={newModuleObjectives}
              onChange={(e) => setNewModuleObjectives(e.target.value)}
              className="w-full h-24 bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet placeholder:text-on-surface-variant/40 resize-none"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-plasma-violet to-electric-cyan text-white text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Deploy Module
          </button>
        </form>
      )}

      {creatorTab === 'lesson' && (
        <form onSubmit={handleAddLesson} className="glass-panel border border-glass-stroke rounded-2xl p-8 bg-white/5 space-y-6">
          <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wider italic">Add Topic / Lesson</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Select Parent Course</label>
              <select
                value={selectedCourseForLesson}
                onChange={(e) => setSelectedCourseForLesson(e.target.value)}
                className="w-full bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
              >
                <option value="" className="bg-void-black">-- Choose Course --</option>
                {courses.map(c => <option key={c.id} value={c.id} className="bg-void-black">{c.classLevel} - {c.subject}: {c.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Select Module</label>
              <select
                value={selectedModuleForLesson}
                onChange={(e) => setSelectedModuleForLesson(e.target.value)}
                disabled={!selectedCourseForLesson}
                className="w-full bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet disabled:opacity-40"
              >
                <option value="" className="bg-void-black">-- Choose Module --</option>
                {modulesForLesson.map(m => <option key={m.id} value={m.id} className="bg-void-black">{m.term} - {m.title}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Topic Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Velocity vs. Speed"
                value={newLessonTopic}
                onChange={(e) => setNewLessonTopic(e.target.value)}
                className="w-full bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet placeholder:text-on-surface-variant/40"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Month</label>
              <select
                value={newLessonMonth}
                onChange={(e) => setNewLessonMonth(e.target.value)}
                className="w-full bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
              >
                {["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"].map(m => (
                  <option key={m} value={m} className="bg-void-black">{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Theme</label>
              <input
                type="text"
                placeholder="e.g. Motion"
                value={newLessonTheme}
                onChange={(e) => setNewLessonTheme(e.target.value)}
                className="w-full bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet placeholder:text-on-surface-variant/40"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Learning Outcome</label>
              <input
                type="text"
                required
                placeholder="e.g. Distinguish scalar vs vector values..."
                value={newLessonOutcome}
                onChange={(e) => setNewLessonOutcome(e.target.value)}
                className="w-full bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet placeholder:text-on-surface-variant/40"
              />
            </div>
          </div>

          {/* Teacher custom resources */}
          <div className="border-t border-glass-stroke pt-6 space-y-4">
            <h4 className="text-sm font-bold text-plasma-violet uppercase tracking-wider">Teacher Resources & Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Personal Video Link</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=personal"
                  value={newLessonPersonalVideo}
                  onChange={(e) => setNewLessonPersonalVideo(e.target.value)}
                  className="w-full bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet placeholder:text-on-surface-variant/40"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Video Tutorial Link</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=tutorial"
                  value={newLessonVideoTutorial}
                  onChange={(e) => setNewLessonVideoTutorial(e.target.value)}
                  className="w-full bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet placeholder:text-on-surface-variant/40"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Study Notes (URL/PDF)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/notes"
                  value={newLessonNotes}
                  onChange={(e) => setNewLessonNotes(e.target.value)}
                  className="w-full bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet placeholder:text-on-surface-variant/40"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Topic Test / Quiz Link</label>
                <input
                  type="url"
                  placeholder="https://forms.google.com/quiz"
                  value={newLessonTest}
                  onChange={(e) => setNewLessonTest(e.target.value)}
                  className="w-full bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet placeholder:text-on-surface-variant/40"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Instructional Flow steps */}
          <div className="border-t border-glass-stroke pt-6 space-y-4">
            <h4 className="text-sm font-bold text-plasma-violet uppercase tracking-wider">Instructional Flow Steps</h4>
            
            <div className="space-y-4">
              {instructionalSteps.map((step, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-glass-stroke space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold">Step {idx + 1}</span>
                    <input
                      type="text"
                      placeholder="Duration (e.g. 5 mins)"
                      value={step.duration}
                      onChange={(e) => handleStepChange(idx, 'duration', e.target.value)}
                      className="bg-white/5 border border-glass-stroke rounded px-2.5 py-1 text-[10px] text-on-surface focus:outline-none focus:border-plasma-violet"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Step Name (e.g. Hook)"
                        value={step.step}
                        onChange={(e) => handleStepChange(idx, 'step', e.target.value)}
                        className="w-full bg-white/5 border border-glass-stroke rounded px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        placeholder="Activity details..."
                        value={step.activity}
                        onChange={(e) => handleStepChange(idx, 'activity', e.target.value)}
                        className="w-full bg-white/5 border border-glass-stroke rounded px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-plasma-violet to-electric-cyan text-white text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Deploy Topic / Lesson
          </button>
        </form>
      )}
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="max-w-md">
        <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">Select Student</label>
        <select
          onChange={(e) => {
            const student = students.find(s => s.uid === e.target.value);
            if (student) handleStudentSelect(student);
            else setSelectedStudent(null);
          }}
          className="w-full bg-white/5 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
        >
          <option value="" className="bg-void-black">-- Choose Student --</option>
          {students.map(s => <option key={s.uid} value={s.uid} className="bg-void-black">{s.fullName} ({s.academicInfo?.className ? `Class ${s.academicInfo.className}` : 'No Class'})</option>)}
        </select>
      </div>

      {selectedStudent ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left/Middle Columns: Profile and Courses */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel border border-glass-stroke rounded-2xl p-6 bg-white/5">
              <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wider italic">Student Profile</h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-sans mb-6">
                <div>
                  <p className="text-on-surface-variant font-bold">Full Name:</p>
                  <p className="text-white text-sm mt-0.5">{selectedStudent.fullName}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold">Email:</p>
                  <p className="text-white text-sm mt-0.5">{selectedStudent.email}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold">Class Grade:</p>
                  <p className="text-white text-sm mt-0.5">
                    {selectedStudent.academicInfo?.className ? `Class ${selectedStudent.academicInfo.className}` : 'Unassigned'}
                  </p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold">Cognitive Load:</p>
                  <p className="text-white text-sm mt-0.5">{selectedStudent.cognitiveLoad}%</p>
                </div>
              </div>

              {/* Class Re-assignment or Assign Dropdown */}
              <div className="border-t border-glass-stroke pt-4">
                <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-2">
                  Assign / Change Student Class
                </label>
                <div className="flex gap-3 max-w-sm">
                  <select
                    value={selectedStudent.academicInfo?.className || ''}
                    disabled={assigningClass}
                    onChange={(e) => handleAssignClass(e.target.value)}
                    className="flex-1 bg-white/5 border border-glass-stroke rounded-xl px-4 py-2 text-xs text-on-surface focus:outline-none focus:border-plasma-violet disabled:opacity-50"
                  >
                    <option value="" className="bg-void-black">-- Select Class --</option>
                    {allClasses.map(c => (
                      <option key={c} value={c} className="bg-void-black">{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-plasma-violet uppercase tracking-wider">Existing Assigned Courses</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studentCourses.length > 0 ? (
                  studentCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => handleCourseSelect(course)}
                      className="glass-panel border border-glass-stroke rounded-2xl overflow-hidden p-6 bg-white/5 hover:border-plasma-violet/50 hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-plasma-violet/10 border border-plasma-violet/20 flex items-center justify-center mb-4">
                        <Book className="w-5 h-5 text-plasma-violet" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">{course.subject}</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-4">{course.title}</p>
                      <div className="text-[9px] font-mono text-plasma-violet uppercase tracking-widest font-bold flex items-center">
                        Inspect Syllabus <ChevronRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 glass-panel border-dashed border-glass-stroke rounded-2xl text-center text-on-surface-variant italic text-xs">
                    No courses found matching this student's class level.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Quick Add Topic/Lesson Form */}
          <div className="space-y-6">
            <form onSubmit={handleAddQuickLesson} className="glass-panel border border-glass-stroke rounded-2xl p-6 bg-white/5 space-y-4">
              <h4 className="text-base font-bold text-white uppercase tracking-wider italic flex items-center gap-2">
                <Plus className="w-5 h-5 text-plasma-violet" />
                Add Lesson to Student Course
              </h4>

              <div>
                <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-1">Select Student's Course</label>
                <select
                  value={quickLessonCourseId}
                  onChange={(e) => {
                    setQuickLessonCourseId(e.target.value);
                  }}
                  className="w-full bg-white/5 border border-glass-stroke rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
                >
                  <option value="" className="bg-void-black">-- Select Course --</option>
                  {studentCourses.map(c => (
                    <option key={c.id} value={c.id} className="bg-void-black">
                      {c.subject}: {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {quickLessonCourseId && (
                <>
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-1">Select Module</label>
                    {quickLessonModules.length > 0 ? (
                      <select
                        value={quickLessonModuleId}
                        onChange={(e) => setQuickLessonModuleId(e.target.value)}
                        className="w-full bg-white/5 border border-glass-stroke rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
                      >
                        {quickLessonModules.map(m => (
                          <option key={m.id} value={m.id} className="bg-void-black">
                            {m.term} - {m.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-[10px] text-on-surface-variant italic">No modules found for this course.</p>
                        <button
                          type="button"
                          onClick={handleAutoCreateModule}
                          className="px-3 py-1.5 rounded bg-plasma-violet/20 hover:bg-plasma-violet/30 border border-plasma-violet/40 text-plasma-violet font-mono text-[9px] font-bold uppercase tracking-wider transition-all"
                        >
                          Auto-create Default Module
                        </button>
                      </div>
                    )}
                  </div>

                  {quickLessonModuleId && (
                    <>
                      <div>
                        <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-1">Topic Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Velocity & Acceleration"
                          value={quickLessonTopic}
                          onChange={(e) => setQuickLessonTopic(e.target.value)}
                          className="w-full bg-white/5 border border-glass-stroke rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-1">Theme</label>
                          <input
                            type="text"
                            placeholder="e.g. Kinematics"
                            value={quickLessonTheme}
                            onChange={(e) => setQuickLessonTheme(e.target.value)}
                            className="w-full bg-white/5 border border-glass-stroke rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-1">Month</label>
                          <select
                            value={quickLessonMonth}
                            onChange={(e) => setQuickLessonMonth(e.target.value)}
                            className="w-full bg-white/5 border border-glass-stroke rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
                          >
                            {["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"].map(m => (
                              <option key={m} value={m} className="bg-void-black">{m}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-1">Learning Outcome</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Distinguish scalar vs vector values..."
                          value={quickLessonOutcome}
                          onChange={(e) => setQuickLessonOutcome(e.target.value)}
                          className="w-full bg-white/5 border border-glass-stroke rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-1">Personal Video Link</label>
                        <input
                          type="url"
                          placeholder="https://youtube.com/watch?v=personal"
                          value={quickLessonPersonalVideo}
                          onChange={(e) => setQuickLessonPersonalVideo(e.target.value)}
                          className="w-full bg-white/5 border border-glass-stroke rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-1">Video Tutorial Link</label>
                        <input
                          type="url"
                          placeholder="https://youtube.com/watch?v=tutorial"
                          value={quickLessonVideoTutorial}
                          onChange={(e) => setQuickLessonVideoTutorial(e.target.value)}
                          className="w-full bg-white/5 border border-glass-stroke rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-1">Study Notes URL</label>
                        <input
                          type="url"
                          placeholder="https://drive.google.com/file/notes"
                          value={quickLessonNotes}
                          onChange={(e) => setQuickLessonNotes(e.target.value)}
                          className="w-full bg-white/5 border border-glass-stroke rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest font-bold mb-1">Topic Test URL</label>
                        <input
                          type="url"
                          placeholder="https://forms.google.com/quiz"
                          value={quickLessonTest}
                          onChange={(e) => setQuickLessonTest(e.target.value)}
                          className="w-full bg-white/5 border border-glass-stroke rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-plasma-violet"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-plasma-violet to-electric-cyan text-white text-[10px] font-bold uppercase tracking-widest hover:scale-102 active:scale-98 transition-all cursor-pointer mt-2"
                      >
                        Deploy Topic / Lesson
                      </button>
                    </>
                  )}
                </>
              )}
            </form>
          </div>
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
          <Users className="w-12 h-12 text-on-surface-variant mb-4" />
          <p className="text-xs text-on-surface-variant">Select a student above to inspect their assigned courses and study paths.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-on-surface tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-plasma-violet" />
          Academic Course Hub
        </h2>
        <p className="text-on-surface-variant mt-2 max-w-2xl">
          CBSE & NEP 2020 Aligned Curriculum Framework.
          <span className="text-plasma-violet font-semibold ml-1">
            Digital Syllabus Breakdown & Lesson Planning.
          </span>
        </p>
      </div>

      {profile?.role === 'mentor' && (
        <div className="flex gap-4 border-b border-glass-stroke pb-4 mb-8">
          <button
            onClick={() => { setMentorMode('explorer'); setView('selection'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              mentorMode === 'explorer' 
                ? 'bg-plasma-violet text-white shadow-lg' 
                : 'text-on-surface-variant hover:text-white bg-white/5'
            }`}
          >
            Course Explorer
          </button>
          <button
            onClick={() => setMentorMode('creator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              mentorMode === 'creator' 
                ? 'bg-plasma-violet text-white shadow-lg' 
                : 'text-on-surface-variant hover:text-white bg-white/5'
            }`}
          >
            Course Creator
          </button>
          <button
            onClick={() => setMentorMode('students')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              mentorMode === 'students' 
                ? 'bg-plasma-violet text-white shadow-lg' 
                : 'text-on-surface-variant hover:text-white bg-white/5'
            }`}
          >
            Student Courses
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <div key="loading" className="flex items-center justify-center py-40">
            <div className="w-12 h-12 border-2 border-plasma-violet/20 border-t-plasma-violet rounded-full animate-spin" />
          </div>
        ) : (
          <div key={view}>
            {profile?.role === 'mentor' && mentorMode === 'creator' ? (
              renderCreator()
            ) : profile?.role === 'mentor' && mentorMode === 'students' ? (
              renderStudents()
            ) : (
              <>
                {view === 'selection' && renderSelection()}
                {view === 'details' && renderDetails()}
                {view === 'lesson' && renderLesson()}
              </>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModuleLessonList({ courseId, moduleId, onLessonSelect }: { courseId: string, moduleId: string, onLessonSelect: (lesson: Lesson) => void }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      const data = await dbService.getModuleLessons(courseId, moduleId);
      setLessons(data);
      setLoading(false);
    };
    fetchLessons();
  }, [courseId, moduleId]);

  if (loading) return <div className="h-20 animate-pulse bg-white/5 rounded-xl" />;

  return (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        <BookOpen className="w-3.5 h-3.5" />
        Syllabus Breakdown
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => onLessonSelect(lesson)}
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-glass-stroke hover:border-plasma-violet/40 hover:bg-white/10 transition-all text-left group cursor-pointer"
          >
            <div>
              <p className="text-xs font-bold text-white group-hover:text-plasma-violet transition-colors">
                {lesson.topic}
              </p>
              <p className="text-[10px] text-on-surface-variant mt-1 italic">
                {lesson.month} • {lesson.theme}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-plasma-violet transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}

