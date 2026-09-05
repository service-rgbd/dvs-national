import { useCallback, useMemo } from 'react';
import { useLocation, useSearch } from 'wouter';

export type EstablishmentFilters = {
  page: number;
  pageSize: number;
  search: string;
  region: string;
  drena: string;
  locality: string;
  type: string;
  status: string;
  sort: 'name' | 'establishmentCode' | 'listNumber' | 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
};

const DEFAULT_PAGE_SIZE = 20;

function parseFilters(search: string): EstablishmentFilters {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);

  const sort = params.get('sort');
  const order = params.get('order');

  return {
    page: Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1),
    pageSize: Math.min(
      100,
      Math.max(1, Number.parseInt(params.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE),
    ),
    search: params.get('search') ?? '',
    region: params.get('region') ?? '',
    drena: params.get('drena') ?? '',
    locality: params.get('locality') ?? '',
    type: params.get('type') ?? '',
    status: params.get('status') ?? '',
    sort:
      sort === 'establishmentCode' ||
      sort === 'listNumber' ||
      sort === 'createdAt' ||
      sort === 'updatedAt'
        ? sort
        : 'name',
    order: order === 'desc' ? 'desc' : 'asc',
  };
}

function filtersToSearchString(filters: EstablishmentFilters): string {
  const params = new URLSearchParams();

  if (filters.page > 1) params.set('page', String(filters.page));
  if (filters.pageSize !== DEFAULT_PAGE_SIZE) params.set('pageSize', String(filters.pageSize));
  if (filters.search.trim()) params.set('search', filters.search.trim());
  if (filters.region.trim()) params.set('region', filters.region.trim());
  if (filters.drena.trim()) params.set('drena', filters.drena.trim());
  if (filters.locality.trim()) params.set('locality', filters.locality.trim());
  if (filters.type.trim()) params.set('type', filters.type.trim());
  if (filters.status.trim()) params.set('status', filters.status.trim());
  if (filters.sort !== 'name') params.set('sort', filters.sort);
  if (filters.order !== 'asc') params.set('order', filters.order);

  const query = params.toString();
  return query ? `?${query}` : '';
}

export function useEstablishmentFilters(basePath: string) {
  const search = useSearch();
  const [, setLocation] = useLocation();

  const filters = useMemo(() => parseFilters(search), [search]);

  const updateFilters = useCallback(
    (patch: Partial<EstablishmentFilters>, resetPage = false) => {
      const next: EstablishmentFilters = {
        ...filters,
        ...patch,
        page: resetPage ? 1 : (patch.page ?? filters.page),
      };
      const path = `${basePath}${filtersToSearchString(next)}`;
      setLocation(path);
    },
    [basePath, filters, setLocation],
  );

  return { filters, updateFilters };
}
