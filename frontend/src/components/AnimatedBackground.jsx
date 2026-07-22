import React from 'react';

export default function AnimatedBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div className="pill-tag animate-float-reverse" style={{ position: 'absolute', top: '10%', left: '5%', background: 'var(--accent-pink)', color: 'white', border: 'none', padding: '8px 24px', fontSize: 14 }}>#Focus</div>
      <div className="pill-tag animate-float" style={{ position: 'absolute', bottom: '15%', right: '10%', background: 'var(--accent-teal)', color: 'white', border: 'none', padding: '8px 24px', fontSize: 14 }}>#Growth</div>
      <div className="pill-tag animate-float-horizontal" style={{ position: 'absolute', top: '25%', right: '5%', background: 'var(--surface-color)', color: 'var(--accent-orange)', border: 'none', padding: '8px 24px', fontSize: 14 }}>#Mastery</div>
      <div className="pill-tag animate-float" style={{ position: 'absolute', top: '75%', left: '15%', background: 'var(--accent-mint)', color: 'var(--accent-teal)', border: 'none', padding: '8px 24px', fontSize: 14 }}>#Consistency</div>
      <div className="pill-tag animate-float-reverse" style={{ position: 'absolute', top: '45%', right: '12%', background: 'var(--accent-orange)', color: 'white', border: 'none', padding: '8px 24px', fontSize: 14 }}>#Learning</div>
      
      <div className="animate-float" style={{ position: 'absolute', top: '40%', left: '3%', fontSize: 30, opacity: 0.8 }}>🎯</div>
      <div className="animate-float-reverse" style={{ position: 'absolute', bottom: '25%', left: '10%', fontSize: 40, opacity: 0.6 }}>💡</div>
      <div className="animate-float" style={{ position: 'absolute', top: '60%', right: '8%', fontSize: 35, opacity: 0.7 }}>🚀</div>
      <div className="animate-float-horizontal" style={{ position: 'absolute', top: '15%', right: '15%', fontSize: 28, opacity: 0.7 }}>✨</div>
      <div className="animate-float" style={{ position: 'absolute', top: '80%', left: '8%', fontSize: 32, opacity: 0.6 }}>💻</div>
      <div className="animate-float-reverse" style={{ position: 'absolute', bottom: '10%', right: '20%', fontSize: 30, opacity: 0.8 }}>🧠</div>

      <div className="bento-card card-orange animate-float" style={{ position: 'absolute', top: '-10%', left: '-10%', width: 500, height: 500, borderRadius: '50%', opacity: 0.12, zIndex: -1 }}></div>
      <div className="bento-card card-pink animate-float-reverse" style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 600, height: 600, borderRadius: '40%', opacity: 0.12, zIndex: -1 }}></div>
      <div className="bento-card card-teal animate-float-horizontal" style={{ position: 'absolute', top: '30%', left: '40%', width: 300, height: 300, borderRadius: '45%', opacity: 0.08, zIndex: -1, filter: 'blur(40px)' }}></div>
    </div>
  );
}
