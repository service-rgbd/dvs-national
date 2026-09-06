import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useLocation } from 'wouter';

import { MediaPublicationComposeDialog } from '@/components/app/media-publications/MediaPublicationComposeDialog';
import { MediaPublicationsList } from '@/components/app/media-publications/MediaPublicationWorkspace';
import { AppPage } from '@/components/app/AppPage';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { DashFilterBar } from '@/components/dash/DashFilterBar';
import { DashSurface } from '@/components/dash/DashSurface';
import { canCreateMediaPublication } from '@/config/media-publication-permissions';
import { MEDIA_STATUS_FILTERS, MEDIA_STATUS_LABELS } from '@/config/media-publication-status-filters';
import { appRoutes } from '@/content/routes';
import {
  filterAndSortMediaPublications,
  type MediaKindFilter,
  type MediaPeriodFilter,
  type MediaSortKey,
} from '@/lib/media-filters';
import { liveQueryHookOptions } from '@/lib/query-sync';
import {
  useGetAppDashboard,
  useListActivities,
  useListMediaPublications,
  useListRequests,
} from '@workspace/api-client-react';
import '@/styles/media-publications.css';

export default function AppMediaPublicationsPage() {
  const [location, setLocation] = useLocation();
  const [composeOpen, setComposeOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<MediaKindFilter>('all');
  const [period, setPeriod] = useState<MediaPeriodFilter>('all');
  const [sort, setSort] = useState<MediaSortKey>('date-desc');

  const statusFilter = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('status') ?? '';
  }, [location]);

  const { data: dashboardData } = useGetAppDashboard(liveQueryHookOptions());
  const { data: activitiesData } = useListActivities({ page: 1, pageSize: 100 }, liveQueryHookOptions());
  const { data: approvedRequestsData } = useListRequests(
    { page: 1, pageSize: 100, status: 'approved' },
    liveQueryHookOptions(),
  );
  const { data, isLoading, isError, refetch } = useListMediaPublications(
    { page: 1, pageSize: 100 },
    liveQueryHookOptions(),
  );

  const approvedActivityIds = new Set(
    (approvedRequestsData?.data ?? []).map((request) => request.activityId),
  );
  const eligibleActivities = (activitiesData?.data ?? []).filter((activity) =>
    approvedActivityIds.has(activity.id),
  );

  const profile = dashboardData?.profile;
  const canCreate = profile ? canCreateMediaPublication(profile.primaryRoleCode) : false;
  const publications = data?.data ?? [];
  const visible = useMemo(
    () =>
      filterAndSortMediaPublications(publications, {
        query,
        status: statusFilter,
        kind,
        period,
        sort,
      }),
    [kind, period, publications, query, sort, statusFilter],
  );

  const hasActiveFilters = Boolean(query.trim() || statusFilter || kind !== 'all' || period !== 'all' || sort !== 'date-desc');

  function setStatus(value: string) {
    setLocation(value ? `${appRoutes.mediaPublications}?status=${value}` : appRoutes.mediaPublications);
  }

  return (
    <AppPage
      title="Publications média"
      description="Photos et vidéos de sorties — dépôt, instruction, puis publication publique."
      action={
        canCreate ? (
          <button type="button" className="dash-chip-btn" onClick={() => setComposeOpen(true)}>
            <Plus size={14} aria-hidden="true" />
            Nouveau dossier
          </button>
        ) : undefined
      }
    >
      <AppProPageShell>
        {canCreate ? (
          <MediaPublicationComposeDialog
            open={composeOpen}
            onOpenChange={setComposeOpen}
            activities={eligibleActivities}
          />
        ) : null}

        <DashSurface>
          <DashFilterBar
            search={query}
            searchPlaceholder="Titre, sortie, établissement…"
            onSearchChange={setQuery}
            filters={[
              {
                id: 'status',
                label: 'Statut',
                value: statusFilter,
                onChange: setStatus,
                options: [
                  { value: '', label: 'Tous les statuts' },
                  ...MEDIA_STATUS_FILTERS.map((item) => ({
                    value: item.status,
                    label: item.label,
                  })),
                ],
              },
              {
                id: 'kind',
                label: 'Type',
                value: kind,
                onChange: (value) => setKind(value as MediaKindFilter),
                options: [
                  { value: 'all', label: 'Photos et vidéos' },
                  { value: 'photo', label: 'Photos' },
                  { value: 'video', label: 'Vidéos' },
                ],
              },
              {
                id: 'period',
                label: 'Période',
                value: period,
                onChange: (value) => setPeriod(value as MediaPeriodFilter),
                options: [
                  { value: 'all', label: 'Toutes les dates' },
                  { value: 'today', label: "Aujourd'hui" },
                  { value: 'week', label: '7 derniers jours' },
                  { value: 'month', label: 'Ce mois' },
                  { value: 'year', label: 'Cette année' },
                ],
              },
              {
                id: 'sort',
                label: 'Tri',
                value: sort,
                onChange: (value) => setSort(value as MediaSortKey),
                options: [
                  { value: 'date-desc', label: 'Plus récentes' },
                  { value: 'date-asc', label: 'Plus anciennes' },
                  { value: 'name-asc', label: 'Nom A → Z' },
                  { value: 'name-desc', label: 'Nom Z → A' },
                ],
              },
            ]}
          />

          <p className="dash-filter-hint">
            {isLoading
              ? 'Chargement…'
              : `${visible.length.toLocaleString('fr-FR')} dossier${visible.length > 1 ? 's' : ''}${
                  visible.length !== publications.length
                    ? ` sur ${publications.length.toLocaleString('fr-FR')}`
                    : ''
                }`}
            {statusFilter ? ` · ${MEDIA_STATUS_LABELS[statusFilter as keyof typeof MEDIA_STATUS_LABELS] ?? statusFilter}` : ''}
            {hasActiveFilters ? (
              <>
                {' · '}
                <button
                  type="button"
                  className="activities-filter-reset"
                  onClick={() => {
                    setQuery('');
                    setKind('all');
                    setPeriod('all');
                    setSort('date-desc');
                    setStatus('');
                  }}
                >
                  Réinitialiser
                </button>
              </>
            ) : null}
          </p>

          <MediaPublicationsList
            publications={visible}
            isLoading={isLoading}
            isError={isError}
            canCreate={canCreate}
            onRetry={() => refetch()}
            onCreate={canCreate ? () => setComposeOpen(true) : undefined}
            emptyMessage={
              publications.length === 0
                ? canCreate
                  ? 'Aucun dossier média. Déposez les photos d’une sortie déjà autorisée.'
                  : 'Aucun dossier média dans ce périmètre.'
                : 'Aucun dossier ne correspond à ces filtres.'
            }
          />
        </DashSurface>
      </AppProPageShell>
    </AppPage>
  );
}
