import { useQueryClient } from '@tanstack/react-query';

import { DashboardFeedPanel, DashboardFeedRow } from '@/components/app/dashboard/DashboardFeedPanel';
import { appRoutes } from '@/content/routes';
import { prefetchRequestDetail } from '@/lib/prefetch-app-data';

type NotificationItem = {
  id: string;
  title: string;
  body?: string | null;
  createdAt: string;
  resourceType?: string | null;
  resourceId?: string | null;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

type DashboardNotificationsFeedProps = {
  notifications: NotificationItem[];
};

export function DashboardNotificationsFeed({ notifications }: DashboardNotificationsFeedProps) {
  const queryClient = useQueryClient();

  return (
    <DashboardFeedPanel
      title="Notifications"
      headingId="dash-notifications-heading"
      isEmpty={notifications.length === 0}
      emptyMessage="Aucune notification récente."
      footerHref={`${appRoutes.profile}?tab=notifications`}
      footerLabel="Centre de notifications"
    >
      <ul className="dash-feed-rows">
        {notifications.slice(0, 5).map((notification) => {
          const href =
            notification.resourceType === 'request' && notification.resourceId
              ? appRoutes.requestDetail(notification.resourceId)
              : `${appRoutes.profile}?tab=notifications`;

          return (
            <li key={notification.id}>
              <DashboardFeedRow
                href={href}
                onPrefetch={
                  notification.resourceType === 'request' && notification.resourceId
                    ? () => prefetchRequestDetail(queryClient, notification.resourceId!)
                    : undefined
                }
                ariaLabel={notification.title}
                title={notification.title}
                meta={notification.body ?? undefined}
                date={formatDate(notification.createdAt)}
              />
            </li>
          );
        })}
      </ul>
    </DashboardFeedPanel>
  );
}
