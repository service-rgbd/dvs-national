import { readFileSync } from 'node:fs';
import path from 'node:path';

import * as XLSX from 'xlsx';

import { COLUMN_MAP, EXCEL_COLUMNS, type ExcelColumn, type ParsedEstablishmentRow } from './types';

function parseDrenaName(sheetName: string): string {
  const match = sheetName.match(/-\s*(DREN\s+.+\d)\s*$/i);
  return match?.[1]?.trim() ?? sheetName.trim();
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizeCode(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return raw.trim();
  return digits.padStart(6, '0').slice(-6);
}

export function readEstablishmentExcel(filePath: string): ParsedEstablishmentRow[] {
  const buffer = readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer', cellText: true, raw: false });
  const rows: ParsedEstablishmentRow[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const matrix = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
      raw: false,
    });

    if (matrix.length === 0) continue;

    const headers = Object.keys(matrix[0] ?? {});
    const missing = EXCEL_COLUMNS.filter((column) => !headers.includes(column));
    if (missing.length > 0) {
      throw new Error(
        `Colonnes manquantes dans ${path.basename(filePath)} / ${sheetName}: ${missing.join(', ')}`,
      );
    }

    const drenaName = parseDrenaName(sheetName);

    matrix.forEach((record, index) => {
      const parsed: Partial<ParsedEstablishmentRow> = {
        sourceFile: path.basename(filePath),
        sourceSheet: sheetName,
        sourceRow: index + 2,
        drenaName,
      };

      for (const column of EXCEL_COLUMNS) {
        const key = COLUMN_MAP[column as ExcelColumn];
        (parsed as Record<string, string>)[key] = cellToString(record[column]);
      }

      parsed.establishmentCode = normalizeCode(parsed.establishmentCode ?? '');

      rows.push(parsed as ParsedEstablishmentRow);
    });
  }

  return rows;
}

export function readEstablishmentExcelFiles(filePaths: string[]): ParsedEstablishmentRow[] {
  return filePaths.flatMap((filePath) => readEstablishmentExcel(filePath));
}

export function drenaNameToCode(drenaName: string): string {
  return drenaName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function drenaNameToRegion(drenaName: string): { code: string; name: string } {
  if (/abidjan/i.test(drenaName)) {
    return { code: 'ABIDJAN', name: "District Autonome d'Abidjan" };
  }
  return { code: 'INCONNUE', name: 'Périmètre à confirmer' };
}
