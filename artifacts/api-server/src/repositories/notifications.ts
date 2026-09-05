import { and, desc, eq, inArray } from "drizzle-orm";

import { db, establishments, notifications, roles, userRoles } from "@workspace/db";

import type { RequestStatus, WorkflowAction } from "../lib/workflow";
import { REQUEST_STATUS_LABELS } from "../lib/workflow";

export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  resourceType?: string;
  resourceId?: string;
}): Promise<void> {
  await db.insert(notifications).values({
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
  });
}

export async function notifyRequestTransition(input: {
  action: WorkflowAction;
  requestId: string;
  newStatus: RequestStatus;
  establishmentId: string;
  creatorId?: string | null;
  reason?: string;
}): Promise<void> {
  const inserts: Promise<void>[] = [];

  const [establishment] = await db
    .select({ name: establishments.name, drenaId: establishments.drenaId })
    .from(establishments)
    .where(eq(establishments.id, input.establishmentId))
    .limit(1);

  const establishmentName = establishment?.name ?? "Établissement";
  const statusLabel = REQUEST_STATUS_LABELS[input.newStatus];

  if (input.creatorId) {
    const isCorrection = input.newStatus === "returned_for_correction";
    inserts.push(
      createNotification({
        userId: input.creatorId,
        type: isCorrection ? "request_returned_for_correction" : "request_status_changed",
        title: isCorrection
          ? "Dossier renvoyé pour correction"
          : `Demande ${statusLabel.toLowerCase()}`,
        body: isCorrection
          ? `Votre demande pour ${establishmentName} nécessite des corrections. Contactez le service Voyage Découverte de la DVS.${
              input.reason ? ` Remarques : ${input.reason}` : ""
            }`
          : `Votre demande pour ${establishmentName} est désormais « ${statusLabel} ».${
              input.reason ? ` Motif : ${input.reason}` : ""
            }`,
        resourceType: "request",
        resourceId: input.requestId,
      }),
    );
  }

  if (input.action === "submit" && establishment?.drenaId) {
    const drenaManagers = await db
      .select({ userId: userRoles.userId })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(eq(roles.code, "drena_manager"), eq(userRoles.drenaId, establishment.drenaId)),
      );

    for (const manager of drenaManagers) {
      inserts.push(
        createNotification({
          userId: manager.userId,
          type: "request_submitted",
          title: "Nouvelle demande à analyser",
          body: `${establishmentName} a soumis une demande d'autorisation.`,
          resourceType: "request",
          resourceId: input.requestId,
        }),
      );
    }
  }

  if (input.action === "forward") {
    const dvsUsers = await db
      .select({ userId: userRoles.userId })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(inArray(roles.code, ["dvs_director", "dvs_staff"]));

    for (const dvsUser of dvsUsers) {
      inserts.push(
        createNotification({
          userId: dvsUser.userId,
          type: "request_forwarded",
          title: "Demande transmise par la DREN",
          body: `Demande de ${establishmentName} en attente de décision DVS.`,
          resourceType: "request",
          resourceId: input.requestId,
        }),
      );
    }
  }

  if (inserts.length > 0) {
    await Promise.all(inserts);
  }
}

export async function listNotifications(userId: string, unreadOnly = false) {
  const condition = unreadOnly
    ? and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    : eq(notifications.userId, userId);

  return db
    .select()
    .from(notifications)
    .where(condition)
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const [updated] = await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning();

  return updated ?? null;
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return rows.length;
}
