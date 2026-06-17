/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppView, UserProfile } from '../types';
import { updateProfile } from 'firebase/auth';
import { authService } from '../services/auth.service';
import { dbService } from '../services/db.service';
import { AppLogo } from './AppLogo';

interface RegisterPageProps {
  setView: (view: AppView) => void;
  setUserRole: (role: 'student' | 'mentor') => void;
  setUserProfile: (profile: any) => void;
  addNotification?: (msg: string) => void;
}

export default function RegisterPage({ setView, setUserRole, setUserProfile, addNotification }: RegisterPageProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<'Learner' | 'Mentor' | null>(null);
  
  const [designation, setDesignation] = useState('');
  const [comms, setComms] = useState('');
  const [encryption, setEncryption] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');

  // Academic States
  const [academicLevel, setAcademicLevel] = useState<'primary' | 'secondary' | 'high_secondary' | 'undergraduate' | ''>('');
  const [className, setClassName] = useState('');
  const [stream, setStream] = useState('');
  const [entranceExam, setEntranceExam] = useState('');
  const [ugStream, setUgStream] = useState<'Engineering' | 'Medical' | ''>('');
  const [ugCourse, setUgCourse] = useState('');
  const [ugYear, setUgYear] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNextStep1 = () => {
    if (selectedRole) {
      setStep(2);
    }
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'Learner') {
      setStep(3);
    } else {
      handleCompleteRegistration(e);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const activeTab = selectedRole === 'Mentor' ? 'mentor' : 'student';

      // Validate teacher email exists in DB for students
      if (activeTab === 'student') {
        if (!teacherEmail.trim()) {
          throw new Error("Teacher's Email is required for registration.");
        }
        
        try {
          const checkResponse = await fetch(`/api/users?role=mentor&email=${encodeURIComponent(teacherEmail.trim())}`);
          if (!checkResponse.ok) {
            throw new Error("Unable to contact verification service. Please try again.");
          }
          const mentors = await checkResponse.json();
          if (!Array.isArray(mentors) || mentors.length === 0) {
            throw new Error(`Teacher email "${teacherEmail.trim()}" is not registered in the system. Please input a valid mentor email.`);
          }
        } catch (valErr: any) {
          throw new Error(valErr.message || "Teacher email verification failed.");
        }
      }

      const userCredential = await authService.register(comms, encryption);
      const user = userCredential.user;

      // Update auth profile
      await updateProfile(user, {
        displayName: designation
      });

      const profileData: UserProfile = {
        uid: user.uid,
        fullName: designation,
        email: comms,
        role: activeTab,
        specialty: selectedRole === 'Mentor' ? 'Cohort Architect' : 'Cognitive Explorer',
        preferredLanguage: 'English (Default)',
        focusStreak: 0,
        bestFocusStreak: 0,
        taskCompletionRate: 0,
        lastFocusDate: undefined,
        dailyFocusGoal: 120, // 2 hours default
        todayFocusMinutes: 0,
        teacherEmail: selectedRole === 'Learner' ? teacherEmail || undefined : undefined,
        academicInfo: selectedRole === 'Learner' ? {
          level: academicLevel as any,
          className: className || undefined,
          stream: stream || undefined,
          entranceExam: entranceExam || undefined,
          ugStream: ugStream || undefined,
          ugCourse: ugCourse || undefined,
          ugYear: ugYear || undefined,
        } : undefined,
        achievements: [],
        createdAt: new Date().toISOString(),
      };

      try {
        await dbService.createUserProfile(profileData);
      } catch (err) {
        console.warn("Error creating user profile via API", err);
      }

      setUserProfile(profileData);
      setUserRole(activeTab);
      setView(activeTab === 'student' ? 'map' : 'insights');

      if (addNotification) {
        addNotification(`Signature Registered. Sync Activated for ${designation}!`);
      }
    } catch (err: any) {
      console.error('Registration state error:', err);
      let msg = err.message || 'Signature registration pipeline failed.';
      
      // Provide actionable feedback for the specific error requested by user
      if (err.code === 'auth/operation-not-allowed') {
        msg = 'Registration is currently restricted. Please enable Email/Password provider in the Firebase Console Settings.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Cognitive Sync address is already registered. Redirecting to login...';
        setTimeout(() => setView('login'), 2000);
      } else if (err.code === 'auth/weak-password') {
        msg = 'Neural key is too weak. Ensure at least 6 characters.';
      }
      
      setErrorMessage(msg);
      if (addNotification) {
        addNotification(`Signature fault: ${msg.slice(0, 50)}...`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-5 md:p-[80px] font-sans antialiased text-[#e1e2e7] overflow-x-hidden relative selection:bg-plasma-violet selection:text-white">
      <style dangerouslySetInnerHTML={{ __html: `
        .register-body {
            background-color: #05070a;
            background-image: radial-gradient(circle at 50% 50%, #1A0B2E 0%, transparent 70%);
            background-attachment: fixed;
            background-size: 200vw 200vh;
            background-position: center;
        }

        .glass-panel-reg {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }

        .ambient-glow-violet {
            box-shadow: 0 0 40px rgba(112, 0, 255, 0.3);
        }
        
        .ambient-glow-violet-active:active {
            box-shadow: 0 0 60px rgba(112, 0, 255, 0.5);
            transform: scale(0.98);
        }

        .glass-input-reg {
            background: rgba(0, 0, 0, 0.2);
            border: none;
            border-bottom: 1px solid #3b494c;
            transition: all 0.3s ease;
        }

        .glass-input-reg:focus {
            outline: none;
            border-bottom-color: #7000FF;
            box-shadow: 0 4px 20px -10px rgba(112, 0, 255, 0.5);
        }
        
        /* Font scaling specific to registration based on user's HTML payload */
        .text-display-lg-mobile { font-size: 40px; line-height: 1.2; letter-spacing: -0.02em; font-weight: 700; }
        .text-display-lg { font-size: 64px; line-height: 1.1; letter-spacing: -0.02em; font-weight: 700; }
        .text-body-lg { font-size: 18px; line-height: 1.6; font-weight: 400; }
        .text-data-mono { font-size: 14px; line-height: 1.4; font-weight: 400; }
        .text-body-md { font-size: 16px; line-height: 1.6; font-weight: 400; }
        .text-headline-sm { font-size: 24px; line-height: 1.4; font-weight: 500; }
        .text-headline-md { font-size: 32px; line-height: 1.3; font-weight: 600; }
        .text-label-caps { font-size: 12px; line-height: 1.0; letter-spacing: 0.1em; font-weight: 500; }
        .font-geist { font-family: 'Geist', sans-serif; }
      ` }} />
      <div className="absolute inset-0 register-body -z-10" />

      <main className="w-full max-w-4xl relative z-10 flex flex-col items-center">
        {/* Brand / Header */}
        <div className="mb-12 text-center font-geist flex flex-col items-center gap-2">
          <AppLogo className="w-20 h-20 sm:w-24 sm:h-24 mb-4" />
          <p className="text-body-lg text-[#bac9cc] mt-2">Initialize your cognitive journey.</p>
        </div>

        {/* Main Glass Container */}
        <div className="glass-panel-reg w-full rounded-2xl p-8 md:p-12 relative overflow-hidden">
          {/* Background Accent */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-[#7000FF] rounded-full mix-blend-screen filter blur-[100px] opacity-30 pointer-events-none"></div>

          {/* Flow Container */}
          <div className="relative min-h-[400px]">
            {/* Step 1: Identity Selection */}
            <div className={`w-full transition-all duration-500 font-geist ${step === 1 ? 'opacity-100 relative translate-y-0' : 'opacity-0 absolute pointer-events-none translate-y-[20px]'}`}>
              <div className="mb-8">
                <span className="text-label-caps text-[#7000FF] tracking-widest uppercase mb-2 block">Phase 01</span>
                <h2 className="text-headline-md text-white">Identity Selection</h2>
                <p className="text-body-md text-[#bac9cc] mt-2">Choose your primary operational mode within the system.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Learner Role */}
                <div 
                  className={`glass-panel-reg rounded-xl p-6 flex flex-col items-center text-center group cursor-pointer transition-all duration-300 ${selectedRole === 'Learner' ? 'border-[#7000FF] scale-105 shadow-[0_0_30px_rgba(112,0,255,0.2)] bg-gradient-to-br from-[rgba(112,0,255,0.2)] to-transparent' : 'hover:border-[#7000FF] hover:scale-105 hover:shadow-[0_0_30px_rgba(112,0,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.1)] to-transparent'}`}
                  onClick={() => setSelectedRole('Learner')}
                >
                  <div className={`w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border transition-colors ${selectedRole === 'Learner' ? 'border-[#7000FF]' : 'border-[rgba(255,255,255,0.12)] group-hover:border-[#7000FF]'}`}>
                    <span className={`material-symbols-outlined text-4xl transition-colors ${selectedRole === 'Learner' ? 'text-[#7000FF]' : 'text-white group-hover:text-[#7000FF]'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      psychology
                    </span>
                  </div>
                  <h3 className="text-headline-sm text-white mb-2">Learner</h3>
                  <p className="text-body-md text-[#bac9cc]">Absorb knowledge, complete modules, and expand your cognitive capacity.</p>
                </div>

                {/* Mentor Role */}
                <div 
                  className={`glass-panel-reg rounded-xl p-6 flex flex-col items-center text-center group cursor-pointer transition-all duration-300 ${selectedRole === 'Mentor' ? 'border-[#7000FF] scale-105 shadow-[0_0_30px_rgba(112,0,255,0.2)] bg-gradient-to-br from-[rgba(112,0,255,0.2)] to-transparent' : 'hover:border-[#7000FF] hover:scale-105 hover:shadow-[0_0_30px_rgba(112,0,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.1)] to-transparent'}`}
                  onClick={() => setSelectedRole('Mentor')}
                >
                  <div className={`w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border transition-colors ${selectedRole === 'Mentor' ? 'border-[#7000FF]' : 'border-[rgba(255,255,255,0.12)] group-hover:border-[#7000FF]'}`}>
                    <span className={`material-symbols-outlined text-4xl transition-colors ${selectedRole === 'Mentor' ? 'text-[#7000FF]' : 'text-white group-hover:text-[#7000FF]'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      architecture
                    </span>
                  </div>
                  <h3 className="text-headline-sm text-white mb-2">Mentor</h3>
                  <p className="text-body-md text-[#bac9cc]">Guide learners, curate curriculums, and monitor cognitive progress.</p>
                </div>
              </div>

              <div className="mt-12 flex justify-between items-center">
                <button className="text-label-caps text-[#bac9cc] hover:text-white transition-colors flex items-center gap-2" onClick={() => setView('login')}>
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Back to Sync
                </button>
                <div className="h-[48px]">
                  {selectedRole && (
                    <button 
                      className="px-8 py-3 rounded-full bg-gradient-to-r from-[#7000FF] to-[#00ee98] text-white text-label-caps ambient-glow-violet ambient-glow-violet-active transition-all animate-[fadeIn_0.3s_ease-out]"
                      onClick={handleNextStep1}
                    >
                      Initialize Core <span className="material-symbols-outlined text-sm align-middle ml-2">arrow_forward</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Cognitive Sync (Details) */}
            <div className={`w-full transition-all duration-500 font-geist ${step === 2 ? 'opacity-100 relative translate-y-0' : 'opacity-0 absolute pointer-events-none translate-y-[20px]'}`}>
              <div className="mb-8">
                <span className="text-label-caps text-[#7000FF] tracking-widest uppercase mb-2 block">Phase 02</span>
                <h2 className="text-headline-md text-white">Cognitive Sync</h2>
                <p className="text-body-md text-[#bac9cc] mt-2">Establish your neural parameters.</p>
              </div>

              <form className="space-y-6 mt-8 w-full max-w-md mx-auto" onSubmit={handleNextStep2}>
                {errorMessage && (
                  <div className="p-3 rounded-lg bg-red-900/40 border border-red-500/50 text-red-200 font-medium text-xs flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
                    <span className="material-symbols-outlined text-sm flex-shrink-0">report</span>
                    <span>{errorMessage}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="font-mono text-data-mono text-[#bac9cc] block" htmlFor="designation">Primary Designation (Name)</label>
                  <input 
                    className="glass-input-reg w-full px-4 py-3 text-white text-body-lg placeholder-[#bac9cc]/50 focus:ring-0 rounded-t-lg" 
                    id="designation" 
                    placeholder="e.g. Subject 849" 
                    required 
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-data-mono text-[#bac9cc] block" htmlFor="comms">Comms Link (Email)</label>
                  <input 
                    className="glass-input-reg w-full px-4 py-3 text-white text-body-lg placeholder-[#bac9cc]/50 focus:ring-0 rounded-t-lg" 
                    id="comms" 
                    placeholder="signal@network.io" 
                    required 
                    type="email"
                    value={comms}
                    onChange={(e) => setComms(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-data-mono text-[#bac9cc] block" htmlFor="encryption">Encryption Key (Password)</label>
                  <input 
                    className="glass-input-reg w-full px-4 py-3 text-white text-body-lg placeholder-[#bac9cc]/50 focus:ring-0 rounded-t-lg" 
                    id="encryption" 
                    placeholder="••••••••" 
                    required 
                    type="password"
                    value={encryption}
                    onChange={(e) => setEncryption(e.target.value)}
                  />
                </div>

                <div className="pt-8 flex justify-between items-center">
                  <button className="text-label-caps text-[#bac9cc] hover:text-white transition-colors flex items-center gap-2" onClick={() => setStep(1)} type="button">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Retract
                  </button>
                  <button 
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-[#7000FF] to-[#00ee98] text-white text-label-caps ambient-glow-violet ambient-glow-violet-active transition-all"
                    type="submit"
                  >
                    {selectedRole === 'Learner' ? (
                      <>
                        Academic Path <span className="material-symbols-outlined text-sm">school</span>
                      </>
                    ) : (
                      <>
                        Finalize Sync <span className="material-symbols-outlined text-sm">check_circle</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Step 3: Academic Protocol (Students Only) */}
            <div className={`w-full transition-all duration-500 font-geist ${step === 3 ? 'opacity-100 relative translate-y-0' : 'opacity-0 absolute pointer-events-none translate-y-[20px]'}`}>
              <div className="mb-8">
                <span className="text-label-caps text-[#7000FF] tracking-widest uppercase mb-2 block">Phase 03</span>
                <h2 className="text-headline-md text-white">Academic Protocol</h2>
                <p className="text-body-md text-[#bac9cc] mt-2">Configure your educational trajectory.</p>
              </div>

              <form className="space-y-6 mt-8 w-full max-w-md mx-auto" onSubmit={handleCompleteRegistration}>
                <div className="space-y-2">
                  <label className="font-mono text-data-mono text-[#bac9cc] block">Teacher's Email Address (Required)</label>
                  <input 
                    className="glass-input-reg w-full px-4 py-3 text-white text-body-md"
                    placeholder="mentor@synapse.edu" 
                    required 
                    type="email"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-data-mono text-[#bac9cc] block">Primary Level</label>
                  <select 
                    className="glass-input-reg w-full px-4 py-3 text-white bg-[#05070a] rounded-t-lg"
                    value={academicLevel}
                    onChange={(e) => {
                      setAcademicLevel(e.target.value as any);
                      setClassName('');
                      setStream('');
                      setEntranceExam('');
                      setUgStream('');
                    }}
                    required
                  >
                    <option value="" disabled>Select Level</option>
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="high_secondary">High Secondary</option>
                    <option value="undergraduate">Undergraduate</option>
                  </select>
                </div>

                {/* Primary/Secondary Class selection */}
                {(academicLevel === 'primary' || academicLevel === 'secondary') && (
                  <div className="space-y-2 animate-[fadeIn_0.3s_ease-out]">
                    <label className="font-mono text-data-mono text-[#bac9cc] block">Class Designation</label>
                    <select 
                      className="glass-input-reg w-full px-4 py-3 text-white bg-[#05070a] rounded-t-lg"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select Class</option>
                      {academicLevel === 'primary' 
                        ? [1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Class {n}</option>)
                        : [6, 7, 8, 9, 10].map(n => <option key={n} value={n}>Class {n}</option>)
                      }
                    </select>
                  </div>
                )}

                {/* High Secondary flow */}
                {academicLevel === 'high_secondary' && (
                  <>
                    <div className="space-y-2 animate-[fadeIn_0.2s_ease-out]">
                      <label className="font-mono text-data-mono text-[#bac9cc] block">Stream Specialization</label>
                      <div className="flex gap-2">
                        {['Science', 'Commerce', 'Arts'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setStream(s)}
                            className={`flex-1 py-3 rounded-lg border text-xs font-bold uppercase transition-all ${stream === s ? 'bg-plasma-violet/20 border-plasma-violet text-white' : 'bg-white/5 border-glass-stroke text-on-surface-variant hover:bg-white/10'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 animate-[fadeIn_0.3s_ease-out]">
                      <label className="font-mono text-data-mono text-[#bac9cc] block">Class Level</label>
                      <select 
                        className="glass-input-reg w-full px-4 py-3 text-white bg-[#05070a] rounded-t-lg"
                        value={className}
                        onChange={(e) => {
                          setClassName(e.target.value);
                          if (e.target.value !== '12') setEntranceExam('');
                        }}
                        required
                      >
                        <option value="" disabled>Select Class</option>
                        <option value="11">Class 11</option>
                        <option value="12">Class 12</option>
                      </select>
                    </div>

                    {className === '12' && stream === 'Science' && (
                      <div className="space-y-2 animate-[fadeIn_0.4s_ease-out]">
                        <label className="font-mono text-data-mono text-[#bac9cc] block">Entrance Alignment</label>
                        <div className="flex gap-2">
                          {['JEE', 'MHCET', 'NEET'].map((exam) => (
                            <button
                              key={exam}
                              type="button"
                              onClick={() => setEntranceExam(exam)}
                              className={`flex-1 py-3 rounded-lg border text-[10px] font-bold uppercase transition-all ${entranceExam === exam ? 'bg-synapse-green/20 border-synapse-green text-synapse-green' : 'bg-white/5 border-glass-stroke text-on-surface-variant hover:bg-white/10'}`}
                            >
                              {exam}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Undergraduate flow */}
                {academicLevel === 'undergraduate' && (
                  <>
                    <div className="space-y-2 animate-[fadeIn_0.2s_ease-out]">
                      <label className="font-mono text-data-mono text-[#bac9cc] block">Academic Domain</label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setUgStream('Engineering')}
                          className={`flex-1 py-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${ugStream === 'Engineering' ? 'bg-[#7000FF]/20 border-[#7000FF] text-white' : 'bg-white/5 border-glass-stroke text-on-surface-variant hover:bg-white/10'}`}
                        >
                          <span className="material-symbols-outlined text-2xl">engineering</span>
                          <span className="text-[10px] font-bold uppercase">Engineering</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUgStream('Medical')}
                          className={`flex-1 py-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${ugStream === 'Medical' ? 'bg-[#00ee98]/20 border-[#00ee98] text-white' : 'bg-white/5 border-glass-stroke text-on-surface-variant hover:bg-white/10'}`}
                        >
                          <span className="material-symbols-outlined text-2xl">medical_services</span>
                          <span className="text-[10px] font-bold uppercase">Medical</span>
                        </button>
                      </div>
                    </div>

                    {ugStream && (
                      <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                        <div className="space-y-2">
                          <label className="font-mono text-data-mono text-[#bac9cc] block">Major / Course</label>
                          <input 
                            className="glass-input-reg w-full px-4 py-3 text-white text-body-md placeholder-[#bac9cc]/50 focus:ring-0 rounded-t-lg" 
                            placeholder={ugStream === 'Engineering' ? "e.g. Computer Science" : "e.g. MBBS / BDS"}
                            required 
                            type="text"
                            value={ugCourse}
                            onChange={(e) => setUgCourse(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-mono text-data-mono text-[#bac9cc] block">Current Year</label>
                          <select 
                            className="glass-input-reg w-full px-4 py-3 text-white bg-[#05070a] rounded-t-lg"
                            value={ugYear}
                            onChange={(e) => setUgYear(e.target.value)}
                            required
                          >
                            <option value="" disabled>Select Year</option>
                            {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>Year {y}</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-8 flex justify-between items-center">
                  <button className="text-label-caps text-[#bac9cc] hover:text-white transition-colors flex items-center gap-2" onClick={() => setStep(2)} type="button">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Shift Parameters
                  </button>
                  <button 
                    className={`px-8 py-3 rounded-full transition-all text-label-caps flex items-center justify-center gap-2 ${loading ? 'opacity-75 cursor-not-allowed bg-synapse-green text-void-black' : 'bg-gradient-to-r from-[#7000FF] to-[#00ee98] text-white ambient-glow-violet ambient-glow-violet-active'}`} 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        Syncing... <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      </>
                    ) : (
                      <>
                        Finalize Sync <span className="material-symbols-outlined text-sm">check_circle</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

