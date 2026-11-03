import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  db, 
  doc, 
  safeGetDoc as getDoc 
} from '../services/firebase';
import { motion } from 'framer-motion';
import { getSyllabus } from '../data/syllabusData';

/* ─── FULL-WIDTH DASHBOARD — Clean grid layout, no 3D viewport ─── */

const DashboardWrapper = styled(motion.div)`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 2rem;
`;

/* ── Glass Card (frosted glass with gradient top border) ──────── */
const GlassCard = styled(motion.div)`
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: 18px;
  padding: 1.5rem;
  color: var(--text-main);
  outline: none;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #2DD4BF, #38BDF8, transparent);
    opacity: 0.3;
  }
`;

/* ── Top Row: Welcome + Quick Stats ──────────────────────────── */
const TopRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const WelcomeCard = styled(GlassCard)`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-main);
    font-family: 'Outfit', sans-serif;
  }

  p {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-top: 0.25rem;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    font-family: monospace;
    color: #10b981;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }
`;

const MotivationCard = styled(GlassCard)`
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(45, 212, 191, 0.04) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.4rem;
  border-left: 3px solid var(--primary);

  .quote {
    font-size: 0.85rem;
    line-height: 1.5;
    font-style: italic;
    color: var(--text-main);
    font-weight: 500;
  }

  .author {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    align-self: flex-end;
  }
`;

/* ── Stats Grid: 4 cards in a row ────────────────────────────── */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled(GlassCard)`
  padding: 1.25rem;
  transition: all 0.35s var(--transition-smooth);

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background: var(--gradient-neural);
    border-radius: 2px;
    transition: width 0.35s var(--transition-smooth);
  }

  &:hover::after {
    width: 60%;
  }

  .icon-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .icon-circle {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .label {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--text-muted);
    font-weight: 600;
  }

  .value {
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--text-main);
    margin-top: 0.2rem;
    font-family: 'Outfit', sans-serif;
    line-height: 1;
  }

  .sub {
    font-size: 0.72rem;
    color: var(--text-muted);
    margin-top: 0.3rem;
  }
`;

/* ── Middle Row: Syllabus + Quick Actions ────────────────────── */
const MiddleRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SyllabusCard = styled(GlassCard)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  .title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      font-size: 1rem;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
      color: #fff;
    }

    .badge {
      font-size: 0.6rem;
      font-weight: 700;
      color: #001e1e;
      background: var(--primary);
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
  }

  .syllabus-info {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .subject-list {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    margin-top: 0.25rem;
  }

  .subject-item {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;

    .subject-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .bar-track {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 10px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

  .warp-btn {
    margin-top: 0.5rem;
    background: rgba(45, 212, 191, 0.08);
    border: 1px solid var(--glass-border);
    color: var(--primary);
    padding: 0.65rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
    outline: none;

    &:hover {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
      box-shadow: 0 4px 12px var(--primary-glow);
    }
  }
`;

const ActionsCard = styled(GlassCard)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  h3 {
    font-size: 1rem;
    font-weight: 700;
    font-family: 'Outfit', sans-serif;
    color: #fff;
    margin-bottom: 0.25rem;
  }
`;

const ActionButton = styled(motion.button)<{ $variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 0.85rem 1.2rem;
  background: ${p => p.$variant === 'primary' ? 'var(--gradient-neural)' : 'var(--glass-bg)'};
  border: 1px solid ${p => p.$variant === 'primary' ? 'transparent' : 'var(--glass-border)'};
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  color: var(--text-main);
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.3px;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, var(--glass-border), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const SysLabel = styled.div`
  font-family: monospace;
  font-size: 0.65rem;
  color: var(--text-muted);
  opacity: 0.7;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 0.5rem 0 0.25rem 0.25rem;
`;

/* ── Feature Shortcuts Grid ──────────────────────────────────── */
const ShortcutsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ShortcutCard = styled(GlassCard)`
  padding: 1.25rem;
  cursor: pointer;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  transition: all 0.3s var(--transition-smooth);

  &:hover {
    border-color: rgba(45, 212, 191, 0.4);
    box-shadow: 0 8px 24px rgba(45, 212, 191, 0.12);
    transform: translateY(-2px);
  }

  .shortcut-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .shortcut-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-main);
  }

  .shortcut-desc {
    font-size: 0.7rem;
    color: var(--text-muted);
    line-height: 1.3;
  }
`;

const MOTIVATIONAL_SPEECHES = [
  { quote: "Arise, awake, and stop not till the goal is reached.", author: "Swami Vivekananda" },
  { quote: "You have to dream before your dreams can come true.", author: "APJ Abdul Kalam" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.", author: "Thomas A. Edison" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "Strength is life, weakness is death.", author: "Swami Vivekananda" },
  { quote: "All of us do not have equal talent. But all of us have an equal opportunity to develop our talents.", author: "APJ Abdul Kalam" }
];

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [quote, setQuote] = useState({ quote: '', author: '' });
  
  useEffect(() => {
    const random = MOTIVATIONAL_SPEECHES[Math.floor(Math.random() * MOTIVATIONAL_SPEECHES.length)];
    setQuote(random);
  }, []);

  const [stats, setStats] = useState({ totalTime: '0h 0m', streak: '0', streakCount: 0, subjectCount: 0, totalMinutes: 0 });

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.email) return;

      const diaryRef = doc(db, 'users', currentUser.email, 'data', 'diary');
      const docSnap = await getDoc(diaryRef);
      const logs = docSnap.exists() ? docSnap.data().logs || [] : [];
      
      const totalMinutes = logs.reduce((acc: number, log: any) => acc + parseFloat(log.duration || 0), 0);
      const h = Math.floor(totalMinutes / 60);
      const m = Math.round(totalMinutes % 60);
      
      const subjects = new Set(logs.map((l: any) => l.subject));
      
      // Calculate active streak
      const sortedDates = Array.from(new Set(logs.map((l: any) => l.date)))
        .map(d => new Date(d as string))
        .sort((a, b) => b.getTime() - a.getTime());

      let currentStreak = 0;
      let checkDate = new Date();
      checkDate.setHours(0,0,0,0);

      if (sortedDates.length > 0) {
        const firstDate = new Date(sortedDates[0]);
        firstDate.setHours(0,0,0,0);
        const diffDays = Math.floor((checkDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24));
        
        if (diffDays === 0 || diffDays === 1) {
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
        totalTime: `${h}h ${m}m`,
        streak: `${currentStreak}`,
        streakCount: currentStreak,
        subjectCount: subjects.size,
        totalMinutes
      });
    };
    fetchData();
  }, [currentUser]);

  const [progressData, setProgressData] = useState<{ name: string; pct: number; color: string }[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    
    let classNum = 10;
    if (currentUser.class) {
      const match = currentUser.class.match(/\d+/);
      if (match) classNum = parseInt(match[0]);
    }

    const userBoard = currentUser.board || 'CBSE';
    const userExam = currentUser.targetExam || 'Board Exams';
    const email = currentUser.email;

    const subjects = getSyllabus(userBoard, userExam, classNum);

    const cleanBoard = userBoard.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanExam = userExam.toLowerCase().replace(/[^a-z0-9]/g, '');
    const storageKey = `axona_syllabus_${email}_${cleanBoard}_${cleanExam}_class${classNum}`;

    try {
      const saved = localStorage.getItem(storageKey);
      const checkedState = saved ? JSON.parse(saved) : {};
      
      const parsed = subjects.map(s => {
        let total = 0;
        let done = 0;
        s.topics.forEach(topic => {
          total++;
          if (checkedState[topic.id]) done++;
          topic.subtopics.forEach((_, si) => {
            total++;
            if (checkedState[`${topic.id}_sub${si}`]) done++;
          });
        });
        const pct = total === 0 ? 0 : Math.round((done / total) * 100);
        return { name: s.name, pct, color: s.color };
      });
      setProgressData(parsed);
    } catch (err) {
      console.error("Failed to parse syllabus progress for dashboard:", err);
    }
  }, [currentUser]);

  const level = Math.floor(Math.sqrt((stats.totalMinutes * 10) / 200)) + 1;

  // ── Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 120, damping: 16 } 
    }
  };

  const cardHoverProps = {
    whileHover: { 
      scale: 1.015, 
      borderColor: 'rgba(45, 212, 191, 0.35)', 
      boxShadow: '0 8px 24px rgba(45, 212, 191, 0.12), 0 4px 12px rgba(56, 189, 248, 0.08)',
    },
    whileTap: { scale: 0.99 }
  };

  const buttonHoverProps = {
    whileHover: { 
      scale: 1.02, 
      backgroundColor: '#2DD4BF',
      borderColor: '#2DD4BF',
      boxShadow: '0 0 20px rgba(45, 212, 191, 0.35), 0 0 40px rgba(56, 189, 248, 0.12)' 
    },
    whileTap: { scale: 0.98 }
  };

  return (
    <DashboardWrapper
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Row 1: Welcome + Motivation ──────────────────────── */}
      <TopRow>
        <WelcomeCard variants={itemVariants} {...cardHoverProps}>
          <div>
            <h2>Welcome back, {currentUser?.name || 'Scholar'}</h2>
            <p>Let's crush your goals today.</p>
          </div>
          <div className="status">● Active</div>
        </WelcomeCard>

        {quote.quote && (
          <MotivationCard variants={itemVariants}>
            <div className="quote">"{quote.quote}"</div>
            <div className="author">— {quote.author}</div>
          </MotivationCard>
        )}
      </TopRow>

      {/* ── Row 2: Stats Grid ────────────────────────────────── */}
      <SysLabel>// Neuro-Metrics</SysLabel>
      <StatsGrid>
        <StatCard variants={itemVariants} {...cardHoverProps}>
          <div className="icon-row">
            <div className="label">Total Study</div>
            <div className="icon-circle" style={{ background: 'rgba(45, 212, 191, 0.1)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div className="value">{stats.totalTime}</div>
          <div className="sub">All sessions combined</div>
        </StatCard>

        <StatCard variants={itemVariants} {...cardHoverProps}>
          <div className="icon-row">
            <div className="label">Streak</div>
            <div className="icon-circle" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
          </div>
          <div className="value" style={{ color: stats.streakCount > 0 ? '#f59e0b' : 'var(--text-main)' }}>
            {stats.streak} <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.7 }}>days</span>
          </div>
          <div className="sub">Consecutive days</div>
        </StatCard>

        <StatCard variants={itemVariants} {...cardHoverProps}>
          <div className="icon-row">
            <div className="label">Subjects</div>
            <div className="icon-circle" style={{ background: 'rgba(56, 189, 248, 0.1)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
          </div>
          <div className="value">{stats.subjectCount}</div>
          <div className="sub">Active fields</div>
        </StatCard>

        <StatCard variants={itemVariants} {...cardHoverProps}>
          <div className="icon-row">
            <div className="label">Level</div>
            <div className="icon-circle" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
          </div>
          <div className="value">{level}</div>
          <div className="sub">{stats.totalMinutes} XP earned</div>
        </StatCard>
      </StatsGrid>

      {/* ── Row 3: Syllabus Progress + Quick Actions ─────────── */}
      <MiddleRow>
        <SyllabusCard variants={itemVariants}>
          <div className="title-row">
            <h3>Syllabus Synergy</h3>
            <span className="badge">Active Track</span>
          </div>
          <div className="syllabus-info">
            {currentUser?.board} · {currentUser?.targetExam} · {currentUser?.class}
          </div>
          <div className="subject-list">
            {progressData.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No active subjects selected. Complete setup to begin.
              </div>
            ) : (
              progressData.map(sub => (
                <div key={sub.name} className="subject-item">
                  <div className="subject-meta">
                    <span>{sub.name}</span>
                    <span>{sub.pct}%</span>
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${sub.pct}%`, backgroundColor: sub.color, boxShadow: `0 0 8px ${sub.color}aa` }} 
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="warp-btn" onClick={() => navigate('/constellation')}>
            Warp to Syllabus Hub
          </button>
        </SyllabusCard>

        <ActionsCard variants={itemVariants}>
          <h3>Quick Actions</h3>
          <ActionButton $variant="primary" onClick={() => navigate('/timer')} {...buttonHoverProps}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            Start Deep Focus Session
          </ActionButton>
          <ActionButton onClick={() => navigate('/revision')} {...buttonHoverProps}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9M3 20h9M3 4h18M3 8h18M3 12h18M3 16h18"/>
            </svg>
            Generate AI Revision Notes
          </ActionButton>
          <ActionButton onClick={() => navigate('/chat')} {...buttonHoverProps}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Ask Oracle AI a Doubt
          </ActionButton>
          <ActionButton onClick={() => navigate('/diary')} {...buttonHoverProps}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Log Study Session
          </ActionButton>
        </ActionsCard>
      </MiddleRow>

      {/* ── Row 4: Feature Shortcuts ─────────────────────────── */}
      <SysLabel>// Neural Engine</SysLabel>
      <ShortcutsGrid>
        <ShortcutCard variants={itemVariants} onClick={() => navigate('/planner')}>
          <div className="shortcut-icon" style={{ background: 'rgba(45, 212, 191, 0.1)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          </div>
          <div className="shortcut-label">Atlas Planner</div>
          <div className="shortcut-desc">AI-generated study schedules</div>
        </ShortcutCard>

        <ShortcutCard variants={itemVariants} onClick={() => navigate('/mentor')}>
          <div className="shortcut-icon" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="shortcut-label">Progress Coach</div>
          <div className="shortcut-desc">AI mentoring & weak areas</div>
        </ShortcutCard>

        <ShortcutCard variants={itemVariants} onClick={() => navigate('/leaderboard')}>
          <div className="shortcut-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <div className="shortcut-label">Leaderboard</div>
          <div className="shortcut-desc">Rank among scholars</div>
        </ShortcutCard>

        <ShortcutCard variants={itemVariants} onClick={() => navigate('/tracker')}>
          <div className="shortcut-icon" style={{ background: 'rgba(56, 189, 248, 0.1)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div className="shortcut-label">Momentum Tracker</div>
          <div className="shortcut-desc">Focus metrics & habits</div>
        </ShortcutCard>

        <ShortcutCard variants={itemVariants} onClick={() => navigate('/weakarea')}>
          <div className="shortcut-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>    
          <div className="shortcut-label">Weak Areas</div>
          <div className="shortcut-desc">Target your gaps</div>
        </ShortcutCard>

        <ShortcutCard variants={itemVariants} onClick={() => navigate('/profile')}>
          <div className="shortcut-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div className="shortcut-label">Profile</div>
          <div className="shortcut-desc">Settings & preferences</div>
        </ShortcutCard>
      </ShortcutsGrid>


    </DashboardWrapper>
  );
};

export default Dashboard;
