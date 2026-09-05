import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof drizzleNeon<typeof schema>>;

let dbInstance: DrizzleDb | null = null;

let configuredDatabaseUrl: string | null = null;

export function setWorkerDatabaseUrl(url: string): void {
  configuredDatabaseUrl = url;
  dbInstance = null;
}

function initDb(): DrizzleDb {
  if (dbInstance) return dbInstance;
  const databaseUrl = configuredDatabaseUrl;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be set.");
  }
  dbInstance = drizzleNeon(neon(databaseUrl), { schema });
  return dbInstance;
}

export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    const instance = initDb() as unknown as Record<string | symbol, unknown>;
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

/** Non utilisé sur Worker — présent pour compatibilité des imports. */
export const pool = null;

export * from "./schema";
export { isTransientDbError, withDbRetry } from "./retry";
