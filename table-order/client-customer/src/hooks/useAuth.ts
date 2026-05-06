import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../api/client';
import React from 'react';

interface AuthState {
  token: string | null;
  tableId: number | null;
  sessionId: string | null;
  storeId: string | null;
}

interface AuthContextType extends AuthState {
  isLoggedIn: boolean;
  login: (storeId: string, tableNumber: number, password: string) => Promise<boolean>;
  logout: () => void;
  updateSessionId: (sessionId: string) => void;
}

const STORAGE_KEY = 'table-order-auth';

function loadAuth(): AuthState {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return { token: null, tableId: null, sessionId: null, storeId: null };
  try {
    return JSON.parse(stored);
  } catch {
    return { token: null, tableId: null, sessionId: null, storeId: null };
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadAuth);

  useEffect(() => {
    if (auth.token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  const login = useCallback(async (storeId: string, tableNumber: number, password: string): Promise<boolean> => {
    try {
      const result = await api.tableLogin(storeId, tableNumber, password);
      setAuth({
        token: result.token,
        tableId: result.tableId,
        sessionId: result.sessionId,
        storeId,
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setAuth({ token: null, tableId: null, sessionId: null, storeId: null });
  }, []);

  const updateSessionId = useCallback((newSessionId: string) => {
    setAuth(prev => ({ ...prev, sessionId: newSessionId }));
  }, []);

  const value: AuthContextType = {
    ...auth,
    isLoggedIn: !!auth.token,
    login,
    logout,
    updateSessionId,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
