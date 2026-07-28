import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeCVText } from '../services/api';
import AnimatedBackground from '../components/AnimatedBackground';

/* ---- Score ring ---- */
function Ring({ score, label, color }) {
  const r = 40, c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={r} fill="none" stroke="var(--border-color)" strokeWidth={8} />
        <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease' }} />
        <text x={50} y={45} textAnchor="middle" fill="var(--text-primary)" fontSize={18} fontWeight={800}>{score}</text>
        <text x={50} y={60} textAnchor="middle" fill="var(--text-secondary)" fontSize={9}>/ 100</text>
      </svg>
      <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{label}</p>
    </div>
  );
}

function ScoreColor(score) {
  return score >= 70 ? '#38e54d' : score >= 45 ? '#f59e0b' : '#ff5050';
}

function Tag({ text }) {
  return <span style={{ padding: '4px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 100, fontSize: 13, color: 'var(--text-primary)' }}>{text}</span>;
}

/* ---- Main ---- */
export default function CVAnalyzer() {
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
    if (!resumeText.trim() && !file) { setError('Please upload a PDF or paste your resume.'); return; }
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
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground />
      <div style={{ position: 'relative', zIndex: 1, padding: '2.5rem 2rem', maxWidth: 1300, margin: '0 auto' }}>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 18px', borderRadius: 100, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, marginBottom: '1.5rem', fontSize: 14 }}>← Dashboard</button>

        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.4rem', color: 'var(--text-primary)' }}>📄 CV Analyzer & ATS Checker</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.6 }}>
          Upload, edit and analyze your CV — get an ATS score, job match score, skill gap analysis & recommended roles.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 1fr) minmax(380px, 1fr)', gap: '2rem', alignItems: 'start' }}>

          {/* ---- LEFT: Upload + Editor + Form ---- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Upload zone */}
            <div style={{ background: 'var(--surface-color)', borderRadius: 16, padding: '1.5rem', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '0 0 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Upload Resume</p>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current.click()}
                style={{ padding: '1.5rem', borderRadius: 12, border: `2px dashed ${dragOver ? 'var(--accent-pink)' : 'var(--border-color)'}`, background: dragOver ? 'rgba(168,85,247,0.05)' : 'var(--bg-color)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                <div style={{ fontSize: 28, marginBottom: '0.4rem' }}>{file ? '✅' : '📎'}</div>
                <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>
                  {file ? file.name : 'Drag & drop PDF or click to browse'}
                </p>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: 12 }}>Supports PDF</p>
                <input ref={fileInputRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }}
                  onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }} />
              </div>
            </div>

            {/* CV Editor */}
            <div style={{ background: 'var(--surface-color)', borderRadius: 16, padding: '1.5rem', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>CV Editor</p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Font family */}
                  <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer' }}>
                    {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  {/* Font size */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button onClick={() => setFontSize(f => Math.max(10, f - 1))} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700 }}>-</button>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 28, textAlign: 'center' }}>{fontSize}</span>
                    <button onClick={() => setFontSize(f => Math.min(24, f + 1))} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700 }}>+</button>
                  </div>
                  {/* Text color */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Color</span>
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border-color)', cursor: 'pointer', padding: 2, background: 'transparent' }} />
                  </div>
                </div>
              </div>
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your resume text here, or upload a PDF above. You can edit freely — change content, add achievements, update skills — then analyze!"
                style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: textColor, fontSize: fontSize + 'px', fontFamily, minHeight: 320, outline: 'none', resize: 'vertical', lineHeight: 1.7 }}
              />
            </div>

            {/* Job Details */}
            <form onSubmit={handleAnalyze} style={{ background: 'var(--surface-color)', borderRadius: 16, padding: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Target Job Details</p>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Target Role *</label>
                <input type="text" value={jobRole} onChange={e => setJobRole(e.target.value)} required placeholder="e.g. Data Scientist, Frontend Developer"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Job Description <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(optional)</span></label>
                <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste JD for precise ATS matching..."
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '1rem', minHeight: 100, outline: 'none', resize: 'vertical' }} />
              </div>

              {error && <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,80,80,0.1)', borderRadius: 8, color: '#ff5050', fontSize: 14 }}>⚠️ {error}</div>}

              <button type="submit" disabled={loading || !jobRole.trim()}
                style={{ padding: '14px', borderRadius: 12, border: 'none', background: loading ? 'var(--border-color)' : 'var(--text-primary)', color: 'var(--bg-color)', fontSize: '1.05rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                {loading ? '⏳ Analyzing with AI...' : '🔍 Analyze My CV'}
              </button>
            </form>
          </div>

          {/* ---- RIGHT: Results ---- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {!analysis ? (
              <div style={{ background: 'var(--surface-color)', borderRadius: 16, padding: '3rem 2rem', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: 64, marginBottom: '1rem' }}>📊</div>
                <h3 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Your Analysis Will Appear Here</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Paste your resume, select a target role, and click Analyze to get your ATS score, job match, skill gap analysis, and recommended roles.</p>
              </div>
            ) : (
              <>
                {/* Score Cards */}
                <div style={{ background: 'var(--surface-color)', borderRadius: 16, padding: '1.75rem', border: '1px solid var(--border-color)' }}>
                  <p style={{ margin: '0 0 1.5rem', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>📊 Match Analysis</p>
                  <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' }}>
                    <Ring score={analysis.ats_score || 0} label="ATS Score" color={ScoreColor(analysis.ats_score || 0)} />
                    <Ring score={analysis.job_match_score || 0} label="Job Match" color={ScoreColor(analysis.job_match_score || 0)} />
                  </div>
                  {analysis.overall_feedback && (
                    <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 14 }}>{analysis.overall_feedback}</p>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {analysis.suggestions?.length > 0 && (
                  <div style={{ background: 'var(--surface-color)', borderRadius: 16, padding: '1.5rem', border: '1px solid var(--border-color)' }}>
                    <p style={{ margin: '0 0 1rem', fontWeight: 800, color: 'var(--text-primary)' }}>💡 Actionable Suggestions</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {analysis.suggestions.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--accent-pink)', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}.</span>
                          <span style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 14 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                <div style={{ background: 'var(--surface-color)', borderRadius: 16, padding: '1.5rem', border: '1px solid var(--border-color)' }}>
                  <p style={{ margin: '0 0 1rem', fontWeight: 800, color: 'var(--text-primary)' }}>🛠 Skills Analysis</p>
                  {analysis.skills_found?.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ margin: '0 0 0.5rem', fontSize: 13, fontWeight: 700, color: '#38e54d' }}>✅ Found in your CV</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {analysis.skills_found.map((s, i) => (
                          <span key={i} style={{ padding: '4px 12px', background: 'rgba(56,229,77,0.1)', border: '1px solid rgba(56,229,77,0.3)', borderRadius: 100, fontSize: 13, color: '#38e54d' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.skills_missing?.length > 0 && (
                    <div>
                      <p style={{ margin: '0 0 0.5rem', fontSize: 13, fontWeight: 700, color: '#ff5050' }}>❌ Missing / Add these</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {analysis.skills_missing.map((s, i) => (
                          <span key={i} style={{ padding: '4px 12px', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 100, fontSize: 13, color: '#ff5050' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Strengths & Weaknesses */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {analysis.strengths?.length > 0 && (
                    <div style={{ background: 'rgba(56,229,77,0.07)', borderRadius: 16, padding: '1.25rem', border: '1px solid rgba(56,229,77,0.2)' }}>
                      <p style={{ margin: '0 0 0.75rem', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>✅ Strengths</p>
                      <ul style={{ paddingLeft: '1.1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {analysis.strengths.map((s, i) => <li key={i} style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {analysis.weaknesses?.length > 0 && (
                    <div style={{ background: 'rgba(255,80,80,0.07)', borderRadius: 16, padding: '1.25rem', border: '1px solid rgba(255,80,80,0.2)' }}>
                      <p style={{ margin: '0 0 0.75rem', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>⚠️ Weaknesses</p>
                      <ul style={{ paddingLeft: '1.1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {analysis.weaknesses.map((s, i) => <li key={i} style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Recommended Roles */}
                {analysis.recommended_roles?.length > 0 && (
                  <div style={{ background: 'var(--surface-color)', borderRadius: 16, padding: '1.5rem', border: '1px solid var(--border-color)' }}>
                    <p style={{ margin: '0 0 1rem', fontWeight: 800, color: 'var(--text-primary)' }}>🎯 Recommended Roles for You</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {analysis.recommended_roles.map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '12px 14px', background: 'var(--bg-color)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                          <div style={{ flex: 1, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{r.role}</div>
                          <div style={{ width: 120, height: 8, borderRadius: 100, background: 'var(--border-color)', overflow: 'hidden' }}>
                            <div style={{ width: `${r.match}%`, height: '100%', background: ScoreColor(r.match), borderRadius: 100, transition: 'width 1s ease' }} />
                          </div>
                          <div style={{ minWidth: 36, textAlign: 'right', fontSize: 13, fontWeight: 700, color: ScoreColor(r.match) }}>{r.match}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => setAnalysis(null)}
                  style={{ padding: '12px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
                  🔄 Edit CV & Re-analyze
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
