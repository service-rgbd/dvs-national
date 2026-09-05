#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { detectDuplicateCodes, validateRows } from './validate';
import { buildImportReport, persistEstablishments } from './persist';
import { readEstablishmentExcelFiles } from './read-excel';
import type { ImportReport } from './types';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function loadEnv() {
  const envPath = path.join(repoRoot, '.env');
  try {
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // DATABASE_URL must be provided by the environment.
  }
}

loadEnv();

function parseArgs(argv: string[]) {
  const dryRun = argv.includes('--dry-run');
  const reportDir =
    argv.find((arg) => arg.startsWith('--report-dir='))?.split('=')[1] ??
    'artifacts/import-reports';
  const files = argv.filter((arg) => !arg.startsWith('--'));

  return { dryRun, reportDir, files };
}

function printSummary(report: ImportReport) {
  console.log('\n=== Rapport import PNIGVS ===');
  console.log(`DRENA        : ${report.drenaName}`);
  console.log(`Fichiers     : ${report.sourceFiles.length}`);
  console.log(`Lues         : ${report.totals.read}`);
  console.log(`Valides      : ${report.totals.valid}`);
  console.log(`Erreurs      : ${report.totals.invalid}`);
  console.log(`Avertissements: ${report.totals.warnings}`);
  console.log(`Codes dupliqués: ${report.totals.duplicateCodes}`);
  console.log(`Insérées     : ${report.totals.inserted}`);
  console.log(`Mises à jour : ${report.totals.updated}`);
  console.log(`Ignorées     : ${report.totals.skipped}`);

  if (report.duplicateCodeGroups.length > 0) {
    console.log('\nDoublons de code (conservés):');
    for (const group of report.duplicateCodeGroups) {
      console.log(`  ${group.establishmentCode}:`);
      for (const row of group.rows) {
        console.log(`    - ${row.name} (${row.sourceFile}:${row.sourceRow})`);
      }
    }
  }

  const errors = report.issues.filter((issue) => issue.level === 'error');
  if (errors.length > 0) {
    console.log('\nErreurs bloquantes:');
    for (const issue of errors.slice(0, 20)) {
      console.log(
        `  [${issue.code}] ${issue.sourceFile}:${issue.sourceRow} — ${issue.message}`,
      );
    }
    if (errors.length > 20) {
      console.log(`  … ${errors.length - 20} erreur(s) supplémentaire(s)`);
    }
  }
}

async function main() {
  const startedAt = new Date();
  const { dryRun, reportDir, files } = parseArgs(process.argv.slice(2));

  if (files.length === 0) {
    console.error(
      'Usage: pnpm --filter @workspace/scripts run import:establishments -- [--dry-run] [--report-dir=path] file1.xlsx [file2.xlsx …]',
    );
    process.exit(1);
  }

  const absoluteFiles = files.map((file) => path.resolve(file));
  const parsedRows = readEstablishmentExcelFiles(absoluteFiles);
  const { validRows, issues: validationIssues } = validateRows(parsedRows);
  const { duplicateCodeGroups, issues: duplicateIssues } = detectDuplicateCodes(validRows);
  const allIssues = [...validationIssues, ...duplicateIssues];

  const hasBlockingErrors = allIssues.some((issue) => issue.level === 'error');
  if (hasBlockingErrors) {
    const report = buildImportReport({
      sourceFiles: absoluteFiles.map((file) => path.basename(file)),
      drenaName: parsedRows[0]?.drenaName ?? 'INCONNUE',
      read: parsedRows.length,
      validRows: [],
      issues: allIssues,
      duplicateCodeGroups,
      persist: { inserted: 0, updated: 0, skipped: parsedRows.length },
      startedAt,
    });

    mkdirSync(reportDir, { recursive: true });
    const reportPath = path.join(
      reportDir,
      `import-${startedAt.toISOString().replace(/[:.]/g, '-')}.json`,
    );
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    printSummary(report);
    console.log(`\nRapport JSON : ${reportPath}`);
    console.error('\nImport interrompu — corriger les erreurs bloquantes.');
    process.exit(1);
  }

  const persist = await persistEstablishments(validRows, dryRun);

  const report = buildImportReport({
    sourceFiles: absoluteFiles.map((file) => path.basename(file)),
    drenaName: validRows[0]?.drenaName ?? parsedRows[0]?.drenaName ?? 'INCONNUE',
    read: parsedRows.length,
    validRows,
    issues: allIssues,
    duplicateCodeGroups,
    persist,
    startedAt,
  });

  mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(
    reportDir,
    `import-${startedAt.toISOString().replace(/[:.]/g, '-')}.json`,
  );
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  printSummary(report);
  console.log(`\nRapport JSON : ${reportPath}`);
  if (dryRun) {
    console.log('\nMode --dry-run : aucune écriture PostgreSQL effectuée.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error('Import échoué:', error);
    process.exit(1);
  });
