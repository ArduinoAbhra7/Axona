import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { 
  db, 
  doc, 
  safeGetDoc as getDoc, 
  safeSetDoc as setDoc 
} from '../services/firebase';
import { getSyllabus } from '../data/syllabusData';
import OpenAI from 'openai';

const DiaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const DiaryForm = styled.div`
  background: var(--glass-bg);
  padding: 2rem;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
  input, select, textarea {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--glass-border);
    padding: 0.85rem 1rem;
    border-radius: 12px;
    color: var(--text-main);
    font-size: 0.95rem;
    outline: none;
    &:focus { border-color: var(--primary); }
  }
  textarea { min-height: 100px; resize: vertical; }
`;

const LogButton = styled.button`
  background: var(--primary);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { opacity: 0.9; transform: translateY(-2px); }
`;

const HistorySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DiaryEntry = styled.div`
  background: var(--glass-bg);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.2s;

  .entry-info {
    h4 { font-size: 1.1rem; color: var(--primary); margin-bottom: 0.25rem; }
    .date { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem; }
    .content { font-size: 0.95rem; line-height: 1.5; color: var(--text-main); }
  }

  .duration {
    background: rgba(var(--primary-hsl), 0.1);
    color: var(--primary);
    padding: 0.4rem 0.8rem;
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.85rem;
  }
`;

const DEFAULT_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'English', 'Computer Science'];

const QUOTES = [
  "Success is the sum of small efforts, repeated day-in and day-out.",
  "The secret of getting ahead is getting started.",
  "It always seems impossible until it's done.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "You don't have to be great to start, but you have to start to be great."
];

const QuoteModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 1.5rem;

  .card {
    background: linear-gradient(135deg, var(--glass-bg) 0%, rgba(255, 255, 255, 0.03) 100%);
    padding: 2.5rem;
    border-radius: 28px;
    border: 1px solid var(--glass-border);
    max-width: 580px;
    width: 100%;
    box-shadow: var(--card-shadow), 0 0 30px rgba(45, 212, 191, 0.1);
    position: relative;
    overflow-y: auto;
    max-height: 90vh;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--gradient-neural);
    }
  }

  h2 { font-size: 1.7rem; font-weight: 800; font-family: 'Outfit', sans-serif; margin-bottom: 0.5rem; background: var(--gradient-neural); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .quote-sec { font-size: 0.95rem; line-height: 1.5; font-style: italic; color: var(--text-muted); margin-top: 1.5rem; border-top: 1px solid var(--glass-border); padding-top: 1rem; text-align: center; }
  button {
    background: var(--gradient-neural);
    color: white;
    border: none;
    padding: 0.85rem 2.2rem;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 1.5rem;
    width: 100%;
    box-shadow: 0 5px 15px rgba(45, 212, 191, 0.2);
    transition: all 0.2s;
    &:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(45, 212, 191, 0.3); }
  }
`;

const AnalysisReport = styled.div`
  text-align: left;
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: 'Inter', sans-serif;

  .section-title {
    font-size: 0.72rem;
    font-weight: 800;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.25rem;
  }

  .feedback-text {
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--text-main);
  }

  .matched-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.2rem;
  }

  .matched-pill {
    padding: 0.3rem 0.7rem;
    background: rgba(45, 212, 191, 0.08);
    border: 1px solid rgba(45, 212, 191, 0.2);
    border-radius: 20px;
    font-size: 0.75rem;
    color: var(--primary);
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .no-match {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-style: italic;
  }

  .tips-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding-left: 1.2rem;
    margin-top: 0.2rem;
    
    li {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.4;
      list-style-type: disc;
    }
  }
`;

const getLocalStorageKey = (email: string, classNum: number, board: string, exam: string): string => {
  const cleanBoard = board.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanExam = exam.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `axona_syllabus_${email}_${cleanBoard}_${cleanExam}_class${classNum}`;
};

const matchSyllabusProgress = (
  content: string,
  subjectName: string,
  board: string,
  targetExam: string,
  classNum: number,
  email: string
) => {
  const syllabus = getSyllabus(board, targetExam, classNum);
  const matchedSubject = syllabus.find(s => s.name.toLowerCase() === subjectName.toLowerCase() || 
    (subjectName.toLowerCase() === 'physical science' && (s.name.toLowerCase() === 'physics' || s.name.toLowerCase() === 'chemistry')) ||
    (subjectName.toLowerCase() === 'life science' && s.name.toLowerCase() === 'biology')
  );
  
  if (!matchedSubject) return [];

  const matchedSubtopics: string[] = [];
  const storageKey = getLocalStorageKey(email, classNum, board, targetExam);
  let checkedState: Record<string, boolean> = {};
  
  const savedState = localStorage.getItem(storageKey);
  if (savedState) {
    try { checkedState = JSON.parse(savedState); } catch { checkedState = {}; }
  }

  const text = content.toLowerCase();

  matchedSubject.topics.forEach(topic => {
    let topicMatched = false;
    
    if (text.includes(topic.name.toLowerCase())) {
      topicMatched = true;
    }

    topic.subtopics.forEach((sub, idx) => {
      const cleanSub = sub.toLowerCase();
      // Fuzzy keywords matching: if the text mentions the exact subtopic name OR all significant keywords of it
      const words = cleanSub.split(' ').filter(w => w.length > 3 && !['with', 'and', 'the', 'for', 'from'].includes(w));
      const hasWordMatches = words.length > 0 && words.every(word => text.includes(word));

      if (text.includes(cleanSub) || hasWordMatches) {
        checkedState[`${topic.id}_sub${idx}`] = true;
        matchedSubtopics.push(sub);
        topicMatched = true;
      }
    });

    if (topicMatched) {
      checkedState[topic.id] = true;
    }
  });

  localStorage.setItem(storageKey, JSON.stringify(checkedState));
  return matchedSubtopics;
};

const getAIAnalysis = async (
  subject: string,
  duration: string,
  content: string,
  detectedSubtopics: string[],
  board: string,
  targetExam: string
) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    const feedback = `Excellent effort! You logged a focused session on ${subject} for ${duration} minutes. This aligns directly with your ${board} / ${targetExam} syllabus. Keeping up this rhythm will significantly boost your retention!`;
    const tips = [
      `Solve 2-3 sample questions on these topics to test your practical understanding.`,
      `Create a 5-minute mind map of these concepts tomorrow to solidify long-term memory.`
    ];
    return { feedback, tips };
  }

  try {
    const openaiInstance = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });

    const prompt = `You are a helpful, student-friendly AI Study Coach. The student just finished a study session.
    Subject: ${subject}
    Duration: ${duration} minutes
    What they studied: "${content}"
    Board/Exam Track: ${board} - ${targetExam}
    Detected covered subtopics: ${detectedSubtopics.join(', ')}
    
    Provide a short, highly motivating, and conversational analysis of their study entry. 
    Highlight what topics they focused on. 
    Give 2 concrete study tips or next steps for these topics.
    Format the response as a JSON object with two keys:
    "feedback" (string, max 3-4 sentences of conversational coach feedback),
    "tips" (array of 2 short strings containing next-step study tips).`;

    const response = await openaiInstance.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(response.choices[0].message.content || '{}');
    return {
      feedback: data.feedback || `Excellent session! Keep up the great work.`,
      tips: data.tips || ['Revise these formulas.', 'Practice more questions.']
    };
  } catch (err) {
    console.error("OpenAI failed, using fallback:", err);
    const feedback = `Excellent effort! You logged a focused session on ${subject} for ${duration} minutes. This aligns directly with your ${board} / ${targetExam} syllabus. Keeping up this rhythm will significantly boost your retention!`;
    const tips = [
      `Solve 2-3 sample questions on these topics to test your practical understanding.`,
      `Create a 5-minute mind map of these concepts tomorrow to solidify long-term memory.`
    ];
    return { feedback, tips };
  }
};

const Diary: React.FC = () => {
  const { currentUser } = useAuth();
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('');
  const [content, setContent] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [showQuote, setShowQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ feedback: string; tips: string[]; matched: string[] } | null>(null);

  // Get subjects from profile OR use default list if empty
  const availableSubjects = (currentUser?.subjects && currentUser.subjects.length > 0) 
    ? currentUser.subjects 
    : DEFAULT_SUBJECTS;

  useEffect(() => {
    const fetchLogs = async () => {
      if (currentUser?.email) {
        const diaryRef = doc(db, 'users', currentUser.email, 'data', 'diary');
        const docSnap = await getDoc(diaryRef);
        if (docSnap.exists()) {
          setLogs(docSnap.data().logs || []);
        }
      }
    };
    fetchLogs();
  }, [currentUser]);


  const handleAddLog = async () => {
    if (!subject || !duration || !content || !currentUser?.email) return;
    
    setAnalysisLoading(true);
    setAnalysisResult(null);

    const newLog = {
      id: Date.now(),
      subject,
      duration,
      content,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      timestamp: Date.now()
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    
    const diaryRef = doc(db, 'users', currentUser.email, 'data', 'diary');
    await setDoc(diaryRef, { logs: updatedLogs }, { merge: true });
    
    // Parse class number
    let classNum = 10;
    if (currentUser.class) {
      const match = currentUser.class.match(/\d+/);
      if (match) classNum = parseInt(match[0]);
    }

    // Match syllabus keywords
    const matched = matchSyllabusProgress(
      content,
      subject,
      currentUser.board || 'CBSE',
      currentUser.targetExam || 'Board Exams',
      classNum,
      currentUser.email
    );

    // Call AI coach analysis
    const analysis = await getAIAnalysis(
      subject,
      duration,
      content,
      matched,
      currentUser.board || 'CBSE',
      currentUser.targetExam || 'Board Exams'
    );

    setAnalysisResult({
      feedback: analysis.feedback,
      tips: analysis.tips,
      matched
    });
    
    // Reset form
    setSubject('');
    setDuration('');
    setContent('');
    setAnalysisLoading(false);
    
    // Show modal
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setCurrentQuote(randomQuote);
    setShowQuote(true);
  };

  return (
    <DiaryContainer className="animate-fade-in">
      <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>NeuroLog™ - Study Diary</h2>
      <p style={{ color: 'var(--text-muted)' }}>Wrap up your day by logging what you've learned.</p>

      <DiaryForm>
        <h3>New Entry</h3>
        <FormGrid>
          <InputGroup>
            <label>Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">Select Subject</option>
              {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              <option value="Other">Other</option>
            </select>

          </InputGroup>
          <InputGroup>
            <label>Duration (minutes)</label>
            <input type="number" placeholder="e.g. 60" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </InputGroup>
        </FormGrid>
        <InputGroup>
          <label>What did you study today?</label>
          <textarea 
            placeholder="Describe the topics, concepts, or exercises you completed..." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </InputGroup>
        <LogButton onClick={handleAddLog}>Save to Diary</LogButton>
      </DiaryForm>

      <HistorySection>
        <h3>Recent Entries</h3>
        {logs.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>No entries yet. Start logging your progress!</p>
        ) : (
          logs.map(log => (
            <DiaryEntry key={log.id}>
              <div className="entry-info">
                <h4>{log.subject}</h4>
                <div className="date">{log.date}</div>
                <div className="content">{log.content}</div>
              </div>
              <div className="duration">{log.duration}m</div>
            </DiaryEntry>
          ))
        )}
      </HistorySection>

      <div style={{ textAlign: 'center', marginTop: '2rem', paddingBottom: '2rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
          Study Engine Built by <span style={{ color: 'var(--primary)' }}>Abhranil (abhracoder)</span>
        </p>
      </div>

      {showQuote && (
        <QuoteModal>
          <div className="card animate-fade-in">
            <h2>AI Neural Analysis</h2>
            
            {analysisLoading ? (
              <div style={{ padding: '2rem 0', color: 'var(--primary)', fontWeight: 600 }}>
                Running cognitive diagnostics...
              </div>
            ) : analysisResult ? (
              <AnalysisReport>
                <div>
                  <div className="section-title">AI Study Coach Feedback</div>
                  <div className="feedback-text">{analysisResult.feedback}</div>
                </div>

                <div>
                  <div className="section-title">Syllabus Synchronization</div>
                  {analysisResult.matched.length > 0 ? (
                    <div>
                      <div className="matched-list">
                        {analysisResult.matched.map(subtopic => (
                          <div key={subtopic} className="matched-pill">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {subtopic}
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: 500 }}>
                        ✓ Unlocked & glowing in your Syllabus Constellation!
                      </div>
                    </div>
                  ) : (
                    <div className="no-match">
                      No direct syllabus subtopics matched. Write in detail next time to auto-sync!
                    </div>
                  )}
                </div>

                <div>
                  <div className="section-title">Neuro-Coach Study Tips</div>
                  <ul className="tips-list">
                    {analysisResult.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </AnalysisReport>
            ) : null}

            <div className="quote-sec">
              "{currentQuote}"
            </div>
            
            <button onClick={() => { setShowQuote(false); setAnalysisResult(null); }}>
              Keep Conquering
            </button>
          </div>
        </QuoteModal>
      )}
    </DiaryContainer>
  );
};

export default Diary;
