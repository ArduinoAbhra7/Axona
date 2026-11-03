import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styled from 'styled-components';
import Groq from "groq-sdk";
import { useAuth } from '../context/AuthContext';
import { db, doc, collection, safeGetDocs, safeSetDoc, safeUpdateDoc, safeDeleteDoc } from '../services/firebase';
import { AITerminalVisualizer } from '../components/AIPanelVisualizer';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */
interface Flashcard {
  id: string;
  subject: string;
  topic: string;
  front: string;
  back: string;
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReviewDate: string; // ISO String
  createdAt: string; // ISO String
}

/* ═══════════════════════════════════════════════════════
   STYLED COMPONENTS
   ═══════════════════════════════════════════════════════ */

const RevisionPageLayout = styled(motion.div)`
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

const FormSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  z-index: 10;

  .header {
    h2 { font-size: 2rem; font-weight: 800; color: white; font-family: 'Outfit', sans-serif; }
    p { color: var(--text-muted); font-size: 0.95rem; margin-top: 0.25rem; }
  }
`;

const KeyboardViewport = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  z-index: 10;
`;

const TerminalWrapper = styled.div`
  @media (max-width: 1024px) {
    display: none;
  }
`;

const HistoryPanel = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 1.5rem;
  border-radius: 24px;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  max-height: 480px;
  
  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: white;
    font-family: 'Outfit', sans-serif;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 0.5rem;
  }
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  flex: 1;
  padding-right: 0.25rem;
  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
`;

const HistoryItem = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 0.85rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--primary);
  }
`;

const TabBar = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0.25rem;
  border-radius: 14px;
  width: fit-content;
  gap: 0.25rem;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 0.6rem 1.2rem;
  border-radius: 11px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: ${props => props.active ? 'var(--primary)' : 'transparent'};
  color: ${props => props.active ? '#ffffff' : 'var(--text-muted)'};
  transition: all 0.25s ease;
  box-shadow: ${props => props.active ? '0 4px 15px rgba(45, 212, 191, 0.3)' : 'none'};

  &:hover {
    color: var(--text-main);
  }
`;

const FormCard = styled(motion.div)`
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 2rem;
  border-radius: 24px;
  box-shadow: var(--card-shadow);
  outline: none;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;

  label { font-size: 0.9rem; font-weight: 600; color: var(--text-muted); }
  input, select, textarea {
    background: var(--glass-hover);
    border: 1px solid var(--glass-border);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    padding: 1rem;
    border-radius: 12px;
    color: var(--text-main);
    outline: none;
    font-size: 1rem;
    transition: background-color 0.2s;
    &:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.2);
      background: var(--glass-bg);
    }
  }
  textarea { height: 120px; resize: vertical; }
`;

const ToggleContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ToggleLabel = styled(motion.span)`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
  font-family: 'Outfit', sans-serif;
`;

const ToggleSwitch = styled(motion.div)<{ active: boolean }>`
  width: 50px;
  height: 26px;
  border-radius: 15px;
  background: ${props => props.active ? 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.active ? '#f43f5e' : 'rgba(255, 255, 255, 0.2)'};
  display: flex;
  align-items: center;
  padding: 2px;
  cursor: pointer;
  box-shadow: ${props => props.active ? '0 0 15px rgba(244, 63, 94, 0.5)' : 'none'};
  transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
`;

const ToggleHandle = styled(motion.div)`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const OutlinedActionButton = styled(ActionButton)`
  background: transparent;
  border: 1px solid var(--primary);
  color: var(--primary);
  margin-top: 0.75rem;

  &:hover {
    color: white;
  }
`;

const ResultCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 2rem;
  border-radius: 24px;
  white-space: pre-wrap;
  line-height: 1.6;
  overflow: hidden;
  box-shadow: var(--card-shadow);

  h3 { color: var(--primary); margin-bottom: 1.5rem; }
`;

/* ── FLASHCARD REVIEW ARENA STYLES ── */
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatBlock = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 1rem;
  border-radius: 16px;
  text-align: center;

  .value { font-size: 1.5rem; font-weight: 800; color: white; font-family: 'Outfit', sans-serif; }
  .label { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
`;

const CardArena = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const CardViewport = styled.div`
  perspective: 1000px;
  width: 100%;
  max-width: 480px;
  height: 280px;
  margin: 1rem 0 1.5rem 0;
  cursor: pointer;
`;

const CardInner = styled(motion.div)<{ isFlipped: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${props => props.isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'};
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 24px;
  padding: 2.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--glass-border);
  box-sizing: border-box;
`;

const CardFront = styled(CardFace)`
  background: linear-gradient(135deg, var(--glass-bg) 0%, rgba(45, 212, 191, 0.04) 100%);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  
  .side-label { font-size: 0.75rem; text-transform: uppercase; color: var(--primary); font-weight: 700; letter-spacing: 1.5px; }
  .content { font-size: 1.25rem; font-weight: 700; color: var(--text-main); line-height: 1.5; margin: auto 0; text-align: center; }
  .tip { font-size: 0.8rem; color: var(--text-muted); text-align: center; }
`;

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
  background: linear-gradient(135deg, var(--glass-bg) 0%, rgba(244, 63, 94, 0.04) 100%);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);

  .side-label { font-size: 0.75rem; text-transform: uppercase; color: #f43f5e; font-weight: 700; letter-spacing: 1.5px; }
  .content { font-size: 1.15rem; font-weight: 500; color: var(--text-main); line-height: 1.6; margin: auto 0; text-align: center; overflow-y: auto; max-height: 160px; }
  .tip { font-size: 0.8rem; color: var(--text-muted); text-align: center; }
`;

const RatingControlRow = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
  width: 100%;
  max-width: 480px;
`;

const RatingButton = styled(motion.button)<{ colorScheme: string }>`
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  padding: 0.6rem 0.25rem;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  outline: none;

  .score { font-size: 1rem; font-weight: 800; }
  .text { font-size: 0.65rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }

  &:hover {
    background: ${props => props.colorScheme};
    border-color: ${props => props.colorScheme};
    box-shadow: 0 0 15px ${props => props.colorScheme}4D;
    .text { color: white; }
  }
`;

const EmptyState = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  padding: 3rem 2rem;
  border-radius: 24px;
  text-align: center;
  width: 100%;
  box-sizing: border-box;

  h4 { font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 0.5rem; font-family: 'Outfit', sans-serif; }
  p { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem; }
`;

const CreatorDrawer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  width: 100%;
  box-sizing: border-box;

  h4 { font-family: 'Outfit', sans-serif; font-size: 1.1rem; color: white; margin-bottom: 1rem; }
`;

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

interface RevisionSession {
  id: string;
  subject: string;
  topic: string;
  curriculum: string;
  olympiadMode: boolean;
  notes: string;
  result: string;
  createdAt: string;
}

const Revision: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'generator' | 'reviews'>('generator');
  
  // Generator State
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [curriculum, setCurriculum] = useState('CBSE');
  const [olympiadMode, setOlympiadMode] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  
  // Spaced Repetition (Flashcard) State
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [showCardCreator, setShowCardCreator] = useState(false);

  // New Flashcard manual inputs
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newTopic, setNewTopic] = useState('');

  const topicInputRef = useRef<HTMLInputElement>(null);

  // History State
  const [history, setHistory] = useState<RevisionSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load User Flashcards from Firestore
  const loadFlashcards = useCallback(async () => {
    if (!currentUser?.email) return;
    try {
      const cardsCol = collection(db, 'users', currentUser.email, 'flashcards');
      const snap = await safeGetDocs(cardsCol);
      const loaded: Flashcard[] = snap.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          subject: data.subject || 'General',
          topic: data.topic || 'General',
          front: data.front || '',
          back: data.back || '',
          interval: data.interval ?? 1,
          repetitions: data.repetitions ?? 0,
          easeFactor: data.easeFactor ?? 2.5,
          nextReviewDate: data.nextReviewDate || new Date().toISOString(),
          createdAt: data.createdAt || new Date().toISOString()
        };
      });
      setFlashcards(loaded);
    } catch (err) {
      console.error("Error loading flashcards", err);
    }
  }, [currentUser]);

  const loadRevisionHistory = useCallback(async () => {
    if (!currentUser?.email) return;
    setHistoryLoading(true);
    try {
      const revCol = collection(db, 'users', currentUser.email, 'revisions');
      const snap = await safeGetDocs(revCol);
      const loaded: RevisionSession[] = snap.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          subject: data.subject || '',
          topic: data.topic || '',
          curriculum: data.curriculum || 'CBSE',
          olympiadMode: !!data.olympiadMode,
          notes: data.notes || '',
          result: data.result || '',
          createdAt: data.createdAt || new Date().toISOString()
        };
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setHistory(loaded);
    } catch (err) {
      console.error("Error loading revision history", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [currentUser]);

  const loadSession = (session: RevisionSession) => {
    setSubject(session.subject);
    setTopic(session.topic);
    setCurriculum(session.curriculum);
    setOlympiadMode(session.olympiadMode);
    setNotes(session.notes);
    setResult(session.result);
    setActiveTab('generator');
  };

  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!currentUser?.email) return;
    if (!confirm("Are you sure you want to delete this revision note?")) return;
    try {
      const docRef = doc(db, 'users', currentUser.email, 'revisions', sessionId);
      await safeDeleteDoc(docRef);
      setHistory(prev => prev.filter(item => item.id !== sessionId));
    } catch (err) {
      console.error("Error deleting session", err);
    }
  };

  useEffect(() => {
    if (currentUser?.email) {
      loadFlashcards();
      loadRevisionHistory();
    }
  }, [currentUser, loadFlashcards, loadRevisionHistory]);

  // Filters for Reviews Today
  const reviewsToday = useMemo(() => {
    const now = new Date();
    return flashcards.filter(card => {
      const reviewDate = new Date(card.nextReviewDate);
      return reviewDate <= now;
    });
  }, [flashcards]);

  const currentCard = reviewsToday[currentCardIndex];

  // SuperMemo-2 Recall Scoring Action
  const handleCardRating = async (rating: number) => {
    if (!currentUser?.email || !currentCard) return;

    let nextInterval = 1;
    let nextRepetitions = 0;
    let nextEaseFactor = currentCard.easeFactor || 2.5;

    // SM-2 Recall Calculations
    if (rating >= 3) {
      if (currentCard.repetitions === 0) {
        nextInterval = 1;
      } else if (currentCard.repetitions === 1) {
        nextInterval = 6;
      } else {
        nextInterval = Math.round(currentCard.interval * nextEaseFactor);
      }
      nextRepetitions = currentCard.repetitions + 1;
    } else {
      nextInterval = 1;
      nextRepetitions = 0;
    }

    // Adjust Ease Factor (EF)
    nextEaseFactor = nextEaseFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
    if (nextEaseFactor < 1.3) {
      nextEaseFactor = 1.3;
    }

    const now = new Date();
    const nextReviewDate = new Date(now.getTime() + nextInterval * 24 * 60 * 60 * 1000);

    const updatedCard: Flashcard = {
      ...currentCard,
      interval: nextInterval,
      repetitions: nextRepetitions,
      easeFactor: nextEaseFactor,
      nextReviewDate: nextReviewDate.toISOString()
    };

    try {
      const cardRef = doc(db, 'users', currentUser.email, 'flashcards', currentCard.id);
      await safeUpdateDoc(cardRef, {
        interval: nextInterval,
        repetitions: nextRepetitions,
        easeFactor: nextEaseFactor,
        nextReviewDate: nextReviewDate.toISOString()
      });

      // Update state local mapping
      setFlashcards(prev => prev.map(c => c.id === currentCard.id ? updatedCard : c));
    } catch (err) {
      console.error("Failed to update SM-2 card record", err);
    }

    // Reset rotation & shift to next due card index
    setIsFlipped(false);
    setTimeout(() => {
      // If we review the last card, index reset
      if (currentCardIndex >= reviewsToday.length - 1) {
        setCurrentCardIndex(0);
      }
    }, 150);
  };

  // Convert AI generated summary notes directly into flashcard decks
  const convertNoteToCards = async () => {
    if (!result || !currentUser?.email) return;
    setIsGeneratingCards(true);
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        alert("Please set VITE_GROQ_API_KEY to synthesize cards.");
        setIsGeneratingCards(false);
        return;
      }
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

      const prompt = `Based on the following syllabus summary notes, extract exactly 4 high-yield, distinct study flashcards in Question and Answer format.
      
      Syllabus Notes:
      ${result}
      
      Respond STRICTLY with a valid JSON array of objects. Do not include markdown wraps, explanation text, or formatting.
      Format:
      [
        { "front": "A clear, concise question or core concept to review", "back": "The answer or detailed explanation verifying recall" }
      ]`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
      });

      const cleanContent = completion.choices[0]?.message?.content?.trim() || "";
      const jsonString = cleanContent.replace(/^```json/, "").replace(/```$/, "").trim();
      const parsedCards = JSON.parse(jsonString);

      if (Array.isArray(parsedCards)) {
        for (const card of parsedCards) {
          const cardId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          const cardRef = doc(db, 'users', currentUser.email, 'flashcards', cardId);
          await safeSetDoc(cardRef, {
            id: cardId,
            subject: subject || 'General',
            topic: topic || 'General',
            front: card.front,
            back: card.back,
            interval: 1,
            repetitions: 0,
            easeFactor: 2.5,
            nextReviewDate: new Date().toISOString(),
            createdAt: new Date().toISOString()
          });
        }
        await loadFlashcards();
        alert("Success! 4 flashcards auto-synthesized and synced to your deck.");
        setActiveTab('reviews');
      }
    } catch (err) {
      console.error("Groq card conversion error", err);
      alert("Flashcard generator parse error. Try generating again.");
    }
    setIsGeneratingCards(false);
  };

  // Add a manual custom card to user's spaced repetition set
  const handleAddManualCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.email || !newFront || !newBack) return;

    const cardId = `card_${Date.now()}`;
    const cardRef = doc(db, 'users', currentUser.email, 'flashcards', cardId);

    const cardPayload: Flashcard = {
      id: cardId,
      subject: newSubject || 'General',
      topic: newTopic || 'General',
      front: newFront,
      back: newBack,
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    try {
      await safeSetDoc(cardRef, cardPayload);
      setFlashcards(prev => [cardPayload, ...prev]);
      
      // Reset form
      setNewFront('');
      setNewBack('');
      setNewSubject('');
      setNewTopic('');
      setShowCardCreator(false);
    } catch (err) {
      console.error("Failed to add manual card", err);
    }
  };

  const handleKeyboardClick = () => {
    topicInputRef.current?.focus();
  };

  const generateRevision = async () => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      alert("Please add VITE_GROQ_API_KEY to your .env file!");
      return;
    }

    setLoading(true);
    try {
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

      const prompt = olympiadMode 
        ? `As an elite international Olympiad coach, generate an advanced, high-impact Olympiad mock problem and theory review note for a ${currentUser?.class || 'student'} on the topic "${topic}" in the subject "${subject}" under the "${curriculum}" curriculum. 
        Use the following user notes as context: ${notes}. 
        Strictly include these sections:
        1. Olympiad Theory (Advanced concepts, deep proofs, or high-level insights)
        2. Challenging Olympiad Mock Problem (A highly rigorous, creative problem requiring deep logical application)
        3. Step-by-Step Elegant Solution (Detailed, elegant proof or algebraic solution)
        Format with clear markdown headings and a professional student-friendly tone.`
        : `As an expert tutor, create a concise, high-impact revision note for a ${currentUser?.class || 'student'} on the topic "${topic}" in the subject "${subject}" under the "${curriculum}" curriculum. 
        Use the following user notes as context: ${notes}. 
        Strictly include the following sections:
        1. Short Summary (A brief, easy-to-understand overview)
        2. Key Points (Crucial concepts as bullet points)
        3. Formulas & Important Rules (If applicable to the topic, otherwise state "No formulas for this topic")
        Format with clear markdown headings and a professional student-friendly tone.`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
      });

      const responseText = completion.choices[0]?.message?.content || "Generation failed.";
      setResult(responseText);

      if (currentUser?.email) {
        const sessionId = `rev_${Date.now()}`;
        const sessionRef = doc(db, 'users', currentUser.email, 'revisions', sessionId);
        const newSession: RevisionSession = {
          id: sessionId,
          subject,
          topic,
          curriculum,
          olympiadMode,
          notes,
          result: responseText,
          createdAt: new Date().toISOString()
        };
        await safeSetDoc(sessionRef, newSession);
        setHistory(prev => [newSession, ...prev]);
      }
    } catch (error) {
      console.error("Groq Error:", error);
      alert("Failed to generate revision. Check your Groq API key.");
    }
    setLoading(false);
  };

  // ── Framer Motion Animations ──────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 100, 
        damping: 15 
      } 
    }
  };

  const cardHoverProps = {
    whileHover: { 
      scale: 1.01, 
      borderColor: 'rgba(45, 212, 191, 0.4)', 
      boxShadow: '0 12px 30px rgba(45, 212, 191, 0.2)',
      backgroundColor: 'var(--glass-hover)' 
    },
    whileTap: { scale: 0.99 }
  };

  const buttonHoverProps = {
    whileHover: { 
      scale: 1.02, 
      backgroundColor: 'var(--primary-hover)',
      borderColor: 'var(--primary-hover)',
      boxShadow: '0 0 30px rgba(45, 212, 191, 0.4)' 
    },
    whileTap: { scale: 0.98 }
  };

  return (
    <RevisionPageLayout 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Left Column: Form and Active Workspace Panel ───────────────── */}
      <FormSection
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <div className="header" style={{ transform: 'none' }}>
          <motion.h2 variants={itemVariants}>Recall™ - AI Revision</motion.h2>
          <motion.p variants={itemVariants}>Master your syllabus using AI study notes and spaced repetition flashcards.</motion.p>
        </div>

        <TabBar>
          <TabButton active={activeTab === 'generator'} onClick={() => setActiveTab('generator')}>
            AI Revision Generator
          </TabButton>
          <TabButton active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>
            Spaced Repetition ({reviewsToday.length})
          </TabButton>
        </TabBar>

        {activeTab === 'generator' ? (
          <React.Fragment>
            <FormCard variants={itemVariants} {...cardHoverProps}>
              <FormGrid>
                <InputGroup style={{ marginBottom: 0 }}>
                  <label>Subject</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                    <option value="">Select Subject</option>
                    {currentUser?.subjects?.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </InputGroup>

                <InputGroup style={{ marginBottom: 0 }}>
                  <label>Curriculum</label>
                  <select value={curriculum} onChange={(e) => setCurriculum(e.target.value)}>
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="Cambridge">Cambridge (IGCSE/A-Level)</option>
                    <option value="IB">IB (DP/MYP)</option>
                  </select>
                </InputGroup>

                <InputGroup style={{ marginBottom: 0 }}>
                  <label>Topic Name</label>
                  <input 
                    ref={topicInputRef}
                    type="text" 
                    placeholder="e.g. Photosynthesis" 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)} 
                  />
                </InputGroup>
              </FormGrid>

              <InputGroup>
                <label>Your Rough Notes (Optional)</label>
                <textarea placeholder="Paste your messy notes here..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </InputGroup>

              <ToggleContainer>
                <ToggleLabel>Olympiad Mode</ToggleLabel>
                <ToggleSwitch 
                  active={olympiadMode} 
                  onClick={() => setOlympiadMode(!olympiadMode)}
                >
                  <ToggleHandle 
                    layout 
                    transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                    style={{ marginLeft: olympiadMode ? 'auto' : '0px' }}
                  />
                </ToggleSwitch>
                <span style={{ fontSize: '0.8rem', color: olympiadMode ? '#f43f5e' : 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.3px', transition: 'color 0.3s' }}>
                  {olympiadMode ? 'Advanced Olympiad Training Active' : 'Standard Academic Notes'}
                </span>
              </ToggleContainer>

              <ActionButton 
                onClick={generateRevision} 
                disabled={loading || !topic}
                variants={itemVariants}
                {...buttonHoverProps}
              >
                {loading ? 'Thinking...' : olympiadMode ? 'Generate Olympiad Mock Problem' : 'Generate Smart Revision Note'}
              </ActionButton>
            </FormCard>

            <AnimatePresence mode="popLayout">
              {result && (
                <ResultCard
                  key="result"
                  initial={{ opacity: 0, height: 0, y: 30 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -30 }}
                  transition={{ type: 'spring', stiffness: 80, damping: 14 }}
                  layout
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                  >
                    <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span>{olympiadMode ? 'Olympiad Mock Challenge' : 'Generated Syllabus Study Note'}</span>
                    </h3>
                    <div style={{ color: 'white', fontSize: '0.95rem' }}>{result}</div>
                    
                    <OutlinedActionButton
                      onClick={convertNoteToCards}
                      disabled={isGeneratingCards}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isGeneratingCards ? 'Converting summary...' : 'Auto-Convert Summary into Spaced Repetition Cards'}
                    </OutlinedActionButton>
                  </motion.div>
                </ResultCard>
              )}
            </AnimatePresence>
          </React.Fragment>
        ) : (
          /* ── Spaced Repetition reviews tab panel layout ── */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StatsRow>
              <StatBlock>
                <div className="value">{flashcards.length}</div>
                <div className="label">Total Cards</div>
              </StatBlock>
              <StatBlock>
                <div className="value" style={{ color: reviewsToday.length > 0 ? '#f43f5e' : '#10b981' }}>
                  {reviewsToday.length}
                </div>
                <div className="label">Due Today</div>
              </StatBlock>
              <StatBlock>
                <div className="value" style={{ color: 'var(--primary)' }}>
                  {flashcards.filter(c => c.repetitions > 2).length}
                </div>
                <div className="label">Mastered</div>
              </StatBlock>
            </StatsRow>

            {reviewsToday.length > 0 && currentCard ? (
              <CardArena>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', width: '100%', textAlign: 'center' }}>
                  Reviewing Card {currentCardIndex + 1} of {reviewsToday.length} (Due Today)
                </p>
                <CardViewport onClick={() => setIsFlipped(!isFlipped)}>
                  <CardInner isFlipped={isFlipped}>
                    <CardFront>
                      <div className="side-label">Front</div>
                      <div className="content">{currentCard?.front || "Flipping..."}</div>
                      <div className="tip">Click Card to Flip & Reveal</div>
                    </CardFront>
                    <CardBack>
                      <div className="side-label">Back</div>
                      <div className="content">{currentCard?.back || "Flipping..."}</div>
                      <div className="tip">Rate your recall ability below</div>
                    </CardBack>
                  </CardInner>
                </CardViewport>

                {isFlipped && (
                  <RatingControlRow>
                    {[
                      { val: 1, text: 'Forgot', col: '#ef4444' },
                      { val: 2, text: 'Hard', col: '#f97316' },
                      { val: 3, text: 'Good', col: '#14b8a6' },
                      { val: 4, text: 'Easy', col: '#3b82f6' },
                      { val: 5, text: 'Perfect', col: '#06b6d4' }
                    ].map(rating => (
                      <RatingButton
                        key={rating.val}
                        colorScheme={rating.col}
                        onClick={() => handleCardRating(rating.val)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="score">{rating.val}</span>
                        <span className="text">{rating.text}</span>
                      </RatingButton>
                    ))}
                  </RatingControlRow>
                )}
              </CardArena>
            ) : (
              <EmptyState>
                <h4>All Caught Up!</h4>
                <p>No cards due today. Use the AI Revision Generator to study summaries and convert them directly into flashcard decks.</p>
                <OutlinedActionButton 
                  onClick={() => setShowCardCreator(!showCardCreator)}
                  style={{ width: 'auto', padding: '0.75rem 1.5rem', margin: '0 auto' }}
                >
                  {showCardCreator ? 'Close Card Creator' : 'Create Custom Card Manually'}
                </OutlinedActionButton>
              </EmptyState>
            )}

            <AnimatePresence>
              {(showCardCreator || (reviewsToday.length === 0 && showCardCreator)) && (
                <CreatorDrawer
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h4>Add New Spaced Repetition Card</h4>
                  <form onSubmit={handleAddManualCard}>
                    <FormGrid>
                      <InputGroup style={{ marginBottom: '1rem' }}>
                        <label>Subject</label>
                        <input type="text" placeholder="e.g. History" value={newSubject} onChange={e => setNewSubject(e.target.value)} required />
                      </InputGroup>
                      <InputGroup style={{ marginBottom: '1rem' }}>
                        <label>Topic</label>
                        <input type="text" placeholder="e.g. World War II" value={newTopic} onChange={e => setNewTopic(e.target.value)} required />
                      </InputGroup>
                    </FormGrid>
                    <InputGroup style={{ marginBottom: '1.25rem' }}>
                      <label>Front Side (Question / Concept)</label>
                      <textarea placeholder="Write question to test yourself" value={newFront} onChange={e => setNewFront(e.target.value)} required style={{ height: '70px' }} />
                    </InputGroup>
                    <InputGroup style={{ marginBottom: '1.5rem' }}>
                      <label>Back Side (Answer / Detail)</label>
                      <textarea placeholder="Write clear answer/definition" value={newBack} onChange={e => setNewBack(e.target.value)} required style={{ height: '70px' }} />
                    </InputGroup>
                    <ActionButton type="submit">
                      Add Card to Deck
                    </ActionButton>
                  </form>
                </CreatorDrawer>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </FormSection>

      {/* ── Right Column: Terminal Visualizer and History Panel ── */}
      <KeyboardViewport
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
      >
        <TerminalWrapper>
          <AITerminalVisualizer onClick={handleKeyboardClick} />
        </TerminalWrapper>
        
        <HistoryPanel>
          <h3>Saved History</h3>
          {historyLoading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading past revisions...</div>
          ) : history.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>
              No saved revision notes. Generate notes to see them here.
            </div>
          ) : (
            <HistoryList>
              {history.map(item => (
                <HistoryItem key={item.id} onClick={() => loadSession(item)}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', overflow: 'hidden' }}>
                    <span style={{ fontWeight: 600, color: 'white', fontSize: '0.85rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      {item.topic}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.subject}</span>
                      {item.olympiadMode && (
                        <span style={{ fontSize: '0.6rem', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          Olympiad
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => deleteSession(e, item.id)} 
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: 'var(--text-muted)', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center',
                      padding: '4px'
                    }}
                    title="Delete saved revision"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </HistoryItem>
              ))}
            </HistoryList>
          )}
        </HistoryPanel>
      </KeyboardViewport>
    </RevisionPageLayout>
  );
};

export default Revision;
