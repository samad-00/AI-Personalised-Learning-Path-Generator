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
  // Reset Methods: 'dob' | 'otp'
  const [resetMethod, setResetMethod] = useState('dob');
  // Reset Steps: 'request' | 'verify' (only for resetMethod='otp')
  const [resetStep, setResetStep] = useState('request');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');

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

  const { login, loginWithOTP, setToken, setUser } = useAuth();

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

  const handleOTPRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { requestOTP } = await import('../services/api');
      await requestOTP({ email, purpose: 'login' });
      setStep('verify');
      setMessage('A verification code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginWithOTP(email, otpCode);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetOTPRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { requestOTP } = await import('../services/api');
      await requestOTP({ email, purpose: 'reset' });
      setResetStep('verify');
      setMessage('A password reset code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
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
      const payload = { email, new_password: newPassword };
      if (resetMethod === 'dob') {
        payload.dob = dob;
      } else {
        payload.otp_code = otpCode;
      }
      await API.post('/accounts/reset-password/', payload);
      setMessage('Password reset successfully! You can now log in.');
      setMode('password');
      resetState();
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
    setOtpCode('');
    setResetStep('request');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground />

      {/* Navigation */}
      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 4px 15px rgba(226, 85, 131, 0.25)' }}>
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
              {mode === 'reset' ? 'Reset Password' : 'Welcome Back'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0, fontWeight: 500 }}>
              {mode === 'reset' ? 'Enter your email and Date of Birth to reset your password' : 'Sign in to continue your learning journey'}
            </p>
          </div>
          
          {mode !== 'reset' && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '12px' }}>
              <button type="button" onClick={() => { setMode('password'); setStep('request'); resetState(); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: mode === 'password' ? 'var(--accent-pink)' : 'transparent', color: mode === 'password' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Password</button>
              <button type="button" onClick={() => { setMode('otp'); setStep('request'); resetState(); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: mode === 'otp' ? 'var(--accent-teal)' : 'transparent', color: mode === 'otp' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Email Code</button>
            </div>
          )}

          {/* Standard Password Login */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <input type="email" placeholder="Email Address" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" style={{ padding: '16px 24px', fontSize: 15, background: 'transparent' }} />
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" style={{ padding: '16px 24px', fontSize: 15, background: 'transparent', paddingRight: '60px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              
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

          {/* OTP Login */}
          {mode === 'otp' && (
            <form onSubmit={step === 'request' ? handleOTPRequest : handleOTPLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {step === 'request' ? (
                <input type="email" placeholder="Email Address" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" style={{ padding: '16px 24px', fontSize: 15, background: 'transparent' }} />
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                      We sent a 6-digit code to <strong>{email}</strong>
                    </p>
                  </div>
                  <input type="text" placeholder="Code" className="input-field" value={otpCode} onChange={e => setOtpCode(e.target.value)} required maxLength={6} style={{ padding: '16px 24px', fontSize: 24, letterSpacing: '12px', textAlign: 'center', background: 'transparent', fontFamily: 'monospace', fontWeight: 'bold' }} />
                  <button type="button" onClick={() => setStep('request')} style={{ background: 'none', border: 'none', color: 'var(--accent-orange)', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                    Wrong email? Go back
                  </button>
                </>
              )}

              {error && <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{error}</div>}
              {message && <div style={{ color: 'var(--accent-teal)', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{message}</div>}
              
              <button type="submit" className="btn-primary card-teal" disabled={loading} style={{ padding: '18px', fontSize: 18, border: 'none' }}>
                {loading ? 'Processing...' : (step === 'request' ? 'Send Code' : 'Sign In')}
              </button>

            </form>
          )}

          {/* Reset Password */}
          {mode === 'reset' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '12px' }}>
                <button type="button" onClick={() => { setResetMethod('dob'); setResetStep('request'); resetState(); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: resetMethod === 'dob' ? 'var(--accent-pink)' : 'transparent', color: resetMethod === 'dob' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Date of Birth</button>
                <button type="button" onClick={() => { setResetMethod('otp'); setResetStep('request'); resetState(); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: resetMethod === 'otp' ? 'var(--accent-teal)' : 'transparent', color: resetMethod === 'otp' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Email Code</button>
              </div>

              {resetMethod === 'dob' || (resetMethod === 'otp' && resetStep === 'verify') ? (
                <form onSubmit={verifyOTPReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {resetMethod === 'dob' ? (
                    <>
                      <input type="email" placeholder="Email Address" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" style={{ padding: '16px 24px', fontSize: 15, background: 'transparent' }} />
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, textAlign: 'left', paddingLeft: '4px' }}>Date of Birth</label>
                        <input type="date" className="input-field" value={dob} onChange={e => setDob(e.target.value)} onClick={(e) => { if(e.target.showPicker) e.target.showPicker(); }} required aria-label="Date of Birth" style={{ padding: '16px 24px', fontSize: 15, background: 'transparent', width: '100%', cursor: 'pointer' }} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                          We sent a 6-digit code to <strong>{email}</strong>
                        </p>
                      </div>
                      <input type="text" placeholder="Code" className="input-field" value={otpCode} onChange={e => setOtpCode(e.target.value)} required maxLength={6} style={{ padding: '16px 24px', fontSize: 24, letterSpacing: '12px', textAlign: 'center', background: 'transparent', fontFamily: 'monospace', fontWeight: 'bold' }} />
                      <button type="button" onClick={() => setResetStep('request')} style={{ background: 'none', border: 'none', color: 'var(--accent-orange)', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                        Wrong email? Go back
                      </button>
                    </>
                  )}

                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} placeholder="New Password" className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} required autoComplete="new-password" minLength={8} style={{ padding: '16px 24px', fontSize: 15, background: 'transparent', paddingRight: '60px' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} placeholder="Confirm Password" className="input-field" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password" minLength={8} style={{ padding: '16px 24px', fontSize: 15, background: 'transparent', paddingRight: '60px' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  
                  {error && <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{error}</div>}
                  {message && <div style={{ color: 'var(--accent-teal)', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{message}</div>}

                  <button type="submit" className="btn-primary card-teal" disabled={loading} style={{ padding: '18px', fontSize: 18, border: 'none' }}>
                    {loading ? 'Processing...' : 'Reset Password'}
                  </button>

                  <button type="button" onClick={() => { setMode('password'); resetState(); }} className="btn-secondary" style={{ padding: '16px', fontSize: 16, border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Cancel
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetOTPRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <input type="email" placeholder="Email Address" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" style={{ padding: '16px 24px', fontSize: 15, background: 'transparent' }} />
                  
                  {error && <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{error}</div>}
                  {message && <div style={{ color: 'var(--accent-teal)', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{message}</div>}
                  
                  <button type="submit" className="btn-primary card-teal" disabled={loading} style={{ padding: '18px', fontSize: 18, border: 'none' }}>
                    {loading ? 'Processing...' : 'Send Code'}
                  </button>

                  <button type="button" onClick={() => { setMode('password'); resetState(); }} className="btn-secondary" style={{ padding: '16px', fontSize: 16, border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Cancel
                  </button>
                </form>
              )}
            </div>
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
