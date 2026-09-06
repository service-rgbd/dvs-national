import { Bell } from 'lucide-react';
import { Link, useLocation } from 'wouter';

import { appRoutes } from '@/content/routes';
import { notificationQueryHookOptions } from '@/lib/query-sync';
import { useListNotifications } from '@workspace/api-client-react';

export function NotificationBell() {
  const [location] = useLocation();
  const { data } = useListNotifications({ unreadOnly: false }, notificationQueryHookOptions());

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const isActive =
    location === appRoutes.notifications || location.startsWith(`${appRoutes.notifications}?`);

  return (
    <Link
      href={appRoutes.notifications}
      className={`dash-icon-btn dash-icon-btn--ghost${isActive ? ' is-active' : ''}`}
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Bell size={18} aria-hidden="true" />
      {unreadCount > 0 ? (
        <span className="app-pro-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
      ) : null}
    </Link>
  );
}
