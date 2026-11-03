import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Groq from "groq-sdk";
import { useAuth } from '../context/AuthContext';
import { 
  db, 
  doc, 
  safeGetDoc as getDoc 
} from '../services/firebase';

const AnalysisContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const InsightCard = styled.div`
  background: var(--glass-bg);
  padding: 2rem;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--card-shadow);
  
  h3 { color: var(--primary); margin-bottom: 1rem; }
  p { line-height: 1.6; color: var(--text-muted); }
  
  .topics {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1.5rem;
  }
`;

const TopicChip = styled.div<{ intensity: 'high' | 'medium' | 'low' }>`
  padding: 0.75rem 1.25rem;
  background: ${props => 
    props.intensity === 'high' ? 'rgba(244, 63, 94, 0.1)' : 
    props.intensity === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 
    'rgba(16, 185, 129, 0.1)'};
  border: 1px solid ${props => 
    props.intensity === 'high' ? '#f43f5e' : 
    props.intensity === 'medium' ? '#f59e0b' : 
    '#10b981'};
  color: ${props => 
    props.intensity === 'high' ? '#f43f5e' : 
    props.intensity === 'medium' ? '#f59e0b' : 
    '#10b981'};
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
`;

const WeakArea: React.FC = () => {
  const { currentUser } = useAuth();
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const runAnalysis = async () => {
      if (!currentUser?.email) return;

      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      const diaryRef = doc(db, 'users', currentUser.email, 'data', 'diary');
      const docSnap = await getDoc(diaryRef);
      const logs = docSnap.exists() ? JSON.stringify(docSnap.data().logs) : null;
      
      if (!apiKey || !logs) return;

      setLoading(true);
      try {
        const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

        const prompt = `Act as an expert AI Progress Coach. Analyze these study logs: ${logs}. 
        Identify patterns in when the student studies (e.g., morning, evening) and what subjects they study.
        Give them exactly 1 actionable scheduling tip (e.g., "You focus more in the evening. Schedule Physics then."). 
        Also identify 1 strong subject and 1 weak subject. 
        Keep the entire response under 4 sentences. Speak directly to the student in a highly motivating and personalized tone.`;

        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.1-8b-instant",
        });

        setAnalysis(completion.choices[0]?.message?.content || "Start logging more sessions to unlock AI analysis!");
      } catch (err) {
        setAnalysis("Start logging more sessions in your Study Diary to unlock AI growth analysis!");
      }
      setLoading(false);
    };

    runAnalysis();
  }, [currentUser]);

  return (
    <AnalysisContainer className="animate-fade-in">
      <h2 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--text-main), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        AI Progress Coach
      </h2>
      <p style={{ color: 'var(--text-muted)' }}>Your personal mentor that reads your data and tells you exactly how to optimize your routine.</p>

      <InsightCard>
        <h3>{loading ? 'Coach is analyzing your data...' : 'Your Coaching Feedback'}</h3>
        {analysis ? (
           <p style={{ whiteSpace: 'pre-wrap', fontSize: '1.1rem', color: 'var(--text-main)' }}>{analysis}</p>
        ) : (
          <p>Not enough data yet. Log at least 3 sessions in your Study Diary to see AI insights here!</p>
        )}
      </InsightCard>

    </AnalysisContainer>
  );
};


export default WeakArea;
