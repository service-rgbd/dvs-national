import { Hono } from "hono";
import { cors } from "hono/cors";
import { ZodError } from "zod";
import { isTransientDbError } from "@workspace/db";
import {
  GetEstablishmentByIdParams,
  GetEstablishmentByIdResponse,
  GetPublicMediaPublicationByIdParams,
  GetPublicMediaPublicationByIdResponse,
  HealthCheckResponse,
  ListActivitiesResponse,
  ListEstablishmentsQueryParams,
  ListEstablishmentsResponse,
  ListPublicActivitiesQueryParams,
  ListPublicDocumentsQueryParams,
  ListPublicDocumentsResponse,
  ListPublicMediaPublicationsQueryParams,
  ListPublicMediaPublicationsResponse,
  GetPublicStatisticsResponse,
} from "@workspace/api-zod";

import { setWorkerDatabaseUrl } from "@workspace/db";

import { registerAuthenticatedRoutes } from "./hono/authenticated-routes";
import { loadAuthSession } from "./hono/auth-middleware";
import { registerAuthRoutes } from "./hono/auth-routes";
import { type AuthVariables, type WorkerEnv } from "./hono/types";
import { ApiError, notFound, serviceUnavailable } from "./lib/errors";
import {
  serializeActivity,
  serializeMediaPublicationDetail,
  serializeMediaPublicationSummary,
} from "./lib/serializers";
import { listPublicActivities } from "./repositories/activities";
import {
  listPublicDocuments,
  serializeDocumentSummary,
} from "./repositories/documents";
import {
  getEstablishmentById,
  listEstablishments,
} from "./repositories/establishments";
import {
  getPublicMediaPublicationById,
  listPublicMediaPublications,
} from "./repositories/media-publications";
import { getPublicStatistics } from "./repositories/statistics";

export const app = new Hono<{ Bindings: WorkerEnv; Variables: AuthVariables }>();

app.use("*", async (c, next) => {
  setWorkerDatabaseUrl(c.env.DATABASE_URL);
  await next();
});

app.use("*", (c, next) => {
  const origins = (c.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return cors({
    origin: origins.length > 0 ? origins : "*",
    credentials: true,
  })(c, next);
});

app.use("/api/*", loadAuthSession);

app.get("/api/healthz", (c) =>
  c.json(HealthCheckResponse.parse({ status: "ok" })),
);

app.get("/api/establishments", async (c) => {
  const query = ListEstablishmentsQueryParams.parse(c.req.query());
  const result = await listEstablishments({
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
    ListEstablishmentsResponse.parse({
      data: result.data.map((item) => ({
        ...item,
        ddena: item.ddena ?? null,
        department: item.department ?? null,
      })),
      pagination: result.pagination,
    }),
  );
});

app.get("/api/establishments/:id", async (c) => {
  const params = GetEstablishmentByIdParams.parse({ id: c.req.param("id") });
  const establishment = await getEstablishmentById(params.id);
  if (!establishment) {
    throw notFound("Établissement introuvable.");
  }

  return c.json(
    GetEstablishmentByIdResponse.parse({
      ...establishment,
      ddena: establishment.ddena ?? null,
      department: establishment.department ?? null,
      createdAt: establishment.createdAt.toISOString(),
      updatedAt: establishment.updatedAt.toISOString(),
    }),
  );
});

app.get("/api/statistics/public", async (c) => {
  const stats = await getPublicStatistics();
  return c.json(
    GetPublicStatisticsResponse.parse({
      establishments: stats.establishments,
      establishmentsActive: stats.establishmentsActive,
      updatedAt: stats.updatedAt.toISOString(),
    }),
  );
});

app.get("/api/activities/public", async (c) => {
  const query = ListPublicActivitiesQueryParams.parse(c.req.query());
  const result = await listPublicActivities({
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 20,
    type: query.activityType,
    establishmentId: query.establishmentId,
  });

  return c.json(
    ListActivitiesResponse.parse({
      data: result.data.map(serializeActivity),
      pagination: result.pagination,
    }),
  );
});

app.get("/api/media-publications/public", async (c) => {
  const query = ListPublicMediaPublicationsQueryParams.parse(c.req.query());
  const result = await listPublicMediaPublications({
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 20,
    mediaType: query.mediaType,
    activityType: query.activityType,
    schoolLevel: query.schoolLevel,
    establishmentId: query.establishmentId,
  });

  return c.json(
    ListPublicMediaPublicationsResponse.parse({
      data: result.data.map(serializeMediaPublicationSummary),
      pagination: result.pagination,
    }),
  );
});

app.get("/api/media-publications/public/:id", async (c) => {
  const params = GetPublicMediaPublicationByIdParams.parse({ id: c.req.param("id") });
  const publication = await getPublicMediaPublicationById(params.id);
  return c.json(
    GetPublicMediaPublicationByIdResponse.parse(serializeMediaPublicationDetail(publication)),
  );
});

app.get("/api/documents/public", async (c) => {
  const query = ListPublicDocumentsQueryParams.parse(c.req.query());
  const result = await listPublicDocuments({
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 20,
    category: query.category,
  });

  return c.json(
    ListPublicDocumentsResponse.parse({
      data: result.data.map(serializeDocumentSummary),
      pagination: result.pagination,
    }),
  );
});

registerAuthRoutes(app);
registerAuthenticatedRoutes(app);

app.onError((error, c) => {
  console.error("[api-worker]", error);

  if (error instanceof ZodError) {
    const message = error.issues.map((issue) => issue.message).join("; ");
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: message || "Paramètres invalides.",
        },
      },
      400,
    );
  }

  if (error instanceof ApiError) {
    return c.json(
      {
        error: {
          code: error.code,
          message: error.message,
        },
      },
      error.statusCode,
    );
  }

  if (isTransientDbError(error)) {
    const unavailable = serviceUnavailable();
    return c.json(
      {
        error: {
          code: unavailable.code,
          message: unavailable.message,
        },
      },
      unavailable.statusCode,
    );
  }

  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur.",
      },
    },
    500,
  );
});
