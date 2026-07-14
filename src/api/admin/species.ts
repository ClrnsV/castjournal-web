import { api } from '../client';
import type { Species } from '../../types/species';

export interface SpeciesPayload {
  commonName: string;
  scientificName?: string;
  category?: string;
  description?: string;
  averageSize?: string;
  imageUrl?: string;
}

export const adminSpeciesApi = {
  create: (payload: SpeciesPayload) => api.post<Species>('/species', payload),
  update: (id: string, payload: SpeciesPayload) => api.put<Species>(`/species/${id}`, payload),
  remove: (id: string) => api.delete<void>(`/species/${id}`),
};