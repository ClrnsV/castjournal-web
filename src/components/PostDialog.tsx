import type { Catch } from '../types/catch';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { CommentSection } from './CommentSection';

export function PostDialog({
  item,
  open,
  onOpenChange,
  liked,
  likeCount,
  onToggleLike,
  busy,
}: {
  item: Catch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  liked: boolean;
  likeCount: number;
  onToggleLike: () => void;
  busy: boolean;
}) {
  const photo = item.media[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[87vh] overflow-y-auto rounded-2xl">
            <div className="flex items-center gap-2">
            {item.userAvatarUrl ? (
                <img src={resolveMediaUrl(item.userAvatarUrl)} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
                <div className="w-8 h-8 rounded-full bg-muted" />
            )}
            <strong className="text-sm">{item.userFullName ?? 'Angler'}</strong>
            </div>

            {photo && (
            <img
                src={resolveMediaUrl(photo.mediaUrl)}
                alt={item.speciesName ?? 'Catch photo'}
                className="w-full h-auto max-h-[32rem] object-contain rounded-lg bg-muted"
            />
            )}

            <div>
            <strong className="text-base">{item.speciesName ?? 'Unknown species'}</strong>
            {item.locationName && (
                <div className="text-mono text-sm text-muted-foreground">{item.locationName}</div>
            )}
            </div>

            <Button
            variant="ghost"
            size="sm"
            onClick={onToggleLike}
            disabled={busy}
            className={`w-fit px-2 -ml-2 ${liked ? 'text-destructive' : 'text-muted-foreground'} hover:text-destructive`}
            >
            <Heart className="size-4" fill={liked ? 'currentColor' : 'none'} />
            {likeCount}
            </Button>

            <CommentSection catchId={item.id} />
        </DialogContent>
    </Dialog>
  );
}