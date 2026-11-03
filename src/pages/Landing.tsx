import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════════════
   AXONA — Premium Landing Page
   Styled-components + Framer Motion (matching the app's design system)
   ═══════════════════════════════════════════════════════════════════════ */

// ── Scroll-Triggered Animation Variants ─────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

// ── Keyframe Animations ─────────────────────────────────────────────
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const glowPulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const orbFloat = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -20px) scale(1.05); }
  50% { transform: translate(-10px, -40px) scale(0.95); }
  75% { transform: translate(-30px, -10px) scale(1.02); }
`;

const gridGlow = keyframes`
  0%, 100% { opacity: 0.02; }
  50% { opacity: 0.04; }
`;

// ── Page Container with Grid Background ──────────────────────────────
const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #020617;
  color: #ffffff;
  font-family: 'Inter', 'Outfit', -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
  pointer-events: auto;

  /* ── Global Mesh Grid Overlay ─────────────────────────────────────── */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(circle at 50% 50%, black 40%, transparent 85%);
    z-index: 0;
    animation: ${gridGlow} 8s ease-in-out infinite;
  }
`;

// ── Ambient Background Orbs ─────────────────────────────────────────
const AmbientOrb = styled(motion.div)<{ color: string; size: string; top: string; left: string; delay: string }>`
  position: fixed;
  width: ${p => p.size};
  height: ${p => p.size};
  top: ${p => p.top};
  left: ${p => p.left};
  border-radius: 50%;
  background: ${p => p.color};
  filter: blur(100px);
  opacity: 0.3;
  animation: ${orbFloat} 12s ease-in-out ${p => p.delay} infinite;
  pointer-events: none;
  z-index: 0;
`;

// ── Sticky Glassmorphic Navigation Bar ──────────────────────────────
const Nav = styled.header`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  position: sticky;
  top: 0;
  backdrop-filter: var(--glass-blur);
  background: rgba(2, 6, 23, 0.7);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0 0 20px 20px;
`;

const LogoText = styled.a`
  font-family: 'Outfit', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  text-decoration: none;
  background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: #ffffff;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #2dd4bf, #38bdf8);
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
`;

const GetStartedBtn = styled.a`
  padding: 0.65rem 1.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: 999px;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.3px;

  &:hover {
    background: #2dd4bf;
    border-color: #2dd4bf;
    box-shadow: 0 0 30px rgba(45, 212, 191, 0.4);
    transform: translateY(-2px);
  }
`;

// ── Hero Section ────────────────────────────────────────────────────
const HeroSection = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 4rem 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  z-index: 10;
  position: relative;

  @media (max-width: 768px) {
    padding: 2rem 1.25rem 1rem;
  }
`;

const HeroTitle = styled(motion.h1)`
  font-family: 'Outfit', sans-serif;
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1.15;
  text-align: center;
  max-width: 800px;
  background: linear-gradient(135deg, #ffffff 20%, #a5b4fc 60%, #c4b5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1.25rem;
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.05rem;
  color: rgba(221, 205, 255, 0.85);
  max-width: 560px;
  text-align: center;
  line-height: 1.7;
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

// ── Interactive App Simulator (Mockup Window) ────────────────────────
const MockupWindow = styled.div`
  width: 100%;
  max-width: 800px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  margin: 4rem 0;
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  position: relative;
  z-index: 10;
`;

const WindowHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(30, 41, 59, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const WindowControls = styled.div`
  display: flex;
  gap: 8px;
  margin-right: 12px;
`;

const WindowControl = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${p => p.color};
`;

const WindowTitle = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  font-weight: 500;
  flex: 1;
  text-align: center;
`;

const TabBar = styled.div`
  display: flex;
  background: rgba(15, 23, 42, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: 12px 20px;
  background: ${p => p.active ? 'rgba(45, 212, 191, 0.15)' : 'transparent'};
  border: none;
  color: ${p => p.active ? '#c7d2fe' : 'rgba(255, 255, 255, 0.5)'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    color: ${p => p.active ? '#c7d2fe' : 'rgba(255, 255, 255, 0.8)'};
  }

  ${p => p.active && css`
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: #2dd4bf;
    }
  `}
`;

const MockupContent = styled.div`
  padding: 2rem;
  min-height: 300px;
  display: flex;
  flex-direction: column;
`;

// ── Doubt Solver Mock Interface ─────────────────────────────────────
const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(2, 6, 23, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const Message = styled.div<{ isUser?: boolean }>`
  align-self: ${p => p.isUser ? 'flex-end' : 'flex-start'};
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: ${p => p.isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px'};
  background: ${p => p.isUser ? 'rgba(45, 212, 191, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${p => p.isUser ? 'rgba(45, 212, 191, 0.3)' : 'rgba(255, 255, 255, 0.05)'};
  color: #ffffff;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const ResponseBlock = styled.div`
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(45, 212, 191, 0.2);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 0.5rem;

  .formula {
    font-family: 'JetBrains Mono', monospace;
    background: rgba(2, 6, 23, 0.5);
    padding: 0.5rem;
    border-radius: 8px;
    margin: 0.5rem 0;
    text-align: center;
    font-size: 0.9rem;
  }
`;

// ── Syllabus Constellation Mock Interface ───────────────────────────
const ProgressCard = styled.div`
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SubjectHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SubjectIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2dd4bf, #38bdf8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const SubjectInfo = styled.div`
  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }
  p {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
  }
`;

const ProgressBar = styled.div<{ width: number }>`
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${p => p.width}%;
    background: linear-gradient(90deg, #2dd4bf, #38bdf8);
    border-radius: 4px;
    transition: width 2s ease-in-out;
  }
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
`;

// ── Focus Timer Mock Interface ──────────────────────────────────────
const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 2rem;
`;

const TimerRing = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #2dd4bf 0%, #38bdf8 50%, #a5f3fc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 0 30px rgba(45, 212, 191, 0.3);

  &::before {
    content: '';
    position: absolute;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: #020617;
  }
`;

const TimerDisplay = styled.div`
  position: absolute;
  font-family: 'Outfit', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  z-index: 2;
`;

const TimerAura = styled.div`
  position: absolute;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(45, 212, 191, 0.2) 0%, transparent 70%);
  animation: ${glowPulse} 3s ease-in-out infinite;
  z-index: -1;
`;

// ── Interactive Doubt Playground ─────────────────────────────────────
const DoubtPlayground = styled.div`
  width: 100%;
  max-width: 640px;
  margin: 4rem auto;
  z-index: 10;
  position: relative;
`;

const DoubtInput = styled.div`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const DoubtInputField = styled.textarea`
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  padding: 0.5rem 0;
  resize: none;
  min-height: 80px;

  &::placeholder {
    color: rgba(221, 205, 255, 0.35);
  }
`;

const DoubtActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const SuggestionChips = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Chip = styled.button`
  padding: 0.5rem 1rem;
  background: rgba(45, 212, 191, 0.15);
  border: 1px solid rgba(45, 212, 191, 0.3);
  border-radius: 20px;
  color: #c7d2fe;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(45, 212, 191, 0.25);
    transform: translateY(-2px);
  }
`;

const SubmitButton = styled.button`
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 20px rgba(45, 212, 191, 0.4);
  }
`;

const DoubtResponse = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(45, 212, 191, 0.2);

  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #c7d2fe;
  }

  p {
    font-size: 0.95rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.85);
  }
`;

const CTAButton = styled.a`
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 25px rgba(45, 212, 191, 0.5);
  }
`;

// ── Feature Cards with Premium SVG Icons ─────────────────────────────
const CardsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    max-width: 500px;
  }
`;

const FeatureCard = styled(motion.div)<{ accentColor?: string }>`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: 20px;
  padding: 2rem;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      ellipse at 50% 0%,
      ${p => p.accentColor || 'rgba(45, 212, 191, 0.08)'} 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.18);
    transform: translateY(-6px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);

    &::before {
      opacity: 1;
    }
  }
`;

const CardIcon = styled.div`
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  position: relative;

  svg {
    width: 32px;
    height: 32px;
    transition: all 0.3s ease;
  }

  &:hover svg {
    transform: scale(1.1) rotate(5deg);
    filter: drop-shadow(0 0 8px rgba(45, 212, 191, 0.5));
  }
`;

const CardTitle = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: #ffffff;
  margin-bottom: 0.75rem;
`;

const CardDescription = styled.p`
  font-size: 0.88rem;
  color: rgba(221, 205, 255, 0.6);
  line-height: 1.65;
`;

const CardCTA = styled.div<{ color?: string }>`
  font-size: 0.72rem;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-weight: 600;
  color: ${p => p.color || '#2dd4bf'};
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-top: 1.5rem;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${FeatureCard}:hover & {
    transform: translateX(6px);
  }
`;

// ── Premium SVG Icons ────────────────────────────────────────────────
const DoubtSolverIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke="url(#gradient1)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 9H9.01"
      stroke="url(#gradient1)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 9H15.01"
      stroke="url(#gradient1)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 13.5C9.5 13.5 10.5 15.5 12 15.5C13.5 15.5 14.5 13.5 14.5 13.5"
      stroke="url(#gradient1)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="gradient1" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2dd4bf" />
        <stop offset="1" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
  </svg>
);

const CurriculumIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 6H20"
      stroke="url(#gradient2)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 12H20"
      stroke="url(#gradient2)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 18H20"
      stroke="url(#gradient2)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 6V18"
      stroke="url(#gradient2)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="gradient2" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2dd4bf" />
        <stop offset="1" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
  </svg>
);

const OlympiadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke="url(#gradient3)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="gradient3" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2dd4bf" />
        <stop offset="1" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
  </svg>
);

const SyllabusHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke="url(#gradient4)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 2V8H20"
      stroke="url(#gradient4)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 13H8"
      stroke="url(#gradient4)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 17H8"
      stroke="url(#gradient4)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 9H9H8"
      stroke="url(#gradient4)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="gradient4" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2dd4bf" />
        <stop offset="1" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
  </svg>
);

const FocusTimerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="url(#gradient5)"
      strokeWidth="1.5"
    />
    <path
      d="M12 6V12L16 14"
      stroke="url(#gradient5)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="gradient5" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2dd4bf" />
        <stop offset="1" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
  </svg>
);

const DoubtPlaygroundIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21 15A2 2 0 0 1 19 17H7L4 20V5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V15Z"
      stroke="url(#gradient6)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="gradient6" x1="4" y1="3" x2="20" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2dd4bf" />
        <stop offset="1" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
  </svg>
);

// ── Stats Row ───────────────────────────────────────────────────────
const StatsRow = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin: 3.5rem 0 1rem;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    gap: 2rem;
  }
`;

const StatItem = styled(motion.div)`
  text-align: center;

  .number {
    font-family: 'Outfit', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #2dd4bf, #99f6e4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .label {
    font-size: 0.75rem;
    color: rgba(148, 163, 184, 0.6);
    text-transform: uppercase;
    letter-spacing: 1.2px;
    font-weight: 600;
    margin-top: 0.25rem;
  }
`;

// ── Footer ──────────────────────────────────────────────────────────
const Footer = styled.footer`
  width: 100%;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  z-index: 30;
  position: relative;
`;

const FooterBadge = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 0.6rem 1.5rem;
  border-radius: 999px;
  font-size: 0.8rem;
  color: rgba(221, 205, 255, 0.65);
  font-weight: 500;
  letter-spacing: 0.3px;

  span {
    color: #ffffff;
    font-weight: 700;
  }
`;

const Copyright = styled.div`
  font-size: 0.65rem;
  color: rgba(221, 205, 255, 0.3);
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
  z-index: 10;
`;

const FooterLink = styled.a`
  font-size: 0.75rem;
  color: rgba(221, 205, 255, 0.45);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: #2dd4bf;
    text-decoration: underline;
  }
`;

// ── NEW: Supported Curriculums badging ──────────────────────────────
const BoardStrip = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  margin-top: 1rem;
  margin-bottom: 5rem;
  width: 100%;
  text-align: center;
  z-index: 10;
  position: relative;
`;

const BoardTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(221, 205, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 2.5px;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  max-width: 900px;
  width: 100%;
`;

const BoardBadge = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 0.65rem 1.35rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(45, 212, 191, 0.4);
    background: rgba(255, 255, 255, 0.06);
    color: #ffffff;
    box-shadow: 0 0 15px rgba(45, 212, 191, 0.2);
  }
`;

// ── NEW: Section Header details ─────────────────────────────────────
const SectionHeader = styled.div`
  text-align: center;
  margin-top: 6rem;
  margin-bottom: 3.5rem;
  z-index: 10;
  position: relative;
  width: 100%;
`;

const SectionTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.8px;
  background: linear-gradient(135deg, #ffffff 30%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.75rem;
`;

const SectionSubtitle = styled.p`
  font-size: 1rem;
  color: rgba(221, 205, 255, 0.6);
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
`;

// ── NEW: Interactive Pricing Grid with Switch ───────────────────────
const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  z-index: 10;
  position: relative;
`;

const ToggleLabel = styled.span<{ active: boolean }>`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${p => p.active ? '#ffffff' : 'rgba(221, 205, 255, 0.5)'};
  transition: color 0.3s ease;
`;

const SwitchButton = styled.button`
  width: 56px;
  height: 30px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 99px;
  position: relative;
  cursor: pointer;
  outline: none;
  transition: background 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

const SwitchThumb = styled(motion.div)`
  width: 22px;
  height: 22px;
  background: #2dd4bf;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  box-shadow: 0 0 10px rgba(45, 212, 191, 0.6);
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  width: 100%;
  max-width: 840px;
  margin: 0 auto 5rem;
  z-index: 10;
  position: relative;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    max-width: 420px;
  }
`;

const PricingCard = styled(motion.div)<{ featured?: boolean }>`
  background: ${p => p.featured ? 'rgba(45, 212, 191, 0.05)' : 'rgba(255, 255, 255, 0.02)'};
  border: 1px solid ${p => p.featured ? 'rgba(45, 212, 191, 0.25)' : 'rgba(255, 255, 255, 0.05)'};
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 480px;
  position: relative;
  overflow: hidden;
  box-shadow: ${p => p.featured ? '0 15px 35px rgba(45, 212, 191, 0.12)' : '0 10px 30px rgba(0, 0, 0, 0.2)'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${p => p.featured ? 'linear-gradient(to right, #2dd4bf, #38bdf8)' : 'transparent'};
  }
`;

const FeaturedTag = styled.span`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%);
  color: white;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  box-shadow: 0 0 10px rgba(45, 212, 191, 0.4);
`;

const CardHeaderBlock = styled.div`
  margin-bottom: 1.5rem;
`;

const TierName = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
`;

const TierDescription = styled.p`
  font-size: 0.85rem;
  color: rgba(221, 205, 255, 0.5);
  line-height: 1.5;
`;

const PriceDisplay = styled.div`
  margin: 1.5rem 0;
  display: flex;
  align-items: baseline;

  .currency {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffffff;
  }

  .amount {
    font-family: 'Outfit', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -1px;
    line-height: 1;
  }

  .period {
    font-size: 0.9rem;
    color: rgba(221, 205, 255, 0.4);
    margin-left: 0.25rem;
    font-weight: 500;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  flex: 1;
`;

const FeatureItem = styled.li`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .icon {
    color: #38bdf8;
    font-weight: bold;
    font-size: 1rem;
  }
`;

const PricingButton = styled.a<{ featured?: boolean }>`
  width: 100%;
  padding: 0.9rem;
  border-radius: 14px;
  text-align: center;
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: block;

  background: ${p => p.featured ? 'linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%)' : 'rgba(255, 255, 255, 0.04)'};
  border: 1px solid ${p => p.featured ? 'transparent' : 'rgba(255, 255, 255, 0.08)'};
  color: white;
  box-shadow: ${p => p.featured ? '0 8px 25px rgba(45, 212, 191, 0.25)' : 'none'};

  &:hover {
    transform: translateY(-2px);
    background: ${p => p.featured ? 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)' : 'rgba(255, 255, 255, 0.08)'};
    border-color: ${p => p.featured ? 'transparent' : 'rgba(255, 255, 255, 0.18)'};
    box-shadow: ${p => p.featured ? '0 12px 30px rgba(45, 212, 191, 0.45)' : '0 8px 25px rgba(0,0,0,0.2)'};
  }

  &:active {
    transform: translateY(0);
  }
`;

// ── Detailed License Comparison Matrix ──────────────────────────────
const ComparisonTable = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto 5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  background: rgba(45, 212, 191, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  > div {
    padding: 1.25rem;
    font-weight: 700;
    text-align: center;

    &:first-child {
      text-align: left;
    }
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);

  &:last-child {
    border-bottom: none;
  }

  > div {
    padding: 1.25rem;
    display: flex;
    align-items: center;

    &:first-child {
      font-weight: 500;
      color: rgba(255, 255, 255, 0.8);
    }

    &:nth-child(2), &:nth-child(3) {
      justify-content: center;
      font-weight: 600;
    }
  }

  &:nth-child(even) {
    background: rgba(255, 255, 255, 0.01);
  }
`;

const CheckIcon = styled.span`
  color: #10b981;
  font-size: 1.2rem;
`;

const CrossIcon = styled.span`
  color: #ef4444;
  font-size: 1.2rem;
`;

// ── Tech Stack & Trust Badges ────────────────────────────────────────
const TechBadges = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin: 4rem 0;
  max-width: 1000px;
  margin: 0 auto 5rem;
  padding: 0 2rem;
`;

const TechBadge = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(45, 212, 191, 0.4);
    background: rgba(255, 255, 255, 0.06);
    color: #ffffff;
    box-shadow: 0 0 15px rgba(45, 212, 191, 0.2);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// ── NEW: Student Testimonials Grid ──────────────────────────────────
const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto 5rem;
  z-index: 10;
  position: relative;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    max-width: 500px;
    gap: 1.25rem;
  }
`;

const TestimonialCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: 20px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 230px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-4px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
  }
`;

const StarsRow = styled.div`
  display: flex;
  gap: 0.2rem;
  color: #fbbf24;
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.3);
`;

const QuoteText = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  flex: 1;
  margin-bottom: 1.25rem;
`;

const UserBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Avatar = styled.div<{ color: string }>`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${p => p.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

const UserDetails = styled.div`
  text-align: left;
  .name {
    font-size: 0.88rem;
    font-weight: 700;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .meta {
    font-size: 0.75rem;
    color: rgba(221, 205, 255, 0.45);
    font-weight: 500;
  }
`;

const Badge = styled.span`
  background: rgba(45, 212, 191, 0.15);
  color: #a5b4fc;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  border: 1px solid rgba(45, 212, 191, 0.25);
  text-transform: uppercase;
`;

// ── NEW: FAQ Accordion ───────────────────────────────────────────────
const FAQContainer = styled.div`
  width: 100%;
  max-width: 720px;
  margin: 0 auto 5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 10;
  position: relative;
`;

const FAQItemWrapper = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.03);
  }
`;

const FAQQuestion = styled.button`
  width: 100%;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  color: #ffffff;
  font-family: 'Outfit', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  text-align: left;
  gap: 1rem;

  .icon-holder {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a5b4fc;
    font-size: 0.85rem;
    transition: all 0.3s;
    border: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }

  &:hover .icon-holder {
    background: #2dd4bf;
    color: white;
    box-shadow: 0 0 10px rgba(45, 212, 191, 0.5);
  }
`;

const FAQAnswer = styled(motion.div)`
  color: rgba(221, 205, 255, 0.65);
  font-size: 0.92rem;
  line-height: 1.65;
  text-align: left;
`;

const FAQAnswerInner = styled.div`
  padding: 0 1.5rem 1.5rem 1.5rem;
`;

// ── Main Component ──────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <DoubtSolverIcon />,
    title: 'AI Doubt Solver',
    description: 'Instant conceptual breakdowns, step-by-step guidance, and strict mathematical proofs built to clarify your most complex learning blocks.',
    cta: 'Initialize Portal',
    color: '#2dd4bf',
    accent: 'rgba(45, 212, 191, 0.1)',
  },
  {
    icon: <SyllabusHubIcon />,
    title: 'Syllabus Hub',
    description: 'Intelligent revision notes and dynamic lesson planners locked to strict secondary board standards (WBBSE, CBSE, ICSE, Cambridge, and IB).',
    cta: 'Syllabus Core',
    color: '#38bdf8',
    accent: 'rgba(56, 189, 248, 0.1)',
  },
  {
    icon: <FocusTimerIcon />,
    title: 'Focus Timer',
    description: "Unlock specialized training fields. Generate advanced Level-2 mock problems and rigorous Achiever's Section physics & mathematics questions.",
    cta: 'Launch Arena',
    color: '#06b6d4',
    accent: 'rgba(6, 182, 212, 0.1)',
  },
];

export const Landing: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('doubt');
  const [doubtInput, setDoubtInput] = useState('');
  const [showDoubtResponse, setShowDoubtResponse] = useState(false);
  const [progress, setProgress] = useState(45);

  // Simulate progress loading for syllabus hub
  useEffect(() => {
    if (activeTab === 'syllabus') {
      const timer = setTimeout(() => {
        setProgress(92);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setProgress(45);
    }
  }, [activeTab]);

  const FAQ_DATA = [
    {
      q: "How does the AI Doubt Solver resolve complex problems?",
      a: "Our AI is loaded with specific academic models that break down problems into logical core concepts. It provides step-by-step mathematical proofs, detailed physical derivations, and biological outlines rather than just quick answers, matching real expert mentoring."
    },
    {
      q: "Is my specific school syllabus supported?",
      a: "Yes! Axona supports key boards like WBBSE, CBSE, ICSE, Cambridge CIE, and IB. You can easily map your subjects and chapters in the Syllabus Hub (Classes 9 to 12) and track your progress in real-time."
    },
    {
      q: "What makes the Olympiad Section different from standard homework?",
      a: "Standard revision covers fundamental theorems, whereas Olympiad mode unlocks Level-2 challenges and Achiever's Section problems. These are styled after competitive mathematics, physics, and computing arenas, designed to push your thinking bounds."
    },
    {
      q: "Is Google sign-in available, and does my study progress sync?",
      a: "Absolutely. When you sign in (whether via standard email or Google), your syllabus checkmarks, study logs, and focus timer streaks are saved to a secure Firestore cloud database, allowing you to resume on any phone, tablet, or PC."
    }
  ];

  const TESTIMONIALS = [
    {
      stars: 5,
      text: "Axona's Doubt Solver is unbelievable! It doesn't just give answers, it walks me through the derivations. Raised my physics score from 78 to 96% this term.",
      name: "Rohan Chatterjee",
      meta: "Class 12 Student • CBSE board",
      badge: "Physics 96%",
      avatarColor: "#2dd4bf",
      initials: "RC"
    },
    {
      stars: 5,
      text: "The Olympiad Level-2 practice problems are exceptionally rigorous. The customized scheduler also helped me manage class preparation with my preparation for college entrances.",
      name: "Sreya Sen",
      meta: "Class 11 Student • WBBSE Board",
      badge: "Math Olympiad",
      avatarColor: "#06b6d4",
      initials: "SS"
    },
    {
      stars: 5,
      text: "As a teacher, I recommend this to all my students. The progress tracking dashboard shows exactly where study gaps reside, allowing targeted teaching focus.",
      name: "Dr. Anirban Roy",
      meta: "Senior Educator • Cambridge CIE",
      badge: "Educator",
      avatarColor: "#ec4899",
      initials: "AR"
    }
  ];

  const handlePortalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/login';
  };

  const handleDoubtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (doubtInput.trim()) {
      setShowDoubtResponse(true);
    }
  };

  const handleChipClick = (text: string) => {
    setDoubtInput(text);
    setShowDoubtResponse(true);
  };


  return (
    <PageWrapper>
      {/* ── Ambient Background Orbs ────────────────────────────── */}
      <AmbientOrb
        color="#2dd4bf"
        size="500px"
        top="-10%"
        left="60%"
        delay="0s"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
      />
      <AmbientOrb
        color="#38bdf8"
        size="400px"
        top="50%"
        left="-10%"
        delay="3s"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2, delay: 0.5 }}
      />
      <AmbientOrb
        color="#06b6d4"
        size="350px"
        top="70%"
        left="70%"
        delay="6s"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2, delay: 1 }}
      />

      {/* ── Sticky Glassmorphic Navigation Bar ─────────────────── */}
      <Nav>
        <LogoText href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <span>Axona<sup style={{ fontSize: "0.55em", verticalAlign: "super" }}>™</sup></span>
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.35)', marginLeft: '8px', fontFamily: "'Inter', sans-serif", WebkitTextFillColor: 'rgba(255, 255, 255, 0.35)' }}>- by Abhranil</span>
        </LogoText>
        <NavLinks>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#demo">Interactive Preview</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <NavLink href="#testimonials">Testimonials</NavLink>
          <NavLink href="#faq">FAQ</NavLink>
        </NavLinks>
        <GetStartedBtn href="/login">Get Started</GetStartedBtn>
      </Nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <HeroSection>
        <HeroTitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          Supercharge Your Focus.<br />Master Your Syllabus.
        </HeroTitle>

        <HeroSubtitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
        >
          Step into the future of learning. An elite cognitive environment designed to break down concepts, summarize lessons, and conquer board standards.
        </HeroSubtitle>

        {/* ── Interactive App Simulator (Mockup Window) ─────────── */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
        <MockupWindow id="demo">
          <WindowHeader>
            <WindowControls>
              <WindowControl color="#ff5f57" />
              <WindowControl color="#febc2e" />
              <WindowControl color="#28c840" />
            </WindowControls>
            <WindowTitle>Axona™ Interactive Preview</WindowTitle>
          </WindowHeader>
          <TabBar>
            <Tab
              active={activeTab === 'doubt'}
              onClick={() => setActiveTab('doubt')}
            >
              Doubt Solver
            </Tab>
            <Tab
              active={activeTab === 'syllabus'}
              onClick={() => setActiveTab('syllabus')}
            >
              Syllabus Hub
            </Tab>
            <Tab
              active={activeTab === 'timer'}
              onClick={() => setActiveTab('timer')}
            >
              Focus Timer
            </Tab>
          </TabBar>
          <MockupContent>
            {activeTab === 'doubt' && (
              <ChatContainer>
                <Message>
                  <strong>Student:</strong> Can you explain the Pythagoras theorem?
                </Message>
                <Message isUser>
                  <strong>Axona AI:</strong> Of course! The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse (the side opposite the right angle) is equal to the sum of the squares of the other two sides.
                </Message>
                <ResponseBlock>
                  <div>Mathematically, this is expressed as:</div>
                  <div className="formula">c² = a² + b²</div>
                  <div>Where:</div>
                  <div className="formula">c = hypotenuse</div>
                  <div className="formula">a, b = other two sides</div>
                </ResponseBlock>
              </ChatContainer>
            )}
            {activeTab === 'syllabus' && (
              <ProgressCard>
                <SubjectHeader>
                  <SubjectIcon>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </SubjectIcon>
                  <SubjectInfo>
                    <h3>Class 10 Mathematics</h3>
                    <p>Trigonometry and Applications</p>
                  </SubjectInfo>
                </SubjectHeader>
                <div>
                  <ProgressInfo>
                    <span>Overall Progress</span>
                    <span>{progress}%</span>
                  </ProgressInfo>
                  <ProgressBar width={progress} />
                </div>
                <div>
                  <ProgressInfo>
                    <span>Trigonometric Ratios</span>
                    <span>100%</span>
                  </ProgressInfo>
                  <ProgressBar width={100} />
                </div>
                <div>
                  <ProgressInfo>
                    <span>Heights and Distances</span>
                    <span>75%</span>
                  </ProgressInfo>
                  <ProgressBar width={75} />
                </div>
              </ProgressCard>
            )}
            {activeTab === 'timer' && (
              <TimerContainer>
                <TimerRing>
                  <TimerDisplay>25:00</TimerDisplay>
                  <TimerAura />
                </TimerRing>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <h3>Focus Session Active</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem' }}>
                    Stay focused for maximum productivity
                  </p>
                </div>
              </TimerContainer>
            )}
          </MockupContent>
        </MockupWindow>
        </motion.div>

        {/* ── Curriculums Badges Strip ─────────────────────────── */}
        <BoardStrip
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <BoardTitle>Supported Educational Systems</BoardTitle>
          <BadgeRow>
            {['CBSE', 'ICSE', 'WBBSE', 'Cambridge CIE', 'IB Curriculum'].map((b, idx) => (
              <BoardBadge
                key={b}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 100, delay: idx * 0.08 }}
              >
                <SyllabusHubIcon style={{ width: '18px', height: '18px' }} /> {b}
              </BoardBadge>
            ))}
          </BadgeRow>
        </BoardStrip>

        {/* ── Feature Cards ──────────────────────────────────── */}
        <CardsGrid
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          id="features"
        >
          {FEATURES.map((f, i) => (
            <FeatureCard
              key={i}
              variants={fadeInUp}
              accentColor={f.accent}
              onClick={() => (window.location.href = '/login')}
            >
              <div>
                <CardIcon>{f.icon}</CardIcon>
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </div>
              <CardCTA color={f.color}>
                {f.cta} <span>→</span>
              </CardCTA>
            </FeatureCard>
          ))}
        </CardsGrid>

        {/* ── Interactive Doubt Playground ────────────────────── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
        <DoubtPlayground>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2rem',
            fontWeight: 800,
            fontFamily: "'Outfit', sans-serif",
            background: 'linear-gradient(135deg, #ffffff 30%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1.5rem'
          }}>
            Interactive Doubt Playground
          </h2>
          <p style={{
            textAlign: 'center',
            color: 'rgba(221, 205, 255, 0.6)',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Try our AI-powered doubt solver with these sample questions or ask your own
          </p>

          <DoubtInput>
            <DoubtInputField
              placeholder="Ask your academic question here..."
              value={doubtInput}
              onChange={(e) => setDoubtInput(e.target.value)}
              rows={3}
            />
            <DoubtActions>
              <SuggestionChips>
                <Chip onClick={() => handleChipClick("Pythagoras Theorem Proof")}>
                  Pythagoras Theorem Proof
                </Chip>
                <Chip onClick={() => handleChipClick("Explain Mitosis")}>
                  Explain Mitosis
                </Chip>
                <Chip onClick={() => handleChipClick("Quantum Physics Basic")}>
                  Quantum Physics Basic
                </Chip>
              </SuggestionChips>
              <SubmitButton onClick={handleDoubtSubmit}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                Solve
              </SubmitButton>
            </DoubtActions>

            <AnimatePresence>
              {showDoubtResponse && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <DoubtResponse>
                    <h4>AI Response:</h4>
                    <p>
                      {doubtInput.includes("Pythagoras")
                        ? "The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse (the side opposite the right angle) is equal to the sum of the squares of the other two sides. Mathematically: c² = a² + b². This theorem is fundamental in geometry and has numerous applications in mathematics, physics, and engineering."
                        : doubtInput.includes("Mitosis")
                        ? "Mitosis is the process of cell division in eukaryotic cells that results in two genetically identical daughter cells. The process consists of several phases: prophase (chromosomes condense), metaphase (chromosomes align at the cell center), anaphase (chromosomes separate), and telophase (nuclear membranes reform). This process is essential for growth, repair, and asexual reproduction."
                        : "Quantum physics is the branch of physics that studies the behavior of matter and energy at the atomic and subatomic level. Key principles include wave-particle duality (particles exhibit both wave and particle properties), uncertainty principle (cannot simultaneously know both position and momentum precisely), and superposition (particles can exist in multiple states simultaneously). Applications include lasers, MRI machines, and quantum computers."}
                    </p>
                  </DoubtResponse>
                </motion.div>
              )}
            </AnimatePresence>
          </DoubtInput>

          <CTAButton href="/login">
            Join Axona for Free to Solve More Doubts
          </CTAButton>
        </DoubtPlayground>
        </motion.div>

        {/* ── Interactive Pricing Grid ────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
        <SectionHeader id="pricing">
          <SectionTitle>Elite Learning Architecture</SectionTitle>
          <SectionSubtitle>Unlock personalized cognitive tracking and comprehensive syllabus analytics</SectionSubtitle>
        </SectionHeader>
        </motion.div>

        <ToggleContainer>
          <ToggleLabel active={!isAnnual}>Monthly</ToggleLabel>
          <SwitchButton type="button" onClick={() => setIsAnnual(!isAnnual)}>
            <SwitchThumb
              animate={{ x: isAnnual ? 26 : 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            />
          </SwitchButton>
          <ToggleLabel active={isAnnual}>
            Yearly <span style={{ color: '#ec4899', fontSize: '0.8rem', fontWeight: 700, marginLeft: '4px' }}>(Save 20%)</span>
          </ToggleLabel>
        </ToggleContainer>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          style={{ width: '100%' }}
        >
        <PricingGrid>
          {/* Neural Core Card */}
          <PricingCard
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            <div>
              <CardHeaderBlock>
                <TierName>Neural Core</TierName>
                <TierDescription>Perfect for self-motivated students tracking standard textbook chapters.</TierDescription>
              </CardHeaderBlock>

              <PriceDisplay>
                <span className="currency">$</span>
                <span className="amount">0</span>
                <span className="period">/ forever</span>
              </PriceDisplay>

              <FeatureList>
                <FeatureItem><span className="icon">✓</span> Complete Syllabus Hub (Classes 9-12)</FeatureItem>
                <FeatureItem><span className="icon">✓</span> Cloud-Synced Progress Tracker</FeatureItem>
                <FeatureItem><span className="icon">✓</span> Focus Timer & Study Streaks</FeatureItem>
                <FeatureItem><span className="icon">✓</span> 15 AI Doubt Solver queries per day</FeatureItem>
                <FeatureItem style={{ opacity: 0.55 }}><span className="icon" style={{ color: 'rgba(255,255,255,0.3)' }}>✗</span> Advanced Olympiad Section (Achievers)</FeatureItem>
                <FeatureItem style={{ opacity: 0.55 }}><span className="icon" style={{ color: 'rgba(255,255,255,0.3)' }}>✗</span> 24/7 Intelligent Mind Coach Portal</FeatureItem>
              </FeatureList>
            </div>

            <PricingButton href="/login">Initialize Core</PricingButton>
          </PricingCard>

          {/* Cortex Unlimited Card */}
          <PricingCard
            featured
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            <FeaturedTag>Popular choice</FeaturedTag>
            <div>
              <CardHeaderBlock>
                <TierName>Cortex Unlimited</TierName>
                <TierDescription>Complete high-performance cognitive field designed for top grades.</TierDescription>
              </CardHeaderBlock>

              <PriceDisplay>
                <span className="currency">$</span>
                <span className="amount">{isAnnual ? '9' : '12'}</span>
                <span className="period">/ month</span>
              </PriceDisplay>

              <FeatureList>
                <FeatureItem><span className="icon">✓</span> EVERYTHING in Neural Core</FeatureItem>
                <FeatureItem><span className="icon">✓</span> UNLIMITED AI Doubt Solver queries</FeatureItem>
                <FeatureItem><span className="icon">✓</span> Olympiad Level-2 Mock Generator</FeatureItem>
                <FeatureItem><span className="icon">✓</span> 24/7 Personal Study Coach Chatbot</FeatureItem>
                <FeatureItem><span className="icon">✓</span> Multi-device Instant Firestore Sync</FeatureItem>
                <FeatureItem><span className="icon">✓</span> Customized AI Revision & Notes Planner</FeatureItem>
              </FeatureList>
            </div>

            <PricingButton featured href="/login">Upgrade to Cortex</PricingButton>
          </PricingCard>
        </PricingGrid>
        </motion.div>

        {/* ── Detailed License Comparison Matrix ─────────────── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
        <SectionHeader>
          <SectionTitle>Plan Comparison</SectionTitle>
          <SectionSubtitle>See exactly what's included in each plan</SectionSubtitle>
        </SectionHeader>
        </motion.div>

        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
        <ComparisonTable>
          <TableHeader>
            <div>Feature</div>
            <div>Neural Core</div>
            <div>Cortex Unlimited</div>
          </TableHeader>
          <TableRow>
            <div>Daily AI Limits</div>
            <div>15 queries</div>
            <div>Unlimited</div>
          </TableRow>
          <TableRow>
            <div>Custom Syllabus Creation</div>
            <div><CrossIcon>✗</CrossIcon></div>
            <div><CheckIcon>✓</CheckIcon></div>
          </TableRow>
          <TableRow>
            <div>Board Standards Included</div>
            <div><CheckIcon>✓</CheckIcon></div>
            <div><CheckIcon>✓</CheckIcon></div>
          </TableRow>
          <TableRow>
            <div>Coach Analytics</div>
            <div><CrossIcon>✗</CrossIcon></div>
            <div><CheckIcon>✓</CheckIcon></div>
          </TableRow>
          <TableRow>
            <div>Mentor Chat Access</div>
            <div><CrossIcon>✗</CrossIcon></div>
            <div><CheckIcon>✓</CheckIcon></div>
          </TableRow>
          <TableRow>
            <div>Device Sync</div>
            <div><CheckIcon>✓</CheckIcon></div>
            <div><CheckIcon>✓</CheckIcon></div>
          </TableRow>
        </ComparisonTable>
        </motion.div>

        {/* ── Tech Stack & Trust Badges ──────────────────────── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
        <SectionHeader>
          <SectionTitle>Built with Cutting-Edge Technology</SectionTitle>
          <SectionSubtitle>Our platform is powered by industry-leading technologies</SectionSubtitle>
        </SectionHeader>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          style={{ width: '100%' }}
        >
        <TechBadges>
          <TechBadge>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#9370DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#9370DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#9370DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Llama-3-70B via Groq
          </TechBadge>
          <TechBadge>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 12L11 15L16 9" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Secured via Firebase SSL
          </TechBadge>
          <TechBadge>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 10H22" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 15H8.01" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15H12.01" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 15H16.01" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Realtime Sync via Firestore Cloud
          </TechBadge>
          <TechBadge>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Vite & React 18 Engine
          </TechBadge>
        </TechBadges>
        </motion.div>

        {/* ── Student & Educator Testimonials ───────────────────── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
        <SectionHeader id="testimonials">
          <SectionTitle>Student Achievements</SectionTitle>
          <SectionSubtitle>See how top students use Axona to transform their academic results</SectionSubtitle>
        </SectionHeader>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          style={{ width: '100%' }}
        >
        <TestimonialsGrid>
          {TESTIMONIALS.map((t, idx) => (
            <TestimonialCard
              key={idx}
              whileHover={{ y: -4 }}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div>
                <StarsRow>
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </StarsRow>
                <QuoteText>"{t.text}"</QuoteText>
              </div>
              <UserBlock>
                <Avatar color={t.avatarColor}>{t.initials}</Avatar>
                <UserDetails>
                  <div className="name">
                    {t.name} <Badge>{t.badge}</Badge>
                  </div>
                  <div className="meta">{t.meta}</div>
                </UserDetails>
              </UserBlock>
            </TestimonialCard>
          ))}
        </TestimonialsGrid>
        </motion.div>

        {/* ── Interactive FAQ Section ──────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
        <SectionHeader id="faq">
          <SectionTitle>Frequently Asked Questions</SectionTitle>
          <SectionSubtitle>Everything you need to know about our intelligent study environment</SectionSubtitle>
        </SectionHeader>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          style={{ width: '100%' }}
        >
        <FAQContainer>
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <FAQItemWrapper key={idx}>
                <FAQQuestion type="button" onClick={() => setOpenFaq(isOpen ? null : idx)}>
                  <span>{faq.q}</span>
                  <span className="icon-holder" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                    ▼
                  </span>
                </FAQQuestion>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <FAQAnswer
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <FAQAnswerInner>
                        {faq.a}
                      </FAQAnswerInner>
                    </FAQAnswer>
                  )}
                </AnimatePresence>
              </FAQItemWrapper>
            );
          })}
        </FAQContainer>
        </motion.div>

        {/* ── Stats Row ──────────────────────────────────────── */}
        <StatsRow
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <StatItem variants={fadeInUp}>
            <div className="number">10+</div>
            <div className="label">AI Features</div>
          </StatItem>
          <StatItem variants={fadeInUp}>
            <div className="number">5</div>
            <div className="label">Board Standards</div>
          </StatItem>
          <StatItem variants={fadeInUp}>
            <div className="number">∞</div>
            <div className="label">Practice Problems</div>
          </StatItem>
          <StatItem variants={fadeInUp}>
            <div className="number">24/7</div>
            <div className="label">AI Doubt Solving</div>
          </StatItem>
        </StatsRow>
      </HeroSection>

      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 2rem' }}>

      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        style={{ width: '100%' }}
      >
      <Footer>
        <FooterBadge>
          Engineered for high-performance students by <span>Abhranil Sen</span>.
        </FooterBadge>
        <FooterLinks>
          <FooterLink href="/privacy">Privacy Policy</FooterLink>
          <FooterLink href="/terms">Terms of Service</FooterLink>
          <FooterLink href="mailto:senabhranil7@gmail.com">Contact Support</FooterLink>
          <FooterLink href="https://wa.me/918637829022" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.457 3.473 1.328 4.984l-1.411 5.152 5.275-1.383c1.458.796 3.1 1.218 4.782 1.219h.004c5.507 0 9.99-4.482 9.99-9.99 0-2.67-1.038-5.178-2.924-7.066-1.887-1.886-4.394-2.923-7.066-2.923zm5.82 13.916c-.24.673-1.185 1.282-1.637 1.34-.45.059-.894.27-2.906-.525-2.58-.98-4.225-3.606-4.354-3.777-.128-.17-1.04-1.387-1.04-2.646 0-1.26.657-1.876.892-2.112.235-.236.516-.296.69-.296.173 0 .346.002.497.009.157.007.368-.059.576.444.214.516.732 1.782.796 1.913.064.13.107.282.02.456-.086.173-.129.282-.259.434-.13.15-.27.338-.387.456-.13.13-.266.27-.114.53.15.258.673 1.112 1.442 1.798.993.886 1.83 1.157 2.09 1.287.26.13.412.108.563-.065.152-.174.65-.758.824-1.018.174-.26.347-.217.585-.13.238.087 1.517.716 1.777.847.26.13.434.195.498.304.065.109.065.63-.175 1.303z"/>
            </svg>
            WhatsApp
          </FooterLink>
          <FooterLink href="https://www.instagram.com/abhrax7/?__pwa=1#" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            Instagram
          </FooterLink>
        </FooterLinks>
        <Copyright style={{ marginTop: '0.5rem' }}>© 2026 Axona™. All Rights Reserved.</Copyright>
      </Footer>
      </motion.div>
    </PageWrapper>
  );
};

export default Landing;