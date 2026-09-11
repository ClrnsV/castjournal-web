const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

let getToken: () => string | null = () => null;
export function setTokenGetter(fn: () => string | null) {
  getToken = fn;
}

let getRefreshToken: () => string | null = () => null;
export function setRefreshTokenGetter(fn: () => string | null) {
  getRefreshToken = fn;
}

// Called after a successful silent refresh so AuthContext can persist
// the new pair and update its state — client.ts doesn't own storage.
let onTokenRefreshed: ((token: string, refreshToken: string) => void) | null = null;
export function setTokenRefreshedHandler(handler: (token: string, refreshToken: string) => void) {
  onTokenRefreshed = handler;
}

interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

// Endpoints where a 401 means "this specific request failed" (bad credentials,
// dead refresh token) rather than "your session died" — so skip the refresh
// dance and never trigger the global sign-out flow for these.
const NO_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/google'];
// Some endpoints (e.g. AuthController's `Unauthorized("...")` returns) send a
// bare JSON string, not `{ title: "..." }` — handle both shapes so messages
// like "This account has been deactivated" actually reach the UI instead of
// silently falling back to a generic one.
async function parseErrorMessage(response: Response, fallback: string): Promise<{ message: string; details: unknown }> {
  const body = await response.json().catch(() => null);

  if (typeof body === 'string') return { message: body, details: body };

  const message =
    body?.title ??
    (body?.errors ? Object.values(body.errors).flat().join(' ') : null) ??
    fallback;

  return { message, details: body };
}

// Coalesces concurrent 401s into a single refresh call instead of firing
// one per in-flight request.
let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!response.ok) return null;
        const data = await response.json();
        onTokenRefreshed?.(data.token, data.refreshToken);
        return data.token as string;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const isNoRefreshPath = NO_REFRESH_PATHS.includes(path);

    if (!isRetry && !isNoRefreshPath) {
      const newToken = await tryRefreshToken();
      if (newToken) return request<T>(path, options, true);
    }

    if (isNoRefreshPath) {
      const { message, details } = await parseErrorMessage(response, 'Invalid email or password.');
      throw { status: 401, message, details } as ApiError;
    }

    onUnauthorized?.();
    throw { status: 401, message: 'Session expired. Please log in again.' } as ApiError;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');

  if (!response.ok) {
    const { message, details } = isJson
      ? await parseErrorMessage(response, 'Something went wrong.')
      : { message: await response.text().catch(() => 'Something went wrong.'), details: null };
    throw { status: response.status, message, details } as ApiError;
  }

  const body = isJson ? await response.json() : await response.text();
  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: data ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export async function uploadFile<T>(path: string, formData: FormData, isRetry = false): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (response.status === 401) {
    if (!isRetry) {
      const newToken = await tryRefreshToken();
      if (newToken) return uploadFile<T>(path, formData, true);
    }
    onUnauthorized?.();
    throw { status: 401, message: 'Session expired.' } as ApiError;
  }

  if (!response.ok) {
    const { message, details } = await parseErrorMessage(response, 'Upload failed.');
    throw { status: response.status, message, details } as ApiError;
  }

  return response.status === 204 ? (undefined as T) : response.json();
}

export async function downloadFile(path: string, isRetry = false): Promise<{ blob: Blob; fileName: string }> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 401) {
    if (!isRetry) {
      const newToken = await tryRefreshToken();
      if (newToken) return downloadFile(path, true);
    }
    onUnauthorized?.();
    throw { status: 401, message: 'Session expired.' } as ApiError;
  }

  if (!response.ok) {
    const { message, details } = await parseErrorMessage(response, 'Export failed.');
    throw { status: response.status, message, details } as ApiError;
  }

  const disposition = response.headers.get('content-disposition');
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const fileName = match?.[1] ?? 'export';

  const blob = await response.blob();
  return { blob, fileName };
}