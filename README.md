# FocusFlow

**An interactive study‑tracker web app built with React, TypeScript, Vite, and Firebase**

## Overview
FocusFlow lets students visualise their syllabus progress, set timers, track weak areas, and chat with an AI mentor. The UI is fully responsive and includes a custom 3‑D particle matrix background. All ad‑related code (Google AdSense, Adsterra, and the `AdBanner` component) has been removed for a clean Hack Club **Stardance** submission.

## Features
- Dashboard with responsive grid showing stats, quick actions and syllabus progress
- Real‑time chat with an OpenAI‑powered mentor (`src/pages/Chat.tsx`)
- Timer & tracker for focused study sessions
- Firebase authentication & Firestore storage of user data
- 3‑D visual effects via Three.js (`ThreeCanvas.tsx`)
- Fully deployed on Vercel (`https://axona-as.vercel.app`)

## Getting Started
```bash
# Clone the repo (once it exists on GitHub)
git clone https://github.com/YourUser/FocusFlow.git
cd FocusFlow

# Install dependencies (uv/pnpm works as well)
npm install

# Run locally
npm run dev
```

## Deployment
The app is set up for **Vercel**. After pushing to the `main` branch, Vercel will automatically build and deploy:
```bash
npm run build   # creates the production bundle in ./dist
vercel --prod   # if you have the Vercel CLI installed
```

## Hack Club Stardance Submission Checklist
- ✅ **Ad‑free** – all ad scripts and components removed
- ✅ **Public repo** – code is open‑source on GitHub
- ✅ **Deployed URL** – https://axona-as.vercel.app
- ✅ **Credit** – “Made by **Abhranil**” is displayed on the splash screen and in the footer
- ✅ **Time tracking** – use Hackatime to log development hours (minimum 30 h for a certificate)

## Credits
Made by **Abhranil** (senabhranil7@gmail.com). Special thanks to the Hack Club community for inspiration and guidance.

## License
MIT – feel free to fork and improve!
