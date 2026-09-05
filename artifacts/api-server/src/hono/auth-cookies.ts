import { deleteCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";

import { isLoginRateLimited } from "../lib/auth-cookies";
import { isProduction, sessionCookieName, type AuthVariables, type WorkerEnv } from "./types";

export { isLoginRateLimited };

export function setSessionCookie(
  c: Context<{ Bindings: WorkerEnv; Variables: AuthVariables }>,
  token: string,
  expiresAt: Date,
): void {
  setCookie(c, sessionCookieName(c.env), token, {
    httpOnly: true,
    secure: isProduction(c.env),
    sameSite: "Lax",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(
  c: Context<{ Bindings: WorkerEnv; Variables: AuthVariables }>,
): void {
  deleteCookie(c, sessionCookieName(c.env), {
    httpOnly: true,
    secure: isProduction(c.env),
    sameSite: "Lax",
    path: "/",
  });
}

export function getClientIp(c: Context): string | undefined {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim();
  }
  return c.req.header("cf-connecting-ip") ?? undefined;
}
