import { useQueryClient } from '@tanstack/react-query';

import { DashboardFeedPanel, DashboardFeedRow } from '@/components/app/dashboard/DashboardFeedPanel';
import { appRoutes } from '@/content/routes';
import { REQUEST_STATUS_LABELS, statusBadgeClass } from '@/config/workflow-labels';
import { prefetchRequestDetail } from '@/lib/prefetch-app-data';
import type { RequestSummary } from '@workspace/api-client-react';

type ActivityItem = {
  id: string;
  title: string;
  establishmentName: string;
  type: string;
  createdAt: string;
};

type DashboardRecentFeedsProps = {
  requests: RequestSummary[];
  activities: ActivityItem[];
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

function RecentRequestsFeed({ requests }: { requests: RequestSummary[] }) {
  const queryClient = useQueryClient();

  return (
    <DashboardFeedPanel
      title="Demandes récentes"
      headingId="dash-requests-heading"
      isEmpty={requests.length === 0}
      emptyMessage="Aucune demande enregistrée."
      footerHref={appRoutes.requests}
      footerLabel="Toutes les demandes"
    >
      <ul className="dash-feed-rows">
        {requests.map((request) => (
          <li key={request.id}>
            <DashboardFeedRow
              href={appRoutes.requestDetail(request.id)}
              onPrefetch={() => prefetchRequestDetail(queryClient, request.id)}
              ariaLabel={`Ouvrir le dossier ${request.activityTitle ?? 'demande'} — ${REQUEST_STATUS_LABELS[request.status]}`}
              badge={
                <span className={statusBadgeClass(request.status)}>
                  {REQUEST_STATUS_LABELS[request.status] ?? request.status}
                </span>
              }
              title={request.activityTitle ?? "Demande d'autorisation"}
              meta={request.establishmentName}
              date={formatDate(String(request.updatedAt))}
            />
          </li>
        ))}
      </ul>
    </DashboardFeedPanel>
  );
}

function RecentActivitiesFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <DashboardFeedPanel
      title="Activités récentes"
      headingId="dash-activities-heading"
      isEmpty={activities.length === 0}
      emptyMessage="Aucune activité enregistrée."
      footerHref={appRoutes.activities}
      footerLabel="Toutes les activités"
    >
      <ul className="dash-feed-rows">
        {activities.map((activity) => (
          <li key={activity.id}>
            <DashboardFeedRow
              href={appRoutes.activities}
              ariaLabel={`Voir les activités — ${activity.title}`}
              title={activity.title}
              meta={`${activity.establishmentName} · ${activity.type}`}
              date={formatDate(activity.createdAt)}
            />
          </li>
        ))}
      </ul>
    </DashboardFeedPanel>
  );
}

export function DashboardRecentFeeds({ requests, activities }: DashboardRecentFeedsProps) {
  return (
    <section className="dash-feed-section dash-feed-section--2col" aria-label="Activité récente">
      <RecentRequestsFeed requests={requests} />
      <RecentActivitiesFeed activities={activities} />
    </section>
  );
}
