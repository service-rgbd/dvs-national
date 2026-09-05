import { Router, type IRouter } from "express";
import {
  CreateRequestBody,
  CreateRequestResponse,
  GetRequestByIdParams,
  GetRequestByIdResponse,
  ListRequestsQueryParams,
  ListRequestsResponse,
  TransitionRequestBody,
  TransitionRequestParams,
  TransitionRequestResponse,
} from "@workspace/api-zod";

import type { WorkflowAction } from "../lib/workflow";
import { requireAuth } from "../middleware/auth";
import { serializeRequestDetail, serializeRequestSummary } from "../lib/serializers";
import {
  createRequest,
  getRequestById,
  listRequests,
  transitionRequest,
} from "../repositories/requests";

const router: IRouter = Router();

router.get("/requests", requireAuth, async (req, res, next) => {
  try {
    const query = ListRequestsQueryParams.parse(req.query);
    const result = await listRequests(req.authUser!, {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      status: query.status,
    });

    const payload = ListRequestsResponse.parse({
      data: result.data.map(serializeRequestSummary),
      pagination: result.pagination,
    });

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post("/requests", requireAuth, async (req, res, next) => {
  try {
    const body = CreateRequestBody.parse(req.body);
    const request = await createRequest(req.authUser!, body);
    const payload = CreateRequestResponse.parse(serializeRequestDetail(request));
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/requests/:id", requireAuth, async (req, res, next) => {
  try {
    const params = GetRequestByIdParams.parse(req.params);
    const request = await getRequestById(req.authUser!, params.id);
    const payload = GetRequestByIdResponse.parse(serializeRequestDetail(request));
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post("/requests/:id/transitions", requireAuth, async (req, res, next) => {
  try {
    const params = TransitionRequestParams.parse(req.params);
    const body = TransitionRequestBody.parse(req.body);
    const request = await transitionRequest(req.authUser!, params.id, {
      action: body.action as WorkflowAction,
      reason: body.reason,
      checklist: body.checklist,
      dvsValidation: body.dvsValidation,
    });
    const payload = TransitionRequestResponse.parse(serializeRequestDetail(request));
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
