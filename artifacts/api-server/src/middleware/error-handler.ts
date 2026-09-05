import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { isTransientDbError } from "@workspace/db";

import { ApiError, serviceUnavailable } from "../lib/errors";
import { logger } from "../lib/logger";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    const message = err.issues.map((issue) => issue.message).join("; ");
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: message || "Paramètres invalides.",
      },
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  if (isTransientDbError(err)) {
    const unavailable = serviceUnavailable();
    logger.warn({ err }, "Transient database error");
    res.status(unavailable.statusCode).json({
      error: {
        code: unavailable.code,
        message: unavailable.message,
      },
    });
    return;
  }

  logger.error({ err }, "Unhandled API error");
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Erreur interne du serveur.",
    },
  });
};
