import { Link } from 'react-router-dom';
import { Fish } from 'lucide-react';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { Card, CardContent } from './ui/card';

/**
 * A warm, inviting entry point to logging a catch, styled like a social
 * feed composer — but it's a launcher, not a text post box. CastJournal
 * catches are structured records (species/weight/length/photo), so tapping
 * this routes straight into the real CatchForm at /catches/new rather than
 * accepting free text that couldn't map to that schema.
 */
export function FeedComposer({ avatarUrl }: { avatarUrl?: string | null }) {
  return (
    <Link to="/catches/new" className="mb-6 block text-inherit no-underline">
      <Card
        interactive
        size="sm"
        className="transition-colors hover:ring-[color:var(--color-river)]/25"
      >
        <CardContent className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={resolveMediaUrl(avatarUrl)}
              alt=""
              className="size-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="size-9 shrink-0 rounded-full bg-muted" />
          )}

          <div className="flex-1 rounded-full border border-border bg-[color:var(--color-paper)] px-4 py-2 text-sm text-muted-foreground">
            What did you reel in today?
          </div>

          <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground sm:inline-flex">
            <Fish className="size-3.5" />
            Log a catch
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
