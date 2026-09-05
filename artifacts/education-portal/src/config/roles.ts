/**
 * Profils utilisateurs PNIGVS — cahier des charges §3 et §4.10.
 * Référence pour l'authentification et le RBAC (implémentation à venir).
 */
export const userProfiles = {
  adminPrincipal: {
    id: 'dvs_director',
    label: 'Administrateur principal',
    role: 'Directeur de la Vie Scolaire',
    access: 'Tous les accès',
  },
  adminSecondary: [
    {
      id: 'dvs_staff',
      label: 'Administrateur secondaire',
      role: 'Collaborateur DVS',
      access: 'Étendu, limité par permissions',
    },
    {
      id: 'drena_manager',
      label: 'Administrateur secondaire',
      role: 'Responsable régional DREN',
      access: 'Périmètre régional',
    },
  ],
  users: [
    {
      id: 'school_head_primary',
      label: 'Utilisateur',
      role: 'Chef d\'établissement primaire',
      access: 'Opérationnel établissement',
    },
    {
      id: 'school_head_secondary',
      label: 'Utilisateur',
      role: 'Chef d\'établissement secondaire',
      access: 'Opérationnel établissement',
    },
    {
      id: 'education_officer',
      label: 'Utilisateur',
      role: 'Responsable éducatif',
      access: 'Opérationnel encadrement',
    },
  ],
  partners: {
    id: 'external_partner',
    label: 'Partenaire externe',
    role: 'Structure partenaire autorisée',
    access: 'Restreint et contrôlé',
  },
} as const;

export const authorizationWorkflow = [
  { step: 1, actor: 'Établissement', action: 'Soumet une demande d\'autorisation' },
  { step: 2, actor: 'DREN', action: 'Analyse la demande' },
  { step: 3, actor: 'DVS', action: 'Valide ou rejette' },
  { step: 4, actor: 'Système', action: 'Envoie une notification automatique' },
] as const;

export const activityTypes = [
  'Sorties pédagogiques',
  'Événements culturels',
  'Compétitions',
  'Conférences',
  'Campagnes éducatives',
  'Activités sportives',
] as const;

export type UserProfileId =
  | typeof userProfiles.adminPrincipal.id
  | (typeof userProfiles.adminSecondary)[number]['id']
  | (typeof userProfiles.users)[number]['id']
  | typeof userProfiles.partners.id;
