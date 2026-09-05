import { and, eq, isNotNull } from "drizzle-orm";

import { activities, db, establishments, notifications, requests, withDbRetry } from "@workspace/db";

import { createNotification } from "../repositories/notifications";

type ReminderKind = "activity_in_progress" | "activity_reminder_7d" | "activity_reminder_1d";

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

async function notificationAlreadySent(
  userId: string,
  type: ReminderKind,
  resourceId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.type, type),
        eq(notifications.resourceId, resourceId),
      ),
    )
    .limit(1);
  return Boolean(row);
}

async function notifyActivityReminder(input: {
  userId: string;
  type: ReminderKind;
  activityId: string;
  title: string;
  body: string;
}): Promise<void> {
  const exists = await notificationAlreadySent(input.userId, input.type, input.activityId);
  if (exists) return;

  await createNotification({
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    resourceType: "activity",
    resourceId: input.activityId,
  });
}

/** Notifications activités en cours / rappels J-7 et J-1 (dossier validé). */
export async function dispatchActivityReminders(): Promise<void> {
  const today = startOfDay(new Date());
  const tomorrow = startOfDay(addDays(today, 1));
  const inSevenDays = startOfDay(addDays(today, 7));

  const rows = await withDbRetry(() =>
    db
      .select({
        activityId: activities.id,
        activityTitle: activities.title,
        scheduledAt: activities.scheduledAt,
        createdBy: activities.createdBy,
        establishmentName: establishments.name,
      })
      .from(activities)
      .innerJoin(establishments, eq(activities.establishmentId, establishments.id))
      .innerJoin(
        requests,
        and(eq(requests.activityId, activities.id), eq(requests.status, "approved")),
      )
      .where(and(isNotNull(activities.scheduledAt), isNotNull(activities.createdBy))),
  );

  for (const row of rows) {
    if (!row.scheduledAt || !row.createdBy) continue;

    const scheduled = startOfDay(row.scheduledAt);
    const label = row.activityTitle;
    const establishment = row.establishmentName;

    if (scheduled.getTime() === today.getTime()) {
      await notifyActivityReminder({
        userId: row.createdBy,
        type: "activity_in_progress",
        activityId: row.activityId,
        title: "Activité en cours aujourd'hui",
        body: `L'activité « ${label} » (${establishment}) a lieu aujourd'hui.`,
      });
      continue;
    }

    if (scheduled.getTime() === inSevenDays.getTime()) {
      await notifyActivityReminder({
        userId: row.createdBy,
        type: "activity_reminder_7d",
        activityId: row.activityId,
        title: "Rappel activité — J-7",
        body: `L'activité « ${label} » (${establishment}) est prévue dans 7 jours.`,
      });
      continue;
    }

    if (scheduled.getTime() === tomorrow.getTime()) {
      await notifyActivityReminder({
        userId: row.createdBy,
        type: "activity_reminder_1d",
        activityId: row.activityId,
        title: "Rappel activité — demain",
        body: `L'activité « ${label} » (${establishment}) a lieu demain.`,
      });
    }
  }
}
