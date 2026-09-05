import type { Hono } from "hono";
import {
  AuthLoginBody,
  AuthLoginResponse,
  AuthMeResponse,
} from "@workspace/api-zod";
import { getCookie } from "hono/cookie";

import { unauthorized } from "../lib/errors";
import {
  createSession,
  deleteSessionByToken,
  findUserByEmail,
  getAuthenticatedUser,
  recordLoginEvent,
  updateLastLogin,
  verifyPassword,
} from "../repositories/auth";
import {
  clearSessionCookie,
  getClientIp,
  isLoginRateLimited,
  setSessionCookie,
} from "./auth-cookies";
import { requireAuth } from "./auth-middleware";
import { sessionCookieName, type AuthVariables, type WorkerEnv } from "./types";

export function registerAuthRoutes(
  app: Hono<{ Bindings: WorkerEnv; Variables: AuthVariables }>,
): void {
  app.post("/api/auth/login", async (c) => {
    const body = AuthLoginBody.parse(await c.req.json());
    const ipAddress = getClientIp(c);
    const userAgent = c.req.header("user-agent");
    const rateLimitKey = `${ipAddress ?? "unknown"}:${body.email.trim().toLowerCase()}`;

    if (isLoginRateLimited(rateLimitKey)) {
      return c.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Trop de tentatives. Réessayez dans quelques minutes.",
          },
        },
        429,
      );
    }

    const user = await findUserByEmail(body.email);

    const invalidCredentials = async () => {
      await recordLoginEvent({
        userId: user?.id,
        emailAttempted: body.email,
        success: false,
        ipAddress,
        userAgent,
      });
      throw unauthorized("Identifiants invalides.");
    };

    if (!user || user.status !== "active") {
      await invalidCredentials();
    }

    const passwordValid = await verifyPassword(body.password, user!.passwordHash);
    if (!passwordValid) {
      await invalidCredentials();
    }

    const { token, expiresAt } = await createSession(user!.id, { ipAddress, userAgent });
    await updateLastLogin(user!.id);
    await recordLoginEvent({
      userId: user!.id,
      emailAttempted: body.email,
      success: true,
      ipAddress,
      userAgent,
    });

    setSessionCookie(c, token, expiresAt);

    const authUser = await getAuthenticatedUser(user!.id);
    if (!authUser) {
      throw unauthorized("Identifiants invalides.");
    }

    return c.json(AuthLoginResponse.parse({ user: authUser }));
  });

  app.post("/api/auth/logout", async (c) => {
    const token = getCookie(c, sessionCookieName(c.env));
    if (token) {
      await deleteSessionByToken(token);
    }
    clearSessionCookie(c);
    return c.body(null, 204);
  });

  app.get("/api/auth/me", requireAuth, async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) {
      throw unauthorized();
    }
    return c.json(AuthMeResponse.parse({ user: authUser }));
  });
}
