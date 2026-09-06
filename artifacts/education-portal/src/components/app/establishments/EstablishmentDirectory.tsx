import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getListAppEstablishmentsQueryOptions,
  type ListAppEstablishmentsParams,
} from '@workspace/api-client-react';

import { AppProEmpty } from '@/components/app/pro/AppProEmpty';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { DashFilterBar } from '@/components/dash/DashFilterBar';
import { DashSurface } from '@/components/dash/DashSurface';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useEstablishmentFilters } from '@/hooks/use-establishment-filters';
import { appRoutes } from '@/content/routes';

const TEACHING_ORDERS = ['LAIC', 'CATHOLIQUE', 'ISLAMIQUE', 'METHODISTE', 'AUTRE_CONFESSION'] as const;

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'active', label: 'Actifs' },
  { value: 'pending', label: 'En attente' },
  { value: 'inactive', label: 'Inactifs' },
  { value: 'archived', label: 'Archivés' },
] as const;

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  pending: 'En attente',
  inactive: 'Inactif',
  archived: 'Archivé',
};

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
  const total = pagination?.total ?? establishments.length;

  const resetFilters = () => {
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
  };

  return (
    <div className="app-directory">
      <DashSurface>
        <DashFilterBar
          search={searchDraft}
          searchPlaceholder="Nom, code, localité, DRENA…"
          onSearchChange={setSearchDraft}
          filters={[
            {
              id: 'status',
              label: 'Statut',
              value: filters.status,
              onChange: (value) => updateFilters({ status: value }, true),
              options: [...STATUS_OPTIONS],
            },
            {
              id: 'type',
              label: "Ordre d'enseignement",
              value: filters.type,
              onChange: (value) => updateFilters({ type: value }, true),
              options: [
                { value: '', label: 'Tous les ordres' },
                ...TEACHING_ORDERS.map((value) => ({ value, label: value })),
              ],
            },
            {
              id: 'sort',
              label: 'Tri',
              value: filters.sort,
              onChange: (value) =>
                updateFilters({ sort: value as typeof filters.sort }, true),
              options: [...SORT_OPTIONS],
            },
          ]}
        />

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
                <button type="button" className="btn-secondary" onClick={resetFilters}>
                  Réinitialiser
                </button>
              ) : undefined
            }
          />
        ) : null}

        {!isLoading && !isError && establishments.length > 0 ? (
          <>
            <p className="dash-filter-hint app-directory-summary" role="status">
              <strong>{total.toLocaleString('fr-FR')}</strong> établissement
              {total > 1 ? 's' : ''}
              {isFetching ? ' — mise à jour…' : ''}
              {hasActiveFilters(filters) ? (
                <>
                  {' · '}
                  <button type="button" className="app-directory-reset-inline" onClick={resetFilters}>
                    Réinitialiser
                  </button>
                </>
              ) : null}
            </p>

            <ul className="app-directory-cards">
              {establishments.map((item) => (
                <li key={`card-${item.id}`}>
                  <Link href={detailHref(item.id)} className="app-directory-card">
                    <strong>{item.name}</strong>
                    <span>
                      {item.establishmentCode}
                      {' · '}
                      {item.locality.name}
                    </span>
                    <em className={`app-directory-status app-directory-status--${item.status}`}>
                      {STATUS_LABELS[item.status] ?? item.status}
                    </em>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="dash-table-wrap">
              <table className="dash-table">
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
                        <Link href={detailHref(item.id)} className="dash-table-primary">
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
                          {STATUS_LABELS[item.status] ?? item.status}
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
      </DashSurface>
    </div>
  );
}
