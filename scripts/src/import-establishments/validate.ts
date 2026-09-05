import type { ParsedEstablishmentRow, RowIssue, ValidatedEstablishmentRow } from './types';

const CODE_PATTERN = /^\d{6}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeLocalityName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function validateRow(row: ParsedEstablishmentRow): {
  row?: ValidatedEstablishmentRow;
  issues: RowIssue[];
} {
  const issues: RowIssue[] = [];
  const base = {
    sourceFile: row.sourceFile,
    sourceSheet: row.sourceSheet,
    sourceRow: row.sourceRow,
    establishmentCode: row.establishmentCode,
    name: row.name,
  };

  if (!row.name) {
    issues.push({
      level: 'error',
      code: 'MISSING_NAME',
      message: 'Nom d\'établissement manquant.',
      ...base,
    });
  }

  if (!row.establishmentCode) {
    issues.push({
      level: 'error',
      code: 'MISSING_CODE',
      message: 'Code établissement manquant.',
      ...base,
    });
  } else if (!CODE_PATTERN.test(row.establishmentCode)) {
    issues.push({
      level: 'error',
      code: 'INVALID_CODE_FORMAT',
      message: `Code établissement invalide (attendu 6 chiffres): « ${row.establishmentCode} ».`,
      ...base,
    });
  }

  if (!row.localityName) {
    issues.push({
      level: 'error',
      code: 'MISSING_LOCALITY',
      message: 'Localité manquante.',
      ...base,
    });
  }

  let listNumberInt: number | undefined;
  if (!row.listNumber) {
    issues.push({
      level: 'warning',
      code: 'MISSING_LIST_NUMBER',
      message: 'Numéro de ligne (N°) manquant.',
      ...base,
    });
  } else if (!/^\d+$/.test(row.listNumber)) {
    issues.push({
      level: 'error',
      code: 'INVALID_LIST_NUMBER',
      message: `Numéro de ligne invalide: « ${row.listNumber} ».`,
      ...base,
    });
  } else {
    listNumberInt = Number.parseInt(row.listNumber, 10);
  }

  if (row.email && !EMAIL_PATTERN.test(row.email)) {
    issues.push({
      level: 'warning',
      code: 'INVALID_EMAIL',
      message: `E-mail potentiellement invalide: « ${row.email} ».`,
      ...base,
    });
  }

  const hasError = issues.some((issue) => issue.level === 'error');
  if (hasError) {
    return { issues };
  }

  return {
    row: {
      ...row,
      listNumberInt: listNumberInt ?? 0,
      establishmentCodeNormalized: row.establishmentCode,
      localityNameNormalized: normalizeLocalityName(row.localityName),
    },
    issues,
  };
}

export function validateRows(rows: ParsedEstablishmentRow[]): {
  validRows: ValidatedEstablishmentRow[];
  issues: RowIssue[];
} {
  const validRows: ValidatedEstablishmentRow[] = [];
  const issues: RowIssue[] = [];

  for (const row of rows) {
    const result = validateRow(row);
    issues.push(...result.issues);
    if (result.row) validRows.push(result.row);
  }

  return { validRows, issues };
}

export function detectDuplicateCodes(validRows: ValidatedEstablishmentRow[]): {
  duplicateCodeGroups: Array<{
    establishmentCode: string;
    rows: Array<{ sourceFile: string; sourceRow: number; name: string }>;
  }>;
  issues: RowIssue[];
} {
  const byCode = new Map<string, ValidatedEstablishmentRow[]>();

  for (const row of validRows) {
    const group = byCode.get(row.establishmentCodeNormalized) ?? [];
    group.push(row);
    byCode.set(row.establishmentCodeNormalized, group);
  }

  const duplicateCodeGroups: Array<{
    establishmentCode: string;
    rows: Array<{ sourceFile: string; sourceRow: number; name: string }>;
  }> = [];
  const issues: RowIssue[] = [];

  for (const [establishmentCode, group] of byCode.entries()) {
    if (group.length <= 1) continue;

    duplicateCodeGroups.push({
      establishmentCode,
      rows: group.map((row) => ({
        sourceFile: row.sourceFile,
        sourceRow: row.sourceRow,
        name: row.name,
      })),
    });

    for (const row of group) {
      issues.push({
        level: 'warning',
        code: 'DUPLICATE_ESTABLISHMENT_CODE',
        message:
          `Code établissement partagé (${establishmentCode}) — ${group.length} lignes. ` +
          'Conservation de chaque ligne avec clé (drena, code, nom).',
        sourceFile: row.sourceFile,
        sourceSheet: row.sourceSheet,
        sourceRow: row.sourceRow,
        establishmentCode,
        name: row.name,
      });
    }
  }

  return { duplicateCodeGroups, issues };
}
