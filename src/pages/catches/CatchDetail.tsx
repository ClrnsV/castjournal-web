import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { catchesApi } from '../../api/catches';
import type { Catch } from '../../types/catch';
import { useAuth } from '../../context/useAuth';
import { CastDivider } from '../../components/CastDivider';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<Catch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeBusy, setLikeBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    catchesApi.getById(id)
      .then((data) => {
        setItem(data);
        setLiked(data.isLikedByCurrentUser);
        setLikeCount(data.likeCount);
      })
     .catch((err) => {
        console.error('Failed to load catch', id, err);
        if (err?.response?.status === 403) setError("You don't have permission to view this catch.");
        else if (err?.response?.status === 401) setError('Please log in to view this catch.');
        else setError('Catch not found.');
});
  }, [id]);

  const handleDelete = async () => {
    if (!item || !confirm('Delete this catch? This cannot be undone.')) return;
    await catchesApi.remove(item.id);
    navigate('/catches');
  };

  const toggleLike = async () => {
    if (!item || likeBusy) return;
    setLikeBusy(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));

    try {
      if (wasLiked) await catchesApi.unlike(item.id);
      else await catchesApi.like(item.id);
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => c + (wasLiked ? 1 : -1));
    } finally {
      setLikeBusy(false);
    }
  };

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!item) return <p className="text-muted-foreground">Loading...</p>;

  const isOwner = user?.id === item.userId;

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardContent>
          <Link to="/catches" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back
          </Link>

          {item.media.length > 0 && (
            <div className="my-4 flex gap-2 overflow-x-auto">
              {item.media.map((m) => (
                <img
                  key={m.id}
                  src={resolveMediaUrl(m.mediaUrl)}
                  alt={m.fileName ?? 'Catch photo'}
                  className="h-45"
                />
              ))}
            </div>
          )}

          <h1 className="font-heading text-2xl">{item.speciesName ?? 'Unknown species'}</h1>
          <CastDivider />

          <p className="font-mono text-lg">
            {item.weight != null ? `${item.weight} kg` : '—'} · {item.length != null ? `${item.length} cm` : '—'}
          </p>

          <p className="text-muted-foreground">
            📍 {item.locationName ?? 'Private spot'} &nbsp;·&nbsp; 📅 {new Date(item.catchDate).toLocaleDateString()}
          </p>

          {item.gearUsed && <p><strong>Gear:</strong> {item.gearUsed}</p>}
          {item.baitUsed && <p><strong>Bait:</strong> {item.baitUsed}</p>}
          {item.fishingMethod && <p><strong>Method:</strong> {item.fishingMethod}</p>}
          {item.weatherConditions && <p><strong>Weather:</strong> {item.weatherConditions}</p>}
          {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}

          <Button
            variant="ghost"
            onClick={toggleLike}
            disabled={likeBusy}
            className="mt-2 h-auto gap-1.5 p-0 text-sm normal-case tracking-normal text-brass hover:bg-transparent"
          >
            <Heart className={liked ? 'fill-rust text-rust' : 'text-brass'} />
            {likeCount} likes
          </Button>

          {isOwner && (
            <div className="mt-4 flex gap-3">
              <Link to={`/catches/${item.id}/edit`}>
                <Button variant="outline">Edit</Button>
              </Link>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}