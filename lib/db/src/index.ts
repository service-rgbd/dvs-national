import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const databaseUrl = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 15_000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
  ssl: databaseUrl?.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
});

pool.on("error", (error) => {
  console.error("[db] Erreur pool PostgreSQL (connexion idle)", error);
});

export const db = drizzle(pool, { schema });

export * from "./schema";
export { isTransientDbError, withDbRetry } from "./retry";
