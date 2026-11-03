import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background: var(--bg-darker);
  color: var(--text-main);
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;

  /* Accent Orbs */
  &::before {
    content: '';
    position: absolute;
    width: 600px;
    height: 600px;
    top: -200px;
    left: -200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(45, 212, 191, 0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  &::after {
    content: '';
    position: absolute;
    width: 500px;
    height: 500px;
    bottom: -100px;
    right: -100px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
`;

const Header = styled.header`
  max-width: 800px;
  width: 100%;
  text-align: center;
  margin-bottom: 3rem;
  z-index: 10;
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 3rem;
  font-weight: 800;
  background: var(--gradient-neural);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: var(--text-muted);
  line-height: 1.6;
`;

const ContentCard = styled(motion.div)`
  max-width: 800px;
  width: 100%;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: var(--card-shadow);
  z-index: 10;
  line-height: 1.8;

  h2 {
    font-family: 'Outfit', sans-serif;
    font-size: 1.5rem;
    color: #ffffff;
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-weight: 700;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding-bottom: 0.5rem;
  }

  p {
    margin-bottom: 1.25rem;
    color: var(--text-main);
    opacity: 0.9;
  }

  ul {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
    list-style-type: disc;
    color: var(--text-main);
    opacity: 0.9;
    li {
      margin-bottom: 0.5rem;
    }
  }

  a {
    color: #2dd4bf;
    text-decoration: none;
    font-weight: 600;
    transition: opacity 0.2s;
    &:hover {
      text-decoration: underline;
      opacity: 0.8;
    }
  }
`;

const BackButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #2dd4bf;
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 2rem;
  z-index: 10;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateX(-4px);
  }
`;

export const Terms: React.FC = () => {
  return (
    <PageContainer>
      <BackButton href="/landing">
        ← Back to Home
      </BackButton>
      <Header>
        <Title>Terms of Service</Title>
        <Subtitle>Last updated: June 6, 2026</Subtitle>
      </Header>
      <ContentCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p>
          Welcome to Axona™! These Terms of Service ("Terms") govern your use of the website located at <a href="https://axona-as.vercel.app">https://axona-as.vercel.app</a> (the "Service") operated by Axona™ ("us", "we", or "our").
        </p>
        <p>
          By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
        </p>

        <h2>1. Description of Service</h2>
        <p>
          Axona™ is a high-performance educational workspace designed to assist students preparing for secondary board standards (including CBSE, ICSE, WBBSE, Cambridge, and IB) and competitive examinations. Features include syllabus progress tracking, study timers, streak counters, and an AI-powered doubt-solver (Oracle™).
        </p>

        <h2>2. Subscription and Demonstration Notice</h2>
        <p>
          Axona™ offers free accounts ("Neural Core") and mock premium subscriptions ("Cortex Unlimited"). 
        </p>
        <ul>
          <li><strong>Simulated Purchases:</strong> Please note that any billing features, checkout interfaces, and upgrade mechanisms displayed on the website are for demonstration, simulation, and evaluation purposes only. No real currency is processed, and no subscription contracts are executed.</li>
          <li><strong>Free Access:</strong> Access to all features within the simulated tiers is currently provided free of charge during the evaluation phase. We reserve the right to limit, modify, or terminate access to any of these features at any time without prior notice.</li>
        </ul>

        <h2>3. Accounts</h2>
        <p>
          When you create an account with us, you guarantee that the information you provide is accurate, complete, and current. Inaccurate or incomplete information may lead to the immediate termination of your account.
        </p>
        <p>
          You are responsible for safeguarding the credentials you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
        </p>

        <h2>4. Use of AI Doubt Solver (Oracle™)</h2>
        <p>
          Our AI Doubt Solver generates explanations, proofs, and answers utilizing artificial intelligence models. 
        </p>
        <ul>
          <li><strong>Educational Assistance Only:</strong> The AI responses are intended as study aids and tutoring guides. They should not be used as the sole source for official grading, exams, or homework assignments.</li>
          <li><strong>Accuracy:</strong> While we aim for maximum mathematical and physical precision, AI-generated content can occasionally contain errors. Please cross-reference results with official curriculum textbooks.</li>
        </ul>

        <h2>5. Intellectual Property</h2>
        <p>
          The Service and its original content, features, and functionality are and will remain the exclusive property of Axona™ and its licensors. The Service is protected by copyright, trademark, and other laws of both local and foreign jurisdictions.
        </p>
        <p>
          Our trademarks (including Axona™, Atlas™, NeuroLog™, Momentum™, Recall™, and Oracle™) may not be used in connection with any product or service without the prior written consent of Axona™.
        </p>

        <h2>6. Links To Other Web Sites</h2>
        <p>
          Our Service may contain links to third-party web sites or services that are not owned or controlled by Axona™.
        </p>
        <p>
          Axona™ has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party web sites or services. You further acknowledge and agree that Axona™ shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods, or services available on or through any such web sites or services.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          In no event shall Axona™, nor its developers, officers, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
        </p>
        <ul>
          <li>Your access to or use of or inability to access or use the Service.</li>
          <li>Any conduct or content of any third party on the Service.</li>
          <li>Any content obtained from the Service.</li>
          <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
        </ul>

        <h2>8. Disclaimer</h2>
        <p>
          Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us:
        </p>
        <p>
          <strong>Email:</strong> contact@axona-as.vercel.app<br />
          <strong>Developer:</strong> Abhranil Sen
        </p>
      </ContentCard>
    </PageContainer>
  );
};

export default Terms;
