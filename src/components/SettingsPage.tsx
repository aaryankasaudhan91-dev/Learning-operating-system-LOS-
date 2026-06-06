import React, { useState } from 'react';
import { Settings, Sliders, Eye, Database, HelpCircle } from 'lucide-react';
import { AppView } from '../types';

interface SettingsPageProps {
  setView: (view: AppView) => void;
  userRole: 'student' | 'mentor';
}

export default function SettingsPage({ setView, userRole }: SettingsPageProps) {
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto pb-24 pt-6 space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-container border border-glass-stroke flex items-center justify-center">
            <Settings className="w-6 h-6 text-on-surface" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-sans text-on-surface">System Settings</h1>
            <p className="text-sm font-mono text-on-surface-variant flex items-center gap-2">
              <span>Environment Configuration</span>
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b border-glass-stroke pb-3"><Eye className="w-5 h-5 text-electric-cyan" /> Appearance</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dark Mode Intensity</span>
              <select className="bg-void-black border border-glass-stroke rounded-md text-xs p-1">
                <option>Deep Void (Default)</option>
                <option>Twilight Minimal</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">UI Animations</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-electric-cyan"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b border-glass-stroke pb-3"><Sliders className="w-5 h-5 text-plasma-violet" /> System Performance</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Neural Rendering Threading</span>
              <select className="bg-void-black border border-glass-stroke rounded-md text-xs p-1">
                <option>Hardware Accelerated</option>
                <option>Software (Fallback)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Data Sync Polling Rate</span>
              <select className="bg-void-black border border-glass-stroke rounded-md text-xs p-1">
                <option>Real-Time (500ms)</option>
                <option>Standard (2s)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b border-glass-stroke pb-3"><Database className="w-5 h-5 text-synapse-green" /> Document Storage (NoSQL)</h3>
          
          <div className="p-3 rounded-xl bg-synapse-green/5 border border-synapse-green/20 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-synapse-green font-bold uppercase">Infrastructure</span>
              <span className="text-[10px] font-mono text-synapse-green font-bold uppercase">Active</span>
            </div>
            <p className="text-xs text-on-surface">Connected to <b>Synapse NoSQL Cluster</b>.</p>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              This application uses <b>Firebase Firestore</b> for document-based storage, providing MongoDB-equivalent scalability with real-time sync.
            </p>
          </div>

          <div className="flex gap-4">
            <button className="px-4 py-2 bg-white/5 border border-glass-stroke rounded-lg text-xs hover:bg-white/10 transition-colors">Export DB Schema</button>
            <button className="px-4 py-2 bg-white/5 border border-glass-stroke rounded-lg text-xs hover:bg-white/10 transition-colors">Sync Status</button>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b border-glass-stroke pb-3"><HelpCircle className="w-5 h-5 text-sun-yellow" /> Support</h3>
          <p className="text-xs text-on-surface-variant">Having trouble connecting to the Neural net? Ask the assistant or view docs.</p>
          
          <button 
            className="w-full py-2.5 border border-glass-stroke rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors"
          >
            Open Full Manual
          </button>
        </div>

      </div>
    </div>
  );
}
