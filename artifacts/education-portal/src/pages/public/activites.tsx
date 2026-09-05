import { CalendarDays, Loader2, MapPin, School } from 'lucide-react';
import { useState } from 'react';

import { PublicPage } from '@/components/portal/PublicPage';
import { PublicPageHero } from '@/components/portal/PublicPageHero';
import { PortalLink } from '@/components/portal/PortalLink';
import { activityTypes } from '@/config/roles';
import { publicPageContent } from '@/content/pages';
import { publicRoutes } from '@/content/routes';
import { useListPublicActivities } from '@workspace/api-client-react';

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Date à confirmer';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const ACTIVITY_TYPE_OPTIONS = activityTypes.map((label) => ({
  value: label,
  label,
}));

export default function ActivitesPubliquesPage() {
  const content = publicPageContent.activites;
  const [activityType, setActivityType] = useState('');

  const { data, isLoading, isError, refetch } = useListPublicActivities({
    page: 1,
    pageSize: 48,
    activityType: activityType || undefined,
  });

  const activities = data?.data ?? [];

  return (
    <PublicPage
      title={content.title}
      description={content.description}
      seoDescription={content.seoDescription}
      variant="editorial"
      breadcrumbs={[
        { label: 'Accueil', href: publicRoutes.home },
        { label: content.title },
      ]}
    >
      <PublicPageHero
        eyebrow="Vie scolaire · Côte d'Ivoire"
        title="Activités scolaires autorisées"
        description={content.intro}
        stats={[
          { value: String(data?.pagination?.total ?? '—'), label: 'Activité(s) publiée(s)' },
          { value: 'DREN → DVS', label: 'Circuit de validation' },
          { value: 'National', label: 'Couverture territoriale' },
        ]}
        actions={[
          { label: 'Galerie des sorties', href: publicRoutes.galerieSorties },
          { label: 'Statistiques publiques', href: publicRoutes.statistiques, variant: 'outline' },
        ]}
      />

      <section className="public-section" aria-labelledby="activites-filters-heading">
        <div className="public-section-head">
          <h2 id="activites-filters-heading">Filtrer les activités</h2>
          <p>Sélectionnez un type d&apos;activité pour affiner la liste.</p>
        </div>
        <div className="public-filter-bar">
          <label htmlFor="activites-type-filter">
            Type d&apos;activité
            <select
              id="activites-type-filter"
              value={activityType}
              onChange={(event) => setActivityType(event.target.value)}
            >
              <option value="">Tous les types</option>
              {ACTIVITY_TYPE_OPTIONS.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="public-section" aria-labelledby="activites-list-heading">
        <div className="public-section-head">
          <h2 id="activites-list-heading">Programme des activités validées</h2>
          <p>
            Seules les activités dont la demande d&apos;autorisation a été validée par la DVS
            sont visibles ici.
          </p>
        </div>

        {isLoading ? (
          <div className="public-inline-status" role="status">
            <Loader2 className="animate-spin" aria-hidden="true" />
            Chargement des activités…
          </div>
        ) : null}

        {isError ? (
          <div className="public-inline-alert" role="alert">
            <p>Impossible de charger les activités pour le moment.</p>
            <button type="button" className="outline-btn" onClick={() => refetch()}>
              Réessayer
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && activities.length === 0 ? (
          <div className="public-inline-status">
            <CalendarDays size={20} aria-hidden="true" />
            <p>Aucune activité publiée pour le moment avec ces critères.</p>
          </div>
        ) : null}

        {!isLoading && !isError && activities.length > 0 ? (
          <ul className="activites-public-list">
            {activities.map((activity) => (
              <li key={activity.id} className="activites-public-card">
                <div className="activites-public-card-head">
                  <span className="activites-public-type">{activity.type}</span>
                  <time dateTime={activity.scheduledAt ?? undefined}>
                    {formatDate(activity.scheduledAt)}
                  </time>
                </div>
                <h3>{activity.title}</h3>
                {activity.description ? <p>{activity.description}</p> : null}
                <dl className="activites-public-meta">
                  <div>
                    <dt>
                      <School size={14} aria-hidden="true" /> Établissement
                    </dt>
                    <dd>
                      <PortalLink href={publicRoutes.establishmentDetail(activity.establishmentId)}>
                        {activity.establishmentName}
                      </PortalLink>
                    </dd>
                  </div>
                  {activity.location ? (
                    <div>
                      <dt>
                        <MapPin size={14} aria-hidden="true" /> Lieu
                      </dt>
                      <dd>{activity.location}</dd>
                    </div>
                  ) : null}
                </dl>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </PublicPage>
  );
}
