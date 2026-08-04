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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  const { registerWithOTP } = useAuth();
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
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { requestOTP: reqOTP } = await import('../services/api');
      await reqOTP({ email, purpose: 'register' });
      setStep('verify');
      setMessage('A verification code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerWithOTP(username, email, password, dob, otpCode);
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
                  <input type="date" className="input-field" value={dob} onChange={e => setDob(e.target.value)} onClick={(e) => { if(e.target.showPicker) e.target.showPicker(); }} required aria-label="Date of Birth" title="Date of Birth (Required for password recovery)" style={{ padding: '16px 24px', fontSize: 15, background: 'transparent', width: '100%', cursor: 'pointer' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" minLength={8} style={{ padding: '16px 24px', fontSize: 15, background: 'transparent', paddingRight: '60px' }} />
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
              </>
            )}

            {step === 'verify' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    We sent a 6-digit code to <strong>{email}</strong>
                  </p>
                </div>
                <input type="text" placeholder="Code" className="input-field" value={otpCode} onChange={e => setOtpCode(e.target.value)} required maxLength={6} style={{ padding: '16px 24px', fontSize: 24, letterSpacing: '12px', textAlign: 'center', background: 'transparent', fontFamily: 'monospace', fontWeight: 'bold' }} />
                <button type="button" onClick={() => setStep('request')} style={{ background: 'none', border: 'none', color: 'var(--accent-teal)', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  Wrong email? Go back
                </button>
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
