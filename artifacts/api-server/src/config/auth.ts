const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const SESSION_COOKIE_NAME =
  process.env.PNIGVS_SESSION_COOKIE ?? "pnigvs_session";

export const SESSION_TTL_MS = Number(process.env.PNIGVS_SESSION_TTL_MS ?? SEVEN_DAYS_MS);

export const CORS_ORIGIN =
  process.env.CORS_ORIGIN ?? "http://localhost:26270";

export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 10;
