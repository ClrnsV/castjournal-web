import { api, uploadFile } from './client';
import type { Profile, UpdateProfilePayload, PublicProfile } from '../types/profile';

export const profileApi = {
  getMine: () => api.get<Profile>('/profile'),
  update: (payload: UpdateProfilePayload) => api.put<Profile>('/profile', payload),
  getPublic: (userId: string) => api.get<PublicProfile>(`/profile/${userId}`),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadFile<Profile>('/profile/avatar', formData);
  },
};