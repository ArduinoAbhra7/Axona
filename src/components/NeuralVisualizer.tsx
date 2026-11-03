import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const CanvasWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

const InteractiveCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
`;

/* ── Multi-color palette for nodes & connections ────────────────── */
const PALETTE = {
  dark: {
    aquamarine: { r: 45, g: 212, b: 191 },
    cyan:       { r: 6,  g: 182, b: 212 },
    skyBlue:    { r: 56, g: 189, b: 248 },
    emerald:    { r: 16, g: 185, b: 129 },
  },
  light: {
    aquamarine: { r: 20, g: 184, b: 166 },
    cyan:       { r: 8,  g: 145, b: 178 },
    skyBlue:    { r: 14, g: 165, b: 233 },
    emerald:    { r: 5,  g: 150, b: 105 },
  },
};

const PALETTE_KEYS = ['aquamarine', 'cyan', 'skyBlue', 'emerald'] as const;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  colorIdx: number;      // index into PALETTE_KEYS
  pulsePhase: number;    // offset for glow pulse animation
  glowRadius: number;    // outer glow size
}

export const NeuralVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const mouseRef = useRef({ x: -9999, y: -9999 });

  // Detect active theme
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const isMobile = window.innerWidth <= 768;
    const particleCount = isMobile ? 35 : 120;           // Fewer nodes for mobile performance
    const connectionDistance = isMobile ? 80 : 130;      // Shorter connections
    const mouseConnectionDistance = isMobile ? 0 : 220; // Disable mouse links on touch screens
    let time = 0;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = rect?.width || window.innerWidth;
      canvas.height = rect?.height || window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2.2 + 1.2,
          colorIdx: Math.floor(Math.random() * PALETTE_KEYS.length),
          pulsePhase: Math.random() * Math.PI * 2,
          glowRadius: Math.random() * 6 + 4,
        });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.012;

      const pal = theme === 'dark' ? PALETTE.dark : PALETTE.light;
      const palArr = PALETTE_KEYS.map(k => pal[k]);

      // ── Draw connection lines (gradient-colored or fast solid path) ──
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const c1 = palArr[p1.colorIdx];

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.18;
            const c2 = palArr[p2.colorIdx];

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            if (isMobile) {
              // Fast path: draw solid colored line instead of expensive gradient
              ctx.strokeStyle = `rgba(${c1.r}, ${c1.g}, ${c1.b}, ${alpha})`;
            } else {
              // Create gradient line between the two colored nodes (desktop only)
              const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
              grad.addColorStop(0, `rgba(${c1.r}, ${c1.g}, ${c1.b}, ${alpha})`);
              grad.addColorStop(1, `rgba(${c2.r}, ${c2.g}, ${c2.b}, ${alpha})`);
              ctx.strokeStyle = grad;
            }

            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // ── Mouse connection lines (desktop only) ────────────────
        if (!isMobile) {
          const dxMouse = p1.x - mouseRef.current.x;
          const dyMouse = p1.y - mouseRef.current.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

          if (distMouse < mouseConnectionDistance) {
            const alpha = (1 - distMouse / mouseConnectionDistance) * 0.4;
            const grad = ctx.createLinearGradient(p1.x, p1.y, mouseRef.current.x, mouseRef.current.y);
            grad.addColorStop(0, `rgba(${c1.r}, ${c1.g}, ${c1.b}, ${alpha})`);
            grad.addColorStop(1, `rgba(56, 189, 248, ${alpha * 0.6})`);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

      // ── Draw particles with glow halos ─────────────────────────
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const c = palArr[p.colorIdx];
        const pulse = Math.sin(time * 2 + p.pulsePhase) * 0.5 + 0.5; // 0..1

        // Outer glow halo
        const glowSize = p.glowRadius + pulse * 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);

        if (isMobile) {
          // Fast path: solid low-opacity fill (no expensive radial gradients)
          ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${0.08 + pulse * 0.04})`;
        } else {
          // Slow path: radial gradient glow (desktop only)
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
          glow.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${0.25 + pulse * 0.15})`);
          glow.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, ${0.08 + pulse * 0.05})`);
          glow.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
          ctx.fillStyle = glow;
        }

        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + pulse * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${0.7 + pulse * 0.3})`;
        ctx.fill();
      });

      // ── Mouse cursor glow beacon (desktop only) ────────────────
      if (!isMobile && mouseRef.current.x > 0 && mouseRef.current.y > 0) {
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const beaconPulse = Math.sin(time * 3) * 0.5 + 0.5;
        const beaconSize = 30 + beaconPulse * 15;

        const beacon = ctx.createRadialGradient(mx, my, 0, mx, my, beaconSize);
        beacon.addColorStop(0, `rgba(56, 189, 248, ${0.15 + beaconPulse * 0.1})`);
        beacon.addColorStop(0.4, `rgba(45, 212, 191, ${0.08 + beaconPulse * 0.05})`);
        beacon.addColorStop(1, 'rgba(45, 212, 191, 0)');

        ctx.beginPath();
        ctx.arc(mx, my, beaconSize, 0, Math.PI * 2);
        ctx.fillStyle = beacon;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <CanvasWrapper>
      <InteractiveCanvas ref={canvasRef} />
    </CanvasWrapper>
  );
};

export default NeuralVisualizer;
