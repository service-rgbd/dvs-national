/** Routes publiques PNIGVS — source unique pour navigation et liens internes. */
export const publicRoutes = {
  home: '/',
  ministere: '/ministere',
  vieScolaire: '/vie-scolaire',
  etablissements: '/etablissements',
  services: '/services',
  actualites: '/actualites',
  galerieSorties: '/galerie-sorties',
  documents: '/documents',
  statistiques: '/statistiques',
  contact: '/contact',
  recherche: '/recherche',
  espaceAgents: '/espace-agents',
  activites: '/activites',
  establishmentDetail: (id: string) => `/etablissements/${id}`,
} as const;

/** Routes authentifiées — application métier PNIGVS. */
export const appRoutes = {
  login: '/login',
  app: '/app',
  establishments: '/app/etablissements',
  activities: '/app/activites',
  requests: '/app/demandes',
  mediaPublications: '/app/publications-medias',
  documents: '/app/documents',
  statistics: '/app/statistiques',
  administration: '/app/administration',
  adminAccounts: '/app/administration/comptes',
  adminRoles: '/app/administration/roles',
  adminSettings: '/app/administration/parametres',
  adminAudit: '/app/administration/journal',
  profile: '/app/profil',
  requestDetail: (id: string) => `/app/demandes/${id}`,
  mediaPublicationDetail: (id: string) => `/app/publications-medias/${id}`,
  establishmentDetail: (id: string) => `/app/etablissements/${id}`,
} as const;

export type PublicRoute = (typeof publicRoutes)[keyof typeof publicRoutes];
