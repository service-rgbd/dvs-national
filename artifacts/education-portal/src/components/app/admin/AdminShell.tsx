import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { ArrowRight, User } from 'lucide-react';

import { AdminSectionTabs } from '@/components/app/admin/AdminSectionTabs';
import { AppPage } from '@/components/app/AppPage';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { DashboardKpiBar } from '@/components/app/dashboard/DashboardKpiBar';
import { getAdminSection, type AdminSectionId } from '@/config/admin-sections';
import { appRoutes } from '@/content/routes';
import { useAuthMe, useGetAppDashboard } from '@workspace/api-client-react';

type AdminShellProps = {
  sectionId: AdminSectionId;
  children: ReactNode;
  action?: ReactNode;
};

export function AdminShell({ sectionId, children, action }: AdminShellProps) {
  const section = getAdminSection(sectionId);
  const { data: authData, isLoading: authLoading } = useAuthMe();
  const { data: dashboard } = useGetAppDashboard();
  const user = authData?.user;

  if (authLoading) {
    return (
      <AppPage title="Administration" description="Paramètres et gestion PNIGVS.">
        <AppProLoading label="Chargement des paramètres…" />
      </AppPage>
    );
  }

  return (
    <AppPage
      title={section.label}
      description={section.description}
      breadcrumb={[
        { label: 'Administration', href: appRoutes.administration },
        { label: section.label },
      ]}
      action={
        action ?? (
          <Link href={appRoutes.profile} className="dash-panel-link app-pro-header-action">
            Mon profil <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )
      }
    >
      <AppProPageShell>
        <DashboardKpiBar
          items={
            dashboard
              ? [
                  {
                    label: 'Établissements',
                    value: dashboard.kpis.establishments,
                    hint: dashboard.profile.scopeLabel,
                  },
                  { label: 'Activités', value: dashboard.kpis.activities },
                  {
                    label: 'Demandes actives',
                    value: dashboard.kpis.requestsPending + dashboard.kpis.requestsUnderReview,
                  },
                  {
                    label: 'Profil connecté',
                    value: user?.roles[0]?.label ?? '—',
                    hint: user?.email,
                    icon: User,
                  },
                ]
              : undefined
          }
        />

        <div className="admin-page">
          <AdminSectionTabs />
          <div className="admin-page-main">{children}</div>
        </div>
      </AppProPageShell>
    </AppPage>
  );
}
