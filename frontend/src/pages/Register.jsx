import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import AnimatedBackground from '../components/AnimatedBackground';
import { API } from '../services/api';

export default function Register() {
  const [step, setStep] = useState('request'); // 'request' or 'verify'
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(res => res - 1);
      }, 1000);
    } else if (resendTimer === 0 && interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const requestOTP = async (e) => {
    // OTP verification disabled - allow direct registration
    return handleRegister(e);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(username, email, password, dob);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      let errorMessage = 'Registration failed';

      if (data) {
        if (data.error) {
          errorMessage = data.error;
        } else if (typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          if (firstKey && Array.isArray(data[firstKey])) {
            errorMessage = `${firstKey}: ${data[firstKey][0]}`;
          } else if (typeof data[firstKey] === 'string') {
            errorMessage = data[firstKey];
          }
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground />

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
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0, fontWeight: 500 }}>
              {step === 'request' ? 'Start your personalized learning journey' : 'Verify your email to continue'}
            </p>
          </div>

          <form onSubmit={step === 'request' ? requestOTP : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {step === 'request' && (
              <>
                <input type="text" placeholder="Username" className="input-field" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="username" style={{ padding: '16px 24px', fontSize: 15, background: 'transparent' }} />
                <input type="email" placeholder="Email Address" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" style={{ padding: '16px 24px', fontSize: 15, background: 'transparent' }} />
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, textAlign: 'left', paddingLeft: '4px' }}>Date of Birth</label>
                  <input type="date" className="input-field" value={dob} onChange={e => setDob(e.target.value)} required aria-label="Date of Birth" title="Date of Birth (Required for password recovery)" style={{ padding: '16px 24px', fontSize: 15, background: 'transparent', width: '100%', color: 'inherit' }} />
                </div>
                <input type="password" placeholder="Password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" minLength={8} style={{ padding: '16px 24px', fontSize: 15, background: 'transparent' }} />
              </>
            )}



            {error && <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{error}</div>}
            {message && <div style={{ color: 'var(--accent-teal)', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{message}</div>}

            <button type="submit" className="btn-primary card-orange" disabled={loading} style={{ marginTop: '0.5rem', padding: '18px', fontSize: 18, border: 'none' }}>
              {loading ? 'Processing...' : (step === 'request' ? 'Sign Up' : 'Verify & Sign Up')}
            </button>


          </form>

          {step === 'request' && (
            <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: 16, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>Log in</Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
