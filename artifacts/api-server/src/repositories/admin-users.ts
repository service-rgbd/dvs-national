import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";

import { db, establishments, roles, sessions, userRoles, users } from "@workspace/db";

import { badRequest, notFound } from "../lib/errors";
import type { AuthenticatedUser } from "./auth";
import { findUserByEmail, hashPassword } from "./auth";

const SCHOOL_HEAD_ROLES = new Set(["school_head_primary", "school_head_secondary"]);

export type AdminUserSummary = {
  id: string;
  email: string;
  fullName: string;
  status: string;
  roleCode: string;
  roleLabel: string;
  establishmentId: string | null;
  establishmentName: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
};

async function mapAdminUserRow(row: {
  user: typeof users.$inferSelect;
  roleCode: string;
  roleLabel: string;
  establishmentId: string | null;
  establishmentName: string | null;
}): Promise<AdminUserSummary> {
  return {
    id: row.user.id,
    email: row.user.email,
    fullName: row.user.fullName,
    status: row.user.status,
    roleCode: row.roleCode,
    roleLabel: row.roleLabel,
    establishmentId: row.establishmentId,
    establishmentName: row.establishmentName,
    lastLoginAt: row.user.lastLoginAt,
    createdAt: row.user.createdAt,
  };
}

export async function listAdminUsers(input: {
  page: number;
  pageSize: number;
  search?: string;
}): Promise<{ data: AdminUserSummary[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }> {
  const offset = (input.page - 1) * input.pageSize;
  const schoolHeadRoleRows = await db
    .select({ id: roles.id })
    .from(roles)
    .where(inArray(roles.code, [...SCHOOL_HEAD_ROLES]));

  const roleIds = schoolHeadRoleRows.map((row) => row.id);
  if (roleIds.length === 0) {
    return {
      data: [],
      pagination: { page: input.page, pageSize: input.pageSize, total: 0, totalPages: 1 },
    };
  }

  const filters = [inArray(userRoles.roleId, roleIds)];
  if (input.search?.trim()) {
    const term = `%${input.search.trim()}%`;
    filters.push(or(ilike(users.email, term), ilike(users.fullName, term))!);
  }

  const whereClause = and(...filters);

  const rows = await db
    .select({
      user: users,
      roleCode: roles.code,
      roleLabel: roles.label,
      establishmentId: userRoles.establishmentId,
      establishmentName: establishments.name,
    })
    .from(userRoles)
    .innerJoin(users, eq(userRoles.userId, users.id))
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .leftJoin(establishments, eq(userRoles.establishmentId, establishments.id))
    .where(whereClause)
    .orderBy(desc(users.createdAt))
    .limit(input.pageSize)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(userRoles)
    .innerJoin(users, eq(userRoles.userId, users.id))
    .where(whereClause);

  const total = Number(totalRow?.total ?? 0);

  return {
    data: await Promise.all(rows.map(mapAdminUserRow)),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
  };
}

export async function getAdminUserById(userId: string): Promise<AdminUserSummary | null> {
  const [row] = await db
    .select({
      user: users,
      roleCode: roles.code,
      roleLabel: roles.label,
      establishmentId: userRoles.establishmentId,
      establishmentName: establishments.name,
    })
    .from(userRoles)
    .innerJoin(users, eq(userRoles.userId, users.id))
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .leftJoin(establishments, eq(userRoles.establishmentId, establishments.id))
    .where(and(eq(users.id, userId), inArray(roles.code, [...SCHOOL_HEAD_ROLES])))
    .limit(1);

  if (!row) return null;
  return mapAdminUserRow(row);
}

export async function createAdminUser(
  actor: AuthenticatedUser,
  input: {
    email: string;
    fullName: string;
    password: string;
    roleCode: string;
    establishmentId: string;
  },
): Promise<AdminUserSummary> {
  if (!SCHOOL_HEAD_ROLES.has(input.roleCode)) {
    throw badRequest("Seuls les rôles directeur primaire ou secondaire peuvent être créés.");
  }

  if (input.password.length < 12) {
    throw badRequest("Le mot de passe doit contenir au moins 12 caractères.");
  }

  const [establishment] = await db
    .select({
      id: establishments.id,
      name: establishments.name,
      drenaId: establishments.drenaId,
      regionId: establishments.regionId,
      authorizedCycle: establishments.authorizedCycle,
    })
    .from(establishments)
    .where(eq(establishments.id, input.establishmentId))
    .limit(1);

  if (!establishment) {
    throw badRequest("Établissement introuvable.");
  }

  const cycle = establishment.authorizedCycle ?? "";
  const hasPrimary = cycle.includes("1");
  const hasSecondary = cycle.includes("2");

  if (input.roleCode === "school_head_primary" && !hasPrimary) {
    throw badRequest("Cet établissement n'a pas de cycle primaire (1) autorisé.");
  }

  if (input.roleCode === "school_head_secondary" && !hasSecondary) {
    throw badRequest("Cet établissement n'a pas de cycle secondaire (2) autorisé.");
  }

  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw badRequest("Un compte existe déjà avec cet e-mail.");
  }

  const [role] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.code, input.roleCode))
    .limit(1);

  if (!role) {
    throw badRequest("Rôle introuvable.");
  }

  const passwordHash = await hashPassword(input.password);

  const [created] = await db
    .insert(users)
    .values({
      email: input.email.trim().toLowerCase(),
      fullName: input.fullName.trim(),
      passwordHash,
      status: "active",
    })
    .returning();

  if (!created) {
    throw badRequest("Impossible de créer le compte.");
  }

  await db.insert(userRoles).values({
    userId: created.id,
    roleId: role.id,
    establishmentId: establishment.id,
    drenaId: establishment.drenaId,
    regionId: establishment.regionId,
    grantedBy: actor.id,
  });

  const summary = await getAdminUserById(created.id);
  if (!summary) throw badRequest("Compte créé mais introuvable.");
  return summary;
}

export async function updateAdminUser(
  userId: string,
  input: { status: "active" | "inactive" },
): Promise<AdminUserSummary> {
  const existing = await getAdminUserById(userId);
  if (!existing) throw notFound("Compte introuvable.");

  await db
    .update(users)
    .set({ status: input.status, updatedAt: new Date() })
    .where(eq(users.id, userId));

  if (input.status === "inactive") {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }

  const updated = await getAdminUserById(userId);
  if (!updated) throw notFound("Compte introuvable.");
  return updated;
}
