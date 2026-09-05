import type { MediaPublicationStatus, WorkflowAction } from '@workspace/api-client-react';

export type MediaPipelineStep = {
  id: string;
  label: string;
};

export type MediaStepState = 'completed' | 'current' | 'pending' | 'success' | 'failed' | 'muted';

export const MEDIA_WORKFLOW_PIPELINE: MediaPipelineStep[] = [
  { id: 'draft', label: 'Brouillon' },
  { id: 'submitted', label: 'Soumis DREN' },
  { id: 'under_review', label: 'Analyse DREN' },
  { id: 'approved', label: 'Validé DVS' },
  { id: 'published', label: 'Publié' },
];

const STATUS_INDEX: Record<MediaPublicationStatus, number> = {
  draft: 0,
  submitted: 1,
  under_review: 2,
  approved: 3,
  published: 4,
  rejected: 3,
  cancelled: 1,
};

export function getMediaStepStates(status: MediaPublicationStatus): MediaStepState[] {
  const currentIndex = STATUS_INDEX[status];

  return MEDIA_WORKFLOW_PIPELINE.map((_, index) => {
    if (status === 'published') {
      if (index < 4) return 'completed';
      return 'success';
    }

    if (status === 'approved') {
      if (index < 3) return 'completed';
      if (index === 3) return 'current';
      return 'pending';
    }

    if (status === 'rejected') {
      if (index < 3) return 'completed';
      return 'failed';
    }

    if (status === 'cancelled') {
      if (index === 0) return 'completed';
      if (index === 1) return 'failed';
      return 'muted';
    }

    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  });
}

export const MEDIA_ACTION_LABELS: Partial<Record<WorkflowAction, string>> = {
  submit: 'Soumettre à la DREN',
  review: 'Prendre en analyse',
  approve: 'Valider le contenu',
  publish: 'Publier sur le site',
  reject: 'Rejeter',
  cancel: 'Annuler',
};

export const MEDIA_ACTION_HINTS: Partial<Record<WorkflowAction, string>> = {
  submit: 'Transmettre le dossier média à la DREN pour contrôle.',
  review: 'Confirmer la prise en charge et l\'analyse des fichiers.',
  approve: 'Valider le contenu avant publication publique.',
  publish: 'Rendre visible sur la galerie publique du portail.',
  reject: 'Refuser la publication — un motif est obligatoire.',
  cancel: 'Retirer le dossier du circuit avant publication.',
};

export const MEDIA_ACTION_ORDER: WorkflowAction[] = [
  'submit',
  'review',
  'approve',
  'publish',
  'cancel',
  'reject',
];

export function sortMediaActions(actions: WorkflowAction[]): WorkflowAction[] {
  return [...actions].sort(
    (left, right) => MEDIA_ACTION_ORDER.indexOf(left) - MEDIA_ACTION_ORDER.indexOf(right),
  );
}

export function getMediaIdleActionMessage(
  status: MediaPublicationStatus,
  hasAllowedActions: boolean,
): string {
  if (hasAllowedActions) return '';

  switch (status) {
    case 'draft':
      return 'Ce dossier est en brouillon. Soumettez-le à la DREN depuis les actions disponibles.';
    case 'submitted':
      return 'Le dossier attend une prise en charge par la DREN.';
    case 'under_review':
      return 'Le dossier est en cours d\'analyse.';
    case 'approved':
      return 'Contenu validé — la DVS peut le publier sur le site public.';
    case 'published':
      return 'Publication en ligne — consultation seule.';
    case 'rejected':
      return 'Dossier rejeté — le circuit est clos.';
    case 'cancelled':
      return 'Dossier annulé — le circuit est clos.';
    default:
      return 'Aucune action disponible pour votre profil sur ce dossier.';
  }
}
