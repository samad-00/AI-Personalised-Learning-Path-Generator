import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import AnimatedBackground from '../components/AnimatedBackground';
import { API } from '../services/api';

export default function Login() {
  // Modes: 'password' | 'otp' | 'reset'
  const [mode, setMode] = useState('password');
  // Steps: 'request' (ask for email) | 'verify' (ask for code)
  const [step, setStep] = useState('request');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();

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

  const { login, setToken, setUser } = useAuth();

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach server.');
      } else if (err.response.status === 401) {
        setError('Incorrect email or password. Please try again.');
      } else {
        setError('Server error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };



  const verifyOTPReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.post('/accounts/reset-password/', {
        email,
        dob: dob,
        new_password: newPassword
      });
      setMessage('Password reset successfully! You can now log in.');
      setMode('password');
      setDob('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setError('');
    setMessage('');
    setDob('');
    setNewPassword('');
    setConfirmPassword('');
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
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-1px' }}>
              {mode === 'password' ? 'Welcome Back' : 'Reset Password'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0, fontWeight: 500 }}>
              {mode === 'password' ? 'Sign in to continue your learning journey' : 'Enter your email and Date of Birth to reset your password'}
            </p>
          </div>

          {/* Standard Password Login */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <input type="email" placeholder="Email Address" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" style={{ padding: '16px 24px', fontSize: 15, background: 'transparent' }} />
              <input type="password" placeholder="Password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" style={{ padding: '16px 24px', fontSize: 15, background: 'transparent' }} />
              
              <div style={{ textAlign: 'right', marginTop: '-10px' }}>
                <span onClick={() => { setMode('reset'); resetState(); }} style={{ color: '#f97316', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Forgot Password?</span>
              </div>
              
              {error && <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{error}</div>}
              {message && <div style={{ color: 'var(--accent-teal)', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{message}</div>}
              
              <button type="submit" className="btn-primary card-orange" disabled={loading} style={{ padding: '18px', fontSize: 18, border: 'none' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>


            </form>
          )}

          {/* Reset Password */}
          {mode === 'reset' && (
            <form onSubmit={verifyOTPReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <input type="email" placeholder="Email Address" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" style={{ padding: '16px 24px', fontSize: 15, background: 'transparent' }} />
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, textAlign: 'left', paddingLeft: '4px' }}>Date of Birth</label>
                <input type="date" className="input-field" value={dob} onChange={e => setDob(e.target.value)} onClick={(e) => { if(e.target.showPicker) e.target.showPicker(); }} required aria-label="Date of Birth" style={{ padding: '16px 24px', fontSize: 15, background: 'transparent', width: '100%', cursor: 'pointer' }} />
              </div>

              <input type="password" placeholder="New Password" className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} required autoComplete="new-password" minLength={8} style={{ padding: '16px 24px', fontSize: 15, background: 'transparent' }} />
              <input type="password" placeholder="Confirm Password" className="input-field" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password" minLength={8} style={{ padding: '16px 24px', fontSize: 15, background: 'transparent' }} />
              
              {error && <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{error}</div>}
              {message && <div style={{ color: 'var(--accent-teal)', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{message}</div>}

              <button type="submit" className="btn-primary card-teal" disabled={loading} style={{ padding: '18px', fontSize: 18, border: 'none' }}>
                {loading ? 'Processing...' : 'Reset Password'}
              </button>

              <button type="button" onClick={() => { setMode('password'); resetState(); }} className="btn-secondary" style={{ padding: '16px', fontSize: 16, border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Cancel
              </button>
            </form>
          )}

          {mode === 'password' && (
            <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: 16, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Don't have an account? <Link to="/register" style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>Sign up</Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
