/**
 * AuthContext.jsx — Auth state shared across the app.
 * Uses Insforge auth via insforgeApi.js (no localhost:8000 dependency).
 */
import { createContext, useContext, useState, useEffect } from 'react';
import {
  getToken, setToken, removeToken,
  getStoredUser, setStoredUser,
  refreshUser as insforgeRefreshUser,
} from '../insforgeApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(getStoredUser());
  const [token,   setTokenSt] = useState(getToken());
  const [loading, setLoading] = useState(true);

  // On mount — if we have a stored token, refresh user from Insforge
  useEffect(() => {
    const t = getToken();
    if (t) {
      insforgeRefreshUser()
        .then(u => {
          if (u) { setUser(u); setStoredUser(u); }
          else   { removeToken(); setUser(null); setTokenSt(null); }
        })
        .catch(() => { removeToken(); setUser(null); setTokenSt(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  /** Called after successful login/signup — store token + user */
  const login = (tokenStr, userData) => {
    setToken(tokenStr);
    setStoredUser(userData);
    setTokenSt(tokenStr);
    setUser(userData);
  };

  /** Logout — clear Insforge token + user */
  const logout = () => {
    removeToken();
    setTokenSt(null);
    setUser(null);
  };

  /** Refresh user data from Insforge (e.g. after payment upgrade) */
  const refreshUser = async () => {
    try {
      const u = await insforgeRefreshUser();
      if (u) { setUser(u); setStoredUser(u); }
    } catch {}
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
