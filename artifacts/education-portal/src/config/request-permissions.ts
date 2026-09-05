import type { AppDashboardProfile } from '@workspace/api-client-react';

import type { UserProfileId } from './roles';
import { authorizationWorkflow } from './roles';
import { appRoutes } from '@/content/routes';
import { requestFilterHref } from './request-status-filters';

export type RequestActorKind = 'establishment' | 'drena' | 'dvs';

/** Rôles habilités à initier une demande (CDC §4 — côté établissement). */
export const REQUEST_INITIATOR_ROLES: UserProfileId[] = [
  'school_head_primary',
  'school_head_secondary',
  'education_officer',
];

export type RequestCapability = {
  id: string;
  label: string;
  allowed: boolean;
};

export type RequestActorConfig = {
  kind: RequestActorKind;
  eyebrow: string;
  heading: string;
  description: string;
  bannerDescription: string;
  capabilities: RequestCapability[];
  primaryFilter?: { label: string; href: string };
  cta?: { label: string; href: string };
};

export function getRequestActorKind(primaryRoleCode: string): RequestActorKind {
  if (REQUEST_INITIATOR_ROLES.includes(primaryRoleCode as UserProfileId)) {
    return 'establishment';
  }
  if (primaryRoleCode === 'drena_manager') return 'drena';
  if (primaryRoleCode === 'dvs_director' || primaryRoleCode === 'dvs_staff') return 'dvs';
  return 'establishment';
}

export function canCreateRequest(primaryRoleCode: string): boolean {
  return REQUEST_INITIATOR_ROLES.includes(primaryRoleCode as UserProfileId);
}

export function getRequestActorConfig(
  profile: AppDashboardProfile,
): RequestActorConfig {
  const kind = getRequestActorKind(profile.primaryRoleCode);

  if (kind === 'drena') {
    return {
      kind,
      eyebrow: 'Profil analyseur · DRENA',
      heading: 'Instruire les dossiers soumis',
      description: `Consultez les dossiers de ${profile.scopeLabel}, prenez-les en analyse et transmettez-les à la DVS.`,
      bannerDescription: 'Instruire les dossiers soumis par les établissements de votre DRENA.',
      capabilities: [
        { id: 'create', label: 'Créer une demande d\'autorisation', allowed: false },
        { id: 'review', label: 'Prendre un dossier en analyse', allowed: true },
        { id: 'forward', label: 'Transmettre à la DVS', allowed: true },
        { id: 'reject', label: 'Rejeter avec motif', allowed: false },
        { id: 'approve', label: 'Valider définitivement', allowed: false },
      ],
      primaryFilter: {
        label: 'Voir les dossiers soumis',
        href: requestFilterHref('submitted'),
      },
      cta: {
        label: 'Dossiers en analyse',
        href: requestFilterHref('under_review'),
      },
    };
  }

  if (kind === 'dvs') {
    return {
      kind,
      eyebrow: 'Profil validateur · DVS',
      heading: 'Décider sur les dossiers transmis',
      description: `En tant que ${profile.primaryRoleLabel}, vous suivez le périmètre ${profile.scopeLabel}. Les demandes sont initiées par les établissements ; vous analysez, validez ou rejetez.`,
      bannerDescription: 'Les établissements initient les dossiers ; vous validez ou rejetez au niveau DVS.',
      capabilities: [
        { id: 'create', label: 'Créer une demande d\'autorisation', allowed: false },
        { id: 'review', label: 'Prendre un dossier en analyse', allowed: true },
        { id: 'forward', label: 'Transmettre dans le circuit', allowed: true },
        { id: 'return_for_correction', label: 'Renvoyer pour correction', allowed: true },
        { id: 'reject', label: 'Rejeter définitivement', allowed: true },
        { id: 'approve', label: 'Valider définitivement', allowed: true },
        { id: 'revoke', label: 'Révoquer une activité validée', allowed: true },
      ],
      primaryFilter: {
        label: 'Voir les dossiers transmis DVS',
        href: requestFilterHref('forwarded'),
      },
      cta: {
        label: 'Tous les dossiers en cours',
        href: appRoutes.requests,
      },
    };
  }

  return {
    kind,
    eyebrow: 'Profil initiateur · Établissement',
    heading: 'Soumettre vos activités à autorisation',
    description: `Rattaché à ${profile.scopeLabel}. Créez d'abord une activité scolaire, puis ouvrez un dossier en brouillon et soumettez-le à la DREN depuis le détail du dossier.`,
    bannerDescription: 'Créez un dossier à partir d\'une activité, puis soumettez-le à la DREN pour analyse.',
    capabilities: [
      { id: 'create', label: 'Créer un dossier (brouillon)', allowed: true },
      { id: 'submit', label: 'Soumettre à la DREN', allowed: true },
      { id: 'resubmit', label: 'Resoumettre après correction', allowed: true },
      { id: 'cancel', label: 'Annuler avant décision', allowed: true },
      { id: 'review', label: 'Analyser les dossiers d\'autres établissements', allowed: false },
      { id: 'approve', label: 'Valider ou rejeter une demande', allowed: false },
    ],
    cta: {
      label: 'Gérer les activités',
      href: appRoutes.activities,
    },
  };
}

export function getWorkflowStepsForActor(kind: RequestActorKind) {
  return authorizationWorkflow.map((step) => ({
    ...step,
    isActorStep:
      (kind === 'establishment' && step.actor === 'Établissement') ||
      (kind === 'drena' && step.actor === 'DREN') ||
      (kind === 'dvs' && step.actor === 'DVS'),
  }));
}
