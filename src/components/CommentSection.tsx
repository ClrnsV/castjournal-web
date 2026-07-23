import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { commentsApi } from '../api/comments';
import type { Comment } from '../types/comment';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

function CommentRow({
  comment,
  onUpdated,
  onDeleted,
}: {
  comment: Comment;
  onUpdated: (updated: Comment) => void;
  onDeleted: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [busy, setBusy] = useState(false);

  const saveEdit = async () => {
    if (!draft.trim() || busy) return;
    setBusy(true);
    try {
      await commentsApi.update(comment.catchId, comment.id, draft.trim());
      onUpdated({ ...comment, content: draft.trim(), editedAt: new Date().toISOString() });
      setIsEditing(false);
    } catch {
      toast.error("Couldn't save your edit — try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (busy || !confirm('Delete this comment?')) return;
    setBusy(true);
    try {
      await commentsApi.remove(comment.catchId, comment.id);
      onDeleted(comment.id);
    } catch {
      toast.error("Couldn't delete this comment — try again.");
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-2.5 py-3">
      {comment.userAvatarUrl ? (
        <img
          src={resolveMediaUrl(comment.userAvatarUrl)}
          alt=""
          className="size-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="size-8 shrink-0 rounded-full bg-muted" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{comment.userFullName ?? 'Angler'}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString()}
            {comment.editedAt ? ' · edited' : ''}
          </span>
        </div>

        {isEditing ? (
          <div className="mt-1.5 flex flex-col gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" disabled={busy} onClick={saveEdit}>Save</Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  setDraft(comment.content);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-0.5 text-sm">{comment.content}</p>
        )}

        {comment.isOwnedByCurrentUser && !isEditing && (
          <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
            <button onClick={() => setIsEditing(true)} className="hover:text-foreground">Edit</button>
            <button onClick={remove} className="hover:text-destructive">Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentSection({ catchId }: { catchId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await commentsApi.getForCatch(catchId);
        if (!cancelled) setComments(res.items);
      } catch {
        if (!cancelled) setError("Couldn't load comments.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [catchId]);

  const submit = async () => {
    const content = newComment.trim();
    if (!content || posting) return;
    setPosting(true);
    try {
      const created = await commentsApi.add(catchId, content);
      setComments((prev) => [...prev, created]);
      setNewComment('');
    } catch {
      toast.error("Couldn't post your comment — try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleUpdated = (updated: Comment) => {
    setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleted = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="mt-6">
      <h2 className="font-heading text-lg">Comments {comments.length > 0 && `(${comments.length})`}</h2>

      <div className="mt-2 flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="text-sm"
        />
        <Button onClick={submit} disabled={posting || !newComment.trim()} className="shrink-0 self-end">
          Post
        </Button>
      </div>

      {isLoading && <p className="py-4 text-center text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="py-4 text-center text-sm text-destructive">{error}</p>}
      {!isLoading && !error && comments.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">No comments yet — be the first.</p>
      )}

      <div className="divide-y divide-border">
        {comments.map((c) => (
          <CommentRow key={c.id} comment={c} onUpdated={handleUpdated} onDeleted={handleDeleted} />
        ))}
      </div>
    </div>
  );
}