import { ArrowRight, CalendarDays, ClipboardList, MapPin, Plus } from 'lucide-react';
import { Link } from 'wouter';
import type { AppDashboardResponse, ActivitySummary } from '@workspace/api-client-react';

import { appRoutes } from '@/content/routes';

type ActivityScopeBannerProps = {
  profile: AppDashboardResponse['profile'];
  kpis: AppDashboardResponse['kpis'];
  listedCount: number;
};

export function ActivityScopeBanner({ profile, kpis, listedCount }: ActivityScopeBannerProps) {
  return (
    <section className="activity-scope-banner" aria-labelledby="activity-scope-heading">
      <div className="activity-scope-banner-main">
        <div className="activity-scope-banner-icon" aria-hidden="true">
          <CalendarDays size={22} strokeWidth={1.75} />
        </div>
        <div className="activity-scope-banner-copy">
          <p className="activity-scope-banner-eyebrow">Module activités scolaires</p>
          <h2 id="activity-scope-heading">Planifier avant d&apos;autoriser</h2>
          <p className="activity-scope-banner-desc">
            Périmètre <strong>{profile.scopeLabel}</strong> · {profile.primaryRoleLabel}. Créez une
            activité puis lancez une demande d&apos;autorisation depuis le module Demandes.
          </p>
        </div>
      </div>

      <ul className="activity-scope-banner-stats">
        <li>
          <CalendarDays size={16} aria-hidden="true" />
          <div>
            <strong>{listedCount.toLocaleString('fr-FR')}</strong>
            <span>Affichées ici</span>
          </div>
        </li>
        <li>
          <CalendarDays size={16} aria-hidden="true" />
          <div>
            <strong>{kpis.activities.toLocaleString('fr-FR')}</strong>
            <span>Total périmètre</span>
          </div>
        </li>
        <li>
          <ClipboardList size={16} aria-hidden="true" />
          <div>
            <strong>{kpis.requestsPending.toLocaleString('fr-FR')}</strong>
            <span>Demandes en attente</span>
          </div>
        </li>
      </ul>

      <Link href={appRoutes.requests} className="activity-scope-banner-cta">
        Initier une demande
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </section>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

type ActivitiesListProps = {
  activities: ActivitySummary[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function ActivitiesList({ activities, isLoading, isError, onRetry }: ActivitiesListProps) {
  if (isLoading) {
    return (
      <div className="activities-list-state" role="status">
        Chargement des activités…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="activities-list-state activities-list-state--error" role="alert">
        <p>Impossible de charger les activités.</p>
        <button type="button" className="btn-secondary" onClick={onRetry}>
          Réessayer
        </button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="activities-list-empty">
        <Plus size={28} strokeWidth={1.5} aria-hidden="true" />
        <p><strong>Aucune activité enregistrée</strong></p>
        <p>Utilisez le formulaire à droite pour créer votre première activité scolaire.</p>
      </div>
    );
  }

  return (
    <div className="activities-list-wrap">
      <table className="activities-table">
        <caption className="sr-only">Liste des activités scolaires du périmètre</caption>
        <thead>
          <tr>
            <th scope="col">Activité</th>
            <th scope="col">Établissement</th>
            <th scope="col">Lieu</th>
            <th scope="col">Créée le</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id}>
              <td>
                <div className="activities-table-primary">
                  <span className="app-pro-tag">{activity.type}</span>
                  <strong>{activity.title}</strong>
                  {activity.description ? (
                    <p className="activities-table-desc">{activity.description}</p>
                  ) : null}
                </div>
              </td>
              <td>{activity.establishmentName}</td>
              <td>
                {activity.location ? (
                  <span className="activities-table-location">
                    <MapPin size={13} aria-hidden="true" />
                    {activity.location}
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td>
                <time dateTime={activity.createdAt}>{formatDate(activity.createdAt)}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
