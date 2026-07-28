import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Landing() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      <AnimatedBackground />

      {/* Navigation */}
      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            📖
          </div>
          <span style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>LearnPath</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '6rem 4rem', position: 'relative', zIndex: 10, maxWidth: 1400, margin: '0 auto', width: '100%' }}>

        <div style={{ maxWidth: 650 }}>
          <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 800, margin: '0 0 1.5rem', lineHeight: 1.05, letterSpacing: '-2px' }}>
            Your Platform <span style={{ opacity: 0.5, fontWeight: 500 }}>for</span><br />
            Unlimited Learning
          </h1>

          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Create personalized learning roadmaps powered by AI. Track your progress, earn badges, and master new skills at your own pace with interactive weekly plans.
          </p>

          <div className="bento-card" style={{ display: 'inline-flex', alignItems: 'center', gap: 16, padding: '12px 24px', borderRadius: 100, marginBottom: '3rem', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent-teal)' }}></span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Current activity</span>
            </div>
            <div style={{ width: 1, height: 24, background: 'var(--border-color)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-pink)' }}>AI Skill Path & Interview Prep</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {user ? (
              <Link to="/dashboard" className="btn-primary" style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', textDecoration: 'none', padding: '18px 40px', fontSize: 18, borderRadius: 100 }}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary" style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', textDecoration: 'none', padding: '18px 40px', fontSize: 18, borderRadius: 100 }}>
                  Start Learning Free
                </Link>
                <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '18px 40px', fontSize: 18, borderRadius: 100, border: '2px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', fontWeight: 600 }}>
                  Log in to account
                </Link>
              </>
            )}
          </div>
        </div>



        {/* How It Works Section */}
        <div style={{ marginTop: '8rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, margin: '0 0 1rem' }}>How it Works</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
              Your journey from setting a goal to mastering a skill.
            </p>
          </div>

          <div className="bento-card card-pink" style={{ position: 'relative', height: 400, padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>

            {/* Background Path */}
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0 }}>
              <path d="M0,80 Q15,20 30,50 T70,50 T100,20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
              <path d="M0,80 Q15,20 30,50 T70,50 T100,20 L100,100 L0,100 Z" fill="rgba(255,255,255,0.05)" />
            </svg>

            {/* Point 1 */}
            <div style={{ position: 'absolute', left: '15%', top: '42.5%', transform: 'translate(-50%, -50%)', width: 220, textAlign: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ffffff', margin: '0 auto 1rem', boxShadow: '0 0 0 6px rgba(255,255,255,0.2)' }}></div>
              <div style={{ background: '#1e1e1e', color: 'white', padding: '4px 12px', borderRadius: 100, fontSize: 13, fontWeight: 700, display: 'inline-block', marginBottom: '0.5rem' }}>Step 1</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 0.5rem', color: '#ffffff' }}>Tell us your goal</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.4, margin: 0 }}>Enter your topic and time commitment.</p>
            </div>

            {/* Point 2 */}
            <div style={{ position: 'absolute', left: '50%', top: '65%', transform: 'translate(-50%, -50%)', width: 220, textAlign: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ffffff', margin: '0 auto 1rem', boxShadow: '0 0 0 6px rgba(255,255,255,0.2)' }}></div>
              <div style={{ background: '#1e1e1e', color: 'white', padding: '4px 12px', borderRadius: 100, fontSize: 13, fontWeight: 700, display: 'inline-block', marginBottom: '0.5rem' }}>Step 2</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 0.5rem', color: '#ffffff' }}>AI creates path</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.4, margin: 0 }}>Get a personalized curriculum.</p>
            </div>

            {/* Point 3 */}
            <div style={{ position: 'absolute', left: '85%', top: '27.5%', transform: 'translate(-50%, -50%)', width: 220, textAlign: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ffffff', margin: '0 auto 1rem', boxShadow: '0 0 0 6px rgba(255,255,255,0.2)' }}></div>
              <div style={{ background: '#1e1e1e', color: 'white', padding: '4px 12px', borderRadius: 100, fontSize: 13, fontWeight: 700, display: 'inline-block', marginBottom: '0.5rem' }}>Step 3</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 0.5rem', color: '#ffffff' }}>Learn & level up</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.4, margin: 0 }}>Complete lessons and earn XP.</p>
            </div>

          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="bento-card card-teal" style={{ marginTop: '8rem', padding: '4rem', textAlign: 'center', borderRadius: 40 }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, margin: '0 0 1.5rem', color: 'white' }}>Ready to start learning?</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: 600, margin: '0 auto 2.5rem', color: 'white' }}>
            Join thousands of learners who are mastering new skills faster with personalized AI roadmaps.
          </p>
          {user ? (
            <Link to="/dashboard" className="btn-primary" style={{ background: 'white', color: 'var(--accent-teal)', textDecoration: 'none', padding: '18px 40px', fontSize: 18, borderRadius: 100, display: 'inline-block' }}>
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/register" className="btn-primary" style={{ background: 'white', color: 'var(--accent-teal)', textDecoration: 'none', padding: '18px 40px', fontSize: 18, borderRadius: 100, display: 'inline-block' }}>
              Create your free account
            </Link>
          )}
        </div>

      </main>
    </div>
  );
}
