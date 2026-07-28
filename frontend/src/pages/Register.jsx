import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      let errorMessage = 'Registration failed';

      if (data) {
        if (data.error) {
          errorMessage = data.error;
        } else if (typeof data === 'object') {
          // Extract the first validation error from the backend response
          const firstKey = Object.keys(data)[0];
          if (firstKey && Array.isArray(data[firstKey])) {
            errorMessage = `${firstKey}: ${data[firstKey][0]}`;
          } else if (typeof data[firstKey] === 'string') {
            errorMessage = data[firstKey];
          }
        }
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      <AnimatedBackground />

      {/* Navigation */}
      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            📖
          </div>
          <span style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>LearnPath</span>
        </Link>
        <ThemeToggle />
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 10 }}>
        <div className="bento-card" style={{ width: '100%', maxWidth: 450, padding: '3.5rem', background: 'rgba(235, 99, 131, 0.015)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', border: '2px solid var(--accent-pink)', boxShadow: 'none' }}>

          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-1px' }}>Create an account</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, margin: 0, fontWeight: 500 }}>Start your personalized learning journey</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <input
                type="text"
                placeholder="Username"
                className="input-field"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                style={{ padding: '16px 24px', fontSize: 15, background: 'transparent' }}
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email Address"
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ padding: '16px 24px', fontSize: 15, background: 'transparent' }}
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                className="input-field"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ padding: '16px 24px', fontSize: 15, background: 'transparent' }}
              />
            </div>

            <button type="submit" className="btn-primary card-orange" disabled={loading} style={{ marginTop: '0.5rem', padding: '18px', fontSize: 18, border: 'none' }}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: 16, color: 'var(--text-secondary)', fontWeight: 500 }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>Log in</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
