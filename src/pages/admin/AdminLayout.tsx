import { NavLink, Outlet } from 'react-router-dom';
import { CastDivider } from '../../components/CastDivider';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/species', label: 'Species' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/audit-logs', label: 'Audit Logs' },
  { to: '/admin/backup', label: 'Backup' },
];

export function AdminLayout() {
  return (
    <div>
      <h1 className="font-heading text-2xl">Admin</h1>
      <CastDivider />

      <nav className="mb-6 flex gap-6 border-b border-border">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'border-b-2 border-transparent pb-2 text-sm font-medium text-muted-foreground no-underline transition-colors',
                isActive && 'border-primary font-semibold text-foreground'
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}