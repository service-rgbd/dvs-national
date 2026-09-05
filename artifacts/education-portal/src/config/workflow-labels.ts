import type { WorkflowAction } from '@workspace/api-client-react';

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  submitted: 'Soumis',
  under_review: 'En analyse',
  forwarded: 'Transmis à la DVS',
  approved: 'Validé',
  rejected: 'Rejeté définitivement',
  cancelled: 'Annulé',
  archived: 'Archivé',
  returned_for_correction: 'Renvoyé pour correction',
};

export const WORKFLOW_ACTION_LABELS: Record<WorkflowAction, string> = {
  submit: 'Soumettre à la DREN',
  resubmit: 'Resoumettre à la DREN',
  review: 'Prendre en analyse',
  forward: 'Transmettre à la DVS',
  approve: 'Valider',
  return_for_correction: 'Renvoyer pour correction',
  publish: 'Publier sur le site',
  reject: 'Rejeter définitivement',
  cancel: 'Annuler',
  revoke: 'Révoquer l\'activité',
};

export function statusBadgeClass(status: string): string {
  switch (status) {
    case 'approved':
      return 'status-badge status-approved';
    case 'rejected':
    case 'cancelled':
    case 'returned_for_correction':
      return 'status-badge status-rejected';
    case 'submitted':
    case 'forwarded':
      return 'status-badge status-pending';
    case 'under_review':
      return 'status-badge status-review';
    default:
      return 'status-badge status-draft';
  }
}
