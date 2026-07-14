import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { FollowSidebar } from './FollowSidebar';

export function FeedLayout() {
  return (
    <div className="grid min-h-screen grid-cols-[auto_1fr_auto]">
      <Sidebar />
      <main className="min-w-0">
        <div className="mx-auto w-full max-w-4xl px-6 py-8">
          <Outlet />
        </div>
      </main>
      <FollowSidebar />
    </div>
  );
}