import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { FollowSidebar } from './FollowSidebar';
import { SearchBar } from './SearchBar';

export function FeedLayout() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[auto_1fr_auto]">
      <Sidebar />
      <main className="min-w-0">
        <div className="mx-auto w-full max-w-4xl px-6 py-8">
          <Outlet />
        </div>
      </main>

      <div className="hidden w-70 shrink-0 pr-6 pb-6 lg:block">
        <div className="sticky top-0 flex max-h-[calc(100vh-1.5rem)] flex-col">
          {/* Space above the search bar — nudge this value to taste */}
          <div className="h-4" aria-hidden />
          <SearchBar />
          <div className="h-[45px]" aria-hidden />
          <FollowSidebar />
        </div>
      </div>
    </div>
  );
}