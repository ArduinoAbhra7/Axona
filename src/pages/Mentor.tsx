import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import Groq from "groq-sdk";
import { useAuth } from '../context/AuthContext';
import { MentorWaveVisualizer } from '../components/AIPanelVisualizer';
import { db, doc, collection, safeGetDocs, safeSetDoc, safeDeleteDoc } from '../services/firebase';

// ─── Animations ─────────────────────────────────────────────────────
const breathe = keyframes`
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
`;

const MentorPageLayout = styled.div`
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 2.5rem;
  min-height: calc(100vh - 120px);
  align-items: stretch;
  position: relative;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const MentorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  z-index: 10;

  .header {
    h2 { font-size: 2rem; font-weight: 800; color: var(--text-main); font-family: 'Outfit', sans-serif; }
    p { color: var(--text-muted); font-size: 0.95rem; margin-top: 0.25rem; }
  }
`;

const GlassViewport = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  z-index: 10;
`;

const VisualizerWrapper = styled.div`
  @media (max-width: 1024px) {
    display: none;
  }
`;

const ClearButton = styled.button`
  background: transparent;
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #f43f5e;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Outfit', sans-serif;
  
  &:hover {
    background: rgba(244, 63, 94, 0.15);
    border-color: #f43f5e;
  }
`;

const MentorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 60vh;
  min-height: 460px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--card-shadow);

  @media (max-width: 768px) {
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    box-shadow: none;
  }
`;

const MentorHeader = styled.div`
  padding: 1.25rem 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.8rem;
  color: var(--text-muted);
  font-family: monospace;
  letter-spacing: 1px;

  .status {
    color: #10b981;
    animation: ${breathe} 3s ease infinite;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled.div<{ isUser: boolean }>`
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  max-width: 80%;
  padding: 1rem 1.25rem;
  border-radius: ${props => props.isUser ? '18px 18px 2px 18px' : '18px 18px 18px 2px'};
  background: ${props => props.isUser ? 'var(--primary)' : 'var(--glass-bg)'};
  border: ${props => props.isUser ? 'none' : '1px solid var(--glass-border)'};
  backdrop-filter: ${props => props.isUser ? 'none' : 'blur(8px)'};
  -webkit-backdrop-filter: ${props => props.isUser ? 'none' : 'blur(8px)'};
  color: ${props => props.isUser ? '#ffffff' : 'var(--text-main)'};
  font-size: 0.95rem;
  white-space: pre-wrap;
  line-height: 1.5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const InputArea = styled.div`
  padding: 1.25rem;
  background: var(--glass-bg);
  display: flex;
  gap: 1rem;
  border-top: 1px solid var(--glass-border);
`;

const ChatInput = styled.input`
  flex: 1;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  color: var(--text-main);
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.2);
    background: var(--glass-hover);
  }
`;

const SendButton = styled.button`
  background: var(--primary);
  color: white;
  border: none;
  padding: 0 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: scale(1.03);
    box-shadow: 0 0 20px rgba(45, 212, 191, 0.3);
  }
`;

const Mentor: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mentorInputRef = useRef<HTMLInputElement>(null);

  const loadMentorHistory = useCallback(async () => {
    if (!currentUser?.email) return;
    try {
      const chatCol = collection(db, 'users', currentUser.email, 'mentor_chats');
      const snap = await safeGetDocs(chatCol);
      const loaded = snap.docs.map((docSnap: any) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          text: data.text || '',
          isUser: !!data.isUser,
          createdAt: data.createdAt || new Date().toISOString()
        };
      }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setMessages(loaded);
    } catch (err) {
      console.error("Error loading mentor history", err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.email) {
      loadMentorHistory();
    }
  }, [currentUser, loadMentorHistory]);

  const handleClearMentorHistory = async () => {
    if (!currentUser?.email) return;
    if (!confirm("Are you sure you want to clear this mentor chat history?")) return;
    try {
      const chatCol = collection(db, 'users', currentUser.email, 'mentor_chats');
      const snap = await safeGetDocs(chatCol);
      for (const docSnap of snap.docs) {
        const docRef = doc(db, 'users', currentUser.email, 'mentor_chats', docSnap.id);
        await safeDeleteDoc(docRef);
      }
      setMessages([]);
    } catch (err) {
      console.error("Error clearing mentor chat history", err);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCrystalClick = () => {
    mentorInputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      alert("Please add VITE_GROQ_API_KEY to your .env file!");
      return;
    }

    const userMsgId = `msg_${Date.now()}`;
    const userMessage = { text: input, isUser: true, createdAt: new Date().toISOString() };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    if (currentUser?.email) {
      const userMsgRef = doc(db, 'users', currentUser.email, 'mentor_chats', userMsgId);
      await safeSetDoc(userMsgRef, userMessage);
    }

    try {
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
      const prompt = `You are a high-performance academic mentor for ${currentUser?.name}, a ${currentUser?.class} student. 
      Your goal is to provide motivational advice, study strategies, and time management tips. 
      The student says: "${input}". 
      Respond as a supportive, wise mentor. Be brief but impactful.`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
      });

      const responseText = completion.choices[0]?.message?.content || "Sorry, I couldn't process that.";
      const aiMsgId = `msg_${Date.now() + 1}`;
      const aiMessage = { text: responseText, isUser: false, createdAt: new Date().toISOString() };

      if (currentUser?.email) {
        const aiMsgRef = doc(db, 'users', currentUser.email, 'mentor_chats', aiMsgId);
        await safeSetDoc(aiMsgRef, aiMessage);
      }

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Groq Error:", error);
      const errMsgId = `msg_${Date.now() + 2}`;
      const errMessage = { text: "I'm currently taking a short break. Please check your Groq API key!", isUser: false, createdAt: new Date().toISOString() };
      
      if (currentUser?.email) {
        const errMsgRef = doc(db, 'users', currentUser.email, 'mentor_chats', errMsgId);
        await safeSetDoc(errMsgRef, errMessage);
      }

      setMessages(prev => [...prev, errMessage]);
    }
    setLoading(false);
  };

  return (
    <MentorPageLayout className="animate-fade-in">

      {/* ── Left Column: Chat Interface ──────────────────────────── */}
      <MentorSection>
        <div className="header">
          <h2>Mentor Chat</h2>
          <p>Get motivational coaching, focus strategies, and custom advice from your dedicated mentor.</p>
        </div>

        <MentorContainer>
          <MentorHeader>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              SESSION LINK
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="status">● Neural Link Active</span>
              {messages.length > 0 && (
                <ClearButton onClick={handleClearMentorHistory}>Clear History</ClearButton>
              )}
            </div>
          </MentorHeader>
          <MessageList>
            {messages.length === 0 && (
              <Message isUser={false}>Hello {currentUser?.name}! I'm your Groq-powered mentor. I'm here to help you build better study habits. What's on your mind today?</Message>
            )}
            {messages.map((m, i) => <Message key={i} isUser={m.isUser}>{m.text}</Message>)}
            {loading && <Message isUser={false}>Thinking...</Message>}
            <div ref={bottomRef} />
          </MessageList>
          <InputArea>
            <ChatInput 
              ref={mentorInputRef}
              id="mentor-input"
              placeholder="Talk to your mentor..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <SendButton onClick={handleSend} disabled={loading}>Send</SendButton>
          </InputArea>
        </MentorContainer>
      </MentorSection>

      {/* ── Right Column: Interactive Mentor Wave Visualizer ── */}
      <GlassViewport>
        <VisualizerWrapper>
          <MentorWaveVisualizer />
        </VisualizerWrapper>
      </GlassViewport>

    </MentorPageLayout>
  );
};

export default Mentor;
