import { Router, type IRouter } from "express";
import {
  CreateMediaPublicationBody,
  DownloadMediaPublicationFileParams,
  GetMediaPublicationByIdParams,
  GetPublicMediaPublicationByIdParams,
  ListMediaPublicationsQueryParams,
  ListMediaPublicationsResponse,
  ListPublicMediaPublicationsQueryParams,
  ListPublicMediaPublicationsResponse,
  GetMediaPublicationByIdResponse,
  GetPublicMediaPublicationByIdResponse,
  CreateMediaPublicationResponse,
  ReportMediaPublicationIncidentBody,
  ReportMediaPublicationIncidentParams,
  ReportMediaPublicationIncidentResponse,
  TransitionMediaPublicationBody,
  TransitionMediaPublicationParams,
  TransitionMediaPublicationResponse,
} from "@workspace/api-zod";

import type { MediaWorkflowAction } from "../lib/media-workflow";
import { loadAuthSession, requireAuth } from "../middleware/auth";
import {
  serializeMediaPublicationDetail,
  serializeMediaPublicationSummary,
} from "../lib/serializers";
import {
  createMediaPublication,
  getMediaFileDownloadPayload,
  getMediaPublicationById,
  getPublicMediaPublicationById,
  listMediaPublications,
  listPublicMediaPublications,
  reportMediaPublicationIncident,
  transitionMediaPublication,
} from "../repositories/media-publications";

const router: IRouter = Router();

router.get("/media-publications/public", async (req, res, next) => {
  try {
    const query = ListPublicMediaPublicationsQueryParams.parse(req.query);
    const result = await listPublicMediaPublications({
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      mediaType: query.mediaType,
      activityType: query.activityType,
      schoolLevel: query.schoolLevel,
      establishmentId: query.establishmentId,
    });

    const payload = ListPublicMediaPublicationsResponse.parse({
      data: result.data.map(serializeMediaPublicationSummary),
      pagination: result.pagination,
    });

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/media-publications/public/:id", async (req, res, next) => {
  try {
    const params = GetPublicMediaPublicationByIdParams.parse(req.params);
    const publication = await getPublicMediaPublicationById(params.id);
    const payload = GetPublicMediaPublicationByIdResponse.parse(serializeMediaPublicationDetail(publication));
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/media-publications/files/:id/download", loadAuthSession, async (req, res, next) => {
  try {
    const params = DownloadMediaPublicationFileParams.parse(req.params);
    const payload = req.authUser
      ? await getMediaFileDownloadPayload(req.authUser, params.id)
      : await getMediaFileDownloadPayload(null, params.id, { publicOnly: true });

    res.setHeader("Content-Type", payload.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(payload.fileName)}"`,
    );
    res.send(payload.buffer);
  } catch (error) {
    next(error);
  }
});

router.get("/media-publications", requireAuth, async (req, res, next) => {
  try {
    const query = ListMediaPublicationsQueryParams.parse(req.query);
    const result = await listMediaPublications(req.authUser!, {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      status: query.status,
    });

    const payload = ListMediaPublicationsResponse.parse({
      data: result.data.map(serializeMediaPublicationSummary),
      pagination: result.pagination,
    });

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post("/media-publications", requireAuth, async (req, res, next) => {
  try {
    const body = CreateMediaPublicationBody.parse(req.body);
    const publication = await createMediaPublication(req.authUser!, {
      activityId: body.activityId,
      title: body.title,
      description: body.description,
      files: body.files,
    });

    const payload = CreateMediaPublicationResponse.parse(serializeMediaPublicationDetail(publication));
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/media-publications/:id", requireAuth, async (req, res, next) => {
  try {
    const params = GetMediaPublicationByIdParams.parse(req.params);
    const publication = await getMediaPublicationById(req.authUser!, params.id);
    const payload = GetMediaPublicationByIdResponse.parse(serializeMediaPublicationDetail(publication));
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post("/media-publications/:id/incident", requireAuth, async (req, res, next) => {
  try {
    const params = ReportMediaPublicationIncidentParams.parse(req.params);
    const body = ReportMediaPublicationIncidentBody.parse(req.body);
    const publication = await reportMediaPublicationIncident(
      req.authUser!,
      params.id,
      body.description,
    );
    const payload = ReportMediaPublicationIncidentResponse.parse(
      serializeMediaPublicationDetail(publication),
    );
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post("/media-publications/:id/transitions", requireAuth, async (req, res, next) => {
  try {
    const params = TransitionMediaPublicationParams.parse(req.params);
    const body = TransitionMediaPublicationBody.parse(req.body);
    const publication = await transitionMediaPublication(req.authUser!, params.id, {
      action: body.action as MediaWorkflowAction,
      reason: body.reason,
    });

    const payload = TransitionMediaPublicationResponse.parse(serializeMediaPublicationDetail(publication));
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
