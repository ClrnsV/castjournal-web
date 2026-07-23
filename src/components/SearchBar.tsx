import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, X, Fish } from 'lucide-react';
import { searchApi } from '../api/search';
import { followApi } from '../api/follow';
import type { SearchResults, SearchScope } from '../types/search';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { cn } from '@/lib/utils';

const SCOPES: { value: SearchScope; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'users', label: 'Anglers' },
  { value: 'catches', label: 'Catches' },
];

const EMPTY_PAGE = { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 };
const emptyResults = (): SearchResults => ({ users: { ...EMPTY_PAGE }, catches: { ...EMPTY_PAGE } });

export function SearchBar() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>('all');
  const [results, setResults] = useState<SearchResults>(emptyResults());
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Close on outside click — a genuine external-event subscription, so an effect is right here.
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Clear any pending debounce on unmount.
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  // Triggered directly from the input's onChange / the tab buttons' onClick —
  // not from an effect — since this is "responding to an event", not syncing with an external system.
  function runSearch(term: string, nextScope: SearchScope) {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = term.trim();
    if (trimmed.length < 2) {
      setIsLoading(false);
      return;
    }

    const thisRequestId = ++requestIdRef.current;
    setIsLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchApi.search(trimmed, nextScope);
        if (thisRequestId === requestIdRef.current) setResults(res);
      } catch {
        if (thisRequestId === requestIdRef.current) setResults(emptyResults());
      } finally {
        if (thisRequestId === requestIdRef.current) setIsLoading(false);
      }
    }, 300);
  }

  const handleQueryChange = (value: string) => {
    setQuery(value);
    runSearch(value, scope);
  };

  const handleScopeChange = (next: SearchScope) => {
    setScope(next);
    runSearch(query, next);
  };

  const clear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    requestIdRef.current++; // invalidate any in-flight request
    setQuery('');
    setResults(emptyResults());
    setIsLoading(false);
  };

  const users = results.users.items;
  const catches = results.catches.items;
  const hasQuery = query.trim().length >= 2;
  const hasResults = users.length > 0 || catches.length > 0;

  const goTo = (path: string) => {
    setIsOpen(false);
    clear();
    navigate(path);
  };

  const toggleFollow = async (userId: string, isFollowing: boolean) => {
    try {
      if (isFollowing) await followApi.unfollow(userId);
      else await followApi.follow(userId);
      setResults((prev) => ({
        ...prev,
        users: {
          ...prev.users,
          items: prev.users.items.map((u) =>
            u.id === userId ? { ...u, isFollowedByCurrentUser: !isFollowing } : u
          ),
        },
      }));
    } catch {
      toast.error(isFollowing ? "Couldn't unfollow — try again." : "Couldn't follow — try again.");
    }
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <div className="flex h-16 items-center gap-2.5 rounded-2xl border border-border bg-card px-4 shadow-sm">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search anglers & catches"
          className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button onClick={clear} aria-label="Clear search" className="shrink-0 text-muted-foreground hover:text-foreground">
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {isOpen && hasQuery && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 z-20 flex max-h-[28rem] w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <div className="flex gap-1 border-b border-border p-2">
            {SCOPES.map((s) => (
              <button
                key={s.value}
                onClick={() => handleScopeChange(s.value)}
                className={cn(
                  'flex-1 rounded-full py-1.5 text-xs font-medium transition-colors',
                  scope === s.value ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/60'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto p-2">
            {isLoading && <p className="py-4 text-center text-sm text-muted-foreground">Searching…</p>}

            {!isLoading && !hasResults && (
              <p className="py-4 text-center text-sm text-muted-foreground">No results for "{query.trim()}"</p>
            )}

            {!isLoading && (scope === 'all' || scope === 'users') && users.length > 0 && (
              <div className="mb-2">
                {scope === 'all' && (
                  <p className="px-2 pb-1 text-xs tracking-widest text-muted-foreground uppercase">Anglers</p>
                )}
                {users.map((u) => (
                  <div key={u.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted">
                    <button onClick={() => goTo(`/anglers/${u.id}`)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                      {u.avatarUrl ? (
                        <img src={resolveMediaUrl(u.avatarUrl)} alt="" className="size-8 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div className="size-8 shrink-0 rounded-full bg-muted" />
                      )}
                      <span className="truncate text-sm font-medium">{u.fullName ?? u.userName ?? 'Angler'}</span>
                    </button>
                    <button
                      onClick={() => toggleFollow(u.id, u.isFollowedByCurrentUser)}
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                        u.isFollowedByCurrentUser
                          ? 'border border-border text-foreground hover:bg-muted'
                          : 'bg-primary text-primary-foreground hover:bg-primary/85'
                      )}
                    >
                      {u.isFollowedByCurrentUser ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && (scope === 'all' || scope === 'catches') && catches.length > 0 && (
              <div>
                {scope === 'all' && (
                  <p className="px-2 pb-1 text-xs tracking-widest text-muted-foreground uppercase">Catches</p>
                )}
                {catches.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => goTo(`/catches/${c.id}`)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-muted"
                  >
                    {c.media[0]?.mediaUrl ? (
                      <img src={resolveMediaUrl(c.media[0].mediaUrl)} alt="" className="size-8 shrink-0 rounded-md object-cover" />
                    ) : (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Fish className="size-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className="truncate text-sm">
                      <span className="font-medium">{c.speciesName ?? 'Catch'}</span>
                      {c.userFullName && <span className="text-muted-foreground"> · {c.userFullName}</span>}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}