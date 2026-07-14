export interface Profile {
  id: string;
  email: string;
  userName: string | null;
  fullName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  preferredFishingMethods: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface UpdateProfilePayload {
  fullName?: string;
  bio?: string;
  preferredFishingMethods?: string;
}

export interface PublicProfile {
  id: string;
  fullName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  preferredFishingMethods: string | null;
  memberSince: string;
  publicCatchCount: number;
  followerCount: number;
  followingCount: number;
  isFollowedByCurrentUser: boolean;
}