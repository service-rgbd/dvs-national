import { and, count, desc, eq, type SQL } from "drizzle-orm";

import { activities, db, establishments, requests } from "@workspace/db";

import { badRequest, notFound } from "../lib/errors";
import type { AuthenticatedUser } from "./auth";
import {
  assertEstablishmentInScope,
  resolveEstablishmentIdForCreate,
} from "./establishment-access";
import { getUserScope, isNationalRole, type UserScope } from "./user-scope";

export type ActivitySummary = {
  id: string;
  establishmentId: string;
  establishmentName: string;
  type: string;
  title: string;
  description: string | null;
  scheduledAt: Date | null;
  location: string | null;
  createdAt: Date;
};

function activityScopeCondition(scope: UserScope): SQL | undefined {
  if (scope.establishmentId) return eq(establishments.id, scope.establishmentId);
  if (scope.drenaId) return eq(establishments.drenaId, scope.drenaId);
  if (scope.regionId) return eq(establishments.regionId, scope.regionId);
  if (isNationalRole(scope.roleCodes)) return undefined;
  return eq(establishments.id, "00000000-0000-0000-0000-000000000000");
}

function mapActivity(row: {
  activity: typeof activities.$inferSelect;
  establishmentName: string;
}): ActivitySummary {
  return {
    id: row.activity.id,
    establishmentId: row.activity.establishmentId,
    establishmentName: row.establishmentName,
    type: row.activity.type,
    title: row.activity.title,
    description: row.activity.description,
    scheduledAt: row.activity.scheduledAt,
    location: row.activity.location,
    createdAt: row.activity.createdAt,
  };
}

export async function listActivities(
  user: AuthenticatedUser,
  input: { page: number; pageSize: number },
) {
  const scope = await getUserScope(user);
  const condition = activityScopeCondition(scope);
  const offset = (input.page - 1) * input.pageSize;

  const baseQuery = db
    .select({
      activity: activities,
      establishmentName: establishments.name,
    })
    .from(activities)
    .innerJoin(establishments, eq(activities.establishmentId, establishments.id));

  const rows = condition
    ? await baseQuery.where(condition).orderBy(desc(activities.createdAt)).limit(input.pageSize).offset(offset)
    : await baseQuery.orderBy(desc(activities.createdAt)).limit(input.pageSize).offset(offset);

  const countQuery = db
    .select({ total: count() })
    .from(activities)
    .innerJoin(establishments, eq(activities.establishmentId, establishments.id));

  const [totalRow] = condition ? await countQuery.where(condition) : await countQuery;
  const total = Number(totalRow?.total ?? 0);

  return {
    data: rows.map(mapActivity),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
  };
}

export async function getActivityById(user: AuthenticatedUser, activityId: string) {
  const scope = await getUserScope(user);
  const condition = activityScopeCondition(scope);

  const [row] = await db
    .select({
      activity: activities,
      establishmentName: establishments.name,
    })
    .from(activities)
    .innerJoin(establishments, eq(activities.establishmentId, establishments.id))
    .where(
      condition
        ? and(eq(activities.id, activityId), condition)
        : eq(activities.id, activityId),
    )
    .limit(1);

  if (!row) throw notFound("Activité introuvable.");
  return mapActivity(row);
}

export async function createActivity(
  user: AuthenticatedUser,
  input: {
    establishmentId?: string;
    type: string;
    title: string;
    description?: string;
    scheduledAt?: Date;
    location?: string;
  },
) {
  const scope = await getUserScope(user);
  const establishmentId = resolveEstablishmentIdForCreate(scope, input.establishmentId);
  await assertEstablishmentInScope(scope, establishmentId);

  if (!input.title.trim()) {
    throw badRequest("Le titre de l'activité est requis.");
  }

  const [created] = await db
    .insert(activities)
    .values({
      establishmentId,
      type: input.type.trim(),
      title: input.title.trim(),
      description: input.description?.trim() || null,
      scheduledAt: input.scheduledAt ?? null,
      location: input.location?.trim() || null,
      createdBy: user.id,
    })
    .returning();

  if (!created) throw badRequest("Impossible de créer l'activité.");

  return getActivityById(user, created.id);
}

/** Activités avec demande validée — visible sur la vitrine publique. */
export async function listPublicActivities(input: {
  page: number;
  pageSize: number;
  type?: string;
  establishmentId?: string;
}) {
  const offset = (input.page - 1) * input.pageSize;
  const filters: SQL[] = [
    eq(requests.status, "approved"),
    eq(establishments.status, "active"),
  ];

  if (input.type?.trim()) {
    filters.push(eq(activities.type, input.type.trim()));
  }
  if (input.establishmentId?.trim()) {
    filters.push(eq(activities.establishmentId, input.establishmentId.trim()));
  }

  const whereClause = and(...filters);

  const rows = await db
    .select({
      activity: activities,
      establishmentName: establishments.name,
    })
    .from(activities)
    .innerJoin(establishments, eq(activities.establishmentId, establishments.id))
    .innerJoin(requests, eq(requests.activityId, activities.id))
    .where(whereClause)
    .orderBy(desc(activities.scheduledAt), desc(activities.createdAt))
    .limit(input.pageSize)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(activities)
    .innerJoin(establishments, eq(activities.establishmentId, establishments.id))
    .innerJoin(requests, eq(requests.activityId, activities.id))
    .where(whereClause);

  const total = Number(totalRow?.total ?? 0);

  return {
    data: rows.map(mapActivity),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
  };
}
