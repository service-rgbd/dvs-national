import { and, count, desc, eq, inArray, type SQL } from "drizzle-orm";

import {
  activities,
  db,
  establishments,
  requestStatusHistory,
  requests,
  withDbRetry,
} from "@workspace/db";

import { badRequest, forbidden, notFound } from "../lib/errors";
import {
  findTransition,
  WORKFLOW_TRANSITIONS,
  type RequestStatus,
  type WorkflowAction,
} from "../lib/workflow";
import {
  isChecklistComplete,
  isDvsValidationComplete,
  mergeChecklist,
  RETURN_FOR_CORRECTION_GUIDANCE,
} from "../config/voyage-decouverte";
import type { AuthenticatedUser } from "./auth";
import {
  assertEstablishmentInScope,
} from "./establishment-access";
import { getActivityById } from "./activities";
import { notifyRequestTransition } from "./notifications";
import { getUserScope, isNationalRole, type UserScope } from "./user-scope";

export type RequestHistoryEntry = {
  id: string;
  previousStatus: RequestStatus | null;
  newStatus: RequestStatus;
  reason: string | null;
  createdAt: Date;
};

export type RequestSummary = {
  id: string;
  status: RequestStatus;
  description: string | null;
  decisionReason: string | null;
  establishmentId: string;
  establishmentName: string;
  activityId: string | null;
  activityTitle: string | null;
  checklist: Record<string, boolean>;
  dvsValidation: Record<string, boolean>;
  submittedAt: Date | null;
  decidedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type RequestDetail = RequestSummary & {
  history: RequestHistoryEntry[];
  allowedActions: WorkflowAction[];
};

function requestScopeCondition(scope: UserScope): SQL | undefined {
  if (scope.establishmentId) return eq(establishments.id, scope.establishmentId);
  if (scope.drenaId) return eq(establishments.drenaId, scope.drenaId);
  if (scope.regionId) return eq(establishments.regionId, scope.regionId);
  if (isNationalRole(scope.roleCodes)) return undefined;
  return eq(establishments.id, "00000000-0000-0000-0000-000000000000");
}

function getAllowedActions(
  status: RequestStatus,
  scope: UserScope,
  creatorId?: string | null,
  currentUserId?: string,
): WorkflowAction[] {
  const actions: WorkflowAction[] = [];

  for (const rule of WORKFLOW_TRANSITIONS) {
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

async function fetchRequestRow(requestId: string, scope: UserScope) {
  const condition = requestScopeCondition(scope);
  const [row] = await db
    .select({
      request: requests,
      establishmentName: establishments.name,
      activityTitle: activities.title,
    })
    .from(requests)
    .innerJoin(establishments, eq(requests.establishmentId, establishments.id))
    .leftJoin(activities, eq(requests.activityId, activities.id))
    .where(condition ? and(eq(requests.id, requestId), condition) : eq(requests.id, requestId))
    .limit(1);

  return row ?? null;
}

function asBooleanRecord(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== "object") return {};
  const result: Record<string, boolean> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    result[key] = entry === true;
  }
  return result;
}

function mapRequest(row: {
  request: typeof requests.$inferSelect;
  establishmentName: string;
  activityTitle: string | null;
}): RequestSummary {
  return {
    id: row.request.id,
    status: row.request.status as RequestStatus,
    description: row.request.description,
    decisionReason: row.request.decisionReason,
    establishmentId: row.request.establishmentId,
    establishmentName: row.establishmentName,
    activityId: row.request.activityId,
    activityTitle: row.activityTitle,
    checklist: asBooleanRecord(row.request.checklist),
    dvsValidation: asBooleanRecord(row.request.dvsValidation),
    submittedAt: row.request.submittedAt,
    decidedAt: row.request.decidedAt,
    createdAt: row.request.createdAt,
    updatedAt: row.request.updatedAt,
  };
}

export async function listRequests(
  user: AuthenticatedUser,
  input: { page: number; pageSize: number; status?: RequestStatus },
) {
  const scope = await getUserScope(user);
  const scopeCondition = requestScopeCondition(scope);
  const offset = (input.page - 1) * input.pageSize;

  const filters: SQL[] = [];
  if (scopeCondition) filters.push(scopeCondition);
  if (input.status) filters.push(eq(requests.status, input.status));

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const baseQuery = db
    .select({
      request: requests,
      establishmentName: establishments.name,
      activityTitle: activities.title,
    })
    .from(requests)
    .innerJoin(establishments, eq(requests.establishmentId, establishments.id))
    .leftJoin(activities, eq(requests.activityId, activities.id));

  const rows = whereClause
    ? await baseQuery
        .where(whereClause)
        .orderBy(desc(requests.updatedAt))
        .limit(input.pageSize)
        .offset(offset)
    : await baseQuery.orderBy(desc(requests.updatedAt)).limit(input.pageSize).offset(offset);

  const countQuery = db
    .select({ total: count() })
    .from(requests)
    .innerJoin(establishments, eq(requests.establishmentId, establishments.id));

  const [totalRow] = whereClause ? await countQuery.where(whereClause) : await countQuery;
  const total = Number(totalRow?.total ?? 0);

  return {
    data: rows.map(mapRequest),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
  };
}

export async function getRequestById(
  user: AuthenticatedUser,
  requestId: string,
): Promise<RequestDetail> {
  const scope = await getUserScope(user);
  const row = await fetchRequestRow(requestId, scope);
  if (!row) throw notFound("Demande introuvable.");

  const history = await db
    .select()
    .from(requestStatusHistory)
    .where(eq(requestStatusHistory.requestId, requestId))
    .orderBy(desc(requestStatusHistory.createdAt));

  return {
    ...mapRequest(row),
    history: history.map((entry) => ({
      id: entry.id,
      previousStatus: entry.previousStatus as RequestStatus | null,
      newStatus: entry.newStatus as RequestStatus,
      reason: entry.reason,
      createdAt: entry.createdAt,
    })),
    allowedActions: getAllowedActions(
      row.request.status as RequestStatus,
      scope,
      row.request.createdBy,
      user.id,
    ),
  };
}

export async function createRequest(
  user: AuthenticatedUser,
  input: { activityId: string; description?: string },
) {
  const activity = await getActivityById(user, input.activityId);

  const [existing] = await db
    .select({ id: requests.id, status: requests.status })
    .from(requests)
    .where(
      and(
        eq(requests.activityId, input.activityId),
        inArray(requests.status, [
          "draft",
          "submitted",
          "under_review",
          "forwarded",
          "returned_for_correction",
        ]),
      ),
    )
    .limit(1);

  if (existing) {
    throw badRequest("Une demande active existe déjà pour cette activité.");
  }

  const [rejected] = await db
    .select({ id: requests.id })
    .from(requests)
    .where(and(eq(requests.activityId, input.activityId), eq(requests.status, "rejected")))
    .limit(1);

  if (rejected) {
    throw badRequest(
      "Cette activité a été rejetée définitivement pour l'année en cours. Reprenez contact avec le service Voyage Découverte pour la prochaine rentrée.",
    );
  }

  const [created] = await db
    .insert(requests)
    .values({
      establishmentId: activity.establishmentId,
      activityId: activity.id,
      description: input.description?.trim() || null,
      status: "draft",
      createdBy: user.id,
    })
    .returning();

  if (!created) throw badRequest("Impossible de créer la demande.");

  await db.insert(requestStatusHistory).values({
    requestId: created.id,
    previousStatus: null,
    newStatus: "draft",
    changedBy: user.id,
    reason: "Création du dossier",
  });

  return getRequestById(user, created.id);
}

export async function transitionRequest(
  user: AuthenticatedUser,
  requestId: string,
  input: {
    action: WorkflowAction;
    reason?: string;
    checklist?: Record<string, boolean>;
    dvsValidation?: Record<string, boolean>;
  },
) {
  const scope = await withDbRetry(() => getUserScope(user));
  const row = await withDbRetry(() => fetchRequestRow(requestId, scope));
  if (!row) throw notFound("Demande introuvable.");

  const currentStatus = row.request.status as RequestStatus;
  const rule = findTransition(input.action, currentStatus);
  if (!rule) {
    throw badRequest(`Action « ${input.action} » impossible depuis le statut « ${currentStatus} ».`);
  }

  const roleAllowed =
    isNationalRole(scope.roleCodes) ||
    rule.roles.some((role) => scope.roleCodes.includes(role));

  if (!roleAllowed) {
    throw forbidden("Votre profil ne peut pas effectuer cette action.");
  }

  if (
    (input.action === "reject" ||
      input.action === "return_for_correction" ||
      input.action === "revoke") &&
    !input.reason?.trim()
  ) {
    throw badRequest("Un motif est requis pour cette action.");
  }

  const currentChecklist = asBooleanRecord(row.request.checklist);
  const currentDvsValidation = asBooleanRecord(row.request.dvsValidation);
  const nextChecklist = mergeChecklist(currentChecklist, input.checklist);
  const nextDvsValidation = mergeChecklist(currentDvsValidation, input.dvsValidation);

  if (input.action === "submit" || input.action === "resubmit") {
    if (!isChecklistComplete(nextChecklist)) {
      throw badRequest(
        "La checklist Voyage Découverte doit être complète avant soumission (entretien DVS + formulaire).",
      );
    }
  }

  if (input.action === "approve") {
    if (!isDvsValidationComplete(nextDvsValidation)) {
      throw badRequest(
        "Les contrôles DVS (prospection, TDR, certificat) doivent être validés avant d'accorder l'autorisation.",
      );
    }
  }

  const now = new Date();
  const updatePayload: Partial<typeof requests.$inferInsert> = {
    status: rule.to,
    updatedAt: now,
    checklist: nextChecklist,
    dvsValidation: nextDvsValidation,
    decisionReason:
      input.action === "reject" ||
      input.action === "return_for_correction" ||
      input.action === "revoke"
        ? input.reason?.trim() ?? null
        : row.request.decisionReason,
  };

  if (input.action === "submit" || input.action === "resubmit") updatePayload.submittedAt = now;
  if (
    input.action === "approve" ||
    input.action === "reject" ||
    input.action === "return_for_correction"
  ) {
    updatePayload.decidedAt = input.action === "approve" || input.action === "reject" ? now : row.request.decidedAt;
  }
  if (input.action === "revoke") updatePayload.decidedAt = now;

  const [updated] = await withDbRetry(() =>
    db
      .update(requests)
      .set(updatePayload)
      .where(eq(requests.id, requestId))
      .returning(),
  );

  if (!updated) throw badRequest("Transition impossible.");

  await withDbRetry(() =>
    db.insert(requestStatusHistory).values({
      requestId,
      previousStatus: currentStatus,
      newStatus: rule.to,
      changedBy: user.id,
      reason:
        input.action === "return_for_correction"
          ? `${input.reason?.trim() ?? ""}\n\n${RETURN_FOR_CORRECTION_GUIDANCE}`.trim()
          : input.reason?.trim() || null,
    }),
  );

  void notifyRequestTransition({
    action: input.action,
    requestId,
    newStatus: rule.to,
    establishmentId: row.request.establishmentId,
    creatorId: row.request.createdBy,
    reason: input.reason,
  }).catch(() => {
    /* Ne pas bloquer la transition si la notification échoue */
  });

  const history = await withDbRetry(() =>
    db
      .select()
      .from(requestStatusHistory)
      .where(eq(requestStatusHistory.requestId, requestId))
      .orderBy(desc(requestStatusHistory.createdAt)),
  );

  return {
    ...mapRequest({
      request: updated,
      establishmentName: row.establishmentName,
      activityTitle: row.activityTitle,
    }),
    history: history.map((entry) => ({
      id: entry.id,
      previousStatus: entry.previousStatus as RequestStatus | null,
      newStatus: entry.newStatus as RequestStatus,
      reason: entry.reason,
      createdAt: entry.createdAt,
    })),
    allowedActions: getAllowedActions(
      rule.to,
      scope,
      row.request.createdBy,
      user.id,
    ),
  };
}
