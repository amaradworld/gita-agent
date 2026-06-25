import React, { useRef, useEffect, useMemo } from 'react';

// ─── Floating particles with organic motion ─────────────
function Particle({ size, x, y, duration, delay, color }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: color,
        animation: `float-particle ${duration}s ease-in-out ${delay}s infinite`,
        filter: 'blur(1px)',
      }}
    />
  );
}

// ─── Ambient glow orbs ──────────────────────────────────
function GlowOrb({ size, x, y, color, duration }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        animation: `drift ${duration}s ease-in-out infinite`,
        filter: 'blur(40px)',
      }}
    />
  );
}

// ─── Main Dynamic Background ────────────────────────────
export default function DynamicBackground({ mood = 'default', activeTab = 'chat' }) {
  const canvasRef = useRef(null);

  // Mood-based color palettes
  const palettes = useMemo(() => ({
    default: {
      orbs: ['rgba(251,191,36,0.04)', 'rgba(249,115,22,0.03)', 'rgba(239,68,68,0.02)'],
      particles: 'rgba(251,191,36,0.15)',
      gradient: 'from-amber-500/5 via-orange-500/3 to-red-500/2',
    },
    peace: {
      orbs: ['rgba(99,102,241,0.04)', 'rgba(139,92,246,0.03)', 'rgba(59,130,246,0.02)'],
      particles: 'rgba(139,92,246,0.12)',
      gradient: 'from-indigo-500/5 via-purple-500/3 to-blue-500/2',
    },
    energy: {
      orbs: ['rgba(251,191,36,0.05)', 'rgba(245,158,11,0.04)', 'rgba(249,115,22,0.03)'],
      particles: 'rgba(245,158,11,0.18)',
      gradient: 'from-amber-500/6 via-yellow-500/4 to-orange-500/3',
    },
    calm: {
      orbs: ['rgba(34,197,94,0.04)', 'rgba(16,185,129,0.03)', 'rgba(6,182,212,0.02)'],
      particles: 'rgba(34,197,94,0.12)',
      gradient: 'from-emerald-500/5 via-teal-500/3 to-cyan-500/2',
    },
    sad: {
      orbs: ['rgba(99,102,241,0.03)', 'rgba(79,70,229,0.02)', 'rgba(67,56,202,0.02)'],
      particles: 'rgba(99,102,241,0.10)',
      gradient: 'from-indigo-500/4 via-violet-500/3 to-purple-500/2',
    },
  }), []);

  const palette = palettes[mood] || palettes.default;

  // Generate stable particle positions
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: `${2 + (i % 4)}px`,
      x: (i * 17 + 5) % 100,
      y: (i * 23 + 10) % 100,
      duration: 6 + (i % 5) * 2,
      delay: (i % 7) * 0.8,
    })), []);

  // Canvas-based animated gradient mesh
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      time += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Animated gradient mesh circles
      const circles = [
        { x: 0.2 + Math.sin(time * 0.7) * 0.1, y: 0.3 + Math.cos(time * 0.5) * 0.15, r: 200, color: palette.orbs[0] },
        { x: 0.8 + Math.cos(time * 0.6) * 0.1, y: 0.7 + Math.sin(time * 0.8) * 0.1, r: 180, color: palette.orbs[1] },
        { x: 0.5 + Math.sin(time * 0.4) * 0.15, y: 0.5 + Math.cos(time * 0.3) * 0.1, r: 250, color: palette.orbs[2] },
      ];

      circles.forEach(c => {
        const gradient = ctx.createRadialGradient(
          c.x * canvas.width, c.y * canvas.height, 0,
          c.x * canvas.width, c.y * canvas.height, c.r
        );
        gradient.addColorStop(0, c.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      animFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, [palette]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Canvas gradient mesh */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* Floating particles */}
      {particles.map(p => (
        <Particle
          key={p.id}
          size={p.size}
          x={p.x}
          y={p.y}
          duration={p.duration}
          delay={p.delay}
          color={palette.particles}
        />
      ))}

      {/* Ambient glow orbs */}
      {palette.orbs.map((color, i) => (
        <GlowOrb
          key={i}
          size={`${150 + i * 80}px`}
          x={20 + i * 30}
          y={30 + i * 20}
          color={color}
          duration={8 + i * 3}
        />
      ))}

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />

      {/* Vignette effect */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
      }} />
    </div>
  );
}
