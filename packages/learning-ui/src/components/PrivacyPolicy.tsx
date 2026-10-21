/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Lock, Eye, FileText, ArrowLeft, CheckCircle2, Server, HeartHandshake } from 'lucide-react';
import { AppView } from '../types';
import { AppLogo } from './AppLogo';

interface PrivacyPolicyProps {
  setView: (view: AppView) => void;
}

export default function PrivacyPolicy({ setView }: PrivacyPolicyProps) {
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
          <span className="font-mono text-xs uppercase px-2.5 py-1 rounded-full bg-synapse-green/15 text-synapse-green border border-synapse-green/30 font-bold">
            DPDP &amp; FERPA Aligned
          </span>
          <span className="font-mono text-xs text-on-surface-variant">
            Effective: October 2026
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <header className="mb-12">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-electric-cyan/20 to-plasma-violet/20 border border-glass-stroke flex items-center justify-center mb-6 text-electric-cyan shadow-lg shadow-electric-cyan/10">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="font-sans font-black text-3xl md:text-5xl text-on-surface uppercase tracking-tight mb-4">
          Privacy Policy &amp; Cognitive Charter
        </h1>
        <p className="font-sans text-base md:text-lg text-on-surface-variant leading-relaxed max-w-3xl">
          At Learner Operating System (LOS), we consider your cognitive state, learning behaviors, and academic profile sacred. This policy explains how we collect, process, and protect your information with server-side isolation and encryption.
        </p>
      </header>

      {/* Quick Summary Highlights */}
      <section className="glass-panel p-6 rounded-2xl border border-glass-stroke mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-synapse-green/15 flex items-center justify-center text-synapse-green flex-shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-sm text-on-surface">Zero Data Selling</h2>
            <p className="font-sans text-xs text-on-surface-variant mt-1 leading-relaxed">
              We never monetize student data or provide telemetry to third-party ad networks.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-electric-cyan/15 flex items-center justify-center text-electric-cyan flex-shrink-0 mt-0.5">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-sm text-on-surface">Isolated AI Processing</h2>
            <p className="font-sans text-xs text-on-surface-variant mt-1 leading-relaxed">
              All AI model calls are proxied securely on the backend; student inputs never train public models.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-plasma-violet/15 flex items-center justify-center text-plasma-violet flex-shrink-0 mt-0.5">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-sm text-on-surface">Complete Data Control</h2>
            <p className="font-sans text-xs text-on-surface-variant mt-1 leading-relaxed">
              Full right to view, export, or permanently erase your cognitive and academic logs at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Main Legal Sections */}
      <div className="space-y-10 text-on-surface-variant text-sm md:text-base leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
            <span className="font-mono text-sm text-electric-cyan">01.</span>
            Information We Collect
          </h2>
          <p>
            When utilizing Learner OS as a student, learner, or certified mentor, we gather specific telemetry to fulfill the system&apos;s adaptive learning mission:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 pt-1">
            <li><strong className="text-on-surface">Account Credentials:</strong> Full name, verified email address, role (Student or Mentor), and linked teacher authorization.</li>
            <li><strong className="text-on-surface">Academic Mapping:</strong> Academic stage (Primary, Secondary, Higher Secondary, Undergraduate), stream selection (Science, Commerce, Arts, Engineering, Medical), and curriculum milestones.</li>
            <li><strong className="text-on-surface">Cognitive Telemetry:</strong> Interaction rhythm, focus streaks, task completion rate, estimated cognitive load percentage, and session duration.</li>
            <li><strong className="text-on-surface">Technical Diagnostics:</strong> IP address (anonymized), browser type, and device viewport dimensions to ensure mobile responsive delivery.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
            <span className="font-mono text-sm text-electric-cyan">02.</span>
            How We Utilize Your Data
          </h2>
          <p>
            Your information is used strictly to power the adaptive mechanics of Learner OS:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 pt-1">
            <li>Adjusting interface complexity and task recommendations when cognitive overload is detected.</li>
            <li>Synchronizing student progress with authorized classroom mentors via the Cohort Telemetry matrix.</li>
            <li>Scheduling spaced repetition and micro-synthesis tasks based on memory decay algorithms.</li>
            <li>Maintaining account security, preventing unauthorized access, and validating teacher linkages.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
            <span className="font-mono text-sm text-electric-cyan">03.</span>
            AI Processing &amp; Neural Privacy
          </h2>
          <p>
            LOS utilizes enterprise generative intelligence (Google Gemini, Claude, OpenAI) for dynamic hint generation, real-world analogies, and SOS wellness interventions. We enforce strict privacy boundaries:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 pt-1">
            <li>All AI requests are executed through isolated backend endpoints. <strong className="text-on-surface">No API keys or model credentials ever exist on the client frontend.</strong></li>
            <li>Student queries are stripped of personal identifiers before transmission to AI models.</li>
            <li>Zero student telemetry or classroom submissions are retained to train public commercial AI models.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
            <span className="font-mono text-sm text-electric-cyan">04.</span>
            Compliance with Children &amp; Student Privacy Laws
          </h2>
          <p>
            LOS complies with all prevailing student data regulations:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 pt-1">
            <li><strong className="text-on-surface">FERPA (Family Educational Rights and Privacy Act):</strong> Educational records are shared only with authenticated educators.</li>
            <li><strong className="text-on-surface">COPPA (Children&apos;s Online Privacy Protection Act):</strong> Verifiable parental or school authorization is required for users under age 13.</li>
            <li><strong className="text-on-surface">DPDP Act 2023 (Digital Personal Data Protection):</strong> Explicit, clear consent is requested with direct mechanisms to withdraw consent.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
            <span className="font-mono text-sm text-electric-cyan">05.</span>
            Cookies &amp; Local Storage
          </h2>
          <p>
            We deploy strictly necessary cookies for session synchronization and optional anonymous analytics to measure platform performance. You can adjust your cookie choices at any time via the Cookie Preferences link or Settings panel.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
            <span className="font-mono text-sm text-electric-cyan">06.</span>
            Your Data Rights &amp; Erasure Requests
          </h2>
          <p>
            You retain sovereign ownership of your cognitive records. You may at any time:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 pt-1">
            <li>Export your entire cognitive telemetry database schema via the Settings dashboard.</li>
            <li>Request a complete hard deletion of your user profile, tasks, and historical telemetry.</li>
            <li>Revoke mentor data-sharing permissions without closing your account.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 pb-8 border-b border-glass-stroke">
          <h2 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
            <span className="font-mono text-sm text-electric-cyan">07.</span>
            Contact Our Privacy Team
          </h2>
          <p>
            For privacy inquiries, audit requests, or parental consents, contact our designated Data Protection Officer at:
          </p>
          <div className="font-mono text-xs p-4 rounded-xl bg-white/5 border border-glass-stroke text-electric-cyan space-y-1">
            <p>Email: privacy@learner-os.dev</p>
            <p>Subject: Attention: LOS Cognitive Data Protection Office</p>
            <p>Encryption: TLS 1.3 / PGP Key Available Upon Request</p>
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <footer className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => setView('terms')}
          className="text-xs font-semibold text-plasma-violet hover:underline cursor-pointer"
        >
          Read Terms &amp; Conditions &rarr;
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
