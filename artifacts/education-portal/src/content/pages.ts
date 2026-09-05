import { institution } from '@/config/institution';
import { publicRoutes } from '@/content/routes';

export const publicPageContent = {
  ministere: {
    title: 'Le Ministère et la Direction de la Vie Scolaire',
    description:
      'Cadre institutionnel du PNIGVS au sein du Ministère de l\'Éducation Nationale et de l\'Alphabétisation.',
    seoDescription:
      'Présentation institutionnelle du MENA et de la Direction de la Vie Scolaire (DVS), maître d\'ouvrage du PNIGVS.',
  },
  vieScolaire: {
    title: 'Vie scolaire',
    description: institution.platform.description,
    seoDescription:
      'Digitalisation et coordination des activités de la vie scolaire sur l\'ensemble du territoire national.',
  },
  etablissements: {
    title: 'Établissements scolaires',
    description:
      'Annuaire national des établissements primaires et secondaires — référentiel en cours d\'intégration.',
    seoDescription:
      'Consultation du référentiel national des établissements scolaires de Côte d\'Ivoire via le PNIGVS.',
  },
  services: {
    title: 'Services PNIGVS',
    description:
      'Modules fonctionnels de la Plateforme Numérique Intégrée de Gestion de la Vie Scolaire.',
    seoDescription: 'Services numériques de la DVS : activités, demandes, documents, statistiques et communication.',
  },
  actualites: {
    title: 'Actualités',
    description: 'Informations et communiqués de la Direction de la Vie Scolaire.',
    seoDescription: 'Actualités de la Direction de la Vie Scolaire et du PNIGVS.',
  },
  galerieSorties: {
    title: 'Galerie des sorties',
    description: 'Photos et vidéos de sorties scolaires validées et publiées sur le portail.',
    seoDescription: 'Galerie publique des sorties scolaires autorisées — PNIGVS.',
    intro:
      'Retrouvez ici les médias de sorties publiés après validation des demandes d\'autorisation par la DREN et la DVS.',
  },
  documents: {
    title: 'Documents',
    description: 'Publications, circulaires et ressources documentaires de la vie scolaire.',
    seoDescription: 'Accès aux documents et publications de la DVS.',
  },
  statistiques: {
    title: 'Statistiques publiques',
    description: 'Indicateurs et données statistiques du système éducatif relatifs à la vie scolaire.',
    seoDescription: 'Statistiques publiques de la vie scolaire en Côte d\'Ivoire.',
  },
  contact: {
    title: 'Contact',
    description: 'Coordonnées et interlocuteurs de la Direction de la Vie Scolaire et du réseau DREN.',
    seoDescription: 'Contacter la DVS, les DRENA et les services du PNIGVS.',
  },
  recherche: {
    title: 'Recherche',
    description: 'Rechercher une information, une démarche ou une rubrique du portail PNIGVS.',
    seoDescription: 'Recherche sur le portail PNIGVS.',
  },
  espaceAgents: {
    title: 'Espace agents PNIGVS',
    description: 'Accès sécurisé réservé aux agents de la DVS, aux responsables DREN et aux établissements.',
    seoDescription: 'Espace agents PNIGVS — connexion sécurisée et accès par profil institutionnel.',
  },
  activites: {
    title: 'Activités scolaires',
    description: 'Consultation publique des activités scolaires autorisées sur le territoire national.',
    seoDescription: 'Activités scolaires validées — PNIGVS, Direction de la Vie Scolaire.',
    intro:
      'Découvrez les sorties, voyages et événements scolaires dont les demandes d\'autorisation ont été validées par la DREN et la DVS.',
  },
} as const;

export const vieScolaireModules = [
  'Gestion intelligente des activités scolaires',
  'Automatisation des procédures administratives',
  'Suivi statistique national',
  'Sécurisation des archives numériques',
  'Production de rapports d\'activités',
  'Communication institutionnelle DVS ↔ DREN ↔ établissements',
] as const;

export const pnigvsModules = [
  { title: 'Authentification', description: 'Connexion sécurisée, rôles, permissions et double authentification.' },
  { title: 'Tableau de bord', description: 'Indicateurs nationaux et régionaux des activités de vie scolaire.' },
  { title: 'Activités scolaires', description: 'Création, programmation, suivi et validation des activités.' },
  { title: 'Demandes d\'autorisation', description: 'Workflow Établissement → DREN → DVS avec notifications.' },
  { title: 'Notifications', description: 'Alertes sur les demandes, validations, refus et échéances.' },
  { title: 'Messagerie interne', description: 'Communication sécurisée entre acteurs institutionnels.' },
  { title: 'Gestion documentaire', description: 'Archivage sécurisé des rapports, photos, vidéos et PDF.' },
  { title: 'Rapports et statistiques', description: 'Production automatique de rapports mensuels, annuels et régionaux.' },
] as const;
