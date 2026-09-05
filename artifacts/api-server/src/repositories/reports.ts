import { and, count, desc, eq, type SQL } from "drizzle-orm";

import { db, documents, reports } from "@workspace/db";

import { badRequest, forbidden } from "../lib/errors";
import { saveBinaryFile } from "../lib/file-storage";
import type { AuthenticatedUser } from "./auth";
import { getStatisticsSnapshot } from "./statistics";
import { getUserScope, isNationalRole, type UserScope } from "./user-scope";

export type ReportSummary = {
  id: string;
  type: string;
  periodStart: Date | null;
  periodEnd: Date | null;
  documentId: string | null;
  documentTitle: string | null;
  createdAt: Date;
};

const REPORT_TYPES = new Set(["monthly", "annual", "regional"]);

const REPORT_TYPE_LABELS: Record<string, string> = {
  monthly: "Rapport mensuel",
  annual: "Rapport annuel",
  regional: "Rapport régional",
};

function reportScopeCondition(scope: UserScope): SQL | undefined {
  if (scope.establishmentId) return eq(reports.establishmentId, scope.establishmentId);
  if (scope.drenaId) return eq(reports.drenaId, scope.drenaId);
  if (scope.regionId) return eq(reports.regionId, scope.regionId);
  if (isNationalRole(scope.roleCodes)) return undefined;
  return eq(reports.id, "00000000-0000-0000-0000-000000000000");
}

function mapReport(row: {
  report: typeof reports.$inferSelect;
  documentTitle: string | null;
}): ReportSummary {
  return {
    id: row.report.id,
    type: row.report.type,
    periodStart: row.report.periodStart,
    periodEnd: row.report.periodEnd,
    documentId: row.report.documentId,
    documentTitle: row.documentTitle,
    createdAt: row.report.createdAt,
  };
}

function resolveReportPeriod(type: string): { periodStart: Date; periodEnd: Date } {
  const now = new Date();

  if (type === "monthly") {
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { periodStart, periodEnd };
  }

  if (type === "annual") {
    const periodStart = new Date(now.getFullYear(), 0, 1);
    const periodEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { periodStart, periodEnd };
  }

  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { periodStart, periodEnd };
}

export async function listReports(user: AuthenticatedUser, input: { page: number; pageSize: number }) {
  const scope = await getUserScope(user);
  const condition = reportScopeCondition(scope);
  const offset = (input.page - 1) * input.pageSize;

  const baseQuery = db
    .select({
      report: reports,
      documentTitle: documents.title,
    })
    .from(reports)
    .leftJoin(documents, eq(reports.documentId, documents.id));

  const rows = condition
    ? await baseQuery
        .where(condition)
        .orderBy(desc(reports.createdAt))
        .limit(input.pageSize)
        .offset(offset)
    : await baseQuery.orderBy(desc(reports.createdAt)).limit(input.pageSize).offset(offset);

  const countQuery = db.select({ total: count() }).from(reports);
  const [totalRow] = condition ? await countQuery.where(condition) : await countQuery;
  const total = Number(totalRow?.total ?? 0);

  return {
    data: rows.map(mapReport),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
  };
}

export async function generateReport(user: AuthenticatedUser, type: string): Promise<ReportSummary> {
  const scope = await getUserScope(user);

  if (!isNationalRole(scope.roleCodes)) {
    throw forbidden("Seuls les profils DVS peuvent générer un rapport.");
  }

  if (!REPORT_TYPES.has(type)) {
    throw badRequest("Type de rapport invalide.");
  }

  const snapshot = await getStatisticsSnapshot(user);
  const { periodStart, periodEnd } = resolveReportPeriod(type);
  const label = REPORT_TYPE_LABELS[type] ?? type;
  const fileName = `rapport-${type}-${periodStart.toISOString().slice(0, 10)}.json`;
  const jsonContent = JSON.stringify(snapshot, null, 2);
  const saved = await saveBinaryFile(Buffer.from(jsonContent, "utf8"), fileName);

  const documentTitle = `${label} — ${scope.scopeLabel} (${periodStart.toLocaleDateString("fr-FR")})`;

  const [document] = await db
    .insert(documents)
    .values({
      title: documentTitle,
      description: `Rapport généré automatiquement (${label}).`,
      category: "rapport",
      storageKey: saved.storageKey,
      fileName,
      mimeType: "application/json",
      sizeBytes: saved.sizeBytes,
      isPublic: false,
      uploadedBy: user.id,
      drenaId: scope.drenaId ?? null,
      establishmentId: scope.establishmentId ?? null,
    })
    .returning();

  if (!document) throw badRequest("Impossible de créer le document du rapport.");

  const [created] = await db
    .insert(reports)
    .values({
      type,
      periodStart,
      periodEnd,
      regionId: scope.regionId ?? null,
      drenaId: scope.drenaId ?? null,
      establishmentId: scope.establishmentId ?? null,
      documentId: document.id,
      generatedBy: user.id,
    })
    .returning();

  if (!created) throw badRequest("Impossible de créer le rapport.");

  return mapReport({ report: created, documentTitle: document.title });
}