import { api, uploadFile } from './client';
import type { Catch, CreateCatchPayload, CatchFilter, FeedFilter, PagedResult, CatchMedia } from '../types/catch';

function toQueryString(filter: object): string {
  const params = new URLSearchParams();
  Object.entries(filter as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

export const catchesApi = {
  search: (filter: CatchFilter) =>
    api.get<PagedResult<Catch>>(`/catches/search?${toQueryString(filter)}`),

  getFeed: (filter: FeedFilter) =>
    api.get<PagedResult<Catch>>(`/catches/feed?${toQueryString(filter)}`),

  getById: (id: string) => api.get<Catch>(`/catches/${id}`),
  create: (payload: CreateCatchPayload) => api.post<Catch>('/catches', payload),
  update: (id: string, payload: CreateCatchPayload) => api.put<void>(`/catches/${id}`, payload),
  remove: (id: string) => api.delete<void>(`/catches/${id}`),

  uploadMedia: (catchId: string, file: File) => {
    const formData = new FormData();
    formData.append('catchId', catchId);
    formData.append('file', file);
    return uploadFile<{ message: string }>('/media/upload', formData);
  },

  getMedia: (catchId: string) => api.get<CatchMedia[]>(`/media/catch/${catchId}`),

  like: (catchId: string) => api.post<void>(`/catches/${catchId}/like`),
  unlike: (catchId: string) => api.delete<void>(`/catches/${catchId}/like`),
};