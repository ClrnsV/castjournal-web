import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="mx-auto w-full max-w-3xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}