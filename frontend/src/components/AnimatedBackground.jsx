import React, { useState, useEffect } from 'react';

const PILL_TEXTS = ['#Focus', '#Growth', '#Mastery', '#Consistency', '#Learning', '#Success', '#Discipline', '#Journey', '#Coding', '#Future', '#Design', '#AI', '#Data', '#Cloud', '#DevOps', '#Security'];
const EMOJIS = ['🎯', '💡', '🚀', '✨', '💻', '🧠', '🔥', '🌟', '📚', '🏆', '⚡', '🎓', '🛠️', '📈', '🧭', '🔮', '🧩'];

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export default function AnimatedBackground() {
  const [pills, setPills] = useState([]);
  const [emojis, setEmojis] = useState([]);

  useEffect(() => {
    setPills(shuffleArray(PILL_TEXTS).slice(0, 12));
    setEmojis(shuffleArray(EMOJIS).slice(0, 14));
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Pills */}
      <div className="pill-tag animate-float-reverse" style={{ position: 'absolute', top: '6%', left: '5%', background: 'var(--accent-pink)', color: 'white', border: 'none', padding: '8px 24px', fontSize: 14 }}>
        {pills[0] || '#Focus'}
      </div>
      <div className="pill-tag animate-float" style={{ position: 'absolute', top: '7%', left: '38%', background: 'var(--accent-teal)', color: 'white', border: 'none', padding: '8px 24px', fontSize: 14 }}>
        {pills[1] || '#Growth'}
      </div>
      <div className="pill-tag animate-float-horizontal" style={{ position: 'absolute', top: '22%', right: '42%', background: 'var(--surface-color)', color: 'var(--accent-orange)', border: 'none', padding: '8px 24px', fontSize: 14 }}>
        {pills[2] || '#Mastery'}
      </div>
      <div className="pill-tag animate-float" style={{ position: 'absolute', top: '14%', right: '6%', background: 'var(--accent-mint)', color: 'var(--accent-teal)', border: 'none', padding: '8px 24px', fontSize: 14 }}>
        {pills[3] || '#Consistency'}
      </div>
      <div className="pill-tag animate-float-reverse" style={{ position: 'absolute', top: '46%', left: '4%', background: 'var(--accent-orange)', color: 'white', border: 'none', padding: '8px 24px', fontSize: 14 }}>
        {pills[4] || '#Learning'}
      </div>
      <div className="pill-tag animate-float-horizontal" style={{ position: 'absolute', top: '20%', left: '18%', background: 'var(--accent-mint)', color: 'var(--accent-teal)', border: 'none', padding: '8px 24px', fontSize: 14, opacity: 0.8 }}>
        {pills[5] || '#Success'}
      </div>
      <div className="pill-tag animate-float" style={{ position: 'absolute', top: '56%', left: '16%', background: 'var(--accent-pink)', color: 'white', border: 'none', padding: '8px 24px', fontSize: 14, opacity: 0.9 }}>
        {pills[6] || '#Discipline'}
      </div>
      <div className="pill-tag animate-float-reverse" style={{ position: 'absolute', top: '36%', right: '4%', background: 'var(--surface-color)', color: 'var(--text-primary)', border: 'none', padding: '8px 24px', fontSize: 14, opacity: 0.8 }}>
        {pills[7] || '#Journey'}
      </div>
      <div className="pill-tag animate-float" style={{ position: 'absolute', top: '64%', right: '40%', background: 'var(--accent-teal)', color: 'white', border: 'none', padding: '8px 24px', fontSize: 14, opacity: 0.8 }}>
        {pills[8] || '#Coding'}
      </div>
      <div className="pill-tag animate-float-horizontal" style={{ position: 'absolute', top: '68%', right: '22%', background: 'var(--accent-orange)', color: 'white', border: 'none', padding: '8px 24px', fontSize: 14, opacity: 0.9 }}>
        {pills[9] || '#Future'}
      </div>
      <div className="pill-tag animate-float" style={{ position: 'absolute', top: '62%', right: '5%', background: 'var(--accent-mint)', color: 'var(--accent-teal)', border: 'none', padding: '8px 24px', fontSize: 14, opacity: 0.8 }}>
        {pills[10] || '#Design'}
      </div>
      <div className="pill-tag animate-float-reverse" style={{ position: 'absolute', bottom: '6%', left: '6%', background: 'var(--accent-teal)', color: 'white', border: 'none', padding: '8px 24px', fontSize: 14, opacity: 0.9 }}>
        {pills[11] || '#DevOps'}
      </div>

      {/* Emojis */}
      <div className="animate-float" style={{ position: 'absolute', top: '26%', left: '5%', fontSize: 30, opacity: 0.8 }}>
        {emojis[0] || '🎯'}
      </div>
      <div className="animate-float-reverse" style={{ position: 'absolute', top: '68%', left: '5%', fontSize: 36, opacity: 0.6 }}>
        {emojis[1] || '💡'}
      </div>
      <div className="animate-float" style={{ position: 'absolute', top: '5%', left: '22%', fontSize: 34, opacity: 0.7 }}>
        {emojis[2] || '🚀'}
      </div>
      <div className="animate-float-horizontal" style={{ position: 'absolute', top: '6%', right: '36%', fontSize: 28, opacity: 0.7 }}>
        {emojis[3] || '✨'}
      </div>
      <div className="animate-float" style={{ position: 'absolute', top: '5%', right: '16%', fontSize: 32, opacity: 0.6 }}>
        {emojis[4] || '💻'}
      </div>
      <div className="animate-float-reverse" style={{ position: 'absolute', top: '35%', left: '28%', fontSize: 30, opacity: 0.8 }}>
        {emojis[5] || '🧠'}
      </div>
      <div className="animate-float-horizontal" style={{ position: 'absolute', top: '26%', right: '15%', fontSize: 26, opacity: 0.6 }}>
        {emojis[6] || '🔥'}
      </div>
      <div className="animate-float" style={{ position: 'absolute', top: '75%', left: '26%', fontSize: 32, opacity: 0.5 }}>
        {emojis[7] || '🌟'}
      </div>
      <div className="animate-float-reverse" style={{ position: 'absolute', top: '52%', right: '14%', fontSize: 28, opacity: 0.7 }}>
        {emojis[8] || '📚'}
      </div>
      <div className="animate-float" style={{ position: 'absolute', bottom: '12%', left: '42%', fontSize: 38, opacity: 0.5 }}>
        {emojis[9] || '🏆'}
      </div>
      <div className="animate-float-horizontal" style={{ position: 'absolute', bottom: '8%', right: '28%', fontSize: 30, opacity: 0.6 }}>
        {emojis[10] || '⚡'}
      </div>
      <div className="animate-float" style={{ position: 'absolute', bottom: '10%', right: '8%', fontSize: 36, opacity: 0.7 }}>
        {emojis[11] || '🎓'}
      </div>
      <div className="animate-float-reverse" style={{ position: 'absolute', bottom: '6%', left: '26%', fontSize: 36, opacity: 0.5 }}>
        {emojis[12] || '🚀'}
      </div>
      <div className="animate-float-horizontal" style={{ position: 'absolute', top: '44%', right: '26%', fontSize: 28, opacity: 0.6 }}>
        {emojis[13] || '🔥'}
      </div>

      {/* Blobs */}
      <div className="bento-card card-orange animate-float" style={{ position: 'absolute', top: '-10%', left: '-10%', width: 500, height: 500, borderRadius: '50%', opacity: 0.12, zIndex: -1 }}></div>
      <div className="bento-card card-pink animate-float-reverse" style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 600, height: 600, borderRadius: '40%', opacity: 0.12, zIndex: -1 }}></div>
      <div className="bento-card card-teal animate-float-horizontal" style={{ position: 'absolute', top: '30%', left: '40%', width: 300, height: 300, borderRadius: '45%', opacity: 0.08, zIndex: -1, filter: 'blur(40px)' }}></div>
    </div>
  );
}
