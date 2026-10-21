/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { analytics, ConsentStatus } from '../services/analytics.service';
import { AppView } from '../types';

interface CookieConsentProps {
  setView: (view: AppView) => void;
}

export default function CookieConsent({ setView }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been registered
    const current = analytics.getConsent();
    if (current === 'pending') {
      // Small timeout for smooth entrance animation
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    analytics.setConsent('accepted_all');
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    analytics.setConsent('essential_only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside 
      aria-label="Cookie and Privacy Preferences"
      className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md z-50 animate-[fadeIn_0.4s_ease-out]"
    >
      <div className="glass-panel-heavy p-5 md:p-6 rounded-2xl border border-glass-stroke shadow-2xl relative overflow-hidden backdrop-blur-2xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-electric-cyan/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-electric-cyan/15 border border-electric-cyan/30 flex items-center justify-center flex-shrink-0 text-electric-cyan">
            <Cookie className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-sans font-bold text-sm text-on-surface flex items-center gap-1.5">
                Cookie &amp; Telemetry Notice
              </h2>
              <button 
                onClick={handleEssentialOnly}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-md transition-colors"
                aria-label="Dismiss cookie banner with essential only"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-sans text-xs text-on-surface-variant leading-relaxed mb-4">
              Essential storage keeps sign-in and your preferences working. Optional analytics stays off unless you allow it.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={handleAcceptAll}
                className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-electric-cyan to-plasma-violet text-white text-xs font-bold uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                Accept All
              </button>

              <button
                onClick={handleEssentialOnly}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 border border-glass-stroke text-on-surface text-xs font-semibold hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                Essential Only
              </button>
            </div>

            <div className="mt-3 pt-2.5 border-t border-glass-stroke flex justify-between items-center text-[11px] text-on-surface-variant">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-synapse-green" />
                <span>Your privacy preferences</span>
              </span>
              <button
                onClick={() => {
                  setView('privacy');
                }}
                className="text-electric-cyan hover:underline cursor-pointer font-medium"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
