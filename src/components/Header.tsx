import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const pulseRing = keyframes`
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2.2); opacity: 0; }
`;

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--glass-border);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(45, 212, 191, 0.2), transparent);
  }

  @media (max-width: 1024px) {
    .welcome-section { display: none; }
    justify-content: flex-end;
  }
`;

const WelcomeSection = styled.div.attrs({ className: 'welcome-section' })`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const StatusDot = styled.div`
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: #10b981;
    animation: ${pulseRing} 2s ease-out infinite;
  }
`;

const WelcomeText = styled.div`
  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    font-family: 'Outfit', sans-serif;
    color: var(--text-main);
    line-height: 1.2;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.15rem;
    font-size: 0.78rem;
    color: var(--text-muted);
    font-weight: 500;

    .separator {
      color: var(--text-muted);
      opacity: 0.5;
    }

    .current {
      color: var(--primary);
      font-weight: 600;
    }
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const IconButton = styled.button`
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  color: var(--text-muted);

  &:hover {
    transform: translateY(-1px);
    background: var(--glass-hover);
    border-color: rgba(45, 212, 191, 0.3);
    box-shadow: 0 4px 16px rgba(45, 212, 191, 0.15);
    color: var(--text-main);
  }
`;

const NotifDot = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f43f5e;
  border: 1.5px solid var(--bg-darker);
`;

const AvatarWrapper = styled.div`
  position: relative;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.08);
  }

  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: var(--gradient-neural);
    opacity: 0.6;
  }
`;

const Avatar = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--bg-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  font-family: 'Outfit', sans-serif;
  color: var(--text-main);
  z-index: 1;
`;

const PAGE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/timer': 'Focus Timer',
  '/diary': 'NeuroLog™ - Study Diary',
  '/tracker': 'Momentum™ - Study Tracker',
  '/revision': 'Recall™ - AI Revision',
  '/chat': 'Oracle™ - Doubt Solver',
  '/mentor': 'Mentor Chat',
  '/leaderboard': 'Community',
  '/profile': 'Profile',
  '/planner': 'Atlas™ - AI Planner',
  '/constellation': 'Syllabus Hub',
  '/weakarea': 'Progress Coach',
  '/admin': 'Admin Panel',
};

interface HeaderProps {
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, theme }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const currentPage = PAGE_LABELS[location.pathname] || 'Axona';
  
  return (
    <HeaderContainer>
      <WelcomeSection>
        <StatusDot />
        <WelcomeText>
          <h2>Welcome back, {currentUser?.name?.split(' ')[0] || 'Scholar'}</h2>
          <div className="breadcrumb">
            <span>Axona</span>
            <span className="separator">/</span>
            <span className="current">{currentPage}</span>
          </div>
        </WelcomeText>
      </WelcomeSection>
      <UserSection>
        <IconButton onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </IconButton>
        <IconButton title="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <NotifDot />
        </IconButton>
        <AvatarWrapper title={currentUser?.name || 'Profile'}>
          <Avatar>{currentUser?.name?.[0].toUpperCase() || 'S'}</Avatar>
        </AvatarWrapper>
      </UserSection>
    </HeaderContainer>
  );
};

export default Header;
