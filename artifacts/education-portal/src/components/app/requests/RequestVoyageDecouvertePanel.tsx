import type { RequestDetail, WorkflowAction } from '@workspace/api-client-react';

import {
  DVS_VALIDATION_CHECKLIST,
  ESTABLISHMENT_CHECKLIST,
  isChecklistComplete,
  isDvsValidationComplete,
  POST_APPROVAL_GUIDANCE,
  REJECTION_GUIDANCE,
  RETURN_FOR_CORRECTION_GUIDANCE,
} from '@/config/voyage-decouverte-rules';
import { getRequestActorKind } from '@/config/request-permissions';

type RequestVoyageDecouvertePanelProps = {
  data: RequestDetail;
  primaryRoleCode?: string;
  checklistDraft: Record<string, boolean>;
  dvsValidationDraft: Record<string, boolean>;
  onChecklistChange: (id: string, checked: boolean) => void;
  onDvsValidationChange: (id: string, checked: boolean) => void;
};

export function RequestVoyageDecouvertePanel({
  data,
  primaryRoleCode,
  checklistDraft,
  dvsValidationDraft,
  onChecklistChange,
  onDvsValidationChange,
}: RequestVoyageDecouvertePanelProps) {
  const actorKind = primaryRoleCode ? getRequestActorKind(primaryRoleCode) : 'establishment';
  const canEditChecklist =
    actorKind === 'establishment' &&
    (data.status === 'draft' || data.status === 'returned_for_correction');
  const canEditDvsValidation =
    actorKind === 'dvs' &&
    (data.status === 'under_review' || data.status === 'forwarded' || data.status === 'submitted');

  const checklistReady = isChecklistComplete(checklistDraft);
  const dvsReady = isDvsValidationComplete(dvsValidationDraft);

  return (
    <section className="request-detail-section" aria-labelledby="request-voyage-heading">
      <header className="request-detail-section-head">
        <h3 id="request-voyage-heading">Checklist Voyage Découverte</h3>
        <p>Étapes obligatoires avant soumission et contrôles DVS.</p>
      </header>

      <div className="request-detail-content">
        <h4 className="request-detail-subheading">Prérequis établissement</h4>
        <ul className="request-checklist">
          {ESTABLISHMENT_CHECKLIST.map((item) => (
            <li key={item.id} className="request-checklist-item">
              <label className="request-checklist-label">
                <input
                  type="checkbox"
                  checked={checklistDraft[item.id] === true}
                  disabled={!canEditChecklist}
                  onChange={(event) => onChecklistChange(item.id, event.target.checked)}
                />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
              </label>
            </li>
          ))}
        </ul>
        {canEditChecklist && !checklistReady ? (
          <p className="request-detail-text request-detail-text--muted">
            Complétez la checklist avant de soumettre ou resoumettre le dossier.
          </p>
        ) : null}

        {canEditDvsValidation || Object.values(data.dvsValidation ?? {}).some(Boolean) ? (
          <>
            <h4 className="request-detail-subheading">Contrôles DVS (avant validation)</h4>
            <ul className="request-checklist">
              {DVS_VALIDATION_CHECKLIST.map((item) => (
                <li key={item.id} className="request-checklist-item">
                  <label className="request-checklist-label">
                    <input
                      type="checkbox"
                      checked={dvsValidationDraft[item.id] === true}
                      disabled={!canEditDvsValidation}
                      onChange={(event) => onDvsValidationChange(item.id, event.target.checked)}
                    />
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            {canEditDvsValidation && !dvsReady ? (
              <p className="request-detail-text request-detail-text--muted">
                Validez prospection, TDR et certificat avant d&apos;accorder l&apos;autorisation.
              </p>
            ) : null}
          </>
        ) : null}

        {data.status === 'returned_for_correction' ? (
          <p className="request-detail-guidance request-detail-guidance--warning">
            {RETURN_FOR_CORRECTION_GUIDANCE}
          </p>
        ) : null}

        {data.status === 'rejected' ? (
          <p className="request-detail-guidance request-detail-guidance--danger">
            {REJECTION_GUIDANCE}
          </p>
        ) : null}

        {data.status === 'approved' ? (
          <div className="request-detail-guidance request-detail-guidance--success">
            <p>{POST_APPROVAL_GUIDANCE.secondary.instruction}</p>
            <p>{POST_APPROVAL_GUIDANCE.primary.instruction}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function buildTransitionPayload(
  action: WorkflowAction,
  options: {
    reason?: string;
    checklistDraft: Record<string, boolean>;
    dvsValidationDraft: Record<string, boolean>;
  },
) {
  const payload: {
    action: WorkflowAction;
    reason?: string;
    checklist?: Record<string, boolean>;
    dvsValidation?: Record<string, boolean>;
  } = { action };

  if (
    action === 'reject' ||
    action === 'return_for_correction' ||
    action === 'revoke'
  ) {
    payload.reason = options.reason?.trim();
  }

  if (action === 'submit' || action === 'resubmit') {
    payload.checklist = options.checklistDraft;
  }

  if (action === 'approve') {
    payload.dvsValidation = options.dvsValidationDraft;
  }

  return payload;
}
