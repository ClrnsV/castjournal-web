    import { api } from './client';
import type { SearchResults, SearchScope } from '../types/search';

export const searchApi = {
  search: (query: string, type: SearchScope = 'all', page = 1, pageSize = 20) =>
    api.get<SearchResults>(
      `/search?query=${encodeURIComponent(query)}&type=${type}&page=${page}&pageSize=${pageSize}`
    ),
};