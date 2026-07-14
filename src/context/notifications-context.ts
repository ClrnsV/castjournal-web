import { createContext } from 'react';

export interface NotificationsContextValue {
  unreadCount: number;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);