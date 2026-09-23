import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { profileApi } from '../api/profile';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { NotificationBell } from './NotificationBell';
import { Button } from './ui/button';
import {
  LayoutGrid, Fish, MapPin, BarChart3, Download, ShieldCheck,
  LogOut, ChevronsLeft, ChevronsRight, Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainLinks = [
  { to: '/feed', label: 'Feed', icon: LayoutGrid },
  { to: '/catches', label: 'My Catches', icon: Fish },
  { to: '/locations', label: 'Locations', icon: MapPin },
  { to: '/analytics', label: 'Stats', icon: BarChart3 },
  { to: '/export', label: 'Export', icon: Download },
];

const STORAGE_KEY = 'castjournal:sidebar-collapsed';
// Height of the mobile top bar below. PageHeader's sticky offset (top-14)
// must match this value, or the two stack incorrectly on scroll.
const MOBILE_TOPBAR_CLASS = 'h-14';

export function Sidebar() {
  const { user, logout } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === '1');
  const [mobileOpen, setMobileOpen] = useState(false);

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
  // The mobile drawer always shows the full/expanded layout, regardless of
  // the desktop-only collapse preference.
  const expanded = !collapsed || mobileOpen;
  const closeMobile = () => setMobileOpen(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-5 px-2 py-2 text-sm transition-colors rounded-md',
      !expanded && 'justify-center px-0',
      isActive ? 'bg-accent/15 text-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    );

  return (
    <>
      {/*
        Mobile top bar — sits in normal document flow (NOT fixed/absolute),
        so it reserves real space above the page and pushes content down
        instead of floating over it. This is what was causing the hamburger
        to overlap page titles like "Feed". It's `sticky` so the menu stays
        reachable while scrolling; pages using <PageHeader> account for its
        height via `top-14` on their own sticky offset.
      */}
      <div
        className={cn(
          'sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-border bg-card px-3 shadow-sm md:hidden',
          MOBILE_TOPBAR_CLASS
        )}
      >
        <button
          onClick={() => setMobileOpen(true)}
          className="flex size-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <Link to="/" className="wordmark flex items-center gap-2 text-lg">
          <img src="/logo-icon.svg" alt="" className="h-7 w-auto" />
          CastJournal
        </Link>
      </div>

      {/* Backdrop — mobile only, closes the drawer on click */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen w-60 -translate-x-full flex-col border-r border-border bg-card px-3 py-4 shadow-xl transition-transform duration-200',
          'md:sticky md:top-0 md:z-auto md:shrink-0 md:translate-x-0 md:shadow-none md:transition-[width]',
          mobileOpen && 'translate-x-0',
          collapsed && 'md:w-16 md:px-2'
        )}
      >
        <Link
          to="/"
          onClick={closeMobile}
          className={cn('wordmark mb-8 flex items-center gap-2.5 px-2 text-2xl', !expanded && 'justify-center px-0')}
          title="CastJournal"
        >
          <img src="/logo-icon.svg" alt="" className="h-10 w-auto shrink-0" />
          {expanded && 'CastJournal'}
        </Link>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {expanded && <p className="px-2 pb-1 text-xs tracking-widest text-muted-foreground uppercase">Main</p>}
          {mainLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass} title={!expanded ? label : undefined} onClick={closeMobile}>
              <Icon className="size-4.5 shrink-0" />
              {expanded && label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              {expanded && <p className="px-2 pt-4 pb-1 text-xs tracking-widest text-muted-foreground uppercase">Admin</p>}
              <NavLink to="/admin" className={linkClass} title={!expanded ? 'Admin' : undefined} onClick={closeMobile}>
                <ShieldCheck className="size-4.5 shrink-0" />
                {expanded && 'Admin'}
              </NavLink>
            </>
          )}
        </nav>

        {/* Collapse toggle is a desktop-only concept — mobile drawer is always full-width */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'mb-2 hidden items-center gap-2.5 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex',
            !expanded && 'justify-center px-0'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="size-4.5 shrink-0" /> : <ChevronsLeft className="size-4.5 shrink-0" />}
          {expanded && 'Collapse'}
        </button>

        <div className={cn('flex items-center gap-2 border-t border-border pt-3', !expanded && 'flex-col')}>
          <Link to="/profile" onClick={closeMobile} className={cn('flex min-w-0 flex-1 items-center gap-2', !expanded && 'flex-none')}>
            {avatarUrl ? (
              <img src={resolveMediaUrl(avatarUrl)} alt="" className="size-8 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="size-8 shrink-0 rounded-full bg-muted" />
            )}
            {expanded && <span className="truncate text-sm">{user?.fullName}</span>}
          </Link>
          {expanded && <NotificationBell />}
          <Button variant="ghost" size="icon-sm" onClick={logout} aria-label="Log out">
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>
    </>
  );
}
