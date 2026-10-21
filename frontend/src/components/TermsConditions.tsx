/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FileCheck, AlertTriangle, Scale, ShieldAlert, ArrowLeft } from 'lucide-react';
import { AppView } from '../types';

interface TermsConditionsProps {
  setView: (view: AppView) => void;
}

export default function TermsConditions({ setView }: TermsConditionsProps) {
  return (
    <article className="max-w-4xl mx-auto px-6 py-12 text-left animate-[fadeIn_0.3s_ease-out]">
      {/* Top Breadcrumb & Return Action */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-glass-stroke">
        <button
          onClick={() => setView('landing')}
          className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-electric-cyan transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Return to Portal</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase px-2.5 py-1 rounded-full bg-plasma-violet/15 text-plasma-violet border border-plasma-violet/30 font-bold">
            Standard Version 2.4
          </span>
          <span className="font-mono text-xs text-on-surface-variant">
            Last Updated: October 2026
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <header className="mb-12">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-plasma-violet/20 to-electric-cyan/20 border border-glass-stroke flex items-center justify-center mb-6 text-plasma-violet shadow-lg shadow-plasma-violet/10">
          <Scale className="w-7 h-7" />
        </div>
        <h1 className="font-sans font-black text-3xl md:text-5xl text-on-surface uppercase tracking-tight mb-4">
          Terms &amp; Conditions
        </h1>
        <p className="font-sans text-base md:text-lg text-on-surface-variant leading-relaxed max-w-3xl">
          Please review these Terms &amp; Conditions carefully before initializing or using the Learner Operating System (LOS). By registering or accessing the portal, you agree to be bound by these provisions.
        </p>
      </header>

      {/* Important Disclaimer Alert Box */}
      <section className="glass-panel p-6 rounded-2xl border-l-4 border-l-amber-500 mb-12 flex gap-4 items-start bg-amber-500/5">
        <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-sans font-bold text-base text-on-surface">
            Cognitive Telemetry &amp; Non-Clinical Disclaimer
          </h2>
          <p className="font-sans text-xs md:text-sm text-on-surface-variant mt-1.5 leading-relaxed">
            Learner OS measures interaction rhythm, task latency, and focus indicators for purely educational pacing and curriculum adaptation. <strong className="text-on-surface">LOS is not a medical device and does not provide clinical, neuropsychological, psychiatric, or therapeutic diagnosis or treatment.</strong> If you experience distress, consult a qualified healthcare professional.
          </p>
        </div>
      </section>

      {/* Main Legal Sections */}
      <div className="space-y-10 text-on-surface-variant text-sm md:text-base leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
            <span className="font-mono text-sm text-plasma-violet">01.</span>
            Acceptance of Agreement
          </h2>
          <p>
            By accessing or using LOS, whether as a Learner, Mentor, Institutional Educator, or Guest visitor, you agree to comply with and be bound by these Terms. If you do not accept these terms in their entirety, you must discontinue session access immediately.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
            <span className="font-mono text-sm text-plasma-violet">02.</span>
            User Accounts &amp; Academic Integrity
          </h2>
          <ul className="list-disc pl-6 space-y-1.5 pt-1">
            <li><strong className="text-on-surface">Registration Credentials:</strong> You agree to provide accurate, up-to-date credentials including your valid email and authentic academic level.</li>
            <li><strong className="text-on-surface">Mentor Connections:</strong> Student accounts linked to a mentor email consent to sharing homework task status, focus streaks, and classroom heatmap status with that designated educator.</li>
            <li><strong className="text-on-surface">Account Security:</strong> You are responsible for safeguarding your authentication sync tokens. Notify us immediately if you suspect unauthorized access.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
            <span className="font-mono text-sm text-plasma-violet">03.</span>
            Acceptable Use Policy
          </h2>
          <p>When utilizing Learner OS, you strictly agree NOT to:</p>
          <ul className="list-disc pl-6 space-y-1.5 pt-1">
            <li>Attempt to reverse engineer, decompile, extract, or scrape cognitive algorithm weights, curriculum databases, or private server endpoints.</li>
            <li>Deploy automated scripts, bots, spiders, or brute-force requests against our authentication or AI agent services.</li>
            <li>Submit abusive, defamatory, or unlawful prompts to AI assistants or peer feedback channels.</li>
            <li>Circumvent security controls, session quotas, or rate-limiting thresholds.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
            <span className="font-mono text-sm text-plasma-violet">04.</span>
            Intellectual Property Rights
          </h2>
          <p>
            All interface designs, vector trademarks, cognitive telemetry visualization models, curriculum frameworks (CBSE &amp; NEP 2020 alignments), and software code are the proprietary intellectual property of the LOS development group. You are granted a limited, personal, revocable, non-exclusive license to use the system for personal or classroom educational purposes.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
            <span className="font-mono text-sm text-plasma-violet">05.</span>
            AI-Generated Suggestions &amp; Educational Content
          </h2>
          <p>
            Generative hints, simplified analogies, and SOS recommendations are synthesized via automated algorithmic models. While calibrated for maximum pedagogy, LOS does not warrant that AI-generated responses are entirely error-free. Students and educators should cross-reference core academic assertions with standard syllabus textbooks.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
            <span className="font-mono text-sm text-plasma-violet">06.</span>
            Limitation of Liability
          </h2>
          <p>
            In no event shall Learner OS, its developers, or affiliated educational bodies be liable for any indirect, incidental, punitive, or consequential damages resulting from the use or inability to use the platform, interruption of study sessions, or technical errors in telemetry measurements.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
            <span className="font-mono text-sm text-plasma-violet">07.</span>
            Termination &amp; Revocation
          </h2>
          <p>
            We reserve the right to suspend or terminate access to any user account found in violation of the Acceptable Use Policy or engaging in bot activity, spamming, or harassment.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3 pb-8 border-b border-glass-stroke">
          <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
            <span className="font-mono text-sm text-plasma-violet">08.</span>
            Governing Law &amp; Inquiries
          </h2>
          <p>
            These terms are governed by the applicable digital technology and education laws. For contractual queries or legal notices, contact our legal counsel at:
          </p>
          <div className="font-mono text-xs p-4 rounded-xl bg-white/5 border border-glass-stroke text-plasma-violet space-y-1">
            <p>Email: legal@learner-os.dev</p>
            <p>Direct: Office of the Chief Legal Architect</p>
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <footer className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => setView('privacy')}
          className="text-xs font-semibold text-electric-cyan hover:underline cursor-pointer"
        >
          &larr; Read Privacy Policy
        </button>

        <button
          onClick={() => setView('landing')}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-electric-cyan to-plasma-violet text-white text-xs font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md"
        >
          Return to Portal
        </button>
      </footer>
    </article>
  );
}
