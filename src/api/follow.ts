import { api } from './client';
import type { PagedResult } from '../types/catch';
import type { FollowSummary } from '../types/follow';

export const followApi = {
  follow: (userId: string) => api.post<void>(`/users/${userId}/follow`),
  unfollow: (userId: string) => api.delete<void>(`/users/${userId}/follow`),

  // New — needs a matching backend endpoint, see note below.
  getFollowing: (userId: string, page = 1, pageSize = 20) =>
    api.get<PagedResult<FollowSummary>>(`/users/${userId}/following?page=${page}&pageSize=${pageSize}`),

  getFollowers: (userId: string, page = 1, pageSize = 20) =>
    api.get<PagedResult<FollowSummary>>(`/users/${userId}/followers?page=${page}&pageSize=${pageSize}`),
};