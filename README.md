<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0--v2-8A2BE2?style=for-the-badge&logo=rocket" alt="Version 2.0" />
  <img src="https://img.shields.io/badge/Decision%20Record-21%20Oct%202026-blue?style=for-the-badge" alt="Decision Record 2026-10-21" />
  <img src="https://img.shields.io/badge/Status-Active%20Architecture-brightgreen?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Platforms-Web%20%7C%20Electron%20Desktop%20%7C%20Capacitor%20Mobile-blueviolet?style=for-the-badge" alt="Platforms" />
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge" alt="License" />
</p>

# 🧠 Synapse — Learner Operating System (LOS) `v2.0`

> **Mission: Learning without barriers.**
> *Let anyone begin learning from a phone, including people without a school, teacher, or linked parent. Extra support should strengthen access, never become a condition for it.*

Synapse is an adaptive, multi-platform cognitive education platform engineered according to the **21 October 2026 Decision Record**. It combines cross-device parity (Web, Desktop, Mobile), on-device privacy-preserving telemetry, offline-capable curriculum progress, and a 6-role AI agent architecture designed for zero-budget launch sustainability and metered tier scalability.

---

## 📑 Table of Contents

- [Core Principles & Product Decisions](#-core-principles--product-decisions)
- [What's New in Version 2.0](#-whats-new-in-version-20)
- [System Architecture](#-system-architecture)
- [Account Roles & Inclusion](#-account-roles--inclusion)
- [Privacy & Telemetry Boundaries](#-privacy--telemetry-boundaries)
- [AI Engine & Economics](#-ai-engine--economics)
- [Offline Capability & Data Sync](#-offline-capability--data-sync)
- [Features Overview](#-features-overview)
  - [For Learners](#for-learners)
  - [For Teachers / Mentors](#for-teachers--mentors)
  - [For Parents / Guardians](#for-parents--guardians)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Web & Backend Server](#1-web--backend-server)
  - [Desktop App (Electron)](#2-desktop-app-electron)
  - [Mobile App (Capacitor Android / iOS)](#3-mobile-app-capacitor-android--ios)
- [Environment Variables](#-environment-variables)
- [Plans & Metered Access Model](#-plans--metered-access-model)
- [Database Schema (MongoDB)](#-database-schema-mongodb)
- [Roadmap & Continuation](#-roadmap--continuation)
- [License](#-license)

---

## 🎯 Core Principles & Product Decisions

*As finalized in the official Decision Record (`LOS_Discussion_Decisions_2026-10-21.pdf`) for Aaryan Kasaudhan:*

| Area | Product Decision |
|---|---|
| **Access** | **Self-registration; independent learning or optional class membership.** No school, teacher, parent, or admin approval required to begin learning. |
| **Support Network** | Teachers self-register. Parents use separate, optionally linked accounts. **Learner history belongs to the learner**, even if they leave a class. |
| **Parent Reports** | Free dashboard reports for linked parents. Weekly email summaries are an optional paid add-on. |
| **Learning Signals** | Grounded in 4 inputs: self-reports, study/quiz activity, understanding checks, and optional adult feedback. |
| **Privacy First** | **Camera/mic processing is strictly on-device.** Raw images/video never leave the device nor touch MongoDB. Only derived summaries sync with consent. |
| **Zero-Budget AI** | Deterministic operations (marks, completion counts, study time, progress tracking) run in standard application code, **never consuming AI credits**. |
| **Commercial Model** | Free core tier + Pro/Ultra monthly credit tiers. Zero automatic paid fallback when free tier runs out. |

---

## ⚡ What's New in Version 2.0

1. **Cross-Platform Tri-Target Runtime**:
   - 🖥️ **Desktop App (`desktop/`, Electron 42)**: Native window shell with auto-hiding menus, isolated sandboxing, and package builders for Windows (NSIS), macOS (DMG), and Linux (AppImage).
   - 📱 **Mobile App (`frontend/capacitor.config.ts`, Capacitor 8)**: Touch-optimized experience with dedicated bottom navigation bar (`MobileNavigation.tsx`), responsive safe-area insets, and offline caching.
   - 🌐 **Web App (React 19 + Vite 6)**: High-performance single page app with glassmorphic aesthetic and responsive layout.
2. **Unified Design Architecture (`app-design.css`)**:
   - Shared CSS tokens across Web, Desktop, and Mobile for consistent dark mode, reading surfaces, touch targets (≥44px), and typography.
3. **Decoupled Learner Navigation (`navigation.ts`)**:
   - **Learners**: *My Adventure* (Cognitive Map), *Learning Quests* (Courses), *Focus Zone* (Chamber), *Take a Breath* (SOS).
   - **Mentors**: *Courses*, *My Classroom* (Heatmap Matrix), *Class Progress* (Cohort Analytics).
   - **Account**: *Profile*, *Settings*, *Help & Support* (Diagnostics & FAQ).
4. **Resilient Network Layer (`services/http.ts`)**:
   - Centralized HTTP client handling authentication headers, offline error handling, and seamless transition between cloud and local states.
5. **Help & Diagnostics Center (`HelpCenter.tsx`)**:
   - Embedded diagnostic connectivity checks, searchable knowledge base, interactive AI assistant bubble, and formal support ticketing.

---

## 🏗 System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SYNAPSE CROSS-PLATFORM CLIENT                   │
│                                                                        │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────┐ │
│   │   Web (Vite 6 SPA)   │  │ Desktop (Electron)  │  │Mobile (Capacitor)│
│   └──────────┬──────────┘  └──────────┬──────────┘  └───────┬───────┘ │
│              └────────────────────────┼─────────────────────┘         │
│                                       ▼                                │
│                     Shared React 19 + TypeScript UI                    │
│   ┌───────────────────┬───────────────────┬────────────────────────┐  │
│   │ Learner Quests    │ Mentor Console    │ Parent & Support       │  │
│   │ • Cognitive Map   │ • Seat Heatmap    │ • Linked Dashboard     │  │
│   │ • Offline Quests  │ • Interventions   │ • Help & Diagnostics   │  │
│   │ • Focus Chamber   │ • Cohort Stream   │ • Privacy Controls     │  │
│   │ • SOS Calibrator  │ • Test/HW Maker   │ • Consent Sync         │  │
│   └───────────────────┴───────────────────┴────────────────────────┘  │
│                                       │                                │
│            Services: http.ts ─ db.service ─ task.service ─ auth        │
└───────────────────────────────────────┬────────────────────────────────┘
                                        │ REST APIs & Consented Sync
                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     BACKEND ENGINE (Node.js + Express)                 │
│                                                                        │
│  ┌──────────────────────── AI Agent Router ─────────────────────────┐  │
│  │                                                                  │  │
│  │  1. Focus Content Agent       2. Insights Prompt Agent           │  │
│  │  3. Mentor Intervention Agent 4. Supportive SOS Chat Agent       │  │
│  │  5. Socratic Task Hint Agent  6. Task & Test Generator Agent     │  │
│  │                                                                  │  │
│  │  Shared Free Tier Model Pilot: Groq (gpt-oss-20b)                │  │
│  │  Premium Metered Tiers: Google Gemini, Anthropic Claude, OpenAI  │  │
│  │  Optional Local Candidate: Qwen3.5-4B (Desktop only)             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  API Services: /api/users ─ /api/courses ─ /api/tasks ─ /api/prompts   │
│  Database: Mongoose 9.6 ODM ──► MongoDB Atlas Cloud NoSQL              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 Account Roles & Inclusion

Synapse eliminates artificial gatekeeping in education:

```
                      ┌──────────────────────┐
                      │   Public Register    │
                      └──────────┬───────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
  │   Learner   │         │   Teacher   │         │   Parent    │
  │ (Independent│         │  (Creates   │         │ (Optionally │
  │  or Linked) │         │  Classes)   │         │   Linked)   │
  └──────┬──────┘         └──────┬──────┘         └──────┬──────┘
         │                       │                       │
         └──────── Optional Link ┴──────── Optional Link ┘
```

- **Learner**:
  - Independent onboarding: start with *Learn Independently* or *Join a Class*.
  - Full access to lessons, notes, focus chamber, quizzes, and progress tracking.
  - Retains all history and personal progress regardless of joining or leaving a class.
- **Teacher / Mentor**:
  - Self-registers to manage classes, publish courses, assign tasks, and monitor classroom heatmaps.
  - Does not hold ownership over independent learner accounts.
- **Parent / Guardian**:
  - Separate login accounts linked via ID records (a learner may have multiple guardians).
  - Free access to learner progress dashboards.
  - Optional subscription add-on for automated weekly email summaries.
- **Admin**:
  - Manages platform operations, abuse reports, and system diagnostics without bottlenecking onboarding.

---

## 🔒 Privacy & Telemetry Boundaries

Learning support is based on **evidence of understanding**, not intrusive invasive surveillance:

| Sensor / Signal | Operational Rule | Storage & Upload Boundary |
|---|---|---|
| **Camera** | **Default OFF.** Optional per-session toggle with a visible active indicator. | **Strictly on-device processing.** Raw video/images NEVER leave device or touch MongoDB. Only session cues (face presence, ambient lighting) are analyzed locally. |
| **Microphone** | **Default OFF.** Learner-initiated single voice answers only. | **No continuous background listening.** No routine audio retention. |
| **Self-Reports** | Simple one-tap mood, focus, or overload check-ins. | Stored as lightweight time-series session markers. |
| **Understanding Checks**| Socratic explanation checks ("explain in your own words"). | Short written responses or optional voice answers. |
| **Adult Feedback** | Optional observational input from linked teachers or parents. | Extra context only; its absence is never penalized. |
| **Derived Summaries** | Aggregated session stats (focus time, quiz scores). | Consented sync only. Never exposes raw biometric data. |

---

## 🤖 AI Engine & Economics

### 1. Six Specialized Roles, Shared Inference
Rather than running redundant, costly models for each feature, Synapse directs six distinct system instruction sets through a unified AI router:
1. **Focus Content Agent**: Generates real-world analogies, multi-modal notes, and simplified concept breakdowns.
2. **Insights Prompt Agent**: Generates metacognitive questions for cohort reflection.
3. **Mentor Intervention Agent**: Detects learning friction and suggests targeted pedagogical remedies.
4. **Supportive SOS Chat Agent**: Empathetic, calming conversational assistant for stress de-escalation.
5. **Task Hint Agent**: Socratic hints that unblock students without revealing answers.
6. **Task & Test Generator Agent**: Generates structured MCQ assessments with answer keys and homework sets.

### 2. Zero-Budget Free Launch Strategy
- **Shared Free Model Pilot**: Powered by high-speed, cost-effective inference (e.g., Groq with `gpt-oss-20b`).
- **Deterministic Operations in Code**: Progress percentages, quiz score calculations, milestone tracking, and daily focus streaks run in pure TypeScript code — **consuming 0 AI tokens**.
- **No Deceptive Fallback**: If free-tier quotas are exhausted, the app clearly notifies the user that AI assistance is temporarily resting. Core curriculum, offline quizzes, notes, and progress tracking remain 100% active.
- **Optional Local AI**: Support for lightweight local models (e.g., `Qwen3.5-4B`) on desktop platforms where hardware permits.

---

## 📡 Offline Capability & Data Sync

- **Offline-First Study**: Downloaded course modules, notes, and local practice quizzes are fully functional without an internet connection.
- **Resilient Progress Queue**: Local progress events receive stable unique UUIDs and queue in local device storage.
- **Smart Connectivity Sync**: When the device reconnects, queued events synchronize idempotently to MongoDB Atlas without duplicate counting.
- **Clear Distinction**: The UI explicitly marks local drafts vs. verified server submissions.

---

## ✨ Features Overview

### For Learners
- 🧭 **My Adventure (Cognitive Map)**: Visual dashboard with daily milestone tracking, cognitive load gauges, and achievement badges.
- 📚 **Learning Quests (Course Hub)**: CBSE & NEP 2020 syllabus units structured with 4-part instructional flows (Hook, Direct Instruction, Guided Practice, Closure).
- 🎥 **Embedded Media Player**: Distraction-free playback of instructor recordings and YouTube tutorials.
- 📝 **Interactive MCQ & Homework Taker**: Auto-scored quizzes with instant rationale explanations and structured homework response entry.
- 🧘 **Focus Zone (Focus Chamber)**: Pomodoro timer, ambient soundscapes, real-world analogies, and complexity reduction sliders.
- 🫁 **Take a Breath (SOS Toolkit)**: Interactive box-breathing animation, sensory grounding prompts, and supportive chat.

### For Teachers / Mentors
- 🗂️ **Course & Lesson Studio**: Author curriculum modules with embedded video links, notes, and custom question banks.
- 📊 **My Classroom (Seat Heatmap)**: Real-time grid displaying student cognitive load levels to instantly spot friction.
- 💡 **AI Intervention Dispatch**: Instant suggestions for students experiencing high friction or conceptual blockages.
- 📈 **Class Progress (Cohort Telemetry)**: Class-wide performance analytics and cohort-wide broadcast prompts.
- ⚡ **AI Test & Homework Maker**: Instantly generate complete quizzes with correct option keys using AI.

### For Parents / Guardians
- 📱 **Learner Dashboard**: Free portal showing learning milestones, focus time, and subject progress for linked children.
- 📧 **Optional Weekly Summaries**: Add-on email dispatch delivering weekly progress recaps.

---

## 🛠 Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript 5.8](https://www.typescriptlang.org/) + [Vite 6.2](https://vitejs.dev/) |
| **Styling & Design System** | [Tailwind CSS 4.1](https://tailwindcss.com/) + Custom Glassmorphic tokens (`app-design.css`) |
| **Desktop Shell** | [Electron 42](https://www.electronjs.org/) + [electron-builder 26](https://www.electron.build/) + [esbuild](https://esbuild.github.io/) |
| **Mobile Shell** | [Capacitor 8](https://capacitorjs.com/) (Android SDK & iOS Xcode native targets) |
| **Icons & Animation** | [Lucide React](https://lucide.dev/), [Motion (Framer)](https://motion.dev/), [Anime.js](https://animejs.com/) |
| **Data Visualization** | [Recharts 3.8](https://recharts.org/) |
| **Server & APIs** | [Node.js](https://nodejs.org/) (v20+ / v22) + [Express 4.21](https://expressjs.com/) via `tsx` |
| **Database & ODM** | [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose 9.6](https://mongoosejs.com/) |
| **Auth** | [Firebase Authentication 12.14](https://firebase.google.com/) + Instant Demo Bypass |
| **AI Inference** | Groq (`gpt-oss-20b`), Google Gemini (`gemini-2.5-flash`), Anthropic Claude, OpenAI GPT-4o |

---

## 📂 Project Directory Structure

```
Learning-operating-system-LOS-/
├── package.json                    # Workspace root scripts & Electron configuration
├── APP_SETUP.md                    # Platform build & physical device validation guide
├── .env                            # Client/server environment settings
│
├── desktop/                        # Electron runtime files
│   ├── main.ts                     # Desktop main process (sandboxed security, external URLs)
│   └── build.mjs                   # esbuild desktop bundler
├── desktop-dist/                   # Bundled desktop output (main.cjs)
│
├── frontend/                       # React 19 Client & Capacitor App
│   ├── package.json
│   ├── vite.config.ts              # Vite dev server & build setup
│   ├── capacitor.config.ts         # Capacitor mobile bundle configuration
│   └── src/
│       ├── App.tsx                 # Root router & view switcher
│       ├── main.tsx                # Client DOM mount
│       ├── index.css               # Core styling & glassmorphic tokens
│       ├── app-design.css          # Cross-platform touch, viewport, & utility styles
│       ├── types.ts                # Master TypeScript schemas
│       │
│       ├── services/
│       │   ├── api.ts              # API base URL resolver
│       │   ├── http.ts             # Unified fetch client with error guards
│       │   ├── db.service.ts       # MongoDB API service for courses, modules, lessons
│       │   ├── task.service.ts     # Task board API service
│       │   └── auth.service.ts     # Firebase auth methods
│       │
│       └── components/
│           ├── navigation.ts       # Role-based navigation item registry
│           ├── MobileNavigation.tsx# Bottom navigation bar for mobile viewports
│           ├── Navbar.tsx          # Top header with profile & notification controls
│           ├── Sidebar.tsx         # Responsive collapsible desktop sidebar
│           ├── LandingPage.tsx     # Hero presentation with interactive neural canvas
│           ├── CourseHub.tsx       # Curriculum manager, MCQ quiz taker, video player
│           ├── CognitiveMap.tsx    # Learner dashboard, load gauge, and tasks
│           ├── FocusChamber.tsx    # Focus room with timer & multi-modal AI content
│           ├── SOSToolkit.tsx      # Calming exercises & streaming supportive therapist
│           ├── InsightsHub.tsx     # Classroom heatmap matrix & intervention engine
│           ├── CohortTelemetry.tsx # Cohort metrics & prompt broadcaster
│           ├── HelpCenter.tsx      # System diagnostics, FAQ, and support ticketing
│           ├── HelpChatBot.tsx     # Floating AI help companion
│           ├── PrivacyPolicy.tsx   # Platform privacy charter & data boundaries
│           └── TermsConditions.tsx # Terms of service documentation
│
└── backend/                        # Express API & AI Router
    ├── package.json
    ├── .env                        # Private keys (MongoDB, AI Providers)
    └── src/
        ├── server.ts               # Express server, MongoDB schemas, & REST endpoints
        └── agents/
            ├── index.ts            # AI Router registering all 6 roles
            ├── focusAgent.ts       # Focus content generation
            ├── insightsAgent.ts    # Metacognitive prompt synthesis
            ├── interventionAgent.ts# Student intervention suggestions
            ├── sosAgent.ts         # Empathetic SOS dialogue streaming
            ├── taskHintAgent.ts    # Scaffolding hints without spoiler answers
            ├── taskGeneratorAgent.ts# Autonomous quiz and homework generator
            └── utils.ts            # Response parsing & sanitation utilities
```

---

## 🚀 Getting Started

### 1. Web & Backend Server

```bash
# 1. Clone the repository
git clone https://github.com/aaryankasaudhan91-dev/Learning-operating-system-LOS-.git
cd Learning-operating-system-LOS-

# 2. Install dependencies across workspaces
npm install

# 3. Start development servers concurrently
npm run dev
```
- **Web App**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`

### 2. Desktop App (Electron)

```bash
# Build frontend and launch the native desktop application
npm run desktop

# Package unpacked application directory
npm run desktop:package

# Generate production platform installers (Windows NSIS / macOS DMG / Linux AppImage)
npm run desktop:installer
```

### 3. Mobile App (Capacitor Android / iOS)

```bash
# 1. Build frontend distribution
npm run build -w frontend

# 2. Add Android platform (one-time setup)
cd frontend && npx cap add android && cd ..

# 3. Sync web bundle to mobile project
npm run mobile:sync

# 4. Open in Android Studio
npm run mobile:android -w frontend
```

---

## 🔑 Environment Variables

Configure `backend/.env` with your credentials:

```env
# -------------------------------------------------------------
# Database
# -------------------------------------------------------------
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/synapse?retryWrites=true&w=majority"

# -------------------------------------------------------------
# AI Providers (Optional - Zero-budget mock fallback active)
# -------------------------------------------------------------
# Groq / Pilot Provider API Key
GROQ_API_KEY="your-groq-api-key"

# Google Gemini (Multimodal & SOS Streaming)
GEMINI_API_KEY="your-gemini-api-key"

# OpenAI (GPT-4o Focus & Task Hints)
OPENAI_API_KEY="your-openai-api-key"

# Anthropic (Claude 3.5 Sonnet Interventions & Generators)
ANTHROPIC_API_KEY="your-anthropic-api-key"

# NVIDIA NIM (Nemotron 51B Cohort Insights)
NVIDIA_API_KEY="your-nvidia-api-key"

# -------------------------------------------------------------
# Server
# -------------------------------------------------------------
PORT=3000
```

---

## 💳 Plans & Metered Access Model

*Commercial structure established in the 21 October 2026 Decision Record:*

| Tier | Core Features | AI Inference Access | Parent Reporting |
|---|---|---|---|
| **Free Tier** | Full curriculum, offline lessons/notes, code-based progress tracking. | Limited basic shared AI (quota-capped; no automatic paid fallback). | Free linked parent dashboard. |
| **Pro Tier** | All Free features + multi-device synchronization priority. | Monthly AI credit allowance for selected premium models. Top-ups available. | Free linked parent dashboard. |
| **Ultra Tier** | All Pro features + priority sync. | Larger monthly AI credit allowance with expanded access to high-parameter frontier models. | Free linked parent dashboard. |
| **Parent Email Add-on** | — | — | Optional paid weekly email summary reports. |

- **Credits Over Token Counts**: Clear credit costs represent underlying model expense, giving learners transparent control over their usage.
- **Affordable by Design**: Preserves open educational access without forcing high upfront financial commitments.

---

## 🗄 Database Schema (MongoDB)

- **`UserProfile`**: Stores learner/mentor info, role (`student` \| `mentor`), optional linked teacher email, focus minutes, cognitive load state, and badges.
- **`Course`**: Class level, subject, course title, and curriculum description.
- **`Module`**: Academic term, title, learning outcomes, and sequence order.
- **`Lesson`**: Monthly theme, 4-step instructional flow, lecture video URL, YouTube tutorial link, study notes, and custom interactive MCQ quiz / homework questions.
- **`Task`**: Student task items, difficulty levels, point rewards, and status.
- **`BroadcastPrompt`**: Mentor broadcast prompts directed to student cohorts.

---

## 🗺 Roadmap & Continuation

*As structured in the Decision Record handoff baseline:*

- [x] **v2.0 Tri-Target Platform**: Complete Web, Electron Desktop, and Capacitor Mobile shells with responsive touch navigation.
- [x] **v2.0 Privacy Architecture**: On-device camera/mic processing guarantees with zero raw media uploads.
- [x] **v2.0 Diagnostics & Support Hub**: Interactive diagnostics suite, searchable FAQ, and support ticketing.
- [ ] **v2.1 Shared-Model AI Router**: Integrate Groq/gpt-oss-20b single-model router with transparent quota-exhaustion messaging.
- [ ] **v2.2 Bidirectional WebSocket Sync**: Live cognitive telemetry between active classroom sessions.
- [ ] **v2.3 Offline Event Sync Queue**: Robust event-ID queuing for seamless offline lesson completions and later batch synchronization.
- [ ] **v2.4 Later-Phase Media Lab**: On-demand personalized explanatory video synthesis and interactive 3D concept visualizers.

---

## 📄 License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

```
Copyright 2026 Synapse / Learner Operating System Contributors
Prepared for Aaryan Kasaudhan

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
```

---

<p align="center">
  <strong>Synapse — Learner Operating System</strong><br/>
  <em>Learning without barriers.</em>
</p>
