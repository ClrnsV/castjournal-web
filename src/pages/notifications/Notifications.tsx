import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { notificationsApi } from '../../api/notifications';
import type { Notification } from '../../types/notification';
import { CastDivider } from '../../components/CastDivider';
import { useNotifications } from '../../context/useNotifications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function resolveTarget(n: Notification): string | null {
  if (!n.relatedEntityType || !n.relatedEntityId) return null;

  switch (n.relatedEntityType) {
    case 'Catch':
      return `/catches/${n.relatedEntityId}`;
    case 'User':
      return `/anglers/${n.relatedEntityId}`;
    default:
      return null;
  }
}

export function Notifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      try {
        const res = await notificationsApi.getAll({ page: 1, pageSize: 50 });
        if (!cancelled) setItems(res.items);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, []);

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      setItems((prev) => prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)));
      await markAsRead(n.id);
    }

    const target = resolveTarget(n);
    if (target) navigate(target);
  };

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllAsRead();
  };

  const hasUnread = items.some((n) => !n.isRead);

  return (
    <div>
      <div className="flex items-start justify-between">
        <div><h1 className="font-heading text-2xl">Notifications</h1><CastDivider /></div>
        {hasUnread && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {!isLoading && items.length === 0 && <p className="text-muted-foreground">No notifications yet.</p>}

      <div className="flex flex-col gap-2">
        {items.map((n) => {
          const isClickable = !!resolveTarget(n);
          return (
            <Card
              key={n.id}
              onClick={() => handleClick(n)}
              className={`cursor-${isClickable || !n.isRead ? 'pointer' : 'default'} ${n.isRead ? '' : 'bg-primary/5'}`}
            >
              <CardContent className="flex items-center justify-between">
                <div>
                  <strong>{n.title}</strong>
                  <div className="text-sm text-muted-foreground">{n.message}</div>
                  <div
                    className="font-mono text-xs text-muted-foreground"
                    title={new Date(n.createdAt).toLocaleString()}
                  >
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </div>
                </div>
                {!n.isRead && <span className="size-2 shrink-0 rounded-full bg-primary" />}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}