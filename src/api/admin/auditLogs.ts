import { api } from '../client';
import type { AuditLog, AuditLogFilter } from '../../types/admin';
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

export const auditLogsApi = {
  getAll: (filter: AuditLogFilter) => api.get<PagedResult<AuditLog>>(`/auditlogs?${toQueryString(filter)}`),
};