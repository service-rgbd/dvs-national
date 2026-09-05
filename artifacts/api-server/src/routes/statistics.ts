import { Router, type IRouter } from "express";
import {
  GenerateReportBody,
  GenerateReportResponse,
  GetAppStatisticsResponse,
  GetPublicStatisticsResponse,
  ListReportsQueryParams,
  ListReportsResponse,
} from "@workspace/api-zod";

import { requireAuth, requireRole } from "../middleware/auth";
import { generateReport, listReports } from "../repositories/reports";
import { getAppStatistics, getPublicStatistics } from "../repositories/statistics";

const router: IRouter = Router();

router.get("/statistics/public", async (_req, res, next) => {
  try {
    const stats = await getPublicStatistics();
    const payload = GetPublicStatisticsResponse.parse({
      establishments: stats.establishments,
      establishmentsActive: stats.establishmentsActive,
      updatedAt: stats.updatedAt.toISOString(),
    });
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/app/statistics", requireAuth, requireRole("dvs_director", "dvs_staff"), async (req, res, next) => {
  try {
    const stats = await getAppStatistics(req.authUser!);
    const payload = GetAppStatisticsResponse.parse({
      kpis: stats.kpis,
      requestsByStatus: stats.requestsByStatus,
      activitiesByType: stats.activitiesByType,
    });
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/app/reports", requireAuth, requireRole("dvs_director", "dvs_staff"), async (req, res, next) => {
  try {
    const query = ListReportsQueryParams.parse(req.query);
    const result = await listReports(req.authUser!, {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    });

    const payload = ListReportsResponse.parse({
      data: result.data.map((item) => ({
        ...item,
        periodStart: item.periodStart?.toISOString() ?? null,
        periodEnd: item.periodEnd?.toISOString() ?? null,
        createdAt: item.createdAt.toISOString(),
      })),
      pagination: result.pagination,
    });

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/app/reports/generate",
  requireAuth,
  requireRole("dvs_director", "dvs_staff"),
  async (req, res, next) => {
    try {
      const body = GenerateReportBody.parse(req.body);
      const report = await generateReport(req.authUser!, body.type);
      const payload = GenerateReportResponse.parse({
        ...report,
        periodStart: report.periodStart?.toISOString() ?? null,
        periodEnd: report.periodEnd?.toISOString() ?? null,
        createdAt: report.createdAt.toISOString(),
      });
      res.status(201).json(payload);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
