import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Search } from 'lucide-react';

import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { DashSurface } from '@/components/dash/DashSurface';
import { REQUEST_STATUS_LABELS } from '@/config/workflow-labels';
import { appRoutes } from '@/content/routes';
import {
  TRACE_KIND_LABELS,
  buildActivityRequestTrace,
  filterTraceEvents,
  summarizeTrace,
  type TraceFilter,
} from '@/lib/admin-trace';
import { liveQueryHookOptions } from '@/lib/query-sync';
import { useListActivities, useListRequests } from '@workspace/api-client-react';

const FILTERS: { id: TraceFilter; label: string }[] = [
  { id: 'all', label: 'Tout le circuit' },
  { id: 'activity', label: 'Activités' },
  { id: 'request', label: 'Dossiers' },
  { id: 'circuit', label: 'Soumissions et décisions' },
  { id: 'orphan', label: 'Sans lien' },
];

function formatDate(value: Date): string {
  return value.toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function AdminActivityTrace() {
  const { data: activitiesData, isLoading: activitiesLoading } = useListActivities(
    { page: 1, pageSize: 100 },
    liveQueryHookOptions(),
  );
  const { data: requestsData, isLoading: requestsLoading } = useListRequests(
    { page: 1, pageSize: 100 },
    liveQueryHookOptions(),
  );

  const [filter, setFilter] = useState<TraceFilter>('all');
  const [query, setQuery] = useState('');

  const activities = activitiesData?.data ?? [];
  const requests = requestsData?.data ?? [];
  const summary = useMemo(() => summarizeTrace(activities, requests), [activities, requests]);
  const events = useMemo(
    () => filterTraceEvents(buildActivityRequestTrace(activities, requests), filter, query),
    [activities, filter, query, requests],
  );

  const loading = activitiesLoading || requestsLoading;

  return (
    <DashSurface className="admin-trace admin-sheet">
      <header className="admin-trace-head">
        <div>
          <h2>Journal activités ↔ demandes</h2>
          <p>Chaque sortie et chaque dossier d’autorisation, avec le lien entre les deux.</p>
        </div>
        <dl className="admin-trace-stats">
          <div>
            <strong>{summary.activities.toLocaleString('fr-FR')}</strong>
            Activités
          </div>
          <div>
            <strong>{summary.requests.toLocaleString('fr-FR')}</strong>
            Dossiers
          </div>
          <div>
            <strong>{summary.linked.toLocaleString('fr-FR')}</strong>
            Liés
          </div>
          <div>
            <strong>{summary.orphanActivities.toLocaleString('fr-FR')}</strong>
            Sans dossier
          </div>
        </dl>
      </header>

      <div className="admin-trace-toolbar">
        <div className="admin-trace-filters" role="group" aria-label="Filtrer le journal">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={filter === item.id ? 'is-active' : undefined}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="admin-trace-search">
          <Search size={15} aria-hidden="true" />
          <span className="sr-only">Rechercher dans le journal</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Activité, établissement, statut…"
          />
        </label>
      </div>

      {loading ? (
        <AppProLoading label="Chargement du journal…" inline />
      ) : events.length === 0 ? (
        <p className="admin-trace-empty">Aucun événement pour ces critères.</p>
      ) : (
        <>
          <div className="admin-trace-table-wrap">
            <table className="admin-trace-table">
              <caption className="sr-only">Traçabilité entre activités scolaires et demandes d’autorisation</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Événement</th>
                  <th scope="col">Objet</th>
                  <th scope="col">Établissement</th>
                  <th scope="col">Statut dossier</th>
                  <th scope="col">Liens</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <time dateTime={event.at.toISOString()}>{formatDate(event.at)}</time>
                    </td>
                    <td>
                      <span className={`admin-trace-kind admin-trace-kind--${event.kind}`}>
                        {TRACE_KIND_LABELS[event.kind]}
                      </span>
                    </td>
                    <td>
                      <span className="admin-trace-title">{event.title}</span>
                      <span className="admin-trace-detail">{event.detail}</span>
                    </td>
                    <td>{event.establishmentName}</td>
                    <td>
                      {event.requestStatus ? REQUEST_STATUS_LABELS[event.requestStatus] ?? event.requestStatus : '—'}
                    </td>
                    <td>
                      <span className="admin-trace-links">
                        {event.activityId ? (
                          <Link href={appRoutes.activities}>Activité</Link>
                        ) : null}
                        {event.requestId ? (
                          <Link href={appRoutes.requestDetail(event.requestId)}>Dossier</Link>
                        ) : null}
                        {!event.activityId && !event.requestId ? '—' : null}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="admin-trace-cards">
            {events.map((event) => (
              <li key={event.id} className="admin-card">
                <p className="admin-card-title">{event.title}</p>
                <p className="admin-card-meta">
                  <time dateTime={event.at.toISOString()}>{formatDate(event.at)}</time>
                  {' · '}
                  {event.establishmentName}
                </p>
                <dl className="admin-card-dl">
                  <div>
                    <dt>Événement</dt>
                    <dd>
                      <span className={`admin-trace-kind admin-trace-kind--${event.kind}`}>
                        {TRACE_KIND_LABELS[event.kind]}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>Détail</dt>
                    <dd>{event.detail}</dd>
                  </div>
                  <div>
                    <dt>Statut</dt>
                    <dd>
                      {event.requestStatus ? REQUEST_STATUS_LABELS[event.requestStatus] ?? event.requestStatus : '—'}
                    </dd>
                  </div>
                </dl>
                <div className="admin-card-actions admin-trace-links">
                  {event.activityId ? <Link href={appRoutes.activities}>Activité</Link> : null}
                  {event.requestId ? (
                    <Link href={appRoutes.requestDetail(event.requestId)}>Dossier</Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </DashSurface>
  );
}
