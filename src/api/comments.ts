import { api } from './client';
import type { Comment } from '../types/comment';
import type { PagedResult } from '../types/catch';

export const commentsApi = {
  getForCatch: (catchId: string, page = 1, pageSize = 20) =>
    api.get<PagedResult<Comment>>(`/catches/${catchId}/comments?page=${page}&pageSize=${pageSize}`),

  add: (catchId: string, content: string) =>
    api.post<Comment>(`/catches/${catchId}/comments`, { content }),

  update: (catchId: string, commentId: string, content: string) =>
    api.put<void>(`/catches/${catchId}/comments/${commentId}`, { content }),

  remove: (catchId: string, commentId: string) =>
    api.delete<void>(`/catches/${catchId}/comments/${commentId}`),
};