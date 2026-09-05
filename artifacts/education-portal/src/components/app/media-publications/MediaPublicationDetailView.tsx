import { FormEvent } from 'react';
import {
  AlertTriangle,
  Building2,
  Camera,
  CheckCircle2,
  Circle,
  ImageIcon,
  Loader2,
  MinusCircle,
  Video,
  XCircle,
} from 'lucide-react';
import type {
  AppDashboardProfile,
  MediaPublicationDetail,
  WorkflowAction,
} from '@workspace/api-client-react';

import { getMediaActorKind } from '@/config/media-publication-permissions';
import {
  MEDIA_STATUS_LABELS,
  mediaStatusBadgeClass,
} from '@/config/media-publication-status-filters';
import {
  getMediaIdleActionMessage,
  getMediaStepStates,
  MEDIA_ACTION_HINTS,
  MEDIA_ACTION_LABELS,
  MEDIA_WORKFLOW_PIPELINE,
  sortMediaActions,
  type MediaStepState,
} from '@/config/media-publication-workflow-ui';

type MediaPublicationDetailViewProps = {
  data: MediaPublicationDetail;
  profile?: AppDashboardProfile;
  isPending: boolean;
  rejectReason: string;
  onRejectReasonChange: (value: string) => void;
  onAction: (action: WorkflowAction) => void;
  onRejectSubmit: (event: FormEvent<HTMLFormElement>) => void;
  canReportIncident?: boolean;
  incidentDescription?: string;
  onIncidentDescriptionChange?: (value: string) => void;
  onIncidentSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  isIncidentPending?: boolean;
};

function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StepIcon({ state }: { state: MediaStepState }) {
  if (state === 'completed' || state === 'success') {
    return <CheckCircle2 size={15} aria-hidden="true" />;
  }
  if (state === 'failed') {
    return <XCircle size={15} aria-hidden="true" />;
  }
  if (state === 'muted') {
    return <MinusCircle size={15} aria-hidden="true" />;
  }
  return <Circle size={15} aria-hidden="true" />;
}

function MediaWorkflowStepper({ status }: { status: MediaPublicationDetail['status'] }) {
  const states = getMediaStepStates(status);

  return (
    <div className="media-detail-stepper" aria-label="Progression du dossier média">
      <ol className="media-detail-stepper-list">
        {MEDIA_WORKFLOW_PIPELINE.map((step, index) => {
          const state = states[index];
          const isLast = index === MEDIA_WORKFLOW_PIPELINE.length - 1;
          const connectorState =
            state === 'completed' || state === 'success' ? 'is-done' : 'is-pending';

          return (
            <li
              key={step.id}
              className={`media-detail-step media-detail-step--${state}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <div className="media-detail-step-track">
                {!isLast ? (
                  <span
                    className={`media-detail-step-line ${connectorState}`}
                    aria-hidden="true"
                  />
                ) : null}
                <span className="media-detail-step-marker">
                  <StepIcon state={state} />
                </span>
              </div>
              <p className="media-detail-step-label">{step.label}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function MediaDetailActions({
  data,
  profile,
  isPending,
  rejectReason,
  onRejectReasonChange,
  onAction,
  onRejectSubmit,
}: MediaPublicationDetailViewProps) {
  const actorKind = profile ? getMediaActorKind(profile.primaryRoleCode) : undefined;
  const primaryActions = sortMediaActions(
    data.allowedActions.filter((action) => action !== 'reject'),
  );
  const canReject = data.allowedActions.includes('reject');
  const idleMessage = getMediaIdleActionMessage(data.status, data.allowedActions.length > 0);

  return (
    <section
      className={`media-detail-section media-detail-section--actions${
        actorKind ? ` media-detail-section--actions-${actorKind}` : ''
      }`}
      aria-labelledby="media-actions-heading"
    >
      <header className="media-detail-section-head">
        <h3 id="media-actions-heading">Actions disponibles</h3>
        {profile ? <p>{profile.primaryRoleLabel}</p> : null}
      </header>

      {primaryActions.length > 0 ? (
        <ul className="media-detail-actions-list">
          {primaryActions.map((action) => (
            <li key={action} className={`media-detail-action-item media-detail-action-item--${action}`}>
              <div className="media-detail-action-copy">
                <strong>{MEDIA_ACTION_LABELS[action] ?? action}</strong>
                <p>{MEDIA_ACTION_HINTS[action]}</p>
              </div>
              <button
                type="button"
                className={`media-detail-action-btn media-detail-action-btn--${action}`}
                disabled={isPending}
                onClick={() => onAction(action)}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={15} aria-hidden="true" /> Traitement…
                  </>
                ) : (
                  MEDIA_ACTION_LABELS[action] ?? action
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="media-detail-idle">{idleMessage}</p>
      )}

      {canReject ? (
        <form className="media-detail-reject" onSubmit={onRejectSubmit}>
          <div className="media-detail-reject-head">
            <strong>{MEDIA_ACTION_LABELS.reject}</strong>
            <p>{MEDIA_ACTION_HINTS.reject}</p>
          </div>
          <div className="form-field">
            <label htmlFor="media-reject-reason">Motif du rejet</label>
            <textarea
              id="media-reject-reason"
              className="app-pro-textarea"
              value={rejectReason}
              onChange={(event) => onRejectReasonChange(event.target.value)}
              rows={3}
              required
              placeholder="Expliquez la décision de rejet…"
            />
          </div>
          <button
            type="submit"
            className="media-detail-action-btn media-detail-action-btn--reject"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" size={15} aria-hidden="true" /> Traitement…
              </>
            ) : (
              MEDIA_ACTION_LABELS.reject
            )}
          </button>
        </form>
      ) : null}
    </section>
  );
}

function MediaIncidentSection({
  data,
  canReportIncident,
  incidentDescription = '',
  onIncidentDescriptionChange,
  onIncidentSubmit,
  isIncidentPending = false,
}: Pick<
  MediaPublicationDetailViewProps,
  | 'data'
  | 'canReportIncident'
  | 'incidentDescription'
  | 'onIncidentDescriptionChange'
  | 'onIncidentSubmit'
  | 'isIncidentPending'
>) {
  return (
    <section
      className="media-detail-section media-detail-section--incident"
      aria-labelledby="media-incident-heading"
    >
      <header className="media-detail-section-head">
        <h3 id="media-incident-heading">
          <AlertTriangle size={16} aria-hidden="true" /> Incident de sortie
        </h3>
      </header>

      {data.incidentReported ? (
        <div className="media-detail-incident-reported" role="status">
          <p>
            Un incident a été signalé pour cette sortie
            {data.incidentReportedAt
              ? ` le ${formatDateTime(data.incidentReportedAt)}`
              : ''}
            .
          </p>
          {data.incidentDescription ? (
            <blockquote className="media-detail-incident-quote">{data.incidentDescription}</blockquote>
          ) : null}
        </div>
      ) : canReportIncident && onIncidentSubmit && onIncidentDescriptionChange ? (
        <form className="media-detail-incident-form" onSubmit={onIncidentSubmit}>
          <p className="media-detail-text">
            Si un incident s&apos;est produit pendant la sortie, décrivez-le ici pour informer la
            DREN et la DVS.
          </p>
          <div className="form-field">
            <label htmlFor="media-incident-description">Description de l&apos;incident</label>
            <textarea
              id="media-incident-description"
              className="app-pro-textarea"
              value={incidentDescription}
              onChange={(event) => onIncidentDescriptionChange(event.target.value)}
              rows={4}
              required
              minLength={10}
              placeholder="Nature de l'incident, mesures prises, personnes concernées…"
            />
          </div>
          <button type="submit" className="media-detail-action-btn" disabled={isIncidentPending}>
            {isIncidentPending ? (
              <>
                <Loader2 className="animate-spin" size={15} aria-hidden="true" /> Envoi…
              </>
            ) : (
              'Signaler l\'incident'
            )}
          </button>
        </form>
      ) : (
        <p className="media-detail-text media-detail-text--muted">
          Aucun incident signalé pour cette sortie.
        </p>
      )}
    </section>
  );
}

export function MediaPublicationDetailView(props: MediaPublicationDetailViewProps) {
  const { data } = props;

  return (
    <article className="media-detail-shell">
      <header className="media-detail-head">
        <div className="media-detail-head-main">
          <div className="media-detail-head-icon" aria-hidden="true">
            <Camera size={26} strokeWidth={1.75} />
          </div>
          <div className="media-detail-head-copy">
            <p className="media-detail-head-eyebrow">Publication média de sortie</p>
            <h2 className="media-detail-head-title">{data.title}</h2>
            <p className="media-detail-head-meta">
              <Building2 size={14} aria-hidden="true" />
              {data.establishmentName} · {data.activityTitle}
            </p>
          </div>
        </div>
        <span className={`${mediaStatusBadgeClass(data.status)} media-detail-status-badge`}>
          {MEDIA_STATUS_LABELS[data.status]}
        </span>
      </header>

      <MediaWorkflowStepper status={data.status} />

      <div className="media-detail-body">
        <div className="media-detail-main">
          <section className="media-detail-section" aria-labelledby="media-info-heading">
            <header className="media-detail-section-head">
              <h3 id="media-info-heading">Informations du dossier</h3>
            </header>

            <dl className="media-detail-dates">
              <div>
                <dt>Créé le</dt>
                <dd>{formatDateTime(data.createdAt)}</dd>
              </div>
              <div>
                <dt>Soumis le</dt>
                <dd>{formatDateTime(data.submittedAt)}</dd>
              </div>
              <div>
                <dt>Validé le</dt>
                <dd>{formatDateTime(data.approvedAt)}</dd>
              </div>
              <div>
                <dt>Publié le</dt>
                <dd>{formatDateTime(data.publishedAt)}</dd>
              </div>
            </dl>

            <div className="media-detail-content">
              <h4 className="media-detail-subheading">Description</h4>
              {data.description ? (
                <p className="media-detail-text">{data.description}</p>
              ) : (
                <p className="media-detail-text media-detail-text--muted">
                  Aucune description complémentaire.
                </p>
              )}

              {data.decisionReason ? (
                <div className="media-detail-decision">
                  <h4 className="media-detail-subheading">Motif de décision</h4>
                  <p className="media-detail-text">{data.decisionReason}</p>
                </div>
              ) : null}
            </div>
          </section>

          <section className="media-detail-section" aria-labelledby="media-files-heading">
            <header className="media-detail-section-head">
              <h3 id="media-files-heading">Fichiers ({data.files.length})</h3>
            </header>

            {data.files.length === 0 ? (
              <p className="media-detail-text media-detail-text--muted">Aucun fichier attaché.</p>
            ) : (
              <ul className="media-detail-files">
                {data.files.map((file) => (
                  <li key={file.id} className="media-detail-file">
                    <span className="media-detail-file-icon" aria-hidden="true">
                      {file.mediaType === 'video' ? <Video size={18} /> : <ImageIcon size={18} />}
                    </span>
                    <div className="media-detail-file-copy">
                      <strong>{file.fileName}</strong>
                      {file.caption ? <p>{file.caption}</p> : null}
                    </div>
                    <a href={file.downloadUrl} className="media-detail-file-link" target="_blank" rel="noreferrer">
                      Ouvrir
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="media-detail-section" aria-labelledby="media-history-heading">
            <header className="media-detail-section-head">
              <h3 id="media-history-heading">Historique du circuit</h3>
            </header>

            {data.history.length === 0 ? (
              <p className="media-detail-text media-detail-text--muted">
                Aucune transition enregistrée.
              </p>
            ) : (
              <ol className="media-detail-timeline">
                {data.history.map((entry, index) => (
                  <li key={entry.id} className={index === 0 ? 'is-latest' : undefined}>
                    <span className="media-detail-timeline-dot" aria-hidden="true" />
                    <div className="media-detail-timeline-body">
                      <div className="media-detail-timeline-status">
                        <span className={mediaStatusBadgeClass(entry.newStatus)}>
                          {MEDIA_STATUS_LABELS[entry.newStatus]}
                        </span>
                        <strong>
                          {entry.previousStatus
                            ? `${MEDIA_STATUS_LABELS[entry.previousStatus]} → ${MEDIA_STATUS_LABELS[entry.newStatus]}`
                            : 'Création du dossier'}
                        </strong>
                      </div>
                      {entry.reason ? (
                        <p className="media-detail-timeline-reason">{entry.reason}</p>
                      ) : null}
                      <time dateTime={String(entry.createdAt)}>
                        {formatDateTime(entry.createdAt)}
                      </time>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <MediaIncidentSection {...props} />
        </div>

        <aside className="media-detail-aside" aria-label="Actions workflow">
          <MediaDetailActions {...props} />
        </aside>
      </div>
    </article>
  );
}
