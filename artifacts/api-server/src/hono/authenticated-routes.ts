import type { Hono } from "hono";
import {
  CreateActivityBody,
  CreateActivityResponse,
  CreateAdminUserBody,
  CreateAdminUserResponse,
  CreateDocumentBody,
  CreateDocumentResponse,
  CreateMediaPublicationBody,
  CreateMediaPublicationResponse,
  CreateRequestBody,
  CreateRequestResponse,
  DownloadDocumentParams,
  DownloadMediaPublicationFileParams,
  GenerateReportBody,
  GenerateReportResponse,
  GetActivityByIdParams,
  GetActivityByIdResponse,
  GetAppDashboardResponse,
  GetAppEstablishmentByIdParams,
  GetAppEstablishmentByIdResponse,
  GetAppStatisticsResponse,
  GetMediaPublicationByIdParams,
  GetMediaPublicationByIdResponse,
  GetRequestByIdParams,
  GetRequestByIdResponse,
  ListActivitiesQueryParams,
  ListActivitiesResponse,
  ListAdminUsersQueryParams,
  ListAdminUsersResponse,
  ListAppDocumentsQueryParams,
  ListAppDocumentsResponse,
  ListAppEstablishmentsQueryParams,
  ListAppEstablishmentsResponse,
  ListMediaPublicationsQueryParams,
  ListMediaPublicationsResponse,
  ListNotificationsQueryParams,
  ListNotificationsResponse,
  ListReportsQueryParams,
  ListReportsResponse,
  ListRequestsQueryParams,
  ListRequestsResponse,
  MarkNotificationReadParams,
  MarkNotificationReadResponse,
  ReportMediaPublicationIncidentBody,
  ReportMediaPublicationIncidentParams,
  ReportMediaPublicationIncidentResponse,
  TransitionMediaPublicationBody,
  TransitionMediaPublicationParams,
  TransitionMediaPublicationResponse,
  TransitionRequestBody,
  TransitionRequestParams,
  TransitionRequestResponse,
  UpdateAdminUserBody,
  UpdateAdminUserParams,
  UpdateAdminUserResponse,
} from "@workspace/api-zod";

import type { MediaWorkflowAction } from "../lib/media-workflow";
import { notFound } from "../lib/errors";
import type { WorkflowAction } from "../lib/workflow";
import {
  serializeActivity,
  serializeMediaPublicationDetail,
  serializeMediaPublicationSummary,
  serializeNotification,
  serializeRequestDetail,
  serializeRequestSummary,
} from "../lib/serializers";
import {
  createActivity,
  getActivityById,
  listActivities,
} from "../repositories/activities";
import {
  createAdminUser,
  getAdminUserById,
  listAdminUsers,
  updateAdminUser,
} from "../repositories/admin-users";
import { getAppDashboard } from "../repositories/dashboard";
import {
  createDocument,
  getDocumentDownloadPayload,
  listAppDocuments,
  serializeDocumentSummary,
} from "../repositories/documents";
import {
  getEstablishmentByIdForUser,
  listEstablishmentsForUser,
} from "../repositories/establishments";
import {
  createMediaPublication,
  getMediaFileDownloadPayload,
  getMediaPublicationById,
  listMediaPublications,
  reportMediaPublicationIncident,
  transitionMediaPublication,
} from "../repositories/media-publications";
import { listNotifications, markNotificationRead } from "../repositories/notifications";
import { generateReport, listReports } from "../repositories/reports";
import {
  createRequest,
  getRequestById,
  listRequests,
  transitionRequest,
} from "../repositories/requests";
import { getAppStatistics } from "../repositories/statistics";
import { loadAuthSession, requireAuth, requireRole } from "./auth-middleware";
import type { AuthVariables, WorkerEnv } from "./types";

function serializeAdminUser(user: Awaited<ReturnType<typeof getAdminUserById>>) {
  if (!user) throw new Error("Utilisateur admin introuvable.");
  return {
    ...user,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

const directorStaff = requireRole("dvs_director", "dvs_staff");

export function registerAuthenticatedRoutes(
  app: Hono<{ Bindings: WorkerEnv; Variables: AuthVariables }>,
): void {
  app.get("/api/app/dashboard", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const dashboard = await getAppDashboard(authUser);
    return c.json(
      GetAppDashboardResponse.parse({
        profile: {
          ...dashboard.profile,
          regionId: dashboard.profile.regionId ?? null,
          drenaId: dashboard.profile.drenaId ?? null,
          establishmentId: dashboard.profile.establishmentId ?? null,
          drenaName: dashboard.profile.drenaName ?? null,
          drenaContactName: dashboard.profile.drenaContactName ?? null,
          drenaContactEmail: dashboard.profile.drenaContactEmail ?? null,
        },
        kpis: dashboard.kpis,
      }),
    );
  });

  app.get("/api/app/establishments", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const query = ListAppEstablishmentsQueryParams.parse(c.req.query());
    const result = await listEstablishmentsForUser(authUser, {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      search: query.search,
      region: query.region,
      drena: query.drena,
      ddena: query.ddena,
      department: query.department,
      locality: query.locality,
      type: query.type,
      status: query.status,
      sort: query.sort ?? "name",
      order: query.order ?? "asc",
    });

    return c.json(
      ListAppEstablishmentsResponse.parse({
        data: result.data.map((item) => ({
          ...item,
          ddena: item.ddena ?? null,
          department: item.department ?? null,
        })),
        pagination: result.pagination,
      }),
    );
  });

  app.get("/api/app/establishments/:id", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const params = GetAppEstablishmentByIdParams.parse({ id: c.req.param("id") });
    const establishment = await getEstablishmentByIdForUser(authUser, params.id);
    if (!establishment) {
      throw notFound("Établissement introuvable.");
    }

    return c.json(
      GetAppEstablishmentByIdResponse.parse({
        ...establishment,
        ddena: establishment.ddena ?? null,
        department: establishment.department ?? null,
        createdAt: establishment.createdAt.toISOString(),
        updatedAt: establishment.updatedAt.toISOString(),
      }),
    );
  });

  app.get("/api/notifications", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const query = ListNotificationsQueryParams.parse(c.req.query());
    const rows = await listNotifications(authUser.id, query.unreadOnly ?? false);
    return c.json(
      ListNotificationsResponse.parse({
        data: rows.map(serializeNotification),
      }),
    );
  });

  app.post("/api/notifications/:id/read", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const params = MarkNotificationReadParams.parse({ id: c.req.param("id") });
    const updated = await markNotificationRead(authUser.id, params.id);
    if (!updated) throw notFound("Notification introuvable.");
    return c.json(MarkNotificationReadResponse.parse(serializeNotification(updated)));
  });

  app.get("/api/requests", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const query = ListRequestsQueryParams.parse(c.req.query());
    const result = await listRequests(authUser, {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      status: query.status,
    });

    return c.json(
      ListRequestsResponse.parse({
        data: result.data.map(serializeRequestSummary),
        pagination: result.pagination,
      }),
    );
  });

  app.post("/api/requests", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const body = CreateRequestBody.parse(await c.req.json());
    const request = await createRequest(authUser, body);
    return c.json(CreateRequestResponse.parse(serializeRequestDetail(request)), 201);
  });

  app.get("/api/requests/:id", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const params = GetRequestByIdParams.parse({ id: c.req.param("id") });
    const request = await getRequestById(authUser, params.id);
    return c.json(GetRequestByIdResponse.parse(serializeRequestDetail(request)));
  });

  app.post("/api/requests/:id/transitions", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const params = TransitionRequestParams.parse({ id: c.req.param("id") });
    const body = TransitionRequestBody.parse(await c.req.json());
    const request = await transitionRequest(authUser, params.id, {
      action: body.action as WorkflowAction,
      reason: body.reason,
      checklist: body.checklist,
      dvsValidation: body.dvsValidation,
    });
    return c.json(TransitionRequestResponse.parse(serializeRequestDetail(request)));
  });

  app.get("/api/activities", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const query = ListActivitiesQueryParams.parse(c.req.query());
    const result = await listActivities(authUser, {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    });

    return c.json(
      ListActivitiesResponse.parse({
        data: result.data.map(serializeActivity),
        pagination: result.pagination,
      }),
    );
  });

  app.post("/api/activities", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const body = CreateActivityBody.parse(await c.req.json());
    const activity = await createActivity(authUser, {
      establishmentId: body.establishmentId,
      type: body.type,
      title: body.title,
      description: body.description,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      location: body.location,
    });

    return c.json(CreateActivityResponse.parse(serializeActivity(activity)), 201);
  });

  app.get("/api/activities/:id", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const params = GetActivityByIdParams.parse({ id: c.req.param("id") });
    const activity = await getActivityById(authUser, params.id);
    return c.json(GetActivityByIdResponse.parse(serializeActivity(activity)));
  });

  app.get("/api/app/statistics", directorStaff, async (c) => {
    const authUser = c.get("authUser")!;
    const stats = await getAppStatistics(authUser);
    return c.json(
      GetAppStatisticsResponse.parse({
        kpis: stats.kpis,
        requestsByStatus: stats.requestsByStatus,
        activitiesByType: stats.activitiesByType,
      }),
    );
  });

  app.get("/api/app/reports", directorStaff, async (c) => {
    const authUser = c.get("authUser")!;
    const query = ListReportsQueryParams.parse(c.req.query());
    const result = await listReports(authUser, {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    });

    return c.json(
      ListReportsResponse.parse({
        data: result.data.map((item) => ({
          ...item,
          periodStart: item.periodStart?.toISOString() ?? null,
          periodEnd: item.periodEnd?.toISOString() ?? null,
          createdAt: item.createdAt.toISOString(),
        })),
        pagination: result.pagination,
      }),
    );
  });

  app.post("/api/app/reports/generate", directorStaff, async (c) => {
    const authUser = c.get("authUser")!;
    const body = GenerateReportBody.parse(await c.req.json());
    const report = await generateReport(authUser, body.type);
    return c.json(
      GenerateReportResponse.parse({
        ...report,
        periodStart: report.periodStart?.toISOString() ?? null,
        periodEnd: report.periodEnd?.toISOString() ?? null,
        createdAt: report.createdAt.toISOString(),
      }),
      201,
    );
  });

  app.get("/api/app/documents", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const query = ListAppDocumentsQueryParams.parse(c.req.query());
    const result = await listAppDocuments(authUser, {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      category: query.category,
    });

    return c.json(
      ListAppDocumentsResponse.parse({
        data: result.data.map(serializeDocumentSummary),
        pagination: result.pagination,
      }),
    );
  });

  app.post("/api/app/documents", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const body = CreateDocumentBody.parse(await c.req.json());
    const document = await createDocument(authUser, {
      title: body.title,
      description: body.description,
      category: body.category,
      isPublic: body.isPublic,
      fileName: body.fileName,
      mimeType: body.mimeType,
      fileContentBase64: body.fileContentBase64,
    });

    return c.json(CreateDocumentResponse.parse(serializeDocumentSummary(document)), 201);
  });

  app.get("/api/documents/:id/download", loadAuthSession, async (c) => {
    const params = DownloadDocumentParams.parse({ id: c.req.param("id") });
    const payload = await getDocumentDownloadPayload(c.get("authUser") ?? null, params.id);

    return new Response(new Uint8Array(payload.buffer), {
      status: 200,
      headers: {
        "Content-Type": payload.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(payload.fileName)}"`,
      },
    });
  });

  app.get("/api/media-publications/files/:id/download", loadAuthSession, async (c) => {
    const params = DownloadMediaPublicationFileParams.parse({ id: c.req.param("id") });
    const authUser = c.get("authUser") ?? null;
    const payload = authUser
      ? await getMediaFileDownloadPayload(authUser, params.id)
      : await getMediaFileDownloadPayload(null, params.id, { publicOnly: true });

    return new Response(new Uint8Array(payload.buffer), {
      status: 200,
      headers: {
        "Content-Type": payload.mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(payload.fileName)}"`,
      },
    });
  });

  app.get("/api/media-publications", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const query = ListMediaPublicationsQueryParams.parse(c.req.query());
    const result = await listMediaPublications(authUser, {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      status: query.status,
    });

    return c.json(
      ListMediaPublicationsResponse.parse({
        data: result.data.map(serializeMediaPublicationSummary),
        pagination: result.pagination,
      }),
    );
  });

  app.post("/api/media-publications", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const body = CreateMediaPublicationBody.parse(await c.req.json());
    const publication = await createMediaPublication(authUser, {
      activityId: body.activityId,
      title: body.title,
      description: body.description,
      files: body.files,
    });

    return c.json(
      CreateMediaPublicationResponse.parse(serializeMediaPublicationDetail(publication)),
      201,
    );
  });

  app.get("/api/media-publications/:id", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const params = GetMediaPublicationByIdParams.parse({ id: c.req.param("id") });
    const publication = await getMediaPublicationById(authUser, params.id);
    return c.json(
      GetMediaPublicationByIdResponse.parse(serializeMediaPublicationDetail(publication)),
    );
  });

  app.post("/api/media-publications/:id/incident", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const params = ReportMediaPublicationIncidentParams.parse({ id: c.req.param("id") });
    const body = ReportMediaPublicationIncidentBody.parse(await c.req.json());
    const publication = await reportMediaPublicationIncident(
      authUser,
      params.id,
      body.description,
    );

    return c.json(
      ReportMediaPublicationIncidentResponse.parse(
        serializeMediaPublicationDetail(publication),
      ),
    );
  });

  app.post("/api/media-publications/:id/transitions", requireAuth, async (c) => {
    const authUser = c.get("authUser")!;
    const params = TransitionMediaPublicationParams.parse({ id: c.req.param("id") });
    const body = TransitionMediaPublicationBody.parse(await c.req.json());
    const publication = await transitionMediaPublication(authUser, params.id, {
      action: body.action as MediaWorkflowAction,
      reason: body.reason,
    });

    return c.json(
      TransitionMediaPublicationResponse.parse(serializeMediaPublicationDetail(publication)),
    );
  });

  app.get("/api/app/admin/users", directorStaff, async (c) => {
    const query = ListAdminUsersQueryParams.parse(c.req.query());
    const result = await listAdminUsers({
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      search: query.search,
    });

    return c.json(
      ListAdminUsersResponse.parse({
        data: result.data.map(serializeAdminUser),
        pagination: result.pagination,
      }),
    );
  });

  app.post("/api/app/admin/users", directorStaff, async (c) => {
    const authUser = c.get("authUser")!;
    const body = CreateAdminUserBody.parse(await c.req.json());
    const user = await createAdminUser(authUser, body);
    return c.json(CreateAdminUserResponse.parse(serializeAdminUser(user)), 201);
  });

  app.patch("/api/app/admin/users/:id", directorStaff, async (c) => {
    const params = UpdateAdminUserParams.parse({ id: c.req.param("id") });
    const body = UpdateAdminUserBody.parse(await c.req.json());
    const user = await updateAdminUser(params.id, body);
    return c.json(UpdateAdminUserResponse.parse(serializeAdminUser(user)));
  });
}
