import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => sessionStorage.getItem('elite_token'));
  const [loading, setLoading] = useState(true);

  // Fetch the current user from /api/auth/me using the stored token
  const fetchUser = useCallback(async (authToken) => {
    if (!authToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('http://localhost:5001/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // Token is invalid or expired — clear storage
        sessionStorage.removeItem('elite_token');
        sessionStorage.removeItem('elite_user');
        setToken(null);
        setUser(null);
      }
    } catch {
      // Network error — fall back to cached user if available
      const cached = sessionStorage.getItem('elite_user');
      if (cached) {
        try { setUser(JSON.parse(cached)); } catch { setUser(null); }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser(token);
  }, [token, fetchUser]);

  const login = (authToken, userData) => {
    sessionStorage.setItem('elite_token', authToken);
    sessionStorage.setItem('elite_user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('elite_token');
    sessionStorage.removeItem('elite_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
