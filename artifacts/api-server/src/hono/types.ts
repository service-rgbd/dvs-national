import type { AuthenticatedUser } from "../repositories/auth";

export type WorkerEnv = {
  DATABASE_URL: string;
  CORS_ORIGIN?: string;
  NODE_ENV?: string;
  PNIGVS_SESSION_COOKIE?: string;
};

export type AuthVariables = {
  authUser?: AuthenticatedUser;
  sessionId?: string;
};

export function isProduction(env: WorkerEnv): boolean {
  return env.NODE_ENV === "production";
}

export function sessionCookieName(env: WorkerEnv): string {
  return env.PNIGVS_SESSION_COOKIE ?? "pnigvs_session";
}
