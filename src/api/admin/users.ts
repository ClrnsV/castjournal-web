import { api } from '../client';
import type { UserSummary, CreateUserPayload, UpdateUserPayload, UserFilter } from '../../types/admin';
import type { PagedResult } from '../../types/catch';

function toQueryString(filter: object): string {
  const params = new URLSearchParams();
  Object.entries(filter as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

export const adminUsersApi = {
  getAll: (filter: UserFilter) => api.get<PagedResult<UserSummary>>(`/users?${toQueryString(filter)}`),
  getById: (id: string) => api.get<UserSummary>(`/users/${id}`),
  create: (payload: CreateUserPayload) => api.post<UserSummary>('/users', payload),
  update: (id: string, payload: UpdateUserPayload) => api.put<void>(`/users/${id}`, payload),
  deactivate: (id: string) => api.patch<void>(`/users/${id}/deactivate`),
  reactivate: (id: string) => api.patch<void>(`/users/${id}/reactivate`),
};