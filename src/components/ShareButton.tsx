import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { copyCatchLink } from '../utils/share';

interface ShareButtonProps {
  catchId: string;
  /** Show the "Share" label next to the icon (feed card style). Defaults to true. */
  showLabel?: boolean;
  className?: string;
}

export function ShareButton({ catchId, showLabel = true, className }: ShareButtonProps) {
  const handleShare = async (e: React.MouseEvent) => {
    // Prevent this from bubbling into a parent <Link> (e.g. the card wrapping
    // the whole post) if this button is ever nested inside one.
    e.preventDefault();
    e.stopPropagation();

    const ok = await copyCatchLink(catchId);
    if (ok) {
      toast.success('Link copied!');
    } else {
      toast.error("Couldn't copy the link — try copying it from the address bar instead.");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleShare}
      aria-label="Share this catch"
      className={className ?? 'px-2 text-muted-foreground hover:text-foreground'}
    >
      <Share2 className="size-4" />
      {showLabel && 'Share'}
    </Button>
  );
}