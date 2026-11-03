import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SidebarContainer = styled.aside<{ isOpen: boolean; isCollapsed: boolean }>`
  width: ${props => props.isCollapsed ? '80px' : '260px'};
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  padding: ${props => props.isCollapsed ? '1.5rem 0.75rem' : '1.5rem'};
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border-right: 1px solid var(--glass-border);
  z-index: 1000;
  overflow: hidden;
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1), padding 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 1px 0 20px rgba(0, 0, 0, 0.15);

  @media (max-width: 1024px) {
    width: 260px;
    padding: 1.5rem;
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    box-shadow: ${props => props.isOpen ? '20px 0 50px rgba(0,0,0,0.5)' : 'none'};
  }
`;

const MobileHeader = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--glass-border);
  padding: 0 1.5rem;
  align-items: center;
  justify-content: space-between;
  z-index: 900;

  @media (max-width: 1024px) { display: flex; }

  .menu-btn {
    background: transparent;
    border: none;
    color: var(--text-main);
    font-size: 1.5rem;
    cursor: pointer;
  }
`;

const Overlay = styled.div<{ show: boolean }>`
  display: none;
  @media (max-width: 1024px) {
    display: ${props => props.show ? 'block' : 'none'};
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 950;
  }
`;

const LogoContainer = styled.div<{ isCollapsed: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: ${p => p.isCollapsed ? 'center' : 'flex-start'};
  margin-bottom: 1.75rem;
  padding: 0 ${p => p.isCollapsed ? '0' : '0.5rem'};
  flex-shrink: 0;
  height: 36px;
  
  @media (max-width: 1024px) {
    justify-content: flex-start;
    padding: 0 0.5rem;
  }
`;

const CollapseToggle = styled.button<{ isCollapsed: boolean }>`
  position: absolute;
  top: 1.5rem;
  right: ${p => p.isCollapsed ? '50%' : '1rem'};
  transform: ${p => p.isCollapsed ? 'translateX(50%)' : 'none'};
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
  border-radius: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1010;
  transition: all 0.25s ease-in-out;
  outline: none;

  &:hover {
    background: var(--glass-hover);
    color: var(--text-main);
    border-color: var(--primary);
    transform: ${p => p.isCollapsed ? 'translateX(50%) scale(1.1)' : 'scale(1.1)'};
    box-shadow: 0 0 10px rgba(45, 212, 191, 0.3), 0 0 20px rgba(56, 189, 248, 0.15);
  }
  
  @media (max-width: 1024px) {
    display: none; /* Hide on mobile since sidebar is toggle drawer */
  }
`;

const NavLinks = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.25rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    border-radius: 10px;
    transition: background 0.3s;

    &:hover {
      background: rgba(45, 212, 191, 0.5);
    }
  }
`;

const StyledNavLink = styled(NavLink)<{ isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${p => p.isCollapsed ? 'center' : 'flex-start'};
  gap: ${p => p.isCollapsed ? '0' : '0.75rem'};
  padding: 0.6rem ${p => p.isCollapsed ? '0' : '0.8rem'};
  width: ${p => p.isCollapsed ? '42px' : 'auto'};
  height: ${p => p.isCollapsed ? '42px' : 'auto'};
  margin: ${p => p.isCollapsed ? '0.1rem auto' : '0'};
  text-decoration: none;
  color: var(--text-muted);
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9rem;

  &:hover {
    background: var(--glass-hover);
    color: var(--text-main);
    transform: translateX(3px);
    box-shadow: 0 4px 15px var(--glass-hover);
  }
  &.active {
    background: linear-gradient(135deg, rgba(45, 212, 191, 0.12), rgba(56, 189, 248, 0.06));
    color: var(--text-main);
    box-shadow: 0 4px 12px rgba(45, 212, 191, 0.08), 0 2px 8px rgba(56, 189, 248, 0.06);
    border-left: 3px solid var(--primary);
    padding-left: ${p => p.isCollapsed ? '0' : 'calc(0.8rem - 3px)'};
  }
  .nav-icon { font-size: 1.15rem; flex-shrink: 0; }
  
  @media (max-width: 1024px) {
    justify-content: flex-start;
    gap: 0.75rem;
    padding: 0.6rem 0.8rem;
    width: auto;
    height: auto;
    margin: 0;
    
    span {
      display: inline !important;
    }
  }
`;

const SidebarFooter = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-shrink: 0;
`;

const LogoutButton = styled.button<{ isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${p => p.isCollapsed ? 'center' : 'flex-start'};
  gap: ${p => p.isCollapsed ? '0' : '0.75rem'};
  padding: 0.6rem ${p => p.isCollapsed ? '0' : '0.8rem'};
  width: ${p => p.isCollapsed ? '42px' : 'auto'};
  height: ${p => p.isCollapsed ? '42px' : 'auto'};
  margin: ${p => p.isCollapsed ? '0 auto' : '0'};
  background: transparent;
  border: 1px solid var(--glass-border);
  color: #f43f5e;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  &:hover { 
    background: rgba(244, 63, 94, 0.1);
    transform: scale(1.03);
  }
  .nav-icon { font-size: 1.15rem; flex-shrink: 0; }
  
  @media (max-width: 1024px) {
    justify-content: flex-start;
    gap: 0.75rem;
    padding: 0.6rem 0.8rem;
    width: auto;
    height: auto;
    margin: 0;
    
    span {
      display: inline !important;
    }
  }
`;

const Credit = styled.div`
  font-size: 0.65rem;
  color: var(--text-muted);
  text-align: center;
  opacity: 0.7;
  font-weight: 500;
  line-height: 1.4;
`;

const NavIcon: React.FC<{ name: string }> = ({ name }) => {
  switch (name) {
    case 'home':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'calendar':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case 'timer':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'diary':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'tracker':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 'weakarea':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    case 'constellation':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
      );
    case 'revision':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      );
    case 'chat':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'mentor':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
      );
    case 'leaderboard':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      );
    case 'profile':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'admin':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'logout':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );
    default:
      return null;
  }
};

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    if (window.confirm("Do you really want to log out of Axona™?")) {
      logout();
      navigate('/');
    }
  };

  const NAV_CATEGORIES = [
    {
      title: "STUDY WORKSPACE",
      items: [
        { to: "/", icon: "home", label: "Dashboard" },
        { to: "/planner", icon: "calendar", label: "Atlas™ - AI Planner" },
        { to: "/timer", icon: "timer", label: "Focus Timer" },
        { to: "/diary", icon: "diary", label: "NeuroLog™ - Study Diary" },
        { to: "/tracker", icon: "tracker", label: "Momentum™ - Study Tracker" },
      ]
    },
    {
      title: "NEURAL ENGINE",
      items: [
        { to: "/weakarea", icon: "weakarea", label: "Progress Coach" },
        { to: "/constellation", icon: "constellation", label: "Syllabus Hub" },
        { to: "/revision", icon: "revision", label: "Recall™ - AI Revision" },
        { to: "/chat", icon: "chat", label: "Oracle™ - Doubt Solver" },
        { to: "/mentor", icon: "mentor", label: "Mentor Chat" },
      ]
    },
    {
      title: "SOCIAL & SETTINGS",
      items: [
        { to: "/leaderboard", icon: "leaderboard", label: "Community" },
        { to: "/profile", icon: "profile", label: "Profile" },
      ]
    },
    ...(currentUser?.role === 'admin' ? [{
      title: "ADMINISTRATION",
      items: [
        { to: "/admin", icon: "admin", label: "Platform Monitor" },
      ]
    }] : [])
  ];

  return (
    <>
      <MobileHeader>
        <button className="menu-btn" onClick={toggleSidebar}>☰</button>
        <LogoContainer isCollapsed={false} style={{ marginBottom: 0 }}>
          <img src="/logo-icon.png" alt="Axona Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <h1 style={{ marginLeft: '8px', fontSize: '1.45rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Playball', cursive", fontWeight: 700 }}>Axona</span>
            <sup style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', fontFamily: "'Outfit', sans-serif", marginLeft: '2px', marginTop: '-4px' }}>™</sup>
            <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '8px', fontFamily: "'Inter', sans-serif", alignSelf: 'center', marginTop: '4px' }}>- by Abhranil</span>
          </h1>
        </LogoContainer>

        <div style={{ width: 24 }}></div>
      </MobileHeader>

      <Overlay show={isOpen} onClick={toggleSidebar} />

      <SidebarContainer isOpen={isOpen} isCollapsed={isCollapsed}>
        {/* Toggle Collapse button */}
        <CollapseToggle isCollapsed={isCollapsed} onClick={onToggleCollapse}>
          {isCollapsed ? '▶' : '☰'}
        </CollapseToggle>

        {/* Logo block */}
        <LogoContainer isCollapsed={isCollapsed}>
          {isCollapsed ? (
            <img src="/logo-icon.png" alt="Axona Logo" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/logo-icon.png" alt="Axona Logo" style={{ height: '30px', width: '30px', objectFit: 'contain', flexShrink: 0 }} />
              <span style={{ 
                marginLeft: '10px', 
                fontSize: '1.65rem', 
                fontWeight: 700, 
                fontFamily: "'Playball', cursive", 
                background: 'linear-gradient(135deg, #2DD4BF 0%, #06B6D4 40%, #38BDF8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.2px',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                Axona
                <sup style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', fontFamily: "'Outfit', sans-serif", marginLeft: '2px', alignSelf: 'flex-start', marginTop: '-6px' }}>™</sup>
              </span>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 600, 
                color: 'var(--text-muted)', 
                fontFamily: "'Inter', sans-serif",
                marginLeft: '5px',
                whiteSpace: 'nowrap',
                alignSelf: 'center',
                marginTop: '4px'
              }}>
                - by Abhranil
              </span>
            </div>
          )}
        </LogoContainer>

        <NavLinks>
          {NAV_CATEGORIES.map(cat => (
            <div key={cat.title} style={{ marginBottom: isCollapsed ? '0.75rem' : '1.2rem' }}>
              {!isCollapsed && (
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '0.4rem', paddingLeft: '0.8rem' }}>
                  {cat.title}
                </div>
              )}
              {cat.items.map(item => (
                <StyledNavLink 
                  key={item.to} 
                  to={item.to} 
                  end={item.to === "/"} 
                  isCollapsed={isCollapsed} 
                  onClick={() => setIsOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="nav-icon"><NavIcon name={item.icon} /></span>
                  {!isCollapsed && <span>{item.label}</span>}
                </StyledNavLink>
              ))}
            </div>
          ))}
        </NavLinks>
        
        <SidebarFooter>
          <LogoutButton isCollapsed={isCollapsed} onClick={handleLogout} title={isCollapsed ? "Logout" : undefined}>
            <span className="nav-icon"><NavIcon name="logout" /></span>
            {!isCollapsed && <span>Logout</span>}
          </LogoutButton>
          {!isCollapsed ? (
            <Credit>© 2026 Axona™<br/>Engineered by<br/>Abhranil Sen</Credit>
          ) : (
            <Credit style={{ fontSize: '0.5rem' }}>© '26</Credit>
          )}
        </SidebarFooter>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
