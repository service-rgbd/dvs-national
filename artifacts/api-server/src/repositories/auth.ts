import bcrypt from "bcryptjs";
import { and, eq, gt, inArray } from "drizzle-orm";

import { db, loginEvents, roles, sessions, userRoles, users } from "@workspace/db";

import { SESSION_TTL_MS } from "../config/auth";
import { hashSessionToken } from "../lib/session-token";

export type AuthRole = {
  code: string;
  label: string;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  fullName: string;
  status: string;
  roles: AuthRole[];
};

type SessionMeta = {
  ipAddress?: string;
  userAgent?: string;
};

export async function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);

  return user ?? null;
}

export async function verifyPassword(
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

export async function createSession(
  userId: string,
  meta: SessionMeta = {},
): Promise<{ token: string; expiresAt: Date }> {
  const { generateSessionToken } = await import("../lib/session-token");
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    userId,
    tokenHash,
    expiresAt,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { token, expiresAt };
}

export async function deleteSessionByToken(token: string): Promise<void> {
  const tokenHash = hashSessionToken(token);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export async function touchSession(sessionId: string): Promise<void> {
  await db
    .update(sessions)
    .set({ lastSeenAt: new Date() })
    .where(eq(sessions.id, sessionId));
}

export async function getSessionByToken(token: string) {
  const tokenHash = hashSessionToken(token);
  const now = new Date();

  const [row] = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
    .limit(1);

  return row ?? null;
}

export async function getUserRoles(userId: string): Promise<AuthRole[]> {
  const rows = await db
    .select({
      code: roles.code,
      label: roles.label,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));

  return rows;
}

export async function getAuthenticatedUser(userId: string): Promise<AuthenticatedUser | null> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;

  const userRoleRows = await getUserRoles(user.id);

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    status: user.status,
    roles: userRoleRows,
  };
}

export async function recordLoginEvent(input: {
  userId?: string;
  emailAttempted: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await db.insert(loginEvents).values({
    userId: input.userId,
    emailAttempted: input.emailAttempted.trim().toLowerCase(),
    success: input.success,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
}

export async function updateLastLogin(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export function userHasAnyRole(user: AuthenticatedUser, allowedRoles: string[]): boolean {
  if (allowedRoles.length === 0) return true;
  const codes = new Set(user.roles.map((role) => role.code));
  return allowedRoles.some((code) => codes.has(code));
}

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, 12);
}

export async function countUsersWithRoles(roleCodes: string[]): Promise<number> {
  if (roleCodes.length === 0) return 0;

  const rows = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(inArray(roles.code, roleCodes));

  return new Set(rows.map((row) => row.userId)).size;
}
