import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, NotificationCounts } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  notifications: NotificationCounts;
  login: (email: string, pass: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  demoLogin: (email: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationCounts>({
    totalNotifications: 0,
    pendingRequestsCount: 0,
    unreadMessagesCount: 0,
    possibleMatchCount: 0,
  });

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const counts = await api.stats.getNotifications();
      setNotifications(counts);
    } catch {
      // Ignore background notification failure
    }
  }, [user]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.auth.me();
      setUser(res.user);
    } catch {
      setUser(null);
      api.clearToken();
    }
  }, []);

  // Check initial session
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const res = await api.auth.me();
        setUser(res.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('campusconnect:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('campusconnect:unauthorized', handleUnauthorized);
  }, []);

  // Poll notifications when user is logged in
  useEffect(() => {
    if (!user) return;
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 10000);
    return () => clearInterval(interval);
  }, [user, refreshNotifications]);

  const login = async (email: string, pass: string) => {
    const res = await api.auth.login({ email, password: pass });
    api.setToken(res.token);
    setUser(res.user);
    refreshNotifications();
  };

  const signup = async (data: any) => {
    const res = await api.auth.signup(data);
    api.setToken(res.token);
    setUser(res.user);
    refreshNotifications();
  };

  const demoLogin = async (email: string) => {
    const res = await api.auth.demoLogin(email);
    api.setToken(res.token);
    setUser(res.user);
    refreshNotifications();
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    setNotifications({
      totalNotifications: 0,
      pendingRequestsCount: 0,
      unreadMessagesCount: 0,
      possibleMatchCount: 0,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        notifications,
        login,
        signup,
        demoLogin,
        logout,
        refreshUser,
        refreshNotifications,
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
