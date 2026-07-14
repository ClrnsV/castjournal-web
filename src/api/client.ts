const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Set once by AuthContext on mount — avoids a circular import between
// the plain-JS api client and the React auth context.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

let getToken: () => string | null = () => null;
export function setTokenGetter(fn: () => string | null) {
  getToken = fn;
}

interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
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
    onUnauthorized?.();
    const error: ApiError = { status: 401, message: 'Session expired. Please log in again.' };
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    // Matches your ExceptionHandlingMiddleware's { title, status } shape,
    // and ASP.NET's default { errors: {...} } validation shape.
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
// For file uploads (media, avatar) — multipart, no Content-Type header
// (the browser sets the correct boundary automatically).
export async function uploadFile<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (response.status === 401) {
    onUnauthorized?.();
    throw { status: 401, message: 'Session expired.' } as ApiError;
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw { status: response.status, message: body?.title ?? 'Upload failed.', details: body } as ApiError;
  }

  return response.status === 204 ? (undefined as T) : response.json();
}

export async function downloadFile(path: string): Promise<{ blob: Blob; fileName: string }> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 401) {
    onUnauthorized?.();
    throw { status: 401, message: 'Session expired.' } as ApiError;
  }

  if (!response.ok) {
    throw { status: response.status, message: 'Export failed.' } as ApiError;
  }

  // Extract filename from Content-Disposition if present, e.g. attachment; filename="x.csv"
  const disposition = response.headers.get('content-disposition');
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const fileName = match?.[1] ?? 'export';

  const blob = await response.blob();
  return { blob, fileName };
}