import { isDiscoverPortalSurface } from '@/config/agents-portal';

import { publicRoutes } from './routes';

export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterGroup = {
  id: string;
  title: string;
  links: FooterLink[];
};

export const footerGroups: FooterGroup[] = [
  {
    id: 'footer-pnigvs',
    title: 'PNIGVS — Modules fonctionnels',
    links: [
      { label: 'Connexion sécurisée et gestion des rôles', href: publicRoutes.espaceAgents },
      { label: 'Tableau de bord intelligent', href: publicRoutes.services },
      { label: 'Gestion des activités scolaires', href: publicRoutes.vieScolaire },
      { label: 'Demandes d\'autorisation (Établissement → DREN → DVS)', href: publicRoutes.services },
      { label: 'Notifications et messagerie interne', href: publicRoutes.services },
      { label: 'Gestion documentaire et archivage', href: publicRoutes.documents },
    ],
  },
  {
    id: 'footer-reports',
    title: 'Rapports, publications et statistiques',
    links: [
      { label: 'Rapports mensuels et annuels DVS', href: publicRoutes.documents, external: true },
      { label: 'Statistiques nationales de la vie scolaire', href: publicRoutes.statistiques, external: true },
      { label: 'Rapports régionaux DREN', href: publicRoutes.documents, external: true },
      { label: 'Exports PDF, Excel et Word', href: publicRoutes.documents, external: true },
      { label: 'Données ouvertes — data.gouv.ci', href: 'https://data.gouv.ci', external: true },
    ],
  },
];

export const footerLegalLinks = [
  { id: 'contact', label: 'Contactez la DVS', href: publicRoutes.contact },
  { id: 'legal', label: 'Mentions légales', href: publicRoutes.contact },
  { id: 'privacy', label: 'Données personnelles et cookies', href: publicRoutes.contact },
  { id: 'cookies', label: 'Gestion des cookies', href: publicRoutes.contact, isCookieAction: true },
  { id: 'accessibility', label: 'Déclaration d\'accessibilité : partiellement conforme', href: publicRoutes.contact },
  { id: 'gov', label: 'gouvernement.ci', href: 'https://www.gouv.ci', external: true },
  { id: 'mena', label: 'Ministère de l\'Éducation Nationale et de l\'Alphabétisation', href: 'https://www.education.gouv.ci', external: true },
  { id: 'data', label: 'data.gouv.ci', href: 'https://data.gouv.ci', external: true },
] as const;

export function getFooterGroups(): FooterGroup[] {
  if (!isDiscoverPortalSurface()) {
    return footerGroups;
  }

  return footerGroups.map((group) => ({
    ...group,
    links: group.links.map((link) =>
      link.href === publicRoutes.espaceAgents
        ? { label: 'Activités scolaires autorisées', href: publicRoutes.activites }
        : link.href === publicRoutes.documents
          ? { label: 'Statistiques publiques', href: publicRoutes.statistiques }
          : link,
    ),
  }));
}
