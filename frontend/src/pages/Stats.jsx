import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { getProfile, getLeaderboard } from '../services/api';

const LEVEL_TITLES = {
  1:'Novice',2:'Apprentice',3:'Student',4:'Scholar',5:'Adept',
  6:'Expert',7:'Master',8:'Grandmaster',9:'Legend',10:'GOD'
};

export default function Stats() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [tab, setTab] = useState('stats');

  useEffect(() => {
    getProfile().then(r => setProfile(r.data));
    getLeaderboard().then(r => setLeaderboard(r.data));
  }, []);

  if (!profile) return (
    <div style={s.loading}>
      <div style={s.spinner} className="spin" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .spin{animation:spin 0.8s linear infinite;}`}</style>
    </div>
  );

  const xpPct = profile.xp_progress_pct || 0;

  return (
    <div style={s.page}>
      <style>{css}</style>
      <div style={s.orb1}/><div style={s.orb2}/>

      <nav style={s.nav}>
        <button style={s.back} onClick={() => navigate('/dashboard')}>← back</button>
        <span style={s.navLogo}>⚡ learnpath</span>
        <div/>
      </nav>

      <div style={s.content}>
        {/* Profile hero */}
        <div style={s.profileHero}>
          <div style={s.avatarBig}>{profile.username?.[0]?.toUpperCase()}</div>
          <div style={s.profileInfo}>
            <h1 style={s.profileName}>{profile.username}</h1>
            <div style={s.levelBadge}>
              <span style={s.levelNum}>Level {profile.level}</span>
              <span style={s.levelTitle}>{profile.level_title}</span>
            </div>
            <div style={s.xpBarWrap}>
              <div style={s.xpBarBg}>
                <div style={{ ...s.xpBarFill, width: `${xpPct}%` }} className="xp-fill"/>
              </div>
              <span style={s.xpText}>{profile.xp} XP → {profile.xp_for_next_level} XP</span>
            </div>
          </div>
          <div style={s.streakBig}>
            <span style={s.streakFire}>🔥</span>
            <span style={s.streakNum}>{profile.streak}</span>
            <span style={s.streakLabel}>day streak</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {['stats', 'badges', 'leaderboard'].map(t => (
            <button key={t} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}
              onClick={() => setTab(t)}>
              {t === 'stats' ? '📊 stats' : t === 'badges' ? '🏆 badges' : '🥇 leaderboard'}
            </button>
          ))}
        </div>

        {/* Stats tab */}
        {tab === 'stats' && (
          <div style={s.statsGrid}>
            {[
              { icon: '⚡', val: profile.xp, label: 'Total XP' },
              { icon: '🎯', val: profile.level, label: 'Current Level' },
              { icon: '🔥', val: profile.streak, label: 'Day Streak' },
              { icon: '✅', val: profile.total_resources_completed, label: 'Resources Done' },
              { icon: '📅', val: profile.total_weeks_completed, label: 'Weeks Completed' },
              { icon: '🗺️', val: profile.total_roadmaps_completed, label: 'Roadmaps Done' },
            ].map((stat, i) => (
              <div key={i} style={s.statCard} className="stat-card">
                <span style={s.statIcon}>{stat.icon}</span>
                <span style={s.statVal}>{stat.val}</span>
                <span style={s.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Badges tab */}
        {tab === 'badges' && (
          <div>
            {profile.badges.length === 0 ? (
              <div style={s.empty}>
                <div style={s.emptyIcon}>🏆</div>
                <h3 style={s.emptyTitle}>no badges yet!</h3>
                <p style={s.emptyText}>complete resources to earn your first badge</p>
              </div>
            ) : (
              <div style={s.badgesGrid}>
                {profile.badges.map((b, i) => (
                  <div key={i} style={s.badgeCard} className="badge-card">
                    <span style={s.badgeEmoji}>{b.emoji}</span>
                    <h4 style={s.badgeName}>{b.name}</h4>
                    <p style={s.badgeDesc}>{b.description}</p>
                    <span style={s.badgeDate}>{new Date(b.earned_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Leaderboard tab */}
        {tab === 'leaderboard' && (
          <div style={s.leaderboard}>
            {leaderboard.map((u, i) => (
              <div key={i} style={{ ...s.leaderRow, ...(u.is_me ? s.leaderRowMe : {}) }} className="leader-row">
                <span style={s.leaderRank}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${u.rank}`}
                </span>
                <div style={s.leaderAvatar}>{u.username[0].toUpperCase()}</div>
                <div style={s.leaderInfo}>
                  <span style={s.leaderName}>{u.username} {u.is_me && <span style={s.youTag}>you</span>}</span>
                  <span style={s.leaderLevel}>Level {u.level} · {u.level_title}</span>
                </div>
                <div style={s.leaderRight}>
                  <span style={s.leaderXP}>{u.xp} XP</span>
                  <span style={s.leaderStreak}>🔥 {u.streak}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Syne:wght@700;800&display=swap');
  * { font-family: 'Space Grotesk', sans-serif; box-sizing: border-box; }
  h1,h2,h3,h4 { font-family: 'Syne', sans-serif; }
  .xp-fill { transition: width 1s cubic-bezier(0.34,1.56,0.64,1); }
  .stat-card { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  .stat-card:hover { transform: translateY(-4px); border-color: rgba(168,85,247,0.4) !important; box-shadow: 0 12px 40px rgba(168,85,247,0.1); }
  .badge-card { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  .badge-card:hover { transform: translateY(-4px) scale(1.02); border-color: rgba(168,85,247,0.4) !important; box-shadow: 0 12px 40px rgba(168,85,247,0.1); }
  .leader-row { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
  .leader-row:hover { background: rgba(168,85,247,0.1) !important; }
`;

const s = {
  page: { minHeight: '100vh', background: '#0a0a0f', color: 'white', position: 'relative', overflow: 'hidden' },
  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' },
  spinner: { width: 40, height: 40, border: '4px solid rgba(168,85,247,0.2)', borderTopColor: '#a855f7', borderRadius: '50%' },
  orb1: { position: 'fixed', width: 500, height: 500, background: 'rgba(168,85,247,0.1)', borderRadius: '50%', filter: 'blur(100px)', top: -100, right: -100, pointerEvents: 'none' },
  orb2: { position: 'fixed', width: 400, height: 400, background: 'rgba(236,72,153,0.07)', borderRadius: '50%', filter: 'blur(100px)', bottom: -100, left: -100, pointerEvents: 'none' },
  nav: { padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)', zIndex: 100 },
  back: { padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  navLogo: { fontSize: 18, fontWeight: 800, fontFamily: 'Syne, sans-serif', background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  content: { maxWidth: 900, margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 },
  profileHero: { background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(168,85,247,0.04))', border: '1px solid rgba(168,85,247,0.1)', borderRadius: 28, padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap', boxShadow: '0 16px 48px rgba(0,0,0,0.15)' },
  avatarBig: { width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, flexShrink: 0 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 28, fontWeight: 800, margin: '0 0 0.5rem' },
  levelBadge: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' },
  levelNum: { background: 'linear-gradient(135deg, #a855f7, #ec4899)', padding: '0.2rem 0.75rem', borderRadius: 100, fontSize: 13, fontWeight: 800 },
  levelTitle: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600 },
  xpBarWrap: {},
  xpBarBg: { height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 100, overflow: 'hidden', marginBottom: 6 },
  xpBarFill: { height: '100%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: 100 },
  xpText: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 },
  streakBig: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  streakFire: { fontSize: 40 },
  streakNum: { fontSize: 32, fontWeight: 900, fontFamily: 'Syne, sans-serif', color: '#f97316' },
  streakLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 },
  tabs: { display: 'flex', gap: 8, marginBottom: '1.5rem' },
  tab: { padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.2s ease' },
  tabActive: { background: 'rgba(168,85,247,0.25)', border: '1px solid rgba(168,85,247,0.5)', color: '#c084fc', boxShadow: '0 4px 20px rgba(168,85,247,0.15)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' },
  statCard: { background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(168,85,247,0.03))', border: '1px solid rgba(168,85,247,0.1)', borderRadius: 20, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' },
  statIcon: { fontSize: 32 },
  statVal: { fontSize: 28, fontWeight: 900, fontFamily: 'Syne, sans-serif', color: 'white' },
  statLabel: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600 },
  empty: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '4rem 2rem', textAlign: 'center' },
  emptyIcon: { fontSize: 52, marginBottom: '1rem' },
  emptyTitle: { fontSize: 20, fontWeight: 800, margin: '0 0 0.5rem' },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  badgesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' },
  badgeCard: { background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(168,85,247,0.03))', border: '1px solid rgba(168,85,247,0.1)', borderRadius: 20, padding: '1.5rem', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' },
  badgeEmoji: { fontSize: 40, display: 'block', marginBottom: '0.75rem' },
  badgeName: { fontSize: 16, fontWeight: 800, margin: '0 0 0.4rem', color: 'white' },
  badgeDesc: { fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 0.5rem' },
  badgeDate: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 },
  leaderboard: { display: 'flex', flexDirection: 'column', gap: 8 },
  leaderRow: { display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '1rem 1.5rem', cursor: 'default', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
  leaderRowMe: { background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' },
  leaderRank: { fontSize: 20, minWidth: 36, textAlign: 'center', fontWeight: 800 },
  leaderAvatar: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 },
  leaderInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  leaderName: { fontSize: 15, fontWeight: 700, color: 'white' },
  leaderLevel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 },
  youTag: { background: 'rgba(168,85,247,0.3)', color: '#c084fc', padding: '0.1rem 0.5rem', borderRadius: 100, fontSize: 11, fontWeight: 800, marginLeft: 6 },
  leaderRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 },
  leaderXP: { fontSize: 15, fontWeight: 800, color: '#a855f7' },
  leaderStreak: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 },
};