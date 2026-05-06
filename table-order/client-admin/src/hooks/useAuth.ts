import { useState, useCallback, useEffect } from 'react';
import { loginAdmin } from '../api/client';

interface AuthState {
  token: string;
  storeId: string;
}

const STORAGE_KEY = 'admin-auth';

export function useAuth() {
  const [auth, setAuth] = useState<AuthState | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (auth?.token) {
      try {
        const payload = JSON.parse(atob(auth.token.split('.')[1]));
        const expMs = payload.exp * 1000;
        if (Date.now() >= expMs) {
          localStorage.removeItem(STORAGE_KEY);
          setAuth(null);
        }
      } catch {
        // invalid token format
      }
    }
  }, [auth]);

  const login = useCallback(
    async (storeId: string, username: string, password: string): Promise<boolean> => {
      try {
        const result = await loginAdmin(storeId, username, password);
        const state: AuthState = { token: result.token, storeId };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setAuth(state);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }, []);

  return {
    token: auth?.token ?? null,
    storeId: auth?.storeId ?? null,
    isLoggedIn: auth !== null,
    login,
    logout,
  };
}
