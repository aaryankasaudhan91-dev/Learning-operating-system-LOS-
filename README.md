<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0--v2-8A2BE2?style=for-the-badge&logo=rocket" alt="Version 2.0" />
  <img src="https://img.shields.io/badge/Status-Production--Ready-brightgreen?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Platforms-Web%20%7C%20Electron%20Desktop%20%7C%20Capacitor%20Mobile-blueviolet?style=for-the-badge" alt="Platforms" />
  <img src="https://img.shields.io/badge/AI%20Core-Gemini%20%7C%20Claude%20%7C%20GPT--4o%20%7C%20NVIDIA-00b894?style=for-the-badge" alt="AI Core" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge" alt="License" />
</p>

# 🧠 Synapse — Learner Operating System (LOS) `v2.0`

> **An adaptive, multi-platform cognitive education cockpit that synchronizes learning experiences with real-time student mental states, leveraging a resilient 6-agent AI architecture.**

Synapse LOS is an intelligent educational operating system engineered to close the effectiveness gap in modern schooling. Built according to **NEP 2020** & **CBSE** pedagogical principles, Synapse mitigates student burnout, predicts cognitive friction, and induces flow states through real-time telemetry, adaptive instructional scaffolding, empathetic crisis intervention, and cross-platform native execution.

---

## ⚡ What's New in Version 2.0 (`v2.0`)

Synapse `v2.0` elevates the platform from a web prototype to an enterprise-grade, tri-target cross-platform system:

1. **Cross-Platform Tri-Target Runtime**:
   - 🖥️ **Desktop App (Electron 42)**: Native desktop application bundle with system window chrome, auto-hiding menus, sandboxed process isolation, and cross-platform builders (Windows NSIS installer, macOS DMG, Linux AppImage).
   - 📱 **Mobile App (Capacitor 8)**: Native wrappers for Android and iOS with tactile touch states, safe-area boundary handling, and dedicated bottom navigation (`MobileNavigation`).
   - 🌐 **Web App (React 19 + Vite 6)**: Ultrafast responsive Single-Page Application optimized for modern desktop and tablet displays.
2. **Unified Design Architecture (`app-design.css`)**:
   - Shared design system across web, desktop, and mobile with glassmorphic depth, dynamic theme tokens, smooth hardware-accelerated animations, and responsive touch ergonomics.
3. **Streamlined Navigation & UX Refresh**:
   - **Student Cockpit**: Re-engineered with intuitive gamified quests (*My Adventure*, *Learning Quests*, *Focus Zone*, *Take a Breath*).
   - **Mentor Suite**: Mission-control layout (*Courses*, *My Classroom*, *Class Progress*).
4. **Enhanced Diagnostic & Compliance Suite**:
   - Integrated **Help & Diagnostics Center** (`HelpCenter.tsx`) featuring real-time connection status, automated test diagnostics, interactive FAQ guidebook, embedded support chatbot, and instant ticket dispatch.
   - Comprehensive **Privacy Policy** and **Terms & Conditions** compliance modules.
5. **Resilient HTTP & Offline Fallbacks (`http.ts`)**:
   - Centralized network layer with automatic failover to intelligent mock data when offline or when external AI API keys are unconfigured.

---

## 📑 Table of Contents

- [What's New in Version 2.0](#-whats-new-in-version-20-v20)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
  - [For Students](#for-students)
  - [For Mentors & Educators](#for-mentors--educators)
  - [Platform & Cross-Device Infrastructure](#platform--cross-device-infrastructure)
- [6-Agent AI Architecture](#-6-agent-ai-architecture)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Installation & Quick Start](#-installation--quick-start)
  - [1. Web & Backend Development](#1-web--backend-development)
  - [2. Desktop App (Electron)](#2-desktop-app-electron)
  - [3. Mobile App (Capacitor Android / iOS)](#3-mobile-app-capacitor-android--ios)
- [Environment Configuration](#-environment-configuration)
- [Zero-Config Demo Accounts](#-zero-config-demo-accounts)
- [Backend API Reference](#-backend-api-reference)
- [Database Schema (MongoDB Atlas)](#-database-schema-mongodb-atlas)
- [Author & Engineering Team](#-author--engineering-team)
- [Roadmap](#-roadmap)
- [License](#-license)

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
│   │ Student Cockpit   │ Mentor Console    │ Diagnostics & Support  │  │
│   │ • Cognitive Map   │ • Insights Matrix │ • Help Center          │  │
│   │ • Course Quests   │ • Cohort Stream   │ • AI Support Chatbot   │  │
│   │ • Focus Chamber   │ • Test Creator    │ • Privacy & Compliance │  │
│   │ • SOS Calibrator  │ • Intervention Ctr│ • Diagnostic Telemetry │  │
│   └───────────────────┴───────────────────┴────────────────────────┘  │
│                                       │                                │
│          Services: http.ts ─ db.service ─ task.service ─ auth.service  │
└───────────────────────────────────────┬────────────────────────────────┘
                                        │ REST / JSON Streaming
                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     BACKEND ENGINE (Node.js + Express)                 │
│                                                                        │
│  ┌───────────────────────── AI Agent Router ────────────────────────┐ │
│  │                                                                  │ │
│  │  1. Focus Agent        2. Insights Agent      3. Intervention    │ │
│  │     (OpenAI GPT-4o)       (NVIDIA Nemotron)      (Claude 3.5)    │ │
│  │                                                                  │ │
│  │  4. SOS Chat Agent     5. Task Hint Agent     6. Task Generator  │ │
│  │     (Gemini 2.5 Flash)    (OpenAI GPT-4o)        (Claude 3.5)    │ │
│  │                                                                  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  API Gateway: /api/users ─ /api/courses ─ /api/tasks ─ /api/prompts    │
│  Persistence: Mongoose 9.6 ODM ──► MongoDB Atlas Cloud Database        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### For Students
| Feature | Details |
|---|---|
| **Cognitive Map (My Adventure)** | Real-time cognitive load gauge, gamified milestone tracking, task board with status filtering, and peer accolade badges. |
| **Learning Quests (Course Hub)** | Curriculum browser aligned with CBSE & NEP 2020. Modular units with instructional flows (Hook, Direct Instruction, Guided Practice, Closure). |
| **Interactive Video & Media Player** | In-app playback for personal instructor lectures and curated YouTube tutorials with distraction-free presentation. |
| **Custom Test & Homework Takers** | Instant-scoring multiple-choice assessments with color-coded reviews and freeform homework response submissions. |
| **Focus Chamber (Focus Zone)** | Pomodoro timer, ambient soundscapes, sensory modes (text/audio/visual), real-world analogies, and AI step-down complexity simplifiers. |
| **SOS Toolkit (Take a Breath)** | Guided box-breathing, 5-4-3-2-1 sensory grounding, and a real-time streaming conversational AI therapist powered by Gemini. |
| **Help & Diagnostics Center** | System health verification, FAQ directory, embedded AI assistant bubble, and formal support ticket logging. |

### For Mentors & Educators
| Feature | Details |
|---|---|
| **Seat Matrix (My Classroom)** | Live classroom heatmap visually tracking student cognitive load and friction in real time. |
| **AI Intervention Engine** | Instant AI-generated pedagogical intervention recommendations based on individual learner telemetry. |
| **Cohort Telemetry (Class Progress)**| Class-wide aggregate metrics, engagement trends, and instant broadcasting of metacognitive prompts. |
| **Curriculum Builder & Quick Assign**| Author structured courses, modules, and lessons. Rapidly assign targeted lessons and assessments to individual students. |
| **AI Test & Homework Generator** | One-click automatic generation of MCQ quizzes with answer keys and structured homework prompts via Anthropic Claude. |
| **Google Form Integration** | Flexibility to embed native custom quizzes or link external Google Forms for evaluations. |

### Platform & Cross-Device Infrastructure
| Capability | Details |
|---|---|
| **Electron Desktop Application** | Dedicated desktop shell with background optimization, OS window handling, and zero web browser chrome distractions. |
| **Capacitor Mobile Architecture** | Native iOS and Android readiness with mobile bottom navigation bar and gesture ergonomics. |
| **Role-Based Authentication** | Secure Firebase Auth (email/password) paired with instant zero-credential demo logins for rapid testing. |
| **Zero-Config Fallbacks** | Smart mock responders ensure complete platform functionality even without external API credentials. |

---

## 🤖 6-Agent AI Architecture

Synapse deploys an ensemble of 6 specialized AI agents across 4 distinct frontier model providers:

| # | Agent | Endpoint | Provider | Model | Functional Role |
|---|---|---|---|---|---|
| 1 | **Focus Agent** | `POST /api/agent/focus` | OpenAI | `gpt-4o-mini` | Dynamically distills study material into text/audio/visual summaries, real-world analogies, and stepped-down explanations. |
| 2 | **Insights Agent** | `POST /api/agent/insights-prompt` | NVIDIA | `llama-3.1-nemotron-51b` | Generates deep metacognitive prompts for cohort reflection to solidify conceptual retention. |
| 3 | **Intervention Agent** | `POST /api/agent/intervention-suggestion` | Anthropic | `claude-3-5-sonnet` | Analyzes learner friction telemetry to craft actionable pedagogical interventions for instructors. |
| 4 | **SOS Chat Agent** | `POST /api/agent/sos-chat` | Google | `gemini-2.5-flash` | Empathetic, de-escalating mental wellness counselor that streams reassuring dialogue during distress. |
| 5 | **Task Hint Agent** | `POST /api/agent/task-hint` | OpenAI | `gpt-4o-mini` | Delivers Socratic scaffolding hints for difficult homework tasks without disclosing answers. |
| 6 | **Task Generator Agent** | `POST /api/agent/generate-task` | Anthropic | `claude-3-5-sonnet` | Autonomously formulates structured syllabus tasks, multiple-choice quizzes with answer keys, and homework prompts. |

---

## 🛠 Tech Stack

### Client Side (Web, Desktop, Mobile)
- **Framework**: [React 19](https://react.dev/) + [TypeScript 5.8](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite 6.2](https://vitejs.dev/) + [esbuild](https://esbuild.github.io/)
- **Desktop Runtime**: [Electron 42](https://www.electronjs.org/) + [electron-builder 26](https://www.electron.build/)
- **Mobile Runtime**: [Capacitor 8](https://capacitorjs.com/) (Android & iOS)
- **Styling**: [Tailwind CSS 4.1](https://tailwindcss.com/) + Custom Glassmorphic Token Engine
- **Motion & Visuals**: [Motion (Framer Motion 12)](https://motion.dev/), [Anime.js 4](https://animejs.com/)
- **Data Visualization**: [Recharts 3.8](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/) (60+ specialized icons)
- **Export Utility**: [jsPDF 4.2](https://github.com/parallax/jsPDF) + `jspdf-autotable`

### Server Side & AI Engine
- **Runtime**: [Node.js](https://nodejs.org/) (v20+ / v22 recommended)
- **Framework**: [Express 4.21](https://expressjs.com/) with TypeScript execution via `tsx`
- **Database & ODM**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose 9.6](https://mongoosejs.com/)
- **Authentication**: [Firebase Auth 12.14](https://firebase.google.com/)
- **AI SDKs**: `@google/genai` (Gemini), Anthropic Claude API, OpenAI API, NVIDIA AI Foundation Endpoints

---

## 📂 Project Directory Structure

```
Learning-operating-system-LOS-/
├── package.json                    # Workspace root (npm workspaces: frontend, backend)
├── APP_SETUP.md                    # Cross-platform installation and device notes
├── .env                            # Root client/server environment configuration
│
├── desktop/                        # Electron desktop runtime
│   ├── main.ts                     # Electron main process (window lifecycle, security sandboxing)
│   └── build.mjs                   # Fast esbuild bundle script for desktop entrypoint
├── desktop-dist/                   # Compiled Electron output (`main.cjs`)
│
├── frontend/                       # React 19 Single Page Application & Mobile Shell
│   ├── package.json
│   ├── vite.config.ts              # Vite configuration
│   ├── capacitor.config.ts         # Capacitor iOS/Android configuration
│   ├── index.html
│   └── src/
│       ├── App.tsx                 # Root component, view router, authentication state
│       ├── main.tsx                # Client bootstrapper
│       ├── index.css               # Core CSS and custom theme design tokens
│       ├── app-design.css          # Cross-platform touch, viewport, and glass utility styles
│       ├── types.ts                # Master TypeScript interface definitions
│       │
│       ├── lib/
│       │   └── firebase.ts         # Firebase client initialization
│       │
│       ├── services/
│       │   ├── api.ts              # API URL endpoint resolver
│       │   ├── http.ts             # Resilient HTTP request helper with error handling
│       │   ├── auth.service.ts     # Firebase authentication service
│       │   ├── db.service.ts       # Database CRUD service (Courses, Modules, Lessons, Users)
│       │   └── task.service.ts     # Student task CRUD service
│       │
│       └── components/
│           ├── navigation.ts       # Central navigation registry for students & mentors
│           ├── MobileNavigation.tsx# Native bottom navigation bar for mobile devices
│           ├── Navbar.tsx          # Desktop header bar with alerts and quick profile menu
│           ├── Sidebar.tsx         # Desktop responsive sidebar navigation
│           ├── SplashScreen.tsx    # Animated boot splash screen
│           ├── LandingPage.tsx     # Scrollytelling hero presentation with neural canvas
│           ├── AboutPage.tsx       # Pedagogical philosophy & development story
│           ├── LoginPage.tsx       # Firebase credentials & instant demo login
│           ├── RegisterPage.tsx    # Role selection (Student / Mentor) registration
│           │
│           ├── CourseHub.tsx       # Unified curriculum manager (Quests, tests, video player)
│           ├── CognitiveMap.tsx    # Student dashboard (Load gauge, milestones, badges)
│           ├── FocusChamber.tsx    # Deep focus room with timer & multimodal AI content
│           ├── SOSToolkit.tsx      # Breathing exercises & real-time streaming AI therapist
│           ├── InsightsHub.tsx     # Mentor seat matrix heatmap & AI intervention dispatch
│           ├── CohortTelemetry.tsx # Cohort analytics & metacognitive broadcast prompts
│           ├── HelpCenter.tsx      # Support center with live diagnostics & support ticket form
│           ├── HelpChatBot.tsx     # Floating AI help companion
│           │
│           ├── ProfilePage.tsx     # User account profile
│           ├── SettingsPage.tsx    # App preferences & notifications
│           ├── PrivacyPolicy.tsx   # Privacy & data safety statement
│           ├── TermsConditions.tsx # Terms of service documentation
│           └── NotFoundPage.tsx    # 404 state screen
│
└── backend/                        # Express API & Multi-Agent Server
    ├── package.json
    ├── .env                        # Server credentials (API keys, MongoDB connection)
    └── src/
        ├── server.ts               # Express server, Mongoose models, and REST endpoints
        └── agents/
            ├── index.ts            # AI Router registering all 6 agents
            ├── focusAgent.ts       # OpenAI-powered study content synthesizer
            ├── insightsAgent.ts    # NVIDIA-powered metacognitive prompt generator
            ├── interventionAgent.ts# Claude-powered mentor intervention architect
            ├── sosAgent.ts         # Google Gemini streaming empathetic therapist
            ├── taskHintAgent.ts    # OpenAI-powered scaffolding hint generator
            ├── taskGeneratorAgent.ts# Claude-powered quiz & homework builder
            └── utils.ts            # Sanitization & response parsing utilities
```

---

## 🚀 Installation & Quick Start

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (recommended)
- **npm**: `v9.x` or newer
- **MongoDB**: MongoDB Atlas URI or local instance (defaults gracefully if not present)

### 1. Web & Backend Development

```bash
# 1. Clone repository
git clone https://github.com/aaryankasaudhan91-dev/Learning-operating-system-LOS-.git
cd Learning-operating-system-LOS-

# 2. Install workspace dependencies
npm install

# 3. Start development servers concurrently (Frontend + Backend)
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API Server**: `http://localhost:3000`

### 2. Desktop App (Electron)

```bash
# Run the desktop app locally with native window frame
npm run desktop

# Package unpacked desktop binary
npm run desktop:package

# Generate cross-platform installers (NSIS installer for Windows, DMG for macOS, AppImage for Linux)
npm run desktop:installer
```
*Compiled desktop binaries and installers are generated in the `release/` directory.*

### 3. Mobile App (Capacitor Android / iOS)

```bash
# 1. Build the production web bundle
npm run build -w frontend

# 2. Add Android platform (run once)
cd frontend && npx cap add android && cd ..

# 3. Synchronize assets to native platforms
npm run mobile:sync

# 4. Open in Android Studio to run on an emulator or physical device
npm run mobile:android -w frontend

# For iOS (on macOS with Xcode):
# cd frontend && npx cap add ios && cd ..
# npm run mobile:ios -w frontend
```

---

## 🔑 Environment Configuration

Create or update `backend/.env` with your credentials:

```env
# -------------------------------------------------------------
# Database Configuration
# -------------------------------------------------------------
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/synapse?retryWrites=true&w=majority"

# -------------------------------------------------------------
# AI Agent API Credentials (Optional - Mock fallbacks active)
# -------------------------------------------------------------
# Google Gemini (SOS Chat Agent + Multimodal AI SDK)
GEMINI_API_KEY="your-gemini-api-key"

# OpenAI (Focus Agent + Task Hint Agent)
OPENAI_API_KEY="your-openai-api-key"

# Anthropic Claude (Intervention Agent + Task Generator Agent)
ANTHROPIC_API_KEY="your-anthropic-api-key"

# NVIDIA NIM (Insights Metacognitive Prompt Agent)
NVIDIA_API_KEY="your-nvidia-api-key"

# -------------------------------------------------------------
# Server Settings
# -------------------------------------------------------------
PORT=3000
```

> **Smart Mock Fallback Engine**: If any AI API key is missing or omitted, Synapse activates its built-in fallback system, allowing full offline testing, evaluation, and demonstration without third-party fees.

---

## 👤 Zero-Config Demo Accounts

Skip registration and evaluate with pre-loaded profiles:

| Role | Profile Name | Purpose | Features Tested |
|---|---|---|---|
| **Student** | **Arjun Patel** | Real-time student perspective | Cognitive load gauge, active tasks, study quests, MCQ quiz taker, SOS breathing & chat |
| **Mentor** | **Dr. Kavita Sharma** | Educator command cockpit | Seat matrix heatmap, student quick-assignment, Claude-generated tests, cohort broadcasts |

*Demo accounts authenticate instantly with one click and maintain state within browser/desktop storage.*

---

## 📡 Backend API Reference

### Core REST Endpoints

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Users** | `GET` | `/api/users` | List users (`?role=`, `?teacherEmail=`) |
| | `GET` | `/api/users/:uid` | Retrieve individual user profile |
| | `POST` | `/api/users/:uid` | Upsert user telemetry and profile data |
| **Courses** | `GET` | `/api/courses` | List all available curriculum courses |
| | `POST` | `/api/courses` | Create or update a course entity |
| **Modules** | `GET` | `/api/courses/:courseId/modules` | Fetch all modules in a course |
| | `POST` | `/api/courses/:courseId/modules` | Create or update a module |
| **Lessons** | `GET` | `/api/courses/:courseId/modules/:moduleId/lessons` | List lessons within a module |
| | `POST` | `/api/courses/:courseId/modules/:moduleId/lessons` | Create/update lesson (videos, tests, homework) |
| **Tasks** | `GET` | `/api/tasks` | Retrieve student tasks (`?studentId=`) |
| | `POST` | `/api/tasks` | Create new learning task |
| | `PUT` | `/api/tasks/:id` | Update task status or completion |
| | `DELETE`| `/api/tasks/:id` | Delete task item |
| **Prompts** | `POST` | `/api/prompts/broadcast` | Broadcast metacognitive prompt to cohort |
| | `GET` | `/api/prompts/latest` | Fetch active cohort reflection prompt |

### AI Agent Endpoints (`/api/agent/*`)

- `POST /api/agent/focus` — Synthesize study topics with analogies and stepped-down complexity.
- `POST /api/agent/insights-prompt` — Generate cohort reflection prompts using NVIDIA Nemotron.
- `POST /api/agent/intervention-suggestion` — Generate actionable student intervention steps using Claude.
- `POST /api/agent/sos-chat` — Stream calming, de-escalating therapist dialogue via Gemini.
- `POST /api/agent/task-hint` — Deliver Socratic hints for challenging coursework using GPT-4o.
- `POST /api/agent/generate-task` — Generate syllabus-aligned MCQ tests with answer keys and homework assignments.

---

## 🗄 Database Schema (MongoDB Atlas)

- **`UserProfile`**: User metadata, role (`student` \| `mentor`), assigned mentor email, daily focus goals, minutes studied, cognitive load index, and earned badges.
- **`Course`**: Subject, class grade level (e.g., Class 10), title, syllabus description, and sequence order.
- **`Module`**: Academic term, module title, specific learning competencies, and module order.
- **`Lesson`**: Monthly theme, topic, learning outcomes, 4-step instructional flow, personal lecture video link, YouTube tutorial URL, notes resource, and embedded interactive test (`testCustom`) & homework (`homeworkCustom`).
- **`Task`**: Student assignment items, difficulty level, estimated completion minutes, points, and current status.
- **`BroadcastPrompt`**: Cohort broadcast history, mentor identifier, and prompt body.

---

## 👨‍💻 Author & Engineering Team

Synapse Learner Operating System was conceived, architected, and engineered by:

### **Aaryan Rajkumar Kasaudhan**
*Full-Stack Software Engineer & AI System Architect*

- 🎓 **Education**: B.Tech in Computer Science & Engineering (AI & ML) — *Lokmanya Tilak College of Engineering (LTCE), University of Mumbai* (2025 – Present)
- 📍 **Location**: Thane, Maharashtra, India
- ✉️ **Email**: [aaryankasaudhan91@gmail.com](mailto:aaryankasaudhan91@gmail.com)
- 📞 **Phone**: [+91 8591095318](tel:+918591095318)
- 🌐 **GitHub**: [@aaryankasaudhan91-dev](https://github.com/aaryankasaudhan91-dev)
- 🏆 **Hackathon & Engineering Accolades**:
  - **First Runner-up**: *Pitchathon 1.0*
  - **Second Runner-up**: *Genesis 1.0 (Google Developer Groups - GDG LTCE)*
  - **Second Runner-up**: *Code of Spades*
- 💡 **Core Expertise**: Multi-Agent AI Orchestration (Gemini, Claude, GPT-4o, NVIDIA), Full-Stack Systems (React 19, TypeScript, Express, FastAPI), Scalable Cloud & Native Platforms (Electron, Capacitor, MongoDB Atlas, Firebase).

---

## 🗺 Roadmap

- [x] **v1.0**: Core Learner Operating System, 6-Agent AI Pipeline, CBSE/NEP 2020 Course Framework.
- [x] **v2.0**: Native Electron Desktop app, Capacitor Mobile deployment, refined navigation, Help & Diagnostics Center.
- [ ] **v2.1**: Real-time bi-directional WebSockets for live cognitive load sync between students and mentors.
- [ ] **v2.2**: Spaced-repetition review scheduler with predictive memory decay modeling.
- [ ] **v2.3**: Offline local SQLite sync for uninterrupted learning in low-connectivity areas.
- [ ] **v2.4**: Multi-lingual localized audio synthesis (Hindi, Marathi, Spanish, French).

---

## 📄 License

This project is open-source under the **[Apache License 2.0](LICENSE)**.

```
Copyright 2026 Aaryan Rajkumar Kasaudhan & The Synapse LOS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
```

---

<p align="center">
  <strong>Built with 🧠 by Aaryan Rajkumar Kasaudhan</strong><br/>
  <em>Dedicated to empowering learners, minimizing cognitive friction, and advancing education through empathetic AI.</em>
</p>
