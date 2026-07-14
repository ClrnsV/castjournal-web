// Lightweight DTO for follow lists — deliberately not the full PublicProfile
// (no bio/memberSince/catch counts needed to render a sidebar row).
export interface FollowSummary {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  isFollowedByCurrentUser: boolean;
}