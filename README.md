# 🌌 Axona™ — Cognitive Flow & Intelligent Study Operating System

> **A futuristic, full-stack cognitive study ecosystem built for students who demand deep focus, algorithmic curriculum tracking, and spatial ambient immersion.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-axona--as.vercel.app-6366f1?style=for-the-badge&logo=vercel)](https://axona-as.vercel.app)
[![Hack Club](https://img.shields.io/badge/Hack%20Club-Stardance%202026-ec3750?style=for-the-badge)](https://hackclub.com)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20Three.js%20%7C%20Firebase-0ea5e9?style=for-the-badge)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## 🌟 Vision & Background

Most student productivity apps are either glorified to-do lists or clunky stopwatches. **Axona™** re-engineers how learners interface with their workload by merging **neuroscience-backed focus strategies**, **Three.js spatial visual environments**, **adaptive spaced repetition**, and **AI-driven academic mentorship** into a unified, cybernetic operating system.

Originally envisioned and created by **Abhranil** as an ad-free, hyper-focused learning platform submitted for the **Hack Club Stardance 2026** challenge.

---

## 🚀 Deep-Dive Feature Architecture

### 1. ⚡ Neural Dashboard & Command Center
- **Cognitive Vital Signs**: Real-time study streak calculation, current XP, focus tier levels, and daily hour tracking.
- **Syllabus Synergy Radar**: Live overview of whole-curriculum completion rates categorized by subject difficulty.
- **Contextual Shortcuts**: Single-click access to resume unfinished modules, active timers, or recent notes.
- **Dynamic 3D Particle Matrix**: Lightweight interactive Three.js particle canvas that responds dynamically without cluttering screen real estate or slowing down low-spec machines.

### 2. ⏱️ Neural Focus Timer & Flow Engine
- **Custom Chrono Modes**: Deep Work (50/10), Classic Pomodoro (25/5), and Flow State (infinite count-up with session markers).
- **Session Telemetry**: Automatically measures active focus intervals, logs micro-breaks, and syncs timestamps to your cloud study profile.
- **Audio Stems & Immersion**: Integrated audio cues engineered to signal phase transitions without jarring alarms.

### 3. 🗺️ Syllabus Synergy & Curriculum Tracker
- **Hierarchical Topic Decomposition**: Tracks complex subjects down to chapter, sub-topic, and concept mastery levels.
- **Confidence Rating System**: Rank topics from *Critical / Unexplored* to *Mastered* to dynamically recalculate your overall readiness score.
- **Progress Telemetry**: Visual percentage meters, completion rings, and subject-specific workload projections.

### 4. 🧠 AI Mentor & Cognitive Assistant
- **Context-Aware Study Coaching**: Powered by generative AI (Google Gemini / OpenAI), the mentor analyzes your specific weak topics and suggests actionable learning breakdowns.
- **Active Recall Query Generator**: Generates targeted flash questions directly derived from your current syllabus modules.
- **Motivation & Accountability**: Real-time conversational guidance to break through procrastination hurdles and study burnout.

### 5. 🪐 Constellation — Interactive Concept Knowledge Graph
- **3D Node Mapping**: Explores dependencies between syllabus topics in a spatial node network.
- **Visual Prerequisite Trees**: Understand what foundational concepts need reinforcement before advancing to higher-order chapters.

### 6. 🎧 Spatial Audio Mixer & Ambient Soundscapes
- **Custom Sound Engine**: Multi-layer ambient audio synthesizer designed to induce alpha/theta brainwave focus.
- **Layered Channels**: Blend binaural beats, deep space cosmic frequency, rainfall, and white noise with independent volume sliders.

### 7. 🎯 Diagnostic Weak-Area Hunter & Revision Hub
- **Automated Deficit Detection**: Flags topics with low confidence scores or prolonged intervals since last review.
- **Ebbinghaus Spaced Repetition**: Algorithmically schedules revision prompts at 1-day, 3-day, 7-day, and 21-day milestones to combat the cognitive forgetting curve.

### 8. 📖 Cloud Study Diary & Retrospective Journal
- **Daily Reflection Logging**: Record daily takeaways, emotional states, energy levels, and breakthroughs.
- **Session History & Analytics**: Full historical log of completed focus blocks queryable by date, topic, or duration.

### 9. 🏆 Global Leaderboard & Gamification Ecosystem
- **XP & Level Scaling**: Earn experience points for active focus minutes, completing revision modules, and maintaining daily consistency.
- **Community Ranks**: Compare weekly productive output with fellow students worldwide to foster positive accountability.

### 10. 🔒 Privacy & Cloud Synchronization
- **Firebase Auth & Firestore**: Cloud backup for personal notes, syllabus progress, and study statistics across all your devices.
- **100% Ad-Free Guarantee**: Completely stripped of all third-party tracking scripts, popups, and advertisement networks for a clean, privacy-respecting experience.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18 with TypeScript |
| **Build Tooling & HMR** | Vite 5 (ultra-fast compilation and ESM bundling) |
| **Styling & Design System** | Styled-Components, Framer Motion, Tailwind CSS, Custom Glassmorphism CSS |
| **3D Graphics & Shaders** | Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`) |
| **Cloud & Backend Services**| Firebase Authentication, Cloud Firestore Realtime Database |
| **Artificial Intelligence** | Google Generative AI (`@google/generative-ai`), OpenAI SDK |
| **Audio Processing** | Web Audio API custom multi-track ambient mixer |
| **Deployment & Hosting** | Vercel Serverless Edge CDN |

---

## 📂 Project Structure

```
Axona/
├── public/                 # Static assets, logos, and PWA manifests
├── src/
│   ├── components/         # Reusable UI & spatial graphics modules
│   │   ├── Header.tsx      # Top navigation with profile status & quick controls
│   │   ├── Sidebar.tsx     # Collapsible navigation drawer
│   │   ├── ThreeCanvas.tsx # Three.js ambient background matrix
│   │   ├── SpatialAudioMixer.tsx # Ambient audio controller
│   │   └── SetupOverlay.tsx # Interactive onboarding walkthrough
│   ├── context/
│   │   └── AuthContext.tsx # Firebase authentication provider & session state
│   ├── data/
│   │   └── syllabusData.ts # Default curriculum templates & topic trees
│   ├── pages/
│   │   ├── Dashboard.tsx   # Core HUD, statistics, and quick-launch widgets
│   │   ├── Timer.tsx       # Focus stopwatch and Pomodoro flow engine
│   │   ├── Tracker.tsx     # Detailed syllabus mastery matrix
│   │   ├── Chat.tsx        # Direct conversational interface with AI Mentor
│   │   ├── Mentor.tsx      # Structured study recommendations & AI planning
│   │   ├── Constellation.tsx # 3D interactive topic graph
│   │   ├── Revision.tsx    # Spaced repetition scheduler & flash recall
│   │   ├── WeakArea.tsx    # Targeted diagnostic for struggling topics
│   │   ├── Diary.tsx       # Cloud retrospective journal
│   │   ├── Leaderboard.tsx # Gamified student XP rankings
│   │   └── Landing.tsx     # High-aesthetic entrance portal
│   ├── services/
│   │   ├── firebase.ts     # Firebase initialization & Firestore operations
│   │   └── openai.ts       # AI service integrations
│   ├── App.tsx             # Route architecture & global theme provider
│   ├── main.tsx            # Application entrypoint
│   └── index.css           # Global CSS variables, fonts, and keyframes
├── package.json            # Dependencies and scripts (named: axona)
├── vite.config.ts          # Vite build optimizations
└── README.md               # Project documentation
```

---

## ⚡ Local Development Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm**, **yarn**, or **pnpm**
- A **Firebase project** (for cloud database and user authentication)

### 1. Clone the Repository
```bash
git clone https://github.com/ArduinoAbhra7/Axona.git
cd Axona
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 5. Build for Production
```bash
npm run build
```
The optimized bundle will be compiled into the `dist/` folder.

---

## 🏆 Hack Club Stardance 2026 Submission

This project is tailored specifically for the **Hack Club Stardance** initiative:
- **Zero Ads Policy**: Complete removal of all external advertising networks (AdSense, Adsterra scripts, banners) ensuring maximum privacy and distraction-free learning.
- **Genuine Utility**: Engineered from the ground up to solve real student productivity and cognitive fragmentation problems.
- **Live Deployment**: Continuously deployed on Vercel at [https://axona-as.vercel.app](https://axona-as.vercel.app).
- **Time Tracked**: Built with active development sessions verified through Hackatime.

---

## 👨‍💻 Author & Attribution

**Designed & Developed by Abhranil**  
- **GitHub**: [@ArduinoAbhra7](https://github.com/ArduinoAbhra7)  
- **Contact Email**: [senabhranil7@gmail.com](mailto:senabhranil7@gmail.com)  
- **Instagram**: [@abhrax7](https://instagram.com/abhrax7)  
- **Live Project**: [axona-as.vercel.app](https://axona-as.vercel.app)

---

## 📄 License

This project is open-source under the [MIT License](LICENSE). Feel free to inspect the source code, fork, and build upon it!
