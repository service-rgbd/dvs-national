import { publicRoutes } from './routes';

export type ActualitesSpot = {
  id: string;
  tag: string;
  title: string;
  text: string;
  href: string;
};

export type ActualitesInfoBlock = {
  title: string;
  items: string[];
};

export const actualitesPageContent = {
  stripTitle: 'Communiqués DVS',
  stripSummary: 'Actualités institutionnelles · avancement PNIGVS · annonces vie scolaire nationale',
  spotsTitle: 'Repères & services',
  spots: [
    {
      id: 'galerie',
      tag: 'Médias',
      title: 'Galerie des sorties',
      text: 'Photos et vidéos de sorties validées DREN/DVS.',
      href: publicRoutes.galerieSorties,
    },
    {
      id: 'services',
      tag: 'PNIGVS',
      title: 'Services numériques',
      text: 'Modules métier : activités, demandes, documents, statistiques.',
      href: publicRoutes.services,
    },
    {
      id: 'vie-scolaire',
      tag: 'Vie scolaire',
      title: 'Périmètre DVS',
      text: 'Workflow d\'autorisation et types d\'activités suivies.',
      href: publicRoutes.vieScolaire,
    },
    {
      id: 'etablissements',
      tag: 'Référentiel',
      title: 'Annuaire national',
      text: 'Fiches établissements et sorties publiées par établissement.',
      href: publicRoutes.etablissements,
    },
    {
      id: 'statistiques',
      tag: 'Pilotage',
      title: 'Statistiques publiques',
      text: 'Indicateurs nationaux de la vie scolaire.',
      href: publicRoutes.statistiques,
    },
    {
      id: 'contact',
      tag: 'Institution',
      title: 'Contacter la DVS',
      text: 'Interlocuteurs DVS, DRENA et assistance PNIGVS.',
      href: publicRoutes.contact,
    },
  ] satisfies ActualitesSpot[],
  infoBlocks: [
    {
      title: 'Fil institutionnel',
      items: [
        'Communiqués officiels de la Direction de la Vie Scolaire publiés après validation.',
        'Contenus de présentation du projet PNIGVS en attendant le fil administratif complet.',
      ],
    },
    {
      title: 'Fréquence & périmètre',
      items: [
        'Couverture nationale — toutes les DRENA et établissements concernés par la vie scolaire.',
        'Actualités liées aux activités, autorisations, médias de sortie et pilotage statistique.',
      ],
    },
  ] satisfies ActualitesInfoBlock[],
};
