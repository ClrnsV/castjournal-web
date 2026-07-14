import { createContext } from 'react';
import type { CurrentUser } from '../types/auth';

interface RegisterPayload {
  userName: string;
  email: string;
  fullName: string;
  password: string;
}

export interface AuthContextValue {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  sessionExpiredMessage: string | null;
  clearSessionExpiredMessage: () => void;
}
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);