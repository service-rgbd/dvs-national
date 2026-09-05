import { FormEvent, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import type { RequestStatusParamParameter } from '@workspace/api-client-react';

import { AppPage } from '@/components/app/AppPage';
import { RequestActorPanel } from '@/components/app/requests/RequestActorPanel';
import { RequestCreationSteps } from '@/components/app/requests/RequestCreationSteps';
import { RequestCreateForm } from '@/components/app/requests/RequestCreateForm';
import {
  RequestsList,
  RequestScopeBanner,
} from '@/components/app/requests/RequestWorkspace';
import { RequestStatusNav } from '@/components/app/requests/RequestStatusNav';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { AppProPanel } from '@/components/app/pro/AppProPanel';
import { canCreateRequest, getRequestActorConfig } from '@/config/request-permissions';
import { requestFilterLabel } from '@/config/request-status-filters';
import { appRoutes } from '@/content/routes';
import { prefetchRequestDetail } from '@/lib/prefetch-app-data';
import '@/styles/requests.css';
import {
  invalidateAfterRequestWorkflow,
  liveQueryHookOptions,
} from '@/lib/query-sync';
import {
  useCreateRequest,
  useGetAppDashboard,
  useListActivities,
  useListRequests,
} from '@workspace/api-client-react';

export default function AppRequestsPage() {
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  const [activityId, setActivityId] = useState('');
  const [description, setDescription] = useState('');

  const statusFilter = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('status') ?? undefined;
  }, [location]);

  const { data: dashboardData, isLoading: dashboardLoading } = useGetAppDashboard(liveQueryHookOptions());
  const { data: activitiesData } = useListActivities(
    { page: 1, pageSize: 50 },
    liveQueryHookOptions(),
  );
  const { data, isLoading, isError, refetch } = useListRequests(
    {
      page: 1,
      pageSize: 20,
      status: statusFilter as RequestStatusParamParameter | undefined,
    },
    liveQueryHookOptions(),
  );

  const createRequest = useCreateRequest({
    mutation: {
      onSuccess: async (result) => {
        await invalidateAfterRequestWorkflow(queryClient);
        prefetchRequestDetail(queryClient, result.id);
        navigate(appRoutes.requestDetail(result.id));
      },
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activityId) return;
    createRequest.mutate({
      data: {
        activityId,
        description: description.trim() || undefined,
      },
    });
  }

  const requests = data?.data ?? [];
  const activities = activitiesData?.data ?? [];
  const filterLabel = statusFilter ? requestFilterLabel(statusFilter) : undefined;
  const profile = dashboardData?.profile;
  const canCreate = profile ? canCreateRequest(profile.primaryRoleCode) : false;
  const actorConfig = profile ? getRequestActorConfig(profile) : null;
  const listTitle =
    filterLabel ??
    (actorConfig?.kind === 'establishment'
      ? 'Mes dossiers'
      : actorConfig?.kind === 'drena'
        ? 'Dossiers à instruire'
        : 'Dossiers du périmètre');

  return (
    <AppPage
      title="Demandes d'autorisation"
      description="Workflow Établissement → DREN → DVS."
    >
      <AppProPageShell>
        {canCreate ? (
          <RequestCreationSteps hasActivities={activities.length > 0} />
        ) : dashboardData ? (
          <RequestScopeBanner
            profile={dashboardData.profile}
            kpis={dashboardData.kpis}
            listedCount={requests.length}
            statusFilterLabel={filterLabel !== 'Tous' ? filterLabel : undefined}
          />
        ) : null}

        <RequestStatusNav actorKind={actorConfig?.kind} />

        <div
          className={`dash-workspace dash-workspace--requests${
            canCreate ? '' : ' dash-workspace--requests-review'
          }`}
        >
          <section className="requests-list-section" aria-labelledby="requests-list-heading">
            <AppProPanel
              title={listTitle}
              headingId="requests-list-heading"
              className="requests-list-panel"
              action={
                !dashboardLoading ? (
                  <span className="app-pro-count">
                    {requests.length} dossier(s){statusFilter ? ' · filtre actif' : ''}
                  </span>
                ) : null
              }
            >
              <RequestsList
                requests={requests}
                isLoading={isLoading}
                isError={isError}
                statusFilterLabel={filterLabel}
                canCreate={canCreate}
                onRetry={() => refetch()}
              />
            </AppProPanel>
          </section>

          <aside
            className="requests-aside"
            aria-label={canCreate ? 'Création de demande' : 'Guide profil et workflow'}
          >
            {canCreate && profile ? (
              <RequestCreateForm
                activities={activities}
                activityId={activityId}
                description={description}
                isPending={createRequest.isPending}
                onActivityChange={setActivityId}
                onDescriptionChange={setDescription}
                onSubmit={handleSubmit}
              />
            ) : profile ? (
              <AppProPanel
                title="Votre rôle dans le circuit"
                headingId="request-actor-heading"
                className="request-actor-panel-wrap"
              >
                <RequestActorPanel profile={profile} />
              </AppProPanel>
            ) : null}
          </aside>
        </div>
      </AppProPageShell>
    </AppPage>
  );
}
