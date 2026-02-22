import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'hr' | 'finance' | 'admin';

interface User {
  username: string;
  roles: UserRole[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string, expectedRole?: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8081').replace(/\/$/, "");



function mapAuthorities(authorities: string[]): UserRole[] {
  return authorities
    .map(a => a.replace(/^ROLE_/i, '').toLowerCase())
    .filter(a => ['admin','hr','finance'].includes(a)) as UserRole[];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = async () => {
    try {
      const token = localStorage.getItem('erp_token');
      const res = await fetch(`${API_BASE}/auth/me`, { 
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.authenticated) {
        const roles = mapAuthorities(Array.from(data.roles || []));
        const u: User = { username: data.username, roles };
        setUser(u);
        localStorage.setItem('erp_user', JSON.stringify(u));
      } else {
        setUser(null);
        localStorage.removeItem('erp_user');
        localStorage.removeItem('erp_token');
      }
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem('erp_user');
    if (cached) {
      try { setUser(JSON.parse(cached)); } catch { /* ignore */ }
    }
    refresh();
  }, []);

  const login = async (identifier: string, password: string, expectedRole?: UserRole): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      if (!res.ok) return false;
      const loginData = await res.json();
      if (!loginData.success || !loginData.token) return false;

      // Store token
      localStorage.setItem('erp_token', loginData.token);

      // Directly fetch current user to avoid state race
      const meRes = await fetch(`${API_BASE}/auth/me`, { 
        headers: { 'Authorization': `Bearer ${loginData.token}` } 
      });
      if (!meRes.ok) return false;
      const me = await meRes.json();
      if (!me.authenticated) return false;
      const roles = mapAuthorities(Array.from(me.roles || []));
      const current: User = { username: me.username, roles };
      setUser(current);
      localStorage.setItem('erp_user', JSON.stringify(current));

      if (expectedRole && !roles.includes(expectedRole)) {
        await logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, refresh }}>
      {loaded && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}