import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { profileApi } from '../api/profile';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { NotificationBell } from './NotificationBell';
import { Button } from './ui/button';
import { LayoutGrid, Fish, MapPin, BarChart3, Download, ShieldCheck, LogOut, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const mainLinks = [
  { to: '/feed', label: 'Feed', icon: LayoutGrid },
  { to: '/catches', label: 'My Catches', icon: Fish },
  { to: '/locations', label: 'Locations', icon: MapPin },
  { to: '/analytics', label: 'Stats', icon: BarChart3 },
  { to: '/export', label: 'Export', icon: Download },
];

const STORAGE_KEY = 'castjournal:sidebar-collapsed';

export function Sidebar() {
  const { user, logout } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === '1');

  useEffect(() => {
    let cancelled = false;
    profileApi.getMine()
      .then((p) => { if (!cancelled) setAvatarUrl(p.avatarUrl ?? null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  const isAdmin = user?.roles.includes('Admin');

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-5 px-2 py-2 text-sm transition-colors rounded-md',
      collapsed && 'justify-center px-0',
      isActive ? 'bg-accent/15 text-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    );

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-card py-4 transition-[width] duration-200',
        collapsed ? 'w-16 px-2' : 'w-60 px-3'
      )}
    >
      <Link
        to="/"
        className={cn('wordmark mb-8 flex items-center gap-2.5 px-2 text-2xl', collapsed && 'justify-center px-0')}
        title="CastJournal"
      >
        <img src="/logo-icon.svg" alt="" className="h-10 w-auto shrink-0" />
        {!collapsed && 'CastJournal'}
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {!collapsed && <p className="px-2 pb-1 text-xs tracking-widest text-muted-foreground uppercase">Main</p>}
        {mainLinks.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass} title={collapsed ? label : undefined}>
            <Icon className="size-4.5 shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            {!collapsed && <p className="px-2 pt-4 pb-1 text-xs tracking-widest text-muted-foreground uppercase">Admin</p>}
            <NavLink to="/admin" className={linkClass} title={collapsed ? 'Admin' : undefined}>
              <ShieldCheck className="size-4.5 shrink-0" />
              {!collapsed && 'Admin'}
            </NavLink>
          </>
        )}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className={cn(
          'mb-2 flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
          collapsed && 'justify-center px-0'
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronsRight className="size-4.5 shrink-0" /> : <ChevronsLeft className="size-4.5 shrink-0" />}
        {!collapsed && 'Collapse'}
      </button>

      <div className={cn('flex items-center gap-2 border-t border-border pt-3', collapsed && 'flex-col')}>
        <Link to="/profile" className={cn('flex min-w-0 flex-1 items-center gap-2', collapsed && 'flex-none')}>
          {avatarUrl ? (
            <img src={resolveMediaUrl(avatarUrl)} alt="" className="size-8 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="size-8 shrink-0 rounded-full bg-muted" />
          )}
          {!collapsed && <span className="truncate text-sm">{user?.fullName}</span>}
        </Link>
        {!collapsed && <NotificationBell />}
        <Button variant="ghost" size="icon-sm" onClick={logout} aria-label="Log out">
          <LogOut className="size-4" />
        </Button>
      </div>
    </aside>
  );
}
