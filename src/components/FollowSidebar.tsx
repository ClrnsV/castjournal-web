import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/useAuth';
import { followApi } from '../api/follow';
import type { FollowSummary } from '../types/follow';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { Button } from './ui/button';

type Tab = 'following' | 'followers';

function FollowRow({ person, onToggled }: { person: FollowSummary; onToggled: (id: string, nowFollowing: boolean) => void }) {
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    const was = person.isFollowedByCurrentUser;
    try {
      if (was) await followApi.unfollow(person.id);
      else await followApi.follow(person.id);
      onToggled(person.id, !was);
    } catch {
      toast.error(was ? "Couldn't unfollow — try again." : "Couldn't follow — try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2.5 py-2">
      <Link to={`/anglers/${person.id}`} className="flex min-w-0 flex-1 items-center gap-2.5 text-inherit no-underline">
        {person.avatarUrl ? (
          <img src={resolveMediaUrl(person.avatarUrl)} alt="" className="size-8 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="size-8 shrink-0 rounded-full bg-muted" />
        )}
        <span className="truncate text-sm font-medium">{person.fullName ?? 'Angler'}</span>
      </Link>
      <Button
        variant={person.isFollowedByCurrentUser ? 'outline' : 'default'}
        size="sm"
        disabled={busy}
        onClick={toggle}
        className="shrink-0"
      >
        {person.isFollowedByCurrentUser ? 'Following' : 'Follow'}
      </Button>
    </div>
  );
}

export function FollowSidebar() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('following');
  const [people, setPeople] = useState<FollowSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = tab === 'following'
          ? await followApi.getFollowing(user!.id)
          : await followApi.getFollowers(user!.id);
        if (!cancelled) setPeople(res.items);
      } catch {
        if (!cancelled) setError("Couldn't load this list.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [tab, user]);

  const handleToggled = (id: string, nowFollowing: boolean) => {
    // Unfollowing from the "Following" tab removes them from the list;
    // everywhere else we just flip the button state in place.
    if (tab === 'following' && !nowFollowing) {
      setPeople((prev) => prev.filter((p) => p.id !== id));
    } else {
      setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, isFollowedByCurrentUser: nowFollowing } : p)));
    }
  };

  return (
    <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-70 shrink-0 flex-col overflow-y-auto rounded-2xl border border-border bg-card p-4 lg:flex">
      <div className="mb-3 flex gap-1 rounded-full bg-muted p-1 text-sm">
        <button
          onClick={() => setTab('following')}
          className={`flex-1 rounded-full py-1.5 font-medium transition-colors ${
            tab === 'following' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Following
        </button>
        <button
          onClick={() => setTab('followers')}
          className={`flex-1 rounded-full py-1.5 font-medium transition-colors ${
            tab === 'followers' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Followers
        </button>
      </div>

      {isLoading && <p className="py-4 text-center text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="py-4 text-center text-sm text-destructive">{error}</p>}

      {!isLoading && !error && people.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {tab === 'following' ? "You're not following anyone yet." : 'No followers yet.'}
        </p>
      )}

      <div className="flex flex-col divide-y divide-border">
        {people.map((p) => (
          <FollowRow key={p.id} person={p} onToggled={handleToggled} />
        ))}
      </div>
    </aside>
  );
}
