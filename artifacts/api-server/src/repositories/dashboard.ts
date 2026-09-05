import { and, count, eq, inArray } from "drizzle-orm";

import {
  activities,
  db,
  establishments,
  requests,
} from "@workspace/db";

import type { AuthenticatedUser } from "./auth";
import { getUserScope, type UserScope } from "./user-scope";

export type DashboardKpis = {
  establishments: number;
  activities: number;
  requestsPending: number;
  requestsUnderReview: number;
};

export type AppDashboard = {
  profile: UserScope;
  kpis: DashboardKpis;
};

function establishmentScopeCondition(scope: UserScope) {
  if (scope.establishmentId) return eq(establishments.id, scope.establishmentId);
  if (scope.drenaId) return eq(establishments.drenaId, scope.drenaId);
  if (scope.regionId) return eq(establishments.regionId, scope.regionId);
  return undefined;
}

async function countEstablishments(scope: UserScope): Promise<number> {
  const condition = establishmentScopeCondition(scope);
  const query = db.select({ total: count() }).from(establishments);
  const [row] = condition ? await query.where(condition) : await query;
  return Number(row?.total ?? 0);
}

async function countActivities(scope: UserScope): Promise<number> {
  const establishmentCondition = establishmentScopeCondition(scope);
  if (!establishmentCondition) {
    const [row] = await db.select({ total: count() }).from(activities);
    return Number(row?.total ?? 0);
  }

  const [row] = await db
    .select({ total: count() })
    .from(activities)
    .innerJoin(establishments, eq(activities.establishmentId, establishments.id))
    .where(establishmentCondition);

  return Number(row?.total ?? 0);
}

async function countRequests(scope: UserScope, statuses: string[]): Promise<number> {
  const establishmentCondition = establishmentScopeCondition(scope);
  const statusCondition = inArray(
    requests.status,
    statuses as ("draft" | "submitted" | "under_review" | "forwarded")[],
  );

  if (!establishmentCondition) {
    const [row] = await db.select({ total: count() }).from(requests).where(statusCondition);
    return Number(row?.total ?? 0);
  }

  const [row] = await db
    .select({ total: count() })
    .from(requests)
    .innerJoin(establishments, eq(requests.establishmentId, establishments.id))
    .where(and(establishmentCondition, statusCondition));

  return Number(row?.total ?? 0);
}

export async function getAppDashboard(user: AuthenticatedUser): Promise<AppDashboard> {
  const profile = await getUserScope(user);

  const [establishmentsTotal, activitiesTotal, requestsPending, requestsUnderReview] =
    await Promise.all([
      countEstablishments(profile),
      countActivities(profile),
      countRequests(profile, ["submitted", "draft"]),
      countRequests(profile, ["under_review", "forwarded"]),
    ]);

  return {
    profile,
    kpis: {
      establishments: establishmentsTotal,
      activities: activitiesTotal,
      requestsPending,
      requestsUnderReview,
    },
  };
}
