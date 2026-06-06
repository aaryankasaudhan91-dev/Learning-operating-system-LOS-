import React, { useState } from 'react';
import { User, Settings, Shield, Bell, ChevronRight, Save } from 'lucide-react';
import { AppView } from '../types';

interface ProfilePageProps {
  setView: (view: AppView) => void;
  userRole: 'student' | 'mentor';
  userName?: string;
}

export default function ProfilePage({ setView, userRole, userName }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto pb-24 pt-6 space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-electric-cyan to-plasma-violet flex items-center justify-center shadow-lg shadow-electric-cyan/20">
            <User className="w-6 h-6 text-void-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-sans text-on-surface">Profile Identity</h1>
            <p className="text-sm font-mono text-on-surface-variant flex items-center gap-2">
              <span>{userRole === 'mentor' ? 'MENTOR.NODE' : 'STUDENT.NODE'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-synapse-green animate-pulse" />
              <span className="text-synapse-green">SYNCED</span>
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <aside className="md:col-span-4 flex flex-col gap-2 relative">
          {/* Navigation vertical tabs */}
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              activeTab === 'profile' 
                ? 'bg-electric-cyan/10 border-electric-cyan text-electric-cyan' 
                : 'bg-surface-container border-glass-stroke text-on-surface-variant hover:border-electric-cyan/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5" />
              <span className="font-semibold">Cognitive Identity</span>
            </div>
            {activeTab === 'profile' && <ChevronRight className="w-4 h-4" />}
          </button>
          
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              activeTab === 'security' 
                ? 'bg-plasma-violet/10 border-plasma-violet text-plasma-violet' 
                : 'bg-surface-container border-glass-stroke text-on-surface-variant hover:border-plasma-violet/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Security Vault</span>
            </div>
            {activeTab === 'security' && <ChevronRight className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              activeTab === 'preferences' 
                ? 'bg-sun-yellow/10 border-sun-yellow text-sun-yellow' 
                : 'bg-surface-container border-glass-stroke text-on-surface-variant hover:border-sun-yellow/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <span className="font-semibold">Notifications</span>
            </div>
            {activeTab === 'preferences' && <ChevronRight className="w-4 h-4" />}
          </button>
        </aside>

        <section className="md:col-span-8">
          <div className="glass-panel p-6 md:p-8 rounded-2xl w-full min-h-[400px]">
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <h3 className="text-xl font-bold font-sans flex items-center gap-2">
                  <User className="w-5 h-5 opacity-70" /> Configuration
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant font-mono uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue={userName || (userRole === 'mentor' ? 'Mentor Override' : 'Elias V.')}
                      className="w-full bg-void-black/50 border border-glass-stroke p-3 rounded-lg text-on-surface focus:outline-none focus:border-electric-cyan transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant font-mono uppercase tracking-wider">Dialect Preset</label>
                    <select className="w-full bg-void-black/50 border border-glass-stroke p-3 rounded-lg text-on-surface focus:outline-none focus:border-electric-cyan transition-colors">
                      <option>English (Universal)</option>
                      <option>Hindi (Regional)</option>
                      <option>Marathi (Context)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant font-mono uppercase tracking-wider">Learning Style Offset</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-on-surface-variant"><input type="radio" name="style" className="accent-electric-cyan" defaultChecked /> Visual</label>
                      <label className="flex items-center gap-2 text-sm text-on-surface-variant"><input type="radio" name="style" className="accent-electric-cyan" /> Abstract</label>
                      <label className="flex items-center gap-2 text-sm text-on-surface-variant"><input type="radio" name="style" className="accent-electric-cyan" /> Kinesthetic</label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button className="flex items-center gap-2 bg-gradient-to-r from-electric-cyan to-plasma-violet text-void-black px-6 py-2.5 rounded-lg font-bold hover:scale-[1.02] active:scale-95 transition-transform shadow-lg shadow-electric-cyan/20">
                    <Save className="w-4 h-4" /> Save Configuration
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <h3 className="text-xl font-bold font-sans flex items-center gap-2">
                  <Shield className="w-5 h-5 opacity-70" /> Vault Controls
                </h3>
                <p className="text-sm text-on-surface-variant">Manage your connection signatures and multi-factor authentications.</p>
                <div className="p-4 border border-glass-stroke bg-void-black/50 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm">Two-Factor Encryption</p>
                      <p className="text-xs text-on-surface-variant">Recommended for high-load state transfers.</p>
                    </div>
                    <button className="text-xs font-bold text-electric-cyan px-3 py-1.5 border border-electric-cyan/30 rounded-full hover:bg-electric-cyan/10 transition-colors">Enable</button>
                  </div>
                  <div className="h-px w-full bg-glass-stroke" />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm">Change Neural Key (Password)</p>
                      <p className="text-xs text-on-surface-variant">Last altered 30 cycles ago.</p>
                    </div>
                    <button className="text-xs font-bold text-on-surface px-3 py-1.5 border border-glass-stroke rounded-full hover:bg-white/5 transition-colors">Update</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <h3 className="text-xl font-bold font-sans flex items-center gap-2">
                  <Bell className="w-5 h-5 opacity-70" /> Sensory Telemetry
                </h3>
                <p className="text-sm text-on-surface-variant">Control the volume of intervention alerts and cognitive pings.</p>
                <div className="space-y-4">
                  <label className="flex items-start gap-4 p-4 border border-glass-stroke bg-void-black/50 rounded-xl cursor-pointer hover:border-electric-cyan/30 transition-colors">
                    <input type="checkbox" defaultChecked className="mt-1 accent-electric-cyan" />
                    <div>
                      <p className="font-semibold text-sm">Vital Interventions</p>
                      <p className="text-xs text-on-surface-variant">High-severity alerts when spatial loads exceed 90%.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-4 p-4 border border-glass-stroke bg-void-black/50 rounded-xl cursor-pointer hover:border-electric-cyan/30 transition-colors">
                    <input type="checkbox" defaultChecked className="mt-1 accent-electric-cyan" />
                    <div>
                      <p className="font-semibold text-sm">Daily Synthesis Review</p>
                      <p className="text-xs text-on-surface-variant">Receive automated knowledge check summaries.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-4 p-4 border border-glass-stroke bg-void-black/50 rounded-xl cursor-pointer hover:border-electric-cyan/30 transition-colors">
                    <input type="checkbox" className="mt-1 accent-electric-cyan" />
                    <div>
                      <p className="font-semibold text-sm">Silent Mode Auto-engage</p>
                      <p className="text-xs text-on-surface-variant">Do not disturb during peak Flow state.</p>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
