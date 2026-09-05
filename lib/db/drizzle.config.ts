import { defineConfig } from "drizzle-kit";
import path from "path";

/** Placeholder local — generate ne nécessite pas de connexion réelle. */
const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://localhost:5432/pnigvs_dev";

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  out: path.join(__dirname, "./drizzle"),
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
