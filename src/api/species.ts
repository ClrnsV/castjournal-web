import { api } from './client';
import type { Species } from '../types/species';

export const speciesApi = {
  getAll: () => api.get<Species[]>('/species'),
};