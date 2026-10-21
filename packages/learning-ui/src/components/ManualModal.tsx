import React from 'react';
import { X, BookOpen, User, Shield, Terminal, Brain, Heart, Layers, Sliders, Cpu } from 'lucide-react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'student' | 'mentor';
}

export default function ManualModal({ isOpen, onClose, userRole }: ManualModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-void-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-surface-container border border-glass-stroke rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-glass-stroke bg-surface-container-high">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-plasma-violet" />
            <div>
              <h2 className="text-lg font-bold text-white">
                {userRole === 'student' ? 'Student Cockpit Operational Manual' : 'Mentor Console Administration Manual'}
              </h2>
              <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mt-0.5">
                Classification: System operator guide // Role: {userRole}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-on-surface-variant hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans text-sm text-on-surface-variant leading-relaxed">
          {userRole === 'student' ? (
            /* Student Manual */
            <>
              <div className="space-y-2">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Brain className="w-4 h-4 text-electric-cyan" /> 
                  1. Cognitive Map & Task Optimization
                </h3>
                <p>
                  The <strong>Cognitive Map</strong> is your central workspace. Your active study items, home assignments, and focus targets are displayed alongside difficulty weightings. Tackling tasks updates your real-time <strong>Cognitive Load Index</strong>. Keep tasks organized to avoid cognitive friction and maintain a consistent daily study flow.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-400" /> 
                  2. Course Hub & Custom Tests
                </h3>
                <p>
                  The <strong>Course Hub</strong> hosts your academic syllabus. Mentors can dynamically assign curriculum modules, lessons, and custom assessments. When you complete a custom test, the system registers your performance telemetry immediately, which is synchronized back to your mentor's dashboard for grading and observation.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-synapse-green" /> 
                  3. Focus Chamber & Deep Work
                </h3>
                <p>
                  When entering the <strong>Focus Chamber</strong>, the system suppresses non-essential system alerts. Toggle your focus timer to log active study minutes toward your daily goal. Enter the <strong>Silent Chamber</strong> for calming environmental soundscapes that help lower heart rate variance and mental fatigue.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" /> 
                  4. Mental Health & Emergency SOS Panel
                </h3>
                <p>
                  If you experience extreme study fatigue, information overload, or high stress, click the <strong>SOS Panel</strong>. The interface initiates standard box-breathing audio/visual prompts and opens a direct connection to a calming, empathetic AI support agent designed to lower stress levels.
                </p>
              </div>
            </>
          ) : (
            /* Mentor Manual */
            <>
              <div className="space-y-2">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-plasma-violet" /> 
                  1. Cohort Seating Grid & Real-time State
                </h3>
                <p>
                  The <strong>Cohort Telemetry</strong> seating grid maps your students dynamically. Color codings indicate student states: green represents "Flow" (optimal mental workload) while red warns of "Friction" (high fatigue, burnout risk). Click on any student seat to view their detailed activity metrics, daily focus goal completion, and academic scores.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-electric-cyan" /> 
                  2. Active Interventions & Broadcast Prompts
                </h3>
                <p>
                  When the system flags a student with high cognitive friction, they appear in your <strong>Active Interventions</strong> panel. You can address the cohort by sending instant <strong>Broadcast Prompts</strong> which overlay directly onto their learning screens to guide study sessions or suggest mental breaks.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-400" /> 
                  3. Course Creation & Assessment Design
                </h3>
                <p>
                  Navigate to the <strong>Course Hub</strong> to build new educational courses. You can define custom modules, lesson plans, and embed custom interactive multiple-choice tests. The tests you publish are pushed instantly to all student dashboards enrolled in that cohort class level.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-synapse-green" /> 
                  4. AI Orchestration & Generation
                </h3>
                <p>
                  Use the integrated <strong>Gemini generation engine</strong> to draft custom questions, write study summaries, or generate lesson plan frameworks. These features utilize the unified multi-agent system to automate educational material curation with minimal manual effort.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container-high border-t border-glass-stroke flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-electric-cyan to-plasma-violet text-void-black font-bold text-xs hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
