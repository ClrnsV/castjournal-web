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
  const isAuthEndpoint = path === '/auth/login' || path === '/auth/register';
  if (!isRetry && !isAuthEndpoint) {
    const newToken = await tryRefreshToken();
    if (newToken) return request<T>(path, options, true);
  }
  if (isAuthEndpoint) {
    const body = await response.json().catch(() => null);
    throw { status: 401, message: body?.title ?? 'Invalid email or password.', details: body } as ApiError;
  }
  onUnauthorized?.();
  throw { status: 401, message: 'Session expired. Please log in again.' } as ApiError;
}

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      body?.title ??
      (body?.errors ? Object.values(body.errors).flat().join(' ') : null) ??
      'Something went wrong.';
    const error: ApiError = { status: response.status, message, details: body };
    throw error;
  }

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
    const body = await response.json().catch(() => null);
    throw { status: response.status, message: body?.title ?? 'Upload failed.', details: body } as ApiError;
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
    throw { status: response.status, message: 'Export failed.' } as ApiError;
  }

  const disposition = response.headers.get('content-disposition');
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const fileName = match?.[1] ?? 'export';

  const blob = await response.blob();
  return { blob, fileName };
}