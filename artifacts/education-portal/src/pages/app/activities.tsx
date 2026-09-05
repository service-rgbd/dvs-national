import { FormEvent, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';

import { ActivityCreateForm } from '@/components/app/activities/ActivityCreateForm';
import {
  ActivitiesList,
  ActivityScopeBanner,
} from '@/components/app/activities/ActivityWorkspace';
import { AppPage } from '@/components/app/AppPage';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { AppProPanel } from '@/components/app/pro/AppProPanel';
import { appRoutes } from '@/content/routes';
import { activityTypes } from '@/config/roles';
import '@/styles/activities.css';
import { invalidateActivities, invalidateDashboard, liveQueryHookOptions } from '@/lib/query-sync';
import {
  useCreateActivity,
  useGetAppDashboard,
  useListActivities,
} from '@workspace/api-client-react';

export default function AppActivitiesPage() {
  const queryClient = useQueryClient();
  const { data: dashboardData, isLoading: dashboardLoading } = useGetAppDashboard(liveQueryHookOptions());
  const needsEstablishment = !dashboardData?.profile.establishmentId;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<string>(activityTypes[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [establishmentId, setEstablishmentId] = useState('');

  const { data, isLoading, isError, refetch } = useListActivities(
    { page: 1, pageSize: 20 },
    liveQueryHookOptions(),
  );

  const createActivity = useCreateActivity({
    mutation: {
      onSuccess: async () => {
        await Promise.all([invalidateActivities(queryClient), invalidateDashboard(queryClient)]);
        setTitle('');
        setDescription('');
        setLocation('');
        if (needsEstablishment) {
          setEstablishmentId('');
        }
      },
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createActivity.mutate({
      data: {
        title: title.trim(),
        type,
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        establishmentId: needsEstablishment ? establishmentId || undefined : undefined,
      },
    });
  }

  const activities = data?.data ?? [];

  return (
    <AppPage
      title="Activités scolaires"
      description="Planifiez les activités puis initiez une demande d'autorisation depuis le module Demandes."
      action={
        <Link href={appRoutes.requests} className="dash-panel-link app-pro-header-action">
          Aller aux demandes <ArrowRight size={14} aria-hidden="true" />
        </Link>
      }
    >
      <AppProPageShell>
        {dashboardData ? (
          <ActivityScopeBanner
            profile={dashboardData.profile}
            kpis={dashboardData.kpis}
            listedCount={activities.length}
          />
        ) : null}

        <div className="dash-workspace dash-workspace--activities">
          <section className="activities-list-section" aria-labelledby="activities-list-heading">
            <AppProPanel
              title="Activités enregistrées"
              headingId="activities-list-heading"
              className="activities-list-panel"
              action={
                !dashboardLoading ? (
                  <span className="app-pro-count">{activities.length} sur 20 max.</span>
                ) : null
              }
            >
              <ActivitiesList
                activities={activities}
                isLoading={isLoading}
                isError={isError}
                onRetry={() => refetch()}
              />
            </AppProPanel>
          </section>

          <aside className="activities-create-aside" aria-label="Création d'activité">
            <ActivityCreateForm
              needsEstablishment={needsEstablishment}
              title={title}
              type={type}
              description={description}
              location={location}
              establishmentId={establishmentId}
              isPending={createActivity.isPending}
              onTitleChange={setTitle}
              onTypeChange={setType}
              onDescriptionChange={setDescription}
              onLocationChange={setLocation}
              onEstablishmentChange={setEstablishmentId}
              onSubmit={handleSubmit}
            />
          </aside>
        </div>
      </AppProPageShell>
    </AppPage>
  );
}
