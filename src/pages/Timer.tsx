import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { 
  db, 
  doc, 
  safeGetDoc as getDoc, 
  safeSetDoc as setDoc 
} from '../services/firebase';
import SpatialAudioMixer from '../components/SpatialAudioMixer';

const TimerContainer = styled.div<{ isFocusMode?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-top: ${props => props.isFocusMode ? '0' : '3rem'};
  transition: all 0.5s ease;

  ${props => props.isFocusMode && `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--bg-gradient);
    z-index: 10000;
    padding: 2rem;
  `}
`;

const QUOTES = [
  "\"Arise, awake, and stop not till the goal is reached.\" — Swami Vivekananda",
  "\"You have to dream before your dreams can come true.\" — APJ Abdul Kalam",
  "\"The only way to do great work is to love what you do.\" — Steve Jobs",
  "\"It always seems impossible until it's done.\" — Nelson Mandela",
  "\"Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.\" — Thomas A. Edison",
  "\"Believe you can and you're halfway there.\" — Theodore Roosevelt",
  "\"Strength is life, weakness is death.\" — Swami Vivekananda",
  "\"All of us do not have equal talent. But all of us have an equal opportunity to develop our talents.\" — APJ Abdul Kalam"
];

const QuoteModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  z-index: 20000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: var(--glass-blur);

  .card {
    background: linear-gradient(135deg, var(--glass-bg), rgba(255,255,255,0.05));
    padding: 3rem;
    border-radius: 24px;
    border: 1px solid var(--primary);
    text-align: center;
    max-width: 500px;
    box-shadow: 0 0 50px rgba(var(--primary-hsl), 0.4);
  }

  h2 { font-size: 2.5rem; margin-bottom: 1rem; background: linear-gradient(to right, var(--text-main), var(--primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  p { font-size: 1.2rem; line-height: 1.6; font-style: italic; color: var(--text-main); margin-bottom: 2rem; }
  button {
    background: var(--primary);
    color: white;
    border: none;
    padding: 1rem 2.5rem;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    font-size: 1.1rem;
    transition: transform 0.2s;
    &:hover { transform: scale(1.05); }
  }
`;

const FormCard = styled.div`
  background: var(--glass-bg);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
  
  label { font-size: 0.9rem; font-weight: 600; color: var(--text-muted); }
  select {
    background: var(--glass-hover);
    border: 1px solid var(--glass-border);
    padding: 0.8rem;
    border-radius: 12px;
    color: var(--text-main);
    outline: none;
    &:focus { border-color: var(--primary); }
  }
`;

const CircularTimer = styled.div<{ progress: number, size?: string }>`
  position: relative;
  width: ${props => props.size || '300px'};
  height: ${props => props.size || '300px'};
  display: flex;
  align-items: center;
  justify-content: center;

  svg { transform: rotate(-90deg); }
  circle { fill: none; stroke-width: 8; stroke-linecap: round; }
  .bg { stroke: var(--glass-border); }
  .progress {
    stroke: var(--primary);
    stroke-dasharray: 879.6;
    stroke-dashoffset: ${props => 879.6 * (1 - props.progress)};
    transition: stroke-dashoffset 1s linear;
  }
  .time-text {
    position: absolute;
    font-size: ${props => props.size ? '5rem' : '3.5rem'};
    font-weight: 700;
    font-family: 'Outfit', sans-serif;
  }
  .subject-text {
    position: absolute;
    top: 70%;
    font-size: 1.2rem;
    color: var(--primary);
    font-weight: 600;
    text-align: center;
    width: 100%;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const TimerButton = styled.button<{ primary?: boolean; danger?: boolean }>`
  padding: 1rem 2rem;
  border-radius: 14px;
  border: 1px solid ${props => props.primary || props.danger ? 'transparent' : 'var(--glass-border)'};
  background: ${props => props.primary ? 'var(--primary)' : props.danger ? '#f43f5e' : 'var(--glass-bg)'};
  color: ${props => props.primary || props.danger ? 'white' : 'var(--text-main)'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.primary ? '0 10px 20px var(--primary-glow)' : 'none'};

  &:hover { transform: translateY(-2px); opacity: 0.9; }
`;

const UnlockModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.9);
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  backdrop-filter: var(--glass-blur);

  .modal-content {
    background: var(--bg-dark);
    padding: 2.5rem;
    border-radius: 24px;
    border: 1px solid #f43f5e;
    text-align: center;
    max-width: 400px;
    width: 100%;
  }

  h3 { color: var(--text-main); margin-bottom: 1rem; font-size: 1.5rem; }
  p { color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.5; }
  
  .code-box {
    background: rgba(var(--primary-hsl), 0.08);
    padding: 1rem;
    border-radius: 12px;
    font-family: monospace;
    font-size: 1.2rem;
    letter-spacing: 2px;
    color: #f43f5e;
    margin-bottom: 1.5rem;
    user-select: none;
  }

  input {
    width: 100%;
    background: var(--glass-hover);
    border: 1px solid var(--glass-border);
    padding: 1rem;
    border-radius: 12px;
    color: var(--text-main);
    font-family: monospace;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    text-align: center;
    outline: none;
    &:focus { border-color: #f43f5e; }
  }

  .btn-group {
    display: flex;
    gap: 1rem;
  }
`;

const Timer: React.FC = () => {
  const { currentUser } = useAuth();
  const [timeLeft, setTimeLeft] = useState(50 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [subject, setSubject] = useState('');
  
  // Lock mode states
  const [showUnlock, setShowUnlock] = useState(false);
  const [unlockCode, setUnlockCode] = useState('');
  const [unlockInput, setUnlockInput] = useState('');
  const [showQuote, setShowQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const [activeQuote, setActiveQuote] = useState('');

  useEffect(() => {
    setActiveQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  const totalTime = 50 * 60;

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let res = '';
    for (let i = 0; i < 15; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const logSessionToDiary = async (minutes: number) => {
    if (!currentUser?.email || minutes <= 0 || !subject) return;
    
    const diaryRef = doc(db, 'users', currentUser.email, 'data', 'diary');
    const docSnap = await getDoc(diaryRef);
    const logs = docSnap.exists() ? docSnap.data().logs || [] : [];
    
    const today = new Date();
    const newLog = {
      id: Date.now().toString(),
      subject,
      content: `Completed ${minutes}m Focus Timer session.`,
      duration: minutes.toString(),
      date: today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      timestamp: today.getTime()
    };
    
    const updatedLogs = [newLog, ...logs];
    await setDoc(diaryRef, { logs: updatedLogs }, { merge: true });
  };

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => console.log("Fullscreen prevented"));
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsFocusMode(false);
      exitFullscreen();
      if (currentUser?.email) {
        logSessionToDiary(50);
        const countKey = `ff_focus_count_${currentUser.email}`;
        const count = parseInt(localStorage.getItem(countKey) || '0');
        localStorage.setItem(countKey, (count + 1).toString());
      }
      const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setCurrentQuote(randomQuote);
      setShowQuote(true);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startFocusMode = () => {
    if (!subject) {
      alert("Please select a subject to study first!");
      return;
    }
    setIsFocusMode(true);
    setIsActive(true);
    setUnlockCode(generateCode());
    enterFullscreen();
  };

  const handleExitAttempt = () => {
    setShowUnlock(true);
    setUnlockInput('');
  };

  const confirmExit = () => {
    if (unlockInput === unlockCode) {
      const minutesStudied = Math.floor((totalTime - timeLeft) / 60);
      logSessionToDiary(minutesStudied);

      setShowUnlock(false);
      setIsFocusMode(false);
      setIsActive(false);
      exitFullscreen();
      setTimeLeft(totalTime); // Reset timer
    } else {
      alert("Incorrect code! Keep focusing!");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = timeLeft / totalTime;

  return (
    <>
      <TimerContainer isFocusMode={isFocusMode} className="animate-fade-in">
        {!isFocusMode && (
          <>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Deep Focus Timer</h2>
            <p style={{ color: 'var(--text-muted)' }}>Lock in. No distractions.</p>

            {activeQuote && (
              <div style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderLeft: '3px solid var(--primary)',
                borderRadius: '14px',
                padding: '1rem 1.25rem',
                maxWidth: '400px',
                width: '100%',
                textAlign: 'left',
                fontSize: '0.82rem',
                fontStyle: 'italic',
                color: 'var(--text-main)',
                lineHeight: 1.4,
                boxShadow: 'var(--card-shadow)'
              }}>
                {activeQuote}
              </div>
            )}

            <FormCard>
              <label>What are you studying?</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="">Select a Subject...</option>
                {currentUser?.subjects?.map((s: string) => <option key={s} value={s}>{s}</option>)}
                <option value="Other">Other</option>
              </select>
            </FormCard>

            <SpatialAudioMixer />
          </>
        )}

        {isFocusMode && (
          <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 10002 }}>
            <SpatialAudioMixer isFocusMode />
          </div>
        )}

        <CircularTimer progress={progress} size={isFocusMode ? '400px' : '300px'}>
          <svg width={isFocusMode ? "400" : "300"} height={isFocusMode ? "400" : "300"} viewBox="0 0 300 300">
            <circle className="bg" cx="150" cy="150" r="140" />
            <circle className="progress" cx="150" cy="150" r="140" />
          </svg>
          <div className="time-text">{formatTime(timeLeft)}</div>
          {isFocusMode && subject && <div className="subject-text">{subject}</div>}
        </CircularTimer>

        <Controls>
          {!isFocusMode ? (
            <TimerButton primary onClick={startFocusMode}>
              Enter Full Focus Mode
            </TimerButton>
          ) : (
            <TimerButton danger onClick={handleExitAttempt}>
              Give Up (Exit Focus Mode)
            </TimerButton>
          )}
        </Controls>
      </TimerContainer>

      {showUnlock && (
        <UnlockModal>
          <div className="modal-content animate-fade-in">
            <h3 style={{ color: '#f43f5e' }}>Distraction Alert</h3>
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.3)', marginBottom: '1.5rem' }}>
              <p style={{ color: 'white', fontWeight: 600, margin: 0, fontSize: '1.1rem' }}>
                You stopped at {Math.floor((totalTime - timeLeft) / 60)} min. Try {Math.ceil(timeLeft / 60)} more to complete a full session!
              </p>
            </div>
            <p style={{ fontSize: '0.9rem' }}>If you really want to break your focus, type this exact 15-character code to unlock:</p>
            <div className="code-box">{unlockCode}</div>
            <input 
              type="text" 
              placeholder="Type code here..." 
              value={unlockInput}
              onChange={(e) => setUnlockInput(e.target.value.toUpperCase())}
              autoComplete="off"
              spellCheck="false"
            />
            <div className="btn-group">
              <TimerButton onClick={() => setShowUnlock(false)} style={{ flex: 1 }}>Cancel</TimerButton>
              <TimerButton danger onClick={confirmExit} style={{ flex: 1 }}>Unlock</TimerButton>
            </div>
          </div>
        </UnlockModal>
      )}

      {showQuote && (
        <QuoteModal>
          <div className="card animate-fade-in">
            <h2>Session Complete!</h2>
            <p>"{currentQuote}"</p>
            <button onClick={() => setShowQuote(false)}>Awesome!</button>
          </div>
        </QuoteModal>
      )}

      {!isFocusMode && (
        <div style={{ textAlign: 'center', marginTop: '2rem', paddingBottom: '2rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
            Focus Tech Developed by <span style={{ color: 'var(--primary)' }}>Abhranil (abhracoder)</span>
          </p>
        </div>
      )}
    </>
  );
};

export default Timer;
