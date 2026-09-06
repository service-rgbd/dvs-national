import { useEffect } from 'react';
import { Link, Redirect, useLocation } from 'wouter';
import { ArrowRight } from 'lucide-react';

import { AppPage } from '@/components/app/AppPage';
import {
  ProfileAccess,
  ProfileDetails,
  ProfileHead,
} from '@/components/app/profile/ProfileWorkspace';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { DashSurface } from '@/components/dash/DashSurface';
import { appRoutes } from '@/content/routes';
import '@/styles/profile.css';
import { liveQueryHookOptions } from '@/lib/query-sync';
import { useAuthMe, useGetAppDashboard } from '@workspace/api-client-react';

function sectionFromUrl(location: string): 'identity' | 'roles' | 'rights' | 'dren' | 'notifications' {
  const tab = new URLSearchParams(location.split('?')[1] ?? '').get('tab');
  if (tab === 'notifications' || tab === 'roles' || tab === 'identity' || tab === 'dren' || tab === 'rights') {
    return tab;
  }
  return 'identity';
}

export default function AppProfilePage() {
  const [location] = useLocation();
  const { data, isLoading } = useAuthMe();
  const { data: dashboardData } = useGetAppDashboard(liveQueryHookOptions());
  const user = data?.user;
  const section = sectionFromUrl(location);

  useEffect(() => {
    if (section === 'notifications' || section === 'identity' || section === 'dren') return;
    const node = document.getElementById(`profile-${section}`);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [section, user?.id]);

  if (section === 'notifications') {
    return <Redirect to={appRoutes.notifications} />;
  }

  const canAccessAdmin = user?.roles.some(
    (role) => role.code === 'dvs_director' || role.code === 'dvs_staff',
  );

  const description = dashboardData
    ? `${dashboardData.profile.primaryRoleLabel} · ${dashboardData.profile.scopeLabel}`
    : 'Compte agent et habilitations.';

  return (
    <AppPage
      title="Profil"
      description={description}
      action={
        canAccessAdmin ? (
          <Link href={appRoutes.administration} className="dash-chip-btn">
            Administration <ArrowRight size={14} aria-hidden="true" />
          </Link>
        ) : undefined
      }
    >
      <AppProPageShell>
        {isLoading || !user ? (
          <AppProLoading label="Chargement du profil…" inline />
        ) : (
          <div className="profile-page">
            <DashSurface className="profile-sheet">
              <ProfileHead user={user} profile={dashboardData?.profile} />
              <div className="profile-split">
                <ProfileDetails user={user} profile={dashboardData?.profile} />
                <ProfileAccess user={user} profile={dashboardData?.profile} />
              </div>
            </DashSurface>
          </div>
        )}
      </AppProPageShell>
    </AppPage>
  );
}
