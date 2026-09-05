import { Router, type IRouter } from "express";
import {
  CreateAdminUserBody,
  CreateAdminUserResponse,
  ListAdminUsersQueryParams,
  ListAdminUsersResponse,
  UpdateAdminUserBody,
  UpdateAdminUserParams,
  UpdateAdminUserResponse,
} from "@workspace/api-zod";

import { requireAuth, requireRole } from "../middleware/auth";
import {
  createAdminUser,
  getAdminUserById,
  listAdminUsers,
  updateAdminUser,
} from "../repositories/admin-users";

const router: IRouter = Router();

function serializeAdminUser(user: Awaited<ReturnType<typeof getAdminUserById>>) {
  if (!user) throw new Error("Utilisateur admin introuvable.");
  return {
    ...user,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

router.get(
  "/app/admin/users",
  requireAuth,
  requireRole("dvs_director", "dvs_staff"),
  async (req, res, next) => {
    try {
      const query = ListAdminUsersQueryParams.parse(req.query);
      const result = await listAdminUsers({
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 20,
        search: query.search,
      });

      const payload = ListAdminUsersResponse.parse({
        data: result.data.map(serializeAdminUser),
        pagination: result.pagination,
      });
      res.json(payload);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/app/admin/users",
  requireAuth,
  requireRole("dvs_director", "dvs_staff"),
  async (req, res, next) => {
    try {
      const body = CreateAdminUserBody.parse(req.body);
      const user = await createAdminUser(req.authUser!, body);
      const payload = CreateAdminUserResponse.parse(serializeAdminUser(user));
      res.status(201).json(payload);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/app/admin/users/:id",
  requireAuth,
  requireRole("dvs_director", "dvs_staff"),
  async (req, res, next) => {
    try {
      const params = UpdateAdminUserParams.parse(req.params);
      const body = UpdateAdminUserBody.parse(req.body);
      const user = await updateAdminUser(params.id, body);
      const payload = UpdateAdminUserResponse.parse(serializeAdminUser(user));
      res.json(payload);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
