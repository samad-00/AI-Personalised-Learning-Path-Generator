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
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

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

  const requestOTP = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await API.post('/accounts/otp/request/', {
        email,
        purpose: mode === 'otp' ? 'login' : 'reset'
      });
      setMessage('OTP has been sent to your email.');
      setStep('verify');
      setResendTimer(30);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTPLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/accounts/otp/login/', { email, code: otpCode });
      localStorage.setItem('token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTPReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await API.post('/accounts/otp/reset-password/', {
        email,
        code: otpCode,
        new_password: newPassword
      });
      setMessage('Password reset successfully! You can now log in.');
      setMode('password');
      setStep('request');
      setOtpCode('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setError('');
    setMessage('');
    setStep('request');
    setOtpCode('');
    setNewPassword('');
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
              {mode === 'password' ? 'Welcome Back' : mode === 'otp' ? 'Login with OTP' : 'Reset Password'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0, fontWeight: 500 }}>
              {mode === 'password' ? 'Sign in to continue your learning journey' : step === 'request' ? 'Enter your email to receive a code' : 'Enter the code sent to your email'}
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

              <button type="button" onClick={() => { setMode('otp'); resetState(); }} className="btn-primary" style={{ padding: '16px', fontSize: 16, border: 'none', background: '#047857', color: '#ffffff', fontWeight: 600 }}>
                Login with Email OTP
              </button>
            </form>
          )}

          {/* OTP Login or Reset Password */}
          {mode !== 'password' && (
            <form onSubmit={step === 'request' ? requestOTP : (mode === 'otp' ? verifyOTPLogin : verifyOTPReset)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {step === 'request' && (
                <input type="email" placeholder="Email Address" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" style={{ padding: '16px 24px', fontSize: 15, background: 'transparent' }} />
              )}

              {step === 'verify' && (
                <>
                  <input type="text" placeholder="6-digit OTP Code" className="input-field" value={otpCode} onChange={e => setOtpCode(e.target.value)} required autoComplete="off" maxLength={6} style={{ padding: '16px 24px', fontSize: 15, background: 'transparent', textAlign: 'center', letterSpacing: '4px', fontWeight: 'bold' }} />
                  {mode === 'reset' && (
                    <input type="password" placeholder="New Password" className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} required autoComplete="new-password" style={{ padding: '16px 24px', fontSize: 15, background: 'transparent' }} />
                  )}
                  <div style={{ textAlign: 'right', marginTop: '-5px' }}>
                    <button type="button" disabled={resendTimer > 0} onClick={requestOTP} style={{ background: 'none', border: 'none', color: resendTimer > 0 ? 'var(--text-secondary)' : 'var(--accent-orange)', fontSize: 14, fontWeight: 600, cursor: resendTimer > 0 ? 'not-allowed' : 'pointer' }}>
                      {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Code'}
                    </button>
                  </div>
                </>
              )}

              {error && <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{error}</div>}
              {message && <div style={{ color: 'var(--accent-teal)', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{message}</div>}

              <button type="submit" className="btn-primary card-teal" disabled={loading} style={{ padding: '18px', fontSize: 18, border: 'none' }}>
                {loading ? 'Processing...' : (step === 'request' ? 'Send Code' : (mode === 'otp' ? 'Login' : 'Reset Password'))}
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
