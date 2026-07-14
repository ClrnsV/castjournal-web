import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotifications } from '../context/useNotifications';
import { Badge } from './ui/badge';

export function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <Link to="/notifications" className="relative inline-flex text-foreground">
      <Bell className="size-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2.5 h-4 min-w-4 px-1 text-[0.65rem] leading-none"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Link>
  );
}
