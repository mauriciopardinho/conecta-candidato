import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('cc_user');
    return raw ? JSON.parse(raw) : null;
  });

  async function login(identifier, password) {
    const { data } = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('cc_token', data.token);
    localStorage.setItem('cc_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
