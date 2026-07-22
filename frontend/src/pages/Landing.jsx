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
          <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 800, margin: '0 0 2rem', lineHeight: 1.05, letterSpacing: '-2px' }}>
            Your Platform <span style={{ opacity: 0.5, fontWeight: 500 }}>for</span><br />
            Unlimited Learning
          </h1>
          
          <div className="bento-card" style={{ display: 'inline-flex', alignItems: 'center', gap: 16, padding: '12px 24px', borderRadius: 100, marginBottom: '3rem', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent-teal)' }}></span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Current activity</span>
            </div>
            <div style={{ width: 1, height: 24, background: 'var(--border-color)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-pink)' }}>Lessons #44</span>
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
                <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '18px 40px', fontSize: 18, borderRadius: 100, border: '2px solid var(--border-color)', background: 'var(--surface-color)' }}>
                  Log in to account
                </Link>
              </>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
