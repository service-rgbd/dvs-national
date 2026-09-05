import type { RequestStatus, WorkflowAction } from '@workspace/api-client-react';

export type WorkflowPipelineStep = {
  id: string;
  label: string;
  shortLabel: string;
};

export type WorkflowStepState = 'completed' | 'current' | 'pending' | 'success' | 'failed' | 'muted';

export const REQUEST_WORKFLOW_PIPELINE: WorkflowPipelineStep[] = [
  { id: 'draft', label: 'Brouillon', shortLabel: 'Brouillon' },
  { id: 'submitted', label: 'Soumis DREN', shortLabel: 'Soumis' },
  { id: 'under_review', label: 'Analyse DREN', shortLabel: 'Analyse' },
  { id: 'forwarded', label: 'Transmis DVS', shortLabel: 'DVS' },
  { id: 'decision', label: 'Décision', shortLabel: 'Décision' },
];

const STATUS_INDEX: Record<RequestStatus, number> = {
  draft: 0,
  submitted: 1,
  under_review: 2,
  forwarded: 3,
  approved: 4,
  rejected: 4,
  cancelled: 4,
  archived: 4,
  returned_for_correction: 1,
};

export function getWorkflowStepStates(status: RequestStatus): WorkflowStepState[] {
  const currentIndex = STATUS_INDEX[status];

  return REQUEST_WORKFLOW_PIPELINE.map((step, index) => {
    if (status === 'approved') {
      if (index < 4) return 'completed';
      return 'success';
    }

    if (status === 'rejected') {
      if (index < 4) return 'completed';
      return 'failed';
    }

    if (status === 'returned_for_correction') {
      if (index === 0) return 'completed';
      if (index === 1) return 'failed';
      return 'muted';
    }

    if (status === 'cancelled') {
      if (index === 0) return 'completed';
      if (index === 1) return 'failed';
      return 'muted';
    }

    if (status === 'archived') {
      return index <= currentIndex ? 'muted' : 'pending';
    }

    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  });
}

export const WORKFLOW_ACTION_HINTS: Record<WorkflowAction, string> = {
  submit: 'Transmettre le dossier à la DREN — checklist Voyage Découverte obligatoire.',
  resubmit: 'Resoumettre le dossier corrigé à la DREN après renvoi DVS.',
  review: 'Confirmer la prise en charge et l\'analyse du dossier.',
  forward: 'Envoyer le dossier instruit à la DVS pour décision.',
  approve: 'Accorder l\'autorisation — contrôles DVS (prospection, TDR, certificat) requis.',
  return_for_correction: 'Renvoyer à l\'établissement pour correction via le service Voyage Découverte.',
  publish: 'Rendre le contenu visible sur le site public.',
  reject: 'Rejet définitif pour l\'année en cours — motif obligatoire.',
  cancel: 'Retirer le dossier du circuit avant décision finale.',
  revoke: 'Annuler une activité validée dont les conditions DVS ne sont pas respectées.',
};

export function getIdleActionMessage(
  status: RequestStatus,
  hasAllowedActions: boolean,
): string {
  if (hasAllowedActions) return '';

  switch (status) {
    case 'draft':
      return 'Ce dossier est en brouillon. Seul un profil établissement habilité peut le soumettre.';
    case 'submitted':
      return 'Le dossier attend une prise en charge par la DREN.';
    case 'under_review':
      return 'Le dossier est en cours d\'analyse. Aucune action n\'est requise de votre part pour le moment.';
    case 'forwarded':
      return 'Le dossier a été transmis à la DVS et attend une décision.';
    case 'approved':
      return 'Dossier validé — aucune action supplémentaire n\'est possible.';
    case 'rejected':
      return 'Dossier rejeté définitivement — préparez-vous pour la prochaine rentrée.';
    case 'returned_for_correction':
      return 'Dossier renvoyé pour correction — contactez le service Voyage Découverte de la DVS.';
    case 'cancelled':
      return 'Dossier annulé — le circuit est clos.';
    case 'archived':
      return 'Dossier archivé — consultation seule.';
    default:
      return 'Aucune action disponible pour votre profil sur ce dossier.';
  }
}

export const ACTION_ORDER: WorkflowAction[] = [
  'submit',
  'resubmit',
  'review',
  'forward',
  'approve',
  'return_for_correction',
  'publish',
  'cancel',
  'revoke',
  'reject',
];

export function sortWorkflowActions(actions: WorkflowAction[]): WorkflowAction[] {
  return [...actions].sort(
    (left, right) => ACTION_ORDER.indexOf(left) - ACTION_ORDER.indexOf(right),
  );
}
