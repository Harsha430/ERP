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

const API_BASE = 'http://localhost:8081';

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
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
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
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      if (!res.ok) return false;

      // Directly fetch current user to avoid state race
      const meRes = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
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
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {/* ignore */}
    setUser(null);
    localStorage.removeItem('erp_user');
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