import type { Catch, PagedResult } from './catch';

export interface SearchUserResult {
  id: string;
  userName: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  isFollowedByCurrentUser: boolean;
}

export interface SearchResults {
  users: PagedResult<SearchUserResult>;
  catches: PagedResult<Catch>;
}

export type SearchScope = 'all' | 'users' | 'catches';