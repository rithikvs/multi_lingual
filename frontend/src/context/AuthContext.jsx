import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const persistAuth = useCallback((nextToken, nextUser) => {
    localStorage.setItem('token', nextToken);
    localStorage.setItem('user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.success) {
      persistAuth(response.data.token, response.data.user);
    }
    return response.data;
  }, [persistAuth]);

  const register = useCallback(async (payload) => {
    const response = await api.post('/api/auth/register', payload);
    if (response.data.success) {
      persistAuth(response.data.token, response.data.user);
    }
    return response.data;
  }, [persistAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout
    }),
    [token, user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
