import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, UserCheck, Shield, Heart, Lightbulb, Sparkles } from 'lucide-react';
import { PeerFeedback } from '../types';

interface PeerInsightProps {
  receivedFeedback: PeerFeedback[];
  sendToUserId: string;
  onSend: (message: string, badgeType: PeerFeedback['badgeType']) => void;
}

export default function PeerInsight({ receivedFeedback, onSend }: PeerInsightProps) {
  const [message, setMessage] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<PeerFeedback['badgeType']>('helpful');
  const [isSending, setIsSending] = useState(false);

  const badges = [
    { type: 'helpful' as const, icon: Heart, label: 'Encouragement', color: 'text-pink-400' },
    { type: 'focus' as const, icon: Sparkles, label: 'Focus Boost', color: 'text-plasma-violet' },
    { type: 'creative' as const, icon: Lightbulb, label: 'Creative Spark', color: 'text-yellow-400' },
    { type: 'logic' as const, icon: UserCheck, label: 'Peer Support', color: 'text-synapse-green' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      onSend(message, selectedBadge);
      setMessage('');
      setIsSending(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-sans font-bold text-base text-on-surface flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-electric-cyan" />
          Peer Insight
        </h3>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-glass-stroke rounded-md">
          <Shield className="w-3 h-3 text-on-surface-variant" />
          <span className="text-[9px] font-mono text-on-surface-variant uppercase font-bold">Anonymized Mode</span>
        </div>
      </div>

      {/* SEND FEEDBACK SECTION */}
      <form onSubmit={handleSubmit} className="bg-void-black/30 border border-glass-stroke rounded-2xl p-4 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {badges.map((b) => (
            <button
              key={b.type}
              type="button"
              onClick={() => setSelectedBadge(b.type)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                selectedBadge === b.type 
                  ? 'border-electric-cyan bg-electric-cyan/10 text-electric-cyan scale-105' 
                  : 'border-white/5 text-on-surface-variant hover:bg-white/5'
              }`}
            >
              <b.icon className="w-5 h-5" />
              <span className="text-[8px] font-bold uppercase">{b.label}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send anonymized encouragement to a random peer in your cohort..."
            className="w-full bg-surface-container-low border border-glass-stroke rounded-xl px-3 py-2 text-xs text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-electric-cyan transition-all min-h-[80px] resize-none"
          />
          <button
            type="submit"
            disabled={isSending || !message.trim()}
            className="absolute bottom-3 right-3 p-2 rounded-lg bg-electric-cyan text-void-black font-bold disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
          >
            {isSending ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>

      {/* RECEIVED FEEDBACK LIST */}
      <div className="space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-on-surface-variant font-bold">Insights Received</p>
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
          {receivedFeedback.map((fb) => (
            <motion.div
              key={fb.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-glass-stroke rounded-xl p-3 flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-void-black/50 border border-glass-stroke flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-synapse-green" />
              </div>
              <div>
                <p className="text-xs text-on-surface leading-snug">"{fb.message}"</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] font-mono uppercase bg-synapse-green/10 text-synapse-green px-1.5 py-0.5 rounded border border-synapse-green/20">
                    {fb.badgeType}
                  </span>
                  <span className="text-[9px] text-on-surface-variant font-mono">{fb.timestamp}</span>
                </div>
              </div>
            </motion.div>
          ))}
          {receivedFeedback.length === 0 && (
            <div className="py-8 text-center text-on-surface-variant opacity-40">
              <p className="text-[10px] font-mono uppercase tracking-widest">Awaiting community support...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
