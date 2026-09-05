import type { AppDashboardProfile } from '@workspace/api-client-react';

import type { UserProfileId } from './roles';
import { appRoutes } from '@/content/routes';
import { mediaFilterHref } from './media-publication-status-filters';

export type MediaActorKind = 'establishment' | 'drena' | 'dvs';

export const MEDIA_INITIATOR_ROLES: UserProfileId[] = [
  'school_head_primary',
  'school_head_secondary',
  'education_officer',
];

export type MediaActorConfig = {
  kind: MediaActorKind;
  eyebrow: string;
  heading: string;
  bannerDescription: string;
  primaryFilter?: { label: string; href: string };
  cta?: { label: string; href: string };
};

export function getMediaActorKind(primaryRoleCode: string): MediaActorKind {
  if (MEDIA_INITIATOR_ROLES.includes(primaryRoleCode as UserProfileId)) {
    return 'establishment';
  }
  if (primaryRoleCode === 'drena_manager') return 'drena';
  if (primaryRoleCode === 'dvs_director' || primaryRoleCode === 'dvs_staff') return 'dvs';
  return 'establishment';
}

export function canCreateMediaPublication(primaryRoleCode: string): boolean {
  return MEDIA_INITIATOR_ROLES.includes(primaryRoleCode as UserProfileId);
}

export function getMediaActorConfig(profile: AppDashboardProfile): MediaActorConfig {
  const kind = getMediaActorKind(profile.primaryRoleCode);

  if (kind === 'drena') {
    return {
      kind,
      eyebrow: 'Profil instructeur · DRENA',
      heading: 'Analyser les médias de sortie soumis',
      bannerDescription:
        'Consultez les dossiers photo/vidéo déposés par les établissements et prenez-les en analyse.',
      primaryFilter: {
        label: 'Voir les dossiers soumis',
        href: mediaFilterHref('submitted'),
      },
      cta: {
        label: 'Dossiers en analyse',
        href: mediaFilterHref('under_review'),
      },
    };
  }

  if (kind === 'dvs') {
    return {
      kind,
      eyebrow: 'Profil validateur · DVS',
      heading: 'Valider et publier les médias de sortie',
      bannerDescription:
        'Les établissements déposent les contenus après autorisation ; vous validez puis publiez sur le site public.',
      primaryFilter: {
        label: 'Dossiers validés à publier',
        href: mediaFilterHref('approved'),
      },
      cta: {
        label: 'Voir les publications en ligne',
        href: mediaFilterHref('published'),
      },
    };
  }

  return {
    kind,
    eyebrow: 'Profil établissement',
    heading: 'Partager les photos et vidéos de vos sorties',
    bannerDescription:
      'Déposez vos médias pour une activité déjà autorisée. Le dossier sera soumis à la DREN puis à la DVS avant publication.',
    cta: {
      label: 'Voir mes activités',
      href: appRoutes.activities,
    },
  };
}
