import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const OverlayBackdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
`;

const SetupCard = styled(motion.div)`
  width: 100%;
  max-width: 580px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 28px;
  padding: 2.5rem;
  color: var(--text-main);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(45, 212, 191, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--gradient-neural);
  }
`;

const HeaderBlock = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  .brand-logo {
    font-size: 2.2rem;
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    background: var(--gradient-neural);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
    display: inline-block;
  }

  h2 {
    font-size: 1.6rem;
    font-weight: 800;
    font-family: 'Outfit', sans-serif;
    color: #ffffff;
  }

  p {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-top: 0.4rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  input, select {
    background: var(--glass-hover);
    border: 1px solid var(--glass-border);
    padding: 0.8rem 1rem;
    border-radius: 12px;
    color: var(--text-main);
    outline: none;
    font-size: 0.92rem;
    width: 100%;
    transition: all 0.3s ease;
    
    &:focus { 
      border-color: var(--primary); 
      background: rgba(45, 212, 191, 0.04);
      box-shadow: 0 0 15px rgba(45, 212, 191, 0.15);
    }

    option {
      background: var(--select-option-bg);
      color: var(--select-option-text);
    }
  }
`;

const FormGroupRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const SubjectChip = styled.div<{ active: boolean }>`
  padding: 0.45rem 0.9rem;
  border-radius: 20px;
  background: ${props => props.active ? 'var(--primary)' : 'rgba(255,255,255,0.03)'};
  color: ${props => props.active ? 'white' : 'var(--text-muted)'};
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'var(--glass-border)'};
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: ${props => props.active ? 'var(--primary)' : 'rgba(255,255,255,0.08)'};
  }
`;

const SubmitButton = styled(motion.button)`
  background: var(--gradient-neural);
  color: white;
  border: none;
  padding: 0.95rem;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(45, 212, 191, 0.25);
  margin-top: 1rem;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 15px 30px rgba(45, 212, 191, 0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const BOARDS = ['CBSE', 'ICSE', 'WBBSE', 'Other'];
const EXAMS = ['Board Exams', 'JEE', 'NEET', 'School Exams', 'Other'];
const CLASSES = ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'College', 'Other'];

// Curated standard subject lists
const SUBJECT_PRESETS: Record<string, string[]> = {
  JEE: ['Mathematics', 'Physics', 'Chemistry'],
  NEET: ['Biology', 'Physics', 'Chemistry'],
  WBBSE_9_10: ['Mathematics', 'Physical Science', 'Life Science', 'English', 'History', 'Geography'],
  CBSE_9_10: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science'],
  ICSE_9_10: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science'],
  GENERAL: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Economics']
};

export const SetupOverlay: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [board, setBoard] = useState('');
  const [targetExam, setTargetExam] = useState('');
  const [userClass, setUserClass] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Trigger overlay check
  const showSetup = currentUser && (!currentUser.class || !currentUser.subjects || currentUser.subjects.length === 0 || !currentUser.board || !currentUser.targetExam);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setBoard(currentUser.board || '');
      setTargetExam(currentUser.targetExam || '');
      setUserClass(currentUser.class || '');
      setSelectedSubjects(currentUser.subjects || []);
    }
  }, [currentUser]);

  // Dynamically change subjects based on exam or board selection
  useEffect(() => {
    if (targetExam === 'JEE') {
      setSelectedSubjects(SUBJECT_PRESETS.JEE);
    } else if (targetExam === 'NEET') {
      setSelectedSubjects(SUBJECT_PRESETS.NEET);
    } else if ((board === 'WBBSE' || board === 'WBBSE (Madhyamik)') && (userClass === 'Class 9' || userClass === 'Class 10')) {
      setSelectedSubjects(SUBJECT_PRESETS.WBBSE_9_10);
    } else if (board === 'CBSE' && (userClass === 'Class 9' || userClass === 'Class 10')) {
      setSelectedSubjects(SUBJECT_PRESETS.CBSE_9_10);
    } else if (board === 'ICSE' && (userClass === 'Class 9' || userClass === 'Class 10')) {
      setSelectedSubjects(SUBJECT_PRESETS.ICSE_9_10);
    } else {
      // General subjects
      setSelectedSubjects(prev => prev.length > 0 ? prev : ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English']);
    }
  }, [board, targetExam, userClass]);

  if (!showSetup) return null;

  const toggleSubject = (s: string) => {
    if (selectedSubjects.includes(s)) {
      setSelectedSubjects(selectedSubjects.filter(sub => sub !== s));
    } else {
      setSelectedSubjects([...selectedSubjects, s]);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !board || !targetExam || !userClass || selectedSubjects.length === 0) return;
    
    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        board,
        targetExam,
        class: userClass,
        subjects: selectedSubjects,
        tutorialSeen: false // Ensure they get the tutorial as well!
      });
    } catch (err) {
      console.error("Failed to complete profile setup:", err);
    } finally {
      setLoading(false);
    }
  };

  // Determine subjects display pool
  let displaySubjects = SUBJECT_PRESETS.GENERAL;
  if (targetExam === 'JEE') displaySubjects = SUBJECT_PRESETS.JEE;
  else if (targetExam === 'NEET') displaySubjects = SUBJECT_PRESETS.NEET;
  else if (board === 'WBBSE') {
    displaySubjects = Array.from(new Set([...SUBJECT_PRESETS.WBBSE_9_10, ...SUBJECT_PRESETS.GENERAL]));
  }

  return (
    <AnimatePresence>
      <OverlayBackdrop
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <SetupCard
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
          <HeaderBlock>
            <div className="brand-logo">Axona™</div>
            <h2>Complete Your Neural Setup</h2>
            <p>We need a few details to customize your syllabus constellation and AI study tracks.</p>
          </HeaderBlock>

          <Form onSubmit={handleSetupSubmit}>
            <InputGroup>
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="e.g. Abhranil Sen" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </InputGroup>

            <FormGroupRow>
              <InputGroup>
                <label>Syllabus Board</label>
                <select value={board} onChange={(e) => setBoard(e.target.value)} required>
                  <option value="">Select Board</option>
                  {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </InputGroup>

              <InputGroup>
                <label>Target Exam</label>
                <select value={targetExam} onChange={(e) => setTargetExam(e.target.value)} required>
                  <option value="">Select Target</option>
                  {EXAMS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                </select>
              </InputGroup>
            </FormGroupRow>

            <InputGroup>
              <label>Current Class</label>
              <select value={userClass} onChange={(e) => setUserClass(e.target.value)} required>
                <option value="">Select Class</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </InputGroup>

            <InputGroup>
              <label>Study Subjects</label>
              <ChipContainer>
                {displaySubjects.map(s => (
                  <SubjectChip 
                    key={s} 
                    active={selectedSubjects.includes(s)}
                    onClick={() => toggleSubject(s)}
                  >
                    {s}
                  </SubjectChip>
                ))}
              </ChipContainer>
            </InputGroup>

            <SubmitButton 
              type="submit" 
              disabled={loading || !name.trim() || !board || !targetExam || !userClass || selectedSubjects.length === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Initializing Neuro-Sync...' : 'Initialize Axona Engine'}
            </SubmitButton>
          </Form>
        </SetupCard>
      </OverlayBackdrop>
    </AnimatePresence>
  );
};

export default SetupOverlay;
