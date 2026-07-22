import { useEffect, useRef } from 'react';

export default function Confetti({ active, onDone }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      r: Math.random() * 8 + 4,
      color: ['#a855f7','#ec4899','#f97316','#10b981','#f59e0b','#3b82f6'][Math.floor(Math.random()*6)],
      speed: Math.random() * 4 + 2,
      swing: Math.random() * 3 - 1.5,
      angle: Math.random() * 360,
      spin: Math.random() * 5 - 2.5,
    }));

    let frame;
    let done = false;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.y += p.speed;
        p.x += p.swing;
        p.angle += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r/1.5);
        ctx.restore();
      });

      if (!done) frame = requestAnimationFrame(animate);
    };

    animate();
    const timer = setTimeout(() => {
      done = true;
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (onDone) onDone();
    }, 3000);

    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [active]);

  if (!active) return null;

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      pointerEvents: 'none', zIndex: 9999
    }} />
  );
}