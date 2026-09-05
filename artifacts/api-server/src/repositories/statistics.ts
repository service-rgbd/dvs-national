import { and, count, eq } from "drizzle-orm";

import { activities, db, establishments, requests } from "@workspace/db";

import type { AuthenticatedUser } from "./auth";
import { getAppDashboard, type DashboardKpis } from "./dashboard";
import { getUserScope, isNationalRole, type UserScope } from "./user-scope";

export type BreakdownItem = {
  key: string;
  label: string;
  count: number;
};

export type AppStatistics = {
  kpis: DashboardKpis;
  requestsByStatus: BreakdownItem[];
  activitiesByType: BreakdownItem[];
};

export type PublicStatistics = {
  establishments: number;
  establishmentsActive: number;
  updatedAt: Date;
};

const REQUEST_STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  submitted: "Soumise",
  under_review: "En analyse",
  forwarded: "Transmise DVS",
  approved: "Validée",
  rejected: "Refusée",
  cancelled: "Annulée",
  archived: "Archivée",
  returned_for_correction: "Renvoyée pour correction",
};

function establishmentScopeCondition(scope: UserScope) {
  if (scope.establishmentId) return eq(establishments.id, scope.establishmentId);
  if (scope.drenaId) return eq(establishments.drenaId, scope.drenaId);
  if (scope.regionId) return eq(establishments.regionId, scope.regionId);
  return undefined;
}

function activityScopeCondition(scope: UserScope) {
  if (scope.establishmentId) return eq(establishments.id, scope.establishmentId);
  if (scope.drenaId) return eq(establishments.drenaId, scope.drenaId);
  if (scope.regionId) return eq(establishments.regionId, scope.regionId);
  if (isNationalRole(scope.roleCodes)) return undefined;
  return eq(establishments.id, "00000000-0000-0000-0000-000000000000");
}

async function countRequestsByStatus(scope: UserScope): Promise<BreakdownItem[]> {
  const establishmentCondition = establishmentScopeCondition(scope);

  const baseQuery = db
    .select({
      status: requests.status,
      total: count(),
    })
    .from(requests)
    .innerJoin(establishments, eq(requests.establishmentId, establishments.id))
    .groupBy(requests.status);

  const rows = establishmentCondition
    ? await baseQuery.where(establishmentCondition)
    : await baseQuery;

  return rows.map((row) => ({
    key: row.status,
    label: REQUEST_STATUS_LABELS[row.status] ?? row.status,
    count: Number(row.total),
  }));
}

async function countActivitiesByType(scope: UserScope): Promise<BreakdownItem[]> {
  const condition = activityScopeCondition(scope);

  const baseQuery = db
    .select({
      type: activities.type,
      total: count(),
    })
    .from(activities)
    .innerJoin(establishments, eq(activities.establishmentId, establishments.id))
    .groupBy(activities.type);

  const rows = condition ? await baseQuery.where(condition) : await baseQuery;

  return rows.map((row) => ({
    key: row.type,
    label: row.type,
    count: Number(row.total),
  }));
}

export async function getAppStatistics(user: AuthenticatedUser): Promise<AppStatistics> {
  const dashboard = await getAppDashboard(user);
  const scope = await getUserScope(user);

  const [requestsByStatus, activitiesByType] = await Promise.all([
    countRequestsByStatus(scope),
    countActivitiesByType(scope),
  ]);

  return {
    kpis: dashboard.kpis,
    requestsByStatus,
    activitiesByType,
  };
}

export async function getPublicStatistics(): Promise<PublicStatistics> {
  const [totalRow] = await db.select({ total: count() }).from(establishments);
  const [activeRow] = await db
    .select({ total: count() })
    .from(establishments)
    .where(eq(establishments.status, "active"));

  return {
    establishments: Number(totalRow?.total ?? 0),
    establishmentsActive: Number(activeRow?.total ?? 0),
    updatedAt: new Date(),
  };
}

export async function getStatisticsSnapshot(user: AuthenticatedUser) {
  const stats = await getAppStatistics(user);
  const profile = await getUserScope(user);

  return {
    generatedAt: new Date().toISOString(),
    scope: profile.scopeLabel,
    primaryRole: profile.primaryRoleLabel,
    kpis: stats.kpis,
    requestsByStatus: stats.requestsByStatus,
    activitiesByType: stats.activitiesByType,
  };
}
