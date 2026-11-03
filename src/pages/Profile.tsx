import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  db, 
  doc, 
  safeGetDoc as getDoc 
} from '../services/firebase';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  background: var(--glass-bg);
  padding: 2rem;
  border-radius: 24px;
  border: 1px solid var(--glass-border);

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .info {
    flex: 1;
    width: 100%;
    h2 { font-size: 1.8rem; margin-bottom: 0.2rem; font-weight: 800; background: linear-gradient(to right, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    p { color: var(--text-muted); }
    .meta { font-size: 0.9rem; font-weight: 600; color: var(--primary); margin-top: 0.5rem; }
    
    input {
      background: rgba(255,255,255,0.1);
      border: 1px solid var(--primary);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      color: white;
      font-size: 1.5rem;
      font-weight: 700;
      width: 100%;
      max-width: 300px;
      margin-bottom: 0.5rem;
      outline: none;

      @media (max-width: 640px) {
        margin: 0 auto 0.5rem auto;
        text-align: center;
      }
    }
  }
`;

const AvatarRing = styled(motion.div)<{ level: number }>`
  position: relative;
  width: 105px;
  height: 105px;
  border-radius: 50%;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: pointer;
  flex-shrink: 0;
  
  /* Dynamic gradient border depending on level */
  background: ${props => {
    if (props.level >= 7) return 'linear-gradient(135deg, #f43f5e, #ec4899, #38bdf8)';
    if (props.level >= 5) return 'linear-gradient(135deg, #f59e0b, #eab308, #d97706)';
    if (props.level >= 3) return 'linear-gradient(135deg, #2dd4bf, #0ea5e9, #3b82f6)';
    return 'linear-gradient(135deg, #22d3ee, #06b6d4, #3b82f6)';
  }};
  
  /* Dynamic neon box-shadow glowing outwards and inwards */
  box-shadow: ${props => {
    if (props.level >= 7) return '0 0 25px rgba(244, 63, 94, 0.7), inset 0 0 15px rgba(244, 63, 94, 0.4)';
    if (props.level >= 5) return '0 0 20px rgba(245, 158, 11, 0.6), inset 0 0 12px rgba(245, 158, 11, 0.3)';
    if (props.level >= 3) return '0 0 15px rgba(45, 212, 191, 0.5), inset 0 0 10px rgba(45, 212, 191, 0.2)';
    return '0 0 10px rgba(34, 211, 238, 0.4), inset 0 0 8px rgba(34, 211, 238, 0.2)';
  }};

  /* Subtly pulse the outer glow for Level 7+ */
  animation: ${props => props.level >= 7 ? 'superGlow 2s infinite alternate' : 'none'};

  @keyframes superGlow {
    from { box-shadow: 0 0 20px rgba(244, 63, 94, 0.5), inset 0 0 12px rgba(244, 63, 94, 0.3); }
    to { box-shadow: 0 0 35px rgba(244, 63, 94, 0.8), inset 0 0 20px rgba(244, 63, 94, 0.5); }
  }

  &::before {
    content: '';
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: #020617; /* Slate 950 to block the gradient inside */
    z-index: 1;
  }

  .avatar-inner {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--glass-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: background 0.3s;
  }

  .level-badge {
    position: absolute;
    bottom: -6px;
    right: -6px;
    z-index: 10;
    background: ${props => {
      if (props.level >= 7) return 'linear-gradient(135deg, #f43f5e, #ec4899)';
      if (props.level >= 5) return 'linear-gradient(135deg, #f59e0b, #eab308)';
      if (props.level >= 3) return 'linear-gradient(135deg, #2dd4bf, #0ea5e9)';
      return 'linear-gradient(135deg, #22d3ee, #3b82f6)';
    }};
    color: white;
    padding: 3px 8px;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.2);
  }

  .edit-overlay {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 800;
    color: white;
    z-index: 5;
    opacity: 0;
    transition: opacity 0.2s;
    backdrop-filter: var(--glass-blur);
  }

  &:hover .edit-overlay {
    opacity: 1;
  }
`;

const AvatarSelector = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  width: 100%;
  animation: slideUp 0.3s ease;

  label {
    font-size: 0.8rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
  }

  .avatar-grid {
    display: flex;
    gap: 0.6rem;
    overflow-x: auto;
    padding: 0.5rem 0.2rem;
    scrollbar-width: thin;
    
    &::-webkit-scrollbar {
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }
  }

  .avatar-item {
    font-size: 2rem;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid var(--glass-border);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: scale(1.15) translateY(-2px);
      border-color: var(--primary);
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 5px 15px rgba(var(--primary-hsl), 0.2);
    }
    
    &.active {
      background: linear-gradient(135deg, var(--primary), var(--accent));
      border-color: white;
      box-shadow: 0 0 15px var(--primary-glow);
      transform: scale(1.1);
    }
  }
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
`;

const InfoCard = styled.div`
  background: var(--glass-bg);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  position: relative;
  
  label {
    display: block;
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  span {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .chip {
    padding: 0.25rem 0.75rem;
    background: rgba(255,255,255,0.05);
    border-radius: 12px;
    font-size: 0.8rem;
    border: 1px solid var(--glass-border);
    transition: all 0.2s;
    &.active {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }
  }

  .edit-btn {
    position: absolute;
    top: 1.2rem;
    right: 1.2rem;
    font-size: 0.75rem;
    color: white;
    background: var(--primary);
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
    transition: transform 0.2s;
    box-shadow: 0 4px 10px var(--primary-glow);
    &:hover { transform: scale(1.05); }
  }

  select {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--glass-border);
    padding: 0.5rem;
    border-radius: 8px;
    color: white;
    outline: none;
  }
`;

const ActionButton = styled.button`
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;
`;

const AVAILABLE_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'English', 'Computer Science', 'Economics'];
const CLASSES = ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'College', 'Other'];

const CARTOON_AVATARS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'
];

const BadgeIcon: React.FC<{ id: string }> = ({ id }) => {
  switch (id) {
    case 'novice':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c0 2-.52 3.5-3.1 9.2A7 7 0 0 1 11 20z" />
          <path d="M9 22c0-3 2-5 2-5" />
        </svg>
      );
    case 'scholar':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'focusMaster':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'nightOwl':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    case 'earlyBird':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      );
    case 'overload':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
        </svg>
      );
    case 'streak':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
          <path d="M3 20h18" />
        </svg>
      );
    case 'supercharged':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'olympian':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      );
    case 'polymath':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5-1.25-2.5-3.5-2.5-6s1-4.75 2.5-6M19.5 16.5c1.5-1.25 2.5-3.5 2.5-6s-1-4.75-2.5-6" />
          <path d="M12 2v20M4.5 8c3 1 5.5 3 7.5 4s4.5-3 7.5-4M4.5 16c3-1 5.5-3 7.5-4s4.5 3 7.5 4" />
        </svg>
      );
    case 'planner':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case 'streakKing':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    default:
      return null;
  }
};

const ACHIEVEMENTS = [
  { id: 'novice', name: 'Neuro-Seed', desc: 'Started your neural journey', color: '#3b82f6' },
  { id: 'scholar', name: 'Knowledge Seeker', desc: 'Logged 5+ study sessions', color: '#10b981' },
  { id: 'focusMaster', name: 'Deep Work Guardian', desc: 'Completed a 50min Focus session', color: '#2dd4bf' },
  { id: 'nightOwl', name: 'Night Owl', desc: 'Studied after 10:00 PM', color: '#0ea5e9' },
  { id: 'earlyBird', name: 'Early Bird', desc: 'Started before 7:00 AM', color: '#f59e0b' },
  { id: 'overload', name: 'Neuro-Master', desc: '10+ hours of total study', color: '#f43f5e' },
  { id: 'streak', name: 'Consistency King', desc: '3+ day study streak', color: '#ec4899' },
  { id: 'supercharged', name: 'Supercharged Focus', desc: 'Completed 5+ Focus sessions', color: '#f59e0b' },
  { id: 'olympian', name: 'Olympiad Champion', desc: 'Generated an Olympiad challenge', color: '#10b981' },
  { id: 'polymath', name: 'The Polymath', desc: 'Studied 3+ different subjects', color: '#3b82f6' },
  { id: 'planner', name: 'Master Planner', desc: 'Generated an AI study schedule', color: '#2dd4bf' },
  { id: 'streakKing', name: 'Unstoppable Force', desc: '5+ day study streak', color: '#f43f5e' }
];

const LevelBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin-top: 1rem;
  overflow: hidden;
  position: relative;
`;

const LevelProgress = styled.div<{ progress: number }>`
  width: ${props => props.progress}%;
  height: 100%;
  background: linear-gradient(to right, var(--primary), var(--accent));
  box-shadow: 0 0 15px var(--primary-glow);
  transition: width 1s ease-out;
`;
const BadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const BadgeCard = styled.div<{ unlocked: boolean }>`
  background: var(--glass-bg);
  border: 1px solid ${props => props.unlocked ? 'var(--primary)' : 'var(--glass-border)'};
  border-radius: 20px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  opacity: ${props => props.unlocked ? 1 : 0.4};
  filter: ${props => props.unlocked ? 'none' : 'grayscale(80%)'};
  box-shadow: ${props => props.unlocked ? '0 10px 20px var(--primary-glow)' : 'none'};

  &:hover {
    transform: ${props => props.unlocked ? 'translateY(-5px)' : 'none'};
  }

  .icon {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 0.75rem;
  }

  h4 {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: ${props => props.unlocked ? 'white' : 'var(--text-muted)'};
  }

  p {
    font-size: 0.8rem;
    color: var(--text-muted);
    line-height: 1.4;
  }
`;

const calculateLevel = (totalMinutes: number) => {
  const totalXp = Math.round(totalMinutes * 10);
  // Level formula: Level = floor(sqrt(XP/200)) + 1 (Slightly harder progression)
  const level = Math.floor(Math.sqrt(totalXp / 200)) + 1;
  const currentLevelMinXp = Math.pow(level - 1, 2) * 200;
  const nextLevelMinXp = Math.pow(level, 2) * 200;
  const progress = ((totalXp - currentLevelMinXp) / (nextLevelMinXp - currentLevelMinXp)) * 100;
  
  return { level, xp: totalXp, progress: Math.min(100, Math.max(0, progress)), nextXp: nextLevelMinXp };
};

const Profile: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editDob, setEditDob] = useState(currentUser?.dob || '');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(currentUser?.subjects || []);
  const [selectedClass, setSelectedClass] = useState(currentUser?.class || '');
  const [selectedBoard, setSelectedBoard] = useState(currentUser?.board || '');
  const [selectedTargetExam, setSelectedTargetExam] = useState(currentUser?.targetExam || '');
  const [stats, setStats] = useState({ totalHours: '0h', streak: '0 Days', totalMinutes: 0 });
  const [badges, setBadges] = useState<Record<string, boolean>>({});
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || '');

  // Synchronize state when currentUser loads asynchronously
  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditDob(currentUser.dob || '');
      setSelectedSubjects(currentUser.subjects || []);
      setSelectedClass(currentUser.class || '');
      setSelectedAvatar(currentUser.avatar || '');
      setSelectedBoard(currentUser.board || '');
      setSelectedTargetExam(currentUser.targetExam || '');
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.email) return;

      const diaryRef = doc(db, 'users', currentUser.email, 'data', 'diary');
      const docSnap = await getDoc(diaryRef);
      const logs = docSnap.exists() ? docSnap.data().logs || [] : [];
      
      const focusCountKey = `ff_focus_count_${currentUser.email}`;
      const focusCount = parseInt(localStorage.getItem(focusCountKey) || '0');
      
      const totalMinutes = logs.reduce((acc: number, log: any) => acc + parseFloat(log.duration || 0), 0);
      const h = Math.floor(totalMinutes / 60);
      const m = Math.round(totalMinutes % 60);

      let hasNightOwl = false;
      let hasEarlyBird = false;
      
      logs.forEach((log: any) => {
        if (log.timestamp) {
          const hour = new Date(log.timestamp).getHours();
          if (hour >= 22 || hour <= 4) hasNightOwl = true;
          if (hour >= 5 && hour <= 7) hasEarlyBird = true;
        }
      });

      const sortedDates = Array.from(new Set(logs.map((l: any) => l.date)))
        .map(d => new Date(d as string))
        .sort((a, b) => b.getTime() - a.getTime());

      let currentStreak = 0;
      if (sortedDates.length > 0) {
        const checkDate = new Date();
        checkDate.setHours(0,0,0,0);
        const firstDate = new Date(sortedDates[0]);
        firstDate.setHours(0,0,0,0);
        const diffDays = Math.floor((checkDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24));
        
        if (diffDays <= 1) {
          currentStreak = 1;
          let prevDate = firstDate;
          for (let i = 1; i < sortedDates.length; i++) {
            const d = new Date(sortedDates[i]);
            d.setHours(0,0,0,0);
            const diff = Math.floor((prevDate.getTime() - d.getTime()) / (1000 * 3600 * 24));
            if (diff === 1) {
              currentStreak++;
              prevDate = d;
            } else break;
          }
        }
      }

      setStats({
        totalHours: `${h}h ${m}m`,
        streak: `${currentStreak} Days`,
        totalMinutes
      });

      // Compute unique subjects studied in logs
      const studiedSubjects = new Set(logs.map((l: any) => l.subject).filter(Boolean));

      setBadges({
        novice: true,
        scholar: logs.length >= 5,
        focusMaster: focusCount >= 1,
        nightOwl: hasNightOwl,
        earlyBird: hasEarlyBird,
        overload: totalMinutes >= 600,
        streak: currentStreak >= 3,
        supercharged: focusCount >= 5,
        olympian: localStorage.getItem(`ff_olympiad_generated_${currentUser.email}`) === 'true',
        polymath: studiedSubjects.size >= 3,
        planner: localStorage.getItem(`ff_planner_generated_${currentUser.email}`) === 'true',
        streakKing: currentStreak >= 5
      });
    };
    fetchData();
  }, [currentUser]);

  const levelData = calculateLevel(stats.totalMinutes);

  const toggleSubject = (s: string) => {
    setSelectedSubjects(prev => prev.includes(s) ? prev.filter(sub => sub !== s) : [...prev, s]);
  };

  const handleSave = () => {
    updateProfile({ 
      name: editName, 
      dob: editDob, 
      subjects: selectedSubjects, 
      class: selectedClass,
      avatar: selectedAvatar,
      board: selectedBoard,
      targetExam: selectedTargetExam
    });
    setIsEditing(false);
    alert("Neuro-Profile updated successfully!");
  };

  return (
    <ProfileContainer className="animate-fade-in">
      <ProfileHeader>
        <AvatarRing 
          level={levelData.level}
          onClick={() => setIsEditing(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="avatar-inner">
            {selectedAvatar ? selectedAvatar : (currentUser?.name?.[0]?.toUpperCase() || 'S')}
          </div>
          {isEditing && <div className="edit-overlay">Edit Avatar</div>}
          <div className="level-badge">Lvl {levelData.level}</div>
        </AvatarRing>
        <div className="info">
          {isEditing ? (
            <>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
              <AvatarSelector>
                <label>Select Cartoon Profile Picture</label>
                <div className="avatar-grid">
                  {CARTOON_AVATARS.map(avatar => (
                    <div 
                      key={avatar} 
                      className={`avatar-item ${selectedAvatar === avatar ? 'active' : ''}`}
                      onClick={() => setSelectedAvatar(avatar)}
                    >
                      {avatar}
                    </div>
                  ))}
                </div>
              </AvatarSelector>
            </>
          ) : (
            <h2>{currentUser?.name || 'Student'}</h2>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem', marginTop: isEditing ? '1.2rem' : '0.5rem' }}>
            <span>Neuro-Level {levelData.level}</span>
            <span>{levelData.xp} / {levelData.nextXp} XP</span>
          </div>
          <LevelBar><LevelProgress progress={levelData.progress} /></LevelBar>
          <div className="meta" style={{ marginTop: '0.8rem' }}>{currentUser?.class}</div>
        </div>
      </ProfileHeader>

      <ProfileGrid>
        <InfoCard>
          <label>Academic Status</label>
          {isEditing ? (
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <span>{currentUser?.class || 'Not Set'}</span>
          )}
        </InfoCard>

        <InfoCard>
          <label>Syllabus Board</label>
          {isEditing ? (
            <select value={selectedBoard} onChange={(e) => setSelectedBoard(e.target.value)}>
              {['CBSE', 'ICSE', 'WBBSE', 'Other'].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          ) : (
            <span>{currentUser?.board || 'Not Set'}</span>
          )}
        </InfoCard>

        <InfoCard>
          <label>Target Exam</label>
          {isEditing ? (
            <select value={selectedTargetExam} onChange={(e) => setSelectedTargetExam(e.target.value)}>
              {['Board Exams', 'JEE', 'NEET', 'School Exams', 'Other'].map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </select>
          ) : (
            <span>{currentUser?.targetExam || 'Not Set'}</span>
          )}
        </InfoCard>

        <InfoCard>
          <label>Study Minutes</label>
          <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{Math.round(stats.totalMinutes)} Min</span>
        </InfoCard>
        
        <InfoCard style={{ gridColumn: '1 / -1' }}>
          <label>Your Subjects</label>
          <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
          
          <div className="chips">
            {(isEditing ? AVAILABLE_SUBJECTS : currentUser?.subjects || []).map(s => (
              <div 
                key={s} 
                className={`chip ${selectedSubjects.includes(s) ? 'active' : ''}`}
                onClick={() => isEditing && toggleSubject(s)}
                style={{ cursor: isEditing ? 'pointer' : 'default' }}
              >
                {s}
              </div>
            ))}
          </div>
          {isEditing && <ActionButton onClick={handleSave}>Save Changes</ActionButton>}
        </InfoCard>

        <InfoCard>
          <label>Total Neural Time</label>
          <span>{stats.totalHours}</span>
        </InfoCard>
        <InfoCard>
          <label>Active Streak</label>
          <span style={{ color: '#f43f5e' }}>{stats.streak}</span>
        </InfoCard>
      </ProfileGrid>

      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
          </svg>
          Neuro-Achievements
        </h3>
        <p style={{ color: 'var(--text-muted)' }}>Level up and study smarter to unlock premium badges.</p>
        
        <BadgeGrid>
          {ACHIEVEMENTS.map(badge => (
            <BadgeCard key={badge.id} unlocked={!!badges[badge.id]}>
              <span className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BadgeIcon id={badge.id} />
              </span>
              <h4>{badge.name}</h4>
              <p>{badge.desc}</p>
            </BadgeCard>
          ))}
        </BadgeGrid>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', paddingBottom: '2rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
          Axona™ Engineered by <span style={{ color: 'var(--primary)' }}>Abhranil Sen</span>
        </p>
      </div>
    </ProfileContainer>
  );
};

export default Profile;
