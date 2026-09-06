import { ArrowRight, ClipboardList, FileCheck, FolderOpen, Inbox } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import type { AppDashboardResponse, RequestSummary } from '@workspace/api-client-react';

import {
  canCreateRequest,
  getRequestActorConfig,
} from '@/config/request-permissions';
import { REQUEST_STATUS_LABELS, statusBadgeClass } from '@/config/workflow-labels';
import { appRoutes } from '@/content/routes';
import { prefetchRequestDetail } from '@/lib/prefetch-app-data';

type RequestScopeBannerProps = {
  profile: AppDashboardResponse['profile'];
  kpis: AppDashboardResponse['kpis'];
  listedCount: number;
  statusFilterLabel?: string;
};

export function RequestScopeBanner({
  profile,
  kpis,
  listedCount,
  statusFilterLabel,
}: RequestScopeBannerProps) {
  const actor = getRequestActorConfig(profile);
  const inProgress = kpis.requestsPending + kpis.requestsUnderReview;
  const canCreate = canCreateRequest(profile.primaryRoleCode);

  return (
    <section
      className={`request-scope-banner request-scope-banner--${actor.kind}`}
      aria-labelledby="request-scope-heading"
    >
      <div className="request-scope-banner-main">
        <div className="request-scope-banner-icon" aria-hidden="true">
          <FileCheck size={22} strokeWidth={1.75} />
        </div>
        <div className="request-scope-banner-copy">
          <p className="request-scope-banner-eyebrow">{actor.eyebrow}</p>
          <h2 id="request-scope-heading">{actor.heading}</h2>
          <p className="request-scope-banner-desc">
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

      <ul className="request-scope-banner-stats">
        <li>
          <Inbox size={16} aria-hidden="true" />
          <div>
            <strong>{listedCount.toLocaleString('fr-FR')}</strong>
            <span>Affichés ici</span>
          </div>
        </li>
        <li>
          <ClipboardList size={16} aria-hidden="true" />
          <div>
            <strong>{kpis.requestsPending.toLocaleString('fr-FR')}</strong>
            <span>En attente</span>
          </div>
        </li>
        <li>
          <FolderOpen size={16} aria-hidden="true" />
          <div>
            <strong>{inProgress.toLocaleString('fr-FR')}</strong>
            <span>En cours total</span>
          </div>
        </li>
      </ul>

      {canCreate && actor.cta ? (
        <Link href={actor.cta.href} className="request-scope-banner-cta">
          {actor.cta.label}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      ) : actor.primaryFilter ? (
        <Link href={actor.primaryFilter.href} className="request-scope-banner-cta">
          {actor.primaryFilter.label}
          <ArrowRight size={14} aria-hidden="true" />
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

type RequestsListProps = {
  requests: RequestSummary[];
  isLoading: boolean;
  isError: boolean;
  statusFilterLabel?: string;
  canCreate: boolean;
  onRetry: () => void;
};

export function RequestsList({
  requests,
  isLoading,
  isError,
  statusFilterLabel,
  canCreate,
  onRetry,
}: RequestsListProps) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  function openRequest(requestId: string) {
    navigate(appRoutes.requestDetail(requestId));
  }

  if (isLoading) {
    return (
      <div className="requests-list-state" role="status">
        Chargement des demandes…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="requests-list-state requests-list-state--error" role="alert">
        <p>Impossible de charger les demandes.</p>
        <button type="button" className="btn-secondary" onClick={onRetry}>
          Réessayer
        </button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="requests-list-empty">
        <FileCheck size={28} strokeWidth={1.5} aria-hidden="true" />
        <p>
          <strong>Aucune demande{statusFilterLabel ? ` (${statusFilterLabel.toLowerCase()})` : ''}</strong>
        </p>
        {canCreate ? (
          <p>Créez un dossier à partir d&apos;une activité.</p>
        ) : (
          <p>Aucun dossier pour ce filtre.</p>
        )}
      </div>
    );
  }

  return (
    <div className="requests-list-wrap">
      <table className="requests-table">
        <caption className="sr-only">Liste des demandes d&apos;autorisation du périmètre</caption>
        <thead>
          <tr>
            <th scope="col">Dossier</th>
            <th scope="col">Établissement</th>
            <th scope="col">Soumis le</th>
            <th scope="col">Mis à jour</th>
            <th scope="col">
              <span className="sr-only">Action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => {
            const actionLabel = canCreate
              ? request.status === 'draft'
                ? 'Compléter'
                : request.status === 'returned_for_correction'
                  ? 'Corriger'
                  : 'Ouvrir'
              : 'Instruire';

            return (
              <tr
                key={request.id}
                className="requests-table-row--clickable"
                tabIndex={0}
                role="link"
                aria-label={`${actionLabel} le dossier ${request.activityTitle ?? 'demande'}`}
                onMouseEnter={() => prefetchRequestDetail(queryClient, request.id)}
                onFocus={() => prefetchRequestDetail(queryClient, request.id)}
                onClick={() => openRequest(request.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openRequest(request.id);
                  }
                }}
              >
                <td>
                  <div className="requests-table-primary">
                    <span className={statusBadgeClass(request.status)}>
                      {REQUEST_STATUS_LABELS[request.status] ?? request.status}
                    </span>
                    <strong>{request.activityTitle ?? 'Activité'}</strong>
                    {request.description ? (
                      <p className="requests-table-desc">{request.description}</p>
                    ) : null}
                  </div>
                </td>
                <td>{request.establishmentName}</td>
                <td>
                  <time dateTime={request.submittedAt?.toString()}>
                    {formatDate(request.submittedAt)}
                  </time>
                </td>
                <td>
                  <time dateTime={request.updatedAt.toString()}>{formatDate(request.updatedAt)}</time>
                </td>
                <td className="requests-table-action">
                  <span className="requests-table-link">
                    {actionLabel}
                    <ArrowRight size={13} aria-hidden="true" />
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
