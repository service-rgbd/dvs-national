/** Colonnes attendues des fichiers Excel DRENA (9 colonnes homogènes). */
export const EXCEL_COLUMNS = [
  "Ordre d'enseignement",
  'N°',
  'Localité',
  'Code Étab.',
  'Établissement',
  'Cycle autorisé',
  'Cycle reconnu',
  'E-mail',
  'Contacts',
] as const;

export type ExcelColumn = (typeof EXCEL_COLUMNS)[number];

export const COLUMN_MAP: Record<ExcelColumn, keyof ParsedEstablishmentRow> = {
  "Ordre d'enseignement": 'teachingOrder',
  'N°': 'listNumber',
  Localité: 'localityName',
  'Code Étab.': 'establishmentCode',
  Établissement: 'name',
  'Cycle autorisé': 'authorizedCycle',
  'Cycle reconnu': 'recognizedCycle',
  'E-mail': 'email',
  Contacts: 'contacts',
};

export type ParsedEstablishmentRow = {
  teachingOrder: string;
  listNumber: string;
  localityName: string;
  establishmentCode: string;
  name: string;
  authorizedCycle: string;
  recognizedCycle: string;
  email: string;
  contacts: string;
  sourceFile: string;
  sourceSheet: string;
  sourceRow: number;
  drenaName: string;
};

export type ValidatedEstablishmentRow = ParsedEstablishmentRow & {
  listNumberInt: number;
  establishmentCodeNormalized: string;
  localityNameNormalized: string;
};

export type RowIssue = {
  level: 'error' | 'warning';
  code: string;
  message: string;
  sourceFile: string;
  sourceSheet: string;
  sourceRow: number;
  establishmentCode?: string;
  name?: string;
};

export type ImportReport = {
  startedAt: string;
  finishedAt?: string;
  sourceFiles: string[];
  drenaName: string;
  totals: {
    read: number;
    valid: number;
    invalid: number;
    warnings: number;
    duplicateCodes: number;
    inserted: number;
    updated: number;
    skipped: number;
  };
  issues: RowIssue[];
  duplicateCodeGroups: Array<{
    establishmentCode: string;
    rows: Array<{ sourceFile: string; sourceRow: number; name: string }>;
  }>;
};
