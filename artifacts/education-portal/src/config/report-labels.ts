export const reportTypes = ['monthly', 'annual', 'regional'] as const;

export type ReportType = (typeof reportTypes)[number];

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  monthly: 'Rapport mensuel',
  annual: 'Rapport annuel',
  regional: 'Rapport régional',
};
