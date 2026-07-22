import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { getProfile, getRoadmaps } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(), getRoadmaps()])
      .then(([profileRes, roadmapsRes]) => {
        setProfile(profileRes.data);
        setRoadmaps(roadmapsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (name) => name ? name.slice(0, 2).toUpperCase() : '?';

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
      Loading profile...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      <AnimatedBackground />

      {/* Top Navbar */}
      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              📖
            </div>
            <span style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>LearnPath</span>
          </div>
          
          <div style={{ display: 'flex', gap: 24, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            <span style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => navigate('/dashboard')}>Home</span>
            <span style={{ color: 'var(--accent-pink)' }}>Profile</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <ThemeToggle />
          <button title="Logout" style={{ background: 'var(--surface-muted)', border: 'none', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }} onClick={logout}>
            🚪
          </button>
        </div>
      </nav>

      {/* Main Content Layout */}
      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', position: 'relative', zIndex: 10 }}>
        
        {/* Left Sidebar (Profile Info) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="bento-card card-teal" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--bg-color)', color: 'var(--accent-teal)', border: '4px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, marginBottom: '1.5rem' }}>
              {getInitials(profile?.username)}
            </div>
            
            <h1 style={{ fontSize: 28, margin: '0 0 0.5rem', color: '#ffffff' }}>{profile?.username}</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, margin: '0 0 1.5rem' }}>{profile?.email}</p>
            
            <span className="pill-tag" style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: 'none', marginBottom: '2rem' }}>
              ⭐ Level {profile?.level || 1} • {profile?.level_title || 'Learner'}
            </span>

            <div style={{ width: '100%', background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                <span>XP Progress</span>
                <span>{profile?.xp} / {profile?.xp_for_next_level}</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#ffffff', width: `${profile?.xp_progress_pct || 0}%`, transition: 'width 1s ease' }} />
              </div>
            </div>
          </div>

          <div className="bento-card card-orange" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: 20, margin: '0 0 1.5rem' }}>Badges</h3>
            {!profile?.badges?.length ? (
              <div style={{ opacity: 0.8, fontSize: 14 }}>Complete plans to earn badges!</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {profile.badges.map(b => (
                  <div key={b.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                      {b.emoji}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Top Stats Grid matching the image */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="bento-card" style={{ background: 'var(--accent-mint)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
              <div style={{ fontSize: 24, opacity: 0.8, marginBottom: 12 }}>🎓</div>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', lineHeight: 1, marginBottom: 8 }}>{roadmaps.length}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Total Plans</div>
            </div>
            
            <div className="bento-card" style={{ background: '#f8f4e6', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
              <div style={{ fontSize: 24, opacity: 0.8, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', lineHeight: 1, marginBottom: 8 }}>{profile?.total_resources_completed || 0}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Lessons Done</div>
            </div>

            <div className="bento-card" style={{ background: '#eaf2f0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
              <div style={{ fontSize: 24, opacity: 0.8, marginBottom: 12 }}>⏱️</div>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', lineHeight: 1, marginBottom: 8 }}>{profile?.total_weeks_completed || 0}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Weeks Passed</div>
            </div>

            <div className="bento-card" style={{ background: 'var(--surface-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
              <div style={{ fontSize: 24, opacity: 0.8, marginBottom: 12 }}>🔥</div>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', lineHeight: 1, marginBottom: 8 }}>{profile?.streak || 0}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Day Streak</div>
            </div>
          </div>

          <div className="bento-card card-pink" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: 28, margin: '0 0 0.5rem', color: '#ffffff' }}>Your Learning Activity</h2>
                <p style={{ opacity: 0.9, fontSize: 15, margin: 0 }}>Keep up the great work to reach your next level!</p>
              </div>
              <button style={{ background: '#ffffff', color: 'var(--accent-pink)', border: 'none', padding: '12px 24px', borderRadius: 100, fontWeight: 800, cursor: 'pointer' }}>
                View Full Stats
              </button>
            </div>
            
            {/* Fake Graph visual matching the style */}
            <div style={{ height: 160, background: 'rgba(255,255,255,0.1)', borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
               <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,80 Q20,20 40,50 T80,30 T100,70 L100,100 L0,100 Z" fill="rgba(255,255,255,0.1)" />
                  <path d="M0,80 Q20,20 40,50 T80,30 T100,70" fill="none" stroke="#ffffff" strokeWidth="3" />
                  <circle cx="40" cy="50" r="5" fill="#ffffff" />
                  <circle cx="80" cy="30" r="5" fill="#ffffff" />
               </svg>
               
               <div style={{ position: 'absolute', left: '38%', top: '35%', background: '#1e1e1e', color: 'white', padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                 +12 XP
               </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
