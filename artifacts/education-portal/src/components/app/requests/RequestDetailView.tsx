import { FormEvent } from 'react';
import {
  Building2,
  CheckCircle2,
  Circle,
  FileCheck,
  Loader2,
  MinusCircle,
  XCircle,
} from 'lucide-react';
import type {
  AppDashboardProfile,
  RequestDetail,
  WorkflowAction,
} from '@workspace/api-client-react';

import {
  RequestVoyageDecouvertePanel,
} from '@/components/app/requests/RequestVoyageDecouvertePanel';
import {
  getIdleActionMessage,
  getWorkflowStepStates,
  REQUEST_WORKFLOW_PIPELINE,
  sortWorkflowActions,
  WORKFLOW_ACTION_HINTS,
  type WorkflowStepState,
} from '@/config/request-workflow-ui';
import { getRequestActorKind } from '@/config/request-permissions';
import {
  isChecklistComplete,
  isDvsValidationComplete,
} from '@/config/voyage-decouverte-rules';
import {
  REQUEST_STATUS_LABELS,
  WORKFLOW_ACTION_LABELS,
  statusBadgeClass,
} from '@/config/workflow-labels';

type RequestDetailViewProps = {
  data: RequestDetail;
  profile?: AppDashboardProfile;
  isPending: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
  checklistDraft: Record<string, boolean>;
  dvsValidationDraft: Record<string, boolean>;
  onChecklistChange: (id: string, checked: boolean) => void;
  onDvsValidationChange: (id: string, checked: boolean) => void;
  onAction: (action: WorkflowAction) => void;
  onReasonSubmit: (action: WorkflowAction, event: FormEvent<HTMLFormElement>) => void;
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

function StepIcon({ state }: { state: WorkflowStepState }) {
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

function RequestWorkflowStepper({ status }: { status: RequestDetail['status'] }) {
  const states = getWorkflowStepStates(status);

  return (
    <div className="request-detail-stepper" aria-label="Progression du dossier">
      <ol className="request-detail-stepper-list">
        {REQUEST_WORKFLOW_PIPELINE.map((step, index) => {
          const state = states[index];
          const isLast = index === REQUEST_WORKFLOW_PIPELINE.length - 1;
          const connectorState =
            state === 'completed' || state === 'success' ? 'is-done' : 'is-pending';

          return (
            <li
              key={step.id}
              className={`request-detail-step request-detail-step--${state}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <div className="request-detail-step-track">
                {!isLast ? (
                  <span
                    className={`request-detail-step-line ${connectorState}`}
                    aria-hidden="true"
                  />
                ) : null}
                <span className="request-detail-step-marker">
                  <StepIcon state={state} />
                </span>
              </div>
              <p className="request-detail-step-label">{step.label}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

type RequestDetailActionsProps = {
  data: RequestDetail;
  profile?: AppDashboardProfile;
  isPending: boolean;
  reason: string;
  checklistDraft: Record<string, boolean>;
  dvsValidationDraft: Record<string, boolean>;
  onReasonChange: (value: string) => void;
  onAction: (action: WorkflowAction) => void;
  onReasonSubmit: (action: WorkflowAction, event: FormEvent<HTMLFormElement>) => void;
};

const REASON_ACTIONS: WorkflowAction[] = ['reject', 'return_for_correction', 'revoke'];

function RequestDetailActions({
  data,
  profile,
  isPending,
  reason,
  checklistDraft,
  dvsValidationDraft,
  onReasonChange,
  onAction,
  onReasonSubmit,
}: RequestDetailActionsProps) {
  const actorKind = profile ? getRequestActorKind(profile.primaryRoleCode) : undefined;
  const primaryActions = sortWorkflowActions(
    data.allowedActions.filter((action) => !REASON_ACTIONS.includes(action)),
  );
  const reasonActions = REASON_ACTIONS.filter((action) => data.allowedActions.includes(action));
  const idleMessage = getIdleActionMessage(data.status, data.allowedActions.length > 0);

  function isActionDisabled(action: WorkflowAction): boolean {
    if (isPending) return true;
    if ((action === 'submit' || action === 'resubmit') && !isChecklistComplete(checklistDraft)) {
      return true;
    }
    if (action === 'approve' && !isDvsValidationComplete(dvsValidationDraft)) {
      return true;
    }
    return false;
  }

  return (
    <section
      className={`request-detail-section request-detail-section--actions${
        actorKind ? ` request-detail-section--actions-${actorKind}` : ''
      }`}
      aria-labelledby="request-actions-heading"
    >
      <header className="request-detail-section-head">
        <h3 id="request-actions-heading">Actions disponibles</h3>
        {profile ? <p>{profile.primaryRoleLabel}</p> : null}
      </header>

      {primaryActions.length > 0 ? (
        <ul className="request-detail-actions-list">
          {primaryActions.map((action) => (
            <li key={action} className={`request-detail-action-item request-detail-action-item--${action}`}>
              <div className="request-detail-action-copy">
                <strong>{WORKFLOW_ACTION_LABELS[action]}</strong>
                <p>{WORKFLOW_ACTION_HINTS[action]}</p>
              </div>
              <button
                type="button"
                className={`request-detail-action-btn request-detail-action-btn--${action}`}
                disabled={isActionDisabled(action)}
                onClick={() => onAction(action)}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={15} aria-hidden="true" /> Traitement…
                  </>
                ) : (
                  WORKFLOW_ACTION_LABELS[action]
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="request-detail-idle">{idleMessage}</p>
      )}

      {reasonActions.length > 0 ? (
        <div className="request-detail-reason-actions">
          {reasonActions.map((action) => (
            <form
              key={action}
              className="request-detail-reject"
              onSubmit={(event) => onReasonSubmit(action, event)}
            >
              <div className="request-detail-reject-head">
                <strong>{WORKFLOW_ACTION_LABELS[action]}</strong>
                <p>{WORKFLOW_ACTION_HINTS[action]}</p>
              </div>
              <div className="form-field">
                <label htmlFor={`reason-${action}`}>Motif</label>
                <textarea
                  id={`reason-${action}`}
                  className="app-pro-textarea"
                  value={reason}
                  onChange={(event) => onReasonChange(event.target.value)}
                  rows={3}
                  required
                  placeholder="Expliquez la décision…"
                />
              </div>
              <button
                type="submit"
                className={`request-detail-action-btn request-detail-action-btn--${action}`}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={15} aria-hidden="true" /> Traitement…
                  </>
                ) : (
                  WORKFLOW_ACTION_LABELS[action]
                )}
              </button>
            </form>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function RequestDetailView({
  data,
  profile,
  isPending,
  reason,
  onReasonChange,
  checklistDraft,
  dvsValidationDraft,
  onChecklistChange,
  onDvsValidationChange,
  onAction,
  onReasonSubmit,
}: RequestDetailViewProps) {
  return (
    <article className="request-detail-shell">
      <header className="request-detail-head">
        <div className="request-detail-head-main">
          <div className="request-detail-head-icon" aria-hidden="true">
            <FileCheck size={26} strokeWidth={1.75} />
          </div>
          <div className="request-detail-head-copy">
            <p className="request-detail-head-eyebrow">Dossier d&apos;autorisation</p>
            <h2 className="request-detail-head-title">{data.activityTitle ?? 'Activité'}</h2>
            <p className="request-detail-head-meta">
              <Building2 size={14} aria-hidden="true" />
              {data.establishmentName}
            </p>
          </div>
        </div>
        <span className={`${statusBadgeClass(data.status)} request-detail-status-badge`}>
          {REQUEST_STATUS_LABELS[data.status] ?? data.status}
        </span>
      </header>

      <RequestWorkflowStepper status={data.status} />

      <div className="request-detail-body">
        <div className="request-detail-main">
          <section className="request-detail-section" aria-labelledby="request-info-heading">
            <header className="request-detail-section-head">
              <h3 id="request-info-heading">Informations du dossier</h3>
            </header>

            <dl className="request-detail-dates">
              <div>
                <dt>Créé le</dt>
                <dd>{formatDateTime(data.createdAt)}</dd>
              </div>
              <div>
                <dt>Soumis le</dt>
                <dd>{formatDateTime(data.submittedAt)}</dd>
              </div>
              <div>
                <dt>Dernière mise à jour</dt>
                <dd>{formatDateTime(data.updatedAt)}</dd>
              </div>
              <div>
                <dt>Décision le</dt>
                <dd>{formatDateTime(data.decidedAt)}</dd>
              </div>
            </dl>

            <div className="request-detail-content">
              <h4 className="request-detail-subheading">Motif / précisions</h4>
              {data.description ? (
                <p className="request-detail-text">{data.description}</p>
              ) : (
                <p className="request-detail-text request-detail-text--muted">
                  Aucune précision complémentaire renseignée.
                </p>
              )}

              {data.decisionReason ? (
                <div className="request-detail-decision">
                  <h4 className="request-detail-subheading">Motif de décision</h4>
                  <p className="request-detail-text">{data.decisionReason}</p>
                </div>
              ) : null}
            </div>
          </section>

          <RequestVoyageDecouvertePanel
            data={data}
            primaryRoleCode={profile?.primaryRoleCode}
            checklistDraft={checklistDraft}
            dvsValidationDraft={dvsValidationDraft}
            onChecklistChange={onChecklistChange}
            onDvsValidationChange={onDvsValidationChange}
          />

          <section className="request-detail-section" aria-labelledby="request-history-heading">
            <header className="request-detail-section-head">
              <h3 id="request-history-heading">Historique du circuit</h3>
            </header>

            {data.history.length === 0 ? (
              <p className="request-detail-text request-detail-text--muted">
                Aucune transition enregistrée.
              </p>
            ) : (
              <ol className="request-detail-timeline">
                {data.history.map((entry, index) => (
                  <li key={entry.id} className={index === 0 ? 'is-latest' : undefined}>
                    <span className="request-detail-timeline-dot" aria-hidden="true" />
                    <div className="request-detail-timeline-body">
                      <div className="request-detail-timeline-status">
                        <span className={statusBadgeClass(entry.newStatus)}>
                          {REQUEST_STATUS_LABELS[entry.newStatus] ?? entry.newStatus}
                        </span>
                        <strong>
                          {entry.previousStatus
                            ? `${REQUEST_STATUS_LABELS[entry.previousStatus]} → ${REQUEST_STATUS_LABELS[entry.newStatus]}`
                            : 'Création du dossier'}
                        </strong>
                      </div>
                      {entry.reason ? (
                        <p className="request-detail-timeline-reason">{entry.reason}</p>
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
        </div>

        <aside className="request-detail-aside" aria-label="Actions workflow">
          <RequestDetailActions
            data={data}
            profile={profile}
            isPending={isPending}
            reason={reason}
            checklistDraft={checklistDraft}
            dvsValidationDraft={dvsValidationDraft}
            onReasonChange={onReasonChange}
            onAction={onAction}
            onReasonSubmit={onReasonSubmit}
          />
        </aside>
      </div>
    </article>
  );
}
