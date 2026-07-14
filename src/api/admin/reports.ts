import { api } from '../client';
import type { SystemReport, SystemReportFilter } from '../../types/admin';

function toQueryString(filter: object): string {
  const params = new URLSearchParams();
  Object.entries(filter as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

export const reportsApi = {
  get: (filter: SystemReportFilter) => api.get<SystemReport>(`/reports?${toQueryString(filter)}`),
};