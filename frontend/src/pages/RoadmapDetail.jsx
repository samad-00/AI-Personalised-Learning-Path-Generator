import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoadmap, rateResource, regenerateWeek, saveNotes, exportPDF } from '../services/api';
import Confetti from '../components/Confetti';
import XPToast from '../components/XPToast';
import ThemeToggle from '../components/ThemeToggle';
import AnimatedBackground from '../components/AnimatedBackground';

export default function RoadmapDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(null);
  const [activeWeek, setActiveWeek] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState({});
  const [notesText, setNotesText] = useState({});
  const [savingNotes, setSavingNotes] = useState({});
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getRoadmap(id).then(res => setRoadmap(res.data)).finally(() => setLoading(false));
  }, [id]);

  const getProgress = (week) => {
    if (!week.resources.length) return 0;
    const completed = week.resources.filter(r => r.is_completed).length;
    return Math.round((completed / week.resources.length) * 100);
  };

  const getTotalProgress = (roadmap) => {
    const all = roadmap.weeks.flatMap(w => w.resources);
    if (!all.length) return 0;
    return Math.round((all.filter(r => r.is_completed).length / all.length) * 100);
  };

  const handleRate = async (resourceId, rating, completed) => {
    const res = await rateResource(resourceId, { difficulty_rating: rating, is_completed: completed });
    const data = res.data;
    if (data.xp_awarded > 0) setToast({ xp: data.xp_awarded, badge: data.new_badges?.[0] || null });
    if (completed && data.xp_awarded >= 50) setConfetti(true);
    getRoadmap(id).then(res => setRoadmap(res.data));
  };

  const handleRegenerate = async (weekId) => {
    setRegenerating(weekId);
    try {
      await regenerateWeek(weekId);
      const res = await getRoadmap(id);
      setRoadmap(res.data);
    } finally {
      setRegenerating(null);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const res = await exportPDF(id);
      window.open(res.data.pdf_url, '_blank');
    } catch (err) {
      alert('Failed to export PDF.');
    } finally {
      setExporting(false);
    }
  };

  const handleResourceClick = (e, resource) => {
    e.preventDefault();
    let url;
    const q = encodeURIComponent(resource.title);
    const qtutorial = encodeURIComponent(resource.title + ' tutorial');
    
    if (resource.resource_type === 'video') {
      url = `https://www.youtube.com/results?search_query=${qtutorial}`;
    } else if (resource.resource_type === 'book') {
      url = `https://duckduckgo.com/?q=!ducky+${q}+filetype:pdf`;
    } else if (resource.resource_type === 'exercise') {
      url = `https://www.google.com/search?q=${q}+coding+questions+site:leetcode.com+OR+site:hackerrank.com+OR+site:codewars.com`;
    } else if (resource.resource_type === 'article') {
      url = `https://www.google.com/search?q=${qtutorial}+site:geeksforgeeks.org+OR+site:w3schools.com+OR+site:freecodecamp.org`;
    } else {
      url = resource.url && resource.url.startsWith('http') ? resource.url : `https://www.google.com/search?q=${qtutorial}`;
    }
    
    window.open(url, '_blank');
  };

  const handleSaveNotes = async (resourceId) => {
    setSavingNotes(prev => ({ ...prev, [resourceId]: true }));
    try {
      await saveNotes(resourceId, { notes: notesText[resourceId] || '' });
      setTimeout(() => setSavingNotes(prev => ({ ...prev, [resourceId]: false })), 1000);
    } catch {
      setSavingNotes(prev => ({ ...prev, [resourceId]: false }));
    }
  };

  const toggleNotes = (resourceId, existingNotes) => {
    setExpandedNotes(prev => ({ ...prev, [resourceId]: !prev[resourceId] }));
    if (!notesText[resourceId]) {
      setNotesText(prev => ({ ...prev, [resourceId]: existingNotes || '' }));
    }
  };
    
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
      Loading roadmap...
    </div>
  );

  if (!roadmap) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
      Roadmap not found
    </div>
  );

  const totalProgress = getTotalProgress(roadmap);
  const week = roadmap.weeks[activeWeek];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 100 }}>
        {confetti && <Confetti active={confetti} onDone={() => setConfetti(false)} />}
        {toast && <XPToast xp={toast.xp} badge={toast.badge} onDone={() => setToast(null)} />}
      </div>

      <AnimatedBackground />

      {/* Top Navbar */}
      <nav style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              📖
            </div>
            <span style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>LearnPath</span>
          </div>
          
          <div className="nav-links" style={{ display: 'flex', gap: 24, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            <span style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => navigate('/dashboard')}>Home</span>
            <span style={{ color: 'var(--accent-pink)' }}>Learning Plan</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', zIndex: 10 }}>
        
        {/* Header Hero Card */}
        <div className="bento-card card-orange" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -30, top: -50, fontSize: 200, opacity: 0.1, transform: 'rotate(15deg)' }}>🎯</div>
          
          <div className="responsive-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <span className="pill-tag" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', marginBottom: '1rem' }}>
                {roadmap.experience_level.toUpperCase()}
              </span>
              <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.1, letterSpacing: '-1px', color: '#ffffff' }}>
                {roadmap.goal}
              </h1>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-primary" style={{ background: 'var(--text-primary)', color: 'var(--bg-color)' }} onClick={handleExportPDF} disabled={exporting}>
                  {exporting ? 'Generating PDF...' : 'Download PDF'}
                </button>
              </div>
            </div>
            
            {/* Circular Progress (matches the image's "78%") */}
            <div style={{ width: 160, height: 160, borderRadius: '50%', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
              <svg width="160" height="160" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12" />
                <circle cx="50" cy="50" r="42" fill="none"
                  stroke="#ffffff"
                  strokeWidth="12" strokeDasharray={`${2 * Math.PI * 42}`} strokeDashoffset={`${2 * Math.PI * 42 * (1 - totalProgress / 100)}`}
                  strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'Outfit', color: '#ffffff', lineHeight: 1 }}>{totalProgress}%</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Progress</div>
              </div>
            </div>
          </div>
        </div>

        {roadmap.topics_overview && roadmap.topics_overview.length > 0 && (
          <div className="bento-card rise-item-2" style={{ padding: '2.5rem', marginBottom: '2rem', background: 'var(--surface-color)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 100, opacity: 0.05, transform: 'rotate(-10deg)', pointerEvents: 'none' }}>🗺️</div>
            <h3 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: 28 }}>🗺️</span> Course Overview Map
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
              {/* Vertical connecting line */}
              <div style={{ position: 'absolute', left: 100, top: 20, bottom: 20, width: 2, background: 'var(--border-color)', zIndex: 0 }} />
              
              {roadmap.topics_overview.map((topicItem, index) => (
                <div key={index} className="responsive-flex" style={{ display: 'flex', alignItems: 'center', gap: '2rem', position: 'relative', zIndex: 1 }}>
                  
                  {/* Topic Node */}
                  <div style={{ 
                    background: index % 2 === 0 ? 'var(--accent-pink)' : 'var(--accent-teal)', 
                    color: 'white', 
                    padding: '1.25rem 1.5rem', 
                    borderRadius: '16px', 
                    fontWeight: 800, 
                    width: '200px',
                    flexShrink: 0,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    textAlign: 'center',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                    position: 'relative'
                  }}>
                    {topicItem.topic}
                  </div>
                  
                  {/* Horizontal line to subtopics */}
                  <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    {topicItem.subtopics && topicItem.subtopics.map((sub, i) => (
                      <span key={i} className="pill-tag hover-pill" style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 700, padding: '8px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        {sub}
                      </span>
                    ))}
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="roadmap-grid">
          
          {/* Sidebar / Week Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '2rem' }}>
            <h3 style={{ fontSize: 20, margin: '0 0 0.5rem', fontWeight: 800 }}>Syllabus</h3>
            
            {roadmap.weeks.map((w, i) => {
              const prog = getProgress(w);
              const isActive = activeWeek === i;
              return (
                <div 
                  key={w.id} 
                  onClick={() => setActiveWeek(i)}
                  className="bento-card"
                  style={{ 
                    padding: '1.25rem', cursor: 'pointer',
                    background: isActive ? 'var(--accent-teal)' : 'var(--surface-color)',
                    color: isActive ? 'white' : 'var(--text-primary)',
                    boxShadow: isActive ? 'var(--shadow-bento)' : 'none',
                    border: isActive ? 'none' : '1px solid var(--border-color)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>Week {w.week_number}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, opacity: isActive ? 1 : 0.6 }}>{prog}%</span>
                  </div>
                  <div style={{ height: 6, background: isActive ? 'rgba(0,0,0,0.15)' : 'var(--bg-color)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: isActive ? '#ffffff' : 'var(--accent-teal)', width: `${prog}%`, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Week Content */}
          {week && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="bento-card" style={{ padding: '2.5rem', background: 'var(--surface-muted)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: 28, margin: '0 0 0.5rem', fontWeight: 800 }}>Week {week.week_number}: {week.title}</h2>
                    <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, maxWidth: 600 }}>{week.objective}</p>
                  </div>
                  <button className="pill-tag" onClick={() => handleRegenerate(week.id)} disabled={regenerating === week.id} style={{ background: 'var(--surface-color)', cursor: 'pointer' }}>
                    {regenerating === week.id ? 'Regenerating...' : '🔄 Regenerate'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {week.resources.map((r, i) => {
                  return (
                    <div key={r.id} className="bento-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--surface-color)' }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="pill-tag" style={{ background: 'var(--bg-color)', color: 'var(--accent-teal)' }}>
                          #{r.resource_type}
                        </span>
                        
                        <button 
                          onClick={() => handleRate(r.id, r.difficulty_rating || 3, !r.is_completed)}
                          style={{ 
                            width: 36, height: 36, borderRadius: '50%', 
                            border: `2px solid ${r.is_completed ? 'var(--accent-teal)' : 'var(--border-color)'}`, 
                            background: r.is_completed ? 'var(--accent-teal)' : 'var(--bg-color)', 
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          {r.is_completed && <span style={{ fontWeight: 900, fontSize: 16 }}>✓</span>}
                        </button>
                      </div>
                      
                      <div>
                        <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 0.5rem', color: r.is_completed ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: r.is_completed ? 'line-through' : 'none' }}>
                          {r.title}
                        </h3>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 1rem', lineHeight: 1.6 }}>{r.description}</p>
                        <a href="#" onClick={(e) => handleResourceClick(e, r)} style={{ color: 'var(--accent-pink)', fontWeight: 700, fontSize: 14 }}>
                          Access Material →
                        </a>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {[1,2,3,4,5].map(n => (
                            <button key={n} onClick={() => handleRate(r.id, n, r.is_completed)}
                              style={{ 
                                width: 24, height: 24, borderRadius: '50%', border: 'none', 
                                background: r.difficulty_rating === n ? 'var(--text-primary)' : 'var(--bg-color)', 
                                color: r.difficulty_rating === n ? 'var(--bg-color)' : 'var(--text-secondary)', 
                                fontSize: 11, fontWeight: 700, cursor: 'pointer' 
                              }}>
                              {n}
                            </button>
                          ))}
                        </div>

                        <button onClick={() => toggleNotes(r.id, r.notes)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                          📝 Notes
                        </button>
                      </div>

                      {expandedNotes[r.id] && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <textarea
                            value={notesText[r.id] !== undefined ? notesText[r.id] : (r.notes || '')}
                            onChange={e => setNotesText(prev => ({ ...prev, [r.id]: e.target.value }))}
                            className="input-field"
                            rows={2}
                            style={{ resize: 'vertical', marginBottom: 8, fontSize: 14, padding: '12px' }}
                          />
                          <button className="pill-tag" style={{ background: 'var(--accent-teal)', color: 'white', border: 'none', cursor: 'pointer' }} onClick={() => handleSaveNotes(r.id)}>
                            {savingNotes[r.id] ? 'Saved' : 'Save'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
