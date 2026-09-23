import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { profileApi } from '../../api/profile';
import { followApi } from '../../api/follow';
import { catchesApi } from '../../api/catches';
import type { PublicProfile as PublicProfileType } from '../../types/profile';
import type { Catch } from '../../types/catch';
import { useAuth } from '../../context/useAuth';
import { CatchCard } from '../../components/CatchCard';
import { CastDivider } from '../../components/CastDivider';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';


export function PublicProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<PublicProfileType | null>(null);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    profileApi.getPublic(userId)
      .then((p) => { setProfile(p); setIsFollowing(p.isFollowedByCurrentUser); })
      .catch(() => setError('This profile could not be found.'));
    catchesApi.getFeed({ userId, pageSize: 20 }).then((res) => setCatches(res.items)).catch(() => {});
  }, [userId]);

  const toggleFollow = async () => {
  if (!userId || busy) return;
  setBusy(true);
  const was = isFollowing;
  setIsFollowing(!was);
  setProfile((p) => (p ? { ...p, followerCount: p.followerCount + (was ? -1 : 1) } : p));

  try {
    if (was) await followApi.unfollow(userId);
    else await followApi.follow(userId);
  } catch {
    setIsFollowing(was);
    setProfile((p) => (p ? { ...p, followerCount: p.followerCount + (was ? 1 : -1) } : p));
    toast.error(was ? "Couldn't unfollow — try again." : "Couldn't follow — try again.");
  } finally {
    setBusy(false);
  }
};

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!profile) return <p className="text-muted-foreground">Loading...</p>;

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div>
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-center gap-4">
            {profile.avatarUrl ? (
              <img src={resolveMediaUrl(profile.avatarUrl)} alt="" className="size-16 rounded-full object-cover" />
            ) : (
              <div className="size-16 rounded-full bg-border" />
            )}
            <div>
              <h1 className="m-0 font-heading text-2xl">{profile.fullName ?? 'Angler'}</h1>
              <p className="m-0 text-muted-foreground">{profile.bio}</p>
            </div>
          </div>

          <CastDivider />

          <div className="flex gap-4 font-mono text-sm text-muted-foreground">
            <span>{profile.publicCatchCount} catches</span>
            <span>{profile.followerCount} followers</span>
            <span>{profile.followingCount} following</span>
            <span>Since {new Date(profile.memberSince).toLocaleDateString()}</span>
          </div>

          {!isOwnProfile && (
            <Button
              className="mt-4"
              variant={isFollowing ? 'outline' : 'default'}
              onClick={toggleFollow}
              disabled={busy}
            >
              {isFollowing ? 'Following ✓' : 'Follow'}
            </Button>
          )}
        </CardContent>
      </Card>

      <h2 className="font-heading text-xl">Public Catches</h2>
      <div className="flex flex-col gap-4">
        {catches.map((c) => <CatchCard key={c.id} item={c} />)}
        {catches.length === 0 && <p className="text-muted-foreground">No public catches yet.</p>}
      </div>
    </div>
  );
}