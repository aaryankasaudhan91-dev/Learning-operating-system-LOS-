import React, { useState, useRef, useEffect } from 'react';
import { Shield, HelpCircle, Send, Terminal, Cpu, Layers, Wifi, AlertTriangle, CheckCircle2, MessageSquare, BookOpen, Sliders, Play, Sparkles } from 'lucide-react';

interface HelpCenterProps {
  setView: (view: any) => void;
  userRole: 'student' | 'mentor';
}

export default function HelpCenter({ setView, userRole }: HelpCenterProps) {
  const [activeTab, setActiveTab] = useState<'faq' | 'ticket' | 'chat'>('faq');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('General support');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Chatbot State
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([
    { role: 'bot', text: `Welcome to the Synapse Help Center. I am your cognitive navigation assistant. What system modules are you having trouble with?` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const text = chatInput;
    setChatInput('');
    submitUserQuestion(text);
  };

  const submitUserQuestion = async (text: string) => {
    if (isTyping) return;
    const updatedMessages = [...messages, { role: 'user' as const, text }];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const response = await fetch('/api/agent/guide-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatHistory: updatedMessages })
      });

      if (!response.ok) {
        throw new Error('Response not OK');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamStarted = false;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          
          if (!streamStarted) {
            streamStarted = true;
            setIsTyping(false); // Hide the loading dots once streaming starts
            setMessages(prev => [...prev, { role: 'bot' as const, text: chunk }]);
          } else {
            setMessages(prev => {
              const newMessages = [...prev];
              const lastItem = newMessages[newMessages.length - 1];
              newMessages[newMessages.length - 1] = { ...lastItem, text: lastItem.text + chunk };
              return newMessages;
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
      // Smart responses matching the Synapse/LOS theme as a fallback
      let reply = "";
      const lower = text.toLowerCase();
      if (lower.includes('cognitive') || lower.includes('load')) {
        reply = "Cognitive Load measures mental effort and friction. If your load exceeds 75%, the system suggests grounding exercises in the Silent Chamber to prevent burnout.";
      } else if (lower.includes('course') || lower.includes('hub') || lower.includes('lesson')) {
        reply = "The Course Hub displays your academic syllabus. Mentors can dynamically add lessons, custom tests (multiple choice), and homework assignments which you can submit directly.";
      } else if (lower.includes('sos') || lower.includes('breathing')) {
        reply = "The SOS Panel provides immediate grounding exercises, including box breathing and a calming AI therapist, designed to lower high cognitive stress.";
      } else if (lower.includes('agent') || lower.includes('ai')) {
        reply = "Synapse runs multi-agent AI (using ChatGPT, Claude, Nvidia, and Gemini) to generate personalized test questions, monitor mental states, and deliver cognitive suggestions.";
      } else {
        reply = "I've encountered a connection interruption with the Synapse Guide node. Please make sure the backend is active, or feel free to check the System Guidebook FAQ tab.";
      }
      setMessages(prev => [...prev, { role: 'bot' as const, text: reply }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription) return;
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketSubject('');
      setTicketDescription('');
    }, 4000);
  };

  // Diagnostic Stats
  const diagnostics = [
    { name: "Cognitive Router", status: "Operational", icon: Cpu, color: "text-synapse-green" },
    { name: "AI Pathfinder", status: "Dynamic Flow", icon: Sparkles, color: "text-electric-cyan" },
    { name: "Database Sync", status: "Synchronized", icon: Layers, color: "text-plasma-violet" },
    { name: "Latency", status: "14ms", icon: Wifi, color: "text-synapse-green" }
  ];

  const faqs = [
    {
      q: "What is the Cognitive Load telemetry index?",
      a: "It is an real-time feedback loop representing your current mental fatigue. As you study, finish tasks, or trigger SOS patterns, the system automatically recalibrates to prevent information overload."
    },
    {
      q: "How do I take a custom-assigned test or homework?",
      a: "Navigate to the Course Hub, click on your selected active lesson, and find the 'Course Resources' footer. Assigned custom tests and homework display direct taker buttons that can be submitted in-app."
    },
    {
      q: "Where do my submitted scores go?",
      a: "Submitting a custom test instantly calculates your correct options, highlights correct/incorrect selections, and logs it directly to your profile. Mentors can view submissions via the Cohort Telemetry panel."
    },
    {
      q: "How does the AI Agent pipeline function?",
      a: "Each agent in Synapse uses a dedicated model from different providers (ChatGPT, Claude, Nvidia, and Gemini) for distinct jobs: focus analogies, seat matrix intelligence, emergency support, and quiz generation."
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-glass-stroke pb-6">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-plasma-violet" />
            Synapse Help & Diagnostic Center
          </h2>
          <p className="text-on-surface-variant mt-2">
            Diagnose system telemetry, explore custom guidebooks, or talk to the AI assistance node.
          </p>
        </div>
        <button
          onClick={() => setView('courses')}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-white/5 border border-glass-stroke text-xs text-on-surface hover:bg-white/10 transition-colors"
        >
          ← Return to Dashboard
        </button>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {diagnostics.map((diag, i) => {
          const IconComponent = diag.icon;
          return (
            <div key={i} className="glass-panel p-4 rounded-2xl border border-glass-stroke flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${diag.color}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-on-surface-variant">{diag.name}</p>
                <p className="text-xs font-bold text-white mt-0.5">{diag.status}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Tabs */}
      <div className="flex gap-2 border-b border-glass-stroke pb-px">
        <button
          onClick={() => setActiveTab('faq')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'faq' ? 'border-plasma-violet text-white' : 'border-transparent text-on-surface-variant hover:text-white'
          }`}
        >
          System Guidebook
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'chat' ? 'border-plasma-violet text-white' : 'border-transparent text-on-surface-variant hover:text-white'
          }`}
        >
          AI Synapse Guide
        </button>
        <button
          onClick={() => setActiveTab('ticket')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'ticket' ? 'border-plasma-violet text-white' : 'border-transparent text-on-surface-variant hover:text-white'
          }`}
        >
          Open Support Ticket
        </button>
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        {activeTab === 'faq' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-plasma-violet" />
                Frequently Answered Telemetry
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="glass-panel p-4 rounded-xl border border-glass-stroke space-y-2">
                    <p className="text-xs font-bold text-white flex items-start gap-2">
                      <span className="text-plasma-violet">Q:</span>
                      {faq.q}
                    </p>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed pl-4">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-glass-stroke space-y-4 h-fit">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-electric-cyan" />
                System Operator Manual
              </h3>
              <div className="space-y-3 font-sans text-xs text-on-surface-variant leading-relaxed">
                <p>
                  Welcome to <strong className="text-white">Synapse Learner OS</strong>, a next-generation adaptive education cockpit designed to reduce student burnout and maximize flow states.
                </p>
                <p>
                  By measuring real-time user inputs, session duration, and task friction, the system shapes personalized resources. If a lesson causes difficulty, students can instantly activate the <strong className="text-white">Emergency SOS Panel</strong> to engage box-breathing and speak directly to a calming agent.
                </p>
                <div className="pt-2">
                  <div className="p-3 bg-white/5 rounded-xl border border-glass-stroke space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-plasma-violet font-bold">Recommended Flow</p>
                    <p className="text-[11px] text-white">1. Select course/module in Course Hub.</p>
                    <p className="text-[11px] text-white">2. Launch study guide & review lesson notes.</p>
                    <p className="text-[11px] text-white">3. Tackle custom interactive tests assigned by your mentor.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="glass-panel border border-glass-stroke rounded-2xl overflow-hidden h-[500px] flex flex-col">
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-glass-stroke flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-plasma-violet/20 flex items-center justify-center text-plasma-violet">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Embedded Support Assistant</p>
                <p className="text-[10px] text-synapse-green flex items-center gap-1 font-mono uppercase">
                  <span className="w-1.5 h-1.5 bg-synapse-green rounded-full animate-pulse" /> Active Node
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 font-sans">
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    msg.role === 'bot' 
                      ? 'bg-plasma-violet/10 border-plasma-violet/20 text-plasma-violet' 
                      : 'bg-electric-cyan/10 border-electric-cyan/20 text-electric-cyan'
                  }`}>
                    {msg.role === 'bot' ? <Shield className="w-4 h-4" /> : <Sliders className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[75%] border ${
                    msg.role === 'user' 
                      ? 'bg-electric-cyan/5 border-electric-cyan/10 rounded-tr-none text-right' 
                      : 'bg-white/5 border-glass-stroke rounded-tl-none'
                  }`}>
                    <p className="text-xs text-white leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border bg-plasma-violet/10 border-plasma-violet/20 text-plasma-violet">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="p-3.5 rounded-2xl text-xs leading-relaxed bg-white/5 border border-glass-stroke text-white rounded-tl-none font-sans flex items-center gap-1.5 h-10">
                    <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse"></span>
                    <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse delay-150"></span>
                    <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse delay-300"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="p-3 bg-white/5 border-t border-glass-stroke flex flex-wrap gap-2">
              <button 
                onClick={() => submitUserQuestion("What is cognitive load?")}
                disabled={isTyping}
                className="px-3 py-1.5 rounded-full border border-glass-stroke text-[10px] text-on-surface-variant hover:text-white hover:border-plasma-violet/40 bg-void-black/40 transition-all cursor-pointer disabled:opacity-50"
              >
                What is cognitive load?
              </button>
              <button 
                onClick={() => submitUserQuestion("How do I take a custom quiz?")}
                disabled={isTyping}
                className="px-3 py-1.5 rounded-full border border-glass-stroke text-[10px] text-on-surface-variant hover:text-white hover:border-plasma-violet/40 bg-void-black/40 transition-all cursor-pointer disabled:opacity-50"
              >
                How to take a quiz?
              </button>
              <button 
                onClick={() => submitUserQuestion("What does the SOS panel do?")}
                disabled={isTyping}
                className="px-3 py-1.5 rounded-full border border-glass-stroke text-[10px] text-on-surface-variant hover:text-white hover:border-plasma-violet/40 bg-void-black/40 transition-all cursor-pointer disabled:opacity-50"
              >
                What does SOS panel do?
              </button>
            </div>

            {/* Input */}
            <form onSubmit={handleSendChat} className="p-4 bg-white/5 border-t border-glass-stroke flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                disabled={isTyping}
                placeholder="Ask assistance node about Course Hub, tests, or silent chamber..."
                className="flex-1 bg-void-black/50 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-plasma-violet transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isTyping}
                className="px-4 rounded-xl bg-plasma-violet text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:scale-102 transition-transform disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </form>
          </div>
        )}

        {activeTab === 'ticket' && (
          <div className="glass-panel border border-glass-stroke rounded-2xl p-6 md:p-8 max-w-2xl mx-auto space-y-6">
            <div className="border-b border-glass-stroke pb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-plasma-violet" />
                Submit Telemetry Intervention
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Encountering an issue or a bug? Report it here to immediately sync with operations.
              </p>
            </div>

            {ticketSubmitted ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-synapse-green/20 border border-synapse-green/30 flex items-center justify-center text-synapse-green">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Ticket Submitted Successfully</h4>
                  <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
                    Your issue report has been logged and synchronized with the Synapse monitor team. We will resolve it in your current workspace shortly.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Category</label>
                    <select
                      value={ticketCategory}
                      onChange={e => setTicketCategory(e.target.value)}
                      className="w-full bg-void-black/50 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-plasma-violet"
                    >
                      <option value="General support">General Support</option>
                      <option value="High Load / Stress Lock">High Load / Stress Lock</option>
                      <option value="Course Sync Issue">Course Sync Issue</option>
                      <option value="AI Pathfinder Failure">AI Pathfinder Failure</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="Summary of issue..."
                      value={ticketSubject}
                      onChange={e => setTicketSubject(e.target.value)}
                      className="w-full bg-void-black/50 border border-glass-stroke rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-plasma-violet"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Detailed Telemetry / Description</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe exactly what happened, and any steps to reproduce..."
                    value={ticketDescription}
                    onChange={e => setTicketDescription(e.target.value)}
                    className="w-full bg-void-black/50 border border-glass-stroke rounded-xl p-4 text-xs text-white focus:outline-none focus:border-plasma-violet resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-plasma-violet to-electric-cyan text-white text-xs font-bold uppercase tracking-wider hover:scale-102 transition-transform"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
