import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
const getSharedRoadmap = api.getSharedRoadmap;

export default function SharedRoadmap() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(0);

  useEffect(() => {
  console.log('Token:', token);
  getSharedRoadmap(token)
    .then(res => {
      console.log('Roadmap data:', res.data);
      setRoadmap(res.data);
    })
    .catch(err => {
      console.error('Error:', err);
      setRoadmap(null);
    })
    .finally(() => setLoading(false));
}, [token]);

  const typeConfig = {
    video:    { icon: '▶️', color: '#a855f7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)', label: 'Video',    action: 'Watch Video' },
    article:  { icon: '📄', color: '#0ea5e9', bg: 'rgba(14,165,233,0.15)',  border: 'rgba(14,165,233,0.3)',  label: 'Article',  action: 'Read Article' },
    book:     { icon: '📖', color: '#10b981', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.3)',  label: 'Book',     action: 'Find Book' },
    exercise: { icon: '💪', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)',  label: 'Exercise', action: 'Practice Now' },
  };

  const getLink = (resource) => {
    const q = encodeURIComponent(resource.title);
    const qtutorial = encodeURIComponent(resource.title + ' tutorial');

    if (resource.resource_type === 'video') {
      return `https://www.youtube.com/results?search_query=${qtutorial}`;
    } else if (resource.resource_type === 'book') {
      return `https://duckduckgo.com/?q=!ducky+${q}+filetype:pdf`;
    } else if (resource.resource_type === 'exercise') {
      return `https://www.google.com/search?q=${q}+coding+questions+site:leetcode.com+OR+site:hackerrank.com+OR+site:codewars.com`;
    } else if (resource.resource_type === 'article') {
      return `https://www.google.com/search?q=${qtutorial}+site:geeksforgeeks.org+OR+site:w3schools.com+OR+site:freecodecamp.org`;
    }
    
    return resource.url && resource.url.startsWith('http') ? resource.url : `https://www.google.com/search?q=${qtutorial}`;
  };

  if (loading) return (
    <div style={s.loading}>
      <style>{css}</style>
      <div style={s.spinner} className="spin" />
      <p style={s.loadingText}>loading roadmap...</p>
    </div>
  );

  if (!roadmap) return (
    <div style={s.loading}>
      <style>{css}</style>
      <div style={s.notFound}>
        <span style={s.notFoundIcon}>😕</span>
        <h2 style={s.notFoundTitle}>roadmap not found</h2>
        <p style={s.notFoundText}>this link might be invalid or expired</p>
        <button style={s.homeBtn} onClick={() => navigate('/')}>go home</button>
      </div>
    </div>
  );

  const week = roadmap.weeks[activeWeek];
  const levelColors = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444' };
  const levelEmoji = { beginner: '🌱', intermediate: '🚀', advanced: '⚡' };

  return (
    <div style={s.page}>
      <style>{css}</style>
      <div style={s.orb1}/><div style={s.orb2}/>

      <nav style={s.nav}>
        <span style={s.navLogo}>⚡ learnpath</span>
        <button style={s.joinBtn} onClick={() => navigate('/register')}>
          get your free roadmap →
        </button>
      </nav>

      <div style={s.sharedBanner}>
        <span>🔗</span>
        <span style={s.sharedText}>someone shared this learning roadmap with you!</span>
        <button style={s.sharedCta} onClick={() => navigate('/register')}>create your own free ✨</button>
      </div>

      <div style={s.content}>
        <div style={s.header}>
          <div style={s.goalTag}>🎯 learning goal</div>
          <h1 style={s.goalTitle}>{roadmap.goal}</h1>
          <div style={s.headerMeta}>
            <span style={{ ...s.levelBadge, color: levelColors[roadmap.experience_level], background: `${levelColors[roadmap.experience_level]}22`, border: `1px solid ${levelColors[roadmap.experience_level]}44` }}>
              {levelEmoji[roadmap.experience_level]} {roadmap.experience_level}
            </span>
            <span style={s.metaItem}>📅 {roadmap.weeks.length} weeks</span>
            <span style={s.metaItem}>📚 {roadmap.weeks.reduce((a, w) => a + w.resources.length, 0)} resources</span>
          </div>
        </div>

        <div style={s.weekTabs}>
          {roadmap.weeks.map((w, i) => (
            <button key={w.id}
              style={{ ...s.weekTab, ...(activeWeek === i ? s.weekTabActive : {}) }}
              onClick={() => setActiveWeek(i)}>
              week {w.week_number}
            </button>
          ))}
        </div>

        {week && (
          <div style={s.weekCard}>
            <h2 style={s.weekTitle}>week {week.week_number}: {week.title}</h2>
            <p style={s.weekObj}>{week.objective}</p>
            <div style={s.resources}>
              {week.resources.map((r, i) => {
                const tc = typeConfig[r.resource_type] || typeConfig.article;
                return (
                  <div key={r.id} style={{ ...s.resourceCard, borderLeft: `4px solid ${tc.color}`, animationDelay: `${i * 0.08}s` }} className="res-card">
                    <div style={s.resTop}>
                      <div style={{ ...s.resIconBox, background: tc.bg, border: `1px solid ${tc.border}` }}>
                        <span style={{ fontSize: 20 }}>{tc.icon}</span>
                      </div>
                      <div style={s.resBody}>
                        <div style={s.resMetaRow}>
                          <span style={{ ...s.resTypeBadge, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>{tc.label}</span>
                          {r.duration && <span style={s.resDur}>⏱ {r.duration}</span>}
                        </div>
                        <h3 style={s.resTitle}>{r.title}</h3>
                        <p style={s.resDesc}>{r.description}</p>
                        <a href={getLink(r)} target="_blank" rel="noopener noreferrer"
                          style={{ ...s.resActionBtn, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                          {tc.action} →
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={s.cta}>
          <h3 style={s.ctaTitle}>want your own personalized roadmap? 🚀</h3>
          <p style={s.ctaText}>learnpath generates custom 4-week learning paths powered by ai — free forever</p>
          <button style={s.ctaBtn} className="cta-btn" onClick={() => navigate('/register')}>
            start learning free ✨
          </button>
        </div>
      </div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Syne:wght@700;800&display=swap');
  * { font-family: 'Space Grotesk', sans-serif; box-sizing: border-box; }
  h1,h2,h3 { font-family: 'Syne', sans-serif; }
  .spin { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .res-card { animation: fadeUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both; transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
  .res-card:hover { transform: translateX(4px); }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px) scale(0.99)} to{opacity:1;transform:translateY(0) scale(1)} }
  .cta-btn { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); position: relative; overflow: hidden; }
  .cta-btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%); transform: translateX(-100%); transition: transform 0.6s ease; }
  .cta-btn:hover::after { transform: translateX(100%); }
  .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(168,85,247,0.5), 0 0 60px rgba(236,72,153,0.15); }
`;

const s = {
  page: { minHeight: '100vh', background: '#0a0a0f', color: 'white', position: 'relative', overflow: 'hidden' },
  loading: { minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 },
  spinner: { width: 44, height: 44, border: '4px solid rgba(168,85,247,0.2)', borderTopColor: '#a855f7', borderRadius: '50%' },
  loadingText: { color: 'rgba(255,255,255,0.5)', fontWeight: 600 },
  notFound: { textAlign: 'center' },
  notFoundIcon: { fontSize: 56, display: 'block', marginBottom: '1rem' },
  notFoundTitle: { fontSize: 24, fontWeight: 800, color: 'white', margin: '0 0 0.5rem' },
  notFoundText: { color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' },
  homeBtn: { padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #a855f7, #ec4899)', border: 'none', borderRadius: 100, color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  orb1: { position: 'fixed', width: 500, height: 500, background: 'rgba(168,85,247,0.08)', borderRadius: '50%', filter: 'blur(100px)', top: -100, right: -100, pointerEvents: 'none' },
  orb2: { position: 'fixed', width: 400, height: 400, background: 'rgba(236,72,153,0.06)', borderRadius: '50%', filter: 'blur(100px)', bottom: -100, left: -100, pointerEvents: 'none' },
  nav: { padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', zIndex: 100 },
  navLogo: { fontSize: 18, fontWeight: 800, fontFamily: 'Syne, sans-serif', background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  joinBtn: { padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #a855f7, #ec4899)', border: 'none', borderRadius: 100, color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 700 },
  sharedBanner: { background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  sharedText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600 },
  sharedCta: { padding: '0.3rem 1rem', background: 'linear-gradient(135deg, #a855f7, #ec4899)', border: 'none', borderRadius: 100, color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700 },
  content: { maxWidth: 860, margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 },
  header: { background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(168,85,247,0.03))', border: '1px solid rgba(168,85,247,0.1)', borderRadius: 24, padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 12px 40px rgba(0,0,0,0.1)' },
  goalTag: { fontSize: 11, fontWeight: 800, color: '#a855f7', background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.25)', padding: '0.2rem 0.7rem', borderRadius: 100, display: 'inline-block', marginBottom: '0.75rem', letterSpacing: 1, textTransform: 'uppercase' },
  goalTitle: { fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 1rem', lineHeight: 1.3 },
  headerMeta: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' },
  levelBadge: { padding: '0.3rem 0.9rem', borderRadius: 100, fontSize: 13, fontWeight: 700 },
  metaItem: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600 },
  weekTabs: { display: 'flex', gap: 10, marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: 4 },
  weekTab: { flex: 1, minWidth: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '0.75rem 1rem', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.2s ease' },
  weekTabActive: { background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.45)', color: '#c084fc', boxShadow: '0 4px 20px rgba(168,85,247,0.15)' },
  weekCard: { background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(168,85,247,0.02))', border: '1px solid rgba(168,85,247,0.09)', borderRadius: 24, padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 12px 40px rgba(0,0,0,0.08)' },
  weekTitle: { fontSize: 20, fontWeight: 800, color: 'white', margin: '0 0 0.5rem' },
  weekObj: { color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 1.5rem', lineHeight: 1.6 },
  resources: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  resourceCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
  resTop: { display: 'flex', gap: '1rem', alignItems: 'flex-start' },
  resIconBox: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  resBody: { flex: 1 },
  resMetaRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  resTypeBadge: { padding: '0.15rem 0.6rem', borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' },
  resDur: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 },
  resTitle: { fontSize: 16, fontWeight: 700, color: 'white', margin: '0 0 0.4rem' },
  resDesc: { fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 0.75rem', lineHeight: 1.6 },
  resActionBtn: { display: 'inline-block', padding: '0.35rem 0.9rem', borderRadius: 20, fontSize: 13, fontWeight: 700, textDecoration: 'none' },
  cta: { background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.1))', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 24, padding: '2.5rem', textAlign: 'center', boxShadow: '0 12px 40px rgba(168,85,247,0.1)' },
  ctaTitle: { fontSize: 22, fontWeight: 800, color: 'white', margin: '0 0 0.75rem' },
  ctaText: { color: 'rgba(255,255,255,0.6)', fontSize: 15, margin: '0 0 1.5rem', lineHeight: 1.6 },
  ctaBtn: { padding: '0.9rem 2.5rem', background: 'linear-gradient(135deg, #a855f7, #ec4899)', border: 'none', borderRadius: 100, color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 30px rgba(168,85,247,0.3)' },
};
