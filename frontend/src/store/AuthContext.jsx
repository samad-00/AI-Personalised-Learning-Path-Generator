import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginAPI, register as registerAPI, getProfile } from '../services/api';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getProfile()
        .then(res => {
          setUser(res.data);
          localStorage.setItem('cached_user', JSON.stringify(res.data));
        })
        .catch((err) => {
          // Only wipe token if server explicitly says it's invalid (401/403)
          // If it's a network error (server down/restarting), keep the token
          const status = err?.response?.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
          } else {
            // Network error — server might be restarting. Keep user logged in.
            // Try to restore from a minimal cached user object if available
            const cached = localStorage.getItem('cached_user');
            if (cached) {
              try { setUser(JSON.parse(cached)); } catch (_) {}
            }
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);


  const setToken = (token) => {
    localStorage.setItem('token', token);
  };

  const login = async (email, password) => {
    const res = await loginAPI({ email, password });
    localStorage.setItem('token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    // Try to fetch profile but don't fail login if it errors
    try {
      const profile = await getProfile();
      setUser(profile.data);
      localStorage.setItem('cached_user', JSON.stringify(profile.data));
    } catch (profileErr) {
      // Token is valid, profile fetch just had a network hiccup
      // Set a minimal user object so the app knows we're logged in
      const minimal = { email, username: email.split('@')[0] };
      setUser(minimal);
      localStorage.setItem('cached_user', JSON.stringify(minimal));
    }
  };

  const register = async (username, email, password) => {
    await registerAPI({ username, email, password });
    await login(email, password);
  };

  const loginWithGoogle = async (googleToken) => {
    const res = await axios.post('http://127.0.0.1:8010/api/accounts/google/', {
      token: googleToken
    });
    localStorage.setItem('token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('cached_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, loading, setToken, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);