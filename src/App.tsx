import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Timer from './pages/Timer';
import Tracker from './pages/Tracker';
import Revision from './pages/Revision';
import WeakArea from './pages/WeakArea';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Mentor from './pages/Mentor';
import Leaderboard from './pages/Leaderboard';
import Diary from './pages/Diary';
import Planner from './pages/Planner';
import Admin from './pages/Admin';
import Constellation from './pages/Constellation';
import Landing from './pages/Landing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { AuthProvider, useAuth } from './context/AuthContext';
import ThreeCanvas from './components/ThreeCanvas';
import SetupOverlay from './components/SetupOverlay';



const MainLayout = styled.main<{ isCollapsed: boolean }>`
  flex: 1;
  padding: 2rem;
  margin-left: ${props => props.isCollapsed ? '80px' : '260px'};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 1024px) {
    margin-left: 0;
    padding-top: 80px;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
`;

const TutorialOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  backdrop-filter: var(--glass-blur);
`;

const TutorialCard = styled.div`
  max-width: 500px;
  width: 100%;
  background: #1e293b;
  border: 1px solid var(--primary);
  border-radius: 24px;
  padding: 2.5rem;
  text-align: center;
  box-shadow: 0 0 50px var(--primary-glow);

  h2 { font-size: 2rem; margin-bottom: 1rem; color: white; }
  p { color: #94a3b8; line-height: 1.6; margin-bottom: 2rem; }
  
  .step {
    text-align: left;
    margin-bottom: 1.5rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    color: white;
    font-weight: 500;
    .num {
      width: 28px; height: 28px; border-radius: 50%;
      background: var(--primary); display: flex;
      align-items: center; justify-content: center; font-size: 0.8rem;
    }
  }

  button {
    width: 100%;
    padding: 1rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 14px;
    font-weight: 700;
    cursor: pointer;
  }
`;

const Tutorial: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <TutorialOverlay>
      <TutorialCard className="animate-fade-in">
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem', fontFamily: "'Outfit', sans-serif", fontWeight: 800, background: 'var(--gradient-neural)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>A</div>
        <h2>Welcome to Axona™!</h2>
        <p>Your journey to cognitive mastery starts here. Let's initialize your focus.</p>
        
        <div className="step">
          <div className="num">1</div>
          <span>Enter Deep Focus mode with our Neural Timer.</span>
        </div>
        <div className="step">
          <div className="num">2</div>
          <span>Sync sessions to the cloud via your Study Diary.</span>
        </div>
        <div className="step">
          <div className="num">3</div>
          <span>Level up your brain and top the Leaderboard.</span>
        </div>

        <button onClick={onClose} style={{ background: 'var(--gradient-neural)' }}>Initialize Brain-Sync</button>
      </TutorialCard>
    </TutorialOverlay>
  );
};

const AppContent: React.FC = () => {
  const { currentUser, loading, updateProfile } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem('axona_theme');
    return stored === 'light' || stored === 'dark' ? stored : 'dark';
  });
  const [showTutorial, setShowTutorial] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('axona_theme', theme);
    } catch {
      /* localStorage unavailable — silently ignore */
    }
  }, [theme]);

  useEffect(() => {
    if (currentUser && (!localStorage.getItem(`tutorial_seen_${currentUser.email}`) || currentUser.tutorialSeen === false)) {
      setShowTutorial(true);
    }
  }, [currentUser]);

  const closeTutorial = async () => {
    if (currentUser) {
      localStorage.setItem(`tutorial_seen_${currentUser.email}`, 'true');
      try {
        await updateProfile({ tutorialSeen: true });
      } catch (err) {
        console.error("Failed to update tutorial status in Firestore:", err);
      }
    }
    setShowTutorial(false);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  console.log("App Rendering - Loading:", loading, "User:", currentUser?.email);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', color: 'var(--primary)', 
        background: 'var(--bg-darker)', flexDirection: 'column', gap: '1rem'
      }}>
        <div style={{ fontSize: '2.5rem', animation: 'pulse 1.5s infinite', fontFamily: "'Outfit', sans-serif", fontWeight: 800, background: 'var(--gradient-neural)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>A</div>
        <div style={{ fontWeight: 600, letterSpacing: '1px' }}>INITIALIZING AXONA™...</div>
      </div>
    );
  }

  if (window.location.pathname === '/landing') {
    return <Landing />;
  }
  if (window.location.pathname === '/privacy') {
    return <Privacy />;
  }
  if (window.location.pathname === '/terms') {
    return <Terms />;
  }

  if (!currentUser) {
    if (window.location.pathname === '/login') {
      return <Login />;
    }
    return <Landing />;
  }

  return (
    <div className="app-container" style={{ display: 'flex' }}>
      <ThreeCanvas />
      <SetupOverlay />
      {showTutorial && <Tutorial onClose={closeTutorial} />}
      <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <MainLayout isCollapsed={isSidebarCollapsed}>
        <Header toggleTheme={toggleTheme} theme={theme} />
        <div className="content-area" style={{ marginTop: '2rem', flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/timer" element={<Timer />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/revision" element={<Revision />} />
            <Route path="/weakarea" element={<WeakArea />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/mentor" element={<Mentor />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/constellation" element={<Constellation />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <footer style={{ 
          marginTop: '4rem', 
          padding: '2rem 0', 
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          opacity: 0.8,
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(45, 212, 191, 0.15), transparent)'
          }} />
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, letterSpacing: '0.3px' }}>© 2026 Axona™. Engineered by Abhranil Sen.</p>
          <p style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.6 }}>Designed for high-performance students worldwide.</p>
        </footer>
      </MainLayout>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
