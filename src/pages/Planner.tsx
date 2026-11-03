import React, { useState } from 'react';
import styled from 'styled-components';
import Groq from "groq-sdk";
import { useAuth } from '../context/AuthContext';

const PlannerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FormCard = styled.div`
  background: var(--glass-bg);
  padding: 2rem;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  label { font-size: 0.9rem; font-weight: 600; color: var(--text-muted); }
  input, textarea {
    background: var(--glass-hover);
    border: 1px solid var(--glass-border);
    padding: 1rem;
    border-radius: 12px;
    color: var(--text-main);
    outline: none;
    font-size: 1rem;
    &:focus { border-color: var(--primary); }
  }
`;

const GenerateButton = styled.button`
  width: 100%;
  padding: 1.2rem;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 10px 30px rgba(var(--primary-hsl), 0.3);
  
  &:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
  &:hover:not(:disabled) { transform: translateY(-3px); }
`;

const PlanResult = styled.div`
  background: var(--glass-bg);
  padding: 2rem;
  border-radius: 24px;
  border: 1px solid var(--primary);
  box-shadow: 0 0 40px rgba(var(--primary-hsl), 0.1);
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 1.05rem;
  animation: slideUp 0.5s ease;

  h3 { color: var(--primary); margin-bottom: 1.5rem; font-size: 1.5rem; }
  
  .controls {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--glass-border);
  }
`;

const OutlineButton = styled.button`
  background: transparent;
  border: 1px solid var(--primary);
  color: var(--primary);
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: rgba(var(--primary-hsl), 0.1); }
`;

const Planner: React.FC = () => {
  const { currentUser } = useAuth();
  const [hours, setHours] = useState('');
  const [weakTopics, setWeakTopics] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('');

  const generatePlan = async () => {
    if (!hours) return;
    
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      alert("Please add VITE_GROQ_API_KEY to your .env file!");
      return;
    }

    setLoading(true);
    try {
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
      const userSubjects = currentUser?.subjects?.join(', ') || 'general studies';

      const prompt = `Act as an elite academic planner. Create a highly structured Daily/Weekly Study Plan for a student.
      Context:
      - Subjects they are studying: ${userSubjects}
      - Weak topics they need to focus on: ${weakTopics || 'None specified'}
      - Available study hours today/this week: ${hours} hours.
      
      Output exactly:
      1. A short motivational intro.
      2. A time-blocked schedule (distributing the ${hours} hours effectively, prioritizing weak areas).
      3. Breaks included (e.g. Pomodoro 50/10).
      Keep it highly actionable and formatted cleanly in Markdown.`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
      });

      const responseText = completion.choices[0]?.message?.content || "Generation failed.";
      setPlan(responseText);
      if (currentUser?.email && responseText) {
        localStorage.setItem(`ff_planner_generated_${currentUser.email}`, 'true');
      }
    } catch (error) {
      console.error("Groq Error:", error);
      alert("Failed to generate plan. Check your Groq API key.");
    }
    setLoading(false);
  };

  return (
    <PlannerContainer className="animate-fade-in">
      <div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Atlas™ - AI Planner
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Don't know what to study? Tell AI your goals, and let it build your perfect schedule.
        </p>
      </div>

      <FormCard>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <InputGroup>
            <label>Available Study Hours (e.g., "4" or "2 per day")</label>
            <input 
              type="text" 
              placeholder="How much time do you have?" 
              value={hours} 
              onChange={(e) => setHours(e.target.value)} 
            />
          </InputGroup>
          <InputGroup>
            <label>Weak Topics / Immediate Goals</label>
            <input 
              type="text" 
              placeholder="e.g. Calculus, Cellular Biology" 
              value={weakTopics} 
              onChange={(e) => setWeakTopics(e.target.value)} 
            />
          </InputGroup>
        </div>
        <GenerateButton onClick={generatePlan} disabled={loading || !hours}>
          {loading ? 'Architecting your schedule...' : 'Generate Master Plan'}
        </GenerateButton>
      </FormCard>

      {plan && (
        <PlanResult>
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Your AI Study Blueprint
          </h3>
          <div style={{ color: '#e2e8f0' }}>{plan}</div>
          <div className="controls">
            <OutlineButton onClick={generatePlan} disabled={loading}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }}>
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Regenerate Plan
            </OutlineButton>
          </div>
        </PlanResult>
      )}
    </PlannerContainer>
  );
};

export default Planner;
