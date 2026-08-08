import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeCVText } from '../services/api';
import { useAuth } from '../store/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import ThemeToggle from '../components/ThemeToggle';

/* ---- Animated Score Ring ---- */
function Ring({ score, label, color }) {
  const r = 42, c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div style={{ textAlign: 'center', transition: 'transform 0.3s ease', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      <div style={{ position: 'relative', width: 110, height: 110, margin: '0 auto' }}>
        <svg width={110} height={110} viewBox="0 0 110 110">
          <circle cx={55} cy={55} r={r} fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth={10} />
          <circle cx={55} cy={55} r={r} fill="none" stroke={color} strokeWidth={10}
            strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
          <text x={55} y={48} textAnchor="middle" fill="var(--text-primary)" fontSize={22} fontWeight={900} fontFamily="Outfit, sans-serif">{score}</text>
          <text x={55} y={65} textAnchor="middle" fill="var(--text-secondary)" fontSize={11} fontWeight={600}>/ 100</text>
        </svg>
      </div>
      <p style={{ margin: '8px 0 0', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.3px' }}>{label}</p>
    </div>
  );
}

function ScoreColor(score) {
  return score >= 70 ? '#2ef26c' : score >= 45 ? '#ffb900' : '#ff4d4d';
}

/* ---- Main Component ---- */
export default function CVAnalyzer() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [jobRole, setJobRole] = useState('');
  const [jd, setJd] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  /* CV editor state */
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState("'Inter', sans-serif");
  const [textColor, setTextColor] = useState('#e2e8f0');

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setResumeText(`[PDF uploaded: ${f.name}]`); }
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeText.trim() && !file) { setError('Please upload a PDF or paste your resume text.'); return; }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('job_role', jobRole);
      formData.append('job_description', jd);
      if (file) formData.append('resume', file);
      formData.append('resume_text', resumeText);
      const res = await analyzeCVText(formData);
      setAnalysis(res.data.analysis);
    } catch (err) {
      console.error('CV error:', err.response || err);
      setError('Analysis failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const FONTS = [
    { label: 'Inter', value: "'Inter', sans-serif" },
    { label: 'Mono', value: "'Courier New', monospace" },
    { label: 'Serif', value: "'Georgia', serif" },
    { label: 'Outfit', value: "'Outfit', sans-serif" },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes smoothRiseUp {
          0% { opacity: 0; transform: translateY(60px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes floatEmoji {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(4deg); }
        }
        @keyframes pulseBadge {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.03); opacity: 1; box-shadow: 0 0 20px rgba(226, 85, 131, 0.4); }
        }
        .anim-card-1 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
        .anim-card-2 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both; }
        .anim-card-3 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both; }
        .anim-card-4 { animation: smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.8s both; }
        .hover-lift { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important; }
        .hover-lift:hover { transform: translateY(-8px) scale(1.015) !important; box-shadow: 0 22px 45px rgba(0, 0, 0, 0.16) !important; }
      `}</style>

      <AnimatedBackground />

      {/* Prominent Scaled-Up Top Navbar */}
      <nav className="mobile-nav" style={{ padding: '2rem 3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
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
            <span style={{ color: 'var(--accent-pink)', cursor: 'pointer' }}>CV Analyzer</span>
            <span style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0.85 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.85} onClick={() => navigate('/profile')}>Profile</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <ThemeToggle />
          {logout && (
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
          )}
        </div>
      </nav>

      {/* Main Container */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1, padding: '1rem 3.5rem 4rem', maxWidth: 1440, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* Hero Banner Section */}
        <div style={{ marginBottom: '1.75rem', animation: 'smoothRiseUp 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.4rem', color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.5px' }}>
            📄 Smart CV Analyzer & <span style={{ color: 'var(--accent-pink)' }}>ATS Checker</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.5, maxWidth: 680, margin: 0, fontWeight: 500 }}>
            Upload your resume, edit content directly, and get instant deep analysis on your ATS match rate, critical skill gaps, and AI-recommended role targets.
          </p>
        </div>

        <div className="mobile-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) minmax(420px, 1.2fr)', gap: '2.5rem', alignItems: 'start' }}>

          {/* ---- LEFT: Upload + Form ---- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Upload Zone Bento Card */}
            <div className="bento-card card-teal anim-card-1 hover-lift" style={{ padding: '2rem', position: 'relative', overflow: 'hidden', borderRadius: 28 }}>
              <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 130, opacity: 0.15, transform: 'rotate(-10deg)', pointerEvents: 'none' }}>📎</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
                <span style={{ fontSize: '1.6rem' }}>📤</span>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#ffffff' }}>Upload Your Resume</h3>
              </div>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current.click()}
                style={{ padding: '2.2rem 1.5rem', borderRadius: 20, border: `2px dashed ${dragOver ? '#ffffff' : 'rgba(255, 255, 255, 0.35)'}`, background: dragOver ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(8px)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.25s ease', position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 42, marginBottom: '0.6rem', animation: 'floatEmoji 3s infinite ease-in-out' }}>{file ? '✅' : '📄'}</div>
                <p style={{ margin: 0, color: '#ffffff', fontWeight: 700, fontSize: 16 }}>
                  {file ? file.name : 'Drag & drop PDF here, or click to browse'}
                </p>
                <p style={{ margin: '0.4rem 0 0', color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, fontWeight: 500 }}>Supports formatted PDF & TXT resumes</p>
                <input ref={fileInputRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }}
                  onChange={e => { if (e.target.files[0]) { setFile(e.target.files[0]); setResumeText(`[PDF uploaded: ${e.target.files[0].name}]`); } }} />
              </div>
            </div>

            {/* Target Job Details Bento Card */}
            <form onSubmit={handleAnalyze} className="bento-card card-pink anim-card-2 hover-lift" style={{ padding: '2rem', borderRadius: 28, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ position: 'absolute', right: -20, bottom: -20, fontSize: 140, opacity: 0.12, pointerEvents: 'none' }}>🎯</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
                <span style={{ fontSize: '1.6rem' }}>🎯</span>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#ffffff' }}>Target Job Details</h3>
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Target Job Role *</label>
                <input type="text" value={jobRole} onChange={e => setJobRole(e.target.value)} required placeholder="e.g. Senior Full Stack Engineer, AI Researcher"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '14px 18px', borderRadius: 14, border: 'none', background: '#ffffff', color: '#1e293b', fontSize: '1.05rem', fontWeight: 600, outline: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Job Description <span style={{ opacity: 0.8, fontWeight: 500 }}>(Optional for deep ATS match)</span></label>
                <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste target Job Description (JD) here to match keywords and qualifications exactly..."
                  style={{ width: '100%', boxSizing: 'border-box', padding: '14px 18px', borderRadius: 14, border: 'none', background: 'rgba(255, 255, 255, 0.95)', color: '#1e293b', fontSize: '1rem', fontWeight: 500, minHeight: 130, outline: 'none', resize: 'vertical', lineHeight: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
              </div>

              {error && <div style={{ padding: '0.9rem 1.2rem', background: 'rgba(255, 255, 255, 0.9)', borderRadius: 12, color: '#d91535', fontWeight: 700, fontSize: 14, position: 'relative', zIndex: 1 }}>⚠️ {error}</div>}

              <button type="submit" disabled={loading || !jobRole.trim()}
                style={{ padding: '16px', borderRadius: 100, border: '2px solid #ffffff', background: loading ? '#ffffff' : '#ffffff', color: loading ? '#64748b' : 'var(--accent-pink)', fontSize: '1.15rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.25s ease', boxShadow: '0 8px 25px rgba(0,0,0,0.15)', marginTop: '0.5rem', position: 'relative', zIndex: 1 }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.transform = 'scale(1)'; }}>
                {loading ? '⏳ AI Running ATS Diagnostics...' : 'Launch AI Resume Analysis →'}
              </button>
            </form>
          </div>

          {/* ---- RIGHT: Editor or Results ---- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {!analysis ? (
              /* CV Editor Bento Card */
              <div className="bento-card card-orange anim-card-2 hover-lift" style={{ padding: '2rem', borderRadius: 28, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
                <div style={{ position: 'absolute', right: -30, bottom: -30, fontSize: 220, opacity: 0.12, pointerEvents: 'none', zIndex: 0 }}>📝</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.6rem' }}>✍️</span>
                    <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#ffffff' }}>Live CV Editor</h3>
                  </div>
                  <div style={{ padding: '4px 12px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: 100, border: '1px solid rgba(255,255,255,0.2)' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>🚧 Feature coming soon...</span>
                  </div>
                </div>
                
                <div style={{ flex: 1, width: '100%', boxSizing: 'border-box', padding: '1.5rem', borderRadius: 20, border: '2px dashed rgba(255, 255, 255, 0.4)', background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 60, marginBottom: '1rem', animation: 'floatEmoji 3s infinite ease-in-out' }}>🛠️</div>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800 }}>We're building something amazing!</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.8, maxWidth: 300, lineHeight: 1.5 }}>Our True In-Place PDF Editor is currently undergoing maintenance to provide a flawless WYSIWYG experience. Please check back soon!</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Score Match Card */}
                <div className="bento-card card-teal anim-card-1 hover-lift" style={{ padding: '2.2rem', borderRadius: 28, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                    <span style={{ fontSize: '1.7rem' }}>📊</span>
                    <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.5rem', fontFamily: 'Outfit, sans-serif', color: '#ffffff' }}>AI Match Intelligence</h3>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem', background: 'rgba(0, 0, 0, 0.15)', backdropFilter: 'blur(10px)', padding: '2rem 1.5rem', borderRadius: 20, border: '1px solid rgba(255, 255, 255, 0.15)', position: 'relative', zIndex: 1 }}>
                    <Ring score={analysis.ats_score || 0} label="ATS COMPATIBILITY" color={ScoreColor(analysis.ats_score || 0)} />
                    <div style={{ width: 1, background: 'rgba(255, 255, 255, 0.2)', minHeight: '100px' }} />
                    <Ring score={analysis.job_match_score || 0} label="JOB ROLE MATCH" color={ScoreColor(analysis.job_match_score || 0)} />
                  </div>

                  {analysis.overall_feedback && (
                    <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(10px)', borderRadius: 16, border: '1px solid rgba(255, 255, 255, 0.25)', position: 'relative', zIndex: 1 }}>
                      <p style={{ margin: '0 0 0.4rem', fontWeight: 800, fontSize: 14, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💬 AI Executive Summary:</p>
                      <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.95)', lineHeight: 1.6, fontSize: 15, fontWeight: 500 }}>{analysis.overall_feedback}</p>
                    </div>
                  )}
                </div>

                {/* Suggestions Bento */}
                {analysis.suggestions?.length > 0 && (
                  <div className="bento-card card-orange anim-card-2 hover-lift" style={{ padding: '2rem', borderRadius: 28, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
                      <span style={{ fontSize: '1.6rem' }}>💡</span>
                      <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem', fontFamily: 'Outfit, sans-serif', color: '#ffffff' }}>Actionable ATS Improvements</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', position: 'relative', zIndex: 1 }}>
                      {analysis.suggestions.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '14px 16px', background: 'rgba(0, 0, 0, 0.15)', backdropFilter: 'blur(8px)', borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.15)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateX(6px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                          <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#ffffff', color: 'var(--accent-orange)', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{i + 1}</span>
                          <span style={{ color: '#ffffff', lineHeight: 1.5, fontSize: 15, fontWeight: 600 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Analysis */}
                <div className="bento-card anim-card-3 hover-lift" style={{ padding: '2rem', borderRadius: 28, background: 'var(--surface-color)', border: '1px solid var(--border-color)', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '1.6rem' }}>🛠️</span>
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.4rem', fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>Skill Matrix Breakdown</h3>
                  </div>

                  {analysis.skills_found?.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <p style={{ margin: '0 0 0.7rem', fontSize: 14, fontWeight: 800, color: '#2ef26c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>✅ Identified in your Resume ({analysis.skills_found.length})</span>
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                        {analysis.skills_found.map((s, i) => (
                          <span key={i} style={{ padding: '6px 14px', background: 'rgba(46, 242, 108, 0.12)', border: '1px solid rgba(46, 242, 108, 0.3)', borderRadius: 100, fontSize: 14, fontWeight: 700, color: '#2ef26c', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.skills_missing?.length > 0 && (
                    <div>
                      <p style={{ margin: '0 0 0.7rem', fontSize: 14, fontWeight: 800, color: '#ff4d4d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>❌ Missing Keywords / Highly Recommended ({analysis.skills_missing.length})</span>
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                        {analysis.skills_missing.map((s, i) => (
                          <span key={i} style={{ padding: '6px 14px', background: 'rgba(255, 77, 77, 0.12)', border: '1px solid rgba(255, 77, 77, 0.3)', borderRadius: 100, fontSize: 14, fontWeight: 700, color: '#ff4d4d', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Strengths & Weaknesses */}
                <div className="anim-card-3 mobile-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(250px, 1fr)', gap: '1.5rem' }}>
                  {analysis.strengths?.length > 0 && (
                    <div className="hover-lift" style={{ background: 'rgba(46, 242, 108, 0.07)', borderRadius: 24, padding: '1.75rem', border: '1px solid rgba(46, 242, 108, 0.25)' }}>
                      <p style={{ margin: '0 0 1rem', fontWeight: 800, color: '#2ef26c', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🛡️ Resume Strengths</span>
                      </p>
                      <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                        {analysis.strengths.map((s, i) => <li key={i} style={{ color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6, fontWeight: 600 }}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {analysis.weaknesses?.length > 0 && (
                    <div className="hover-lift" style={{ background: 'rgba(255, 77, 77, 0.07)', borderRadius: 24, padding: '1.75rem', border: '1px solid rgba(255, 77, 77, 0.25)' }}>
                      <p style={{ margin: '0 0 1rem', fontWeight: 800, color: '#ff4d4d', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⚠️ Potential Pitfalls</span>
                      </p>
                      <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                        {analysis.weaknesses.map((s, i) => <li key={i} style={{ color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6, fontWeight: 600 }}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Recommended Roles */}
                {analysis.recommended_roles?.length > 0 && (
                  <div className="bento-card card-pink anim-card-4 hover-lift" style={{ padding: '2rem', borderRadius: 28, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
                      <span style={{ fontSize: '1.6rem' }}>🌟</span>
                      <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem', fontFamily: 'Outfit, sans-serif', color: '#ffffff' }}>Best Fitted Career Targets</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', position: 'relative', zIndex: 1 }}>
                      {analysis.recommended_roles.map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '16px 18px', background: 'rgba(0, 0, 0, 0.18)', backdropFilter: 'blur(8px)', borderRadius: 16, border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                          <div style={{ flex: 1, fontWeight: 800, color: '#ffffff', fontSize: '1.05rem' }}>{r.role}</div>
                          <div style={{ width: 150, height: 12, borderRadius: 100, background: 'rgba(255, 255, 255, 0.2)', overflow: 'hidden', padding: '2px' }}>
                            <div style={{ width: `${r.match}%`, height: '100%', background: ScoreColor(r.match), borderRadius: 100, transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: `0 0 10px ${ScoreColor(r.match)}` }} />
                          </div>
                          <div style={{ minWidth: 45, textAlign: 'right', fontSize: 16, fontWeight: 900, color: ScoreColor(r.match) }}>{r.match}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => setAnalysis(null)} className="hover-lift"
                  style={{ padding: '16px', borderRadius: 16, border: '2px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  <span>🔄 Edit Resume & Run Another Analysis</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
