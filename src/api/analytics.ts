import { api } from './client';
import type { Analytics, AnalyticsFilter } from '../types/analytics';

function toQueryString(filter: object): string {
  const params = new URLSearchParams();
  Object.entries(filter as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

export const analyticsApi = {
  get: (filter: AnalyticsFilter) => api.get<Analytics>(`/analytics?${toQueryString(filter)}`),
};