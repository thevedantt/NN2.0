# 🧠 NeuroNet — AI-Powered Mental Wellness Platform

![NeuroNet Banner](https://img.shields.io/badge/Status-Active_Development-success?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

**NeuroNet** is a next-generation **AI-powered mental wellness SaaS platform** designed to bridge the gap between **AI companionship, peer support, and professional therapy**.

Built for real life, NeuroNet provides a **safe, accessible, and judgment-free space** where individuals can understand their mental health, receive emotional support, and connect with the right kind of help — at their own pace.

<div align="center">
  <img src="/public/nn.png" alt="NeuroNet Logo" width="200" style="border-radius: 20px; margin: 20px 0;" />
</div>

---

## 🌟 Why NeuroNet?

Mental health support today is often:
- 🚫 Hard to access
- 💸 Expensive
- 🤐 Stigmatized
- 🤯 Overwhelming

**NeuroNet changes that** by combining:
- ✅ **Always-available AI support**
- ✅ **Human connection** through trained peers
- ✅ **Verified professional therapy**
- ✅ **Ethical, privacy-first design**

All within a single, unified platform.

---

## 🚀 Core Features

### 🧠 AI Companion (Neura)
- **24/7 empathetic AI companion** for emotional support.
- Powered by **Google Gemini / OpenRouter**.
- **Context-aware responses** with safety-first design.
- Supports **English & Hindi** language switching.
- Real-time emotional insights and chat summaries.

### 🤝 Peer Support (Buddies)
- Connect with trained **peer buddies**.
- **Interest-based matching** (hobbies, preferences).
- Safe text & session-based conversations.
- Companion-style support (non-clinical).

### 🩺 Professional Therapy
- Verified therapist onboarding & profiles.
- Transparent **per-session pricing**.
- Video & chat-based consultations.
- Therapist dashboards with upcoming sessions & patients.
- Ethical data sharing with user consent.

### 📊 Mental Health Self-Assessments
- Integrated **PHQ-9** and **GAD-7** tools.
- Clear, non-diagnostic insights.
- Progress tracking over time.
- Built-in disclaimers for responsible use.

### 👥 Community Groups
- Topic-based support groups.
- Moderated, safe discussions.
- Community-driven healing spaces.

### 🎥 Personalized Content Feed
- Curated YouTube content for:
  - 😂 Comedy & positivity
  - 🎵 Comfort music
  - 🌿 Spiritual & calming videos
- Auto-play calming content during high-stress moments.
- Optional therapist booking from content feed.

---

## 🧩 Platform Highlights

- 🌐 **Multi-language support** (English / Hindi)
- 🌗 **Light & Dark theme toggle**
- 🔐 **JWT-based role authentication** (User / Therapist / Buddy)
- 🧠 **Crisis keyword detection** with safe redirection flows
- 🎮 **Gamified streaks** & progress indicators
- 🧱 **Modular, scalable SaaS architecture**

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: ShadCN UI (Radix Primitives)
- **3D Graphics**: React Three Fiber

### Backend & Data
- **Database**: PostgreSQL ([Neon](https://neon.tech/))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: JWT (Jose) + Firebase
- **APIs**: REST + WebSocket ready

### AI & Intelligence
- **AI Models**: Google Generative AI / OpenRouter
- **Use Cases**: Conversational support, Emotional insight calculation, Chat summarization, Crisis detection.

---

## 🏁 Getting Started

### ✅ Prerequisites
- Node.js 18+
- Neon PostgreSQL database
- Google Gemini or OpenRouter API key
- Firebase project credentials

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/neuronet.git
   cd neuronet
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   # Database (Neon / PostgreSQL)
   DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neuranet?sslmode=require"

   # AI Providers
   GEMINI_API_KEY="your_google_ai_key"
   OPENROUTER_API_KEY="your_openrouter_key"

   # App Configuration
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   JWT_SECRET="your_secure_jwt_secret"

   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_bucket.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
   ```

4. **Database Migration**
   ```bash
   npx drizzle-kit push
   ```
   *(Optional: Seed demo data)*
   ```bash
   npx tsx scripts/seed.ts
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open 👉 [http://localhost:3000](http://localhost:3000)

---

## � Deployment

NeuroNet is optimized for **Vercel** deployment.

1. Push code to **GitHub / GitLab**.
2. Import the project into **Vercel**.
3. Add **environment variables** in Vercel dashboard.
4. **Deploy** 🚀

---

## 🤝 NGOs & Community Partnerships

NeuroNet is designed to work with:
- 🏫 **NGOs**
- 🎓 **Educational institutions**
- 🏡 **Community mental health initiatives**

**Partnership options include:**
- Sponsored therapy sessions
- Community wellness programs
- White-labeled access
- Privacy-safe impact reporting

---

## 🛡️ Ethical & Safety Commitment

- 🛑 **No medical diagnosis by AI**
- ⚠️ **Clear disclaimers** for assessments
- 🔒 **Consent-based data sharing**
- 🚨 **Crisis-safe redirection flows**
- 🧑‍🤝‍🧑 **Human-in-the-loop design**

---

## � License

This project is proprietary software. All rights reserved.

© 2025 **NeuroNet**
