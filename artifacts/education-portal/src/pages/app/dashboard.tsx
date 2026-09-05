import { Link } from 'wouter';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FolderOpen,
  Loader2,
} from 'lucide-react';

import { AppPage } from '@/components/app/AppPage';
import { DashboardNotificationsFeed } from '@/components/app/dashboard/DashboardNotificationsFeed';
import { DashboardRecentFeeds } from '@/components/app/dashboard/DashboardRecentFeeds';
import { DashStatBar } from '@/components/app/dashboard/DashStatBar';
import { RequestStatusDonut } from '@/components/app/dashboard/RequestStatusDonut';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { dashboardHeadlines } from '@/config/app-modules';
import type { UserProfileId } from '@/config/roles';
import { appRoutes } from '@/content/routes';
import { liveQueryHookOptions, notificationQueryHookOptions } from '@/lib/query-sync';
import {
  useAuthMe,
  useGetAppDashboard,
  useGetAppStatistics,
  useListActivities,
  useListNotifications,
  useListRequests,
} from '@workspace/api-client-react';

function buildStandardKpis(
  primaryRole: UserProfileId,
  kpis: {
    establishments: number;
    activities: number;
    requestsPending: number;
    requestsUnderReview: number;
  },
) {
  const isEstablishment =
    primaryRole === 'school_head_primary' || primaryRole === 'school_head_secondary';

  if (primaryRole === 'drena_manager') {
    return [
      {
        label: 'À instruire',
        value: kpis.requestsPending,
        hint: 'Soumises par les établissements',
        icon: ClipboardList,
        tone: 'accent' as const,
      },
      {
        label: 'En analyse',
        value: kpis.requestsUnderReview,
        hint: 'Dossiers en cours DRENA',
        icon: FolderOpen,
        tone: 'primary' as const,
      },
      {
        label: 'Activités',
        value: kpis.activities,
        hint: 'Périmètre régional',
        icon: CalendarDays,
        tone: 'neutral' as const,
      },
    ];
  }

  if (isEstablishment) {
    return [
      {
        label: 'Mes activités',
        value: kpis.activities,
        hint: 'Programmées',
        icon: CalendarDays,
        tone: 'primary' as const,
      },
      {
        label: 'En attente',
        value: kpis.requestsPending,
        hint: 'Soumission / correction',
        icon: ClipboardList,
        tone: 'accent' as const,
      },
      {
        label: 'En analyse',
        value: kpis.requestsUnderReview,
        hint: 'Circuit DREN / DVS',
        icon: FolderOpen,
        tone: 'neutral' as const,
      },
    ];
  }

  return [
    {
      label: 'Établissements',
      value: kpis.establishments,
      hint: 'Référentiel',
      icon: Building2,
      tone: 'neutral' as const,
    },
    {
      label: 'Activités',
      value: kpis.activities,
      hint: 'Scolaires',
      icon: CalendarDays,
      tone: 'primary' as const,
    },
    {
      label: 'En attente',
      value: kpis.requestsPending,
      hint: 'Demandes',
      icon: ClipboardList,
      tone: 'accent' as const,
    },
    {
      label: 'En analyse',
      value: kpis.requestsUnderReview,
      hint: 'DREN / DVS',
      icon: FolderOpen,
      tone: 'neutral' as const,
    },
  ];
}

function StandardDashboard() {
  const { data: authData } = useAuthMe();
  const { data, isLoading, isError, refetch } = useGetAppDashboard(liveQueryHookOptions());
  const { data: requestsData } = useListRequests(
    { page: 1, pageSize: 6 },
    liveQueryHookOptions(),
  );
  const { data: activitiesData } = useListActivities(
    { page: 1, pageSize: 6 },
    liveQueryHookOptions(),
  );
  const { data: notificationsData } = useListNotifications(
    { unreadOnly: false },
    notificationQueryHookOptions(),
  );

  const user = authData?.user;
  const roleCodes = user?.roles.map((role) => role.code) ?? [];
  const primaryRole = (data?.profile.primaryRoleCode ?? roleCodes[0] ?? 'unknown') as UserProfileId;
  const headline = dashboardHeadlines[primaryRole] ?? 'Espace métier PNIGVS';

  if (isLoading) {
    return (
      <AppPage title="Tableau de bord" description="Chargement de votre périmètre…">
        <div className="app-loading" role="status">
          <Loader2 className="animate-spin" aria-hidden="true" />
          <p>Récupération des indicateurs…</p>
        </div>
      </AppPage>
    );
  }

  if (isError || !data) {
    return (
      <AppPage title="Tableau de bord">
        <div className="empty-state" role="alert">
          <h2>Indicateurs indisponibles</h2>
          <p>Impossible de charger le tableau de bord. Vérifiez la connexion à l&apos;API.</p>
          <button type="button" className="btn-secondary" onClick={() => refetch()}>
            Réessayer
          </button>
        </div>
      </AppPage>
    );
  }

  const notifications = (notificationsData?.data ?? []).slice(0, 6);

  return (
    <AppPage title="Tableau de bord" description={headline}>
      <AppProPageShell>
        <div className="dash-v2 dash-v2--home">
          <DashStatBar items={buildStandardKpis(primaryRole, data.kpis)} />

          <div className="dash-workspace dash-workspace--standard">
            <DashboardRecentFeeds
              requests={requestsData?.data ?? []}
              activities={activitiesData?.data ?? []}
            />
            <aside className="dash-workspace-aside" aria-label="Notifications">
              <DashboardNotificationsFeed notifications={notifications} />
            </aside>
          </div>
        </div>
      </AppProPageShell>
    </AppPage>
  );
}

export function DirectorDashboard() {
  const { data: dashboard, isLoading: dashboardLoading } = useGetAppDashboard(liveQueryHookOptions());
  const { data: statistics, isLoading: statsLoading } = useGetAppStatistics(liveQueryHookOptions());
  const { data: requestsData } = useListRequests(
    { page: 1, pageSize: 6 },
    liveQueryHookOptions(),
  );
  const { data: activitiesData } = useListActivities(
    { page: 1, pageSize: 6 },
    liveQueryHookOptions(),
  );
  const { data: notificationsData } = useListNotifications(
    { unreadOnly: false },
    notificationQueryHookOptions(),
  );

  const isLoading = dashboardLoading || statsLoading;

  if (isLoading || !dashboard || !statistics) {
    return (
      <AppPage title="Pilotage national" description="Chargement…" variant="dashboard">
        <AppProLoading label="Chargement du pilotage national…" />
      </AppPage>
    );
  }

  const pendingCount = dashboard.kpis.requestsPending;
  const reviewCount = dashboard.kpis.requestsUnderReview;
  const approvedCount =
    statistics.requestsByStatus.find((item) => item.key === 'approved')?.count ?? 0;

  return (
    <AppPage
      title="Pilotage national"
      description={`${dashboard.profile.scopeLabel} · ${dashboard.profile.primaryRoleLabel}`}
      action={
        <Link href={appRoutes.statistics} className="dash-panel-link app-pro-header-action">
          <BarChart3 size={14} aria-hidden="true" /> Rapports complets
        </Link>
      }
    >
      <AppProPageShell>
        <div className="dash-v2 dash-v2--home">
          <DashStatBar
            items={[
              {
                label: 'À traiter',
                value: pendingCount + reviewCount,
                hint: `${pendingCount} soumises · ${reviewCount} en analyse`,
                icon: ClipboardList,
                tone: 'accent',
              },
              {
                label: 'Validés',
                value: approvedCount,
                hint: 'Décisions favorables',
                icon: CheckCircle2,
                tone: 'primary',
              },
              {
                label: 'Établissements',
                value: dashboard.kpis.establishments,
                hint: dashboard.profile.scopeLabel,
                icon: Building2,
                tone: 'neutral',
              },
            ]}
          />

          <div className="dash-workspace dash-workspace--director">
            <DashboardRecentFeeds
              requests={requestsData?.data ?? []}
              activities={activitiesData?.data ?? []}
            />
            <aside className="dash-workspace-aside" aria-label="Notifications">
              <DashboardNotificationsFeed
                notifications={(notificationsData?.data ?? []).slice(0, 6)}
              />
            </aside>
          </div>

          <section className="dash-stats-compact" aria-labelledby="dash-stats-heading">
            <header className="dash-section-head dash-section-head--tight">
              <h2 id="dash-stats-heading">Répartition des dossiers</h2>
              <Link href={appRoutes.statistics} className="dash-panel-link">
                Détail <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </header>
            <RequestStatusDonut data={statistics.requestsByStatus} />
          </section>
        </div>
      </AppProPageShell>
    </AppPage>
  );
}

export default function AppDashboardPage() {
  const { data: authData } = useAuthMe();
  const roleCodes = authData?.user.roles.map((role) => role.code) ?? [];
  const isDirectorView = roleCodes.some((code) => code === 'dvs_director' || code === 'dvs_staff');

  if (isDirectorView) {
    return <DirectorDashboard />;
  }

  return <StandardDashboard />;
}
