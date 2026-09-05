/** Politique de rétention PNIGVS — docs/PNIGVS_REGLES_METIER.md §7 */

export const ARCHIVE_RETENTION_YEARS = 3;

export const ARCHIVE_RETENTION_MS = ARCHIVE_RETENTION_YEARS * 365 * 24 * 60 * 60 * 1000;

export function getArchiveCutoffDate(now = new Date()): Date {
  return new Date(now.getTime() - ARCHIVE_RETENTION_MS);
}
