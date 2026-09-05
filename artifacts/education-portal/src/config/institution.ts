/**
 * Configuration institutionnelle centralisée — PNIGVS / République de Côte d'Ivoire.
 * Dénominations issues du cahier des charges v1.0 (Juin 2026).
 * Client du projet : Direction de la Vie Scolaire (DVS).
 */
export const institution = {
  country: 'Côte d\'Ivoire',
  republic: 'République de Côte d\'Ivoire',
  motto: 'Union · Discipline · Travail',
  locale: 'fr-CI',
  timezone: 'Africa/Abidjan',

  ministry: {
    shortName: 'MENA',
    fullName: 'Ministère de l\'Éducation Nationale et de l\'Alphabétisation',
    brandLines: ['MINISTÈRE', 'DE L\'ÉDUCATION NATIONALE', 'ET DE L\'ALPHABÉTISATION'],
  },

  direction: {
    fullName: 'Direction de la Vie Scolaire',
    shortName: 'DVS',
    brandLines: ['DIRECTION', 'DE LA VIE SCOLAIRE'],
    role: 'Client et maître d\'ouvrage fonctionnel du projet PNIGVS',
  },

  platform: {
    name: 'PNIGVS',
    fullName: 'Plateforme Numérique Intégrée de Gestion de la Vie Scolaire',
    tagline: 'Digitaliser · Coordonner · Piloter la vie scolaire',
    description:
      'Projet de digitalisation et de modernisation des activités de la Direction de la Vie Scolaire sur l\'ensemble du territoire national.',
  },

  project: {
    version: '1.0',
    status: 'Préliminaire',
    date: 'Juin 2026',
  },

  contact: {
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    dvs: {
      address: 'Avenue Lamblin, Immeuble Lamblin — 6e et 7e étages',
      poBox: 'BP V 35',
      district: 'Plateau, Abidjan',
      phone: '+225 27 20 21 37 26',
      email: 'menaet@education.gouv.ci',
      hours: 'Lundi — Vendredi · 8h00 — 16h00',
      director: 'M. GBOKO KOUAKOU ADJOUMANI',
      mapLat: 5.3185233,
      mapLng: -4.0191015,
      mapZoom: 17,
    },
    ministry: {
      address: 'Cité administrative — Tour B (5e, 6e et 7e étages)',
      district: 'Plateau, Abidjan',
      phone: '+225 27 20 21 85 33',
      email: 'menaet@education.gouv.ci',
      website: 'https://www.education.gouv.ci/',
      mapLat: 5.3340682,
      mapLng: -4.0227881,
      mapZoom: 16,
    },
  },

  legal: {
    copyright: 'Direction de la Vie Scolaire — Ministère de l\'Éducation Nationale et de l\'Alphabétisation',
    license: 'République de Côte d\'Ivoire — Document confidentiel',
  },
} as const;

export type Institution = typeof institution;
