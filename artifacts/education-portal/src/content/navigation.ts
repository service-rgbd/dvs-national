import { agentsLoginUrl, isDiscoverPortalSurface } from '@/config/agents-portal';

import { publicRoutes } from './routes';

const agentsLoginHref = agentsLoginUrl();

export type NavSubmenuItem = {
  label: string;
  href: string;
  description?: string;
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  hasSubmenu?: boolean;
  submenu?: NavSubmenuItem[];
};

export const mainNavigation: NavItem[] = [
  { id: 'accueil', label: 'Accueil', href: publicRoutes.home },
  {
    id: 'dvs',
    label: 'La DVS',
    href: publicRoutes.ministere,
    hasSubmenu: true,
    submenu: [
      { label: 'Le Ministère (MENA)', href: publicRoutes.ministere, description: 'Tutelle et cadre institutionnel' },
      { label: 'Direction de la Vie Scolaire', href: publicRoutes.ministere, description: 'Maître d\'ouvrage du PNIGVS' },
      { label: 'Espace agents', href: publicRoutes.espaceAgents, description: 'Accès sécurisé aux profils autorisés' },
    ],
  },
  {
    id: 'vie-scolaire',
    label: 'Vie scolaire',
    href: publicRoutes.vieScolaire,
    hasSubmenu: true,
    submenu: [
      { label: 'Périmètre de la vie scolaire', href: publicRoutes.vieScolaire, description: 'Digitalisation des activités nationales' },
      { label: 'Activités scolaires', href: publicRoutes.vieScolaire, description: 'Programmation et suivi des activités' },
      { label: 'Demandes d\'autorisation', href: publicRoutes.services, description: 'Workflow Établissement → DREN → DVS' },
    ],
  },
  {
    id: 'etablissements',
    label: 'Établissements',
    href: publicRoutes.etablissements,
    hasSubmenu: true,
    submenu: [
      { label: 'Annuaire national', href: publicRoutes.etablissements, description: 'Primaire et secondaire' },
      { label: 'Rechercher un établissement', href: publicRoutes.recherche, description: 'Par nom, localité ou DREN' },
      { label: 'Statistiques établissements', href: publicRoutes.statistiques, description: 'Indicateurs du référentiel' },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    href: publicRoutes.services,
    hasSubmenu: true,
    submenu: [
      { label: 'Modules PNIGVS', href: publicRoutes.services, description: 'Fonctionnalités de la plateforme' },
      { label: 'Tableau de bord', href: publicRoutes.services, description: 'Pilotage et indicateurs' },
      { label: 'Connexion application', href: agentsLoginHref, description: 'Espace métier sécurisé' },
    ],
  },
  {
    id: 'actualites',
    label: 'Actualités',
    href: publicRoutes.actualites,
    hasSubmenu: true,
    submenu: [
      { label: 'Toutes les actualités', href: publicRoutes.actualites, description: 'Communiqués et informations DVS' },
      { label: 'Galerie des sorties', href: publicRoutes.galerieSorties, description: 'Photos et vidéos publiées' },
      { label: 'À la une', href: publicRoutes.home, description: 'Dernières nouvelles du portail' },
      { label: 'Rentrée scolaire', href: `${publicRoutes.home}#rentree`, description: 'Démarches et ressources' },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    href: publicRoutes.documents,
    hasSubmenu: true,
    submenu: [
      { label: 'Publications DVS', href: publicRoutes.documents, description: 'Circulaires et guides' },
      { label: 'Rapports d\'activités', href: publicRoutes.documents, description: 'Rapports mensuels et annuels' },
      { label: 'Fichiers publics', href: publicRoutes.documents, description: 'Téléchargement des ressources' },
    ],
  },
  {
    id: 'statistiques',
    label: 'Statistiques',
    href: publicRoutes.statistiques,
    hasSubmenu: true,
    submenu: [
      { label: 'Indicateurs publics', href: publicRoutes.statistiques, description: 'Données ouvertes vie scolaire' },
      { label: 'Établissements référencés', href: publicRoutes.statistiques, description: 'Volumes et répartition' },
      { label: 'Activités et demandes', href: publicRoutes.statistiques, description: 'Suivi opérationnel' },
    ],
  },
  { id: 'contact', label: 'Contact', href: publicRoutes.contact },
];

/** Navigation vitrine publique — activités, établissements, galerie (sans rubriques institutionnelles). */
export const discoverNavigation: NavItem[] = [
  { id: 'accueil', label: 'Accueil', href: publicRoutes.home },
  {
    id: 'activites',
    label: 'Activités',
    href: publicRoutes.activites,
    hasSubmenu: true,
    submenu: [
      { label: 'Programme national', href: publicRoutes.activites, description: 'Activités scolaires autorisées' },
      { label: 'Galerie des sorties', href: publicRoutes.galerieSorties, description: 'Photos et vidéos publiées' },
      { label: 'Vie scolaire', href: publicRoutes.vieScolaire, description: 'Périmètre et modules PNIGVS' },
    ],
  },
  {
    id: 'etablissements',
    label: 'Établissements',
    href: publicRoutes.etablissements,
    hasSubmenu: true,
    submenu: [
      { label: 'Annuaire national', href: publicRoutes.etablissements, description: 'Primaire et secondaire' },
      { label: 'Rechercher', href: publicRoutes.recherche, description: 'Par nom, localité ou DREN' },
    ],
  },
  {
    id: 'actualites',
    label: 'Actualités',
    href: publicRoutes.actualites,
    hasSubmenu: true,
    submenu: [
      { label: 'Toutes les actualités', href: publicRoutes.actualites, description: 'Communiqués DVS' },
      { label: 'Galerie des sorties', href: publicRoutes.galerieSorties, description: 'Retours en images' },
    ],
  },
  {
    id: 'statistiques',
    label: 'Statistiques',
    href: publicRoutes.statistiques,
  },
  { id: 'contact', label: 'Contact', href: publicRoutes.contact },
];

export function getMainNavigation(): NavItem[] {
  return isDiscoverPortalSurface() ? discoverNavigation : mainNavigation;
}

export const institutionalUtilityLinks = [
  { id: 'stats', label: 'Statistiques publiques', href: publicRoutes.statistiques },
  { id: 'rapports', label: 'Rapports DVS', href: publicRoutes.documents },
  { id: 'connexion', label: 'Connexion PNIGVS', href: agentsLoginHref, external: true },
] as const;

export const discoverUtilityLinks = [
  { id: 'stats', label: 'Statistiques publiques', href: publicRoutes.statistiques },
  { id: 'activites', label: 'Activités', href: publicRoutes.activites },
] as const;

export function getHeaderUtilityLinks() {
  return isDiscoverPortalSurface() ? discoverUtilityLinks : institutionalUtilityLinks;
}
