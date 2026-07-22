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

  const TOPICS = [
    { title: 'Machine Learning', tag: '#AI' },
    { title: 'React Dev', tag: '#Frontend' },
    { title: 'Data Science', tag: '#Data' },
    { title: 'Cybersecurity', tag: '#Security' },
    { title: 'UI/UX Design', tag: '#Design' },
    { title: 'Cloud Computing', tag: '#Cloud' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      <AnimatedBackground />

      {/* Top Navbar */}
      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div 
            onClick={() => navigate('/')} 
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          >
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              📖
            </div>
            <span style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>LearnPath</span>
          </div>
          
          <div style={{ display: 'flex', gap: 24, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--accent-pink)' }}>Home</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>Profile</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <ThemeToggle />
          <button 
            title="Logout" 
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-primary)',
              width: 36, 
              height: 36, 
              borderRadius: 8, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: 18,
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
      <main style={{ flex: 1, maxWidth: 1400, margin: '0 auto', width: '100%', padding: '2rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr 300px', gap: '2rem', position: 'relative', zIndex: 10 }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-teal)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Welcome back, {user?.username || 'Learner'} 👋
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.1, letterSpacing: '-1px' }}>
              Your Platform <span style={{ opacity: 0.5, fontWeight: 500 }}>for</span><br/>Unlimited Learning
            </h1>
          </div>

          <div className="bento-card card-teal" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 150, opacity: 0.1 }}>🧠</div>
            <h2 style={{ fontSize: 24, margin: 0, position: 'relative', zIndex: 1 }}>Build a New Curriculum</h2>
            
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 }}>
              <input
                type="text"
                placeholder="e.g. Learn React Native in 4 weeks"
                value={goal}
                onChange={e => setGoal(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '16px 24px', borderRadius: 100, border: 'none', fontSize: 15, fontFamily: 'Inter', outline: 'none', background: '#ffffff', color: 'var(--text-primary)' }}
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
                      fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s'
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <button type="submit" disabled={loading || !goal.trim()} style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', border: 'none', padding: '16px', borderRadius: 100, fontSize: 16, fontWeight: 800, fontFamily: 'Outfit', cursor: 'pointer', marginTop: '1rem', position: 'relative', overflow: 'hidden' }}>
                {loading && (
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress}%`, background: 'var(--accent-orange)', opacity: 0.8, transition: 'width 0.5s ease-out' }} />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {loading ? 'Generating curriculum...' : 'Start Learning'}
                </span>
              </button>
            </form>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="bento-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'var(--accent-mint)' }}>
              <div style={{ fontSize: 24, marginBottom: '1rem' }}>⏱️</div>
              <div>
                <div style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', lineHeight: 1 }}>{roadmaps.length}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 8 }}>Total learning plans <br/>created</div>
              </div>
            </div>
            
            <div className="bento-card card-orange" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 24, marginBottom: '1rem' }}>🏆</div>
              <div>
                <div style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: 800, fontFamily: 'Outfit', lineHeight: 1 }}>{roadmaps.filter(r => r.is_completed).length}</div>
                <div style={{ fontSize: 15, fontWeight: 600, opacity: 0.9, marginTop: 8 }}>Total plans <br/>completed</div>
              </div>
            </div>
          </div>

        </div>

        {/* Middle Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Quick Picks / Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '1rem 0' }}>
            {TOPICS.map(t => (
              <span key={t.title} className="pill-tag" onClick={() => setGoal(`Learn ${t.title}`)} style={{ cursor: 'pointer', background: 'var(--surface-color)' }}>
                <span style={{ color: 'var(--accent-pink)' }}>{t.tag}</span> {t.title}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 24, margin: 0 }}>Skills Started</h2>
            {filtered.length > 3 && (
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-teal)', cursor: 'pointer' }} onClick={() => navigate('/plans')}>
                View All
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {fetching ? (
               <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
            ) : filtered.length === 0 ? (
               <div className="bento-card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface-muted)' }}>
                 <p style={{ margin: 0, fontWeight: 600 }}>No plans found.</p>
               </div>
            ) : (
              <>
                {filtered.slice(0, 3).map((r, i) => {
                  const isCompleted = r.is_completed;
                  return (
                    <div 
                      key={r.id} 
                      className="bento-card"
                      onClick={() => navigate(`/roadmap/${r.id}`)} 
                      style={{ 
                        padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                        background: i % 2 === 0 ? 'var(--surface-color)' : 'var(--surface-muted)'
                      }}
                    >
                      <div style={{ width: 48, height: 48, borderRadius: 16, background: isCompleted ? 'var(--accent-teal)' : 'var(--accent-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                        {isCompleted ? '✓' : '🚀'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: 16, margin: '0 0 4px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.goal}</h3>
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
                          <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 4, zIndex: 10, minWidth: 120, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                             <div 
                               onClick={(e) => handleDelete(r.id, e)}
                               style={{ color: 'var(--accent-pink)', fontSize: 14, fontWeight: 600, padding: '8px 12px', cursor: 'pointer', borderRadius: 4, transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}
                               onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
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
                    className="bento-card" 
                    style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--surface-color)', color: 'var(--accent-teal)', fontWeight: 700 }}
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
          
          <button onClick={() => navigate('/settings')} className="btn-primary btn-solid-dark" style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
            <span>⚙️</span> Manage Account
          </button>

          <div className="bento-card card-pink" style={{ padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: 20, margin: '0 0 1rem', opacity: 0.9 }}>Daily Streak</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              {[0, 1, 2, 3].map((offset) => {
                const streak = user?.streak || 0;
                const startDay = Math.max(1, streak - 2); 
                const displayDay = startDay + offset;
                const isCurrent = displayDay === streak && streak > 0;
                
                return (
                  <div key={offset} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ 
                      width: 40, height: 40, borderRadius: '50%', 
                      background: isCurrent ? '#ffffff' : 'rgba(255,255,255,0.2)', 
                      color: isCurrent ? 'var(--accent-pink)' : 'white', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800 
                    }}>
                      {isCurrent ? '🔥' : displayDay}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>{displayDay}D</div>
                  </div>
                );
              })}
            </div>

            <button style={{ width: '100%', background: '#ffffff', color: 'var(--accent-pink)', border: 'none', padding: '14px', borderRadius: 100, fontSize: 15, fontWeight: 800, fontFamily: 'Outfit', cursor: 'pointer' }}>
              Keep Learning
            </button>
          </div>

          <div className="bento-card card-orange" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
              <span className="pill-tag" style={{ background: '#ffffff', color: 'var(--accent-orange)', border: 'none' }}>#Focus</span>
              <span className="pill-tag" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>#Learn</span>
            </div>
            
            <h3 style={{ fontSize: 24, margin: '0 0 1.5rem', lineHeight: 1.2 }}>Consistency is the key to mastery.</h3>
            
            <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 100, overflow: 'hidden', position: 'relative' }}>
               <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progressPct}%`, background: '#ffffff', borderRadius: 100, transition: 'width 0.5s ease-out' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13, fontWeight: 600 }}>
              <span>Progress</span>
              <span>{progressPct}%</span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
