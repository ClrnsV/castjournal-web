import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  api,
  setTokenGetter,
  setRefreshTokenGetter,
  setTokenRefreshedHandler,
  setUnauthorizedHandler,
} from '../api/client';
import type { AuthResponse, CurrentUser, DecodedToken } from '../types/auth';
import { AuthContext } from './auth-context';

const TOKEN_KEY = 'castjournal_token';
const REFRESH_TOKEN_KEY = 'castjournal_refresh_token';
const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

function decodeUser(token: string): CurrentUser | null {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (decoded.exp * 1000 < Date.now()) return null;

    const rawRole = decoded[ROLE_CLAIM] ?? decoded.role;
    const roles = !rawRole ? [] : Array.isArray(rawRole) ? rawRole : [rawRole];

    return {
      id: decoded.sub,
      email: decoded.email,
      fullName: decoded.name ?? null,
      roles,
    };
  } catch {
    return null;
  }
}

function readStoredToken(): string | null {
  const stored = localStorage.getItem(TOKEN_KEY);
  if (!stored) return null;
  // Note: this only checks the access token's own exp claim. If it's
  // expired but a refresh token exists, the first API call will
  // silently refresh it — this just governs the initial render.
  if (!decodeUser(stored)) {
    return stored; // let the first request attempt a silent refresh rather than bouncing to login immediately
  }
  return stored;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readStoredToken);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  const user = useMemo(() => (token ? decodeUser(token) : null), [token]);

  const clearSession = (expired = false) => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setToken(null);
    if (expired) {
      setSessionExpiredMessage('Your session has expired. Please log in again.');
    }
  };

  setTokenGetter(() => localStorage.getItem(TOKEN_KEY));
  setRefreshTokenGetter(() => localStorage.getItem(REFRESH_TOKEN_KEY));
  setUnauthorizedHandler(() => clearSession(true));
  setTokenRefreshedHandler((newToken, newRefreshToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    setToken(newToken);
  });

  const applyAuthResponse = (res: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
    setToken(res.token);
    setSessionExpiredMessage(null);
  };

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    applyAuthResponse(res);
  };

  const register = async (payload: {
    userName: string;
    email: string;
    fullName: string;
    password: string;
  }) => {
    const res = await api.post<AuthResponse>('/auth/register', payload);
    applyAuthResponse(res);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    try {
      await api.post('/auth/logout', { refreshToken: refreshToken ?? '' });
    } catch {
      // Best effort — clear the local session regardless of whether the
      // server call succeeded (e.g. token already expired).
    }
    clearSession(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        sessionExpiredMessage,
        clearSessionExpiredMessage: () => setSessionExpiredMessage(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}