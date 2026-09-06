import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

import { summarizeTrace } from '@/lib/admin-trace';
import { liveQueryHookOptions } from '@/lib/query-sync';
import { appRoutes } from '@/content/routes';
import { useListActivities, useListRequests } from '@workspace/api-client-react';

export function AdminTraceSummary() {
  const { data: activitiesData } = useListActivities({ page: 1, pageSize: 100 }, liveQueryHookOptions());
  const { data: requestsData } = useListRequests({ page: 1, pageSize: 100 }, liveQueryHookOptions());
  const summary = summarizeTrace(activitiesData?.data ?? [], requestsData?.data ?? []);

  return (
    <aside className="admin-trace-summary" aria-label="Traçabilité activités et demandes">
      <div>
        <p className="admin-trace-kicker">Traçabilité</p>
        <strong>Activités ↔ dossiers</strong>
        <p>
          {summary.activities.toLocaleString('fr-FR')} activités · {summary.requests.toLocaleString('fr-FR')} dossiers ·{' '}
          {summary.linked.toLocaleString('fr-FR')} liés · {summary.orphanActivities.toLocaleString('fr-FR')} sans dossier
        </p>
      </div>
      <Link href={appRoutes.adminAudit} className="dash-chip-btn">
        Journal <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </aside>
  );
}
