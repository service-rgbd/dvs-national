import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { AppPage } from '@/components/app/AppPage';
import { NotificationCenter } from '@/components/app/notifications/NotificationCenter';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { DashFilterBar } from '@/components/dash/DashFilterBar';
import { getRequestActorKind } from '@/config/request-permissions';
import {
  groupNotifications,
  notificationCenterIntro,
  type NotificationGroupId,
  type NotificationRecord,
} from '@/lib/notifications';
import { markNotificationReadOptimistic } from '@/lib/prefetch-app-data';
import { invalidateNotifications, liveQueryHookOptions, notificationQueryHookOptions } from '@/lib/query-sync';
import '@/styles/notifications.css';
import {
  useAuthMe,
  useGetAppDashboard,
  useListNotifications,
  useMarkNotificationRead,
} from '@workspace/api-client-react';

type ReadFilter = 'all' | 'unread' | 'read';
type GroupFilter = 'all' | NotificationGroupId;

export default function AppNotificationsPage() {
  const queryClient = useQueryClient();
  const { data: authData, isLoading: authLoading } = useAuthMe();
  const { data: dashboard } = useGetAppDashboard(liveQueryHookOptions());
  const { data: notificationsData, isLoading } = useListNotifications(
    { unreadOnly: false },
    notificationQueryHookOptions(),
  );

  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const [search, setSearch] = useState('');

  const kind = getRequestActorKind(dashboard?.profile.primaryRoleCode ?? '');
  const notifications = (notificationsData?.data ?? []) as NotificationRecord[];
  const unreadCount = notifications.filter((item) => !item.isRead).length;

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

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications
      .filter((item) => {
        if (readFilter === 'unread' && item.isRead) return false;
        if (readFilter === 'read' && !item.isRead) return false;
        if (!query) return true;
        return (
          item.title.toLowerCase().includes(query) ||
          (item.body?.toLowerCase().includes(query) ?? false)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, readFilter, search]);

  const groups = useMemo(() => {
    const all = groupNotifications(filtered, kind);
    if (groupFilter === 'all') return all;
    return all.filter((group) => group.id === groupFilter);
  }, [filtered, groupFilter, kind]);

  const emptyLabel =
    notifications.length === 0
      ? 'Aucune notification sur ce compte.'
      : 'Aucune notification pour ces critères.';

  const description =
    unreadCount > 0
      ? `${unreadCount.toLocaleString('fr-FR')} non lue${unreadCount > 1 ? 's' : ''}`
      : dashboard
        ? `${dashboard.profile.primaryRoleLabel} · ${dashboard.profile.scopeLabel}`
        : notificationCenterIntro(kind);

  return (
    <AppPage title="Notifications" description={description}>
      <AppProPageShell>
        {authLoading || isLoading || !authData?.user ? (
          <AppProLoading label="Chargement des notifications…" inline />
        ) : (
          <div className="notif-page">
            <DashFilterBar
              search={search}
              searchPlaceholder="Rechercher une notification"
              onSearchChange={setSearch}
              filters={[
                {
                  id: 'read',
                  label: 'Statut de lecture',
                  value: readFilter,
                  onChange: (value) => setReadFilter(value as ReadFilter),
                  options: [
                    { value: 'all', label: `Toutes (${notifications.length})` },
                    { value: 'unread', label: `Non lues (${unreadCount})` },
                    {
                      value: 'read',
                      label: `Lues (${Math.max(0, notifications.length - unreadCount)})`,
                    },
                  ],
                },
                {
                  id: 'group',
                  label: 'Type',
                  value: groupFilter,
                  onChange: (value) => setGroupFilter(value as GroupFilter),
                  options: [
                    { value: 'all', label: 'Tous les types' },
                    { value: 'inbox', label: kind === 'drena' ? 'À analyser' : kind === 'dvs' ? 'Transmissions' : 'Retours' },
                    { value: 'circuit', label: 'Circuit' },
                    { value: 'activities', label: 'Activités' },
                    { value: 'other', label: 'Autres' },
                  ],
                },
              ]}
            />

            <NotificationCenter
              groups={groups}
              kind={kind}
              emptyLabel={emptyLabel}
              onMarkRead={(id) => markRead.mutate({ id })}
            />
          </div>
        )}
      </AppProPageShell>
    </AppPage>
  );
}
