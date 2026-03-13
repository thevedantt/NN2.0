<p align="center">
  <img src="public/nn.png" alt="NeuroNet Logo" width="100" />
</p>

<h1 align="center">🧠 NeuroNet — AI-Powered Mental Wellness Ecosystem</h1>

<p align="center">
  <em>Mental Wellness, Reimagined for Real Life.</em>
</p>

<p align="center">
  <strong>A full-stack mental health platform that combines AI companionship, peer support, professional therapy, and gamified engagement — designed for individuals across the entire severity spectrum, from everyday stress to clinical-level crisis.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-4285F4?logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/NeonDB-Serverless-00E699?logo=neon" alt="NeonDB" />
  <img src="https://img.shields.io/badge/Firebase-Realtime-FFCA28?logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/Three.js-3D_Pet-000000?logo=three.js" alt="Three.js" />
</p>

---

## 📑 Table of Contents

- [🌟 Vision & Problem Statement](#-vision--problem-statement)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🗄️ Database Schema](#️-database-schema)
- [🔌 API Routes](#-api-routes)
- [⚙️ Environment Configuration](#️-environment-configuration)
- [🚀 Getting Started](#-getting-started)
- [📊 Business Model](#-business-model)


## 🌟 Vision & Problem Statement

### The Problem
India has **200 million+ people** suffering from mental health conditions, yet less than **20%** receive any care. The barriers are:
- **Stigma** — People avoid seeking help due to social judgment
- **Accessibility** — Licensed therapists are concentrated in metros; rural areas have near-zero access
- **Affordability** — Therapy costs ₹1,500–₹5,000/session, unaffordable for most
- **Awareness** — Most people can't identify mental health symptoms early
- **Fragmentation** — Chat apps, therapy platforms, and community support exist in silos

### The NeuroNet Solution
NeuroNet is a **single, unified platform** that caters to individuals across the **entire mental health severity spectrum**:

| Severity Level | NeuroNet Feature |
|---|---|
| **No concerns** — Wellness maintenance | NeuroPet, Trivia, YouTube Feed, Breathing exercises |
| **Mild** — Everyday stress, low mood | AI Companion Chat, Mood Tracking, Journaling, Offline Tools |
| **Moderate** — Persistent anxiety/depression | Self-Assessments (PHQ-9/GAD-7), Community Groups, Buddy System |
| **High** — Clinical-level symptoms | Doctor Discovery, Appointment Booking, Therapist Video Sessions |
| **Crisis** — Suicidal ideation, self-harm | Real-Time Crisis Detection, Auto-Redirect to Calming Content, Emergency Contacts |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Next.js 16 + React 19)          │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ │
│  │ Landing  │ │Dashboard │ │ Chat AI  │ │ NeuroPet │ │Therapist  │ │
│  │  Page    │ │  (User)  │ │Companion │ │  3D Pet  │ │  Portal   │ │
│  └─────────┘ └──────────┘ └──────────┘ └──────────┘ └───────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │Assessment│ │  Groups  │ │  Buddy   │ │   AVC    │              │
│  │(PHQ/GAD) │ │(Firebase)│ │  System  │ │ Coaching │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
├─────────────────────────────────────────────────────────────────────┤
│                         MIDDLEWARE (JWT + RBAC)                     │
│            Role Guards: User | Therapist | Buddy                    │
├─────────────────────────────────────────────────────────────────────┤
│                          API LAYER (Next.js Route Handlers)         │
│  /api/chat  /api/auth  /api/profile  /api/appointments             │
│  /api/neuropet/chat  /api/avc/session  /api/youtube/feed           │
│  /api/therapist/onboarding  /api/doctors  /api/seed                │
├──────────────────────────┬──────────────────────────────────────────┤
│     AI / ML ENGINE       │           DATA LAYER                     │
│  ┌─────────────────┐     │  ┌─────────────┐  ┌──────────────┐      │
│  │  Google Gemini   │     │  │  NeonDB     │  │  Firebase    │      │
│  │  (Chat + Insight │     │  │  (Postgres) │  │  (Firestore) │      │
│  │   + Summarize)   │     │  │  Drizzle ORM│  │  Groups/Chat │      │
│  └─────────────────┘     │  └─────────────┘  └──────────────┘      │
│  ┌─────────────────┐     │  ┌──────────────────────────────┐       │
│  │  MediaPipe       │     │  │  Zustand (Client State)      │       │
│  │  (Face Detection)│     │  │  Local Storage (Offline)     │       │
│  └─────────────────┘     │  └──────────────────────────────┘       │
├──────────────────────────┴──────────────────────────────────────────┤
│                     CRISIS DETECTION PIPELINE                       │
│  User Message → Keyword Scan (EN/HI) → Risk Assessment             │
│                → High Risk? → Supportive Alert → Auto-Redirect      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16.1 (App Router) | Full-stack React with SSR, API routes, middleware |
| **UI Library** | React 19.2 | Component rendering |
| **Language** | TypeScript 5 | Type safety across the codebase |
| **Styling** | Tailwind CSS 4 + Radix UI | Utility-first CSS + Accessible component primitives |
| **AI Engine** | Google Gemini (`@google/genai`) | AI chat companion, insight engine, summarization |
| **Database** | NeonDB (Serverless Postgres) | Users, profiles, sessions, messages, assessments |
| **ORM** | Drizzle ORM | Type-safe SQL queries |
| **Realtime DB** | Firebase Firestore | Community groups, member management, real-time chat |
| **Authentication** | Custom JWT (jose + bcryptjs) | Secure token-based auth with HTTP-only cookies |
| **3D Rendering** | Three.js + React Three Fiber + Drei | Interactive 3D NeuroPet companion |
| **Face Detection** | MediaPipe (Google) | Real-time face tracking in AVC coaching |
| **Speech** | Web Speech API (SpeechRecognition + SpeechSynthesis) | Voice input in chat, NeuroPet conversations, AVC analysis |
| **Animations** | Framer Motion | Page transitions and micro-interactions |
| **Charts** | Recharts | Mood charts, therapist analytics |
| **State Management** | Zustand | Client-side state (NeuroPet progression) |
| **Notifications** | Sonner | Toast-based notification system |
| **Date Utilities** | date-fns | Date formatting and manipulation |
| **Font** | Poppins (Google Fonts) | Clean, modern typography across all pages |


NeuroNet continues to work **without internet** via a comprehensive offline toolkit.

- **Offline Detection** — Automatic via `navigator.onLine` + manual toggle in sidebar
- **Online/Offline Toggle** — Tab switch in sidebar with visual state changes
- **Feature Locking** — Online-only features (AI Chat, Assessment, Groups, Appointments) are greyed out with lock icons
- **Offline Tools Available:**
  - 🌬️ **Breathing Exercises** (`/offline/breathing`) — Guided breathing patterns
  - 📊 **Mood Logger** (`/offline/mood`) — Track emotions locally
  - 🎮 **Calming Games** (`/offline/games`) — Distraction-based activities
  - 📝 **Journaling** (`/offline/journal`) — Private journaling with localStorage
  - 💡 **Wellness Tips** (`/offline/tips`) — Pre-loaded mental health tips
  - 📞 **Emergency Help** (`/offline/help`) — Crisis helpline numbers (no internet needed)
- **Offline AI Chat** — When offline, chat returns keyword-matched responses from a pre-built dataset (`offline-dataset.ts` with 22KB of multilingual responses)
- **Data Sync** — Mock sync mechanism re-uploads journal entries and mood logs when back online
- **Offline Landing Page** — Clean UI explaining available tools when dashboard detects offline state

-

## 📁 Project Structure

```
NN2.0/
├── app/
│   ├── api/                          # Next.js API Route Handlers
│   │   ├── appointments/             # CRUD for appointments
│   │   ├── auth/                     # Login, Register, Me
│   │   ├── avc/session/              # AVC coaching AI feedback
│   │   ├── chat/                     # AI chat + summarization
│   │   ├── doctors/                  # Doctor listing
│   │   ├── neuropet/chat/            # NeuroPet voice chat AI
│   │   ├── profile/                  # User profile CRUD
│   │   ├── seed/                     # Database seeding
│   │   ├── therapist/onboarding/     # Therapist profile setup
│   │   └── youtube/feed/             # YouTube API integration
│   ├── appointments/                 # Appointment management pages
│   ├── assessment/                   # PHQ-9 & GAD-7 self-assessments
│   ├── auth/                         # Login & Register pages
│   ├── avc/                          # Adaptive Video Coaching
│   │   ├── practice/                 # Recording sessions
│   │   └── report/                   # Post-session reports
│   ├── buddy/                        # Buddy system portal
│   │   ├── chat/                     # Buddy messaging
│   │   ├── connections/              # Connection management
│   │   ├── dashboard/                # Buddy dashboard
│   │   ├── profile/                  # Buddy profile
│   │   ├── requests/                 # Match requests
│   │   ├── sessions/                 # Session history
│   │   └── training/                 # Training modules
│   ├── chat-ai/                      # AI Companion chat page
│   ├── dashboard/                    # User dashboard
│   ├── doctors/                      # Doctor discovery
│   ├── groups/                       # Community support groups
│   │   └── [id]/                     # Individual group chat
│   ├── neuropet/                     # 3D NeuroPet page
│   ├── offline/                      # Offline wellness tools
│   │   ├── breathing/                # Breathing exercises
│   │   ├── games/                    # Calming games
│   │   ├── help/                     # Emergency contacts
│   │   ├── journal/                  # Private journaling
│   │   ├── mood/                     # Mood logger
│   │   └── tips/                     # Wellness tips
│   ├── profile/                      # User profile editor
│   ├── settings/                     # Language settings
│   ├── therapist/                    # Therapist portal
│   │   ├── dashboard/                # Therapist dashboard
│   │   ├── onboarding/               # Professional setup
│   │   ├── patients/                 # Patient management
│   │   ├── profile/                  # Therapist profile
│   │   ├── schedule/                 # Schedule management
│   │   └── video-sessions/           # Video session interface
│   ├── youtube-feed/                 # Curated content page
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout with providers
│   └── page.tsx                      # Landing page
├── components/
│   ├── assessment/                   # Assessment components
│   ├── chat/                         # Chat input components
│   ├── dashboard/                    # Dashboard widgets
│   ├── doctors/                      # Doctor card components
│   ├── neuropet/                     # NeuroPet components (9 files)
│   ├── profile/                      # Profile editor components
│   ├── ui/                           # shadcn/ui component library (25+ files)
│   ├── app-sidebar.tsx               # Main user sidebar navigation
│   ├── buddy-sidebar.tsx             # Buddy sidebar navigation
│   ├── therapist-sidebar.tsx         # Therapist sidebar navigation
│   ├── DoctorModel.tsx               # 3D doctor model
│   ├── language-toggle.tsx           # Language switcher
│   ├── mode-toggle.tsx               # Theme toggle
│   ├── offline-landing.tsx           # Offline state UI
│   ├── theme-provider.tsx            # Theme context
│   └── trivia-card.tsx               # Daily trivia widget
├── config/
│   ├── db.ts                         # NeonDB + Drizzle connection
│   └── schema.ts                     # Complete database schema
├── context/
│   ├── AppointmentContext.tsx         # Appointment state
│   ├── LanguageContext.tsx            # i18n context
│   └── OfflineContext.tsx             # Offline detection context
├── data/
│   ├── crisis_keywords.json          # Crisis detection keywords (EN/HI)
│   ├── doctors.ts                    # Doctor profiles data
│   ├── offline-dataset.ts            # 22KB offline response dataset
│   └── translations.ts              # 29KB translation strings
├── hooks/
│   ├── use-mobile.ts                 # Mobile detection hook
│   └── useSpeechToText.ts            # Speech recognition hook
├── lib/
│   ├── avc/                          # AVC coaching logic
│   │   ├── ai-service.ts             # AI feedback service
│   │   ├── analysis.ts               # Speech + Face analysis hooks
│   │   └── scenarios.ts              # Practice scenario definitions
│   ├── gemini/                       # Gemini AI integration
│   │   ├── client.ts                 # Gemini model client
│   │   ├── context.ts                # Chat context builder
│   │   └── prompts.ts                # All AI system prompts
│   ├── neuropet/                     # NeuroPet logic
│   │   ├── data/emotionMap.ts        # Animation → Emotion mapping
│   │   └── store/
│   │       ├── petStore.ts           # XP, leveling, growth stages (Zustand)
│   │       └── voiceStore.ts         # Voice conversation state
│   ├── speech/                       # Speech engine wrappers
│   │   ├── browserEngine.ts          # Browser speech API
│   │   └── speechEngine.ts           # Abstract speech engine
│   ├── auth.ts                       # Auth utility functions
│   ├── crisis.ts                     # Crisis detection algorithm
│   ├── firebase.ts                   # Firebase config
│   ├── offline-support.ts            # Offline response matcher
│   ├── trivia.ts                     # Interest-based trivia engine
│   └── utils.ts                      # General utilities
├── public/
│   ├── models/                       # 3D model files (GLB/GLTF)
│   ├── neuropet/                     # NeuroPet assets (voices, images)
│   ├── nn.png                        # NeuroNet logo
│   └── thp*.jpg                      # Therapist profile images
├── scripts/
│   └── seed.ts                       # Database seeding script
├── types/
│   └── speech-recognition.d.ts       # TypeScript type declarations
├── middleware.ts                      # JWT + RBAC middleware
├── drizzle.config.ts                  # Drizzle ORM configuration
├── package.json                       # Dependencies & scripts
├── tsconfig.json                      # TypeScript configuration
└── next.config.ts                     # Next.js configuration
```

---

## 🗄️ Database Schema

Built on **NeonDB (Serverless Postgres)** using **Drizzle ORM**.

```
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────────┐
│     users        │     │  therapist_profiles  │     │    user_profiles     │
├─────────────────┤     ├─────────────────────┤     ├──────────────────────┤
│ id (UUID, PK)   │◄────│ userId (FK)         │     │ userId (VARCHAR)     │
│ email           │     │ fullName            │     │ gender               │
│ passwordHash    │     │ mobileNumber        │     │ preferredLanguage    │
│ role            │     │ licenseNumber       │     │ primaryConcern       │
│ isOnboarding    │     │ specializations[]   │     │ therapyPreference    │
│   Complete      │     │ perSessionFee       │     │ previousExperience   │
│ createdAt       │     │ preferredSession    │     │ sleepPattern         │
└─────────────────┘     │   Type              │     │ supportSystem        │
                        │ isVerified          │     │ stressLevel          │
                        └─────────────────────┘     │ socialPlatforms[]    │
                                                    │ socialPreferences{}  │
┌─────────────────┐                                 │ hobbies[]           │
│     doctors      │                                 │ musicDetails{}      │
├─────────────────┤     ┌─────────────────────┐     │ entertainment{}     │
│ doctorId (PK)   │     │    appointments      │     │ inputMetadata{}     │
│ doctorData{}    │     ├─────────────────────┤     └──────────────────────┘
│ isActive        │     │ appointmentId (PK)  │
│ createdAt       │     │ userId              │
└─────────────────┘     │ doctorId            │
                        │ doctorSnapshot{}    │     ┌──────────────────────┐
                        │ appointmentDate     │     │  ai_chat_sessions    │
                        │ appointmentTime     │     ├──────────────────────┤
                        │ sessionType         │     │ sessionId (PK)      │
                        │ price               │     │ userId              │
                        │ status              │     │ language            │
                        └─────────────────────┘     │ startedAt / endedAt │
                                                    │ summary             │
┌─────────────────────┐                             └──────────────────────┘
│  ai_chat_messages    │                                       │
├─────────────────────┤                                        │
│ messageId (PK)      │     ┌──────────────────────┐          │
│ sessionId (FK) ─────│─────│  ai_chat_insights    │──────────┘
│ sender (user|ai)    │     ├──────────────────────┤
│ messageText         │     │ insightId (PK)       │
│ createdAt           │     │ sessionId (FK)       │
└─────────────────────┘     │ currentTopic         │
                            │ emotionalTone{}      │
                            │ suggestionText       │
                            │ language             │
                            └──────────────────────┘
```

---

## 🔌 API Routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Register new user (user/therapist/buddy) |
| `/api/auth/login` | POST | Login, returns JWT + sets HTTP-only cookie |
| `/api/auth/me` | GET | Get current authenticated user |
| `/api/chat` | POST | AI companion chat (Gemini + crisis detection + insights) |
| `/api/chat/summarize` | POST | Generate session summary |
| `/api/profile` | GET/POST | Read/write user profile |
| `/api/doctors` | GET | List all doctors |
| `/api/appointments` | GET | List user's appointments |
| `/api/appointments/create` | POST | Book new appointment |
| `/api/neuropet/chat` | POST | NeuroPet voice conversation (Gemini) |
| `/api/avc/session` | POST | AVC coaching session AI feedback |
| `/api/therapist/onboarding` | POST | Complete therapist profile |
| `/api/youtube/feed` | GET | Fetch YouTube wellness content |
| `/api/seed` | POST | Seed database with initial data |

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
# AI Services
GEMINI_API_KEY=your_gemini_api_key

# Database
DATABASE_URL=your_neon_db_connection_string

# Firebase (for Community Groups)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenRouter (LLM fallback)
OPENROUTER_API_KEY=your_openrouter_key

# YouTube Data API
YOUTUBE_API_KEY=your_youtube_api_key

# Auth
JWT_SECRET=your_secure_jwt_secret
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- NeonDB account (or any Postgres)
- Firebase project
- Google Gemini API key
- YouTube Data API key

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/NeuroNet.git
cd NeuroNet/NN2.0

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your actual keys

# 4. Push database schema
npx drizzle-kit push

# 5. Seed the database (optional)
# Visit http://localhost:3000/api/seed in browser after starting

# 6. Start development server
npm run dev
```

The app will be running at **http://localhost:3000**

### Demo Credentials
Register new accounts or use the seeded data for different roles:
- **User:** Register with any email at `/auth/register`
- **Therapist:** Register with role "therapist" and complete onboarding


## 📊 Business Model

NeuroNet operates on a **sustainable, ethical SaaS model**:

| Tier | Features | Price |
|---|---|---|
| **Free** | AI Companion, NeuroPet, Offline Tools, Community Groups, Self-Assessments | ₹0 |
| **Pay-Per-Session** | Professional therapy sessions | ₹500–₹2,000/session |
| **Organization Plan** | White-labeled access for companies/schools | Custom pricing |
| **NGO-Sponsored** | Subsidized access for underserved communities | Sponsored |
<<<<<<< HEAD
=======

>>>>>>> fd966d8d376ffb3ab821bddfa0cd217ede6e3dcf
