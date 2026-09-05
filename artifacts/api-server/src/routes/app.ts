import { Router, type IRouter } from "express";
import {
  GetAppDashboardResponse,
  GetAppEstablishmentByIdParams,
  GetAppEstablishmentByIdResponse,
  ListAppEstablishmentsQueryParams,
  ListAppEstablishmentsResponse,
} from "@workspace/api-zod";

import { notFound } from "../lib/errors";
import { requireAuth } from "../middleware/auth";
import { getAppDashboard } from "../repositories/dashboard";
import {
  getEstablishmentByIdForUser,
  listEstablishmentsForUser,
} from "../repositories/establishments";

const router: IRouter = Router();

router.get("/app/dashboard", requireAuth, async (req, res, next) => {
  try {
    const authUser = req.authUser;
    if (!authUser) {
      res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Authentification requise." },
      });
      return;
    }

    const dashboard = await getAppDashboard(authUser);
    const payload = GetAppDashboardResponse.parse({
      profile: {
        ...dashboard.profile,
        regionId: dashboard.profile.regionId ?? null,
        drenaId: dashboard.profile.drenaId ?? null,
        establishmentId: dashboard.profile.establishmentId ?? null,
      },
      kpis: dashboard.kpis,
    });
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/app/establishments", requireAuth, async (req, res, next) => {
  try {
    const authUser = req.authUser;
    if (!authUser) {
      res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Authentification requise." },
      });
      return;
    }

    const query = ListAppEstablishmentsQueryParams.parse(req.query);
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

    const payload = ListAppEstablishmentsResponse.parse({
      data: result.data.map((item) => ({
        ...item,
        ddena: item.ddena ?? null,
        department: item.department ?? null,
      })),
      pagination: result.pagination,
    });

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/app/establishments/:id", requireAuth, async (req, res, next) => {
  try {
    const authUser = req.authUser;
    if (!authUser) {
      res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Authentification requise." },
      });
      return;
    }

    const params = GetAppEstablishmentByIdParams.parse(req.params);
    const establishment = await getEstablishmentByIdForUser(authUser, params.id);

    if (!establishment) {
      throw notFound("Établissement introuvable.");
    }

    const payload = GetAppEstablishmentByIdResponse.parse({
      ...establishment,
      ddena: establishment.ddena ?? null,
      department: establishment.department ?? null,
      createdAt: establishment.createdAt.toISOString(),
      updatedAt: establishment.updatedAt.toISOString(),
    });

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
