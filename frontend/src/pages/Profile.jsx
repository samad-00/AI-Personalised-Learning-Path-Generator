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

      <style>{`
        @keyframes smoothRiseUp {
          0% { opacity: 0; transform: translateY(60px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes floatEmoji {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(4deg); }
        }
        .rise-item-1 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
        .rise-item-2 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both; }
        .rise-item-3 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.55s both; }
        .rise-item-4 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.75s both; }
        .hover-card-effects { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important; }
        .hover-card-effects:hover { transform: translateY(-8px) scale(1.015) !important; box-shadow: 0 22px 45px rgba(0, 0, 0, 0.16) !important; }
        .hover-pill { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important; }
        .hover-pill:hover { transform: translateY(-3px) !important; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important; }
      `}</style>

      {/* Prominent Scaled-Up Top Navbar */}
      <nav style={{ padding: '2rem 3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accent-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: '0 4px 15px rgba(226, 85, 131, 0.25)' }}>
                📖
              </div>
            <span style={{ fontSize: 32, fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>LearnPath</span>
          </div>
          
          <div style={{ display: 'flex', gap: 36, fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>
            <span style={{ cursor: 'pointer', opacity: 0.85, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.85} onClick={() => navigate('/dashboard')}>Home</span>
            <span style={{ color: 'var(--accent-pink)', cursor: 'pointer' }}>Profile</span>
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

      {/* Main Content Layout */}
      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', position: 'relative', zIndex: 10 }}>
        
        {/* Left Sidebar (Profile Info) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="bento-card card-teal rise-item-1 hover-card-effects" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', borderRadius: 28 }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--bg-color)', color: 'var(--accent-teal)', border: '4px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, marginBottom: '1.5rem', animation: 'floatEmoji 4s infinite ease-in-out' }}>
              {getInitials(profile?.username)}
            </div>
            
            <h1 style={{ fontSize: 28, margin: '0 0 0.5rem', color: '#ffffff', fontFamily: 'Outfit, sans-serif' }}>{profile?.username}</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, margin: '0 0 1.5rem', fontWeight: 500 }}>{profile?.email}</p>
            
            <span className="pill-tag hover-pill" style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: 'none', marginBottom: '2rem', fontWeight: 800 }}>
              ⭐ Level {profile?.level || 1} • {profile?.level_title || 'Learner'}
            </span>

            <div style={{ width: '100%', background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                <span>XP Progress</span>
                <span>{profile?.xp} XP → {profile?.xp_for_next_level} XP</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#ffffff', width: `${profile?.xp_progress_pct || 0}%`, transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
              </div>
            </div>
          </div>

          <div className="bento-card rise-item-2 hover-card-effects" style={{ flex: 1, padding: '1.5rem', background: 'var(--surface-color)', border: '2px solid var(--border-color)', borderRadius: 24 }}>
            <h3 style={{ fontSize: 16, margin: '0 0 0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>
              <span style={{ animation: 'floatEmoji 3s infinite ease-in-out' }}>👤</span> Personal Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.45rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>🎂 Date of Birth:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{profile?.dob || 'Not set'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.45rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>⚧ Gender:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{profile?.gender ? profile.gender.replace('_', ' ') : 'Not set'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.45rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>🎯 Career Goal:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{profile?.career || 'Not set'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingTop: '0.2rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>🛠️ Skills:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{profile?.skills || 'Not set'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
          
          {/* Top Stats Grid matching the image */}
          <div className="rise-item-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="bento-card hover-card-effects" style={{ background: 'var(--accent-pink)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem', borderRadius: 24 }}>
              <div style={{ fontSize: 26, opacity: 1, marginBottom: 10, animation: 'floatEmoji 3s infinite ease-in-out 0.1s' }}>🎓</div>
              <div style={{ fontSize: 34, fontWeight: 800, fontFamily: 'Outfit', color: '#ffffff', lineHeight: 1, marginBottom: 6 }}>{roadmaps.length}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', opacity: 0.9 }}>Total Plans</div>
            </div>
            
            <div className="bento-card hover-card-effects" style={{ background: 'var(--accent-teal)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem', borderRadius: 24 }}>
              <div style={{ fontSize: 26, opacity: 1, marginBottom: 10, animation: 'floatEmoji 3s infinite ease-in-out 0.3s' }}>✅</div>
              <div style={{ fontSize: 34, fontWeight: 800, fontFamily: 'Outfit', color: '#ffffff', lineHeight: 1, marginBottom: 6 }}>{profile?.total_resources_completed || 0}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', opacity: 0.9 }}>Lessons Done</div>
            </div>

            <div className="bento-card hover-card-effects" style={{ background: 'var(--accent-orange)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem', borderRadius: 24 }}>
              <div style={{ fontSize: 26, opacity: 1, marginBottom: 10, animation: 'floatEmoji 3s infinite ease-in-out 0.5s' }}>⏱️</div>
              <div style={{ fontSize: 34, fontWeight: 800, fontFamily: 'Outfit', color: '#ffffff', lineHeight: 1, marginBottom: 6 }}>{profile?.total_weeks_completed || 0}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', opacity: 0.9 }}>Weeks Passed</div>
            </div>

            <div className="bento-card hover-card-effects" style={{ background: 'var(--accent-pink)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem', borderRadius: 24 }}>
              <div style={{ fontSize: 26, opacity: 1, marginBottom: 10, animation: 'floatEmoji 3s infinite ease-in-out 0.7s' }}>🔥</div>
              <div style={{ fontSize: 34, fontWeight: 800, fontFamily: 'Outfit', color: '#ffffff', lineHeight: 1, marginBottom: 6 }}>{profile?.streak || 0}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', opacity: 0.9 }}>Day Streak</div>
            </div>
          </div>

          <div className="bento-card card-pink rise-item-2 hover-card-effects" style={{ padding: '1.75rem 2.5rem', borderRadius: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: 26, margin: '0 0 0.4rem', color: '#ffffff', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>Your Learning Activity</h2>
                <p style={{ opacity: 0.9, fontSize: 15, margin: 0, fontWeight: 500, color: '#ffffff' }}>Keep up the great work to reach your next level!</p>
              </div>
              <button onClick={() => navigate('/stats')} className="hover-pill" style={{ background: '#ffffff', color: 'var(--accent-pink)', border: 'none', padding: '12px 24px', borderRadius: 100, fontWeight: 800, cursor: 'pointer', fontSize: 15, fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                View Full Stats →
              </button>
            </div>
            
            {/* Fake Graph visual matching the style */}
            <div style={{ height: 135, background: 'rgba(255,255,255,0.15)', borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
               <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,80 Q20,20 40,50 T80,30 T100,70 L100,100 L0,100 Z" fill="rgba(255,255,255,0.15)" />
                  <path d="M0,80 Q20,20 40,50 T80,30 T100,70" fill="none" stroke="#ffffff" strokeWidth="3.5" />
                  <circle cx="40" cy="50" r="5.5" fill="#ffffff" />
                  <circle cx="80" cy="30" r="5.5" fill="#ffffff" />
               </svg>
               
               <div style={{ position: 'absolute', left: '38%', top: '35%', background: '#1e293b', color: 'white', padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 800, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', animation: 'floatEmoji 3s infinite ease-in-out' }}>
                 +{profile?.daily_xp || 0} XP
               </div>
            </div>
          </div>

          {/* Badges Card — centered & evenly spread */}
          <div className="bento-card card-orange rise-item-3 hover-card-effects" style={{ flex: 1, padding: '1.25rem 1.75rem', borderRadius: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: 15, margin: 0, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#ffffff', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ animation: 'floatEmoji 3s infinite ease-in-out' }}>🏆</span> Earned Badges
              </h3>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.18)', padding: '3px 10px', borderRadius: 100 }}>
                {profile?.badges?.length || 0} Unlocked
              </span>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', marginBottom: '1rem' }} />

            {!profile?.badges?.length ? (
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.15)', borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#ffffff', textAlign: 'center' }}>
                Complete study plans to earn badges!
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%' }}>
                {profile.badges.map((b, idx) => (
                  <div key={b.id} className="hover-pill" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: 'pointer', flex: 1 }}>
                    <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(255,255,255,0.22)', border: '1.5px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, animation: `floatEmoji ${3 + idx * 0.5}s infinite ease-in-out`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      {b.emoji}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'Outfit, sans-serif', textAlign: 'center', maxWidth: 60, lineHeight: 1.2 }}>
                      {b.title || `Badge ${idx + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
