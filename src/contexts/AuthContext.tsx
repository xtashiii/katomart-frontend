'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, isAuthenticated, clearTokens } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Token might be invalid, clear it
          console.warn('Auth initialization failed:', error);
          clearTokens();
        }
      }
      setIsLoading(false);
      setIsInitialized(true);
    };

    if (!isInitialized) {
      initAuth();
    }

    // Listen for logout events
    const handleLogout = () => {
      setUser(null);
    };

    // Listen for storage changes (for cross-tab auth state sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        if (!e.newValue) {
          // Token was removed
          setUser(null);
        } else if (!user && e.newValue) {
          // Token was added, re-initialize auth
          initAuth();
        }
      }
    };

    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isInitialized, user]); // Add isInitialized and user as dependencies

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    window.dispatchEvent(new CustomEvent('auth:logout'));
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isLoggedIn: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
