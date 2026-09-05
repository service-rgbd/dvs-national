import { and, inArray, lt, notInArray } from "drizzle-orm";

import { db, requests } from "@workspace/db";

import { getArchiveCutoffDate } from "../config/retention";
import { logger } from "./logger";

const TERMINAL_STATUSES = ["approved", "rejected", "cancelled"] as const;

/** Archive les dossiers terminés de plus de 3 ans. */
export async function archiveExpiredRequests(): Promise<number> {
  const cutoff = getArchiveCutoffDate();

  const expired = await db
    .update(requests)
    .set({ status: "archived", updatedAt: new Date() })
    .where(
      and(
        inArray(requests.status, [...TERMINAL_STATUSES]),
        lt(requests.updatedAt, cutoff),
        notInArray(requests.status, ["archived"]),
      ),
    )
    .returning({ id: requests.id });

  if (expired.length > 0) {
    logger.info(
      { count: expired.length, cutoff: cutoff.toISOString() },
      "Dossiers archivés (rétention 3 ans)",
    );
  }

  return expired.length;
}

export async function runRetentionJobs(): Promise<void> {
  try {
    await archiveExpiredRequests();
  } catch (error) {
    logger.error({ err: error }, "Échec tâche de rétention");
  }
}
