import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { getRoadmaps, deleteRoadmap } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import AnimatedBackground from '../components/AnimatedBackground';

export default function AllPlans() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
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

  const filtered = roadmaps.filter(r => r.goal.toLowerCase().includes(search.toLowerCase()));

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
            <span style={{ color: 'var(--accent-pink)' }}>All Plans</span>
            <span style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => navigate('/profile')}>Profile</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ position: 'relative', width: 250 }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input
              type="text"
              placeholder="Search plans..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 44, paddingRight: 16, paddingTop: 10, paddingBottom: 10, fontSize: 14 }}
            />
          </div>
          <ThemeToggle />
          <button title="Logout" style={{ background: 'var(--surface-muted)', border: 'none', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }} onClick={logout}>
            🚪
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, maxWidth: 1000, margin: '0 auto', width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', zIndex: 10 }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 8px', fontFamily: 'Outfit' }}>All Learning Plans</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 15 }}>Browse and continue all the skills you've started learning.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {fetching ? (
             <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
          ) : filtered.length === 0 ? (
             <div className="bento-card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface-muted)' }}>
               <p style={{ margin: 0, fontWeight: 600 }}>No plans found.</p>
             </div>
          ) : (
            filtered.map((r, i) => {
              const isCompleted = r.is_completed;
              return (
                <div 
                  key={r.id} 
                  className="bento-card"
                  onClick={() => navigate(`/roadmap/${r.id}`)} 
                  style={{ 
                    padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.5rem',
                    background: i % 2 === 0 ? 'var(--surface-color)' : 'var(--surface-muted)'
                  }}
                >
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: isCompleted ? 'var(--accent-teal)' : 'var(--accent-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    {isCompleted ? '✓' : '🚀'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 18, margin: '0 0 8px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.goal}</h3>
                    <p style={{ fontSize: 14, margin: 0, color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {r.experience_level} level • Created on {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div 
                    style={{ position: 'relative', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', cursor: 'pointer', padding: '0 8px' }} 
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
              );
            })
          )}
        </div>

      </main>
    </div>
  );
}
