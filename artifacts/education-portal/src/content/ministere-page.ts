import { institution } from '@/config/institution';
import { publicRoutes } from './routes';

/** Contenu éditorial — présentation institutionnelle uniquement (coordonnées → page Contact). */
export const ministerePageContent = {
  stripTitle: 'Cadre institutionnel',
  stripSummary:
    'Tutelle MENA · Direction de la Vie Scolaire · Plateforme PNIGVS',

  hierarchy: [
    {
      id: 'republic',
      label: institution.republic,
      detail: institution.motto,
    },
    {
      id: 'mena',
      label: institution.ministry.fullName,
      detail: `Sigle ${institution.ministry.shortName} — tutelle du système éducatif`,
    },
    {
      id: 'dvs',
      label: institution.direction.fullName,
      detail: `${institution.direction.shortName} — maître d'ouvrage fonctionnel du PNIGVS`,
    },
    {
      id: 'pnigvs',
      label: institution.platform.name,
      detail: institution.platform.fullName,
    },
  ],

  ministry: {
    missions: [
      'Définir et piloter la politique éducative et d\'alphabétisation',
      'Superviser les directions centrales et les directions régionales (DRENA)',
      'Assurer la cohérence du système éducatif sur l\'ensemble du territoire',
    ],
    website: institution.contact.ministry.website,
  },

  dvs: {
    director: institution.contact.dvs.director,
    missions: [
      'Promouvoir la vie scolaire (dimensions éducatives, culturelles, sociales et sportives)',
      'Promouvoir l\'action coopérative en milieu scolaire',
      'Initier les activités d\'éveil social',
      'Détecter et suivre les jeunes talents (arts et sports)',
    ],
  },

  platform: {
    meta: `Version ${institution.project.version} · ${institution.project.date} · ${institution.project.status}`,
  },

  footerLinks: [
    { label: 'Coordonnées DVS', href: publicRoutes.contact },
    { label: 'Services PNIGVS', href: publicRoutes.services },
    { label: 'Espace agents', href: publicRoutes.espaceAgents },
  ],
};
