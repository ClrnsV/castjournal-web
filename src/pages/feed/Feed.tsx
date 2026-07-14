import { useEffect, useState } from 'react';
import { catchesApi } from '../../api/catches';
import { profileApi } from '../../api/profile';
import type { Catch, PagedResult } from '../../types/catch';
import { CatchCard } from '../../components/CatchCard';
import { CatchCardSkeleton } from '../../components/CatchCardSkeleton';
import { FeedComposer } from '../../components/FeedComposer';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function Feed() {
  const [followingOnly, setFollowingOnly] = useState(false);
  const [result, setResult] = useState<PagedResult<Catch> | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    profileApi.getMine()
      .then((p) => { if (!cancelled) setAvatarUrl(p.avatarUrl ?? null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const res = await catchesApi.getFeed({ followingOnly, page, pageSize: 10 });
        if (!cancelled) setResult(res);
      } catch {
        if (!cancelled) setError('Could not load the feed.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [followingOnly, page]);

  return (
      <div className="min-w-0">
        <PageHeader
          title="Feed"
          action={
            <div className="flex shrink-0 gap-2">
              <Button
                variant={!followingOnly ? 'default' : 'outline'}
                onClick={() => { setFollowingOnly(false); setPage(1); }}
              >
                All
              </Button>
              <Button
                variant={followingOnly ? 'default' : 'outline'}
                onClick={() => { setFollowingOnly(true); setPage(1); }}
              >
                Following
              </Button>
            </div>
          }
        />

        <div className="pt-6">
          <FeedComposer avatarUrl={avatarUrl} />

          {isLoading && (
            <div className="flex flex-col gap-4">
              <CatchCardSkeleton />
              <CatchCardSkeleton />
              <CatchCardSkeleton />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {!isLoading && result?.items.length === 0 && (
            <Card>
              <CardContent className="text-center text-muted-foreground">
                {followingOnly ? 'Follow other anglers to see their catches here.' : 'No public catches yet.'}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-4">
            {result?.items.map((c) => <CatchCard key={c.id} item={c} />)}
          </div>

          {result && result.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {result.page} of {result.totalPages}</span>
              <Button variant="outline" disabled={page >= result.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      </div>

     
  );
}
