import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import type { RequestStatusParamParameter } from '@workspace/api-client-react';

import { AppPage } from '@/components/app/AppPage';
import { RequestCreateForm } from '@/components/app/requests/RequestCreateForm';
import { RequestsList } from '@/components/app/requests/RequestWorkspace';
import { RequestStatusNav } from '@/components/app/requests/RequestStatusNav';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { DashSurface } from '@/components/dash/DashSurface';
import { canCreateRequest } from '@/config/request-permissions';
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
  const [, navigate] = useLocation();
  const search = useSearch();
  const [activityId, setActivityId] = useState('');
  const [description, setDescription] = useState('');

  const statusFilter = useMemo(() => {
    return new URLSearchParams(search).get('status') ?? undefined;
  }, [search]);

  const requestedActivityId = useMemo(() => {
    return new URLSearchParams(search).get('activity') ?? '';
  }, [search]);

  useEffect(() => {
    if (requestedActivityId) {
      setActivityId(requestedActivityId);
    }
  }, [requestedActivityId]);

  const { data: dashboardData } = useGetAppDashboard(liveQueryHookOptions());
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

  return (
    <AppPage
      title="Demandes"
      description="Circuit Établissement → DREN → DVS."
    >
      <AppProPageShell>
        <div className={`dash-module${canCreate ? ' dash-module--split' : ''}`}>
          <div className="dash-module-main">
            <RequestStatusNav />
            <DashSurface>
              <RequestsList
                requests={requests}
                isLoading={isLoading}
                isError={isError}
                statusFilterLabel={filterLabel}
                canCreate={canCreate}
                onRetry={() => refetch()}
              />
            </DashSurface>
          </div>

          {canCreate ? (
            <aside className="dash-module-aside" aria-label="Nouveau dossier">
              <DashSurface>
                <RequestCreateForm
                  activities={activities}
                  activityId={activityId}
                  description={description}
                  isPending={createRequest.isPending}
                  onActivityChange={setActivityId}
                  onDescriptionChange={setDescription}
                  onSubmit={handleSubmit}
                />
              </DashSurface>
            </aside>
          ) : null}
        </div>
      </AppProPageShell>
    </AppPage>
  );
}
