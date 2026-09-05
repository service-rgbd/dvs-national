import { Router, type IRouter } from "express";
import {
  AuthMeResponse,
  AuthLoginBody,
  AuthLoginResponse,
} from "@workspace/api-zod";

import { unauthorized } from "../lib/errors";
import {
  clearSessionCookie,
  getClientIp,
  isLoginRateLimited,
  setSessionCookie,
} from "../lib/auth-cookies";
import { requireAuth } from "../middleware/auth";
import {
  createSession,
  deleteSessionByToken,
  findUserByEmail,
  getAuthenticatedUser,
  recordLoginEvent,
  updateLastLogin,
  verifyPassword,
} from "../repositories/auth";
import { SESSION_COOKIE_NAME } from "../config/auth";

const router: IRouter = Router();

router.post("/auth/login", async (req, res, next) => {
  try {
    const body = AuthLoginBody.parse(req.body);
    const ipAddress = getClientIp(req);
    const userAgent =
      typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : undefined;
    const rateLimitKey = `${ipAddress ?? "unknown"}:${body.email.trim().toLowerCase()}`;

    if (isLoginRateLimited(rateLimitKey)) {
      res.status(429).json({
        error: {
          code: "RATE_LIMITED",
          message: "Trop de tentatives. Réessayez dans quelques minutes.",
        },
      });
      return;
    }

    const user = await findUserByEmail(body.email);

    const invalidCredentials = () => {
      void recordLoginEvent({
        userId: user?.id,
        emailAttempted: body.email,
        success: false,
        ipAddress,
        userAgent,
      });
      throw unauthorized("Identifiants invalides.");
    };

    if (!user || user.status !== "active") {
      invalidCredentials();
      return;
    }

    const passwordValid = await verifyPassword(body.password, user.passwordHash);
    if (!passwordValid) {
      invalidCredentials();
      return;
    }

    const { token, expiresAt } = await createSession(user.id, { ipAddress, userAgent });
    await updateLastLogin(user.id);
    await recordLoginEvent({
      userId: user.id,
      emailAttempted: body.email,
      success: true,
      ipAddress,
      userAgent,
    });

    setSessionCookie(res, token, expiresAt);

    const authUser = await getAuthenticatedUser(user.id);
    if (!authUser) {
      throw unauthorized("Identifiants invalides.");
    }

    const payload = AuthLoginResponse.parse({ user: authUser });
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post("/auth/logout", async (req, res, next) => {
  try {
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    if (typeof token === "string" && token.length > 0) {
      await deleteSessionByToken(token);
    }
    clearSessionCookie(res);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/auth/me", requireAuth, async (req, res, next) => {
  try {
    const authUser = req.authUser;
    if (!authUser) {
      throw unauthorized();
    }

    const payload = AuthMeResponse.parse({ user: authUser });
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
