import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import type { Catch } from '../types/catch';
import { catchesApi } from '../api/catches';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted px-3 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

export function CatchCard({ item }: { item: Catch }) {
  const [liked, setLiked] = useState(item.isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const [busy, setBusy] = useState(false);

  const toggleLike = async () => {
    if (busy) return;
    setBusy(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));

    try {
      if (wasLiked) await catchesApi.unlike(item.id);
      else await catchesApi.like(item.id);
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => c + (wasLiked ? 1 : -1));
      toast.error(wasLiked ? "Couldn't unlike this catch — try again." : "Couldn't like this catch — try again.");
    } finally {
      setBusy(false);
    }
  };

  const photo = item.media[0];

  const stats: { label: string; value: string }[] = [];
  if (item.weight != null) stats.push({ label: 'Weight', value: `${item.weight} kg` });
  if (item.length != null) stats.push({ label: 'Length', value: `${item.length} cm` });
  if (item.baitUsed) stats.push({ label: 'Bait', value: item.baitUsed });
  if (item.fishingMethod) stats.push({ label: 'Method', value: item.fishingMethod });

  return (
    <Card className="overflow-hidden py-0 gap-0">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Link to={`/anglers/${item.userId}`} className="flex items-center gap-2 text-foreground no-underline">
            {item.userAvatarUrl ? (
              <img
                src={resolveMediaUrl(item.userAvatarUrl)}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted" />
            )}
            <strong className="text-sm">{item.userFullName ?? 'Angler'}</strong>
          </Link>
          <span className="text-mono text-xs text-muted-foreground" title={new Date(item.catchDate).toLocaleString()}>
            {formatDistanceToNow(new Date(item.catchDate), { addSuffix: true })}
          </span>
        </div>

        {photo && (
          <img
            src={resolveMediaUrl(photo.mediaUrl)}
            alt={item.speciesName ?? 'Catch photo'}
            className="w-full max-h-80 object-cover rounded-lg mb-3"
          />
        )}

        <Link to={`/catches/${item.id}`} className="text-foreground no-underline">
          <strong>{item.speciesName ?? 'Unknown species'}</strong>
        </Link>
        {item.locationName && (
          <div className="text-mono text-sm text-muted-foreground mb-2">
            {item.locationName}
          </div>
        )}

        {stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 mb-3">
            {stats.map((s) => (
              <StatBox key={s.label} label={s.label} value={s.value} />
            ))}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLike}
          disabled={busy}
          className={`px-2 -ml-2 ${liked ? 'text-destructive' : 'text-muted-foreground'} hover:text-destructive`}
        >
          <Heart className="size-4" fill={liked ? 'currentColor' : 'none'} />
          {likeCount}
        </Button>
      </CardContent>
    </Card>
  );
}
