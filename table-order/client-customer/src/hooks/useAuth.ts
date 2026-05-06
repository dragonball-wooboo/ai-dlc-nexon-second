import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

interface AuthState {
  token: string | null;
  tableId: number | null;
  sessionId: string | null;
  storeId: string | null;
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

export function useAuth() {
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

  return {
    ...auth,
    isLoggedIn: !!auth.token,
    login,
    logout,
  };
}
