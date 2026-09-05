import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'wouter';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getListAppEstablishmentsQueryOptions,
  type ListAppEstablishmentsParams,
} from '@workspace/api-client-react';

import { AppProEmpty } from '@/components/app/pro/AppProEmpty';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useEstablishmentFilters } from '@/hooks/use-establishment-filters';
import { appRoutes } from '@/content/routes';

const TEACHING_ORDERS = ['LAIC', 'CATHOLIQUE', 'ISLAMIQUE', 'METHODISTE', 'AUTRE_CONFESSION'] as const;

const STATUS_FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'active', label: 'Actifs' },
  { value: 'pending', label: 'En attente' },
  { value: 'inactive', label: 'Inactifs' },
  { value: 'archived', label: 'Archivés' },
] as const;

const SORT_OPTIONS = [
  { value: 'name', label: 'Nom (A→Z)' },
  { value: 'establishmentCode', label: 'Code' },
  { value: 'listNumber', label: 'N° liste' },
  { value: 'updatedAt', label: 'Dernière MAJ' },
] as const;

type EstablishmentDirectoryProps = {
  detailHref?: (id: string) => string;
};

function buildQueryParams(
  filters: ReturnType<typeof useEstablishmentFilters>['filters'],
  debouncedSearch: string,
): ListAppEstablishmentsParams {
  return {
    page: filters.page,
    pageSize: filters.pageSize,
    search: debouncedSearch.trim() || undefined,
    type: filters.type.trim() || undefined,
    status: (filters.status as ListAppEstablishmentsParams['status']) || undefined,
    sort: filters.sort,
    order: filters.order,
  };
}

function hasActiveFilters(filters: ReturnType<typeof useEstablishmentFilters>['filters']): boolean {
  return Boolean(
    filters.search.trim() ||
      filters.type.trim() ||
      filters.status.trim() ||
      filters.sort !== 'name' ||
      filters.order !== 'asc',
  );
}

export function EstablishmentDirectory({
  detailHref = appRoutes.establishmentDetail,
}: EstablishmentDirectoryProps) {
  const { filters, updateFilters } = useEstablishmentFilters(appRoutes.establishments);
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchDraft);

  useEffect(() => {
    setSearchDraft(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      updateFilters({ search: debouncedSearch }, true);
    }
  }, [debouncedSearch, filters.search, updateFilters]);

  const queryParams = buildQueryParams(filters, debouncedSearch);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    ...getListAppEstablishmentsQueryOptions(queryParams),
    placeholderData: keepPreviousData,
  });

  const establishments = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="app-directory">
      <section className="app-directory-toolbar app-directory-toolbar--pro" aria-label="Recherche et filtres annuaire">
        <form
          className="app-directory-search app-directory-search--wide"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            updateFilters({ search: searchDraft }, true);
          }}
        >
          <label htmlFor="app-establishment-search">Rechercher dans votre périmètre</label>
          <div className="app-directory-search-row">
            <Search size={16} aria-hidden="true" />
            <input
              id="app-establishment-search"
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Nom, code, localité, région ou DRENA…"
              autoComplete="off"
            />
          </div>
        </form>

        <div className="app-directory-status-row" role="group" aria-label="Filtrer par statut">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option.value || 'all'}
              type="button"
              className={`app-directory-pill${filters.status === option.value ? ' app-directory-pill--active' : ''}`}
              aria-pressed={filters.status === option.value}
              onClick={() => updateFilters({ status: option.value }, true)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="app-directory-inline-filters">
          <div className="app-directory-field app-directory-field--compact">
            <label htmlFor="app-filter-type">Ordre d&apos;enseignement</label>
            <select
              id="app-filter-type"
              className="app-pro-select"
              value={filters.type}
              onChange={(event) => updateFilters({ type: event.target.value }, true)}
            >
              <option value="">Tous les ordres</option>
              {TEACHING_ORDERS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="app-directory-field app-directory-field--compact">
            <label htmlFor="app-filter-sort">Tri</label>
            <select
              id="app-filter-sort"
              className="app-pro-select"
              value={filters.sort}
              onChange={(event) =>
                updateFilters({ sort: event.target.value as typeof filters.sort }, true)
              }
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {hasActiveFilters(filters) ? (
            <button
              type="button"
              className="btn-secondary app-directory-reset"
              onClick={() => {
                setSearchDraft('');
                updateFilters(
                  {
                    search: '',
                    type: '',
                    status: '',
                    sort: 'name',
                    order: 'asc',
                  },
                  true,
                );
              }}
            >
              Réinitialiser
            </button>
          ) : null}
        </div>
      </section>

      {isLoading ? <AppProLoading label="Chargement de l'annuaire…" inline /> : null}

      {isError ? (
        <AppProEmpty
          title="Annuaire indisponible"
          description="Impossible de charger les établissements."
          action={
            <button type="button" className="btn-secondary" onClick={() => refetch()}>
              Réessayer
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && establishments.length === 0 ? (
        <AppProEmpty
          title="Aucun établissement trouvé"
          description="Affinez votre recherche ou modifiez les filtres actifs."
          action={
            hasActiveFilters(filters) ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setSearchDraft('');
                  updateFilters(
                    {
                      search: '',
                      type: '',
                      status: '',
                      sort: 'name',
                      order: 'asc',
                    },
                    true,
                  );
                }}
              >
                Réinitialiser
              </button>
            ) : undefined
          }
        />
      ) : null}

      {!isLoading && !isError && establishments.length > 0 ? (
        <>
          <p className="app-directory-summary" role="status">
            <strong>{(pagination?.total ?? establishments.length).toLocaleString('fr-FR')}</strong>{' '}
            établissement{(pagination?.total ?? 0) > 1 ? 's' : ''}
            {isFetching ? ' — mise à jour…' : ''}
          </p>

          <div className="app-directory-table-wrap">
            <table className="app-directory-table">
              <caption className="sr-only">Annuaire des établissements scolaires</caption>
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Établissement</th>
                  <th scope="col">Région</th>
                  <th scope="col">Localité</th>
                  <th scope="col">DRENA</th>
                  <th scope="col">Ordre</th>
                  <th scope="col">Cycle</th>
                  <th scope="col">Statut</th>
                </tr>
              </thead>
              <tbody>
                {establishments.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <code>{item.establishmentCode}</code>
                    </td>
                    <td>
                      <Link href={detailHref(item.id)} className="app-directory-link">
                        {item.name}
                      </Link>
                    </td>
                    <td>{item.region.name}</td>
                    <td>{item.locality.name}</td>
                    <td>{item.drena.name}</td>
                    <td>{item.teachingOrder ?? '—'}</td>
                    <td>{item.authorizedCycle ?? '—'}</td>
                    <td>
                      <span className={`app-directory-status app-directory-status--${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 ? (
            <nav className="app-directory-pagination" aria-label="Pagination">
              <button
                type="button"
                className="btn-secondary"
                disabled={pagination.page <= 1}
                onClick={() => updateFilters({ page: pagination.page - 1 })}
              >
                Précédent
              </button>
              <span>
                Page {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                className="btn-secondary"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateFilters({ page: pagination.page + 1 })}
              >
                Suivant
              </button>
            </nav>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
