import { Router, type IRouter } from "express";
import {
  GetEstablishmentByIdParams,
  GetEstablishmentByIdResponse,
  ListEstablishmentsQueryParams,
  ListEstablishmentsResponse,
} from "@workspace/api-zod";

import { notFound } from "../lib/errors";
import {
  getEstablishmentById,
  listEstablishments,
} from "../repositories/establishments";

const router: IRouter = Router();

router.get("/establishments", async (req, res, next) => {
  try {
    const query = ListEstablishmentsQueryParams.parse(req.query);
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

    const payload = ListEstablishmentsResponse.parse({
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

router.get("/establishments/:id", async (req, res, next) => {
  try {
    const params = GetEstablishmentByIdParams.parse(req.params);
    const establishment = await getEstablishmentById(params.id);

    if (!establishment) {
      throw notFound("Établissement introuvable.");
    }

    const payload = GetEstablishmentByIdResponse.parse({
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
