import { useMemo, useState} from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { api, setTokenGetter, setUnauthorizedHandler } from '../api/client';
import type { AuthResponse, CurrentUser, DecodedToken } from '../types/auth';
import { AuthContext } from './auth-context';


const TOKEN_KEY = 'castjournal_token';
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
  if (!decodeUser(stored)) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return stored;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readStoredToken);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  const user = useMemo(() => (token ? decodeUser(token) : null), [token]);

  const clearSession = (expired = false) => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    if (expired) {
      setSessionExpiredMessage('Your session has expired. Please log in again.');
    }
  };

  // Registered directly during render, NOT inside useEffect.
  // useEffect fires bottom-up on mount (children before parents), so a
  // child like Feed that fetches data on mount could call getToken()
  // before this ever ran, sending an authless request that gets a
  // false 401. These are just plain closure reassignments with no
  // DOM/render side effects, so it's safe to call unconditionally here.
  setTokenGetter(() => localStorage.getItem(TOKEN_KEY));
  setUnauthorizedHandler(() => clearSession(true));

  const applyAuthResponse = (res: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, res.token);
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

  const logout = () => clearSession(false);

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