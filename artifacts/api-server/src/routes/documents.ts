import { Router, type IRouter } from "express";
import {
  CreateDocumentBody,
  CreateDocumentResponse,
  DownloadDocumentParams,
  ListAppDocumentsQueryParams,
  ListAppDocumentsResponse,
  ListPublicDocumentsQueryParams,
  ListPublicDocumentsResponse,
} from "@workspace/api-zod";

import { loadAuthSession, requireAuth } from "../middleware/auth";
import {
  createDocument,
  getDocumentDownloadPayload,
  listAppDocuments,
  listPublicDocuments,
  serializeDocumentSummary,
} from "../repositories/documents";

const router: IRouter = Router();

router.get("/documents/public", async (req, res, next) => {
  try {
    const query = ListPublicDocumentsQueryParams.parse(req.query);
    const result = await listPublicDocuments({
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      category: query.category,
    });

    const payload = ListPublicDocumentsResponse.parse({
      data: result.data.map(serializeDocumentSummary),
      pagination: result.pagination,
    });

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/app/documents", requireAuth, async (req, res, next) => {
  try {
    const query = ListAppDocumentsQueryParams.parse(req.query);
    const result = await listAppDocuments(req.authUser!, {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      category: query.category,
    });

    const payload = ListAppDocumentsResponse.parse({
      data: result.data.map(serializeDocumentSummary),
      pagination: result.pagination,
    });

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post("/app/documents", requireAuth, async (req, res, next) => {
  try {
    const body = CreateDocumentBody.parse(req.body);
    const document = await createDocument(req.authUser!, {
      title: body.title,
      description: body.description,
      category: body.category,
      isPublic: body.isPublic,
      fileName: body.fileName,
      mimeType: body.mimeType,
      fileContentBase64: body.fileContentBase64,
    });

    const payload = CreateDocumentResponse.parse(serializeDocumentSummary(document));
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/documents/:id/download", loadAuthSession, async (req, res, next) => {
  try {
    const params = DownloadDocumentParams.parse(req.params);
    const payload = await getDocumentDownloadPayload(req.authUser ?? null, params.id);

    res.setHeader("Content-Type", payload.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(payload.fileName)}"`,
    );
    res.send(payload.buffer);
  } catch (error) {
    next(error);
  }
});

export default router;
