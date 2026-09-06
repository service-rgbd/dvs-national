import { Link } from 'wouter';
import { ArrowRight, Bell } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { DashSurface } from '@/components/dash/DashSurface';
import { appRoutes } from '@/content/routes';
import { prefetchRequestDetail } from '@/lib/prefetch-app-data';
import { formatShortDate } from '@/lib/pilotage';

type NotificationItem = {
  id: string;
  title: string;
  body?: string | null;
  createdAt: string;
  isRead?: boolean;
  resourceType?: string | null;
  resourceId?: string | null;
};

type DashboardNotificationsFeedProps = {
  notifications: NotificationItem[];
  framed?: boolean;
};

export function DashboardNotificationsFeed({
  notifications,
  framed = true,
}: DashboardNotificationsFeedProps) {
  const queryClient = useQueryClient();
  const items = notifications.slice(0, framed ? 5 : 3);

  const body = (
      <div className="pilot-panel">
        <header className="pilot-notify-head">
          <span className="pilot-notify-icon" aria-hidden="true">
            <Bell size={16} />
          </span>
          <div>
            <h2 id="dash-notifications-heading">Notifications</h2>
            <p>Alertes du circuit d&apos;autorisation.</p>
          </div>
        </header>

        {items.length === 0 ? (
          <p className="pilot-empty">Aucune notification récente sur ce périmètre.</p>
        ) : (
          <ul className="pilot-notify-list">
            {items.map((notification) => {
              const href =
                notification.resourceType === 'request' && notification.resourceId
                  ? appRoutes.requestDetail(notification.resourceId)
                  : appRoutes.notifications;

              return (
                <li key={notification.id}>
                  <Link
                    href={href}
                    className={notification.isRead === false ? 'pilot-notify-item is-unread' : 'pilot-notify-item'}
                    onMouseEnter={() => {
                      if (notification.resourceType === 'request' && notification.resourceId) {
                        void prefetchRequestDetail(queryClient, notification.resourceId);
                      }
                    }}
                  >
                    <span className="pilot-notify-dot" aria-hidden="true" />
                    <span className="pilot-notify-copy">
                      <strong>{notification.title}</strong>
                      {notification.body ? <span>{notification.body}</span> : null}
                    </span>
                    <time>{formatShortDate(notification.createdAt)}</time>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="pilot-panel-foot">
          <Link href={appRoutes.notifications} className="dash-chip-btn">
            Centre de notifications
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
  );

  if (!framed) {
    return body;
  }

  return <DashSurface className="pilot-notify-surface">{body}</DashSurface>;
}
