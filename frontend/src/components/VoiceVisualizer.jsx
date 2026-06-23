import { useEffect, useRef } from 'react';

export default function VoiceVisualizer({ isPlaying, color = '#FF6B35' }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 200;
    const H = canvas.height = 40;
    let phase = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      if (!isPlaying) {
        // Idle: flat line
        ctx.beginPath();
        ctx.strokeStyle = color + '40';
        ctx.lineWidth = 2;
        ctx.moveTo(0, H / 2);
        ctx.lineTo(W, H / 2);
        ctx.stroke();
        return;
      }

      // Active: animated waveform bars
      const bars = 30;
      const barWidth = W / bars - 2;
      for (let i = 0; i < bars; i++) {
        const x = i * (barWidth + 2);
        const amplitude = Math.sin(phase + i * 0.3) * 0.5 + 0.5;
        const noise = Math.random() * 0.3;
        const height = (amplitude + noise) * (H * 0.8);
        const y = (H - height) / 2;

        // Gradient opacity
        const alpha = 0.4 + amplitude * 0.6;
        ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 2);
        ctx.fill();
      }

      phase += 0.15;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying, color]);

  return (
    <canvas
      ref={canvasRef}
      className="inline-block"
      style={{ width: 100, height: 20 }}
    />
  );
}
