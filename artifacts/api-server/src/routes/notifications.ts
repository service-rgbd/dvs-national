import { Router, type IRouter } from "express";
import {
  ListNotificationsQueryParams,
  ListNotificationsResponse,
  MarkNotificationReadParams,
  MarkNotificationReadResponse,
} from "@workspace/api-zod";

import { notFound } from "../lib/errors";
import { serializeNotification } from "../lib/serializers";
import { requireAuth } from "../middleware/auth";
import { listNotifications, markNotificationRead } from "../repositories/notifications";

const router: IRouter = Router();

router.get("/notifications", requireAuth, async (req, res, next) => {
  try {
    const query = ListNotificationsQueryParams.parse(req.query);
    const rows = await listNotifications(req.authUser!.id, query.unreadOnly ?? false);
    const payload = ListNotificationsResponse.parse({
      data: rows.map(serializeNotification),
    });
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post("/notifications/:id/read", requireAuth, async (req, res, next) => {
  try {
    const params = MarkNotificationReadParams.parse(req.params);
    const updated = await markNotificationRead(req.authUser!.id, params.id);
    if (!updated) throw notFound("Notification introuvable.");
    const payload = MarkNotificationReadResponse.parse(serializeNotification(updated));
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
