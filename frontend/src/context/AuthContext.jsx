import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { djangoAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await djangoAPI.get('/auth/profile/');
      setUser(res.data);
    } catch {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password, rememberMe = false) => {
    const res = await djangoAPI.post('/auth/login/', { email, password, remember_me: rememberMe });
    const { tokens, user: userData } = res.data;
    // Use sessionStorage for tab isolation, fallback to localStorage if rememberMe is true
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('access_token', tokens.access);
    storage.setItem('refresh_token', tokens.refresh);
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await djangoAPI.post('/auth/register/', data);
    const { tokens, user: userData } = res.data;
    sessionStorage.setItem('access_token', tokens.access);
    sessionStorage.setItem('refresh_token', tokens.refresh);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      const refresh = sessionStorage.getItem('refresh_token') || localStorage.getItem('refresh_token');
      await djangoAPI.post('/auth/logout/', { refresh });
    } catch { /* silent */ }
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const updateUser = (data) => setUser(prev => ({ ...prev, ...data }));

  const refreshToken = async () => {
    const refresh = sessionStorage.getItem('refresh_token') || localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('No refresh token');
    const res = await djangoAPI.post('/auth/token/refresh/', { refresh });
    const storage = sessionStorage.getItem('refresh_token') ? sessionStorage : localStorage;
    storage.setItem('access_token', res.data.access);
    return res.data.access;
  };

  const googleLogin = async (token, role = 'buyer') => {
    const res = await djangoAPI.post('/auth/google/', { token, role });
    const { tokens, user: userData } = res.data;
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    setUser(userData);
    return userData;
  };

  const githubLogin = async (code, role = 'buyer') => {
    const res = await djangoAPI.post('/auth/github/', { code, role });
    const { tokens, user: userData } = res.data;
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    setUser(userData);
    return userData;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshToken, loadUser, googleLogin, githubLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
