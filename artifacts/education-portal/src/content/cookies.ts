import { publicRoutes } from './routes';

export const cookieBanner = {
  title: 'Bienvenue sur PNIGVS',
  description:
    'Nous utilisons des cookies pour mesurer l\'audience, améliorer le fonctionnement du site et évaluer nos campagnes. Votre choix est conservé pendant 13 mois.',
  customizeDetail:
    'Personnaliser : les cookies essentiels restent actifs ; les cookies de mesure d\'audience sont désactivés par défaut.',
  detailsLabel: 'En savoir plus sur les données personnelles et les cookies',
  detailsHref: publicRoutes.contact,
  acceptLabel: 'Tout accepter',
  refuseLabel: 'Tout refuser',
  customizeLabel: 'Personnaliser',
  closeCustomizeLabel: 'Fermer les options',
  retentionMonths: 13,
} as const;
