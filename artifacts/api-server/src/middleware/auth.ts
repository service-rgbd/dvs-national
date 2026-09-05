import type { NextFunction, Request, Response } from "express";
import { withDbRetry } from "@workspace/db";

import { forbidden, unauthorized } from "../lib/errors";
import {
  getAuthenticatedUser,
  getSessionByToken,
  touchSession,
  userHasAnyRole,
  type AuthenticatedUser,
} from "../repositories/auth";
import { SESSION_COOKIE_NAME } from "../config/auth";

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser;
      sessionId?: string;
    }
  }
}

function readSessionToken(req: Request): string | null {
  const cookieToken = req.cookies?.[SESSION_COOKIE_NAME];
  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken;
  }
  return null;
}

export async function loadAuthSession(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = readSessionToken(req);
    if (!token) {
      next();
      return;
    }

    const sessionRow = await withDbRetry(() => getSessionByToken(token));
    if (!sessionRow) {
      next();
      return;
    }

    const authUser = await withDbRetry(() => getAuthenticatedUser(sessionRow.user.id));
    if (!authUser || authUser.status !== "active") {
      next();
      return;
    }

    req.authUser = authUser;
    req.sessionId = sessionRow.session.id;
    void touchSession(sessionRow.session.id);
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.authUser) {
    next(unauthorized());
    return;
  }
  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      next(unauthorized());
      return;
    }

    if (!userHasAnyRole(req.authUser, allowedRoles)) {
      next(forbidden("Votre profil ne dispose pas des droits nécessaires."));
      return;
    }

    next();
  };
}
