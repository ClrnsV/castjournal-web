import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { notificationsApi } from '../api/notifications';
import { useAuth } from './useAuth';
import { NotificationsContext } from './notifications-context';

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await notificationsApi.getUnreadCount();
      setUnreadCount(res.unreadCount);
    } catch {
      // silent — a failed poll shouldn't disrupt the rest of the app
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      if (!isAuthenticated) {
        if (!cancelled) setUnreadCount(0);
        return;
      }
      try {
        const res = await notificationsApi.getUnreadCount();
        if (!cancelled) setUnreadCount(res.unreadCount);
      } catch {
        // silent — a failed poll shouldn't disrupt the rest of the app
      }
    }

    poll();
    const interval = setInterval(poll, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (id: string) => {
    await notificationsApi.markAsRead(id);
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationsApi.markAllAsRead();
    setUnreadCount(0);
  }, []);

  return (
    <NotificationsContext.Provider value={{ unreadCount, refresh, markAsRead, markAllAsRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}