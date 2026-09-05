import { Building2, Loader2, Search } from 'lucide-react';
import { Link } from 'wouter';
import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getListEstablishmentsQueryOptions,
  type ListEstablishmentsParams,
  useGetPublicStatistics,
} from '@workspace/api-client-react';

import { EmptyState } from '@/components/portal/EmptyState';
import { exposesAgentsAccess } from '@/config/agents-portal';
import { PublicPage } from '@/components/portal/PublicPage';
import { PublicPageStrip } from '@/components/portal/PublicPageStrip';
import { publicPageContent } from '@/content/pages';
import { publicRoutes } from '@/content/routes';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useEstablishmentFilters } from '@/hooks/use-establishment-filters';

const TEACHING_ORDERS = [
  'LAIC',
  'CATHOLIQUE',
  'ISLAMIQUE',
  'METHODISTE',
  'AUTRE_CONFESSION',
] as const;

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'active', label: 'Actifs' },
  { value: 'inactive', label: 'Inactifs' },
  { value: 'pending', label: 'En attente' },
  { value: 'archived', label: 'Archivés' },
] as const;

function buildQueryParams(
  filters: ReturnType<typeof useEstablishmentFilters>['filters'],
  debouncedSearch: string,
  debouncedRegion: string,
  debouncedDrena: string,
  debouncedLocality: string,
): ListEstablishmentsParams {
  return {
    page: filters.page,
    pageSize: filters.pageSize,
    search: debouncedSearch.trim() || undefined,
    region: debouncedRegion.trim() || undefined,
    drena: debouncedDrena.trim() || undefined,
    locality: debouncedLocality.trim() || undefined,
    type: filters.type.trim() || undefined,
    status: (filters.status as ListEstablishmentsParams['status']) || undefined,
    sort: filters.sort,
    order: filters.order,
  };
}

function hasActiveFilters(
  filters: ReturnType<typeof useEstablishmentFilters>['filters'],
  debouncedSearch: string,
  debouncedRegion: string,
  debouncedDrena: string,
  debouncedLocality: string,
): boolean {
  return Boolean(
    debouncedSearch.trim() ||
      debouncedRegion.trim() ||
      debouncedDrena.trim() ||
      debouncedLocality.trim() ||
      filters.type.trim() ||
      filters.status.trim(),
  );
}

export default function EtablissementsPage() {
  const content = publicPageContent.etablissements;
  const { filters, updateFilters } = useEstablishmentFilters(publicRoutes.etablissements);
  const { data: stats } = useGetPublicStatistics();

  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [regionDraft, setRegionDraft] = useState(filters.region);
  const [drenaDraft, setDrenaDraft] = useState(filters.drena);
  const [localityDraft, setLocalityDraft] = useState(filters.locality);

  const debouncedSearch = useDebouncedValue(searchDraft);
  const debouncedRegion = useDebouncedValue(regionDraft);
  const debouncedDrena = useDebouncedValue(drenaDraft);
  const debouncedLocality = useDebouncedValue(localityDraft);

  useEffect(() => {
    setSearchDraft(filters.search);
    setRegionDraft(filters.region);
    setDrenaDraft(filters.drena);
    setLocalityDraft(filters.locality);
  }, [filters.search, filters.region, filters.drena, filters.locality]);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      updateFilters({ search: debouncedSearch }, true);
    }
  }, [debouncedSearch, filters.search, updateFilters]);

  useEffect(() => {
    if (debouncedRegion !== filters.region) {
      updateFilters({ region: debouncedRegion }, true);
    }
  }, [debouncedRegion, filters.region, updateFilters]);

  useEffect(() => {
    if (debouncedDrena !== filters.drena) {
      updateFilters({ drena: debouncedDrena }, true);
    }
  }, [debouncedDrena, filters.drena, updateFilters]);

  useEffect(() => {
    if (debouncedLocality !== filters.locality) {
      updateFilters({ locality: debouncedLocality }, true);
    }
  }, [debouncedLocality, filters.locality, updateFilters]);

  const queryParams = useMemo(
    () =>
      buildQueryParams(
        filters,
        debouncedSearch,
        debouncedRegion,
        debouncedDrena,
        debouncedLocality,
      ),
    [filters, debouncedSearch, debouncedRegion, debouncedDrena, debouncedLocality],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    ...getListEstablishmentsQueryOptions(queryParams),
    placeholderData: keepPreviousData,
  });

  const establishments = data?.data ?? [];
  const pagination = data?.pagination;
  const filtersActive = hasActiveFilters(
    filters,
    debouncedSearch,
    debouncedRegion,
    debouncedDrena,
    debouncedLocality,
  );

  function resetFilters() {
    setSearchDraft('');
    setRegionDraft('');
    setDrenaDraft('');
    setLocalityDraft('');
    updateFilters(
      {
        search: '',
        region: '',
        drena: '',
        locality: '',
        type: '',
        status: '',
      },
      true,
    );
  }

  return (
    <PublicPage
      title={content.title}
      description={content.description}
      seoDescription={content.seoDescription}
      variant="editorial"
      breadcrumbs={[
        { label: 'Accueil', href: publicRoutes.home },
        { label: content.title },
      ]}
    >
      <PublicPageStrip
        title="Annuaire des établissements"
        summary={
          stats
            ? `Référentiel national · ${stats.establishments.toLocaleString('fr-FR')} référencés · ${stats.establishmentsActive.toLocaleString('fr-FR')} actifs`
            : 'Référentiel national des établissements primaires et secondaires'
        }
      />

      <section className="public-directory" aria-label="Recherche et filtres">
        <form
          className="public-directory-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            updateFilters({ search: searchDraft }, true);
          }}
        >
          <label htmlFor="establishment-search">Rechercher un établissement</label>
          <div className="public-directory-search-row">
            <Search size={16} aria-hidden="true" />
            <input
              id="establishment-search"
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Nom, code, localité, région ou DRENA"
              data-testid="input-establishment-search"
            />
          </div>
        </form>

        <div className="public-directory-filters">
          <div className="public-directory-field">
            <label htmlFor="filter-region">Région</label>
            <input
              id="filter-region"
              type="text"
              value={regionDraft}
              onChange={(event) => setRegionDraft(event.target.value)}
              placeholder="ex. Abidjan, ABIDJAN"
            />
          </div>
          <div className="public-directory-field">
            <label htmlFor="filter-drena">DRENA</label>
            <input
              id="filter-drena"
              type="text"
              value={drenaDraft}
              onChange={(event) => setDrenaDraft(event.target.value)}
              placeholder="ex. DREN Abidjan"
            />
          </div>
          <div className="public-directory-field">
            <label htmlFor="filter-locality">Localité</label>
            <input
              id="filter-locality"
              type="text"
              value={localityDraft}
              onChange={(event) => setLocalityDraft(event.target.value)}
              placeholder="ex. Cocody"
            />
          </div>
          <div className="public-directory-field">
            <label htmlFor="filter-type">Ordre d&apos;enseignement</label>
            <select
              id="filter-type"
              value={filters.type}
              onChange={(event) => updateFilters({ type: event.target.value }, true)}
            >
              <option value="">Tous</option>
              {TEACHING_ORDERS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="public-directory-field">
            <label htmlFor="filter-status">Statut</label>
            <select
              id="filter-status"
              value={filters.status}
              onChange={(event) => updateFilters({ status: event.target.value }, true)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {filtersActive ? (
            <button type="button" className="outline-btn public-directory-reset" onClick={resetFilters}>
              Réinitialiser
            </button>
          ) : null}
        </div>
      </section>

      {isLoading ? (
        <div className="public-inline-status" role="status">
          <Loader2 className="animate-spin" aria-hidden="true" />
          Chargement de l&apos;annuaire…
        </div>
      ) : null}

      {isError ? (
        <EmptyState
          title="Impossible de charger l'annuaire"
          description={
            error instanceof Error
              ? error.message
              : "Une erreur est survenue lors de la connexion à l'API PNIGVS. Vérifiez que le serveur API est démarré."
          }
          action={
            <button type="button" className="outline-btn" onClick={() => refetch()}>
              Réessayer
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && establishments.length === 0 ? (
        <EmptyState
          title={filtersActive ? 'Aucun établissement trouvé' : 'Référentiel vide'}
          description={
            filtersActive
              ? 'Affinez votre recherche textuelle ou essayez des termes partiels (ex. « Cocody », « Abidjan »). Les filtres géographiques acceptent le nom ou le code.'
              : "Aucun établissement n'est disponible dans le référentiel. Importez les données ou vérifiez la connexion à l'API."
          }
          action={
            filtersActive ? (
              <button type="button" className="outline-btn" onClick={resetFilters}>
                Réinitialiser les filtres
              </button>
            ) : (
              <button type="button" className="outline-btn" onClick={() => refetch()}>
                Actualiser
              </button>
            )
          }
        />
      ) : null}

      {!isLoading && !isError && establishments.length > 0 ? (
        <>
          <p className="public-directory-summary" role="status">
            <strong>{(pagination?.total ?? establishments.length).toLocaleString('fr-FR')}</strong>{' '}
            établissement{(pagination?.total ?? 0) > 1 ? 's' : ''} trouvé
            {(pagination?.total ?? 0) > 1 ? 's' : ''}
            {isFetching ? ' — mise à jour…' : ''}
          </p>

          <div className="public-directory-table-wrap">
            <table className="public-directory-table">
              <caption className="visually-hidden">
                Résultats de l&apos;annuaire national des établissements
              </caption>
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Établissement</th>
                  <th scope="col">Localité</th>
                  <th scope="col">DRENA</th>
                  <th scope="col">Ordre</th>
                  <th scope="col">Cycle</th>
                </tr>
              </thead>
              <tbody>
                {establishments.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <code>{item.establishmentCode}</code>
                    </td>
                    <td>
                      <Link
                        href={publicRoutes.establishmentDetail(item.id)}
                        className="public-directory-link"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td>{item.locality.name}</td>
                    <td>{item.drena.name}</td>
                    <td>{item.teachingOrder ?? '—'}</td>
                    <td>{item.authorizedCycle ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 ? (
            <nav className="public-directory-pagination" aria-label="Pagination des résultats">
              <button
                type="button"
                className="outline-btn"
                disabled={pagination.page <= 1}
                onClick={() => updateFilters({ page: pagination.page - 1 })}
              >
                Page précédente
              </button>
              <span>
                Page {pagination.page} sur {pagination.totalPages}
              </span>
              <button
                type="button"
                className="outline-btn"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateFilters({ page: pagination.page + 1 })}
              >
                Page suivante
              </button>
            </nav>
          ) : null}
        </>
      ) : null}

      <nav className="public-quick-links" aria-label="Liens complémentaires">
        <Link href={publicRoutes.statistiques} className="public-quick-link">
          <Building2 size={18} aria-hidden="true" />
          Statistiques publiques
        </Link>
        <Link href={publicRoutes.documents} className="public-quick-link">
          Documents publics
        </Link>
        {exposesAgentsAccess() ? (
          <Link href={publicRoutes.espaceAgents} className="public-quick-link">
            Espace agents
          </Link>
        ) : null}
      </nav>
    </PublicPage>
  );
}
