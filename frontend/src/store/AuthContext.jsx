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
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
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
    const profile = await getProfile();
    setUser(profile.data);
  };

  const register = async (username, email, password) => {
    await registerAPI({ username, email, password });
    await login(email, password);
  };

  const loginWithGoogle = async (googleToken) => {
    const res = await axios.post('http://127.0.0.1:8008/api/accounts/google/', {
      token: googleToken
    });
    localStorage.setItem('token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, loading, setToken, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);