import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { getProfile, getLeaderboard } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import AnimatedBackground from '../components/AnimatedBackground';

const LEVEL_TITLES = {
  1: 'Novice', 2: 'Apprentice', 3: 'Student', 4: 'Scholar', 5: 'Adept',
  6: 'Expert', 7: 'Master', 8: 'Grandmaster', 9: 'Legend', 10: 'GOD'
};

export default function Stats() {
  const { user, logout } = useAuth();
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
      <AnimatedBackground />

      {/* Top Navbar */}
      <nav style={{ padding: '2rem 3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 50 }}>
          <div
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
          >
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accent-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: '0 4px 15px rgba(226, 85, 131, 0.25)' }}>
                📖
              </div>
            <span style={{ fontSize: 32, fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>LearnPath</span>
          </div>

          <div style={{ display: 'flex', gap: 36, fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>
            <span style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0.85 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.85} onClick={() => navigate('/dashboard')}>Home</span>
            <span style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0.85 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.85} onClick={() => navigate('/interview-prep')}>Interview Preparation</span>
            <span style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0.85 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.85} onClick={() => navigate('/cv-analyzer')}>CV Analyzer</span>
            <span style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0.85 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.85} onClick={() => navigate('/profile')}>Profile</span>
            <span style={{ color: 'var(--accent-pink)', cursor: 'pointer' }}>Stats</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <ThemeToggle />
          <button
            title="Logout"
            style={{
              background: 'transparent',
              border: '2px solid var(--border-color)',
              color: 'var(--text-primary)',
              width: 46,
              height: 46,
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-color)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            onClick={logout}
          >
            🚪
          </button>
        </div>
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
                <div style={{ ...s.xpBarFill, width: `${xpPct}%` }} className="xp-fill" />
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
          {['stats', 'badges', 'leaderboard', 'levels'].map(t => (
            <button key={t} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}
              onClick={() => setTab(t)}>
              {t === 'stats' ? '📊 stats' : t === 'badges' ? '🏆 badges' : t === 'leaderboard' ? '🥇 leaderboard' : '📈 tiers'}
            </button>
          ))}
        </div>

        {/* Stats tab */}
        {tab === 'stats' && (
          <div style={s.statsGrid}>
            {[
              { icon: '⚡', val: profile.xp, label: 'Total XP', color: '42, 118, 106' },
              { icon: '🎯', val: profile.level, label: 'Current Level', color: '244, 162, 89' },
              { icon: '🔥', val: profile.streak, label: 'Day Streak', color: '235, 99, 131' },
              { icon: '✅', val: profile.total_resources_completed, label: 'Resources Done', color: '42, 118, 106' },
              { icon: '📅', val: profile.total_weeks_completed, label: 'Weeks Completed', color: '244, 162, 89' },
              { icon: '🗺️', val: profile.total_roadmaps_completed, label: 'Roadmaps Done', color: '235, 99, 131' },
            ].map((stat, i) => {
              const bg = `rgba(${stat.color}, 0.15)`;
              const border = `1px solid rgba(${stat.color}, 0.3)`;
              return (
                <div key={i} style={{ ...s.statCard, background: bg, backdropFilter: 'blur(10px)', border: border }} className="stat-card">
                  <span style={{ ...s.statIcon, animation: `floatEmoji 4s infinite ease-in-out ${i * 0.2}s` }}>{stat.icon}</span>
                  <span style={s.statVal}>{stat.val}</span>
                  <span style={{ ...s.statLabel, color: 'var(--text-primary)' }}>{stat.label}</span>
                </div>
              );
            })}
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
                {profile.badges.map((b, i) => {
                  const m = i % 3;
                  const color = m === 0 ? '42, 118, 106' : m === 1 ? '244, 162, 89' : '235, 99, 131';
                  const bg = `rgba(${color}, 0.15)`;
                  const border = `1px solid rgba(${color}, 0.3)`;
                  return (
                    <div key={i} style={{ ...s.badgeCard, background: bg, backdropFilter: 'blur(10px)', border: border }} className="badge-card">
                      <span style={{ ...s.badgeEmoji, animation: `floatEmoji 4s infinite ease-in-out ${i * 0.2}s` }}>{b.emoji}</span>
                      <h4 style={s.badgeName}>{b.name}</h4>
                      <p style={{ ...s.badgeDesc, color: 'var(--text-primary)' }}>{b.description}</p>
                      <span style={{ ...s.badgeDate, color: 'var(--text-primary)' }}>{new Date(b.earned_at).toLocaleDateString()}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Leaderboard tab */}
        {tab === 'leaderboard' && (
          <div style={s.leaderboard}>
            {leaderboard.map((u, i) => (
              <div key={i} style={{ ...s.leaderRow, ...(u.is_me ? s.leaderRowMe : {}), ...(i === 0 ? s.rank1 : i === 1 ? s.rank2 : i === 2 ? s.rank3 : {}) }} className="leader-row">
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
        {/* Levels tab */}
        {tab === 'levels' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {Array.from({ length: 22 }, (_, i) => {
              const level = i + 1;
              let title = '';
              if (level === 1) title = 'Beginner';
              else if (level === 2) title = 'Learner';
              else if (level <= 5) title = 'Student';
              else if (level <= 8) title = 'Intermediate';
              else if (level <= 11) title = 'Advanced';
              else if (level <= 14) title = 'Practitioner';
              else if (level <= 17) title = 'Specialist';
              else if (level <= 19) title = 'Expert';
              else if (level <= 21) title = 'Master';
              else title = 'Pro';

              let xpReq = 0;
              if (level === 1) xpReq = 0;
              else if (level === 2) xpReq = 100;
              else if (level >= 22) xpReq = 10000;
              else xpReq = (level - 2) * 500;

              const isCurrent = profile?.level === level;

              let color = '';
              if (level <= 3) color = '42, 118, 106'; // Teal
              else if (level <= 6) color = '244, 162, 89'; // Orange
              else if (level <= 9) color = '235, 99, 131'; // Pink
              else if (level <= 12) color = '42, 118, 106'; // Teal
              else if (level <= 15) color = '244, 162, 89'; // Orange
              else if (level <= 18) color = '235, 99, 131'; // Pink
              else if (level <= 21) color = '42, 118, 106'; // Teal
              else color = '235, 99, 131'; // Pro Pink

              const bg = isCurrent ? `rgba(${color}, 1)` : `rgba(${color}, 0.15)`;
              const border = isCurrent ? '2px solid transparent' : `1px solid rgba(${color}, 0.3)`;
              const textColor = isCurrent ? '#fff' : 'var(--text-primary)';
              const subColor = isCurrent ? 'rgba(255,255,255,0.9)' : `rgba(${color}, 1)`;

              return (
                <div key={level} className="stat-card" style={{ background: bg, backdropFilter: 'blur(10px)', padding: '1rem', borderRadius: 16, border: border, display: 'flex', flexDirection: 'column', gap: 4, color: textColor }}>
                  <span style={{ fontSize: 13, fontWeight: 700, opacity: isCurrent ? 0.8 : 0.5 }}>Level {level} {isCurrent && '(You)'}</span>
                  <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{title}</h4>
                  <span style={{ fontSize: 14, fontWeight: 800, color: subColor }}>{xpReq} XP</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const css = `
  @keyframes floatEmoji {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-6px) rotate(4deg); }
  }
  .xp-fill { transition: width 1s cubic-bezier(0.34,1.56,0.64,1); }
  .stat-card { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  .stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-bento); }
  .badge-card { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  .badge-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: var(--shadow-bento); }
  .leader-row { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
`;

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)', position: 'relative', overflow: 'hidden' },
  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' },
  spinner: { width: 40, height: 40, border: '4px solid var(--accent-pink)', borderTopColor: 'transparent', borderRadius: '50%' },
  orb1: { position: 'fixed', width: 500, height: 500, background: 'var(--accent-pink)', opacity: 0.1, borderRadius: '50%', filter: 'blur(100px)', top: -100, right: -100, pointerEvents: 'none' },
  orb2: { position: 'fixed', width: 400, height: 400, background: 'var(--accent-orange)', opacity: 0.07, borderRadius: '50%', filter: 'blur(100px)', bottom: -100, left: -100, pointerEvents: 'none' },
  nav: { padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--bg-color)', zIndex: 100 },
  back: { padding: '0.4rem 1rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 20, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  navLogo: { fontSize: 18, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--accent-pink)' },
  content: { maxWidth: 900, margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 },
  profileHero: { background: 'var(--accent-teal)', border: '1px solid var(--border-color)', borderRadius: 28, padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap', boxShadow: 'var(--shadow-bento)' },
  avatarBig: { width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-color)', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, flexShrink: 0 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 28, fontWeight: 800, margin: '0 0 0.5rem', color: 'white' },
  levelBadge: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' },
  levelNum: { background: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.2rem 0.75rem', borderRadius: 100, fontSize: 13, fontWeight: 800 },
  levelTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600 },
  xpBarWrap: {},
  xpBarBg: { height: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 100, overflow: 'hidden', marginBottom: 6 },
  xpBarFill: { height: '100%', background: 'white', borderRadius: 100 },
  xpText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 },
  streakBig: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  streakFire: { fontSize: 40 },
  streakNum: { fontSize: 32, fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'white' },
  streakLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 },
  tabs: { display: 'flex', gap: 8, marginBottom: '1.5rem' },
  tab: { padding: '0.6rem 1.25rem', background: 'var(--accent-orange)', border: '1px solid transparent', borderRadius: 100, color: 'var(--bg-color)', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s ease' },
  tabActive: { background: 'var(--accent-pink)', border: '1px solid transparent', color: 'var(--bg-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' },
  statCard: { background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 20, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, boxShadow: 'var(--shadow-bento)' },
  statIcon: { fontSize: 32 },
  statVal: { fontSize: 28, fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' },
  statLabel: { fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 },
  empty: { background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 24, padding: '4rem 2rem', textAlign: 'center' },
  emptyIcon: { fontSize: 52, marginBottom: '1rem' },
  emptyTitle: { fontSize: 20, fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--text-primary)' },
  emptyText: { color: 'var(--text-secondary)', fontSize: 14 },
  badgesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' },
  badgeCard: { background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 20, padding: '1.5rem', textAlign: 'center', boxShadow: 'var(--shadow-bento)' },
  badgeEmoji: { fontSize: 40, display: 'block', marginBottom: '0.75rem' },
  badgeName: { fontSize: 16, fontWeight: 800, margin: '0 0 0.4rem', color: 'var(--text-primary)' },
  badgeDesc: { fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 0.5rem' },
  badgeDate: { fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 },
  leaderboard: { display: 'flex', flexDirection: 'column', gap: 8 },
  leaderRow: { display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(128, 128, 128, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '1rem 1.5rem', cursor: 'default', boxShadow: 'var(--shadow-bento)' },
  rank1: { background: 'rgba(42, 118, 106, 0.3)', border: '1px solid var(--accent-teal)' },
  rank2: { background: 'rgba(235, 99, 131, 0.2)', border: '1px solid var(--accent-pink)' },
  rank3: { background: 'rgba(244, 162, 89, 0.1)', border: '1px solid var(--accent-orange)' },
  leaderRowMe: { background: 'rgba(235, 99, 131, 0.15)', border: '1px solid var(--accent-pink)' },
  leaderRank: { fontSize: 20, minWidth: 36, textAlign: 'center', fontWeight: 800, color: 'var(--text-primary)' },
  leaderAvatar: { width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0, color: 'white' },
  leaderInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  leaderName: { fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' },
  leaderLevel: { fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 },
  youTag: { background: 'var(--accent-teal)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: 100, fontSize: 11, fontWeight: 800, marginLeft: 6 },
  leaderRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 },
  leaderXP: { fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' },
  leaderStreak: { fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 },
};