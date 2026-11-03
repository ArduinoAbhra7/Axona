import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import styled, { keyframes } from 'styled-components';
import Spline from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';

// ─── Production Spline Scene Registry ───────────────────────────────
export const SPLINE_SCENES = {
  DASHBOARD_BRAIN:   'https://prod.spline.design/6tS6YfKXQlPyYYe2/scene.splinecode',
  AI_KEYBOARD:       'https://prod.spline.design/Q83mpuua9MdkUt8H/scene.splinecode',
  GLOBAL_ABSTRACT:   'https://prod.spline.design/6M2MbJrq0c1wTqiy/scene.splinecode',
  UI_FROSTED_GLASS:  'https://prod.spline.design/urVWB3MbYCjLt5Bq/scene.splinecode',
} as const;

// ─── Animations ─────────────────────────────────────────────────────
const spinGlow = keyframes`
  0%   { transform: rotate(0deg);   border-top-color: var(--primary); }
  50%  { transform: rotate(180deg); border-top-color: var(--accent); }
  100% { transform: rotate(360deg); border-top-color: var(--primary); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ─── Container: Now fully transparent, no boxing ────────────────────
const SplineContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  /* No background, no border, no border-radius — the 3D asset floats freely */
  background: transparent;
  overflow: visible;
`;

const LoadingOverlay = styled.div<{ active: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  transition: opacity 0.6s ease;
  opacity: ${p => p.active ? 1 : 0};
  pointer-events: ${p => p.active ? 'auto' : 'none'};
  /* No backdrop — keep it spatial */
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.04);
  border-top: 2px solid var(--primary);
  border-radius: 50%;
  animation: ${spinGlow} 1.5s linear infinite;
`;

const LoadingText = styled.div`
  font-size: 0.7rem;
  font-family: 'Inter', monospace;
  letter-spacing: 2px;
  text-transform: uppercase;
  background: linear-gradient(90deg, rgba(148,163,184,0.5) 25%, white 50%, rgba(148,163,184,0.5) 75%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 2s linear infinite;
`;

// ─── Types ──────────────────────────────────────────────────────────
export interface SplineAnchorHandle {
  app: Application | null;
}

export interface SplineAnchorProps {
  scene?: string;
  loadingText?: string;
  onSplineMouseDown?: (e: any) => void;
  onSplineLoad?: (app: Application) => void;
  /** Additional inline styles for the outermost wrapper */
  style?: React.CSSProperties;
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────
export const SplineAnchor = forwardRef<SplineAnchorHandle, SplineAnchorProps>(({
  scene = SPLINE_SCENES.DASHBOARD_BRAIN,
  loadingText = 'Loading...',
  onSplineMouseDown,
  onSplineLoad,
  style,
  className,
}, ref) => {
  const [loading, setLoading] = useState(true);
  const appRef = useRef<Application | null>(null);

  useImperativeHandle(ref, () => ({
    get app() { return appRef.current; },
  }));

  const handleLoad = (splineApp: Application) => {
    appRef.current = splineApp;
    setLoading(false);
    onSplineLoad?.(splineApp);
  };

  const handleMouseDown = (e: any) => {
    if (onSplineMouseDown) {
      console.log('[SplineAnchor] Object clicked:', e?.target?.name || 'scene');
      onSplineMouseDown(e);
    }
  };

  return (
    <SplineContainer style={style} className={className}>
      <LoadingOverlay active={loading}>
        <LoadingSpinner />
        <LoadingText>{loadingText}</LoadingText>
      </LoadingOverlay>

      <Spline
        scene={scene}
        onLoad={handleLoad}
        onMouseDown={handleMouseDown}
        style={{
          width: '100%',
          height: '100%',
          display: loading ? 'none' : 'block',
          background: 'transparent',
          backgroundColor: 'transparent',
        }}
      />
    </SplineContainer>
  );
});

SplineAnchor.displayName = 'SplineAnchor';
export default SplineAnchor;
