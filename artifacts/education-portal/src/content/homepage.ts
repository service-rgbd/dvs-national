import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileText,
} from 'lucide-react';

import { publicRoutes } from './routes';

export type NewsItem = {
  title: string;
  text: string;
  tag: string;
  image?: string;
  href: string;
  date?: string;
};

export type ServiceItem = {
  title: string;
  icon: LucideIcon;
  href: string;
};

export type SeasonalCard = {
  title: string;
  text: string;
  image?: string;
  href: string;
};

export type ExperienceItem = {
  title: string;
  text: string;
  href: string;
};

export type OutingPhoto = {
  src: string;
  alt: string;
};

export const heroContent = {
  eyebrow: 'PNIGVS',
  title: 'Piloter la vie scolaire à l\'échelle nationale',
  description:
    'Projet de digitalisation et de modernisation des activités de la Direction de la Vie Scolaire sur l\'ensemble du territoire national.',
  ctaLabel: 'Découvrir les services de la vie scolaire',
  ctaHref: publicRoutes.services,
  visualCaption: 'DIGITALISER · COORDONNER · SUIVRE',
  visualAlt: 'Illustration éditoriale autour de la gestion numérique de la vie scolaire en Côte d\'Ivoire',
} as const;

export const newsSection = {
  title: 'À la une',
  viewAllLabel: 'Toutes les actualités',
  viewAllHref: publicRoutes.actualites,
  items: [
    {
      title: 'Mise en service progressive du PNIGVS',
      text: 'La Direction de la Vie Scolaire déploie la plateforme numérique pour digitaliser les activités administratives, éducatives et communicationnelles.',
      tag: 'Projet',
      image: 'flag',
      href: publicRoutes.services,
      date: '2025-06-12',
    },
    {
      title: 'Centralisation des données des établissements',
      text: 'Le référentiel national des établissements scolaires primaires et secondaires alimente l\'annuaire et les statistiques de la vie scolaire.',
      tag: 'Référentiel',
      image: 'portrait',
      href: publicRoutes.etablissements,
      date: '2025-07-03',
    },
    {
      title: 'Workflow de demande d\'autorisation',
      text: 'Les établissements soumettent leurs demandes à la DREN pour analyse, puis à la DVS pour validation ou rejet, avec notification automatique.',
      tag: 'Procédure',
      href: publicRoutes.vieScolaire,
      date: '2025-07-18',
    },
    {
      title: 'Suivi statistique national des activités',
      text: 'Tableaux de bord, rapports mensuels et annuels pour le pilotage des activités scolaires sur l\'ensemble du territoire.',
      tag: 'Statistiques',
      href: publicRoutes.statistiques,
      date: '2025-08-01',
    },
  ] satisfies NewsItem[],
};

export const servicesSection = {
  title: 'La vie scolaire et vous',
  description: 'Services numériques de la Direction de la Vie Scolaire pour les DREN, les établissements et les partenaires institutionnels.',
  items: [
    { title: 'Activités scolaires', icon: CalendarDays, href: publicRoutes.vieScolaire },
    { title: 'Demandes d\'autorisation', icon: ClipboardCheck, href: publicRoutes.services },
    { title: 'Annuaire des établissements', icon: Building2, href: publicRoutes.etablissements },
    { title: 'Calendrier national', icon: CalendarDays, href: publicRoutes.vieScolaire },
    { title: 'Documents et archives', icon: FileText, href: publicRoutes.documents },
    { title: 'Statistiques et rapports', icon: BarChart3, href: publicRoutes.statistiques },
  ] satisfies ServiceItem[],
};

export const establishmentsSection = {
  id: 'etablissements',
  title: 'Annuaire des établissements',
  description:
    'Consultez la fiche de chaque établissement : identification, périmètre géographique et sorties publiées (photos, vidéos).',
  viewAllLabel: 'Voir l\'annuaire complet',
  viewAllHref: publicRoutes.etablissements,
  previewCount: 3,
};

export const seasonalSection = {
  id: 'rentree',
  title: 'Calendrier et rentrée scolaire',
  viewAllLabel: 'Voir le calendrier complet',
  viewAllHref: publicRoutes.vieScolaire,
  items: [
    {
      title: 'Calendrier national des activités',
      text: 'Programmation des événements, campagnes éducatives et périodes clés de l\'année scolaire.',
      image: 'playground',
      href: publicRoutes.vieScolaire,
    },
    {
      title: 'Dates de la rentrée 2025-2026',
      text: 'Reprise des cours, vacances scolaires et périodes d\'évaluation sur le territoire national.',
      image: 'child',
      href: publicRoutes.vieScolaire,
    },
    {
      title: 'Soumettre une demande d\'activité',
      text: 'Les établissements initient une demande d\'autorisation pour sorties, compétitions ou événements.',
      href: publicRoutes.services,
    },
    {
      title: 'Consulter l\'annuaire des établissements',
      text: 'Recherche par nom, code, région, DRENA, localité et cycle d\'enseignement.',
      href: publicRoutes.etablissements,
    },
  ] satisfies SeasonalCard[],
};

export type StaffCategory = {
  id: string;
  title: string;
  links: string[];
};

export const staffSection = {
  title: 'Espaces professionnels PNIGVS',
  description: 'Accès réservé aux agents de la DVS, aux responsables DREN, aux chefs d\'établissement et aux partenaires autorisés.',
  feature: {
    title: 'Connexion à l\'application métier PNIGVS',
    text: 'Gérez les activités scolaires, les demandes d\'autorisation, la communication institutionnelle, les documents et les statistiques selon votre profil et vos permissions.',
    ctaLabel: 'Accéder à l\'espace agents PNIGVS',
    ctaHref: publicRoutes.espaceAgents,
    visualCaption: 'DVS · DREN · ÉTABLISSEMENTS',
    visualAlt: 'Illustration éditoriale autour des espaces professionnels de la Direction de la Vie Scolaire',
  },
  categories: [
    {
      id: 'direction',
      title: 'Direction centrale',
      links: [
        'Directeur de la Vie Scolaire',
        'Collaborateurs DVS',
      ],
    },
    {
      id: 'territorial',
      title: 'Réseau territorial',
      links: [
        'Responsables régionaux DREN',
      ],
    },
    {
      id: 'etablissements',
      title: 'Chefs d\'établissement',
      links: [
        'Chefs d\'établissement primaire',
        'Chefs d\'établissement secondaire',
      ],
    },
    {
      id: 'educatif',
      title: 'Corps éducatif',
      links: [
        'Responsables éducatifs',
      ],
    },
  ] satisfies StaffCategory[],
};

export const outingsSection = {
  id: 'sorties-scolaires',
  eyebrow: 'Sorties scolaires',
  title: 'Olympiades des métiers Abidjan 2025',
  description: 'Compétition de couture avec la maison Pathé\' O',
  viewAllLabel: 'Voir la galerie des sorties',
  viewAllHref: publicRoutes.galerieSorties,
  heroImage: {
    src: '/olympiades/olympiades-hero.png',
    alt: 'Illustration éditoriale des Olympiades des métiers — compétition de couture à Abidjan 2025',
  },
  photos: [
    {
      src: '/olympiades/olympiades-1.png',
      alt: 'Élèves en compétition de couture lors des Olympiades des métiers à Abidjan',
    },
    {
      src: '/olympiades/olympiades-2.png',
      alt: 'Atelier de couture avec la maison Pathé\' O pendant les Olympiades des métiers',
    },
    {
      src: '/olympiades/olympiades-3.png',
      alt: 'Travaux pratiques de couture par les participants aux Olympiades des métiers',
    },
    {
      src: '/olympiades/olympiades-4.png',
      alt: 'Encadrement et démonstration lors de la compétition de couture',
    },
    {
      src: '/olympiades/olympiades-5.png',
      alt: 'Moments forts de la sortie scolaire aux Olympiades des métiers Abidjan 2025',
    },
  ] satisfies OutingPhoto[],
};

export const experiencesSection = {
  eyebrow: 'Module activités scolaires',
  title: 'Types d\'activités suivies',
  description: 'Sorties pédagogiques, événements culturels, compétitions, conférences, campagnes éducatives et activités sportives.',
  viewAllHref: publicRoutes.vieScolaire,
  items: [
    {
      title: 'Sorties pédagogiques et événements culturels',
      text: 'Création, programmation et suivi des activités avec validation institutionnelle.',
      href: publicRoutes.vieScolaire,
    },
    {
      title: 'Compétitions et activités sportives',
      text: 'Organisation nationale et régionale avec production de rapports d\'activités.',
      href: publicRoutes.vieScolaire,
    },
    {
      title: 'Campagnes éducatives et conférences',
      text: 'Diffusion, archivage sécurisé et statistiques de participation.',
      href: publicRoutes.vieScolaire,
    },
  ] satisfies ExperienceItem[],
};

export const contactSection = {
  title: 'Nous contacter',
  description: 'Interlocuteurs de la Direction de la Vie Scolaire et du réseau DREN / établissements.',
  links: [
    'Direction de la Vie Scolaire (DVS)',
    'Directions Régionales de l\'Éducation Nationale (DREN)',
    'Établissements primaires et secondaires',
    'Responsables éducatifs',
    'Partenaires institutionnels',
    'Protection des données personnelles',
    'Assistance technique PNIGVS',
    'Autres contacts',
  ],
  socialTitle: 'Suivez la Direction de la Vie Scolaire',
  socialNetworks: [
    { id: 'facebook', label: 'Facebook' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'x', label: 'X' },
  ],
};

export const skipLinks = [
  { href: '#main-content', label: 'Accéder au contenu principal', testId: 'link-skip-content' },
  { href: '#page-header--menu', label: 'Accéder au menu', testId: 'link-skip-menu' },
  { href: '#search-block-form', label: 'Accéder à la recherche', testId: 'link-skip-search' },
  { href: '#footer', label: 'Accéder au pied de page', testId: 'link-skip-footer' },
] as const;

export const searchContent = {
  label: 'Rechercher une information',
  placeholder: 'Rechercher une activité, une démarche, un établissement ou un contact',
  submitAriaLabel: 'Lancer la recherche',
  emptyMessage: 'Saisissez un terme pour lancer une recherche.',
  resultsMessage: (query: string) =>
    `Résultats pour « ${query} » — la recherche avancée sera connectée à l'API PNIGVS prochainement.`,
};
