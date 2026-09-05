import { Bell } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { AppResourceLink } from '@/components/app/navigation/AppResourceLink';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { appRoutes } from '@/content/routes';
import {
  invalidateNotifications,
  notificationQueryHookOptions,
} from '@/lib/query-sync';
import {
  markNotificationReadOptimistic,
  prefetchRequestDetail,
} from '@/lib/prefetch-app-data';
import {
  useListNotifications,
  useMarkNotificationRead,
} from '@workspace/api-client-react';
import { Link } from 'wouter';

function formatRelativeDate(value: string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'À l\'instant';
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function notificationHref(item: {
  resourceType?: string | null;
  resourceId?: string | null;
}): string {
  if (item.resourceType === 'request' && item.resourceId) {
    return appRoutes.requestDetail(item.resourceId);
  }
  return `${appRoutes.profile}?tab=notifications`;
}

export function NotificationBell() {
  const queryClient = useQueryClient();
  const { data } = useListNotifications({ unreadOnly: true }, notificationQueryHookOptions());

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

  const notifications = data?.data ?? [];
  const unreadCount = notifications.length;

  function handleOpenNotification(notificationId: string, isRead: boolean) {
    if (!isRead) {
      markRead.mutate({ id: notificationId });
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="app-pro-icon-btn"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : ''}`}
        >
          <Bell size={18} aria-hidden="true" />
          {unreadCount > 0 ? (
            <span className="app-pro-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent className="app-notif-popover" align="end" sideOffset={8}>
        <header className="app-notif-popover-head">
          <strong>Notifications</strong>
          {unreadCount > 0 ? <span>{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span> : null}
        </header>
        {notifications.length === 0 ? (
          <p className="app-notif-popover-empty">Aucune notification non lue.</p>
        ) : (
          <ul className="app-notif-popover-list">
            {notifications.slice(0, 6).map((item) => {
              const href = notificationHref(item);
              const canPrefetch = item.resourceType === 'request' && item.resourceId;

              return (
                <li key={item.id}>
                  <AppResourceLink
                    href={href}
                    className="app-notif-popover-item app-notif-popover-item--link"
                    ariaLabel={item.title}
                    prefetch={
                      canPrefetch
                        ? () => prefetchRequestDetail(queryClient, item.resourceId!)
                        : undefined
                    }
                    onNavigate={() => handleOpenNotification(item.id, item.isRead)}
                  >
                    <div className="app-notif-popover-copy">
                      <strong>{item.title}</strong>
                      {item.body ? <p>{item.body}</p> : null}
                      <time>{formatRelativeDate(String(item.createdAt))}</time>
                    </div>
                  </AppResourceLink>
                </li>
              );
            })}
          </ul>
        )}
        <footer className="app-notif-popover-foot">
          <Link href={`${appRoutes.profile}?tab=notifications`} className="app-notif-popover-all">
            Toutes les notifications
          </Link>
        </footer>
      </PopoverContent>
    </Popover>
  );
}
