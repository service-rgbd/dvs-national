import type { ReactNode } from 'react';

import { AdminSectionTabs } from '@/components/app/admin/AdminSectionTabs';
import { AppPage } from '@/components/app/AppPage';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { getAdminSection, type AdminSectionId } from '@/config/admin-sections';
import { appRoutes } from '@/content/routes';
import '@/styles/admin-sections.css';
import { useAuthMe } from '@workspace/api-client-react';

type AdminShellProps = {
  sectionId: AdminSectionId;
  children: ReactNode;
  action?: ReactNode;
};

export function AdminShell({ sectionId, children, action }: AdminShellProps) {
  const section = getAdminSection(sectionId);
  const { isLoading: authLoading } = useAuthMe();

  if (authLoading) {
    return (
      <AppPage title="Administration" description="Paramètres et gestion PNIGVS." className="app-pro-page--admin">
        <AppProLoading label="Chargement des paramètres…" />
      </AppPage>
    );
  }

  return (
    <AppPage
      title={section.label}
      description={section.description}
      className="app-pro-page--admin"
      breadcrumb={[
        { label: 'Administration', href: appRoutes.administration },
        { label: section.label },
      ]}
      action={action}
    >
      <AppProPageShell>
        <div className="admin-page">
          <AdminSectionTabs />
          <div className="admin-page-main">{children}</div>
        </div>
      </AppProPageShell>
    </AppPage>
  );
}
