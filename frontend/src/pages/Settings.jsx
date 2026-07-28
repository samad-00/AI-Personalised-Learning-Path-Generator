import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { getProfile, updateProfile } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    skills: '',
    career: '',
    dob: '',
    gender: ''
  });

  const formatDob = (val) => {
    if (!val || val === 'null' || val === 'undefined') return '';
    const str = String(val).trim();
    return str.includes('T') ? str.split('T')[0] : str.split(' ')[0];
  };

  useEffect(() => {
    getProfile().then(res => {
      setFormData({
        username: res.data.username || '',
        email: res.data.email || '',
        password: '',
        skills: res.data.skills || '',
        career: res.data.career || '',
        dob: formatDob(res.data.dob),
        gender: res.data.gender || ''
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setIsError(false);
    
    // Clean up payload before sending
    const payload = { ...formData };
    if (!payload.password) delete payload.password;
    if (!payload.dob || payload.dob === '' || payload.dob === 'null') {
      payload.dob = null;
    } else {
      payload.dob = formatDob(payload.dob);
    }

    try {
      const res = await updateProfile(payload);
      if (res && res.data) {
        setFormData({
          username: res.data.username || '',
          email: res.data.email || '',
          password: '',
          skills: res.data.skills || '',
          career: res.data.career || '',
          dob: formatDob(res.data.dob),
          gender: res.data.gender || ''
        });
      }
      setIsError(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setIsError(true);
      const errorData = err.response?.data;
      let errorMsg = 'Failed to update profile';
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMsg = errorData;
        } else if (errorData.error) {
          errorMsg = errorData.error;
        } else if (typeof errorData === 'object') {
          const messages = Object.entries(errorData).map(([key, val]) => {
            const field = key.charAt(0).toUpperCase() + key.slice(1);
            const msg = Array.isArray(val) ? val.join(' ') : val;
            return `${field}: ${msg}`;
          });
          if (messages.length > 0) errorMsg = messages.join(' | ');
        }
      }
      setMessage(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
      Loading settings...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      <AnimatedBackground />

      {/* Top Navbar */}
      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              📖
            </div>
            <span style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>LearnPath</span>
          </div>
          
          <div style={{ display: 'flex', gap: 24, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            <span style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => navigate('/dashboard')}>Home</span>
            <span style={{ color: 'var(--accent-pink)' }}>Settings</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <ThemeToggle />
          <button 
            title="Logout" 
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-primary)',
              width: 36, 
              height: 36, 
              borderRadius: 8, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: 18,
              transition: 'all 0.2s ease'
            }} 
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-color)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            onClick={logout}
          >
            🚪
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, maxWidth: 800, margin: '0 auto', width: '100%', padding: '2rem', position: 'relative', zIndex: 10 }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Account Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0 }}>Update your profile information and career goals.</p>
        </div>

        {message && (
          <div 
            className={`bento-card ${isError ? '' : 'card-teal'}`} 
            style={{ 
              padding: '1rem 1.5rem', 
              marginBottom: '2rem', 
              fontWeight: 700, 
              backgroundColor: isError ? 'rgba(239, 68, 68, 0.15)' : undefined,
              borderColor: isError ? '#ef4444' : 'var(--accent-teal)',
              borderWidth: '2px',
              color: isError ? '#ef4444' : 'var(--bg-color)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12 
            }}
          >
            <span style={{ fontSize: 20 }}>{isError ? '⚠️' : '✓'}</span> {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Account Info */}
          <div className="bento-card" style={{ padding: '2rem', backgroundColor: 'var(--bg-color)', borderColor: 'var(--accent-teal)', borderWidth: '2px' }}>
            <h2 style={{ fontSize: 20, margin: '0 0 1.5rem', color: 'var(--text-primary)' }}>Basic Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--accent-teal)', fontWeight: 700 }}>Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" className="input-field" style={{ borderRadius: 12, borderColor: 'var(--accent-teal)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--accent-teal)', fontWeight: 700 }}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="input-field" style={{ borderRadius: 12, borderColor: 'var(--accent-teal)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--accent-teal)', fontWeight: 700 }}>New Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current password" className="input-field" style={{ borderRadius: 12, borderColor: 'var(--accent-teal)' }} />
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="bento-card" style={{ padding: '2rem', backgroundColor: 'var(--bg-color)', borderColor: 'var(--accent-teal)', borderWidth: '2px' }}>
            <h2 style={{ fontSize: 20, margin: '0 0 1.5rem', color: 'var(--text-primary)' }}>Personal Details</h2>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--accent-teal)', fontWeight: 700 }}>Date of Birth</label>
                <input 
                  type="date" 
                  name="dob" 
                  value={formData.dob || ''} 
                  onChange={handleChange} 
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="input-field" 
                  style={{ borderRadius: 12, width: '100%', boxSizing: 'border-box', borderColor: 'var(--accent-teal)', cursor: 'pointer' }} 
                />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--accent-teal)', fontWeight: 700 }}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="input-field" style={{ borderRadius: 12, width: '100%', boxSizing: 'border-box', appearance: 'none', cursor: 'pointer', borderColor: 'var(--accent-teal)' }}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bento-card" style={{ padding: '2rem', backgroundColor: 'var(--bg-color)', borderColor: 'var(--accent-teal)', borderWidth: '2px' }}>
            <h2 style={{ fontSize: 20, margin: '0 0 1.5rem', color: 'var(--text-primary)' }}>Professional Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--accent-teal)', fontWeight: 700 }}>Career Goal</label>
                <input type="text" name="career" value={formData.career} onChange={handleChange} placeholder="e.g. Senior Frontend Developer" className="input-field" style={{ borderRadius: 12, borderColor: 'var(--accent-teal)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--accent-teal)', fontWeight: 700 }}>Skills</label>
                <textarea name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. React, Python, UI/UX (comma separated)" className="input-field" rows="3" style={{ borderRadius: 12, resize: 'vertical', borderColor: 'var(--accent-teal)' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '16px 32px', fontSize: 16, backgroundColor: 'var(--accent-teal)', color: 'white', border: 'none' }}>
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
