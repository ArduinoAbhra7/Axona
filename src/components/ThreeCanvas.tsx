import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import HolographicMatrix from './HolographicMatrix';
import FluidPostProcessing from './FluidPostProcessing';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth <= 1024 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
      setIsMobile(!!mobile);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

export const ThreeCanvas: React.FC = () => {
  const [dpr, setDpr] = useState(1.0);
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('medium');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const isMobile = useIsMobile();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(activeTheme as 'light' | 'dark');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(initialTheme as 'light' | 'dark');

    return () => observer.disconnect();
  }, []);

  const handleDecline = () => {
    setQuality('low');
    setDpr(0.75);
  };

  const handleIncline = () => {
    setQuality('medium');
    setDpr(1.0);
  };

  const darkBg = '#001e1e';
  const lightBg = '#f0fdfa';
  const bgColor = theme === 'dark' ? darkBg : lightBg;

  // On mobile, skip WebGL entirely and use a pure CSS gradient background
  if (isMobile) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: theme === 'dark'
          ? `radial-gradient(ellipse at 20% 50%, rgba(45, 212, 191, 0.08) 0%, transparent 60%),
             radial-gradient(ellipse at 80% 20%, rgba(56, 189, 248, 0.06) 0%, transparent 50%),
             linear-gradient(180deg, #001e1e 0%, #00312f 100%)`
          : `radial-gradient(ellipse at 20% 50%, rgba(45, 212, 191, 0.1) 0%, transparent 60%),
             radial-gradient(ellipse at 80% 20%, rgba(56, 189, 248, 0.08) 0%, transparent 50%),
             linear-gradient(180deg, #f0fdfa 0%, #e6faf6 100%)`
      }} />
    );
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'auto',
        background: bgColor,
      }}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          dpr={dpr}
          shadows={false}
          gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
        >
          <color attach="background" args={[bgColor]} />
          <fog attach="fog" args={[bgColor, 5, 20]} />

          <PerformanceMonitor
            onDecline={handleDecline}
            onIncline={handleIncline}
            threshold={0.8}
          />

          {/* All pages use the same clean particle background */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <pointLight position={[-8, 5, -5]} intensity={0.8} color="#2DD4BF" />
          <pointLight position={[8, -5, 5]} intensity={1.0} color="#38BDF8" />
          <HolographicMatrix quality={quality} />

          <FluidPostProcessing quality={quality} />
        </Canvas>
      </div>
    </>
  );
};

export default ThreeCanvas;
