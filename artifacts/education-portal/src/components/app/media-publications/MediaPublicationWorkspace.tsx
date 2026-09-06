import { Camera, ImageIcon, Inbox, Plus, Video } from 'lucide-react';
import { Link } from 'wouter';
import type { AppDashboardResponse, MediaPublicationSummary } from '@workspace/api-client-react';

import {
  canCreateMediaPublication,
  getMediaActorConfig,
} from '@/config/media-publication-permissions';
import {
  MEDIA_STATUS_LABELS,
  mediaStatusBadgeClass,
} from '@/config/media-publication-status-filters';
import { appRoutes } from '@/content/routes';

type MediaScopeBannerProps = {
  profile: AppDashboardResponse['profile'];
  listedCount: number;
  statusFilterLabel?: string;
};

export function MediaScopeBanner({
  profile,
  listedCount,
  statusFilterLabel,
}: MediaScopeBannerProps) {
  const actor = getMediaActorConfig(profile);
  const canCreate = canCreateMediaPublication(profile.primaryRoleCode);

  return (
    <section
      className={`media-scope-banner media-scope-banner--${actor.kind}`}
      aria-labelledby="media-scope-heading"
    >
      <div className="media-scope-banner-main">
        <div className="media-scope-banner-icon" aria-hidden="true">
          <Camera size={22} strokeWidth={1.75} />
        </div>
        <div className="media-scope-banner-copy">
          <p className="media-scope-banner-eyebrow">{actor.eyebrow}</p>
          <h2 id="media-scope-heading">{actor.heading}</h2>
          <p className="media-scope-banner-desc">
            Périmètre <strong>{profile.scopeLabel}</strong> · {profile.primaryRoleLabel}.
            {statusFilterLabel ? (
              <>
                {' '}
                Filtre actif : <strong>{statusFilterLabel}</strong>.
              </>
            ) : (
              <> {actor.bannerDescription}</>
            )}
          </p>
        </div>
      </div>

      <ul className="media-scope-banner-stats">
        <li>
          <Inbox size={16} aria-hidden="true" />
          <div>
            <strong>{listedCount.toLocaleString('fr-FR')}</strong>
            <span>Affichés ici</span>
          </div>
        </li>
      </ul>

      {canCreate && actor.cta ? (
        <Link href={actor.cta.href} className="media-scope-banner-cta">
          {actor.cta.label}
        </Link>
      ) : actor.primaryFilter ? (
        <Link href={actor.primaryFilter.href} className="media-scope-banner-cta">
          {actor.primaryFilter.label}
        </Link>
      ) : null}
    </section>
  );
}

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

type MediaPublicationsListProps = {
  publications: MediaPublicationSummary[];
  isLoading: boolean;
  isError: boolean;
  statusFilterLabel?: string;
  canCreate: boolean;
  onRetry: () => void;
  onCreate?: () => void;
  emptyMessage?: string;
};

export function MediaPublicationsList({
  publications,
  isLoading,
  isError,
  statusFilterLabel,
  canCreate,
  onRetry,
  onCreate,
  emptyMessage,
}: MediaPublicationsListProps) {
  if (isLoading) {
    return (
      <div className="media-list-state" role="status">
        Chargement des publications…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="media-list-state media-list-state--error" role="alert">
        <p>Impossible de charger les publications.</p>
        <button type="button" className="btn-secondary" onClick={onRetry}>
          Réessayer
        </button>
      </div>
    );
  }

  if (publications.length === 0) {
    return (
      <div className="media-list-empty">
        <Camera size={28} strokeWidth={1.5} aria-hidden="true" />
        <p>
          <strong>
            Aucune publication
            {statusFilterLabel ? ` (${statusFilterLabel.toLowerCase()})` : ''}
          </strong>
        </p>
        <p>
          {emptyMessage ??
            (canCreate
              ? 'Déposez les photos d’une sortie déjà autorisée.'
              : 'Aucun dossier média dans ce périmètre.')}
        </p>
        {onCreate ? (
          <button type="button" className="dash-chip-btn" onClick={onCreate}>
            <Plus size={14} aria-hidden="true" />
            Nouveau dossier
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <ul className="media-card-grid">
      {publications.map((item) => (
        <li key={item.id}>
          <Link href={appRoutes.mediaPublicationDetail(item.id)} className="media-card">
            <span className="media-card-cover">
              {item.coverDownloadUrl && item.coverMediaType === 'photo' ? (
                <img src={item.coverDownloadUrl} alt="" />
              ) : (
                <span className="media-card-fallback" aria-hidden="true">
                  {item.coverMediaType === 'video' ? <Video size={22} /> : <ImageIcon size={22} />}
                </span>
              )}
              <span className={mediaStatusBadgeClass(item.status)}>
                {MEDIA_STATUS_LABELS[item.status]}
              </span>
            </span>
            <span className="media-card-body">
              <strong>{item.title}</strong>
              <span>
                {item.establishmentName} · {item.activityTitle}
              </span>
              <span className="media-card-meta">
                {item.fileCount} fichier{item.fileCount > 1 ? 's' : ''} · {formatDate(item.updatedAt)}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
