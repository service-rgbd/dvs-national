import type { UserProfileId } from './roles';
import { appRoutes } from '@/content/routes';

export type AppModuleId =
  | 'dashboard'
  | 'establishments'
  | 'activities'
  | 'requests'
  | 'mediaPublications'
  | 'documents'
  | 'statistics'
  | 'administration'
  | 'profile';

export type AppModule = {
  id: AppModuleId;
  label: string;
  href: string;
  description: string;
  roles: UserProfileId[] | 'all';
};

/** Navigation métier PNIGVS — visibilité par rôle CDC. */
export const appModules: AppModule[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    href: appRoutes.app,
    description: 'Vue d\'ensemble de votre périmètre.',
    roles: 'all',
  },
  {
    id: 'establishments',
    label: 'Établissements',
    href: appRoutes.establishments,
    description: 'Référentiel des établissements de votre périmètre.',
    roles: [
      'dvs_director',
      'dvs_staff',
      'drena_manager',
      'school_head_primary',
      'school_head_secondary',
      'education_officer',
    ],
  },
  {
    id: 'activities',
    label: 'Activités scolaires',
    href: appRoutes.activities,
    description: 'Planification et suivi des activités.',
    roles: [
      'dvs_director',
      'dvs_staff',
      'drena_manager',
      'school_head_primary',
      'school_head_secondary',
      'education_officer',
    ],
  },
  {
    id: 'requests',
    label: 'Demandes d\'autorisation',
    href: appRoutes.requests,
    description: 'Workflow Établissement → DREN → DVS.',
    roles: [
      'dvs_director',
      'dvs_staff',
      'drena_manager',
      'school_head_primary',
      'school_head_secondary',
      'education_officer',
    ],
  },
  {
    id: 'mediaPublications',
    label: 'Publications média',
    href: appRoutes.mediaPublications,
    description: 'Photos et vidéos de sorties — validation avant publication publique.',
    roles: [
      'dvs_director',
      'dvs_staff',
      'drena_manager',
      'school_head_primary',
      'school_head_secondary',
      'education_officer',
    ],
  },
  {
    id: 'documents',
    label: 'Fichiers scolaires',
    href: appRoutes.documents,
    description: 'Dépôt et consultation des documents de vie scolaire.',
    roles: [
      'dvs_director',
      'dvs_staff',
      'drena_manager',
      'school_head_primary',
      'school_head_secondary',
      'education_officer',
    ],
  },
  {
    id: 'statistics',
    label: 'Statistiques',
    href: appRoutes.statistics,
    description: 'Indicateurs et rapports de vie scolaire.',
    roles: ['dvs_director', 'dvs_staff'],
  },
  {
    id: 'administration',
    label: 'Administration',
    href: appRoutes.administration,
    description: 'Gestion des utilisateurs et paramètres.',
    roles: ['dvs_director', 'dvs_staff'],
  },
  {
    id: 'profile',
    label: 'Mon profil',
    href: appRoutes.profile,
    description: 'Informations de session et rôles.',
    roles: 'all',
  },
];

export const dashboardHeadlines: Record<UserProfileId, string> = {
  dvs_director: 'Pilotage national de la vie scolaire',
  dvs_staff: 'Coordination DVS — vue opérationnelle',
  drena_manager: 'Pilotage régional DREN / DDENA',
  school_head_primary: 'Gestion de votre établissement primaire',
  school_head_secondary: 'Gestion de votre établissement secondaire',
  education_officer: 'Encadrement et suivi éducatif',
  external_partner: 'Espace partenaire contrôlé',
};

export function getPrimaryRoleCode(roleCodes: string[]): UserProfileId | null {
  const priority: UserProfileId[] = [
    'dvs_director',
    'dvs_staff',
    'drena_manager',
    'school_head_primary',
    'school_head_secondary',
    'education_officer',
    'external_partner',
  ];

  for (const code of priority) {
    if (roleCodes.includes(code)) return code;
  }

  return null;
}

export function canAccessModule(module: AppModule, roleCodes: string[]): boolean {
  if (module.roles === 'all') return true;
  return module.roles.some((role) => roleCodes.includes(role));
}

export function getAccessibleModules(roleCodes: string[]): AppModule[] {
  return appModules.filter((module) => canAccessModule(module, roleCodes));
}
