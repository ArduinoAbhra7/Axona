import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import Groq from "groq-sdk";
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { AITerminalVisualizer } from '../components/AIPanelVisualizer';
import { db, doc, collection, safeGetDocs, safeSetDoc, safeDeleteDoc } from '../services/firebase';

// ─── Animations ─────────────────────────────────────────────────────
const pulseRing = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.25); }
  70% { box-shadow: 0 0 0 12px rgba(20, 184, 166, 0); }
  100% { box-shadow: 0 0 0 0 rgba(20, 184, 166, 0); }
`;

const ChatPageLayout = styled.div`
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

const ChatSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  z-index: 10;

  .header {
    h2 { font-size: 2rem; font-weight: 800; color: var(--text-main); font-family: 'Outfit', sans-serif; }
    p { color: var(--text-muted); font-size: 0.95rem; margin-top: 0.25rem; }
  }
`;

const KeyboardViewport = styled.div`
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

const ChatHeader = styled.div`
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-family: monospace;
    letter-spacing: 1px;
  }
`;

const ClearButton = styled.button`
  background: transparent;
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #f43f5e;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Outfit', sans-serif;

  &:hover {
    background: rgba(244, 63, 94, 0.15);
    border-color: #f43f5e;
  }
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 65vh;
  min-height: 480px;
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
  background: ${props => props.isUser ? 'var(--primary)' : 'var(--glass-hover)'};
  border: ${props => props.isUser ? 'none' : '1px solid var(--glass-border)'};
  backdrop-filter: ${props => props.isUser ? 'none' : 'var(--glass-blur)'};
  -webkit-backdrop-filter: ${props => props.isUser ? 'none' : 'var(--glass-blur)'};
  color: ${props => props.isUser ? '#ffffff' : 'var(--text-main)'};
  font-size: 0.95rem;
  line-height: 1.5;
  box-shadow: var(--card-shadow);
  white-space: pre-wrap;
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
  background: var(--glass-hover);
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
    background: var(--glass-bg);
  }
`;

const SendButton = styled.button`
  background: var(--primary);
  color: white;
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(45, 212, 191, 0.4);
  }
`;

const Chat: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const topicHandled = useRef(false);

  const loadChatHistory = useCallback(async () => {
    if (!currentUser?.email) return;
    try {
      const chatCol = collection(db, 'users', currentUser.email, 'doubt_chats');
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
      console.error("Error loading chat history", err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.email) {
      loadChatHistory();
    }
  }, [currentUser, loadChatHistory]);

  const handleClearChat = async () => {
    if (!currentUser?.email) return;
    if (!confirm("Are you sure you want to clear this chat history?")) return;
    try {
      const chatCol = collection(db, 'users', currentUser.email, 'doubt_chats');
      const snap = await safeGetDocs(chatCol);
      for (const docSnap of snap.docs) {
        const docRef = doc(db, 'users', currentUser.email, 'doubt_chats', docSnap.id);
        await safeDeleteDoc(docRef);
      }
      setMessages([]);
    } catch (err) {
      console.error("Error clearing chat history", err);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-fill from Syllabus Hub doubt icon
  useEffect(() => {
    const topic = searchParams.get('topic');
    const subject = searchParams.get('subject');
    const studentClass = searchParams.get('class');

    if (topic && !topicHandled.current) {
      topicHandled.current = true;
      
      let prompt = `I am a student currently studying under the syllabus for **${studentClass || 'Secondary Grade'}**.\n`;
      prompt += `I have a conceptual doubt in **${subject || 'this subject'}** regarding the specific topic: "${topic}".\n\n`;
      prompt += `Could you please break down this topic and explain it in a structured, easy-to-understand manner? Specifically, please cover:\n`;
      prompt += `1. **Core Concept**: What is it, in plain language?\n`;
      prompt += `2. **Step-by-step Logical Outline**: How does it work and what are the main rules/principles?\n`;
      prompt += `3. **Key Formulas or Core Definitions**: Any essential mathematical equations, laws, or vocabulary terms I must memorize.\n`;
      prompt += `4. **A Quick Practical Example**: An illustrative example (or sample solved problem) that demonstrates how this is applied in a real study scenario.\n\n`;
      prompt += `Please explain it with high academic rigor but keep the explanations intuitive and clear!`;

      setInput(prompt);
      // Auto-focus the input
      setTimeout(() => chatInputRef.current?.focus(), 300);
    }
  }, [searchParams]);

  // ── Spline Keyboard onMouseDown → Focus Chat Input ──────────────
  const handleKeyboardClick = useCallback((e: any) => {
    const objectName = e?.target?.name || 'AI Keyboard';
    console.log(`[Axona] AI Keyboard Spline Event — Object "${objectName}" clicked. Focusing chat input.`);
    
    // Focus the chat input so the user can start typing immediately
    chatInputRef.current?.focus();
  }, []);

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
      const userMsgRef = doc(db, 'users', currentUser.email, 'doubt_chats', userMsgId);
      await safeSetDoc(userMsgRef, userMessage);
    }

    try {
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: `You are an expert academic tutor for ${currentUser?.class || 'a student'}. Help them solve doubts clearly and concisely.` },
          ...messages.map(m => ({
            role: m.isUser ? "user" : "assistant",
            content: m.text,
          })),
          { role: "user", content: input }
        ],
        model: "llama-3.1-8b-instant",
      });

      const responseText = completion.choices[0]?.message?.content || "Sorry, I couldn't process that.";
      const aiMsgId = `msg_${Date.now() + 1}`;
      const aiMessage = { text: responseText, isUser: false, createdAt: new Date().toISOString() };

      if (currentUser?.email) {
        const aiMsgRef = doc(db, 'users', currentUser.email, 'doubt_chats', aiMsgId);
        await safeSetDoc(aiMsgRef, aiMessage);
      }

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Groq Error:", error);
      const errMsgId = `msg_${Date.now() + 2}`;
      const errMessage = { text: "Groq is currently busy or the key is invalid. Please check your VITE_GROQ_API_KEY.", isUser: false, createdAt: new Date().toISOString() };
      
      if (currentUser?.email) {
        const errMsgRef = doc(db, 'users', currentUser.email, 'doubt_chats', errMsgId);
        await safeSetDoc(errMsgRef, errMessage);
      }
      
      setMessages(prev => [...prev, errMessage]);
    }
    setLoading(false);
  };

  return (
    <ChatPageLayout className="animate-fade-in">
      
      {/* ── Left Column: Chat Interface ──────────────────────────── */}
      <ChatSection>
        <div className="header">
          <h2>Oracle™ - Doubt Solver</h2>
          <p>Powered by Groq High-Speed AI. Ask anything about your studies!</p>
        </div>

        <ChatContainer>
          <ChatHeader>
            <span>Oracle™ - Doubt Solver Session</span>
            {messages.length > 0 && (
              <ClearButton onClick={handleClearChat}>Clear Chat</ClearButton>
            )}
          </ChatHeader>
          <MessageList>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '15%' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem auto', display: 'block' }}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <p>Hi {currentUser?.name}! I'm your high-speed study buddy.<br/>What are we learning today?</p>
              </div>
            )}
            {messages.map((m, i) => (
              <Message key={i} isUser={m.isUser}>{m.text}</Message>
            ))}
            {loading && <Message isUser={false}>Generating answer...</Message>}
            <div ref={bottomRef} />
          </MessageList>
          <InputArea>
            <ChatInput
              ref={chatInputRef}
              id="chat-input"
              placeholder="Type your doubt here..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <SendButton onClick={handleSend} disabled={loading} aria-label="Send message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </SendButton>
          </InputArea>
        </ChatContainer>
      </ChatSection>

      {/* ── Right Column: Interactive Terminal Visualizer ── */}
      <KeyboardViewport>
        <VisualizerWrapper>
          <AITerminalVisualizer onClick={() => chatInputRef.current?.focus()} />
        </VisualizerWrapper>
      </KeyboardViewport>

    </ChatPageLayout>
  );
};

export default Chat;
