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
  Lightbulb, Activity, Layers, Download
} from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { dbService } from '../services/db.service';
import { Course, CourseModule, Lesson } from '../types';

type HubView = 'selection' | 'details' | 'lesson';

export default function CourseHub() {
  const { profile, loading: firebaseLoading } = useFirebase();
  const [view, setView] = useState<HubView>('selection');

  // Selection State
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const [loading, setLoading] = useState(true);

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
    ? (userClass ? [userClass] : allClasses)
    : allClasses;

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const data = await dbService.getCourses();
      
      // Strictly limit the courses state to only the student's assigned class (if they have one)
      const allowedCourses = profile?.role === 'student' && userClass
        ? data.filter(c => c.classLevel === userClass)
        : data;
        
      setCourses(allowedCourses);
      setLoading(false);
    };
    
    if (!firebaseLoading) {
      fetchCourses();
    }
  }, [profile, firebaseLoading, userClass]);

  useEffect(() => {
    if (classes.length === 1 && !selectedClass) {
      setSelectedClass(classes[0]);
    }
  }, [classes, selectedClass]);

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
            className={`px-6 py-2.5 rounded-full font-sans font-bold text-[10px] uppercase tracking-widest transition-all border ${selectedClass === cls
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
                Course modules for <span className="text-white font-bold">{selectedClass}</span> are currently being synchronized.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center opacity-40">
          <GraduationCap className="w-16 h-16 text-on-surface-variant mb-6" />
          <h3 className="text-2xl font-bold text-on-surface mb-2 tracking-tight uppercase italic">Select Academic Grade</h3>
          <p className="text-sm text-on-surface-variant">
            {profile?.role === 'student' && !userClass 
              ? "No secondary/undergraduate courses are synchronized yet."
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
        className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors group mb-6"
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-glass-stroke text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
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
            <div key={module.id} className="glass-panel border border-glass-stroke rounded-2xl overflow-hidden">
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
          <div className="glass-panel border border-glass-stroke rounded-2xl p-6">
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

          <div className="glass-panel border border-glass-stroke rounded-2xl p-6 bg-gradient-to-br from-plasma-violet/5 to-transparent">
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
        className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-sans font-bold uppercase tracking-widest">Back to Modules</span>
      </button>

      <div className="glass-panel border border-glass-stroke rounded-3xl overflow-hidden">
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

      <AnimatePresence mode="wait">
        {loading ? (
          <div key="loading" className="flex items-center justify-center py-40">
            <div className="w-12 h-12 border-2 border-plasma-violet/20 border-t-plasma-violet rounded-full animate-spin" />
          </div>
        ) : (
          <div key={view}>
            {view === 'selection' && renderSelection()}
            {view === 'details' && renderDetails()}
            {view === 'lesson' && renderLesson()}
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
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-glass-stroke hover:border-plasma-violet/40 hover:bg-white/10 transition-all text-left group"
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

