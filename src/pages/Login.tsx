import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// ── Background Float Keyframe ─────────────────────────────────────────
const orbFloat = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(40px, -30px) scale(1.08); }
  50% { transform: translate(-20px, -50px) scale(0.92); }
  75% { transform: translate(-40px, -15px) scale(1.04); }
`;

// ── Cinematic Ambient Orbs ───────────────────────────────────────────
const AmbientOrb = styled.div<{ color: string; size: string; top: string; left: string; delay: string }>`
  position: fixed;
  width: ${p => p.size};
  height: ${p => p.size};
  top: ${p => p.top};
  left: ${p => p.left};
  border-radius: 50%;
  background: ${p => p.color};
  filter: blur(120px);
  opacity: 0.25;
  animation: ${orbFloat} 15s ease-in-out ${p => p.delay} infinite;
  pointer-events: none;
  z-index: 0;
`;

const AuthWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #020617;
  position: relative;
  overflow: hidden;
`;

const AuthCard = styled(motion.div)`
  width: 100%;
  max-width: 500px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 3rem;
  border-radius: 32px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--card-shadow);
  text-align: center;
  position: relative;
  z-index: 10;
`;

const Brand = styled(motion.div)`
  margin-bottom: 2rem;
  .icon-container {
    width: 80px;
    height: 80px;
    background: var(--gradient-neural);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    box-shadow: 0 10px 30px var(--primary-glow);
  }
  h1 { 
    font-size: 2.5rem; 
    font-weight: 800; 
    font-family: 'Outfit', sans-serif;
    background: linear-gradient(to bottom, #fff, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Form = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  text-align: left;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const ValidationCheck = styled(motion.span)`
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-shadow: 0 0 10px var(--primary-glow);
`;

const InputGroup = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;

  label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
  input, select {
    background: var(--glass-hover);
    border: 1px solid var(--glass-border);
    padding: 0.85rem 1rem;
    border-radius: 12px;
    color: var(--text-main);
    outline: none;
    font-size: 0.95rem;
    width: 100%;
    transition: all 0.3s ease;
    
    &:focus { 
      border-color: var(--primary); 
      background: var(--glass-bg);
      box-shadow: 0 0 15px rgba(45, 212, 191, 0.2);
    }
    
    option {
      background: var(--select-option-bg);
      color: var(--select-option-text);
    }
  }

  .toggle-pw {
    position: absolute;
    right: 1rem;
    bottom: 0.75rem;
    font-size: 0.8rem;
    color: var(--primary);
    cursor: pointer;
    background: transparent;
    border: none;
    outline: none;
    font-weight: 600;
  }
`;

const CheckboxGroup = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: -0.5rem;

  .check {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .forgot {
    color: var(--primary);
    cursor: pointer;
    &:hover { text-decoration: underline; }
  }
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const SubjectChip = styled.div<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: ${props => props.active ? 'var(--primary)' : 'rgba(255,255,255,0.05)'};
  color: ${props => props.active ? 'white' : 'var(--text-muted)'};
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'var(--glass-border)'};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { opacity: 0.8; }
`;

const SubmitButton = styled(motion.button)`
  background: var(--primary);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 14px;
  font-weight: 700;
  font-size: 1rem;
  margin-top: 1rem;
  cursor: pointer;
  box-shadow: 0 10px 20px var(--primary-glow);
  outline: none;
  transition: all 0.2s ease-in-out;
  &:hover:not(:disabled) { transform: translateY(-2px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const ErrorMessage = styled(motion.div)`
  background: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(244, 63, 94, 0.2);
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  line-height: 1.4;
`;

const Divider = styled(motion.div)`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 500;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--glass-border);
  }

  &:not(:empty)::before {
    margin-right: .75em;
  }

  &:not(:empty)::after {
    margin-left: .75em;
  }
`;

const GoogleButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  color: var(--text-main);
  padding: 0.95rem 1rem;
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease-in-out;
  margin-top: 0.5rem;
  width: 100%;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

// ── Password Strength Elements ───────────────────────────────────────
const StrengthMeterWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.35rem;
`;

const StrengthBarContainer = styled.div`
  width: 100%;
  height: 5px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: hidden;
`;

const StrengthBar = styled.div<{ width: number; color: string }>`
  width: ${p => p.width}%;
  height: 100%;
  background: ${p => p.color};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 3px;
  box-shadow: 0 0 10px ${p => p.color};
`;

const StrengthLabel = styled.span<{ color: string }>`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${p => p.color};
  transition: all 0.3s ease;
`;

const AVAILABLE_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'English', 'Computer Science', 'Economics'];

const Login: React.FC = () => {
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userClass, setUserClass] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (selectedSubjects.length === 0) throw new Error("Please select at least one subject.");
        await signup(email, password, name, userClass, selectedSubjects);
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Failed to process request.';
      if (msg.includes('auth/invalid-credential')) msg = "Invalid email or password.";
      if (msg.includes('auth/email-already-in-use')) msg = "An account with this email already exists.";
      if (msg.includes('auth/weak-password')) msg = "Password is too weak (min 6 characters).";
      if (msg.includes('auth/operation-not-allowed')) msg = "Email/Password sign-in is disabled in Firebase.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Failed to authenticate with Google.';
      if (msg.includes('auth/popup-closed-by-user')) {
        msg = "Sign in popup was closed. Please try again.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Helper Validators ───────────────────────────────────────────────
  const isValidEmail = (em: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
  };

  const getPasswordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: '', color: 'transparent', pct: 0 };
    let score = 0;
    if (pw.length >= 6) score += 1;
    if (pw.length >= 10) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;

    switch (score) {
      case 1:
        return { score, label: 'Weak', color: '#f43f5e', pct: 20 };
      case 2:
        return { score, label: 'Moderate', color: '#f59e0b', pct: 40 };
      case 3:
        return { score, label: 'Secure', color: '#14b8a6', pct: 60 };
      case 4:
        return { score, label: 'Strong', color: '#06b6d4', pct: 80 };
      case 5:
        return { score, label: 'Exceptional (Sync-Ready)', color: 'linear-gradient(to right, #2dd4bf, #0ea5e9, #10b981)', pct: 100 };
      default:
        return { score: 0, label: 'Weak', color: '#f43f5e', pct: 10 };
    }
  };

  // ── Animation Variants ──────────────────────────────────────────────
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 90, damping: 14 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 14 } }
  };

  return (
    <AuthWrapper>
      {/* Cinematic Background Orbs */}
      <AmbientOrb color="#2dd4bf" size="500px" top="-15%" left="60%" delay="0s" />
      <AmbientOrb color="#38bdf8" size="400px" top="50%" left="-10%" delay="3.5s" />
      <AmbientOrb color="#10b981" size="300px" top="70%" left="70%" delay="7s" />

      <AuthCard
        variants={cardVariants}
        initial="hidden"
        animate="show"
      >
        <Brand>
          <div className="icon-container">
            <span style={{ fontSize: '2.5rem', fontFamily: "'Outfit', sans-serif", fontWeight: 800, background: 'var(--gradient-neural)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', lineHeight: 1 }}>A</span>
          </div>
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>Axona<sup style={{ fontSize: '0.45em', verticalAlign: 'super' }}>™</sup></span>
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.35)', marginLeft: '10px', fontFamily: "'Inter', sans-serif", WebkitTextFillColor: 'rgba(255, 255, 255, 0.35)' }}>- by Abhranil</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>
            {isLogin ? 'Welcome back, Neuro-Master!' : 'Initialize your neural journey'}
          </p>
        </Brand>

        {error && (
          <ErrorMessage 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="animate-fade-in"
          >
            {error}
          </ErrorMessage>
        )}

        <Form 
          onSubmit={handleAuth}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="signup-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                <InputGroup variants={itemVariants}>
                  <LabelRow>
                    <label>Full Name</label>
                    {name.trim().length >= 2 && (
                      <ValidationCheck initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                        ✓ Valid
                      </ValidationCheck>
                    )}
                  </LabelRow>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </InputGroup>

                <InputGroup variants={itemVariants}>
                  <LabelRow>
                    <label>Class / Grade</label>
                    {userClass && (
                      <ValidationCheck initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                        ✓ Selected
                      </ValidationCheck>
                    )}
                  </LabelRow>
                  <select value={userClass} onChange={(e) => setUserClass(e.target.value)} required>
                    <option value="">Select Class</option>
                    {[9, 10, 11, 12].map(num => <option key={num} value={`Class ${num}`}>{`Class ${num}`}</option>)}
                    <option value="College">College</option>
                    <option value="Other">Other</option>
                  </select>
                </InputGroup>

                <InputGroup variants={itemVariants}>
                  <LabelRow>
                    <label>Pick Your Subjects</label>
                    {selectedSubjects.length > 0 && (
                      <ValidationCheck initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                        ✓ {selectedSubjects.length} selected
                      </ValidationCheck>
                    )}
                  </LabelRow>
                  <ChipContainer>
                    {AVAILABLE_SUBJECTS.map(s => (
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
              </motion.div>
            )}
          </AnimatePresence>

          <InputGroup variants={itemVariants}>
            <LabelRow>
              <label>Email Address</label>
              {isValidEmail(email) && (
                <ValidationCheck initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  ✓ Valid Email
                </ValidationCheck>
              )}
            </LabelRow>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </InputGroup>

          <InputGroup variants={itemVariants}>
            <LabelRow>
              <label>Password</label>
              {password.length >= 6 && (
                <ValidationCheck initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  ✓ Secure length
                </ValidationCheck>
              )}
            </LabelRow>
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button 
              type="button" 
              className="toggle-pw" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>

            {/* Password Strength Meter for Signup */}
            {!isLogin && password && (
              <StrengthMeterWrapper
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Strength:</span>
                  <StrengthLabel color={getPasswordStrength(password).score >= 5 ? '#10b981' : getPasswordStrength(password).color}>
                    {getPasswordStrength(password).label}
                  </StrengthLabel>
                </div>
                <StrengthBarContainer>
                  <StrengthBar 
                    width={getPasswordStrength(password).pct} 
                    color={getPasswordStrength(password).score >= 5 ? 'linear-gradient(to right, #2dd4bf, #0ea5e9, #10b981)' : getPasswordStrength(password).color} 
                  />
                </StrengthBarContainer>
              </StrengthMeterWrapper>
            )}
          </InputGroup>
          
          <CheckboxGroup variants={itemVariants}>
            <div className="check" onClick={() => setRememberMe(!rememberMe)}>
              <input type="checkbox" checked={rememberMe} readOnly />
              <span>Remember Me</span>
            </div>
            {isLogin && <span className="forgot" onClick={() => alert("Check your email for reset instructions.")}>Forgot Password?</span>}
          </CheckboxGroup>

          <SubmitButton 
            variants={itemVariants} 
            type="submit" 
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </SubmitButton>
        </Form>

        <Divider variants={itemVariants}>or continue with</Divider>

        <GoogleButton 
          variants={itemVariants} 
          type="button" 
          onClick={handleGoogleAuth} 
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
        </GoogleButton>

        <motion.p 
          variants={itemVariants} 
          style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </motion.p>
      </AuthCard>
    </AuthWrapper>
  );
};

export default Login;
