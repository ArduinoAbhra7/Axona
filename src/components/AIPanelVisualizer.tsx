import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';


/* ═══════════════════════════════════════════════════════
   ANIMATIONS & STYLED COMPONENTS
   ═══════════════════════════════════════════════════════ */

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.25; }
  50% { transform: scale(1.1); opacity: 0.45; }
`;

const terminalPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const TerminalContainer = styled.div`
  width: 100%;
  max-width: 440px;
  height: 380px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: var(--card-shadow);
  padding: 1.25rem;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  color: #38bdf8;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow: hidden;
  animation: ${float} 6s ease-in-out infinite;
  cursor: pointer;

  [data-theme="light"] & {
    background: rgba(255, 255, 255, 0.75);
    color: #0369a1;
  }
`;

const TerminalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.7rem;
  color: var(--text-muted);

  .dots {
    display: flex;
    gap: 0.35rem;
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
  }
`;

const TerminalOutput = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  padding-right: 0.25rem;

  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
`;

const Line = styled.div<{ active?: boolean }>`
  word-break: break-all;
  line-height: 1.4;
  opacity: ${props => props.active ? 1 : 0.65};
  color: ${props => props.active ? 'var(--primary)' : 'inherit'};
`;

const Cursor = styled.span`
  display: inline-block;
  width: 6px;
  height: 12px;
  background: currentColor;
  margin-left: 2px;
  animation: ${terminalPulse} 1s step-end infinite;
`;

const OrbContainer = styled.div`
  width: 100%;
  max-width: 400px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: ${float} 7s ease-in-out infinite;
`;

const WaveOrb = styled.div`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--primary) 0%, rgba(45, 212, 191, 0.1) 80%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 40px rgba(45, 212, 191, 0.25);

  &::before, &::after {
    content: '';
    position: absolute;
    inset: -15px;
    border-radius: 50%;
    border: 1px solid var(--primary);
    animation: ${pulse} 3s ease-in-out infinite;
  }

  &::after {
    inset: -30px;
    border-color: var(--accent);
    animation-delay: 1.5s;
  }
`;

const WaveBarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  height: 40px;
`;

const WaveBar = styled(motion.div)<{ delay: number; height: number }>`
  width: 3px;
  background: white;
  border-radius: 2px;
`;

/* ═══════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════ */

export const AITerminalVisualizer: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const commandTemplates = [
    'CONNECTING TO AXONA_NEURAL_CORE...',
    'SYNCED: Users/Abhranil/BrainData.syn',
    'QUERY: SELECT * FROM syllabus WHERE topics="complete"',
    'groq.chat.completions.create({ model: "llama-3.1-8b" })',
    'COMPILING: RevisionFlashcards.cpp',
    'CALCULATING: SM-2 Spaced Repetition Ease Factor...',
    'SUCCESS: review_date_interval set to 6 days',
    'AI COGNITIVE SHIELD ACTIVE',
    'PARSING: StudySessionTelemetry.json',
  ];

  useEffect(() => {
    // Initial logs setup
    setLogs(['SYSTEM INITIALIZED', 'WAITING FOR TOPICS']);

    const interval = setInterval(() => {
      const nextLog = commandTemplates[Math.floor(Math.random() * commandTemplates.length)];
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev.slice(-15), `[${timestamp}] ${nextLog}`]);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <TerminalContainer onClick={onClick}>
      <TerminalHeader>
        <div className="dots">
          <span className="dot" style={{ background: '#f43f5e' }} />
          <span className="dot" style={{ background: '#f59e0b' }} />
          <span className="dot" style={{ background: '#10b981' }} />
        </div>
        <div>Neural Shell v1.0.2</div>
      </TerminalHeader>
      <TerminalOutput>
        {logs.map((log, i) => (
          <Line key={i} active={i === logs.length - 1}>
            {log}
          </Line>
        ))}
        <Line active>
          sh senal@axona:~$ <Cursor />
        </Line>
        <div ref={bottomRef} />
      </TerminalOutput>
    </TerminalContainer>
  );
};

export const MentorWaveVisualizer: React.FC = () => {
  const bars = Array.from({ length: 9 }).map((_, i) => ({
    id: i,
    height: [10, 35, 10],
    duration: 0.8 + i * 0.1,
  }));

  return (
    <OrbContainer>
      <WaveOrb>
        <WaveBarRow>
          {bars.map(bar => (
            <WaveBar
              key={bar.id}
              animate={{ height: bar.height }}
              transition={{
                duration: bar.duration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              delay={bar.id * 0.1}
              height={10}
            />
          ))}
        </WaveBarRow>
      </WaveOrb>
    </OrbContainer>
  );
};
