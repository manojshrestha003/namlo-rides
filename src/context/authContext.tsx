
import {createContext, useContext, useState} from 'react';
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole>('rider');

  const login = (email: string, password: string): boolean => {
    if (email === 'intern@namlotech.com' && password === 'namlo2026') {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsLoggedIn(false);
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
