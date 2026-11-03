import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSyllabus, syllabusData, type ClassSyllabus, type SubjectSyllabus, type Topic } from '../data/syllabusData';

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */
interface CheckedState {
  [key: string]: boolean;
}

interface SubjectHub {
  kind: 'subject';
  subjectId: string;
  x: number;
  y: number;
}

interface TopicNode {
  kind: 'topic';
  subjectId: string;
  topicId: string;
  x: number;
  y: number;
}

type LayoutNode = SubjectHub | TopicNode;

/* ═══════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════ */
const VIEW_W = 1200;
const VIEW_H = 700;
const HUB_R = 42;
const TOPIC_R = 14;
const HUB_ORBIT = 240;
const TOPIC_ORBIT = 110;

const GLOW_PALETTE = [
  '#2dd4bf', // aquamarine
  '#3b82f6', // blue
  '#10b981', // emerald
  '#ec4899', // pink
  '#f59e0b', // amber
  '#ef4444', // rose
];

const GLOW_FILTER_IDS = ['glow-aquamarine', 'glow-blue', 'glow-emerald', 'glow-pink', 'glow-amber', 'glow-rose'];

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */
function getAllCheckableKeys(subject: SubjectSyllabus): string[] {
  const keys: string[] = [];
  subject.topics.forEach(topic => {
    keys.push(topic.id);
    topic.subtopics.forEach((_, si) => {
      keys.push(`${topic.id}_sub${si}`);
    });
  });
  return keys;
}

function getSubjectProgress(subject: SubjectSyllabus, checked: CheckedState): number {
  const keys = getAllCheckableKeys(subject);
  if (keys.length === 0) return 0;
  const done = keys.filter(k => checked[k]).length;
  return Math.round((done / keys.length) * 100);
}

function getOverallProgress(subjects: SubjectSyllabus[], checked: CheckedState): number {
  let total = 0;
  let done = 0;
  subjects.forEach(s => {
    const keys = getAllCheckableKeys(s);
    total += keys.length;
    done += keys.filter(k => checked[k]).length;
  });
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

function getLocalStorageKey(email: string, classNum: number, board: string = 'CBSE', exam: string = 'Board Exams'): string {
  const cleanBoard = board.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanExam = exam.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `axona_syllabus_${email}_${cleanBoard}_${cleanExam}_class${classNum}`;
}

function hashIdToPaletteIndex(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % GLOW_PALETTE.length;
}

function glowFilterId(id: string): string {
  return GLOW_FILTER_IDS[hashIdToPaletteIndex(id)];
}

function glowColor(id: string): string {
  return GLOW_PALETTE[hashIdToPaletteIndex(id)];
}

/* ═══════════════════════════════════════════════════════
   STYLED COMPONENTS
   ═══════════════════════════════════════════════════════ */
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;

  .titles {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  h2 {
    font-size: 2rem;
    font-weight: 800;
    font-family: 'Outfit', sans-serif;
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: var(--text-muted);
    font-size: 0.95rem;
  }
`;

const ViewToggle = styled.div`
  display: inline-flex;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 0.3rem;
  gap: 0.25rem;
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
`;

const ViewToggleButton = styled.button<{ active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  border: none;
  background: ${p => (p.active ? 'var(--primary)' : 'transparent')};
  color: ${p => (p.active ? '#fff' : 'var(--text-muted)')};
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-main);
  }
`;

const ClassTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 0.35rem;
  width: fit-content;

  @media (max-width: 600px) {
    width: 100%;
    justify-content: center;
  }
`;

const ClassTab = styled.button<{ active: boolean }>`
  padding: 0.6rem 1.4rem;
  border-radius: 10px;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: 'Inter', sans-serif;
  background: ${p => (p.active ? 'var(--primary)' : 'transparent')};
  color: ${p => (p.active ? '#fff' : 'var(--text-muted)')};
  box-shadow: ${p => (p.active ? '0 4px 14px var(--primary-glow)' : 'none')};

  &:hover {
    background: ${p => (p.active ? 'var(--primary)' : 'var(--glass-hover)')};
    color: var(--text-main);
  }
`;

const OverallProgressCard = styled(motion.div)`
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 1.25rem 1.75rem;
  box-shadow: var(--card-shadow);
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const OverallStats = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1.25rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const OverallRing = styled.div<{ pct: number; color: string }>`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: conic-gradient(
    ${p => p.color} ${p => p.pct * 3.6}deg,
    var(--glass-border) 0deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;

  &::after {
    content: '';
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: var(--bg-darker);
    position: absolute;
  }

  span {
    position: relative;
    z-index: 1;
    font-size: 0.95rem;
    font-weight: 800;
    font-family: 'Outfit', sans-serif;
    color: ${p => p.color};
  }
`;

const OverallText = styled.div`
  h3 {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 0.2rem;
  }

  p {
    font-size: 0.82rem;
    color: var(--text-muted);
  }
`;

const OverallBar = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
`;

const ProgressBarTrack = styled.div`
  width: 100%;
  height: 8px;
  background: var(--glass-border);
  border-radius: 100px;
  overflow: hidden;
`;

const ProgressBarFill = styled(motion.div)<{ color: string }>`
  height: 100%;
  border-radius: 100px;
  background: linear-gradient(90deg, ${p => p.color}, ${p => p.color}dd);
  box-shadow: 0 0 12px ${p => p.color}55;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-muted);
`;

/* ═══════════ GRAPH CANVAS ═══════════ */
const GraphContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 640px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: var(--card-shadow);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: var(--constellation-bg);
    background-size: 24px 24px;
    opacity: 0.7;
    pointer-events: none;
    z-index: 0;
  }
`;

const StyledSvg = styled.svg`
  width: 100%;
  height: 100%;
  cursor: grab;
  display: block;
  position: relative;
  z-index: 1;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
`;

const HudOverlay = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 2;
`;

const HudPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.7rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  font-family: monospace;
`;

const HudButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  border-radius: 10px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s;

  &:hover {
    background: var(--glass-hover);
    color: var(--text-main);
    border-color: var(--primary);
  }
`;

const LegendOverlay = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  max-width: 70%;
  z-index: 2;
`;

const LegendChip = styled.button<{ color: string; active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.7rem;
  background: ${p => (p.active ? 'var(--glass-hover)' : 'var(--glass-bg)')};
  border: 1px solid ${p => (p.active ? p.color : 'var(--glass-border)')};
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${p => p.color};
    box-shadow: 0 0 8px ${p => p.color};
  }
`;

/* ═══════════ SLIDE-OUT PANEL ═══════════ */
const PanelOverlay = styled.div<{ open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  opacity: ${p => (p.open ? 1 : 0)};
  pointer-events: ${p => (p.open ? 'auto' : 'none')};
  transition: opacity 0.3s ease;
  z-index: 998;
`;

const Panel = styled(motion.aside)<{ accentColor: string }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(420px, 100vw);
  background: var(--bg-darker);
  border-left: 1px solid ${p => p.accentColor}55;
  box-shadow: -20px 0 60px rgba(0, 0, 0, 0.4);
  z-index: 999;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 1rem;
  overflow-y: auto;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${p => p.accentColor}, transparent);
  }
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--glass-border);

  .label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
    margin-bottom: 0.3rem;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  h3 {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-main);
    font-family: 'Outfit', sans-serif;
    line-height: 1.3;
  }
`;

const CloseBtn = styled.button`
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;

  &:hover {
    color: var(--text-main);
    background: var(--glass-hover);
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .section-label {
    font-size: 0.7rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
  }
`;

const SubtopicList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const SubtopicRow = styled.label<{ completed: boolean; accentColor: string }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.7rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.85rem;
  color: ${p => (p.completed ? 'var(--text-muted)' : 'var(--text-main)')};
  text-decoration: ${p => (p.completed ? 'line-through' : 'none')};
  transition: all 0.2s;

  &:hover {
    background: var(--glass-hover);
    border-color: ${p => p.accentColor}55;
  }
`;

const SubtopicCheck = styled.span<{ checked: boolean; accentColor: string }>`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid ${p => (p.checked ? p.accentColor : 'var(--glass-border)')};
  background: ${p => (p.checked ? p.accentColor : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;

  svg { width: 10px; height: 10px; display: ${p => (p.checked ? 'block' : 'none')}; }
`;

const ActionBtn = styled.button<{ $variant: 'primary' | 'secondary'; accentColor: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  border: 1px solid ${p => (p.$variant === 'primary' ? 'transparent' : 'var(--glass-border)')};
  background: ${p => (p.$variant === 'primary' ? p.accentColor : 'var(--glass-bg)')};
  color: ${p => (p.$variant === 'primary' ? '#fff' : 'var(--text-main)')};
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px ${p => p.accentColor}44;
  }
`;

/* ═══════════ LIST VIEW (fallback) ═══════════ */
const SubjectGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const SubjectCard = styled(motion.div)<{ accentColor: string; expanded: boolean }>`
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid ${p => (p.expanded ? p.accentColor + '44' : 'var(--glass-border)')};
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  cursor: pointer;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: ${p => p.accentColor}66;
    box-shadow: 0 4px 30px ${p => p.accentColor}15;
  }
`;

const SubjectCardHeader = styled.div<{ accentColor: string }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;

  .subject-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: ${p => p.accentColor}18;
    color: ${p => p.accentColor};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .subject-info {
    flex: 1;
    min-width: 0;

    h4 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.3rem;
    }

    .meta {
      font-size: 0.78rem;
      color: var(--text-muted);
    }
  }

  .chevron {
    color: var(--text-muted);
    transition: transform 0.3s ease;
    transform: ${p => (p.expanded ? 'rotate(180deg)' : 'rotate(0deg)')};
  }
`;

const SubjectProgressMini = styled.div`
  padding: 0 1.5rem 1.25rem;
`;

const SubjectProgressBar = styled.div`
  width: 100%;
  height: 6px;
  border-radius: 100px;
  background: var(--glass-border);
  overflow: hidden;
`;

const SubjectProgressFill = styled(motion.div)<{ color: string }>`
  height: 100%;
  border-radius: 100px;
  background: ${p => p.color};
`;

const TopicList = styled(motion.div)`
  border-top: 1px solid var(--glass-border);
  padding: 0.75rem 0;
`;

const TopicItem = styled.div`
  padding: 0.3rem 1.5rem;
`;

const TopicRow = styled.div<{ completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.5rem;
  border-radius: 10px;
  transition: background 0.2s;
  cursor: pointer;

  &:hover {
    background: var(--glass-hover);
  }

  .topic-name {
    flex: 1;
    font-size: 0.9rem;
    font-weight: 600;
    color: ${p => (p.completed ? 'var(--text-muted)' : 'var(--text-main)')};
    text-decoration: ${p => (p.completed ? 'line-through' : 'none')};
  }
`;

const Checkbox = styled.label<{ checked: boolean; accentColor: string }>`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid ${p => (p.checked ? p.accentColor : 'var(--glass-border)')};
  background: ${p => (p.checked ? p.accentColor : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  color: #fff;

  &:hover {
    border-color: ${p => p.accentColor};
    box-shadow: 0 0 8px ${p => p.accentColor}44;
  }

  svg { display: ${p => (p.checked ? 'block' : 'none')}; width: 12px; height: 12px; }

  input { display: none; }
`;

const DoubtButton = styled.button<{ accentColor: string }>`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.3rem 0.45rem;
  border-radius: 6px;
  transition: all 0.2s;
  opacity: 0.5;
  flex-shrink: 0;
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 1;
    background: ${p => p.accentColor}20;
    color: ${p => p.accentColor};
    transform: scale(1.15);
  }
`;

const InnerSubtopicList = styled(motion.div)`
  margin-left: 2.6rem;
  padding: 0.15rem 0 0.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`;

const InnerSubtopicRow = styled.div<{ completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.5rem;
  border-radius: 8px;
  transition: background 0.2s;
  cursor: pointer;

  &:hover {
    background: var(--glass-hover);
  }

  .subtopic-name {
    flex: 1;
    font-size: 0.82rem;
    color: ${p => (p.completed ? 'var(--text-muted)' : 'var(--text-main)')};
    text-decoration: ${p => (p.completed ? 'line-through' : 'none')};
  }
`;

const SmallCheckbox = styled(Checkbox)`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border-width: 1.5px;

  svg { width: 9px; height: 9px; }
`;

const TopicExpandArrow = styled.span<{ expanded: boolean }>`
  color: var(--text-muted);
  transition: transform 0.25s ease;
  transform: ${p => (p.expanded ? 'rotate(90deg)' : 'rotate(0deg)')};
  flex-shrink: 0;
  width: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const AddCustomForm = styled.form`
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: var(--glass-bg);
  border-top: 1px dashed var(--glass-border);
  align-items: center;
  margin-top: 0.5rem;
  border-radius: 12px;
`;

const CustomInput = styled.input`
  flex: 1;
  background: var(--bg-darker);
  border: 1px solid var(--glass-border);
  padding: 0.45rem 0.8rem;
  border-radius: 8px;
  color: var(--text-main);
  font-size: 0.85rem;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: var(--primary);
    background: var(--glass-hover);
  }
`;

const CustomAddButton = styled.button<{ accentColor: string }>`
  background: ${p => p.accentColor};
  color: white;
  border: none;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;

  &:hover {
    transform: scale(1.02);
    opacity: 0.9;
  }
`;

const DeleteBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.2s, transform 0.2s, color 0.2s;
  padding: 2px 6px;
  flex-shrink: 0;
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
    color: #ef4444;
  }
`;

const Footer = styled.footer`
  margin-top: 2rem;
  padding: 2rem 0;
  border-top: 1px solid var(--glass-border);
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
  opacity: 0.8;

  p:last-child {
    font-size: 0.7rem;
    margin-top: 0.5rem;
  }
`;

/* ═══════════════════════════════════════════════════════
   INLINE ICONS
   ═══════════════════════════════════════════════════════ */
const Icon: React.FC<{ name: string; size?: number; color?: string }> = ({ name, size = 16, color = 'currentColor' }) => {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'graph':
      return (<svg {...common}><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="6" y1="8" x2="6" y2="16"/><line x1="8" y1="16" x2="16" y2="16"/></svg>);
    case 'list':
      return (<svg {...common}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.2" fill={color}/><circle cx="4" cy="12" r="1.2" fill={color}/><circle cx="4" cy="18" r="1.2" fill={color}/></svg>);
    case 'plus':
      return (<svg {...common}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
    case 'x':
      return (<svg {...common}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
    case 'zoom-in':
      return (<svg {...common}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>);
    case 'zoom-out':
      return (<svg {...common}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/><line x1="8" y1="11" x2="14" y2="11"/></svg>);
    case 'fit':
      return (<svg {...common}><path d="M4 9V5a1 1 0 0 1 1-1h4"/><path d="M20 9V5a1 1 0 0 0-1-1h-4"/><path d="M4 15v4a1 1 0 0 0 1 1h4"/><path d="M20 15v4a1 1 0 0 1-1 1h-4"/></svg>);
    case 'reset':
      return (<svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7"/><polyline points="3 4 3 10 9 10"/></svg>);
    case 'message':
      return (<svg {...common}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
    case 'check':
      return (<svg {...common}><polyline points="20 6 9 17 4 12"/></svg>);
    case 'trash':
      return (<svg {...common}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);
    case 'chevron-right':
      return (<svg {...common}><polyline points="9 18 15 12 9 6"/></svg>);
    case 'chevron-down':
      return (<svg {...common}><polyline points="6 9 12 15 18 9"/></svg>);
    case 'sparkle':
      return (<svg {...common}><path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6z"/></svg>);
    default:
      return null;
  }
};

/* Subject icon glyphs (stroke-based, deterministic per subject) */
const SubjectGlyph: React.FC<{ subjectId: string; size?: number; color?: string }> = ({ subjectId, size = 20, color = 'currentColor' }) => {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  const id = subjectId.toLowerCase();
  if (id.includes('math')) {
    return (<svg {...common}><line x1="4" y1="20" x2="20" y2="4"/><line x1="14" y1="4" x2="20" y2="4"/><line x1="4" y1="20" x2="4" y2="14"/></svg>);
  }
  if (id.includes('physics')) {
    return (<svg {...common}><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4"/></svg>);
  }
  if (id.includes('chem')) {
    return (<svg {...common}><path d="M9 3h6l1 5v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V8z"/><line x1="9" y1="13" x2="15" y2="13"/></svg>);
  }
  if (id.includes('bio')) {
    return (<svg {...common}><path d="M12 22c4-3 8-6 8-11a4 4 0 0 0-8-1 4 4 0 0 0-8 1c0 5 4 8 8 11z"/></svg>);
  }
  if (id.includes('english') || id.includes('lit')) {
    return (<svg {...common}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>);
  }
  if (id.includes('history') || id.includes('social')) {
    return (<svg {...common}><path d="M3 21h18M5 21V8l7-5 7 5v13"/><line x1="9" y1="13" x2="15" y2="13"/></svg>);
  }
  return (<svg {...common}><circle cx="12" cy="12" r="3"/></svg>);
};

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
type ViewMode = 'graph' | 'list';

const Constellation: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Get user registered class number to initialize selected tab correctly
  const userClassNum = useMemo(() => {
    if (currentUser?.class) {
      const match = currentUser.class.match(/\d+/);
      if (match) return parseInt(match[0]);
    }
    return 9;
  }, [currentUser]);

  const [selectedClass, setSelectedClass] = useState(userClassNum);
  const [view, setView] = useState<ViewMode>('graph');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState<CheckedState>({});

  useEffect(() => {
    setSelectedClass(userClassNum);
  }, [userClassNum]);

  const [customTopics, setCustomTopics] = useState<Record<string, Topic[]>>({});
  const [customSubtopics, setCustomSubtopics] = useState<Record<string, string[]>>({});
  const [newTopicName, setNewTopicName] = useState<Record<string, string>>({});
  const [newSubtopicName, setNewSubtopicName] = useState<Record<string, string>>({});

  // Graph state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [hoveredTopicId, setHoveredTopicId] = useState<string | null>(null);
  const [focusedTopicId, setFocusedTopicId] = useState<string | null>(null);
  const [activeLegend, setActiveLegend] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; origX: number; origY: number }>({
    active: false, startX: 0, startY: 0, origX: 0, origY: 0,
  });

  const email = currentUser?.email || 'guest';
  const userBoard = currentUser?.board || 'CBSE';
  const userExam = currentUser?.targetExam || 'Board Exams';

  /* ─── Persistence ─────────────────────────── */
  useEffect(() => {
    const key = getLocalStorageKey(email, selectedClass, userBoard, userExam);
    const saved = localStorage.getItem(key);
    if (saved) {
      try { setChecked(JSON.parse(saved)); } catch { setChecked({}); }
    } else {
      setChecked({});
    }
    setExpandedSubject(null);
    setExpandedTopics(new Set());
  }, [selectedClass, email, userBoard, userExam]);

  useEffect(() => {
    const topicKey = `axona_custom_topics_${email}_class${selectedClass}`;
    const subtopicKey = `axona_custom_subtopics_${email}_class${selectedClass}`;

    const savedTopics = localStorage.getItem(topicKey);
    const savedSubtopics = localStorage.getItem(subtopicKey);

    if (savedTopics) {
      try { setCustomTopics(JSON.parse(savedTopics)); } catch { setCustomTopics({}); }
    } else {
      setCustomTopics({});
    }

    if (savedSubtopics) {
      try { setCustomSubtopics(JSON.parse(savedSubtopics)); } catch { setCustomSubtopics({}); }
    } else {
      setCustomSubtopics({});
    }
  }, [selectedClass, email]);

  useEffect(() => {
    const key = getLocalStorageKey(email, selectedClass, userBoard, userExam);
    localStorage.setItem(key, JSON.stringify(checked));
  }, [checked, selectedClass, email, userBoard, userExam]);

  useEffect(() => {
    const topicKey = `axona_custom_topics_${email}_class${selectedClass}`;
    localStorage.setItem(topicKey, JSON.stringify(customTopics));
  }, [customTopics, selectedClass, email]);

  useEffect(() => {
    const subtopicKey = `axona_custom_subtopics_${email}_class${selectedClass}`;
    localStorage.setItem(subtopicKey, JSON.stringify(customSubtopics));
  }, [customSubtopics, selectedClass, email]);

  /* ─── Data derivation ─────────────────────── */
  const currentSyllabus = useMemo(() => {
    return syllabusData.find(c => c.classNumber === selectedClass);
  }, [selectedClass]);

  const subjects = useMemo(() => {
    return getSyllabus(userBoard, userExam, selectedClass);
  }, [userBoard, userExam, selectedClass]);

  const augmentedSubjects = useMemo(() => {
    return subjects.map(s => {
      const sTopics = [...s.topics, ...(customTopics[s.id] || [])];
      return {
        ...s,
        topics: sTopics.map(t => ({
          ...t,
          subtopics: [...t.subtopics, ...(customSubtopics[t.id] || [])]
        }))
      };
    });
  }, [subjects, customTopics, customSubtopics]);

  const overallPct = useMemo(() => getOverallProgress(augmentedSubjects, checked), [augmentedSubjects, checked]);

  const totalItems = useMemo(() => {
    let t = 0;
    augmentedSubjects.forEach(s => { t += getAllCheckableKeys(s).length; });
    return t;
  }, [augmentedSubjects]);

  const doneItems = useMemo(() => {
    let d = 0;
    augmentedSubjects.forEach(s => {
      getAllCheckableKeys(s).forEach(k => { if (checked[k]) d++; });
    });
    return d;
  }, [augmentedSubjects, checked]);

  /* ─── Layout for graph view ───────────────── */
  const layout: { hubs: SubjectHub[]; topics: TopicNode[] } = useMemo(() => {
    const cx = VIEW_W / 2;
    const cy = VIEW_H / 2;
    const n = Math.max(augmentedSubjects.length, 1);
    const hubs: SubjectHub[] = augmentedSubjects.map((s, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      return {
        kind: 'subject',
        subjectId: s.id,
        x: cx + Math.cos(angle) * HUB_ORBIT,
        y: cy + Math.sin(angle) * HUB_ORBIT,
      };
    });

    const topics: TopicNode[] = [];
    augmentedSubjects.forEach((s, si) => {
      const hub = hubs[si];
      const tn = Math.max(s.topics.length, 1);
      s.topics.forEach((t, ti) => {
        const angle = (ti / tn) * Math.PI * 2;
        topics.push({
          kind: 'topic',
          subjectId: s.id,
          topicId: t.id,
          x: hub.x + Math.cos(angle) * TOPIC_ORBIT,
          y: hub.y + Math.sin(angle) * TOPIC_ORBIT,
        });
      });
    });
    return { hubs, topics };
  }, [augmentedSubjects]);

  /* ─── Zoom & pan handlers ─────────────────── */
  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    // Convert screen px to svg-world (scaled 0..VIEW_W)
    const sx = (px / rect.width) * VIEW_W;
    const sy = (py / rect.height) * VIEW_H;
    // World-coord under pointer
    const worldX = (sx - pan.x) / zoom;
    const worldY = (sy - pan.y) / zoom;

    const delta = -e.deltaY * 0.0015;
    const nextZoom = Math.min(2.5, Math.max(0.4, zoom * (1 + delta)));
    // Re-translate so world-coord under pointer stays put
    const newPanX = sx - worldX * nextZoom;
    const newPanY = sy - worldY * nextZoom;
    setZoom(nextZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [pan, zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: pan.x,
      origY: pan.y,
    };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragRef.current.active || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dx = (e.clientX - dragRef.current.startX) * (VIEW_W / rect.width);
    const dy = (e.clientY - dragRef.current.startY) * (VIEW_H / rect.height);
    setPan({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current.active = false;
  }, []);

  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    // Click on background closes panel
    if (e.target === svgRef.current || (e.target as Element).getAttribute('data-bg') === '1') {
      setFocusedTopicId(null);
    }
  }, []);

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(2.5, z * 1.2)), []);
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(0.4, z / 1.2)), []);
  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);
  const handleFit = useCallback(() => {
    setZoom(0.85);
    setPan({ x: VIEW_W * 0.075, y: VIEW_H * 0.05 });
  }, []);

  /* ─── Checkbox handlers ───────────────────── */
  const toggleCheck = useCallback((key: string) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleTopicWithSubtopics = useCallback((topic: Topic) => {
    setChecked(prev => {
      const allKeys = [topic.id, ...topic.subtopics.map((_, si) => `${topic.id}_sub${si}`)];
      const allChecked = allKeys.every(k => prev[k]);
      const newState = { ...prev };
      allKeys.forEach(k => { newState[k] = !allChecked; });
      return newState;
    });
  }, []);

  const handleDoubtClick = useCallback(
    (e: React.MouseEvent, topicName: string, subjectName: string) => {
      e.stopPropagation();
      navigate(`/chat?topic=${encodeURIComponent(topicName)}&subject=${encodeURIComponent(subjectName)}&class=${encodeURIComponent(`Class ${selectedClass}`)}`);
    },
    [navigate, selectedClass]
  );

  const handleNodeDoubt = useCallback((subjectName: string, topicName: string) => {
    navigate(`/chat?topic=${encodeURIComponent(topicName)}&subject=${encodeURIComponent(subjectName)}&class=${encodeURIComponent(`Class ${selectedClass}`)}`);
  }, [navigate, selectedClass]);

  const toggleSubjectExpand = useCallback((subjectId: string) => {
    setExpandedSubject(prev => (prev === subjectId ? null : subjectId));
  }, []);

  const toggleTopicExpand = useCallback((topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  }, []);

  const handleAddCustomTopic = useCallback((e: React.FormEvent, subjectId: string) => {
    e.preventDefault();
    const name = newTopicName[subjectId]?.trim();
    if (!name) return;

    const topicId = `custom_topic_${subjectId}_${Date.now()}`;
    const newTopic: Topic = { id: topicId, name, subtopics: [] };

    setCustomTopics(prev => {
      const subjectTopics = prev[subjectId] || [];
      return { ...prev, [subjectId]: [...subjectTopics, newTopic] };
    });

    setNewTopicName(prev => ({ ...prev, [subjectId]: '' }));
  }, [newTopicName]);

  const handleAddCustomSubtopic = useCallback((e: React.FormEvent, topicId: string) => {
    e.preventDefault();
    const name = newSubtopicName[topicId]?.trim();
    if (!name) return;

    setCustomSubtopics(prev => {
      const topicSubs = prev[topicId] || [];
      return { ...prev, [topicId]: [...topicSubs, name] };
    });

    setNewSubtopicName(prev => ({ ...prev, [topicId]: '' }));
  }, [newSubtopicName]);

  const handleDeleteCustomTopic = useCallback((subjectId: string, topicId: string) => {
    setCustomTopics(prev => {
      const subjectTopics = prev[subjectId] || [];
      return { ...prev, [subjectId]: subjectTopics.filter(t => t.id !== topicId) };
    });
    setCustomSubtopics(prev => {
      const copy = { ...prev };
      delete copy[topicId];
      return copy;
    });
  }, []);

  const handleDeleteCustomSubtopic = useCallback((topicId: string, subName: string) => {
    setCustomSubtopics(prev => {
      const topicSubs = prev[topicId] || [];
      return { ...prev, [topicId]: topicSubs.filter(sub => sub !== subName) };
    });
  }, []);

  /* ─── Focused topic & panel data ──────────── */
  const focusedTopic: { topic: Topic; subject: SubjectSyllabus } | null = useMemo(() => {
    if (!focusedTopicId) return null;
    for (const s of augmentedSubjects) {
      const t = s.topics.find(tp => tp.id === focusedTopicId);
      if (t) return { topic: t, subject: s };
    }
    return null;
  }, [focusedTopicId, augmentedSubjects]);

  /* ─── Render ──────────────────────────────── */
  return (
    <PageContainer className="animate-fade-in">
      <PageHeader>
        <div className="titles">
          <h2>Syllabus Constellation Hub</h2>
          <p>Visualize your mastery as interconnected star-clusters. Complete topics to light up the network.</p>
        </div>
        <ViewToggle>
          <ViewToggleButton active={view === 'graph'} onClick={() => setView('graph')}>
            <Icon name="graph" size={14} /> Graph
          </ViewToggleButton>
          <ViewToggleButton active={view === 'list'} onClick={() => setView('list')}>
            <Icon name="list" size={14} /> List
          </ViewToggleButton>
        </ViewToggle>
      </PageHeader>

      {/* ─── CLASS TABS ─── */}
      <ClassTabs>
        {syllabusData.map(cls => (
          <ClassTab
            key={cls.classNumber}
            active={selectedClass === cls.classNumber}
            onClick={() => setSelectedClass(cls.classNumber)}
          >
            {cls.label}
          </ClassTab>
        ))}
      </ClassTabs>

      {/* ─── OVERALL PROGRESS ─── */}
      <OverallProgressCard
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        key={selectedClass}
      >
        <OverallStats>
          <OverallRing pct={overallPct} color="var(--primary)">
            <span>{overallPct}%</span>
          </OverallRing>
          <OverallText>
            <h3>Overall Progress — {currentSyllabus?.label}</h3>
            <p>{doneItems} of {totalItems} items completed</p>
          </OverallText>
        </OverallStats>
        <OverallBar>
          <ProgressBarTrack>
            <ProgressBarFill
              color="var(--primary)"
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </ProgressBarTrack>
          <ProgressLabel>
            <span>{subjects.length} subjects</span>
            <span>{overallPct}% complete</span>
          </ProgressLabel>
        </OverallBar>
      </OverallProgressCard>

      {/* ─── GRAPH VIEW ─── */}
      {view === 'graph' && (
        <GraphContainer
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <HudOverlay>
            <HudPill>
              <Icon name="zoom-in" size={12} /> {Math.round(zoom * 100)}%
            </HudPill>
            <HudButton onClick={handleZoomIn} title="Zoom in"><Icon name="zoom-in" size={14} /></HudButton>
            <HudButton onClick={handleZoomOut} title="Zoom out"><Icon name="zoom-out" size={14} /></HudButton>
            <HudButton onClick={handleFit} title="Fit all"><Icon name="fit" size={14} /></HudButton>
            <HudButton onClick={handleReset} title="Reset view"><Icon name="reset" size={14} /></HudButton>
          </HudOverlay>

          <LegendOverlay>
            {augmentedSubjects.map(s => (
              <LegendChip
                key={s.id}
                color={glowColor(s.id)}
                active={activeLegend === s.id}
                onClick={() => setActiveLegend(prev => (prev === s.id ? null : s.id))}
                title={`${s.name} — ${getSubjectProgress(s, checked)}%`}
              >
                <span className="dot" />
                {s.name}
              </LegendChip>
            ))}
          </LegendOverlay>

          <StyledSvg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="xMidYMid meet"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleSvgClick}
          >
            <defs>
              {GLOW_PALETTE.map((c, i) => (
                <filter id={GLOW_FILTER_IDS[i]} key={GLOW_FILTER_IDS[i]} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feFlood floodColor={c} floodOpacity="0.9" />
                  <feComposite in2="blur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            <g data-bg="1" transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              <rect data-bg="1" x={-2000} y={-2000} width={4000} height={4000} fill="transparent" />

              {/* Connection lines: hub <-> topics */}
              {layout.hubs.map(hub => {
                const subject = augmentedSubjects.find(s => s.id === hub.subjectId);
                if (!subject) return null;
                const subjectPct = getSubjectProgress(subject, checked);
                const allDone = subjectPct === 100;
                const stroke = glowColor(hub.subjectId);
                const filterId = allDone ? glowFilterId(hub.subjectId) : undefined;
                return (
                  <g key={`hub-${hub.subjectId}`}>
                    {layout.topics
                      .filter(t => t.subjectId === hub.subjectId)
                      .map(t => {
                        const topicDone = checked[t.topicId] === true;
                        return (
                          <line
                            key={`edge-${t.topicId}`}
                            x1={hub.x}
                            y1={hub.y}
                            x2={t.x}
                            y2={t.y}
                            stroke={stroke}
                            strokeOpacity={topicDone ? 0.9 : 0.18}
                            strokeWidth={topicDone ? 1.5 : 0.8}
                            filter={topicDone ? `url(#${glowFilterId(hub.subjectId)})` : undefined}
                          />
                        );
                      })}
                    {/* Subject perimeter ring */}
                    {allDone && (
                      <circle
                        cx={hub.x}
                        cy={hub.y}
                        r={HUB_R + 8}
                        fill="none"
                        stroke={stroke}
                        strokeOpacity={0.5}
                        strokeWidth={1.5}
                        filter={`url(#${filterId})`}
                      />
                    )}
                  </g>
                );
              })}

              {/* Subject hubs */}
              {layout.hubs.map(hub => {
                const subject = augmentedSubjects.find(s => s.id === hub.subjectId);
                if (!subject) return null;
                const stroke = glowColor(hub.subjectId);
                const isDimmed = activeLegend !== null && activeLegend !== hub.subjectId;
                return (
                  <g
                    key={`s-${hub.subjectId}`}
                    style={{
                      cursor: 'pointer',
                      opacity: isDimmed ? 0.35 : 1,
                      transition: 'opacity 0.2s',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveLegend(hub.subjectId);
                      const firstTopic = subject.topics[0];
                      if (firstTopic) setFocusedTopicId(firstTopic.id);
                    }}
                  >
                    <defs>
                      <radialGradient id={`grad-${hub.subjectId}`}>
                        <stop offset="0%" stopColor={stroke} stopOpacity="0.45" />
                        <stop offset="100%" stopColor={stroke} stopOpacity="0.05" />
                      </radialGradient>
                    </defs>
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r={HUB_R + 14}
                      fill={`url(#grad-${hub.subjectId})`}
                    />
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r={HUB_R}
                      fill="var(--bg-darker)"
                      stroke={stroke}
                      strokeWidth={2}
                    />
                    <foreignObject x={hub.x - 12} y={hub.y - 12} width={24} height={24}>
                      <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stroke }}>
                        <SubjectGlyph subjectId={hub.subjectId} size={22} color={stroke} />
                      </div>
                    </foreignObject>
                    <text
                      x={hub.x}
                      y={hub.y + HUB_R + 22}
                      textAnchor="middle"
                      fill="var(--text-main)"
                      style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}
                    >
                      {subject.name}
                    </text>
                    <text
                      x={hub.x}
                      y={hub.y + HUB_R + 38}
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      style={{ fontSize: 10, fontWeight: 500, fontFamily: 'Inter, sans-serif' }}
                    >
                      {getSubjectProgress(subject, checked)}% · {subject.topics.length} topics
                    </text>
                  </g>
                );
              })}

              {/* Topic nodes */}
              {layout.topics.map(tn => {
                const subject = augmentedSubjects.find(s => s.id === tn.subjectId);
                if (!subject) return null;
                const topic = subject.topics.find(t => t.id === tn.topicId);
                if (!topic) return null;
                const done = checked[tn.topicId] === true;
                const allSubsDone = topic.subtopics.every((_, si) => checked[`${tn.topicId}_sub${si}`]);
                const fullyDone = done && allSubsDone;
                const stroke = glowColor(tn.subjectId);
                const isHovered = hoveredTopicId === tn.topicId;
                const isDimmed = activeLegend !== null && activeLegend !== tn.subjectId;
                return (
                  <g
                    key={`t-${tn.topicId}`}
                    style={{ cursor: 'pointer', opacity: isDimmed ? 0.3 : 1, transition: 'opacity 0.2s' }}
                    onMouseEnter={() => setHoveredTopicId(tn.topicId)}
                    onMouseLeave={() => setHoveredTopicId(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveLegend(tn.subjectId);
                      setFocusedTopicId(tn.topicId);
                    }}
                  >
                    {isHovered && (
                      <circle
                        cx={tn.x}
                        cy={tn.y}
                        r={TOPIC_R + 8}
                        fill="none"
                        stroke={stroke}
                        strokeOpacity={0.5}
                        strokeWidth={1.5}
                      />
                    )}
                    <circle
                      cx={tn.x}
                      cy={tn.y}
                      r={TOPIC_R}
                      fill={fullyDone ? stroke : 'var(--bg-darker)'}
                      stroke={stroke}
                      strokeWidth={2}
                      filter={fullyDone ? `url(#${glowFilterId(tn.subjectId)})` : undefined}
                    />
                    {fullyDone && (
                      <circle cx={tn.x} cy={tn.y} r={4} fill="#fff" />
                    )}
                    {isHovered && (
                      <g>
                        <rect
                          x={tn.x - 70}
                          y={tn.y - TOPIC_R - 32}
                          width={140}
                          height={22}
                          rx={6}
                          fill="var(--bg-darker)"
                          stroke={stroke}
                          strokeOpacity={0.5}
                        />
                        <text
                          x={tn.x}
                          y={tn.y - TOPIC_R - 17}
                          textAnchor="middle"
                          fill="var(--text-main)"
                          style={{ fontSize: 10, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
                        >
                          {topic.name.length > 22 ? topic.name.slice(0, 21) + '…' : topic.name}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </StyledSvg>
        </GraphContainer>
      )}

      {/* ─── LIST VIEW (fallback) ─── */}
      {view === 'list' && (
        <SubjectGrid
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {augmentedSubjects.map((subject, idx) => {
            const pct = getSubjectProgress(subject, checked);
            const isExpanded = expandedSubject === subject.id;

            return (
              <SubjectCard
                key={subject.id}
                accentColor={glowColor(subject.id)}
                expanded={isExpanded}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.35 }}
                layout
              >
                <SubjectCardHeader
                  accentColor={glowColor(subject.id)}
                  onClick={() => toggleSubjectExpand(subject.id)}
                >
                  <div className="subject-icon">
                    <SubjectGlyph subjectId={subject.id} size={22} color={glowColor(subject.id)} />
                  </div>
                  <div className="subject-info">
                    <h4>{subject.name}</h4>
                    <span className="meta">
                      {subject.topics.length} topics · {pct}% done
                    </span>
                  </div>
                  <span className="chevron">
                    <Icon name="chevron-down" size={14} />
                  </span>
                </SubjectCardHeader>

                <SubjectProgressMini>
                  <SubjectProgressBar>
                    <SubjectProgressFill
                      color={glowColor(subject.id)}
                      initial={false}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </SubjectProgressBar>
                </SubjectProgressMini>

                <AnimatePresence>
                  {isExpanded && (
                    <TopicList
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      {subject.topics.map(topic => {
                        const topicExpanded = expandedTopics.has(topic.id);
                        const topicCompleted = checked[topic.id] || false;
                        const allSubDone = topic.subtopics.every(
                          (_, si) => checked[`${topic.id}_sub${si}`]
                        );

                        return (
                          <TopicItem key={topic.id}>
                            <TopicRow completed={topicCompleted && allSubDone}>
                              <TopicExpandArrow
                                expanded={topicExpanded}
                                onClick={(e: React.MouseEvent) => toggleTopicExpand(topic.id, e)}
                              >
                                <Icon name="chevron-right" size={12} />
                              </TopicExpandArrow>

                              <Checkbox
                                checked={topicCompleted}
                                accentColor={glowColor(subject.id)}
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  toggleTopicWithSubtopics(topic);
                                }}
                              >
                                <Icon name="check" size={12} />
                                <input type="checkbox" readOnly checked={topicCompleted} />
                              </Checkbox>

                              <span
                                className="topic-name"
                                onClick={(e: React.MouseEvent) => toggleTopicExpand(topic.id, e)}
                              >
                                {topic.name}
                              </span>

                              {topic.id.startsWith('custom_topic_') && (
                                <DeleteBtn
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCustomTopic(subject.id, topic.id);
                                  }}
                                  title="Delete custom topic"
                                >
                                  <Icon name="trash" size={12} />
                                </DeleteBtn>
                              )}

                              <DoubtButton
                                accentColor={glowColor(subject.id)}
                                onClick={(e) => handleDoubtClick(e, topic.name, subject.name)}
                                title={`Ask AI about ${topic.name}`}
                              >
                                <Icon name="message" size={14} />
                              </DoubtButton>
                            </TopicRow>

                            <AnimatePresence>
                              {topicExpanded && (
                                <InnerSubtopicList
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                >
                                  {topic.subtopics.map((sub, si) => {
                                    const subKey = `${topic.id}_sub${si}`;
                                    const subChecked = checked[subKey] || false;
                                    const staticSubsCount = syllabusData.find(c => c.classNumber === selectedClass)?.subjects.find(s => s.id === subject.id)?.topics.find(t => t.id === topic.id)?.subtopics.length || 0;
                                    const isCustomSub = topic.id.startsWith('custom_topic_') || si >= staticSubsCount;

                                    return (
                                      <InnerSubtopicRow
                                        key={subKey}
                                        completed={subChecked}
                                        onClick={() => toggleCheck(subKey)}
                                      >
                                        <SmallCheckbox
                                          checked={subChecked}
                                          accentColor={glowColor(subject.id)}
                                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                        >
                                          <Icon name="check" size={9} />
                                          <input type="checkbox" readOnly checked={subChecked} />
                                        </SmallCheckbox>
                                        <span className="subtopic-name">{sub}</span>

                                        {isCustomSub && (
                                          <DeleteBtn
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteCustomSubtopic(topic.id, sub);
                                            }}
                                            title="Delete custom subtopic"
                                          >
                                            <Icon name="trash" size={12} />
                                          </DeleteBtn>
                                        )}

                                        <DoubtButton
                                          accentColor={glowColor(subject.id)}
                                          onClick={(e) => handleDoubtClick(e, `${topic.name} - ${sub}`, subject.name)}
                                          title={`Ask AI about ${sub}`}
                                        >
                                          <Icon name="message" size={12} />
                                        </DoubtButton>
                                      </InnerSubtopicRow>
                                    );
                                  })}

                                  <AddCustomForm
                                    onSubmit={(e) => handleAddCustomSubtopic(e, topic.id)}
                                    style={{ padding: '0.4rem 0.5rem', background: 'transparent', borderTop: 'none' }}
                                  >
                                    <CustomInput
                                      type="text"
                                      placeholder="+ Add subtopic..."
                                      value={newSubtopicName[topic.id] || ''}
                                      onChange={(e) => setNewSubtopicName(prev => ({ ...prev, [topic.id]: e.target.value }))}
                                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                                    />
                                    <CustomAddButton
                                      type="submit"
                                      accentColor={glowColor(subject.id)}
                                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                                    >
                                      Add Sub
                                    </CustomAddButton>
                                  </AddCustomForm>
                                </InnerSubtopicList>
                              )}
                            </AnimatePresence>
                          </TopicItem>
                        );
                      })}

                      <AddCustomForm onSubmit={(e) => handleAddCustomTopic(e, subject.id)}>
                        <CustomInput
                          type="text"
                          placeholder="+ Add missed topic..."
                          value={newTopicName[subject.id] || ''}
                          onChange={(e) => setNewTopicName(prev => ({ ...prev, [subject.id]: e.target.value }))}
                        />
                        <CustomAddButton type="submit" accentColor={glowColor(subject.id)}>Add Topic</CustomAddButton>
                      </AddCustomForm>
                    </TopicList>
                  )}
                </AnimatePresence>
              </SubjectCard>
            );
          })}
        </SubjectGrid>
      )}

      {/* ─── SLIDE-OUT PANEL ─── */}
      <PanelOverlay open={!!focusedTopic} onClick={() => setFocusedTopicId(null)} />
      <AnimatePresence>
        {focusedTopic && (
          <Panel
            key={focusedTopic.topic.id}
            accentColor={glowColor(focusedTopic.subject.id)}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          >
            <PanelHeader>
              <div>
                <div className="label">
                  <span className="dot" style={{ background: glowColor(focusedTopic.subject.id) }} />
                  {focusedTopic.subject.name}
                </div>
                <h3>{focusedTopic.topic.name}</h3>
              </div>
              <CloseBtn onClick={() => setFocusedTopicId(null)} title="Close">
                <Icon name="x" size={16} />
              </CloseBtn>
            </PanelHeader>

            <Section>
              <div className="section-label">Subtopics</div>
              <SubtopicList>
                {focusedTopic.topic.subtopics.length === 0 ? (
                  <SubtopicRow
                    completed={false}
                    accentColor={glowColor(focusedTopic.subject.id)}
                    as="div"
                  >
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      No subtopics defined yet.
                    </span>
                  </SubtopicRow>
                ) : (
                  focusedTopic.topic.subtopics.map((sub, si) => {
                    const subKey = `${focusedTopic.topic.id}_sub${si}`;
                    const subChecked = !!checked[subKey];
                    return (
                      <SubtopicRow
                        key={subKey}
                        completed={subChecked}
                        accentColor={glowColor(focusedTopic.subject.id)}
                      >
                        <SubtopicCheck
                          checked={subChecked}
                          accentColor={glowColor(focusedTopic.subject.id)}
                          onClick={() => toggleCheck(subKey)}
                        >
                          <Icon name="check" size={10} />
                        </SubtopicCheck>
                        <span style={{ flex: 1 }}>{sub}</span>
                      </SubtopicRow>
                    );
                  })
                )}
              </SubtopicList>
            </Section>

            <Section>
              <div className="section-label">Actions</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <ActionBtn
                  $variant="primary"
                  accentColor={glowColor(focusedTopic.subject.id)}
                  onClick={() => toggleTopicWithSubtopics(focusedTopic.topic)}
                >
                  <Icon name="check" size={14} />
                  {checked[focusedTopic.topic.id] ? 'Mark incomplete' : 'Mark complete'}
                </ActionBtn>
                <ActionBtn
                  $variant="secondary"
                  accentColor={glowColor(focusedTopic.subject.id)}
                  onClick={() => handleNodeDoubt(focusedTopic.subject.name, focusedTopic.topic.name)}
                >
                  <Icon name="sparkle" size={14} />
                  Ask AI
                </ActionBtn>
              </div>
            </Section>
          </Panel>
        )}
      </AnimatePresence>

      <Footer>
        <p>© 2026 Axona™. Engineered by Abhranil Sen.</p>
        <p>Track every chapter. Master every subject.</p>
      </Footer>
    </PageContainer>
  );
};

export default Constellation;
