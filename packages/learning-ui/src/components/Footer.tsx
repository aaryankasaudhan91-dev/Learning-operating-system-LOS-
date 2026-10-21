/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Heart, ExternalLink, Activity, Sparkles } from 'lucide-react';
import { AppView } from '../types';
import { AppLogo } from './AppLogo';

interface FooterProps {
  setView: (view: AppView) => void;
}

export default function Footer({ setView }: FooterProps) {
  return (
    <footer className="w-full mt-12 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#04070d] text-slate-600 dark:text-slate-300 relative z-10 select-none transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8 pb-12 border-b border-glass-stroke">
          
          {/* Col 1 & 2: Brand Information */}
          <div className="md:col-span-2 space-y-4 text-left">
            <div 
              onClick={() => setView('landing')} 
              className="flex items-center gap-2 cursor-pointer group w-fit"
            >
              <AppLogo className="w-9 h-9" showText={false} />
              <span className="font-sans font-black text-xl tracking-tight text-on-surface group-hover:text-electric-cyan transition-colors">
                LOS <span className="text-xs font-mono font-medium text-electric-cyan ml-1 tracking-widest uppercase">Learner OS</span>
              </span>
            </div>

            <p className="font-sans text-xs md:text-sm text-on-surface-variant max-w-sm leading-relaxed">
              An intelligent, cognitive operating system engineered to balance working memory load, prevent burnout, and foster sustainable deep learning through real-time telemetry.
            </p>

            <div className="flex items-center gap-2 font-mono text-[11px] text-synapse-green bg-synapse-green/10 border border-synapse-green/20 px-3 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-synapse-green animate-ping" />
              <span>Telemetry Engine: 100% Operational</span>
            </div>
          </div>

          {/* Col 3: Navigation Links */}
          <div className="space-y-3 text-left">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface">
              Architecture
            </h3>
            <ul className="space-y-2 text-xs font-medium text-on-surface-variant">
              <li>
                <button 
                  onClick={() => setView('landing')} 
                  className="hover:text-electric-cyan transition-colors cursor-pointer"
                >
                  Home Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setView('about')} 
                  className="hover:text-electric-cyan transition-colors cursor-pointer"
                >
                  About Philosophy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setView('courses')} 
                  className="hover:text-electric-cyan transition-colors cursor-pointer"
                >
                  Curriculum Hub
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setView('help')} 
                  className="hover:text-electric-cyan transition-colors cursor-pointer"
                >
                  Diagnostic Help Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Privacy */}
          <div className="space-y-3 text-left">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface">
              Governance &amp; Trust
            </h3>
            <ul className="space-y-2 text-xs font-medium text-on-surface-variant">
              <li>
                <button 
                  onClick={() => setView('privacy')} 
                  className="hover:text-electric-cyan transition-colors cursor-pointer"
                >
                  Privacy Policy &amp; Telemetry Charter
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setView('terms')} 
                  className="hover:text-electric-cyan transition-colors cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    localStorage.removeItem('los_cookie_consent');
                    window.location.reload();
                  }} 
                  className="hover:text-electric-cyan transition-colors cursor-pointer"
                >
                  Cookie Preferences
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setView('404')} 
                  className="hover:text-electric-cyan transition-colors cursor-pointer"
                >
                  Diagnostic 404 Node
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Educational Alignment */}
          <div className="space-y-3 text-left">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface">
              Frameworks
            </h3>
            <div className="space-y-2 text-xs text-on-surface-variant">
              <p className="leading-relaxed">
                Formulated according to the <strong className="text-on-surface">NEP 2020</strong> competency guidelines &amp; CBSE cognitive pedagogy.
              </p>
              <div className="pt-2">
                <span className="font-mono text-[10px] uppercase px-2.5 py-1 rounded bg-white/5 border border-glass-stroke text-electric-cyan">
                  v2.4 LTS Production
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright and compliance strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <p>
            &copy; {new Date().getFullYear()} Learner Operating System (LOS). All rights reserved. Built with cognitive respect.
          </p>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-synapse-green">
              <ShieldCheck className="w-4 h-4" />
              <span>TLS 1.3 Strict HTTPS</span>
            </span>
            <span className="flex items-center gap-1.5 text-plasma-violet">
              <Sparkles className="w-4 h-4" />
              <span>Adaptive Neural Engine</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
