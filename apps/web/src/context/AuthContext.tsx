import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthContextShape, AuthState, User } from '../types';

const STORAGE_KEY = 'ai-studio-auth';

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

const readStoredAuth = (): AuthState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { token: null, user: null };
    }
    const parsed = JSON.parse(raw) as AuthState;
    return parsed;
  } catch {
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [{ token, user }, setAuth] = useState<AuthState>(() => {
    if (typeof window === 'undefined') {
      return { token: null, user: null };
    }
    return readStoredAuth();
  });

  useEffect(() => {
    if (token && user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [token, user]);

  const login = (newToken: string, newUser: User) => {
    setAuth({ token: newToken, user: newUser });
  };

  const logout = () => {
    setAuth({ token: null, user: null });
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('AuthContext accessed outside provider');
  }
  return context;
};

