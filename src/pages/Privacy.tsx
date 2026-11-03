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

export const Privacy: React.FC = () => {
  return (
    <PageContainer>
      <BackButton href="/landing">
        ← Back to Home
      </BackButton>
      <Header>
        <Title>Privacy Policy</Title>
        <Subtitle>Last updated: June 6, 2026</Subtitle>
      </Header>
      <ContentCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p>
          At Axona™ (accessible from <a href="https://axona-as.vercel.app">https://axona-as.vercel.app</a>), the privacy of our visitors is one of our main priorities. This Privacy Policy document contains types of information that is collected and recorded by Axona™ and how we use it.
        </p>
        <p>
          If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <strong>contact@axona-as.vercel.app</strong>.
        </p>

        <h2>1. Log Files</h2>
        <p>
          Axona™ follows a standard procedure of using log files. These files log visitors when they use the app. All hosting companies do this as a part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
        </p>

        <h2>2. Cookies and Web Beacons</h2>
        <p>
          Like any other website, Axona™ uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
        </p>

        <h2>3. Google DoubleClick DART Cookie</h2>
        <p>
          Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">https://policies.google.com/technologies/ads</a>.
        </p>

        <h2>4. Our Advertising Partners</h2>
        <p>
          Some of the advertisers on our site may use cookies and web beacons. Our advertising partners include:
        </p>
        <ul>
          <li><strong>Google AdSense / AdMob:</strong> Google's privacy policy and terms can be found at <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">https://policies.google.com/technologies/ads</a>.</li>
        </ul>
        <p>
          Each of our advertising partners has their own Privacy Policy for their policies on user data. For easier access, we hyperlinked to their Privacy Policies above. Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Axona™, which are sent directly to users' browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
        </p>
        <p>
          Note that Axona™ has no access to or control over these cookies that are used by third-party advertisers.
        </p>

        <h2>5. Third Party Privacy Policies</h2>
        <p>
          Axona's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
        </p>
        <p>
          You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.
        </p>

        <h2>6. Information Collected via Services</h2>
        <p>
          When you register for an account or utilize the study functions on Axona™, we may collect:
        </p>
        <ul>
          <li><strong>Account Details:</strong> Display name, profile image, and email address.</li>
          <li><strong>Study Analytics:</strong> Total study sessions, subject syllabus progression, weak learning areas, and timer logs.</li>
          <li><strong>AI Queries:</strong> Text inputted to our AI Doubt Solver (Oracle™) to fetch step-by-step mathematical explanations.</li>
        </ul>
        <p>
          This data is stored securely using Google Firebase (Firestore and Authentication) and is never shared, sold, or distributed to third parties.
        </p>

        <h2>7. Children's Information</h2>
        <p>
          Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
        </p>
        <p>
          Axona™ does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
        </p>

        <h2>8. Consent</h2>
        <p>
          By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at:
        </p>
        <p>
          <strong>Email:</strong> contact@axona-as.vercel.app<br />
          <strong>Developer:</strong> Abhranil Sen
        </p>
      </ContentCard>
    </PageContainer>
  );
};

export default Privacy;
