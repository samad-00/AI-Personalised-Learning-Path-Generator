import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { generateRoadmap, getRoadmaps, deleteRoadmap } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const [roadmaps, setRoadmaps] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [progress, setProgress] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this learning plan?")) return;
    try {
      await deleteRoadmap(id);
      setRoadmaps(prev => prev.filter(r => r.id !== id));
      setOpenMenuId(null);
    } catch (err) {
      alert("Failed to delete roadmap");
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const res = await getRoadmaps();
      setRoadmaps(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + (95 - prev) * 0.1;
      });
    }, 500);

    try {
      const res = await generateRoadmap({ goal: goal, experience_level: level });
      clearInterval(interval);
      setProgress(100);
      navigate(`/roadmap/${res.data.id}`);
    } catch (err) {
      clearInterval(interval);
      alert(err.response?.data?.error || 'Generation failed');
    } finally {
      clearInterval(interval);
      setLoading(false);
      setProgress(0);
    }
  };

  const filtered = roadmaps.filter(r => r.goal.toLowerCase().includes(search.toLowerCase()));

  const calculateTotalProgress = () => {
    if (roadmaps.length === 0) return 0;
    const allResources = roadmaps.flatMap(r => r.weeks?.flatMap(w => w.resources || []) || []);
    if (allResources.length === 0) return 0;
    const completedResources = allResources.filter(res => res.is_completed).length;
    return Math.round((completedResources / allResources.length) * 100);
  };
  const progressPct = calculateTotalProgress();

  const ALL_TOPICS_POOL = [
    { title: 'Machine Learning', tag: '#AI', color: 'var(--accent-pink)' },
    { title: 'React Dev', tag: '#Frontend', color: '#38bdf8' },
    { title: 'Data Science', tag: '#Data', color: '#fb923c' },
    { title: 'Cybersecurity', tag: '#Security', color: '#f43f5e' },
    { title: 'UI/UX Design', tag: '#Design', color: 'var(--accent-teal)' },
    { title: 'Cloud Computing', tag: '#Cloud', color: '#a855f7' },
    { title: 'Generative AI & LLMs', tag: '#GenAI', color: 'var(--accent-pink)' },
    { title: 'Fullstack Next.js', tag: '#Web', color: '#38bdf8' },
    { title: 'Docker & Kubernetes', tag: '#DevOps', color: '#34d399' },
    { title: 'Python Automation', tag: '#Python', color: '#eab308' },
    { title: 'iOS Swift Dev', tag: '#Mobile', color: '#fb7185' },
    { title: 'Node & Microservices', tag: '#Backend', color: '#22c55e' },
    { title: 'AWS Architecture', tag: '#Cloud', color: '#a855f7' },
    { title: 'SQL & Analytics', tag: '#Data', color: '#fb923c' },
    { title: 'Rust & WebAssembly', tag: '#System', color: '#ef4444' },
    { title: 'Blockchain & Web3', tag: '#Web3', color: '#6366f1' },
    { title: 'Unity Game Dev', tag: '#GameDev', color: '#ec4899' },
    { title: 'PyTorch & Deep Learn', tag: '#ML', color: 'var(--accent-pink)' },
    { title: 'System Design Mastery', tag: '#Arch', color: '#14b8a6' },
    { title: 'Figma Prototyping', tag: '#UIUX', color: 'var(--accent-teal)' },
    { title: 'React Native Mobile', tag: '#App', color: '#38bdf8' }
  ];

  const [topics, setTopics] = useState([]);

  useEffect(() => {
    // Randomly shuffle and generative select 7 topics every time the user visits, refreshes, or navigates back
    const shuffled = [...ALL_TOPICS_POOL].sort(() => 0.5 - Math.random()).slice(0, 7);
    setTopics(shuffled);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      <AnimatedBackground />

      <style>{`
        @keyframes smoothRiseUp {
          0% { opacity: 0; transform: translateY(60px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmerPulse {
          0%, 100% { opacity: 0.55; transform: translateY(0); }
          50% { opacity: 0.95; transform: translateY(-4px); }
        }
        @keyframes floatEmoji {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(4deg); }
        }
        .rise-item-1 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
        .rise-item-2 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both; }
        .rise-item-3 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.55s both; }
        .rise-item-4 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.75s both; }
        
        .hover-card-effects {
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .hover-card-effects:hover {
          transform: translateY(-8px) scale(1.015) !important;
          box-shadow: 0 22px 45px rgba(0, 0, 0, 0.16) !important;
        }

        .loading-skeleton-card {
          animation: smoothRiseUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both, shimmerPulse 2s infinite ease-in-out;
        }

        .hover-pill {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .hover-pill:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
        }
      `}</style>

      {/* Prominent Scaled-Up Top Navbar */}
      <nav style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
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

          <div className="nav-links" style={{ display: 'flex', gap: 36, fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--accent-pink)', cursor: 'pointer' }}>Home</span>
            <span style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0.85 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.85} onClick={() => navigate('/interview-prep')}>Interview Preparation</span>
            <span style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0.85 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.85} onClick={() => navigate('/cv-analyzer')}>CV Analyzer</span>
            <span style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0.85 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.85} onClick={() => navigate('/profile')}>Profile</span>
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
      <main className="dashboard-grid" style={{ flex: 1, maxWidth: 1400, margin: '0 auto', width: '100%', padding: '1rem', gap: '2rem', position: 'relative', zIndex: 10 }}>

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <div className="rise-item-1">
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-teal)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {localStorage.getItem('is_new_user') === 'true' ? 'Welcome,' : 'Welcome back,'} {user?.username || 'Learner'} <span style={{ display: 'inline-block', animation: 'floatEmoji 3s infinite ease-in-out' }}>👋</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.1, letterSpacing: '-1px' }}>
              Your Platform <span style={{ opacity: 0.5, fontWeight: 500 }}>for</span><br />Unlimited Learning
            </h1>
          </div>

          <div className="bento-card card-teal rise-item-2 hover-card-effects" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden', borderRadius: 28 }}>
            <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 150, opacity: 0.1, pointerEvents: 'none', animation: 'floatEmoji 6s infinite ease-in-out' }}>🧠</div>
            <h2 style={{ fontSize: 24, margin: 0, position: 'relative', zIndex: 1, fontWeight: 800, color: '#ffffff' }}>Build a New Curriculum</h2>

            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 }}>
              <input
                type="text"
                placeholder="e.g. Learn React Native in 12 weeks (3 months)"
                value={goal}
                onChange={e => setGoal(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '16px 24px', borderRadius: 100, border: 'none', fontSize: 15, fontFamily: 'Inter', outline: 'none', background: '#ffffff', color: 'var(--text-primary)', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }}
              />

              <div style={{ display: 'flex', gap: 8, background: 'rgba(0,0,0,0.2)', padding: 6, borderRadius: 100 }}>
                {['beginner', 'intermediate', 'advanced'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 100, border: 'none',
                      background: level === lvl ? '#ffffff' : 'transparent',
                      color: level === lvl ? 'var(--accent-teal)' : '#ffffff',
                      fontSize: 13, fontWeight: 800, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.25s'
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <button type="submit" disabled={loading || !goal.trim()} className="hover-pill" style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', border: 'none', padding: '16px', borderRadius: 100, fontSize: 16, fontWeight: 800, fontFamily: 'Outfit', cursor: 'pointer', marginTop: '1rem', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}>
                {loading && (
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress}%`, background: 'var(--accent-orange)', opacity: 0.8, transition: 'width 0.5s ease-out' }} />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {loading ? 'Generating curriculum...' : 'Start Learning'}
                </span>
              </button>
            </form>
          </div>

          <div className="dashboard-stats-grid" style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="bento-card card-pink rise-item-3 hover-card-effects" style={{ padding: '2rem', borderRadius: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 28, marginBottom: '1rem', animation: 'floatEmoji 4s infinite ease-in-out 0.2s' }}>⏱️</div>
              <div>
                <div style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: 800, fontFamily: 'Outfit', color: '#ffffff', lineHeight: 1 }}>{roadmaps.length}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginTop: 8 }}>Total learning plans <br />created</div>
              </div>
            </div>

            <div className="bento-card card-orange rise-item-4 hover-card-effects" style={{ padding: '2rem', borderRadius: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 28, marginBottom: '1rem', animation: 'floatEmoji 4s infinite ease-in-out 0.6s' }}>🏆</div>
              <div>
                <div style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: 800, fontFamily: 'Outfit', lineHeight: 1, color: '#ffffff' }}>{roadmaps.filter(r => r.is_completed).length}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginTop: 8 }}>Total plans <br />completed</div>
              </div>
            </div>
          </div>

        </div>

        {/* Middle Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Quick Picks / Tags (Randomly Generative & Shuffled on Every Visit/Refresh) */}
          <div className="rise-item-1" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 14px', padding: '0.5rem 0 1rem', alignItems: 'center' }}>
            {topics.map((t, index) => (
              <span
                key={`${t.title}-${index}`}
                className="pill-tag hover-pill"
                onClick={() => setGoal(`Learn ${t.title}`)}
                style={{
                  cursor: 'pointer',
                  background: 'var(--surface-color)',
                  padding: '9px 18px',
                  borderRadius: 100,
                  fontWeight: 700,
                  fontSize: 13,
                  border: '1px solid var(--border-color)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  animation: 'smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) both',
                  animationDelay: `${0.2 + index * 0.07}s`
                }}
              >
                <span style={{ color: t.color || 'var(--accent-pink)', fontWeight: 800 }}>{t.tag}</span> {t.title}
              </span>
            ))}
          </div>

          <div className="rise-item-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 24, margin: 0, fontWeight: 800 }}>Skills Started</h2>
            {filtered.length > 3 && (
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-teal)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 0.8} onMouseLeave={e => e.currentTarget.style.opacity = 1} onClick={() => navigate('/plans')}>
                View All →
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {fetching ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[0, 1, 2].map((n) => (
                  <div
                    key={n}
                    className="bento-card loading-skeleton-card"
                    style={{
                      padding: '1.5rem',
                      borderRadius: 20,
                      border: '1px solid var(--border-color)',
                      background: 'var(--surface-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      animationDelay: `${n * 0.2}s`
                    }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--surface-muted)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ width: '65%', height: 16, borderRadius: 8, background: 'var(--surface-muted)', marginBottom: 8 }} />
                      <div style={{ width: '40%', height: 12, borderRadius: 6, background: 'var(--surface-muted)', opacity: 0.6 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bento-card rise-item-3" style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface-muted)', borderRadius: 24 }}>
                <p style={{ margin: 0, fontWeight: 600 }}>No plans found.</p>
              </div>
            ) : (
              <>
                {filtered.slice(0, 3).map((r, i) => {
                  const isCompleted = r.is_completed;
                  return (
                    <div
                      key={r.id}
                      className="bento-card hover-card-effects"
                      onClick={() => navigate(`/roadmap/${r.id}`)}
                      style={{
                        padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: 20,
                        background: i % 2 === 0 ? 'var(--surface-color)' : 'var(--surface-muted)',
                        border: '1px solid var(--border-color)',
                        animation: `smoothRiseUp 1.25s cubic-bezier(0.16, 1, 0.3, 1) ${0.35 + i * 0.2}s both`
                      }}
                    >
                      <div style={{ width: 48, height: 48, borderRadius: 16, background: isCompleted ? 'var(--accent-teal)' : 'var(--accent-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        {isCompleted ? '✓' : '⚡'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: 16, margin: '0 0 4px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{r.goal}</h3>
                        <p style={{ fontSize: 13, margin: 0, color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {r.experience_level} • {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        style={{ position: 'relative', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', cursor: 'pointer', padding: '0 8px' }}
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === r.id ? null : r.id); }}
                      >
                        ...
                        {openMenuId === r.id && (
                          <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 6, zIndex: 10, minWidth: 120, boxShadow: '0 8px 25px rgba(0,0,0,0.2)' }}>
                            <div
                              onClick={(e) => handleDelete(r.id, e)}
                              style={{ color: 'var(--accent-pink)', fontSize: 14, fontWeight: 600, padding: '8px 12px', cursor: 'pointer', borderRadius: 8, transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}
                              onMouseOver={e => e.target.style.background = 'rgba(226, 85, 131, 0.1)'}
                              onMouseOut={e => e.target.style.background = 'transparent'}
                            >
                              🗑️ Delete
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filtered.length > 3 && (
                  <div
                    onClick={() => navigate('/plans')}
                    className="bento-card hover-card-effects"
                    style={{ padding: '1.35rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--surface-color)', color: 'var(--accent-teal)', fontWeight: 800, borderRadius: 20, border: '1px solid var(--border-color)', animation: 'smoothRiseUp 1.25s cubic-bezier(0.16, 1, 0.3, 1) 0.8s both' }}
                  >
                    <span style={{ fontSize: 20 }}>+</span> View {filtered.length - 3} More
                  </div>
                )}
              </>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <button onClick={() => navigate('/settings')} className="btn-primary btn-solid-dark rise-item-1 hover-pill" style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', borderRadius: 100, fontSize: 16, fontWeight: 800, boxShadow: '0 6px 20px rgba(0,0,0,0.15)' }}>
            <span>⚙️</span> Manage Account
          </button>

          <div className="bento-card card-pink rise-item-2 hover-card-effects" style={{ padding: '2rem', textAlign: 'center', borderRadius: 28 }}>
            <h3 style={{ fontSize: 20, margin: '0 0 1.2rem', color: '#ffffff', fontWeight: 800 }}>Daily Streak</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              {[0, 1, 2, 3].map((offset) => {
                const streak = user?.streak || 0;
                const startDay = Math.max(1, streak - 2);
                const displayDay = startDay + offset;
                const isCurrent = displayDay === streak && streak > 0;

                return (
                  <div key={offset} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: isCurrent ? '#ffffff' : 'rgba(255,255,255,0.2)',
                      color: isCurrent ? 'var(--accent-pink)' : 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800,
                      boxShadow: isCurrent ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                      animation: isCurrent ? 'floatEmoji 2s infinite ease-in-out' : 'none'
                    }}>
                      {isCurrent ? '🔥' : displayDay}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{displayDay}D</div>
                  </div>
                );
              })}
            </div>

            <button className="hover-pill" style={{ width: '100%', background: '#ffffff', color: 'var(--accent-pink)', border: 'none', padding: '15px', borderRadius: 100, fontSize: 15, fontWeight: 900, fontFamily: 'Outfit', cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }}>
              Keep Learning
            </button>
          </div>

          <div className="bento-card card-orange rise-item-3 hover-card-effects" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: 28 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
              <span className="pill-tag hover-pill" style={{ background: '#ffffff', color: 'var(--accent-orange)', border: 'none', fontWeight: 800, cursor: 'pointer', padding: '6px 14px', borderRadius: 100, fontSize: 12 }}>#Focus</span>
              <span className="pill-tag hover-pill" style={{ background: 'rgba(255,255,255,0.25)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', padding: '6px 14px', borderRadius: 100, fontSize: 12 }}>#Learn</span>
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 1.5rem', lineHeight: 1.3, color: '#ffffff', fontFamily: 'Outfit' }}>Consistency is the key to mastery.</h3>

            <div style={{ height: 10, background: 'rgba(255,255,255,0.25)', borderRadius: 100, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progressPct}%`, background: '#ffffff', borderRadius: 100, transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
              <span>Progress</span>
              <span>{progressPct}%</span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
