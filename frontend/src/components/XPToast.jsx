import { useState, useEffect } from 'react';

export default function XPToast({ xp, badge, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); if (onDone) onDone(); }, 3000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div style={s.wrap}>
      <style>{css}</style>
      {xp > 0 && (
        <div style={s.toast} className="toast-in">
          <span style={s.icon}>⚡</span>
          <div>
            <div style={s.main}>+{xp} XP earned!</div>
            <div style={s.sub}>keep going 🔥</div>
          </div>
        </div>
      )}
      {badge && (
        <div style={{ ...s.toast, ...s.badgeToast }} className="toast-in">
          <span style={s.icon}>{badge.emoji}</span>
          <div>
            <div style={s.main}>Badge unlocked!</div>
            <div style={s.sub}>{badge.name} — {badge.description}</div>
          </div>
        </div>
      )}
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&display=swap');
  .toast-in { animation: toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes toastIn { from{opacity:0;transform:translateX(100px)} to{opacity:1;transform:translateX(0)} }
`;

const s = {
  wrap: { position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9998, display: 'flex', flexDirection: 'column', gap: 12 },
  toast: { display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: 16, padding: '1rem 1.5rem', boxShadow: '0 10px 40px rgba(168,85,247,0.4)', minWidth: 220 },
  badgeToast: { background: 'linear-gradient(135deg, #f59e0b, #f97316)' },
  icon: { fontSize: 28 },
  main: { fontSize: 16, fontWeight: 800, color: 'white', fontFamily: 'Space Grotesk, sans-serif' },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Space Grotesk, sans-serif' },
};