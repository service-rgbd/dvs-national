import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { db, drena, establishments, localities, regions } from '@workspace/db';
import type * as schema from '@workspace/db/schema';

import { drenaNameToCode, drenaNameToRegion } from './read-excel';
import type { ImportReport, ValidatedEstablishmentRow } from './types';

type DbClient = NodePgDatabase<typeof schema>;

type PersistResult = {
  inserted: number;
  updated: number;
  skipped: number;
};

export async function persistEstablishments(
  validRows: ValidatedEstablishmentRow[],
  dryRun: boolean,
): Promise<PersistResult> {
  if (validRows.length === 0) {
    return { inserted: 0, updated: 0, skipped: 0 };
  }

  const drenaName = validRows[0]!.drenaName;
  const regionMeta = drenaNameToRegion(drenaName);
  const drenaCode = drenaNameToCode(drenaName);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  const runner = async (tx: DbClient) => {
    let region = await tx.query.regions.findFirst({
      where: eq(regions.code, regionMeta.code),
    });

    if (!region) {
      if (dryRun) {
        region = { id: '00000000-0000-0000-0000-000000000001', code: regionMeta.code, name: regionMeta.name, createdAt: new Date(), updatedAt: new Date() };
      } else {
        const [createdRegion] = await tx
          .insert(regions)
          .values({ code: regionMeta.code, name: regionMeta.name })
          .returning();
        region = createdRegion!;
      }
    }

    let drenaRecord = await tx.query.drena.findFirst({
      where: and(eq(drena.regionId, region.id), eq(drena.code, drenaCode)),
    });

    if (!drenaRecord) {
      if (dryRun) {
        drenaRecord = {
          id: '00000000-0000-0000-0000-000000000002',
          regionId: region.id,
          code: drenaCode,
          name: drenaName,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      } else {
        const [createdDrena] = await tx
          .insert(drena)
          .values({
            regionId: region.id,
            code: drenaCode,
            name: drenaName,
          })
          .returning();
        drenaRecord = createdDrena!;
      }
    }

    const localityCache = new Map<string, string>();

    for (const row of validRows) {
      const localityKey = row.localityNameNormalized.toUpperCase();
      let localityId = localityCache.get(localityKey);

      if (!localityId) {
        if (!dryRun) {
          const existingLocality = await tx.query.localities.findFirst({
            where: and(
              eq(localities.drenaId, drenaRecord!.id),
              eq(localities.name, row.localityNameNormalized),
            ),
          });

          if (existingLocality) {
            localityId = existingLocality.id;
          } else {
            const [createdLocality] = await tx
              .insert(localities)
              .values({
                regionId: region!.id,
                drenaId: drenaRecord!.id,
                name: row.localityNameNormalized,
                normalizedName: row.localityNameNormalized.toUpperCase(),
              })
              .returning();
            localityId = createdLocality!.id;
          }
        } else {
          const existingLocality = await tx.query.localities.findFirst({
            where: and(
              eq(localities.drenaId, drenaRecord!.id),
              eq(localities.name, row.localityNameNormalized),
            ),
          });
          localityId = existingLocality?.id ?? `dry-${localityKey}`;
        }

        localityCache.set(localityKey, localityId);
      }

      const existingEstablishment = await tx.query.establishments.findFirst({
        where: and(
          eq(establishments.drenaId, drenaRecord!.id),
          eq(establishments.establishmentCode, row.establishmentCodeNormalized),
          eq(establishments.name, row.name),
        ),
      });

      const payload = {
        regionId: region!.id,
        drenaId: drenaRecord!.id,
        localityId: localityId.startsWith('dry-') ? undefined : localityId,
        establishmentCode: row.establishmentCodeNormalized,
        listNumber: row.listNumberInt,
        name: row.name,
        teachingOrder: row.teachingOrder || null,
        authorizedCycle: row.authorizedCycle || null,
        recognizedCycle: row.recognizedCycle || null,
        email: row.email || null,
        contacts: row.contacts || null,
        sourceFile: row.sourceFile,
        sourceSheet: row.sourceSheet,
        updatedAt: new Date(),
      };

      if (existingEstablishment) {
        if (dryRun) {
          updated += 1;
          continue;
        }

        await tx
          .update(establishments)
          .set({
            regionId: payload.regionId,
            drenaId: payload.drenaId,
            localityId: payload.localityId!,
            establishmentCode: payload.establishmentCode,
            listNumber: payload.listNumber,
            name: payload.name,
            teachingOrder: payload.teachingOrder,
            authorizedCycle: payload.authorizedCycle,
            recognizedCycle: payload.recognizedCycle,
            email: payload.email,
            contacts: payload.contacts,
            sourceFile: payload.sourceFile,
            sourceSheet: payload.sourceSheet,
            updatedAt: payload.updatedAt,
          })
          .where(eq(establishments.id, existingEstablishment.id));
        updated += 1;
      } else {
        if (dryRun) {
          inserted += 1;
          continue;
        }

        if (!payload.localityId) {
          skipped += 1;
          continue;
        }

        await tx.insert(establishments).values({
          regionId: payload.regionId,
          drenaId: payload.drenaId,
          localityId: payload.localityId,
          establishmentCode: payload.establishmentCode,
          listNumber: payload.listNumber,
          name: payload.name,
          teachingOrder: payload.teachingOrder,
          authorizedCycle: payload.authorizedCycle,
          recognizedCycle: payload.recognizedCycle,
          email: payload.email,
          contacts: payload.contacts,
          sourceFile: payload.sourceFile,
          sourceSheet: payload.sourceSheet,
        });
        inserted += 1;
      }
    }
  };

  if (dryRun) {
    await runner(db);
  } else {
    await db.transaction(async (tx) => {
      await runner(tx);
    });
  }

  return { inserted, updated, skipped };
}

export function buildImportReport(params: {
  sourceFiles: string[];
  drenaName: string;
  read: number;
  validRows: ValidatedEstablishmentRow[];
  issues: ImportReport['issues'];
  duplicateCodeGroups: ImportReport['duplicateCodeGroups'];
  persist: PersistResult;
  startedAt: Date;
}): ImportReport {
  const invalid = params.issues.filter((issue) => issue.level === 'error').length;
  const warnings = params.issues.filter((issue) => issue.level === 'warning').length;

  return {
    startedAt: params.startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    sourceFiles: params.sourceFiles,
    drenaName: params.drenaName,
    totals: {
      read: params.read,
      valid: params.validRows.length,
      invalid,
      warnings,
      duplicateCodes: params.duplicateCodeGroups.length,
      inserted: params.persist.inserted,
      updated: params.persist.updated,
      skipped: params.persist.skipped,
    },
    issues: params.issues,
    duplicateCodeGroups: params.duplicateCodeGroups,
  };
}
