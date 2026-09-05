import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { AppPage } from '@/components/app/AppPage';
import {
  ProfileHead,
  ProfileIdentity,
  ProfileNotifications,
  ProfileRoles,
  ProfileTabs,
} from '@/components/app/profile/ProfileWorkspace';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { appRoutes } from '@/content/routes';
import '@/styles/profile.css';
import {
  invalidateNotifications,
  liveQueryHookOptions,
  notificationQueryHookOptions,
} from '@/lib/query-sync';
import { markNotificationReadOptimistic } from '@/lib/prefetch-app-data';
import {
  useAuthMe,
  useGetAppDashboard,
  useListNotifications,
  useMarkNotificationRead,
} from '@workspace/api-client-react';

type ProfileTabId = 'identity' | 'roles' | 'notifications';
type NotificationFilter = 'all' | 'unread' | 'read';
type NotificationSort = 'date' | 'title';
type SortOrder = 'asc' | 'desc';

export default function AppProfilePage() {
  const [location] = useLocation();
  const { data, isLoading } = useAuthMe();
  const { data: dashboardData } = useGetAppDashboard(liveQueryHookOptions());
  const user = data?.user;
  const queryClient = useQueryClient();
  const { data: notificationsData } = useListNotifications(
    { unreadOnly: false },
    notificationQueryHookOptions(),
  );

  const tabFromUrl = useMemo((): ProfileTabId => {
    const query = location.split('?')[1] ?? '';
    const tab = new URLSearchParams(query).get('tab');
    if (tab === 'notifications' || tab === 'roles' || tab === 'identity') return tab;
    return 'identity';
  }, [location]);

  const [activeTab, setActiveTab] = useState<ProfileTabId>(tabFromUrl);
  const [notificationFilter, setNotificationFilter] = useState<NotificationFilter>('all');
  const [notificationSort, setNotificationSort] = useState<NotificationSort>('date');
  const [notificationOrder, setNotificationOrder] = useState<SortOrder>('desc');
  const [notificationSearch, setNotificationSearch] = useState('');

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const markRead = useMarkNotificationRead({
    mutation: {
      onMutate: async ({ id }) => {
        markNotificationReadOptimistic(queryClient, id);
      },
      onSettled: async () => {
        await invalidateNotifications(queryClient);
      },
    },
  });

  const notifications = notificationsData?.data ?? [];
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const filteredNotifications = useMemo(() => {
    const query = notificationSearch.trim().toLowerCase();

    let rows = notifications.filter((item) => {
      if (notificationFilter === 'unread' && item.isRead) return false;
      if (notificationFilter === 'read' && !item.isRead) return false;
      if (!query) return true;
      return (
        item.title.toLowerCase().includes(query) ||
        (item.body?.toLowerCase().includes(query) ?? false)
      );
    });

    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      if (notificationSort === 'date') {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        cmp = a.title.localeCompare(b.title, 'fr');
      }
      return notificationOrder === 'asc' ? cmp : -cmp;
    });

    return rows;
  }, [notificationFilter, notificationOrder, notificationSearch, notificationSort, notifications]);

  const canAccessAdmin = user?.roles.some(
    (role) => role.code === 'dvs_director' || role.code === 'dvs_staff',
  );

  return (
    <AppPage
      title="Mon profil"
      description="Identité, rôles RBAC et centre de notifications."
      action={
        canAccessAdmin ? (
          <Link href={appRoutes.administration} className="dash-panel-link app-pro-header-action">
            Administration <ArrowRight size={14} aria-hidden="true" />
          </Link>
        ) : undefined
      }
    >
      <AppProPageShell>
        {isLoading || !user ? (
          <AppProLoading label="Chargement du profil…" inline />
        ) : (
          <article className="profile-shell">
            <ProfileHead
              user={user}
              scopeLabel={dashboardData?.profile.scopeLabel}
              primaryRoleLabel={dashboardData?.profile.primaryRoleLabel}
              unreadCount={unreadCount}
            />
            <ProfileTabs
              activeTab={activeTab}
              unreadCount={unreadCount}
              onChange={setActiveTab}
            />
            <div className="profile-body">
              {activeTab === 'identity' ? <ProfileIdentity user={user} /> : null}
              {activeTab === 'roles' ? (
                <ProfileRoles
                  user={user}
                  scopeLabel={dashboardData?.profile.scopeLabel}
                  primaryRoleLabel={dashboardData?.profile.primaryRoleLabel}
                />
              ) : null}
              {activeTab === 'notifications' ? (
                <ProfileNotifications
                  notifications={filteredNotifications}
                  unreadCount={unreadCount}
                  search={notificationSearch}
                  filter={notificationFilter}
                  sort={notificationSort}
                  order={notificationOrder}
                  onSearchChange={setNotificationSearch}
                  onFilterChange={setNotificationFilter}
                  onSortChange={setNotificationSort}
                  onOrderChange={setNotificationOrder}
                  onReset={() => {
                    setNotificationSearch('');
                    setNotificationFilter('all');
                    setNotificationSort('date');
                    setNotificationOrder('desc');
                  }}
                  onMarkRead={(id) => markRead.mutate({ id })}
                />
              ) : null}
            </div>
          </article>
        )}
      </AppProPageShell>
    </AppPage>
  );
}
