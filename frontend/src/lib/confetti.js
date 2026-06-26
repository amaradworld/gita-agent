/* ─── Confetti Effect ─── */
export function fireConfetti(options = {}) {
  const {
    particleCount = 80,
    spread = 70,
    origin = { y: 0.6 },
    colors = ['#f59e0b', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4'],
  } = options;

  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;width:100%;height:100%';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: canvas.width * origin.x + (Math.random() - 0.5) * canvas.width * spread / 100,
      y: canvas.height * origin.y,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 12 - 4,
      size: Math.random() * 6 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      gravity: 0.15,
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    });
  }

  let frame = 0;
  const maxFrames = 120;

  function animate() {
    if (frame >= maxFrames) {
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.vy += p.gravity;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(0, 1 - frame / maxFrames);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    frame++;
    requestAnimationFrame(animate);
  }

  animate();
}

/* ─── Haptic Feedback ─── */
export function haptic(type = 'light') {
  if (!navigator.vibrate) return;

  switch (type) {
    case 'light':
      navigator.vibrate(10);
      break;
    case 'medium':
      navigator.vibrate(20);
      break;
    case 'heavy':
      navigator.vibrate(40);
      break;
    case 'success':
      navigator.vibrate([10, 50, 20]);
      break;
    case 'error':
      navigator.vibrate([30, 50, 30, 50, 30]);
      break;
    case 'celebration':
      navigator.vibrate([10, 30, 10, 30, 10, 30, 20]);
      break;
    default:
      navigator.vibrate(10);
  }
}

/* ─── Confetti for specific events ─── */
export function achievementConfetti() {
  fireConfetti({ particleCount: 100, spread: 90, colors: ['#f59e0b', '#f97316', '#fbbf24', '#fcd34d'] });
  haptic('celebration');
}

export function milestoneConfetti() {
  fireConfetti({ particleCount: 150, spread: 120, colors: ['#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#f97316'] });
  haptic('celebration');
}

export function subtleConfetti() {
  fireConfetti({ particleCount: 30, spread: 50 });
  haptic('success');
}
