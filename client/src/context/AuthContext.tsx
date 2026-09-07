import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, timezone?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('flowstate_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = () => {
    localStorage.removeItem('flowstate_token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get<{ success: boolean; user: User }>('/auth/me');
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ success: boolean; token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    if (res.success && res.token) {
      localStorage.setItem('flowstate_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const register = async (name: string, email: string, password: string, timezone?: string) => {
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const res = await api.post<{ success: boolean; token: string; user: User }>('/auth/register', {
      name,
      email,
      password,
      timezone: tz,
    });
    if (res.success && res.token) {
      localStorage.setItem('flowstate_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
