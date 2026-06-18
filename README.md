<p align="center">
  <img src="https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

# 🧠 Synapse — Learner Operating System (LOS)

> **An adaptive, AI-powered cognitive education platform that dynamically calibrates learning experiences based on real-time student mental states.**

Synapse LOS is a next-generation education cockpit designed to reduce student burnout and maximize flow states. It integrates multi-model AI agents, real-time cognitive telemetry, an NEP 2020 & CBSE-aligned curriculum framework, and empathetic SOS tools — all within a premium glassmorphic dark-mode interface.

---

## 📑 Table of Contents

- [Features Overview](#-features-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [AI Agent Pipeline](#-ai-agent-pipeline)
- [Frontend Components](#-frontend-components)
- [Backend API Reference](#-backend-api-reference)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Demo Accounts](#-demo-accounts)
- [Screenshots & Views](#-screenshots--views)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## ✨ Features Overview

### For Students
| Feature | Description |
|---|---|
| **Course Hub** | Browse CBSE/NEP 2020 aligned courses, modules, and lessons with subject-wise breakdown |
| **Inline Video Player** | Watch personal teacher recordings or YouTube tutorials directly inside the app (embedded iframe/HTML5 player) |
| **Custom Test Taker** | Take interactive multiple-choice quizzes assigned by mentors — auto-scored with instant color-coded results |
| **Custom Homework Taker** | Submit freeform answers to structured homework questions assigned by mentors |
| **Cognitive Map** | Visual dashboard showing cognitive load, task board, peer insights, daily milestones, and achievement badges |
| **Focus Chamber** | Distraction-free study mode with timer, ambient soundscapes, content modes (text/audio/visual), and AI-generated analogies |
| **SOS Toolkit** | Emergency panel with box-breathing exercises, grounding techniques, and an empathetic AI therapist powered by Gemini |
| **Help Center** | Full-page support hub with system diagnostics, FAQ guidebook, embedded AI assistant, and support ticket form |

### For Mentors/Teachers
| Feature | Description |
|---|---|
| **Course Creator** | Create courses, modules, and lessons with instructional flow templates (Hook → Direct Instruction → Practice → Closure) |
| **Quick Lesson Assign** | Rapidly assign lessons with video, notes, and test/homework to specific students from the student management panel |
| **Custom Test Maker** | Build interactive multiple-choice quizzes (manual or AI-generated via Claude) with configurable correct answers |
| **Custom Homework Maker** | Create structured homework question sets (manual or AI-generated) |
| **Google Form Integration** | Option to link external Google Forms for tests and homework alongside the built-in maker |
| **Seat Matrix (Insights Hub)** | Real-time heatmap grid showing every student's cognitive load state — friction detection with AI intervention suggestions |
| **Cohort Telemetry** | Aggregate analytics, broadcast prompts to student cohorts, and monitor class-wide engagement patterns |
| **Intervention Center** | AI-powered intervention suggestions (via Claude) based on individual student cognitive states |

### Platform-Wide
| Feature | Description |
|---|---|
| **Multi-AI Agent Pipeline** | 6 specialized AI agents using 4 different providers (OpenAI, Anthropic, NVIDIA, Google Gemini) |
| **Firebase Authentication** | Email/password auth with role-based registration (student or mentor) |
| **Demo Accounts** | Pre-configured demo student and mentor accounts — no Firebase auth required |
| **MongoDB Persistence** | All user profiles, courses, tasks, and lessons persisted to MongoDB Atlas |
| **Responsive Design** | Full desktop sidebar + mobile bottom navigation bar |
| **Glassmorphic UI** | Premium dark-mode design system with plasma-violet/electric-cyan/synapse-green accent palette |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Vite + React 19)              │
│  ┌────────┐ ┌──────────┐ ┌────────────┐ ┌───────────────┐  │
│  │Landing │ │ Course   │ │ Cognitive  │ │  Focus        │  │
│  │Page    │ │ Hub      │ │ Map        │ │  Chamber      │  │
│  └────────┘ └──────────┘ └────────────┘ └───────────────┘  │
│  ┌────────┐ ┌──────────┐ ┌────────────┐ ┌───────────────┐  │
│  │SOS     │ │ Insights │ │ Cohort     │ │  Help         │  │
│  │Toolkit │ │ Hub      │ │ Telemetry  │ │  Center       │  │
│  └────────┘ └──────────┘ └────────────┘ └───────────────┘  │
│                                                             │
│  Services: db.service ─ task.service ─ auth.service ─ api   │
│  Auth: Firebase ─ Demo Fallback                             │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API (fetch)
┌──────────────────────────┴──────────────────────────────────┐
│                     BACKEND (Express + TypeScript)           │
│                                                              │
│  ┌─────────────────── AI Agent Router ───────────────────┐   │
│  │ Focus Agent    │ SOS Agent     │ Task Hint Agent      │   │
│  │ (OpenAI GPT)   │ (Gemini)      │ (OpenAI GPT)         │   │
│  ├────────────────┼───────────────┼──────────────────────┤   │
│  │ Insights Agent │ Intervention  │ Task Generator Agent │   │
│  │ (NVIDIA)       │ Agent (Claude)│ (Claude)             │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  REST Routes: /api/users ─ /api/courses ─ /api/tasks         │
│  Database: Mongoose ODM → MongoDB Atlas                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.0.1 | Component UI framework |
| **TypeScript** | 5.8 | Type safety |
| **Vite** | 6.2 | Dev server & bundler |
| **Tailwind CSS** | 4.1 | Utility-first styling with custom design tokens |
| **Motion (Framer)** | 12.x | View transitions and animations |
| **Recharts** | 3.8 | Data visualization charts |
| **Lucide React** | 0.546 | Icon library (28 component files use ~60+ unique icons) |
| **Firebase** | 12.14 | Authentication (email/password) |
| **jsPDF** | 4.2 | PDF report generation |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Express** | 4.21 | HTTP server & REST API routing |
| **TypeScript** | 5.8 | Type safety |
| **Mongoose** | 9.6 | MongoDB ODM for schema-based models |
| **@google/genai** | 2.8 | Google Gemini AI SDK (streaming SOS agent) |
| **dotenv** | 17.2 | Environment variable management |
| **tsx** | 4.21 | TypeScript execution (dev mode) |
| **esbuild** | 0.25 | Production bundling |

### External AI Services
| Provider | Model | Agent(s) |
|---|---|---|
| **OpenAI** | `gpt-4o-mini` | Focus Agent, Task Hint Agent |
| **Anthropic** | `claude-3-5-sonnet-20241022` | Intervention Agent, Task Generator Agent |
| **NVIDIA** | `llama-3.1-nemotron-51b-instruct` | Insights Agent |
| **Google** | `gemini-2.5-flash` | SOS Chat Agent (streaming) |

### Database & Auth
| Service | Purpose |
|---|---|
| **MongoDB Atlas** | Primary data store for users, courses, modules, lessons, tasks |
| **Firebase Auth** | User authentication (email + password), role-based access |

---

## 📂 Project Structure

```
LOS/
├── package.json                    # Workspace root (npm workspaces)
├── .env                            # Root environment variables
│
├── backend/
│   ├── package.json
│   ├── .env                        # Backend-specific env (API keys, MongoDB URI)
│   ├── src/
│   │   ├── server.ts               # Express server, Mongoose models, REST routes
│   │   └── agents/
│   │       ├── index.ts            # Agent router setup (mounts all 6 agents)
│   │       ├── focusAgent.ts       # ChatGPT-powered focus content generator
│   │       ├── insightsAgent.ts    # NVIDIA-powered metacognitive prompt generator
│   │       ├── interventionAgent.ts# Claude-powered mentor intervention suggestions
│   │       ├── sosAgent.ts         # Gemini-powered empathetic therapist (streaming)
│   │       ├── taskHintAgent.ts    # ChatGPT-powered task hint/scaffolding
│   │       ├── taskGeneratorAgent.ts# Claude-powered test/homework/task generator
│   │       └── utils.ts            # Shared sanitization & response cleaning
│   └── dist/                       # Production build output
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── App.tsx                 # Root component, view router, auth state manager
│       ├── main.tsx                # React entry point
│       ├── index.css               # Design system tokens (colors, glass effects)
│       ├── types.ts                # TypeScript interfaces & type definitions
│       │
│       ├── lib/
│       │   └── firebase.ts         # Firebase app initialization & auth export
│       │
│       ├── services/
│       │   ├── api.ts              # Base API URL configuration
│       │   ├── auth.service.ts     # Firebase auth helpers (login, register, logout)
│       │   ├── db.service.ts       # Database CRUD service (users, courses, modules, lessons)
│       │   └── task.service.ts     # Task CRUD service (student tasks)
│       │
│       └── components/
│           ├── LandingPage.tsx     # Scrollytelling hero with morphing neural canvas
│           ├── AboutPage.tsx       # Project philosophy & team info
│           ├── LoginPage.tsx       # Firebase + Demo account login
│           ├── RegisterPage.tsx    # Role-based registration (student/mentor)
│           ├── Navbar.tsx          # Top navigation bar with alerts
│           ├── Sidebar.tsx         # Left sidebar with role-based nav links
│           ├── SplashScreen.tsx    # Animated boot splash screen
│           │
│           ├── CourseHub.tsx        # Full curriculum manager (128KB — largest component)
│           │                         • Course/Module/Lesson browser (student)
│           │                         • Course/Module/Lesson creator (mentor)
│           │                         • Student management & quick assign panel
│           │                         • Test Maker + Homework Maker modals
│           │                         • Test Taker + Homework Taker modals
│           │                         • Embedded video player modal
│           │
│           ├── CognitiveMap.tsx     # Student dashboard with load gauge, tasks, milestones
│           ├── FocusChamber.tsx     # Silent study room with AI content modes
│           ├── SOSToolkit.tsx       # Emergency grounding exercises + AI therapist
│           ├── InsightsHub.tsx      # Mentor seat matrix heatmap + interventions
│           ├── CohortTelemetry.tsx  # Mentor cohort analytics + broadcast prompts
│           ├── HelpCenter.tsx       # Help & diagnostics center page
│           │
│           ├── ProfilePage.tsx      # User profile display
│           ├── SettingsPage.tsx     # User preferences
│           ├── HelpChatBot.tsx      # Floating AI chat bubble (bottom-right)
│           │
│           ├── ClassroomHeatmap.tsx  # Visual heatmap grid sub-component
│           ├── InterventionCenter.tsx# AI intervention alerts sub-component
│           ├── StudentTaskBoard.tsx  # Task checklist sub-component
│           ├── TaskCenter.tsx        # Advanced task management sub-component
│           ├── DailyMilestone.tsx    # Daily focus progress tracker
│           ├── PeerInsight.tsx       # Peer badges & social feedback
│           ├── AchievementGallery.tsx# Badge showcase gallery
│           ├── AudioNotes.tsx        # Text-to-speech notes player
│           ├── AppLogo.tsx           # SVG logo component
│           ├── FirebaseProvider.tsx  # Firebase context provider wrapper
│           └── UnderConstruction.tsx # Placeholder for unreleased features
```

---

## 🤖 AI Agent Pipeline

Each agent runs on a dedicated AI model from a different provider, ensuring diversity, resilience, and specialization:

### Agent Details

| # | Agent | Route | AI Provider | Model | Purpose |
|---|---|---|---|---|---|
| 1 | **Focus Agent** | `POST /api/agent/focus` | OpenAI | `gpt-4o-mini` | Generates concise study content — supports text, audio, visual modes plus real-world analogies and simplified explanations |
| 2 | **Insights Agent** | `POST /api/agent/insights-prompt` | NVIDIA | `llama-3.1-nemotron-51b` | Creates metacognitive reflection prompts for student cohorts to encourage deeper learning |
| 3 | **Intervention Agent** | `POST /api/agent/intervention-suggestion` | Anthropic | `claude-3-5-sonnet` | Generates actionable intervention suggestions for mentors based on a student's name, cognitive state, and load percentage |
| 4 | **SOS Chat Agent** | `POST /api/agent/sos-chat` | Google | `gemini-2.5-flash` | Empathetic AI therapist that streams calming, supportive responses for students in distress (chunked transfer) |
| 5 | **Task Hint Agent** | `POST /api/agent/task-hint` | OpenAI | `gpt-4o-mini` | Provides strategic hints and scaffolding for students stuck on tasks without giving away the answer |
| 6 | **Task Generator** | `POST /api/agent/generate-task` | Anthropic | `claude-3-5-sonnet` | Generates structured tasks, custom quizzes (MCQ with correct answers), homework question sets, and study roadmaps |

### Fallback Behavior

Every agent has built-in **mock fallback responses** when the corresponding API key is not configured. This allows the entire application to run fully functional in demo mode without any AI API keys.

---

## 🖥 Frontend Components

### Core Views (routed via `AppView` state)

| View Key | Component | Role Access | Description |
|---|---|---|---|
| `landing` | `LandingPage` | Public | Scrollytelling hero with 4-phase neural canvas (chaos → calibration → sync → flow) |
| `about` | `AboutPage` | Public | Project philosophy and mission statement |
| `login` | `LoginPage` | Public | Firebase auth + demo account buttons |
| `register` | `RegisterPage` | Public | Student/mentor registration with teacher email linkage |
| `courses` | `CourseHub` | Both | Full curriculum management — browsing, creating, assigning, test/homework taking |
| `map` | `CognitiveMap` | Student | Cognitive load gauge, task board, daily milestones, peer insights, achievements |
| `chamber` | `FocusChamber` | Student | Distraction-free study with AI-generated content, timer, and ambient sounds |
| `sos` | `SOSToolkit` | Student | Emergency grounding with box breathing + streaming AI therapist |
| `insights` | `InsightsHub` | Mentor | Seat matrix heatmap, cognitive load monitoring, AI intervention center |
| `cohort` | `CohortTelemetry` | Mentor | Class-wide analytics, broadcast prompts, engagement monitoring |
| `profile` | `ProfilePage` | Both | User profile overview |
| `settings` | `SettingsPage` | Both | User preferences |
| `help` | `HelpCenter` | Both | System diagnostics, FAQ guidebook, embedded AI assistant, support tickets |

### Design System

The UI is built on a custom dark-mode design system defined in `index.css`:

| Token | Value | Usage |
|---|---|---|
| `--void-black` | `#0a0a0f` | Primary background |
| `--plasma-violet` | `#7c3aed` | Primary accent (headings, active states) |
| `--electric-cyan` | `#0284c7` | Secondary accent (CTAs, highlights) |
| `--synapse-green` | `#059669` | Success states, active indicators |
| `--glass-stroke` | `rgba(255,255,255,0.08)` | Glassmorphic borders |
| `--surface-container` | Dark elevated surfaces | Cards, panels |

---

## 📡 Backend API Reference

### User Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | List users (filterable by `?role=`, `?email=`, `?teacherEmail=`) |
| `GET` | `/api/users/:uid` | Get user profile by UID |
| `POST` | `/api/users/:uid` | Create or update user profile (upsert) |

### Course Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/courses` | List all courses (auto-seeds demo data if empty) |
| `POST` | `/api/courses` | Create or update a course (upsert by `id`) |
| `GET` | `/api/courses/:courseId/modules` | List modules for a course |
| `POST` | `/api/courses/:courseId/modules` | Create or update a module |
| `GET` | `/api/courses/:courseId/modules/:moduleId/lessons` | List lessons for a module |
| `POST` | `/api/courses/:courseId/modules/:moduleId/lessons` | Create or update a lesson |
| `GET` | `/api/courses/:courseId/modules/:moduleId/lessons/:lessonId` | Get single lesson detail |

### Task Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | List tasks (filterable by `?studentId=`) |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update task by ID |
| `DELETE` | `/api/tasks/:id` | Delete task by ID |

### Prompt Routes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/prompts/broadcast` | Broadcast a metacognitive prompt to a cohort |
| `GET` | `/api/prompts/latest` | Get the most recent broadcast prompt |

### AI Agent Routes

All mounted under `/api/agent/`:

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `POST` | `/api/agent/focus` | `{ topic, contentMode, analogyMode, complexitySteppedDown }` | `{ content }` |
| `POST` | `/api/agent/insights-prompt` | `{ cohort }` | `{ prompt }` |
| `POST` | `/api/agent/intervention-suggestion` | `{ name, state, load }` | `{ suggestion }` |
| `POST` | `/api/agent/sos-chat` | `{ chatHistory }` | Streamed text (chunked) |
| `POST` | `/api/agent/task-hint` | `{ title, description }` | `{ hint }` |
| `POST` | `/api/agent/generate-task` | `{ topic, type }` | `{ title, description }` or `{ title, questions }` |

---

## 🗄 Database Schema

### MongoDB Collections (via Mongoose)

#### `UserProfile`
```javascript
{
  uid: String,           // Unique user identifier
  name: String,
  role: 'student' | 'mentor',
  teacherEmail: String,  // Links student to their mentor
  dailyFocusGoal: Number,     // Default: 120 minutes
  todayFocusMinutes: Number,  // Default: 0
  taskCompletionRate: Number, // Default: 0
  peerBadges: Object,
  cognitiveLoad: Number,      // Default: 50 (percentage)
  lastActive: String,
  badges: [String],
  courses: [String]
}
```

#### `Course`
```javascript
{
  id: String,
  classLevel: String,    // e.g., "Class 10"
  subject: String,       // e.g., "Physics"
  title: String,
  description: String,
  order: Number
}
```

#### `Module`
```javascript
{
  id: String,
  courseId: String,       // References Course.id
  term: String,          // e.g., "Term 1"
  title: String,
  learningObjectives: [String],
  order: Number
}
```

#### `Lesson`
```javascript
{
  id: String,
  moduleId: String,      // References Module.id
  month: String,
  theme: String,
  topic: String,
  learningOutcome: String,
  instructionalFlow: [{ step, duration, activity }],
  resources: [String],
  order: Number,
  personalVideo: String,     // URL to teacher's personal recording
  videoTutorial: String,     // URL to YouTube/external tutorial
  notes: String,             // URL to study notes
  test: String,              // URL for external test (Google Form)
  testType: 'link' | 'custom',
  testCustom: {              // Interactive MCQ quiz
    title: String,
    questions: [{
      question: String,
      options: [String],       // 4 options
      correctOptionIndex: Number
    }]
  },
  homework: String,          // URL for external homework
  homeworkType: 'link' | 'custom',
  homeworkCustom: {          // Interactive homework questions
    title: String,
    questions: [String]
  }
}
```

#### `Task`
```javascript
{
  id: String,
  studentId: String,
  title: String,
  status: String,
  difficulty: String,
  estimatedMinutes: Number,
  createdAt: String,
  type: String,
  description: String,
  points: Number
}
```

#### `BroadcastPrompt`
```javascript
{
  id: String,
  mentorId: String,
  text: String,
  cohort: String,
  createdAt: Date
}
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB Atlas** account (or local MongoDB instance)
- **Firebase** project (for authentication — optional with demo accounts)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/aaryankasaudhan91-dev/Learning-operating-system-LOS-.git
cd Learning-operating-system-LOS-

# 2. Install all dependencies (uses npm workspaces)
npm install

# 3. Configure environment variables (see section below)
# Edit backend/.env with your keys

# 4. Start both frontend & backend concurrently
npm run dev
```

This starts:
- **Frontend** on `http://localhost:5173` (Vite dev server)
- **Backend** on `http://localhost:3000` (Express API server)

### Individual Commands

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# Build frontend for production
cd frontend && npm run build

# Build backend for production
cd backend && npm run build

# Start production backend
cd backend && npm start
```

---

## 🔑 Environment Variables

Create/edit `backend/.env` with the following:

```env
# Required — MongoDB connection string
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>"

# Required — Google Gemini API Key (used for SOS Chat Agent + AI SDK init)
GEMINI_API_KEY="your-gemini-api-key"

# Optional — OpenAI API Key (Focus Agent + Task Hint Agent)
# Falls back to mock responses if empty
OPENAI_API_KEY="your-openai-api-key"

# Optional — NVIDIA API Key (Insights Agent)
# Falls back to mock responses if empty
NVIDIA_API_KEY="your-nvidia-api-key"

# Optional — Anthropic/Claude API Key (Intervention Agent + Task Generator Agent)
# Falls back to mock responses if empty
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

> **Note:** All AI agents have intelligent mock fallback responses built in. The application runs fully functional with zero API keys configured — perfect for development and demos.

---

## 👤 Demo Accounts

The login page provides instant-access demo accounts that bypass Firebase authentication entirely:

| Account Type | Name | Description |
|---|---|---|
| **Demo Student** | Arjun Patel | Pre-configured student account with sample cognitive data, courses, and tasks |
| **Demo Mentor** | Dr. Kavita Sharma | Pre-configured mentor account with mock student cohort and full course management |

These demo accounts persist session data in `localStorage` and provide full access to all features without requiring any Firebase setup or real API keys.

---

## 🖼 Screenshots & Views

### Landing Page
Scrollytelling experience with 4 phases (Cognitive Crisis → Dynamic Calibration → Synapse Loop → Peak Flow), each morphing a neural network canvas visualization in real time.

### Course Hub (Student)
Browse courses by class level and subject, drill into modules and lessons, watch embedded videos, take interactive tests, and submit homework — all without leaving the app.

### Course Hub (Mentor)
Create courses/modules/lessons with instructional flow templates, manage individual students, quick-assign lessons with custom tests and homework, and leverage AI to auto-generate quiz questions.

### Cognitive Map
Real-time dashboard with a circular cognitive load gauge, task checklist with drag-to-complete, daily focus milestones, peer badges, and achievement gallery.

### Focus Chamber
Minimal distraction study environment with Pomodoro-style timer, AI-generated content (text/audio/visual modes), real-world analogies, and complexity step-down explanations.

### SOS Toolkit
Emergency mental health panel with animated box-breathing exercise, grounding techniques, and a streaming AI therapist (Gemini-powered) that responds with empathetic, calming guidance.

### Seat Matrix (Insights Hub)
Color-coded heatmap grid showing all students in a mentor's class. Red = high cognitive friction. Click any student to trigger an AI-powered intervention suggestion.

### Help Center
System diagnostics dashboard, interactive FAQ, embedded support chatbot with quick-reply chips, and a support ticket submission form.

---

## 🗺 Roadmap

- [ ] WebSocket real-time cognitive load sync between students and mentors
- [ ] Spaced repetition engine with memory decay timers
- [ ] PDF report generation for student progress
- [ ] Mobile-native app (React Native)
- [ ] Voice-controlled Focus Chamber commands
- [ ] LMS integration (Google Classroom, Canvas)
- [ ] Multi-language support (Hindi, Spanish, French)
- [ ] Advanced analytics dashboard with historical trend graphs

---

## 📄 License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with 🧠 by the LOS Development Team</strong><br/>
  <em>Designed to close the effectiveness gap in education.</em>
</p>
