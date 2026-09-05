import { and, count, desc, eq, isNull, type SQL } from "drizzle-orm";

import { db, documents } from "@workspace/db";

import { badRequest, forbidden, notFound } from "../lib/errors";
import type { AuthenticatedUser } from "./auth";
import {
  assertEstablishmentInScope,
} from "./establishment-access";
import { getUserScope, isNationalRole, type UserScope } from "./user-scope";

export type DocumentSummary = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number | null;
  isPublic: boolean;
  createdAt: Date;
};

const DOCUMENT_CATEGORIES = new Set(["circulaire", "rapport", "fichier_scolaire", "autre"]);

function documentScopeCondition(scope: UserScope): SQL | undefined {
  if (scope.establishmentId) return eq(documents.establishmentId, scope.establishmentId);
  if (scope.drenaId) return eq(documents.drenaId, scope.drenaId);
  if (isNationalRole(scope.roleCodes)) return undefined;
  return eq(documents.id, "00000000-0000-0000-0000-000000000000");
}

function mapDocument(row: typeof documents.$inferSelect): DocumentSummary {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    fileName: row.fileName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    isPublic: row.isPublic,
    createdAt: row.createdAt,
  };
}

export function buildDocumentDownloadUrl(documentId: string): string {
  return `/api/documents/${documentId}/download`;
}

export async function listPublicDocuments(input: {
  page: number;
  pageSize: number;
  category?: string;
}) {
  const offset = (input.page - 1) * input.pageSize;
  const conditions = [eq(documents.isPublic, true), isNull(documents.archivedAt)];

  if (input.category) {
    conditions.push(eq(documents.category, input.category));
  }

  const whereClause = and(...conditions);

  const rows = await db
    .select()
    .from(documents)
    .where(whereClause)
    .orderBy(desc(documents.createdAt))
    .limit(input.pageSize)
    .offset(offset);

  const [totalRow] = await db.select({ total: count() }).from(documents).where(whereClause);
  const total = Number(totalRow?.total ?? 0);

  return {
    data: rows.map(mapDocument),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
  };
}

export async function listAppDocuments(
  user: AuthenticatedUser,
  input: { page: number; pageSize: number; category?: string },
) {
  const scope = await getUserScope(user);
  const scopeCondition = documentScopeCondition(scope);
  const offset = (input.page - 1) * input.pageSize;

  const conditions: SQL[] = [isNull(documents.archivedAt)];
  if (scopeCondition) conditions.push(scopeCondition);
  if (input.category) conditions.push(eq(documents.category, input.category));

  const whereClause = and(...conditions);

  const rows = await db
    .select()
    .from(documents)
    .where(whereClause)
    .orderBy(desc(documents.createdAt))
    .limit(input.pageSize)
    .offset(offset);

  const [totalRow] = await db.select({ total: count() }).from(documents).where(whereClause);
  const total = Number(totalRow?.total ?? 0);

  return {
    data: rows.map(mapDocument),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
  };
}

export async function createDocument(
  user: AuthenticatedUser,
  input: {
    title: string;
    description?: string;
    category: string;
    isPublic?: boolean;
    fileName: string;
    mimeType: string;
    fileContentBase64: string;
  },
) {
  const scope = await getUserScope(user);

  if (!DOCUMENT_CATEGORIES.has(input.category)) {
    throw badRequest("Catégorie de document invalide.");
  }

  if (input.isPublic && !isNationalRole(scope.roleCodes)) {
    throw forbidden("Seuls les profils DVS peuvent publier un document public.");
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(input.fileContentBase64, "base64");
  } catch {
    throw badRequest("Contenu du fichier invalide.");
  }

  let saved: { storageKey: string; sizeBytes: number };
  try {
    const { saveBinaryFile } = await import("../lib/file-storage");
    saved = await saveBinaryFile(buffer, input.fileName);
  } catch (error) {
    throw badRequest(error instanceof Error ? error.message : "Impossible d'enregistrer le fichier.");
  }

  let establishmentId: string | null = null;
  if (scope.establishmentId) {
    establishmentId = scope.establishmentId;
    await assertEstablishmentInScope(scope, establishmentId);
  }

  const [created] = await db
    .insert(documents)
    .values({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      category: input.category,
      storageKey: saved.storageKey,
      fileName: input.fileName.trim(),
      mimeType: input.mimeType.trim(),
      sizeBytes: saved.sizeBytes,
      isPublic: Boolean(input.isPublic),
      uploadedBy: user.id,
      establishmentId: establishmentId ?? null,
      drenaId: scope.drenaId ?? null,
    })
    .returning();

  if (!created) throw badRequest("Impossible d'enregistrer le document.");

  return mapDocument(created);
}

export async function getDocumentById(documentId: string) {
  const [row] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), isNull(documents.archivedAt)))
    .limit(1);

  if (!row) throw notFound("Document introuvable.");
  return row;
}

export async function assertDocumentAccess(
  user: AuthenticatedUser | null,
  document: typeof documents.$inferSelect,
) {
  if (document.isPublic) return;

  if (!user) throw forbidden("Authentification requise pour ce document.");

  const scope = await getUserScope(user);

  if (isNationalRole(scope.roleCodes)) return;

  if (scope.establishmentId && document.establishmentId === scope.establishmentId) return;
  if (scope.drenaId && document.drenaId === scope.drenaId) return;

  throw forbidden("Accès refusé à ce document.");
}

export function serializeDocumentSummary(document: DocumentSummary) {
  return {
    ...document,
    downloadUrl: buildDocumentDownloadUrl(document.id),
    createdAt: document.createdAt.toISOString(),
  };
}

export async function getDocumentDownloadPayload(
  user: AuthenticatedUser | null,
  documentId: string,
) {
  const document = await getDocumentById(documentId);
  await assertDocumentAccess(user, document);
  const { readBinaryFile } = await import("../lib/file-storage");
  const buffer = await readBinaryFile(document.storageKey);

  return {
    buffer,
    fileName: document.fileName,
    mimeType: document.mimeType,
  };
}
