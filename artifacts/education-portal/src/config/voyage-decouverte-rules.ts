/** Règles métier Voyage Découverte — alignées docs/PNIGVS_REGLES_METIER.md */

export type ChecklistItem = {
  id: string;
  label: string;
  description: string;
  requiredForSubmit: boolean;
};

export type DvsValidationItem = {
  id: string;
  label: string;
  description: string;
  requiredForApprove: boolean;
};

export const ESTABLISHMENT_CHECKLIST: ChecklistItem[] = [
  {
    id: 'entretien_voyage_decouverte',
    label: 'Entretien service Voyage Découverte',
    description:
      'Consultation du service Voyage Découverte de la DVS avant constitution du dossier.',
    requiredForSubmit: true,
  },
  {
    id: 'formulaire_dvs',
    label: 'Formulaire de demande d\'autorisation DVS',
    description: 'Formulaire officiel de demande d\'autorisation rempli au niveau de la DVS.',
    requiredForSubmit: true,
  },
];

export const DVS_VALIDATION_CHECKLIST: DvsValidationItem[] = [
  {
    id: 'prospection_lieu',
    label: 'Prospection du lieu de sortie',
    description: 'Visite et évaluation du lieu de la sortie par la DVS.',
    requiredForApprove: true,
  },
  {
    id: 'verification_tdr',
    label: 'Vérification du TDR',
    description: 'Contrôle des termes de référence de la sortie.',
    requiredForApprove: true,
  },
  {
    id: 'certificat_formation',
    label: 'Certificat formation voyages scolaires',
    description:
      'Vérification du certificat délivré uniquement par la DVS pour les encadrants.',
    requiredForApprove: true,
  },
];

export const POST_APPROVAL_GUIDANCE = {
  primary: {
    label: 'Établissement primaire',
    instruction:
      'Après autorisation DVS : obtenir l\'autorisation auprès de l\'inspection (cycle primaire).',
  },
  secondary: {
    label: 'Établissement secondaire (collège)',
    instruction:
      'Après autorisation DVS : obtenir l\'autorisation auprès de la DREN.',
  },
} as const;

export const RETURN_FOR_CORRECTION_GUIDANCE =
  'Corrigez le dossier conformément aux remarques et contactez uniquement le service Voyage Découverte de la DVS.';

export const REJECTION_GUIDANCE =
  'Décision définitive pour l\'année scolaire en cours. Intégrez les remarques et préparez-vous pour la rentrée prochaine.';

export function isChecklistComplete(checklist: Record<string, boolean | undefined>): boolean {
  return ESTABLISHMENT_CHECKLIST.filter((item) => item.requiredForSubmit).every(
    (item) => checklist[item.id] === true,
  );
}

export function isDvsValidationComplete(
  dvsValidation: Record<string, boolean | undefined>,
): boolean {
  return DVS_VALIDATION_CHECKLIST.filter((item) => item.requiredForApprove).every(
    (item) => dvsValidation[item.id] === true,
  );
}

export function emptyChecklistState(): Record<string, boolean> {
  return Object.fromEntries(ESTABLISHMENT_CHECKLIST.map((item) => [item.id, false]));
}

export function emptyDvsValidationState(): Record<string, boolean> {
  return Object.fromEntries(DVS_VALIDATION_CHECKLIST.map((item) => [item.id, false]));
}
