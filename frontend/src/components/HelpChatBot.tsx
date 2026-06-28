import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

export default function HelpChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'bot' | 'user', text: string}[]>([
    { role: 'bot', text: 'Hello! I am the Synapse Assistant. How can I help you navigate the cognitive space?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const currentInput = input;
    setInput('');
    const updatedMessages = [...messages, { role: 'user' as const, text: currentInput }];
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
            setIsTyping(false);
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
      // Local fallback simulator if API fails
      setMessages(prev => [
        ...prev, 
        { 
          role: 'bot' as const, 
          text: `I'm having trouble connecting to the live Synapse guide node. For your query "${currentInput}", you can refer to the Help & Diagnostic Center inside the dashboard for detailed offline guidebooks.` 
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 lg:bottom-12 lg:right-12 w-14 h-14 rounded-full bg-gradient-to-r from-electric-cyan to-plasma-violet text-void-black flex items-center justify-center shadow-lg shadow-electric-cyan/20 hover:scale-110 active:scale-95 transition-all z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        title="Synapse AI Support"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 lg:bottom-12 lg:right-12 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[80vh] bg-surface-container-high border border-glass-stroke rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-10 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-glass-stroke bg-surface-container rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-electric-cyan/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-electric-cyan" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-on-surface">Synapse Guide</h3>
              <p className="text-[10px] text-synapse-green font-mono uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-synapse-green rounded-full animate-pulse" /> Online
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'bot' ? 'bg-electric-cyan/20 text-electric-cyan' : 'bg-plasma-violet/20 text-plasma-violet'}`}>
                {msg.role === 'bot' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
              </div>
              <div className={`max-w-[75%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-plasma-violet/10 border border-plasma-violet/20 rounded-br-sm' : 'bg-white/5 border border-glass-stroke rounded-bl-sm'}`}>
                <p className="text-on-surface text-xs leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-end gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-electric-cyan/20 text-electric-cyan">
                <Bot className="w-3 h-3" />
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-glass-stroke text-white rounded-bl-sm flex items-center gap-1.5 h-8">
                <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse"></span>
                <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse delay-150"></span>
                <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse delay-300"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleSend} className="p-3 border-t border-glass-stroke bg-surface-container rounded-b-2xl flex items-center gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Ask about your dashboard..."
            className="flex-1 bg-void-black/50 border border-glass-stroke rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-electric-cyan transition-colors disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-electric-cyan/20 text-electric-cyan flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-electric-cyan/30 transition-colors"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </>
  );
}
