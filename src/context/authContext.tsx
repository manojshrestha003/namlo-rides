import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserRole } from '../types';

interface AuthContextType {
  isLoggedIn: boolean;
  role: UserRole;
  login: (email: string, password: string) => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'namlo_auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  // Read persisted auth from localStorage on first load
  const getSaved = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const saved = getSaved();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(saved?.isLoggedIn ?? false);
  const [role, setRole] = useState<UserRole>(saved?.role ?? 'rider');

  // Sync to localStorage whenever auth state changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ isLoggedIn, role })
    );
  }, [isLoggedIn, role]);

  const login = (email: string, password: string): boolean => {
    if (email === 'intern@namlotech.com' && password === 'namlo2026') {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setRole('rider');
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchRole = (r: UserRole) => setRole(r);

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};