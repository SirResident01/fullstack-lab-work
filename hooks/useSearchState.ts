import { usePersistedState } from './usePersistedState';

export interface SearchState {
  limit: number;
  offset: number;
  sort_by: string;
  sort_order: 'asc' | 'desc';
  brand?: string;
  color?: string;
  modelYear?: number;
  minPrice?: number;
  maxPrice?: number;
  owner_id?: number;
}

const defaultSearchState: SearchState = {
  limit: 20,
  offset: 0,
  sort_by: 'id',
  sort_order: 'asc',
};

export function useSearchState(key: string = 'searchState') {
  return usePersistedState<SearchState>(key, defaultSearchState);
}
