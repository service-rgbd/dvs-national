const TRANSIENT_DB_CODES = new Set([
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EPIPE",
  "EAI_AGAIN",
  "57P01",
  "08006",
  "08001",
  "08003",
  "08004",
  "53300",
]);

const TRANSIENT_DB_MESSAGE =
  /ETIMEDOUT|ECONNRESET|ENOTFOUND|EPIPE|connection terminated|disconnected before secure TLS|socket disconnected|timeout expired/i;

function isTransientDbError(error: unknown): boolean {
  let current: unknown = error;
  const seen = new Set<unknown>();

  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const candidate = current as { code?: string; message?: string; cause?: unknown };
    if (candidate.code && TRANSIENT_DB_CODES.has(candidate.code)) return true;
    if (candidate.message && TRANSIENT_DB_MESSAGE.test(candidate.message)) return true;
    current = candidate.cause;
  }

  if (typeof error === "string" && TRANSIENT_DB_MESSAGE.test(error)) return true;
  return false;
}

export { isTransientDbError };

export async function withDbRetry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; baseDelayMs?: number } = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 400;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts || !isTransientDbError(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * attempt));
    }
  }

  throw lastError;
}
