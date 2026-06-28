import React, { useState, useEffect } from 'react';
import { Settings, Sliders, Eye, Database, HelpCircle, Loader2, RefreshCw } from 'lucide-react';
import { AppView } from '../types';
import ManualModal from './ManualModal';

interface SettingsPageProps {
  setView: (view: AppView) => void;
  userRole: 'student' | 'mentor';
}

export default function SettingsPage({ setView, userRole }: SettingsPageProps) {
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/db/telemetry');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.error('Failed to load database telemetry:', err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    fetchTelemetry();
  };

  const handleExportSchema = () => {
    const schemaData = {
      UserProfile: {
        uid: "String",
        email: "String",
        fullName: "String",
        role: "String (student/mentor)",
        cognitiveLoad: "Number",
        lastActive: "String",
        badges: "Array [String]",
        courses: "Array [String]"
      },
      Task: {
        id: "String",
        studentId: "String",
        title: "String",
        status: "String (pending/completed)",
        difficulty: "String (easy/medium/hard)",
        estimatedMinutes: "Number",
        createdAt: "String",
        type: "String",
        description: "String",
        points: "Number"
      },
      Course: {
        id: "String",
        classLevel: "String",
        subject: "String",
        title: "String",
        description: "String",
        order: "Number"
      },
      Module: {
        id: "String",
        courseId: "String",
        term: "String",
        title: "String",
        learningObjectives: "Array [String]",
        order: "Number"
      },
      Lesson: {
        id: "String",
        moduleId: "String",
        month: "String",
        theme: "String",
        topic: "String",
        learningOutcome: "String",
        instructionalFlow: "Array [Object]",
        resources: "Array [String]",
        order: "Number"
      }
    };

    const blob = new Blob([JSON.stringify(schemaData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'synapse_db_schema.json';
    link.click();
    URL.revokeObjectURL(url);
  };

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
                <input type="checkbox" className="sr-only peer" defaultChecked />
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
          
          <div className="p-3 rounded-xl bg-synapse-green/5 border border-synapse-green/20 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-synapse-green font-bold uppercase">Infrastructure</span>
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                telemetry?.status === 'Connected' ? 'bg-synapse-green/20 text-synapse-green' : 'bg-orange-500/20 text-orange-400'
              }`}>
                {isLoading ? 'Loading...' : telemetry?.status || 'Unknown'}
              </span>
            </div>
            
            <p className="text-xs text-on-surface">Connected to <b>Synapse MongoDB Cluster</b>.</p>
            
            {isLoading ? (
              <div className="flex items-center gap-2 py-2 text-xs text-on-surface-variant font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-synapse-green" />
                <span>Reading telemetry...</span>
              </div>
            ) : (
              <div className="space-y-1.5 font-mono text-[10px] text-on-surface-variant border-t border-glass-stroke pt-2">
                <div className="flex justify-between">
                  <span>DB Name:</span>
                  <span className="text-white font-semibold">{telemetry?.dbName || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Connection string:</span>
                  <span className="text-white font-semibold truncate max-w-[180px]">{telemetry?.uri || 'Unknown'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 border-t border-glass-stroke/50 pt-2">
                  <div>Users: <b className="text-white">{telemetry?.counts?.users ?? 0}</b></div>
                  <div>Courses: <b className="text-white">{telemetry?.counts?.courses ?? 0}</b></div>
                  <div>Modules: <b className="text-white">{telemetry?.counts?.modules ?? 0}</b></div>
                  <div>Lessons: <b className="text-white">{telemetry?.counts?.lessons ?? 0}</b></div>
                  <div>Tasks: <b className="text-white">{telemetry?.counts?.tasks ?? 0}</b></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleExportSchema}
              className="px-4 py-2 bg-white/5 border border-glass-stroke rounded-lg text-xs hover:bg-white/10 transition-colors cursor-pointer"
            >
              Export DB Schema
            </button>
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-white/5 border border-glass-stroke rounded-lg text-xs hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSyncing ? (
                <Loader2 className="w-3 h-3 animate-spin text-synapse-green" />
              ) : (
                <RefreshCw className="w-3 h-3 text-synapse-green" />
              )}
              <span>Sync Status</span>
            </button>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b border-glass-stroke pb-3"><HelpCircle className="w-5 h-5 text-sun-yellow" /> Support</h3>
          <p className="text-xs text-on-surface-variant">Having trouble connecting to the Neural net? Ask the assistant or view docs.</p>
          
          <button 
            onClick={() => setIsManualOpen(true)}
            className="w-full py-2.5 border border-glass-stroke rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors cursor-pointer font-bold"
          >
            Open Full Manual
          </button>
        </div>

      </div>

      <ManualModal 
        isOpen={isManualOpen} 
        onClose={() => setIsManualOpen(false)} 
        userRole={userRole} 
      />
    </div>
  );
}
