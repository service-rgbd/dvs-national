import { publicRoutes } from './routes';

export const documentsPageContent = {
  stripTitle: 'Documents DVS',
  stripSummary: 'Circulaires · rapports · fichiers scolaires publics · source officielle PNIGVS',
  categorySummary: {
    '': 'Toutes les catégories — circulaires, rapports DVS et fichiers scolaires rendus publics.',
    circulaire: 'Notes officielles et consignes DVS / DREN.',
    rapport: 'Rapports d\'activité et synthèses périodiques.',
    fichier_scolaire: 'Documents de vie scolaire déposés par les établissements.',
    autre: 'Autres ressources documentaires.',
  } as Record<string, string>,
  spots: [
    {
      id: 'stats',
      tag: 'Pilotage',
      title: 'Statistiques publiques',
      text: 'Indicateurs nationaux du référentiel établissements.',
      href: publicRoutes.statistiques,
    },
    {
      id: 'agents',
      tag: 'Professionnel',
      title: 'Espace agents',
      text: 'Dépôt de fichiers scolaires par les profils habilités.',
      href: publicRoutes.espaceAgents,
    },
    {
      id: 'vie-scolaire',
      tag: 'Vie scolaire',
      title: 'Périmètre DVS',
      text: 'Workflow et types d\'activités suivies.',
      href: publicRoutes.vieScolaire,
    },
  ],
};
