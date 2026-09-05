/**
 * Règles et paramètres administration PNIGVS — source unique alignée CDC v1.0 (Juin 2026).
 */
import { appModules } from '@/config/app-modules';
import { institution } from '@/config/institution';
import { activityTypes, authorizationWorkflow, userProfiles } from '@/config/roles';
import { REQUEST_STATUS_LABELS, WORKFLOW_ACTION_LABELS } from '@/config/workflow-labels';

export const CDC_REFERENCES = {
  profiles: 'CDC §3 — Profils utilisateurs',
  rbac: 'CDC §4.10 — Rôles et permissions',
  workflow: 'CDC §4 — Workflow demandes d\'autorisation',
  auth: 'CDC §4.8 — Authentification et sécurité',
  audit: 'CDC §4.9 — Traçabilité et audit',
  platform: 'CDC §2 — Contexte institutionnel',
} as const;

export type RbacTier = 'national' | 'regional' | 'establishment' | 'partner';

export const RBAC_TIERS: { id: RbacTier; label: string; order: number }[] = [
  { id: 'national', label: 'Niveau national (DVS)', order: 1 },
  { id: 'regional', label: 'Niveau régional (DRENA)', order: 2 },
  { id: 'establishment', label: 'Niveau établissement', order: 3 },
  { id: 'partner', label: 'Partenaires externes', order: 4 },
];

export type RbacProfile = {
  code: string;
  tier: RbacTier;
  category: string;
  role: string;
  perimeter: string;
  accessLevel: string;
  moduleAccess: string;
  cdcRef: string;
};

export const RBAC_PROFILES: RbacProfile[] = [
  {
    code: userProfiles.adminPrincipal.id,
    tier: 'national',
    category: userProfiles.adminPrincipal.label,
    role: userProfiles.adminPrincipal.role,
    perimeter: 'Territoire national',
    accessLevel: 'Complet',
    moduleAccess: userProfiles.adminPrincipal.access,
    cdcRef: CDC_REFERENCES.profiles,
  },
  {
    code: userProfiles.adminSecondary[0].id,
    tier: 'national',
    category: userProfiles.adminSecondary[0].label,
    role: userProfiles.adminSecondary[0].role,
    perimeter: 'Territoire national (périmètre assigné)',
    accessLevel: 'Étendu',
    moduleAccess: userProfiles.adminSecondary[0].access,
    cdcRef: CDC_REFERENCES.rbac,
  },
  {
    code: userProfiles.adminSecondary[1].id,
    tier: 'regional',
    category: userProfiles.adminSecondary[1].label,
    role: userProfiles.adminSecondary[1].role,
    perimeter: 'Région / DRENA / DDENA',
    accessLevel: 'Régional',
    moduleAccess: userProfiles.adminSecondary[1].access,
    cdcRef: CDC_REFERENCES.rbac,
  },
  ...userProfiles.users.map((profile) => ({
    code: profile.id,
    tier: 'establishment' as const,
    category: profile.label,
    role: profile.role,
    perimeter: 'Établissement scolaire assigné',
    accessLevel: 'Opérationnel',
    moduleAccess: profile.access,
    cdcRef: CDC_REFERENCES.profiles,
  })),
  {
    code: userProfiles.partners.id,
    tier: 'partner',
    category: userProfiles.partners.label,
    role: userProfiles.partners.role,
    perimeter: 'Périmètre partenaire contrôlé',
    accessLevel: 'Restreint',
    moduleAccess: userProfiles.partners.access,
    cdcRef: CDC_REFERENCES.rbac,
  },
];

const ROLE_LABELS: Record<string, string> = {
  dvs_director: 'Directeur DVS',
  dvs_staff: 'Collaborateur DVS',
  drena_manager: 'Responsable DRENA',
  school_head_primary: 'Chef étab. primaire',
  school_head_secondary: 'Chef étab. secondaire',
  education_officer: 'Responsable éducatif',
  external_partner: 'Partenaire externe',
};

function formatModuleRoles(roles: (typeof appModules)[number]['roles']): string {
  if (roles === 'all') return 'Tous les profils authentifiés';
  return roles.map((code) => ROLE_LABELS[code] ?? code).join(', ');
}

export const MODULE_PERMISSION_MATRIX = appModules.map((module) => ({
  moduleId: module.id,
  module: module.label,
  description: module.description,
  authorizedRoles: formatModuleRoles(module.roles),
  cdcRef: module.id === 'administration' ? CDC_REFERENCES.rbac : CDC_REFERENCES.profiles,
}));

export const WORKFLOW_RULES = [
  {
    order: 1,
    action: 'submit',
    actionLabel: WORKFLOW_ACTION_LABELS.submit,
    fromLabel: REQUEST_STATUS_LABELS.draft,
    toLabel: REQUEST_STATUS_LABELS.submitted,
    authorizedRoles: 'Établissement, encadrement, DVS',
    rule: 'Seuls les brouillons peuvent être soumis à la DREN.',
  },
  {
    order: 2,
    action: 'review',
    actionLabel: WORKFLOW_ACTION_LABELS.review,
    fromLabel: REQUEST_STATUS_LABELS.submitted,
    toLabel: REQUEST_STATUS_LABELS.under_review,
    authorizedRoles: 'DRENA, DVS',
    rule: 'Prise en charge régionale obligatoire avant décision DVS.',
  },
  {
    order: 3,
    action: 'forward',
    actionLabel: WORKFLOW_ACTION_LABELS.forward,
    fromLabel: REQUEST_STATUS_LABELS.under_review,
    toLabel: REQUEST_STATUS_LABELS.forwarded,
    authorizedRoles: 'DRENA, DVS',
    rule: 'Transmission formelle du dossier à la DVS pour décision.',
  },
  {
    order: 4,
    action: 'return_for_correction',
    actionLabel: WORKFLOW_ACTION_LABELS.return_for_correction,
    fromLabel: 'Soumis / En analyse / Transmis',
    toLabel: REQUEST_STATUS_LABELS.returned_for_correction,
    authorizedRoles: 'DVS uniquement',
    rule: 'Renvoi à l\'établissement — contact service Voyage Découverte obligatoire.',
  },
  {
    order: 5,
    action: 'approve',
    actionLabel: WORKFLOW_ACTION_LABELS.approve,
    fromLabel: `${REQUEST_STATUS_LABELS.under_review} / ${REQUEST_STATUS_LABELS.forwarded}`,
    toLabel: REQUEST_STATUS_LABELS.approved,
    authorizedRoles: 'DVS uniquement',
    rule: 'Décision favorable — contrôles DVS (prospection, TDR, certificat) requis.',
  },
  {
    order: 6,
    action: 'reject',
    actionLabel: WORKFLOW_ACTION_LABELS.reject,
    fromLabel: 'Soumis / En analyse / Transmis',
    toLabel: REQUEST_STATUS_LABELS.rejected,
    authorizedRoles: 'DVS uniquement',
    rule: 'Rejet définitif pour l\'année en cours — préparation rentrée prochaine.',
  },
  {
    order: 7,
    action: 'revoke',
    actionLabel: WORKFLOW_ACTION_LABELS.revoke,
    fromLabel: REQUEST_STATUS_LABELS.approved,
    toLabel: REQUEST_STATUS_LABELS.cancelled,
    authorizedRoles: 'DVS uniquement',
    rule: 'Annulation si conditions DVS non respectées — motif obligatoire.',
  },
  {
    order: 8,
    action: 'cancel',
    actionLabel: WORKFLOW_ACTION_LABELS.cancel,
    fromLabel: `${REQUEST_STATUS_LABELS.draft} / ${REQUEST_STATUS_LABELS.submitted}`,
    toLabel: REQUEST_STATUS_LABELS.cancelled,
    authorizedRoles: 'Établissement, DVS',
    rule: 'Annulation avant décision finale — statut terminal.',
  },
] as const;

export const WORKFLOW_CHAIN = authorizationWorkflow;

export const ACCOUNT_LIFECYCLE_RULES = [
  {
    order: 1,
    phase: 'Provisionnement',
    action: 'Bootstrap initial',
    rule: 'Compte directeur DVS via script CLI et variables PNIGVS_ADMIN_*.',
    status: 'active' as const,
    cdcRef: CDC_REFERENCES.auth,
  },
  {
    order: 2,
    phase: 'Activation',
    action: 'Première connexion',
    rule: 'Session cookie HttpOnly — statut compte « active » requis.',
    status: 'active' as const,
    cdcRef: CDC_REFERENCES.auth,
  },
  {
    order: 3,
    phase: 'Gestion',
    action: 'Création comptes agents',
    rule: 'Directeur/fondateur d\'établissement — création DVS via interface admin.',
    status: 'active' as const,
    cdcRef: CDC_REFERENCES.profiles,
  },
  {
    order: 4,
    phase: 'Gestion',
    action: 'Réinitialisation mot de passe',
    rule: 'Flux sécurisé par e-mail — aucun mot de passe en clair.',
    status: 'planned' as const,
    cdcRef: CDC_REFERENCES.auth,
  },
  {
    order: 5,
    phase: 'Gestion',
    action: 'Import en masse',
    rule: 'CSV établissements + responsables — validation DVS.',
    status: 'planned' as const,
    cdcRef: CDC_REFERENCES.profiles,
  },
  {
    order: 6,
    phase: 'Suspension',
    action: 'Désactivation compte',
    rule: 'Révocation sessions actives — conservation audit.',
    status: 'planned' as const,
    cdcRef: CDC_REFERENCES.audit,
  },
];

export const SECURITY_RULES = [
  { id: 'pwd-length', label: 'Longueur mot de passe', value: '12 caractères minimum', mandatory: true, cdcRef: CDC_REFERENCES.auth },
  { id: 'env-secrets', label: 'Secrets d\'environnement', value: 'Ne jamais committer .env', mandatory: true, cdcRef: CDC_REFERENCES.auth },
  { id: 'session-cookie', label: 'Session', value: 'Cookie HttpOnly — expiration configurable', mandatory: true, cdcRef: CDC_REFERENCES.auth },
  { id: 'cors-origin', label: 'Origine CORS', value: 'Liste blanche stricte (CORS_ORIGIN)', mandatory: true, cdcRef: CDC_REFERENCES.auth },
  { id: '2fa', label: 'Double authentification', value: 'Activation prévue — phase 2', mandatory: false, cdcRef: CDC_REFERENCES.auth },
  { id: 'rbac-enforce', label: 'Contrôle d\'accès', value: 'RBAC sur chaque route API métier', mandatory: true, cdcRef: CDC_REFERENCES.rbac },
];

export type EnvParam = {
  key: string;
  required: boolean;
  type: string;
  rule: string;
  example?: string;
};

export type EnvParamGroup = {
  id: string;
  label: string;
  description: string;
  cdcRef: string;
  params: EnvParam[];
};

export const ENV_PARAM_GROUPS: EnvParamGroup[] = [
  {
    id: 'auth',
    label: 'Authentification bootstrap',
    description: 'Provisionnement du compte administrateur initial DVS.',
    cdcRef: CDC_REFERENCES.auth,
    params: [
      { key: 'PNIGVS_ADMIN_EMAIL', required: true, type: 'e-mail', rule: 'Identifiant unique directeur DVS.', example: 'admin@dvs.ci' },
      { key: 'PNIGVS_ADMIN_PASSWORD', required: true, type: 'secret', rule: '12 caractères minimum — jamais commité.' },
      { key: 'PNIGVS_ADMIN_FULL_NAME', required: true, type: 'texte', rule: 'Nom affiché interface et journaux audit.' },
    ],
  },
  {
    id: 'database',
    label: 'Base de données',
    description: 'Connexion PostgreSQL sécurisée.',
    cdcRef: CDC_REFERENCES.platform,
    params: [
      { key: 'DATABASE_URL', required: true, type: 'URL PostgreSQL', rule: 'SSL obligatoire (sslmode=require).', example: 'postgresql://…?sslmode=require' },
    ],
  },
  {
    id: 'network',
    label: 'Réseau & API',
    description: 'Serveur API et origines autorisées.',
    cdcRef: CDC_REFERENCES.auth,
    params: [
      { key: 'PORT', required: false, type: 'numéro', rule: 'Port API — défaut 5000 en dev.', example: '5000' },
      { key: 'CORS_ORIGIN', required: true, type: 'URL', rule: 'Origine portail exacte — pas de wildcard prod.', example: 'http://localhost:26270' },
    ],
  },
];

export const PLATFORM_SETTINGS = [
  {
    group: 'Institution',
    cdcRef: CDC_REFERENCES.platform,
    items: [
      { key: 'République', value: institution.republic },
      { key: 'Ministère', value: institution.ministry.fullName },
      { key: 'Maître d\'ouvrage', value: institution.direction.fullName },
      { key: 'Rôle DVS', value: institution.direction.role },
    ],
  },
  {
    group: 'Plateforme PNIGVS',
    cdcRef: CDC_REFERENCES.platform,
    items: [
      { key: 'Sigle', value: institution.platform.name },
      { key: 'Nom complet', value: institution.platform.fullName },
      { key: 'Mission', value: institution.platform.description },
      { key: 'Baseline', value: institution.platform.tagline },
    ],
  },
  {
    group: 'Système',
    cdcRef: CDC_REFERENCES.platform,
    items: [
      { key: 'Version CDC', value: `${institution.project.version} (${institution.project.date})` },
      { key: 'Statut projet', value: institution.project.status },
      { key: 'Fuseau horaire', value: institution.timezone },
      { key: 'Locale', value: institution.locale },
      { key: 'Licence', value: institution.legal.license },
    ],
  },
];

export const ACTIVITY_TYPE_RULES = activityTypes.map((type, index) => ({
  order: index + 1,
  type,
  rule: 'Soumis à demande d\'autorisation Établissement → DREN → DVS.',
  cdcRef: CDC_REFERENCES.workflow,
}));

export const AUDIT_RULES = [
  { category: 'Activités scolaires', scope: 'Création, modification', retention: 'Permanent en base', status: 'active' as const, cdcRef: CDC_REFERENCES.audit },
  { category: 'Connexions agents', scope: 'IP, user-agent, succès/échec', retention: '90 jours min.', status: 'planned' as const, cdcRef: CDC_REFERENCES.audit },
  { category: 'Transitions workflow', scope: 'Décisions DREN/DVS, motifs', retention: 'Par dossier', status: 'active' as const, cdcRef: CDC_REFERENCES.workflow },
  { category: 'Exports sécurité', scope: 'CSV audit, alertes', retention: 'Archivage DVS', status: 'planned' as const, cdcRef: CDC_REFERENCES.audit },
];

export const RBAC_MATRIX = RBAC_PROFILES.map((p) => ({
  code: p.code,
  label: p.category,
  scope: p.role,
  access: p.moduleAccess,
}));

export const ENV_CHECKLIST = ENV_PARAM_GROUPS.flatMap((group) =>
  group.params.map((param) => ({ key: param.key, detail: param.rule })),
);

export const ADMIN_FUNDAMENTAL_RULES = [
  'Tout accès métier est soumis au RBAC — aucun contournement par URL.',
  'Workflow demandes : Établissement → DREN → DVS, sans exception.',
  'Secrets (.env) jamais versionnés ni affichés dans l\'interface.',
  'Chaque décision workflow est historisée et notifiée.',
  'Le périmètre géographique limite établissements et dossiers visibles.',
];

export const BOOTSTRAP_COMMAND = 'pnpm --filter @workspace/scripts bootstrap-auth';
