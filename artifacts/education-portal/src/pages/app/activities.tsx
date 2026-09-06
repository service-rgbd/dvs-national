import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import { ActivityComposeDialog } from '@/components/app/activities/ActivityComposeDialog';
import { ActivitiesList } from '@/components/app/activities/ActivityWorkspace';
import { AppPage } from '@/components/app/AppPage';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { DashFilterBar } from '@/components/dash/DashFilterBar';
import { DashSurface } from '@/components/dash/DashSurface';
import { getRequestActorKind } from '@/config/request-permissions';
import { activityTypes } from '@/config/roles';
import {
  filterAndSortActivities,
  type ActivityPeriodFilter,
  type ActivitySortKey,
} from '@/lib/activity-filters';
import { liveQueryHookOptions } from '@/lib/query-sync';
import '@/styles/activities.css';
import { useGetAppDashboard, useListActivities } from '@workspace/api-client-react';

export default function AppActivitiesPage() {
  const { data: dashboardData } = useGetAppDashboard(liveQueryHookOptions());
  const canCreate = getRequestActorKind(dashboardData?.profile.primaryRoleCode ?? '') === 'establishment';
  const needsEstablishment = !dashboardData?.profile.establishmentId;

  const [composeOpen, setComposeOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [period, setPeriod] = useState<ActivityPeriodFilter>('all');
  const [sort, setSort] = useState<ActivitySortKey>('date-desc');

  const { data, isLoading, isError, refetch } = useListActivities(
    { page: 1, pageSize: 100 },
    liveQueryHookOptions(),
  );

  const activities = data?.data ?? [];
  const visible = useMemo(
    () => filterAndSortActivities(activities, { query, type, period, sort }),
    [activities, period, query, sort, type],
  );

  const hasActiveFilters = Boolean(query.trim() || type || period !== 'all' || sort !== 'date-desc');

  return (
    <AppPage
      title="Activités"
      description="Retrouvez vos sorties, puis ouvrez un dossier d'autorisation."
      action={
        canCreate ? (
          <button type="button" className="dash-chip-btn" onClick={() => setComposeOpen(true)}>
            <Plus size={14} aria-hidden="true" />
            Nouvelle activité
          </button>
        ) : undefined
      }
    >
      <AppProPageShell>
        {canCreate ? (
          <ActivityComposeDialog
            open={composeOpen}
            onOpenChange={setComposeOpen}
            needsEstablishment={needsEstablishment}
            establishmentName={
              dashboardData?.profile.establishmentId ? dashboardData.profile.scopeLabel : undefined
            }
          />
        ) : null}

        <DashSurface>
          <DashFilterBar
            search={query}
            searchPlaceholder="Nom, lieu, établissement, type…"
            onSearchChange={setQuery}
            filters={[
              {
                id: 'type',
                label: 'Type',
                value: type,
                onChange: setType,
                options: [
                  { value: '', label: 'Tous les types' },
                  ...activityTypes.map((item) => ({ value: item, label: item })),
                ],
              },
              {
                id: 'period',
                label: 'Période',
                value: period,
                onChange: (value) => setPeriod(value as ActivityPeriodFilter),
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
                onChange: (value) => setSort(value as ActivitySortKey),
                options: [
                  { value: 'date-desc', label: 'Plus récentes' },
                  { value: 'date-asc', label: 'Plus anciennes' },
                  { value: 'name-asc', label: 'Nom A → Z' },
                  { value: 'name-desc', label: 'Nom Z → A' },
                  { value: 'type', label: 'Par type' },
                ],
              },
            ]}
          />

          <p className="dash-filter-hint">
            {isLoading
              ? 'Chargement…'
              : `${visible.length.toLocaleString('fr-FR')} activité${visible.length > 1 ? 's' : ''}${
                  visible.length !== activities.length
                    ? ` sur ${activities.length.toLocaleString('fr-FR')}`
                    : ''
                }`}
            {hasActiveFilters ? (
              <>
                {' · '}
                <button
                  type="button"
                  className="activities-filter-reset"
                  onClick={() => {
                    setQuery('');
                    setType('');
                    setPeriod('all');
                    setSort('date-desc');
                  }}
                >
                  Réinitialiser
                </button>
              </>
            ) : null}
          </p>

          <ActivitiesList
            activities={visible}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            emptyMessage={
              activities.length === 0
                ? canCreate
                  ? 'Aucune activité enregistrée. Créez-en une pour ouvrir un dossier.'
                  : 'Aucune activité dans ce périmètre.'
                : 'Aucune activité ne correspond à ces filtres.'
            }
            onCreate={canCreate && activities.length === 0 ? () => setComposeOpen(true) : undefined}
          />
        </DashSurface>
      </AppProPageShell>
    </AppPage>
  );
}
