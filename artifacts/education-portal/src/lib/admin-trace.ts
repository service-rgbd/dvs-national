import type { ActivitySummary, RequestSummary } from '@workspace/api-client-react';

export type TraceKind = 'activity' | 'request' | 'submitted' | 'decision';
export type TraceFilter = 'all' | 'activity' | 'request' | 'circuit' | 'orphan';

export type TraceEvent = {
  id: string;
  kind: TraceKind;
  at: Date;
  title: string;
  detail: string;
  establishmentName: string;
  activityId: string | null;
  activityTitle: string | null;
  requestId: string | null;
  requestStatus: string | null;
};

function asDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function buildActivityRequestTrace(
  activities: ActivitySummary[],
  requests: RequestSummary[],
): TraceEvent[] {
  const requestsByActivity = new Map<string, RequestSummary[]>();
  for (const request of requests) {
    if (!request.activityId) continue;
    const list = requestsByActivity.get(request.activityId) ?? [];
    list.push(request);
    requestsByActivity.set(request.activityId, list);
  }

  const events: TraceEvent[] = [];

  for (const activity of activities) {
    const linked = requestsByActivity.get(activity.id) ?? [];
    const createdAt = asDate(activity.createdAt);
    if (!createdAt) continue;

    events.push({
      id: `activity-${activity.id}`,
      kind: 'activity',
      at: createdAt,
      title: activity.title,
      detail: linked.length === 0 ? `${activity.type} · aucun dossier` : `${activity.type} · ${linked.length} dossier${linked.length > 1 ? 's' : ''}`,
      establishmentName: activity.establishmentName,
      activityId: activity.id,
      activityTitle: activity.title,
      requestId: linked[0]?.id ?? null,
      requestStatus: linked[0]?.status ?? null,
    });
  }

  for (const request of requests) {
    const openedAt = asDate(request.createdAt);
    if (openedAt) {
      events.push({
        id: `request-${request.id}`,
        kind: 'request',
        at: openedAt,
        title: request.activityTitle ?? "Demande d'autorisation",
        detail: request.activityId ? 'Dossier ouvert depuis une activité' : 'Dossier sans activité liée',
        establishmentName: request.establishmentName,
        activityId: request.activityId ?? null,
        activityTitle: request.activityTitle ?? null,
        requestId: request.id,
        requestStatus: request.status,
      });
    }

    const submittedAt = asDate(request.submittedAt);
    if (submittedAt) {
      events.push({
        id: `submitted-${request.id}`,
        kind: 'submitted',
        at: submittedAt,
        title: request.activityTitle ?? "Demande d'autorisation",
        detail: 'Soumis à la DREN',
        establishmentName: request.establishmentName,
        activityId: request.activityId ?? null,
        activityTitle: request.activityTitle ?? null,
        requestId: request.id,
        requestStatus: request.status,
      });
    }

    const decidedAt = asDate(request.decidedAt);
    if (decidedAt) {
      events.push({
        id: `decision-${request.id}`,
        kind: 'decision',
        at: decidedAt,
        title: request.activityTitle ?? "Demande d'autorisation",
        detail: request.decisionReason?.trim() || 'Décision enregistrée',
        establishmentName: request.establishmentName,
        activityId: request.activityId ?? null,
        activityTitle: request.activityTitle ?? null,
        requestId: request.id,
        requestStatus: request.status,
      });
    }
  }

  return events.sort((a, b) => b.at.getTime() - a.at.getTime());
}

export function summarizeTrace(activities: ActivitySummary[], requests: RequestSummary[]) {
  const linkedActivityIds = new Set(
    requests.map((request) => request.activityId).filter((id): id is string => Boolean(id)),
  );
  const orphanActivities = activities.filter((activity) => !linkedActivityIds.has(activity.id)).length;
  const orphanRequests = requests.filter((request) => !request.activityId).length;

  return {
    activities: activities.length,
    requests: requests.length,
    linked: linkedActivityIds.size,
    orphanActivities,
    orphanRequests,
  };
}

export function filterTraceEvents(
  events: TraceEvent[],
  filter: TraceFilter,
  query: string,
): TraceEvent[] {
  const needle = query.trim().toLowerCase();

  return events.filter((event) => {
    if (filter === 'activity' && event.kind !== 'activity') return false;
    if (filter === 'request' && event.kind !== 'request') return false;
    if (filter === 'circuit' && event.kind !== 'submitted' && event.kind !== 'decision') return false;
    if (filter === 'orphan') {
      const isOrphanActivity = event.kind === 'activity' && !event.requestId;
      const isOrphanRequest = event.kind === 'request' && !event.activityId;
      if (!isOrphanActivity && !isOrphanRequest) return false;
    }
    if (!needle) return true;
    return (
      event.title.toLowerCase().includes(needle) ||
      event.detail.toLowerCase().includes(needle) ||
      event.establishmentName.toLowerCase().includes(needle) ||
      (event.activityTitle?.toLowerCase().includes(needle) ?? false) ||
      (event.requestStatus?.toLowerCase().includes(needle) ?? false)
    );
  });
}

export const TRACE_KIND_LABELS: Record<TraceKind, string> = {
  activity: 'Activité créée',
  request: 'Dossier ouvert',
  submitted: 'Soumis à la DREN',
  decision: 'Décision',
};
