import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    // flex-col on mobile so the Sidebar's mobile top bar stacks above <main>
    // instead of sitting beside it; md:flex-row restores the sidebar-left
    // layout on desktop, same as before.
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="mx-auto w-full max-w-3xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
