export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string | null;
  expiration: string;
}

export interface DecodedToken {
  sub: string;
  email: string;
  name: string;
  exp: number;
  // ASP.NET Identity writes role claims using the long ClaimTypes.Role URI,
  // not a short "role" key — we check both when reading it back.
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[];
  role?: string | string[];
}

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string | null;
  roles: string[];
}