import { Router, type IRouter } from "express";
import {
  CreateActivityBody,
  CreateActivityResponse,
  GetActivityByIdParams,
  GetActivityByIdResponse,
  ListActivitiesQueryParams,
  ListActivitiesResponse,
} from "@workspace/api-zod";

import { requireAuth } from "../middleware/auth";
import { serializeActivity } from "../lib/serializers";
import {
  createActivity,
  getActivityById,
  listActivities,
  listPublicActivities,
} from "../repositories/activities";

const router: IRouter = Router();

router.get("/activities/public", async (req, res, next) => {
  try {
    const query = ListActivitiesQueryParams.parse(req.query);
    const result = await listPublicActivities({
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      type: typeof req.query.activityType === "string" ? req.query.activityType : undefined,
      establishmentId:
        typeof req.query.establishmentId === "string" ? req.query.establishmentId : undefined,
    });

    const payload = ListActivitiesResponse.parse({
      data: result.data.map(serializeActivity),
      pagination: result.pagination,
    });

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/activities", requireAuth, async (req, res, next) => {
  try {
    const query = ListActivitiesQueryParams.parse(req.query);
    const result = await listActivities(req.authUser!, {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    });

    const payload = ListActivitiesResponse.parse({
      data: result.data.map(serializeActivity),
      pagination: result.pagination,
    });

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post("/activities", requireAuth, async (req, res, next) => {
  try {
    const body = CreateActivityBody.parse(req.body);
    const activity = await createActivity(req.authUser!, {
      establishmentId: body.establishmentId,
      type: body.type,
      title: body.title,
      description: body.description,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      location: body.location,
    });

    const payload = CreateActivityResponse.parse(serializeActivity(activity));
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/activities/:id", requireAuth, async (req, res, next) => {
  try {
    const params = GetActivityByIdParams.parse(req.params);
    const activity = await getActivityById(req.authUser!, params.id);
    const payload = GetActivityByIdResponse.parse(serializeActivity(activity));
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
