import { and, count, desc, eq, like, type SQL } from "drizzle-orm";

import {
  activities,
  db,
  establishments,
  mediaPublicationFiles,
  mediaPublications,
  mediaPublicationStatusHistory,
  requests,
} from "@workspace/db";

import { badRequest, forbidden, notFound } from "../lib/errors";
import {
  findMediaTransition,
  MAX_FILES_PER_PUBLICATION,
  MAX_PHOTO_BYTES,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_DURATION_SECONDS,
  MEDIA_WORKFLOW_TRANSITIONS,
  PHOTO_MIME_TYPES,
  VIDEO_MIME_TYPES,
  type MediaPublicationStatus,
  type MediaWorkflowAction,
} from "../lib/media-workflow";
import type { AuthenticatedUser } from "./auth";
import { getActivityById } from "./activities";
import { getUserScope, isNationalRole, type UserScope } from "./user-scope";

export type MediaFileSummary = {
  id: string;
  mediaType: "photo" | "video";
  fileName: string;
  mimeType: string;
  sizeBytes: number | null;
  caption: string | null;
  downloadUrl: string;
};

export type MediaPublicationHistoryEntry = {
  id: string;
  previousStatus: MediaPublicationStatus | null;
  newStatus: MediaPublicationStatus;
  reason: string | null;
  createdAt: Date;
};

export type SchoolLevel = "primaire" | "secondaire" | "mixte";

export type MediaPublicationSummary = {
  id: string;
  status: MediaPublicationStatus;
  title: string;
  description: string | null;
  decisionReason: string | null;
  establishmentId: string;
  establishmentName: string;
  activityId: string;
  activityTitle: string;
  activityType: string;
  schoolLevel: SchoolLevel | null;
  requestId: string | null;
  fileCount: number;
  coverMediaType: "photo" | "video" | null;
  coverDownloadUrl: string | null;
  submittedAt: Date | null;
  approvedAt: Date | null;
  publishedAt: Date | null;
  incidentReported: boolean;
  incidentDescription: string | null;
  incidentReportedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MediaPublicationDetail = MediaPublicationSummary & {
  files: MediaFileSummary[];
  history: MediaPublicationHistoryEntry[];
  allowedActions: MediaWorkflowAction[];
};

type CreateMediaFileInput = {
  fileName: string;
  mimeType: string;
  mediaType: "photo" | "video";
  fileContentBase64: string;
  caption?: string;
  durationSeconds?: number;
};

function deriveSchoolLevel(cycle: string | null): SchoolLevel | null {
  if (!cycle) return null;
  const hasPrimary = cycle.includes("1");
  const hasSecondary = cycle.includes("2");
  if (hasPrimary && hasSecondary) return "mixte";
  if (hasSecondary) return "secondaire";
  if (hasPrimary) return "primaire";
  return null;
}

function buildSchoolLevelCondition(level: "primaire" | "secondaire"): SQL {
  return like(establishments.authorizedCycle, level === "primaire" ? "%1%" : "%2%");
}

const INCIDENT_REPORT_ROLES = [
  "school_head_primary",
  "school_head_secondary",
  "education_officer",
] as const;

const INCIDENT_REPORT_STATUSES = new Set<MediaPublicationStatus>([
  "submitted",
  "under_review",
  "approved",
  "published",
]);

function buildMediaFileDownloadUrl(fileId: string): string {
  return `/api/media-publications/files/${fileId}/download`;
}

function publicationScopeCondition(scope: UserScope): SQL | undefined {
  if (scope.establishmentId) return eq(mediaPublications.establishmentId, scope.establishmentId);
  if (scope.drenaId) return eq(establishments.drenaId, scope.drenaId);
  if (scope.regionId) return eq(establishments.regionId, scope.regionId);
  if (isNationalRole(scope.roleCodes)) return undefined;
  return eq(mediaPublications.id, "00000000-0000-0000-0000-000000000000");
}

function getAllowedActions(
  status: MediaPublicationStatus,
  scope: UserScope,
  creatorId?: string | null,
  currentUserId?: string,
): MediaWorkflowAction[] {
  const actions: MediaWorkflowAction[] = [];

  for (const rule of MEDIA_WORKFLOW_TRANSITIONS) {
    if (!rule.from.includes(status)) continue;
    const roleAllowed =
      isNationalRole(scope.roleCodes) ||
      rule.roles.some((role) => scope.roleCodes.includes(role));
    if (!roleAllowed) continue;

    if (rule.action === "cancel" && creatorId && currentUserId && creatorId !== currentUserId) {
      if (!isNationalRole(scope.roleCodes)) continue;
    }

    actions.push(rule.action);
  }

  return actions;
}

async function assertApprovedActivity(user: AuthenticatedUser, activityId: string) {
  const activity = await getActivityById(user, activityId);

  const [approvedRequest] = await db
    .select({ id: requests.id })
    .from(requests)
    .where(and(eq(requests.activityId, activityId), eq(requests.status, "approved")))
    .limit(1);

  if (!approvedRequest) {
    throw badRequest(
      "Aucune demande d'autorisation validée n'existe pour cette activité. Publiez d'abord la sortie.",
    );
  }

  return { activity, requestId: approvedRequest.id };
}

function validateFileInput(file: CreateMediaFileInput, buffer: Buffer) {
  if (file.mediaType === "photo") {
    if (!PHOTO_MIME_TYPES.has(file.mimeType)) {
      throw badRequest(`Type photo non supporté : ${file.mimeType}`);
    }
    if (buffer.length > MAX_PHOTO_BYTES) {
      throw badRequest("Chaque photo ne doit pas dépasser 10 Mo.");
    }
  } else {
    if (!VIDEO_MIME_TYPES.has(file.mimeType)) {
      throw badRequest(`Type vidéo non supporté : ${file.mimeType}`);
    }
    if (file.durationSeconds == null || Number.isNaN(file.durationSeconds)) {
      throw badRequest("La durée de la vidéo est obligatoire.");
    }
    if (file.durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
      throw badRequest("Chaque vidéo ne doit pas dépasser 3 minutes.");
    }
    if (file.durationSeconds <= 0) {
      throw badRequest("Durée vidéo invalide.");
    }
    if (buffer.length > MAX_VIDEO_BYTES) {
      throw badRequest("Chaque vidéo ne doit pas dépasser 50 Mo.");
    }
  }
}

async function loadPublicationFiles(publicationId: string): Promise<MediaFileSummary[]> {
  const rows = await db
    .select()
    .from(mediaPublicationFiles)
    .where(eq(mediaPublicationFiles.publicationId, publicationId))
    .orderBy(mediaPublicationFiles.sortOrder, mediaPublicationFiles.createdAt);

  return rows.map((row) => ({
    id: row.id,
    mediaType: row.mediaType as "photo" | "video",
    fileName: row.fileName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    caption: row.caption,
    downloadUrl: buildMediaFileDownloadUrl(row.id),
  }));
}

async function fetchPublicationRow(publicationId: string, scope: UserScope) {
  const condition = publicationScopeCondition(scope);
  const [row] = await db
    .select({
      publication: mediaPublications,
      establishmentName: establishments.name,
      activityTitle: activities.title,
      activityType: activities.type,
      authorizedCycle: establishments.authorizedCycle,
    })
    .from(mediaPublications)
    .innerJoin(establishments, eq(mediaPublications.establishmentId, establishments.id))
    .innerJoin(activities, eq(mediaPublications.activityId, activities.id))
    .where(
      condition
        ? and(eq(mediaPublications.id, publicationId), condition)
        : eq(mediaPublications.id, publicationId),
    )
    .limit(1);

  return row ?? null;
}

async function mapSummary(row: {
  publication: typeof mediaPublications.$inferSelect;
  establishmentName: string;
  activityTitle: string;
  activityType: string;
  authorizedCycle: string | null;
}): Promise<MediaPublicationSummary> {
  const [fileStats] = await db
    .select({ total: count() })
    .from(mediaPublicationFiles)
    .where(eq(mediaPublicationFiles.publicationId, row.publication.id));

  const [firstFile] = await db
    .select({
      mediaType: mediaPublicationFiles.mediaType,
      id: mediaPublicationFiles.id,
    })
    .from(mediaPublicationFiles)
    .where(eq(mediaPublicationFiles.publicationId, row.publication.id))
    .orderBy(mediaPublicationFiles.sortOrder)
    .limit(1);

  return {
    id: row.publication.id,
    status: row.publication.status as MediaPublicationStatus,
    title: row.publication.title,
    description: row.publication.description,
    decisionReason: row.publication.decisionReason,
    establishmentId: row.publication.establishmentId,
    establishmentName: row.establishmentName,
    activityId: row.publication.activityId,
    activityTitle: row.activityTitle,
    activityType: row.activityType,
    schoolLevel: deriveSchoolLevel(row.authorizedCycle),
    requestId: row.publication.requestId,
    fileCount: Number(fileStats?.total ?? 0),
    coverMediaType: (firstFile?.mediaType as "photo" | "video" | undefined) ?? null,
    coverDownloadUrl: firstFile ? buildMediaFileDownloadUrl(firstFile.id) : null,
    submittedAt: row.publication.submittedAt,
    approvedAt: row.publication.approvedAt,
    publishedAt: row.publication.publishedAt,
    incidentReported: row.publication.incidentReported,
    incidentDescription: row.publication.incidentDescription,
    incidentReportedAt: row.publication.incidentReportedAt,
    createdAt: row.publication.createdAt,
    updatedAt: row.publication.updatedAt,
  };
}

export async function listMediaPublications(
  user: AuthenticatedUser,
  input: { page: number; pageSize: number; status?: MediaPublicationStatus },
) {
  const scope = await getUserScope(user);
  const scopeCondition = publicationScopeCondition(scope);
  const offset = (input.page - 1) * input.pageSize;

  const filters: SQL[] = [];
  if (scopeCondition) filters.push(scopeCondition);
  if (input.status) filters.push(eq(mediaPublications.status, input.status));

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const baseQuery = db
    .select({
      publication: mediaPublications,
      establishmentName: establishments.name,
      activityTitle: activities.title,
      activityType: activities.type,
      authorizedCycle: establishments.authorizedCycle,
    })
    .from(mediaPublications)
    .innerJoin(establishments, eq(mediaPublications.establishmentId, establishments.id))
    .innerJoin(activities, eq(mediaPublications.activityId, activities.id));

  const rows = whereClause
    ? await baseQuery
        .where(whereClause)
        .orderBy(desc(mediaPublications.updatedAt))
        .limit(input.pageSize)
        .offset(offset)
    : await baseQuery.orderBy(desc(mediaPublications.updatedAt)).limit(input.pageSize).offset(offset);

  const countQuery = db
    .select({ total: count() })
    .from(mediaPublications)
    .innerJoin(establishments, eq(mediaPublications.establishmentId, establishments.id));

  const [totalRow] = whereClause ? await countQuery.where(whereClause) : await countQuery;
  const total = Number(totalRow?.total ?? 0);

  const data = await Promise.all(rows.map((row) => mapSummary(row)));

  return {
    data,
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
  };
}

export async function listPublicMediaPublications(input: {
  page: number;
  pageSize: number;
  mediaType?: "photo" | "video";
  activityType?: string;
  schoolLevel?: "primaire" | "secondaire";
  establishmentId?: string;
}) {
  const offset = (input.page - 1) * input.pageSize;
  const conditions: SQL[] = [eq(mediaPublications.status, "published")];

  if (input.establishmentId) {
    conditions.push(eq(mediaPublications.establishmentId, input.establishmentId));
  }

  if (input.activityType) {
    conditions.push(eq(activities.type, input.activityType));
  }
  if (input.schoolLevel) {
    conditions.push(buildSchoolLevelCondition(input.schoolLevel));
  }

  const whereClause = and(...conditions);

  const rows = await db
    .select({
      publication: mediaPublications,
      establishmentName: establishments.name,
      activityTitle: activities.title,
      activityType: activities.type,
      authorizedCycle: establishments.authorizedCycle,
    })
    .from(mediaPublications)
    .innerJoin(establishments, eq(mediaPublications.establishmentId, establishments.id))
    .innerJoin(activities, eq(mediaPublications.activityId, activities.id))
    .where(whereClause)
    .orderBy(desc(mediaPublications.publishedAt))
    .limit(input.pageSize)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(mediaPublications)
    .innerJoin(establishments, eq(mediaPublications.establishmentId, establishments.id))
    .innerJoin(activities, eq(mediaPublications.activityId, activities.id))
    .where(whereClause);

  let data = await Promise.all(rows.map((row) => mapSummary(row)));

  if (input.mediaType) {
    data = data.filter((item) => item.coverMediaType === input.mediaType);
  }

  const total = Number(totalRow?.total ?? 0);

  return {
    data,
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
  };
}

export async function getMediaPublicationById(
  user: AuthenticatedUser,
  publicationId: string,
): Promise<MediaPublicationDetail> {
  const scope = await getUserScope(user);
  const row = await fetchPublicationRow(publicationId, scope);
  if (!row) throw notFound("Publication introuvable.");

  const history = await db
    .select()
    .from(mediaPublicationStatusHistory)
    .where(eq(mediaPublicationStatusHistory.publicationId, publicationId))
    .orderBy(desc(mediaPublicationStatusHistory.createdAt));

  const summary = await mapSummary(row);
  const files = await loadPublicationFiles(publicationId);

  return {
    ...summary,
    fileCount: files.length,
    files,
    history: history.map((entry) => ({
      id: entry.id,
      previousStatus: entry.previousStatus as MediaPublicationStatus | null,
      newStatus: entry.newStatus as MediaPublicationStatus,
      reason: entry.reason,
      createdAt: entry.createdAt,
    })),
    allowedActions: getAllowedActions(
      row.publication.status as MediaPublicationStatus,
      scope,
      row.publication.createdBy,
      user.id,
    ),
  };
}

export async function createMediaPublication(
  user: AuthenticatedUser,
  input: {
    activityId: string;
    title: string;
    description?: string;
    files: CreateMediaFileInput[];
  },
) {
  const scope = await getUserScope(user);
  const initiatorRoles = [
    "school_head_primary",
    "school_head_secondary",
    "education_officer",
  ];
  const canCreate =
    isNationalRole(scope.roleCodes) ||
    initiatorRoles.some((role) => scope.roleCodes.includes(role));

  if (!canCreate) {
    throw forbidden("Seuls les profils établissement peuvent soumettre des médias de sortie.");
  }

  if (!input.files.length) {
    throw badRequest("Ajoutez au moins une photo ou vidéo.");
  }
  if (input.files.length > MAX_FILES_PER_PUBLICATION) {
    throw badRequest(`Maximum ${MAX_FILES_PER_PUBLICATION} fichiers par dossier.`);
  }

  const { activity, requestId } = await assertApprovedActivity(user, input.activityId);

  const [created] = await db
    .insert(mediaPublications)
    .values({
      establishmentId: activity.establishmentId,
      activityId: activity.id,
      requestId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: "draft",
      createdBy: user.id,
    })
    .returning();

  if (!created) throw badRequest("Impossible de créer la publication.");

  for (const [index, file] of input.files.entries()) {
    let buffer: Buffer;
    try {
      buffer = Buffer.from(file.fileContentBase64, "base64");
    } catch {
      throw badRequest("Contenu du fichier invalide.");
    }
    validateFileInput(file, buffer);

    const { saveBinaryFile } = await import("../lib/file-storage");
    const saved = await saveBinaryFile(buffer, file.fileName, {
      maxBytes: file.mediaType === "photo" ? MAX_PHOTO_BYTES : MAX_VIDEO_BYTES,
    });
    await db.insert(mediaPublicationFiles).values({
      publicationId: created.id,
      mediaType: file.mediaType,
      storageKey: saved.storageKey,
      fileName: file.fileName.trim(),
      mimeType: file.mimeType.trim(),
      sizeBytes: saved.sizeBytes,
      caption: file.caption?.trim() || null,
      sortOrder: index,
    });
  }

  await db.insert(mediaPublicationStatusHistory).values({
    publicationId: created.id,
    previousStatus: null,
    newStatus: "draft",
    changedBy: user.id,
    reason: "Création du dossier média",
  });

  return getMediaPublicationById(user, created.id);
}

export async function transitionMediaPublication(
  user: AuthenticatedUser,
  publicationId: string,
  input: { action: MediaWorkflowAction; reason?: string },
) {
  const scope = await getUserScope(user);
  const row = await fetchPublicationRow(publicationId, scope);
  if (!row) throw notFound("Publication introuvable.");

  const currentStatus = row.publication.status as MediaPublicationStatus;
  const rule = findMediaTransition(input.action, currentStatus);
  if (!rule) {
    throw badRequest(
      `Action « ${input.action} » impossible depuis le statut « ${currentStatus} ».`,
    );
  }

  const roleAllowed =
    isNationalRole(scope.roleCodes) ||
    rule.roles.some((role) => scope.roleCodes.includes(role));

  if (!roleAllowed) {
    throw forbidden("Votre profil ne peut pas effectuer cette action.");
  }

  if (input.action === "reject" && !input.reason?.trim()) {
    throw badRequest("Un motif est requis pour rejeter une publication.");
  }

  const now = new Date();
  const updatePayload: Partial<typeof mediaPublications.$inferInsert> = {
    status: rule.to,
    updatedAt: now,
    decisionReason: input.action === "reject" ? input.reason?.trim() ?? null : row.publication.decisionReason,
  };

  if (input.action === "submit") updatePayload.submittedAt = now;
  if (input.action === "approve") updatePayload.approvedAt = now;
  if (input.action === "publish") updatePayload.publishedAt = now;

  const [updated] = await db
    .update(mediaPublications)
    .set(updatePayload)
    .where(eq(mediaPublications.id, publicationId))
    .returning();

  if (!updated) throw badRequest("Transition impossible.");

  await db.insert(mediaPublicationStatusHistory).values({
    publicationId,
    previousStatus: currentStatus,
    newStatus: rule.to,
    changedBy: user.id,
    reason: input.reason?.trim() || null,
  });

  return getMediaPublicationById(user, publicationId);
}

export async function reportMediaPublicationIncident(
  user: AuthenticatedUser,
  publicationId: string,
  description: string,
) {
  const scope = await getUserScope(user);
  const row = await fetchPublicationRow(publicationId, scope);
  if (!row) throw notFound("Publication introuvable.");

  const canReport =
    isNationalRole(scope.roleCodes) ||
    INCIDENT_REPORT_ROLES.some((role) => scope.roleCodes.includes(role));

  if (!canReport) {
    throw forbidden("Seuls les établissements peuvent signaler un incident de sortie.");
  }

  const currentStatus = row.publication.status as MediaPublicationStatus;
  if (!INCIDENT_REPORT_STATUSES.has(currentStatus)) {
    throw badRequest(
      "Un incident ne peut être signalé que pour une sortie soumise, en cours de validation ou publiée.",
    );
  }

  if (row.publication.incidentReported) {
    throw badRequest("Un incident a déjà été signalé pour cette sortie.");
  }

  const trimmed = description.trim();
  if (trimmed.length < 10) {
    throw badRequest("Décrivez l'incident en au moins 10 caractères.");
  }

  const now = new Date();
  const [updated] = await db
    .update(mediaPublications)
    .set({
      incidentReported: true,
      incidentDescription: trimmed,
      incidentReportedAt: now,
      updatedAt: now,
    })
    .where(eq(mediaPublications.id, publicationId))
    .returning();

  if (!updated) throw badRequest("Impossible d'enregistrer l'incident.");

  await db.insert(mediaPublicationStatusHistory).values({
    publicationId,
    previousStatus: currentStatus,
    newStatus: currentStatus,
    changedBy: user.id,
    reason: `Incident signalé : ${trimmed.slice(0, 240)}`,
  });

  return getMediaPublicationById(user, publicationId);
}

export async function getPublicMediaPublicationById(publicationId: string) {
  const [row] = await db
    .select({
      publication: mediaPublications,
      establishmentName: establishments.name,
      activityTitle: activities.title,
      activityType: activities.type,
      authorizedCycle: establishments.authorizedCycle,
    })
    .from(mediaPublications)
    .innerJoin(establishments, eq(mediaPublications.establishmentId, establishments.id))
    .innerJoin(activities, eq(mediaPublications.activityId, activities.id))
    .where(and(eq(mediaPublications.id, publicationId), eq(mediaPublications.status, "published")))
    .limit(1);

  if (!row) throw notFound("Publication introuvable.");

  const summary = await mapSummary(row);
  const files = await loadPublicationFiles(publicationId);

  return {
    ...summary,
    fileCount: files.length,
    files,
    history: [],
    allowedActions: [] as MediaWorkflowAction[],
  };
}

export async function getMediaFileDownloadPayload(
  user: AuthenticatedUser | null,
  fileId: string,
  options?: { publicOnly?: boolean },
) {
  const [row] = await db
    .select({
      file: mediaPublicationFiles,
      publication: mediaPublications,
    })
    .from(mediaPublicationFiles)
    .innerJoin(mediaPublications, eq(mediaPublicationFiles.publicationId, mediaPublications.id))
    .where(eq(mediaPublicationFiles.id, fileId))
    .limit(1);

  if (!row) throw notFound("Fichier introuvable.");

  if (options?.publicOnly) {
    if (row.publication.status !== "published") {
      throw forbidden("Ce média n'est pas publié.");
    }
  } else {
    if (!user) throw forbidden("Authentification requise pour ce fichier.");
    const scope = await getUserScope(user);
    const publicationRow = await fetchPublicationRow(row.publication.id, scope);
    if (!publicationRow) throw forbidden("Accès refusé à ce fichier.");
  }

  const { readBinaryFile } = await import("../lib/file-storage");
  const buffer = await readBinaryFile(row.file.storageKey);

  return {
    buffer,
    fileName: row.file.fileName,
    mimeType: row.file.mimeType,
  };
}
