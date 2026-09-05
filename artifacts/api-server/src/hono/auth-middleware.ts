import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { withDbRetry } from "@workspace/db";

import { forbidden, unauthorized } from "../lib/errors";
import {
  getAuthenticatedUser,
  getSessionByToken,
  touchSession,
  userHasAnyRole,
} from "../repositories/auth";
import { sessionCookieName, type AuthVariables, type WorkerEnv } from "./types";

export const loadAuthSession = createMiddleware<{
  Bindings: WorkerEnv;
  Variables: AuthVariables;
}>(async (c, next) => {
  const token = getCookie(c, sessionCookieName(c.env));
  if (!token) {
    await next();
    return;
  }

  const sessionRow = await withDbRetry(() => getSessionByToken(token));
  if (!sessionRow) {
    await next();
    return;
  }

  const authUser = await withDbRetry(() => getAuthenticatedUser(sessionRow.user.id));
  if (!authUser || authUser.status !== "active") {
    await next();
    return;
  }

  c.set("authUser", authUser);
  c.set("sessionId", sessionRow.session.id);
  void touchSession(sessionRow.session.id);
  await next();
});

export const requireAuth = createMiddleware<{
  Bindings: WorkerEnv;
  Variables: AuthVariables;
}>(async (c, next) => {
  if (!c.get("authUser")) {
    throw unauthorized();
  }
  await next();
});

export function requireRole(...allowedRoles: string[]) {
  return createMiddleware<{
    Bindings: WorkerEnv;
    Variables: AuthVariables;
  }>(async (c, next) => {
    const authUser = c.get("authUser");
    if (!authUser) {
      throw unauthorized();
    }

    if (!userHasAnyRole(authUser, allowedRoles)) {
      throw forbidden("Votre profil ne dispose pas des droits nécessaires.");
    }

    await next();
  });
}
