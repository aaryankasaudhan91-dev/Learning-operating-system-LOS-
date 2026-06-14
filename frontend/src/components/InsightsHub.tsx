/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, Check, Send, Globe, MessageSquare, 
  UserCheck, ShieldAlert, BarChart2, Lightbulb, Users,
  Zap, Target, Activity, BatteryLow, BrainCircuit, TrendingUp,
  FileText, Mic, Square, Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { StudentSeat, InterventionAlert, AppView } from '../types';
import TaskCenter from './TaskCenter';
import ClassroomHeatmap from './ClassroomHeatmap';
import InterventionCenter from './InterventionCenter';

interface InsightsHubProps {
  setView: (view: AppView) => void;
  seats: StudentSeat[];
  setSeats: React.Dispatch<React.SetStateAction<StudentSeat[]>>;
  alerts: InterventionAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<InterventionAlert[]>>;
  addNotification: (msg: string) => void;
}

export default function InsightsHub({
  setView,
  seats,
  setSeats,
  alerts,
  setAlerts,
  addNotification
}: InsightsHubProps) {
  const [selectedCohort, setSelectedCohort] = useState<string>('All High-Friction Students');
  const [promptPayload, setPromptPayload] = useState<string>('');
  const [deployedHistory, setDeployedHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'matrix' | 'tasks' | 'heatmap'>('matrix');
  const [recordingStudentId, setRecordingStudentId] = useState<string | null>(null);

  // PDF Report Generator
  const handleDownloadReport = (student: StudentSeat) => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 229, 255);
    doc.text('Cognitive Deep Analysis Report', 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Student Info Section
    doc.autoTable({
      startY: 40,
      head: [['Metric', 'Value']],
      body: [
        ['Student Name', student.name],
        ['Current Cognitive Load', `${student.load}%`],
        ['Linguistic Preference', student.preferredLanguage],
        ['Neural State', student.state.replace('_', ' ').toUpperCase()],
        ['Seat Coordinates', `Row ${student.row}, Col ${student.col}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [112, 0, 255] }
    });

    // Mock history for table
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Time', 'Action', 'Load Outcome']],
      body: [
        ['08:30 AM', 'Module Launch', '32%'],
        ['09:15 AM', 'Deep Focus Wave', '65%'],
        ['10:00 AM', 'Friction Detected', '88%'],
        ['10:30 AM', 'Support Nudge Sent', '45%'],
      ],
      theme: 'striped'
    });

    doc.save(`Report_${student.name.replace(/\s/g, '_')}.pdf`);
    addNotification(`Generated comprehensive PDF health scan for ${student.name}.`);
  };

  // Simulated Voice Recording
  const handleRecordAudio = (studentName: string) => {
    setRecordingStudentId(studentName);
    addNotification(`Initializing secure audio gateway for ${studentName}...`);
    
    // Simulating a 3-second recording
    setTimeout(() => {
      setRecordingStudentId(null);
      addNotification(`Voice feedback uplink successful. Note synced to ${studentName}'s dashboard.`);
      alert(`Success! Voice snippet recorded and deployed for ${studentName}.`);
    }, 4000);
  };

  // Calculate statistics
  const avgLoad = Math.round(seats.reduce((acc, s) => acc + s.load, 0) / seats.length) || 0;
  const flowCount = seats.filter(s => s.state === 'flow' || s.state === 'deep_focus').length;
  const impasseCount = seats.filter(s => s.state === 'friction' || s.load > 85).length;
  const engagedCount = seats.filter(s => s.state === 'engaged').length;

  // Mock Trend Data for Recharts
  const COGNITIVE_TREND_DATA = [
    { time: '08:00', load: 32, stability: 85 },
    { time: '09:00', load: 45, stability: 82 },
    { time: '10:00', load: 68, stability: 65 },
    { time: '11:00', load: 54, stability: 74 },
    { time: '12:00', load: 42, stability: 88 },
    { time: '13:00', load: 58, stability: 70 },
    { time: '14:00', load: 72, stability: 60 },
    { time: '15:00', load: 48, stability: 92 },
  ];

  // Multi-lingual topography data
  const languages = [
    { name: 'Hindi', label: 'Primary Mode', pct: 42, color: 'bg-tertiary-container' },
    { name: 'English', label: 'Code-switching', pct: 38, color: 'bg-primary' },
    { name: 'Marathi', label: 'Contextual Support', pct: 15, color: 'bg-secondary' }
  ];

  // Deploy Metacognitive Prompt Handler
  const handleDeployPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptPayload.trim()) {
      alert("Please write a prompt payload before deploying.");
      return;
    }
    addNotification(`Deployed Prompt safely list: "${promptPayload}" to target: "${selectedCohort}"`);
    setDeployedHistory(prev => [promptPayload, ...prev]);
    
    // Reduce student stress slightly when a supporting prompt is deployed!
    setSeats(prev => prev.map(seat => {
      if (seat.load > 70) {
        return { ...seat, load: Math.max(seat.load - 10, 45) };
      }
      return seat;
    }));

    setPromptPayload('');
    alert(`Success! Prompt deployed to all student canvases. Responsive feedback monitored.`);
  };

  // Intervention Alert Triggers
  const handleResolveAlert = (alertId: string, actionType: string, studentName: string) => {
    addNotification(`${actionType} successfully deployed for ${studentName}. Syncing synaptic baseline...`);
    
    // Remove alert from list
    setAlerts(prev => prev.filter(al => al.id !== alertId));

    // Calm down student metrics inside seat model
    setSeats(prev => prev.map(seat => {
      if (seat.name === studentName) {
        return { ...seat, state: 'flow', load: 42 };
      }
      return seat;
    }));

    alert(`Action Cleared! ${studentName}'s cognitive impasse resolved.`);
  };

  // Clicking an interactive student block inside spatial load heatmap grid
  const handleSeatClick = (seat: StudentSeat) => {
    const action = confirm(`Student: ${seat.name}\nActive Cognitive Load: ${seat.load}%\nVernacular Preference: ${seat.preferredLanguage}\nMood Status: ${seat.state.replace('_', ' ').toUpperCase()}\n\nWould you like to send a direct Focus Nudge to this student node?`);
    if (action) {
      setSeats(prev => prev.map(s => {
        if (s.id === seat.id) {
          return { ...s, load: Math.max(s.load - 15, 30), state: 'flow' };
        }
        return s;
      }));
      addNotification(`Sent customized flow balance instructions to ${seat.name}.`);
    }
  };

  // Status Indicator Helper for Matrix mapping
  const getStatusIcon = (state: string, load: number) => {
    if (state === 'friction' || load > 85) return <AlertTriangle className="w-3.5 h-3.5 text-red-400 drop-shadow-md" />;
    if (state === 'low_motivation') return <BatteryLow className="w-3.5 h-3.5 text-orange-400 drop-shadow-md" />;
    if (state === 'deep_focus') return <BrainCircuit className="w-3.5 h-3.5 text-plasma-violet drop-shadow-md" />;
    if (state === 'flow') return <Activity className="w-3.5 h-3.5 text-electric-cyan drop-shadow-md" />;
    if (state === 'engaged') return <Zap className="w-3.5 h-3.5 text-synapse-green drop-shadow-md" />;
    return <Check className="w-3.5 h-3.5 text-on-surface-variant drop-shadow-md" />;
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* HEADER SECTION */}
      <header className="mb-4">
        <h1 className="font-sans font-extrabold text-3xl text-on-surface flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-electric-cyan" />
          Feature 17: Asymmetric Mentor Dashboard Insights
        </h1>
        <p className="font-sans text-base text-on-surface-variant max-w-3xl leading-relaxed mt-1">
          Real-time multi-dimensional analysis of cohort performance, cognitive load, and linguistic variance.
        </p>
      </header>

      {/* TAB NAVIGATION */}
      <div className="flex border-b border-glass-stroke mb-8">
        <button 
          onClick={() => setActiveTab('matrix')}
          className={`px-6 py-3 font-sans text-sm font-bold tracking-tight transition-all relative ${
            activeTab === 'matrix' ? 'text-electric-cyan' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Engagement Matrix
          {activeTab === 'matrix' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-electric-cyan shadow-[0_0_10px_rgba(0,229,255,0.5)]" />}
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`px-6 py-3 font-sans text-sm font-bold tracking-tight transition-all relative ${
            activeTab === 'tasks' ? 'text-plasma-violet' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Homework & Task Center
          {activeTab === 'tasks' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-plasma-violet shadow-[0_0_10px_rgba(112,0,255,0.5)]" />}
        </button>
        <button 
          onClick={() => setActiveTab('heatmap')}
          className={`px-6 py-3 font-sans text-sm font-bold tracking-tight transition-all relative ${
            activeTab === 'heatmap' ? 'text-synapse-green' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Feature 7: Non-Intrusive Behavioral Heatmaps
          {activeTab === 'heatmap' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-synapse-green shadow-[0_0_10px_rgba(0,255,145,0.5)]" />}
        </button>
      </div>

      {activeTab === 'matrix' ? (
        <>
          {/* SUMMARY STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
        <div className="glass-panel p-4 rounded-2xl flex flex-col gap-1 border-electric-cyan/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant font-bold">Avg Cohort Load</span>
            <BarChart2 className="w-4 h-4 text-electric-cyan opacity-60" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-on-surface tracking-tight">{avgLoad}%</span>
            <span className={`text-[10px] font-mono ${avgLoad > 70 ? 'text-red-400' : 'text-synapse-green'}`}>
              {avgLoad > 70 ? '▲ High Intensity' : '● Optimal'}
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex flex-col gap-1 border-plasma-violet/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant font-bold">Deep Flow Nodes</span>
            <Activity className="w-4 h-4 text-plasma-violet opacity-60" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-on-surface tracking-tight">{flowCount}</span>
            <span className="text-[10px] text-on-surface-variant opacity-60 font-sans">Active Canvases</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex flex-col gap-1 border-red-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant font-bold">Cognitive Impasse</span>
            <AlertTriangle className="w-4 h-4 text-red-500 opacity-60" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-red-400 tracking-tight">{impasseCount}</span>
            <span className="text-[10px] text-red-400/60 font-sans">{Math.round((impasseCount / seats.length) * 100)}% of Cohort</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex flex-col gap-1 border-synapse-green/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant font-bold">Sync Health</span>
            <Users className="w-4 h-4 text-synapse-green opacity-60" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-on-surface tracking-tight">{Math.round((engagedCount / seats.length) * 100)}%</span>
            <span className="text-[10px] text-synapse-green opacity-60 font-sans">Steady Engagement</span>
          </div>
        </div>
      </div>

      {/* COGNITIVE HEALTH TREND CHART */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 mb-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
          <TrendingUp className="w-24 h-24 text-electric-cyan" />
        </div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h3 className="font-sans font-bold text-lg text-on-surface flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-electric-cyan" />
              Cohort Cognitive Velocity
            </h3>
            <p className="text-xs text-on-surface-variant font-medium">Aggregate load vs. synaptic stability index (8h window)</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-on-surface-variant">
              <span className="w-3 h-1 bg-electric-cyan rounded-full" />
              Avg Load
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-on-surface-variant">
              <span className="w-3 h-1 bg-plasma-violet rounded-full" />
              Stability
            </div>
          </div>
        </div>

        <div className="h-[200px] w-full mt-4 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={COGNITIVE_TREND_DATA}>
              <defs>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorStability" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7000ff" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#7000ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c212b" vertical={false} />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#414753', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                hide 
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a0c10', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif'
                }}
                itemStyle={{ padding: '2px 0' }}
              />
              <Area 
                type="monotone" 
                dataKey="load" 
                stroke="#00e5ff" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorLoad)" 
                animationBegin={500}
                animationDuration={2000}
              />
              <Area 
                type="monotone" 
                dataKey="stability" 
                stroke="#7000ff" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorStability)" 
                strokeDasharray="5 5"
                animationBegin={700}
                animationDuration={2500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BENTO LAYOUT CONTAINER */}
      <div className="space-y-6">
        {/* INTERVENTION CENTER (High Priority) */}
        <section className="glass-panel rounded-3xl p-6 border border-red-500/20 bg-red-400/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
          <InterventionCenter 
            students={seats} 
            onAction={(id, act) => {
              const student = seats.find(s => s.id === id);
              if (student) handleResolveAlert(id, `Deployed ${act} protocol`, student.name);
            }} 
          />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* PANEL 1: Seating Spatial load Matrix (Isometric Grid view) */}
          <section className="glass-panel rounded-2xl xl:col-span-8 p-6 flex flex-col relative overflow-hidden h-[540px]">
          <div className="flex justify-between items-start mb-6 z-10 relative">
            <div>
              <h3 className="font-sans font-bold text-lg text-on-surface">Spatial Load Matrix</h3>
              <p className="text-xs text-on-surface-variant">Classroom alpha-wave correlation & engagement depth (6x4 Matrix)</p>
            </div>
            <div className="flex bg-void-black/70 p-1.5 rounded-full border border-glass-stroke items-center gap-2">
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-electric-cyan px-2 py-0.5 rounded-full bg-electric-cyan/10 border border-electric-cyan/20">
                <span className="w-1.5 h-1.5 rounded-full bg-electric-cyan animate-pulse" />
                Live Feed
              </span>
            </div>
          </div>

          {/* Interactive CSS 3D seating grid map placeholder space */}
          <div className="flex-1 flex items-center justify-center iso-container py-4 relative">
            <div className="absolute inset-0 bg-radial-gradient from-plasma-violet/10 via-transparent to-transparent opacity-40 pointer-events-none" />
            
            {/* 6x4 Grid layout showing layout of 24 student slots */}
            <div className="iso-grid grid grid-cols-6 gap-3.5 w-full max-w-[420px] select-none p-4">
              {seats.map((seat) => {
                // Determine seat color classes depending on metrics
                const loadColor = 
                  seat.load > 85 
                    ? 'text-red-400 bg-red-400/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]' 
                    : seat.state === 'engaged' || seat.state === 'flow'
                    ? 'text-electric-cyan bg-electric-cyan/10 border-electric-cyan/50 hover:shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                    : seat.state === 'deep_focus'
                    ? 'text-plasma-violet bg-plasma-violet/15 border-plasma-violet/60 hover:shadow-[0_0_15px_rgba(112,0,255,0.25)]'
                    : 'text-synapse-green bg-synapse-green/10 border-synapse-green/40 hover:shadow-[0_0_15px_rgba(0,255,163,0.2)]';

                return (
                  <div
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    className={`iso-node relative w-full pt-[100%] rounded-xl border cursor-pointer hover:scale-110 active:scale-95 text-center flex items-center justify-center group/node ${loadColor}`}
                    title={`Click Student to send focus instructions: ${seat.name}`}
                  >
                    {/* Status indicator icon corner */}
                    <div className="absolute top-1.5 right-1.5 opacity-80 group-hover/node:scale-110 transition-transform z-10 pointer-events-none">
                      {getStatusIcon(seat.state, seat.load)}
                    </div>

                    {/* Centered seat indicators label (student initial initials) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-[10px] font-bold pointer-events-none">
                      <span>{seat.name.split(' ').map(n=>n[0]).join('')}</span>
                      <span className="text-[8px] font-sans text-on-surface-variant font-light opacity-65 mt-0.5">
                        {seat.load}%
                      </span>
                    </div>

                    {/* Pop-up tooltip on hovering slot item */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover/node:opacity-100 transition-opacity bg-void-black/95 p-2 rounded-lg border border-glass-stroke text-[11px] font-mono whitespace-nowrap z-50 text-left pointer-events-none shadow-xl max-w-sm">
                      <p className="font-sans font-bold text-on-surface">{seat.name}</p>
                      <p className="text-on-surface-variant">Cognitive Load: {seat.load}%</p>
                      <p className="text-electric-cyan text-[10px]">Dialect Preferred: {seat.preferredLanguage}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color mapping definitions panel */}
          <div className="mt-4 flex flex-wrap gap-4 border-t border-glass-stroke pt-4 z-10 relative">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-on-surface-variant">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 box-content outline outline-solid outline-red-400/20" />
              High Impasse (Friction)
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-on-surface-variant">
              <span className="w-2.5 h-2.5 rounded-full bg-electric-cyan" />
              Flow State
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-on-surface-variant">
              <span className="w-2.5 h-2.5 rounded-full bg-plasma-violet" />
              Deep Focus
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-on-surface-variant">
              <span className="w-2.5 h-2.5 rounded-full bg-synapse-green animate-pulse" />
              Sustainable Engagement
            </div>
          </div>
        </section>

        </div>
      </div>

      {/* LOWER BENTO GRID SHEET: prompt compiler & multi-lingual trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Metacognitive Prompt Uplink deployment Form */}
        <section className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 w-48 h-48 bg-plasma-violet/5 rounded-full blur-[70px] pointer-events-none group-hover:bg-plasma-violet/10 transition-all duration-700" />
          
          <div className="flex items-start gap-4 mb-6 relative z-10 select-none">
            <div className="w-12 h-12 rounded-full bg-plasma-violet/20 border border-plasma-violet/40 flex items-center justify-center shadow-lg shadow-plasma-violet/10 hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5 text-plasma-violet" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-lg text-on-surface">Metacognitive Uplink</h3>
              <p className="text-xs text-on-surface-variant font-medium">Inject reflective logic prompts onto student interfaces</p>
            </div>
          </div>

          <form onSubmit={handleDeployPrompt} className="relative z-10 space-y-4">
            <div>
              <label className="font-sans text-xs uppercase tracking-wider text-on-surface-variant font-bold block mb-2">
                Target Cognitive Group
              </label>
              <select 
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="w-full bg-surface-container-low border-b border-glass-stroke text-on-surface text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-electric-cyan focus:ring-1 focus:ring-electric-cyan/20 appearance-none cursor-pointer transition-all"
              >
                <option>All High-Friction Students</option>
                <option>Cohort Alpha (A. Smith, Elias V.)</option>
                <option>Graph Theory (Dijkstra Group)</option>
              </select>
            </div>

            <div>
              <label className="font-sans text-xs uppercase tracking-wider text-on-surface-variant font-bold block mb-2">
                Prompt Payload
              </label>
              <textarea 
                rows={3}
                value={promptPayload}
                onChange={(e) => setPromptPayload(e.target.value)}
                placeholder="E.g., 'What strategy did you try before hitting this roadblock? Suggest alternative mapping models.'"
                className="w-full bg-surface-container/40 border border-glass-stroke rounded-xl p-3.5 text-sm text-on-surface placeholder-outline-variant focus:outline-none focus:border-electric-cyan focus:ring-1 focus:ring-electric-cyan/20 resize-none transition-all"
              />
            </div>

            <div className="flex justify-between items-center gap-3 pt-2">
              <span className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase font-medium">
                {deployedHistory.length > 0 ? `${deployedHistory.length} Prompt(s) Active` : 'No active drafts'}
              </span>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => alert(`Saved Draft Payload safely inside offline buffer.`)}
                  className="px-5 py-2 rounded-full border border-glass-stroke text-xs text-on-surface-variant hover:text-white hover:bg-white/5 transition-all"
                >
                  Draft
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-electric-cyan to-secondary text-void-black text-xs font-extrabold tracking-wide hover:scale-105 active:scale-95 shadow-md shadow-electric-cyan/15 transition-all flex items-center gap-1.5"
                >
                  Deploy Prompt <Send className="w-3.5 h-3.5 font-bold" />
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Bhashini Trans-Linguistic metrics Topography graph display */}
        <section className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute left-0 top-0 w-48 h-48 bg-tertiary-container/5 rounded-full blur-[70px] pointer-events-none group-hover:bg-tertiary-container/10 transition-all duration-700" />
          
          <div className="flex justify-between items-start mb-6 relative z-10 select-none">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-tertiary/20 border border-tertiary/40 flex items-center justify-center shadow-lg shadow-tertiary/10 hover:scale-105 transition-transform">
                <Globe className="w-5 h-5 text-tertiary" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-lg text-on-surface">Linguistic Topography</h3>
                <p className="text-xs text-on-surface-variant font-medium">Auto-Bhashini regional proxy analytics pipeline</p>
              </div>
            </div>
          </div>

          <div className="space-y-5 relative z-10">
            {languages.map((lang) => (
              <div key={lang.name}>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="font-sans text-on-surface-variant font-medium">
                    {lang.name} <span className="font-sans font-light opacity-65 text-[10px] lowercase italic">({lang.label})</span>
                  </span>
                  <span className="font-mono text-tertiary">{lang.pct}%</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`${lang.color} h-full rounded-full transition-all duration-1000`} 
                    style={{ width: `${lang.pct}%` }} 
                  />
                </div>
              </div>
            ))}

            {/* Insight card */}
            <div className="mt-5 p-4 rounded-xl bg-tertiary/5 border border-tertiary/20 flex gap-3 items-start select-none">
              <Lightbulb className="w-5 h-5 text-tertiary flex-shrink-0 mt-0.5" />
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                <span className="text-on-surface font-semibold">Bhashini Prompt Insight:</span> 28% increase in Hindi queries regarding 'Boolean Logic'. System suggests displaying localized metaphorical explanation overlays automatically.
              </p>
            </div>
          </div>
        </section>

      </div>
      </>
      ) : activeTab === 'tasks' ? (
        <TaskCenter 
          seats={seats}
          addNotification={addNotification}
        />
      ) : (
        <ClassroomHeatmap seats={seats} />
      )}

    </div>
  );
}
