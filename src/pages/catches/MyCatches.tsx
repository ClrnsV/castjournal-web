import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { catchesApi } from '../../api/catches';
import type { Catch, PagedResult } from '../../types/catch';
import { PageHeader } from '../../components/PageHeader';
import { CatchRowSkeleton } from '../../components/CatchRowSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function MyCatches() {
  const [result, setResult] = useState<PagedResult<Catch> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCatches() {
      setIsLoading(true);
      try {
        const res = await catchesApi.search({ searchTerm: searchTerm || undefined, page, pageSize: 10 });
        if (!cancelled) setResult(res);
      } catch {
        if (!cancelled) setError('Could not load your catches.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCatches();
    return () => { cancelled = true; };
  }, [searchTerm, page]);

  return (
    <div>
      <PageHeader
        title="My Catches"
        action={<Link to="/catches/new"><Button>+ Log a catch</Button></Link>}
      >
        <Input
          type="search"
          placeholder="Search notes, gear, species..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="mt-4"
        />
      </PageHeader>

      <div className="pt-6">
        {isLoading && (
          <div className="flex flex-col gap-3">
            <CatchRowSkeleton />
            <CatchRowSkeleton />
            <CatchRowSkeleton />
            <CatchRowSkeleton />
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!isLoading && result && result.items.length === 0 && (
          <Card>
            <CardContent className="text-center text-muted-foreground">
              <p>You haven't logged a catch yet.</p>
              <Link to="/catches/new"><Button>Log your first catch</Button></Link>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          {result?.items.map((c) => (
            <Link key={c.id} to={`/catches/${c.id}`} className="text-inherit no-underline">
              <Card interactive>
                <CardContent className="flex flex-row items-center justify-between">
                  <div>
                    <strong>{c.speciesName ?? 'Unknown species'}</strong>
                    <div className="font-mono text-sm text-muted-foreground">
                      {c.weight != null ? `${c.weight} kg · ` : ''}
                      {c.locationName ?? 'Private spot'} · {new Date(c.catchDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-brass">♡ {c.likeCount}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
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
