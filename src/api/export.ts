import { downloadFile } from './client';
import type { ExportRequest } from '../types/export';

function toQueryString(filter: object): string {
  const params = new URLSearchParams();
  Object.entries(filter as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

export const exportApi = {
  exportCatches: (request: ExportRequest) => downloadFile(`/export/catches?${toQueryString(request)}`),
};