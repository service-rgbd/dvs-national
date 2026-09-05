export const documentCategories = [
  'circulaire',
  'rapport',
  'fichier_scolaire',
  'autre',
] as const;

export type DocumentCategory = (typeof documentCategories)[number];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  circulaire: 'Circulaire',
  rapport: 'Rapport',
  fichier_scolaire: 'Fichier scolaire',
  autre: 'Autre',
};

export const DOCUMENT_CATEGORY_DESCRIPTIONS: Record<DocumentCategory, string> = {
  circulaire: 'Notes officielles et consignes DVS / DREN.',
  rapport: 'Rapports d\'activité et synthèses périodiques.',
  fichier_scolaire: 'Documents de vie scolaire déposés par les établissements.',
  autre: 'Autres ressources documentaires.',
};

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
