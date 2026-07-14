import { api } from './client';
import type { Notification, NotificationFilter } from '../types/notification';
import type { PagedResult } from '../types/catch';

function toQueryString(filter: object): string {
  const params = new URLSearchParams();
  Object.entries(filter as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

export const notificationsApi = {
  getAll: (filter: NotificationFilter) =>
    api.get<PagedResult<Notification>>(`/notifications?${toQueryString(filter)}`),

  getUnreadCount: () => api.get<{ unreadCount: number }>('/notifications/unread-count'),

  markAsRead: (id: string) => api.patch<void>(`/notifications/${id}/read`),

  markAllAsRead: () => api.patch<void>('/notifications/read-all'),
};