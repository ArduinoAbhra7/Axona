import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════════════
   SPATIAL AUDIO MIXER — Ambient soundscape panel for Focus Timer
   ═══════════════════════════════════════════════════════════════════════ */

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 1; }
`;

const MixerPanel = styled(motion.div)`
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MixerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    font-family: 'Outfit', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-main);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ToggleButton = styled.button<{ isActive: boolean }>`
  background: ${p => p.isActive ? 'rgba(45, 212, 191, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${p => p.isActive ? 'rgba(45, 212, 191, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${p => p.isActive ? '#99f6e4' : 'var(--text-muted)'};
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  text-transform: uppercase;

  &:hover {
    border-color: rgba(45, 212, 191, 0.5);
    color: #99f6e4;
  }
`;

const SoundGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
`;

const SoundCard = styled(motion.div)<{ isActive: boolean; accentColor: string }>`
  background: ${p => p.isActive ? `${p.accentColor}15` : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${p => p.isActive ? `${p.accentColor}40` : 'rgba(255, 255, 255, 0.06)'};
  border-radius: 14px;
  padding: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${p => `${p.accentColor}50`};
    background: ${p => `${p.accentColor}10`};
    transform: translateY(-2px);
  }
`;

const SoundIcon = styled.div<{ isActive: boolean }>`
  height: 24px;
  display: flex;
  align-items: center;
  color: var(--text-main);
  ${p => p.isActive && `animation: ${pulse} 2s ease-in-out infinite;`}
`;

const SoundName = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-main);
  letter-spacing: 0.3px;
`;

const VolumeSlider = styled.input`
  width: 100%;
  height: 3px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--primary);
    cursor: pointer;
    box-shadow: 0 0 8px rgba(45, 212, 191, 0.4);
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--primary);
    cursor: pointer;
    border: none;
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
`;

const MixerIcon: React.FC<{ name: string; size?: number; style?: React.CSSProperties }> = ({ name, size = 18, style }) => {
  switch (name) {
    case 'rain':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style}>
          <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
          <line x1="8" y1="16" x2="8" y2="22" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="16" y1="16" x2="16" y2="22" />
        </svg>
      );
    case 'forest':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style}>
          <path d="M12 2L3 9h3v10h12V9h3L12 2z" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      );
    case 'ocean':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style}>
          <path d="M2 6c.6 0 1.2-.2 1.6-.6L6.2 3c.8-.8 2-.8 2.8 0l2.6 2.6c.5.5 1 .6 1.6.6.6 0 1.2-.2 1.6-.6L18.2 3c.8-.8 2-.8 2.8 0l1 1" />
          <path d="M2 12c.6 0 1.2-.2 1.6-.6l2.6-2.6c.8-.8 2-.8 2.8 0l2.6 2.6c.5.5 1 .6 1.6.6.6 0 1.2-.2 1.6-.6l3.4-3.4c.8-.8 2-.8 2.8 0l1 1" />
        </svg>
      );
    case 'fire':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style}>
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    case 'wind':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style}>
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2" />
        </svg>
      );
    case 'coffee':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style}>
          <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      );
    case 'music':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    default:
      return null;
  }
};

// ── Sound Definitions ───────────────────────────────────────────────
interface SoundDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency?: number;
  type: OscillatorType;
}

const SOUNDS: SoundDef[] = [
  { id: 'rain', name: 'Rainfall', icon: 'rain', color: '#60a5fa', type: 'sine', frequency: 200 },
  { id: 'forest', name: 'Forest', icon: 'forest', color: '#10b981', type: 'sine', frequency: 160 },
  { id: 'ocean', name: 'Ocean Waves', icon: 'ocean', color: '#38bdf8', type: 'sine', frequency: 120 },
  { id: 'fire', name: 'Fireplace', icon: 'fire', color: '#f59e0b', type: 'sawtooth', frequency: 80 },
  { id: 'wind', name: 'Wind', icon: 'wind', color: '#94a3b8', type: 'sine', frequency: 100 },
  { id: 'coffee', name: 'Café Noise', icon: 'coffee', color: '#14b8a6', type: 'triangle', frequency: 250 },
];

interface SoundState {
  active: boolean;
  volume: number;
}

interface Props {
  isFocusMode?: boolean;
}

const SpatialAudioMixer: React.FC<Props> = ({ isFocusMode = false }) => {
  const [mixerActive, setMixerActive] = useState(false);
  const [soundStates, setSoundStates] = useState<Record<string, SoundState>>(() => {
    const initial: Record<string, SoundState> = {};
    SOUNDS.forEach(s => { initial[s.id] = { active: false, volume: 0.3 }; });
    return initial;
  });

  // AudioContext + oscillators refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Record<string, { osc: OscillatorNode; gain: GainNode }>>({});

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const startSound = (soundDef: SoundDef, volume: number) => {
    const ctx = getAudioCtx();
    
    // Create noise-like sound using multiple detuned oscillators
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = soundDef.type;
    osc.frequency.setValueAtTime(soundDef.frequency || 150, ctx.currentTime);
    
    // Add some randomness for natural feel
    osc.frequency.setValueAtTime(
      (soundDef.frequency || 150) + Math.random() * 20 - 10,
      ctx.currentTime
    );
    
    // Low-pass filter for softer sound
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);
    filter.Q.setValueAtTime(1, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.08, ctx.currentTime + 0.5); // Keep volume very low
    
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    
    oscillatorsRef.current[soundDef.id] = { osc, gain: gainNode };
  };

  const stopSound = (id: string) => {
    const entry = oscillatorsRef.current[id];
    if (entry) {
      const ctx = getAudioCtx();
      entry.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      setTimeout(() => {
        try { entry.osc.stop(); } catch {}
        delete oscillatorsRef.current[id];
      }, 400);
    }
  };

  const toggleSound = (id: string) => {
    const newState = !soundStates[id].active;
    setSoundStates(prev => ({
      ...prev,
      [id]: { ...prev[id], active: newState }
    }));

    const soundDef = SOUNDS.find(s => s.id === id)!;
    if (newState) {
      startSound(soundDef, soundStates[id].volume);
    } else {
      stopSound(id);
    }
  };

  const updateVolume = (id: string, volume: number) => {
    setSoundStates(prev => ({
      ...prev,
      [id]: { ...prev[id], volume }
    }));

    const entry = oscillatorsRef.current[id];
    if (entry) {
      const ctx = getAudioCtx();
      entry.gain.gain.linearRampToValueAtTime(volume * 0.08, ctx.currentTime + 0.1);
    }
  };

  const toggleMixer = () => {
    if (mixerActive) {
      // Stop all sounds
      Object.keys(oscillatorsRef.current).forEach(id => stopSound(id));
      setSoundStates(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => { next[k] = { ...next[k], active: false }; });
        return next;
      });
    }
    setMixerActive(!mixerActive);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.keys(oscillatorsRef.current).forEach(id => {
        try { oscillatorsRef.current[id].osc.stop(); } catch {}
      });
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const activeSoundCount = Object.values(soundStates).filter(s => s.active).length;

  return (
    <MixerPanel
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <MixerHeader>
        <h3>
          <MixerIcon name="music" size={18} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
          Spatial Audio
          {activeSoundCount > 0 && (
            <span style={{ 
              fontSize: '0.65rem', 
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontWeight: 600
            }}>
              {activeSoundCount} active
            </span>
          )}
        </h3>
        <ToggleButton isActive={mixerActive} onClick={toggleMixer}>
          {mixerActive ? 'Mute All' : 'Enable'}
        </ToggleButton>
      </MixerHeader>

      <AnimatePresence>
        {mixerActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <SoundGrid>
              {SOUNDS.map((sound) => (
                <SoundCard
                  key={sound.id}
                  isActive={soundStates[sound.id].active}
                  accentColor={sound.color}
                  onClick={() => toggleSound(sound.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {soundStates[sound.id].active && <ActiveIndicator />}
                  <SoundIcon isActive={soundStates[sound.id].active}>
                    <MixerIcon name={sound.icon} size={22} />
                  </SoundIcon>
                  <SoundName>{sound.name}</SoundName>
                  {soundStates[sound.id].active && (
                    <VolumeSlider
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={soundStates[sound.id].volume}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateVolume(sound.id, parseFloat(e.target.value));
                      }}
                    />
                  )}
                </SoundCard>
              ))}
            </SoundGrid>
          </motion.div>
        )}
      </AnimatePresence>
    </MixerPanel>
  );
};

export default SpatialAudioMixer;
