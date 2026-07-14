import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { profileApi } from '../../api/profile';
import type { Profile } from '../../types/profile';
import { CastDivider } from '../../components/CastDivider';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  bio: z.string(),
  preferredFishingMethods: z.string(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function MyProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', bio: '', preferredFishingMethods: '' },
  });

  useEffect(() => {
    profileApi.getMine().then((p) => {
      setProfile(p);
      form.reset({
        fullName: p.fullName ?? '',
        bio: p.bio ?? '',
        preferredFishingMethods: p.preferredFishingMethods ?? '',
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values: ProfileValues) => {
    try {
      const updated = await profileApi.update(values);
      setProfile(updated);
      setIsEditing(false);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Could not update profile.';
      form.setError('root', { message });
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    setIsUploadingAvatar(true);
    try {
      const updated = await profileApi.uploadAvatar(file);
      setProfile(updated);
    } catch {
      setAvatarError('Could not upload avatar. Try a smaller image.');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!profile) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardContent>
          <h1 className="font-heading text-2xl">My Profile</h1>
          <CastDivider />

          <div className="mb-6 flex items-center gap-11">
            {profile.avatarUrl ? (
              <img
                src={resolveMediaUrl(profile.avatarUrl)}
                alt="Your avatar"
                className="size-27 rounded-full object-cover"
              />
            ) : (
              <div className="size-18 rounded-full bg-border" />
            )}

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
                id="avatarInput"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? 'Uploading...' : 'Change photo'}
              </Button>
              {avatarError && <p className="mt-1 text-sm text-destructive">{avatarError}</p>}
            </div>
          </div>

          {!isEditing ? (
            <>
              <p><strong>{profile.fullName}</strong> · @{profile.userName}</p>
              <p className="text-muted-foreground">{profile.bio || 'No bio yet.'}</p>
              {profile.preferredFishingMethods && (
                <p><strong>Preferred methods:</strong> {profile.preferredFishingMethods}</p>
              )}
              <p className="font-mono text-sm text-muted-foreground">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </p>
              <Button size="sm" className="mt-3" onClick={() => setIsEditing(true)}>Edit profile</Button> </>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl><Textarea rows={3} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preferredFishingMethods"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred fishing methods</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <p className="text-sm text-destructive" role="alert">{form.formState.errors.root.message}</p>
                )}

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">Save</Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}