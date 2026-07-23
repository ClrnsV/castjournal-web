export interface Comment {
  id: string;
  catchId: string;
  userId: string;
  userFullName: string | null;
  userAvatarUrl: string | null;
  content: string;
  createdAt: string;
  editedAt: string | null;
  isOwnedByCurrentUser: boolean;
}