'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved tokens and user data
    const savedToken = localStorage.getItem('token');
    const savedRefreshToken = localStorage.getItem('refreshToken');
    const savedUser = localStorage.getItem('user');
    const sessionExpiry = localStorage.getItem('sessionExpiry');

    if (savedToken && savedRefreshToken && savedUser && sessionExpiry) {
      // Check if session is expired
      if (new Date(sessionExpiry).getTime() > Date.now()) {
        setToken(savedToken);
        setRefreshTokenValue(savedRefreshToken);
        setUser(JSON.parse(savedUser));
      } else {
        // Session expired, try to refresh
        refreshToken();
      }
    }
    setIsLoading(false);
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    if (!refreshTokenValue) return;

    const REFRESH_INTERVAL = 14 * 60 * 1000; // Refresh 1 minute before expiry (assuming 15 min tokens)
    const intervalId = setInterval(refreshToken, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [refreshTokenValue]);

  const refreshToken = async () => {
    if (!refreshTokenValue) return;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      setToken(data.token);
      setRefreshTokenValue(data.refreshToken);
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('sessionExpiry', new Date(Date.now() + 15 * 60 * 1000).toISOString());
    } catch (error) {
      // If refresh fails, log out the user
      logout();
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      setRefreshTokenValue(data.refreshToken);

      if (rememberMe) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('sessionExpiry', new Date(Date.now() + 15 * 60 * 1000).toISOString());
      } else {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('refreshToken', data.refreshToken);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.setItem('sessionExpiry', new Date(Date.now() + 15 * 60 * 1000).toISOString());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Password reset failed');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      await login(email, password, false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshTokenValue(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionExpiry');
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout,
      resetPassword,
      refreshToken,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 