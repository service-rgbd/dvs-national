export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function notFound(message = "Ressource introuvable"): ApiError {
  return new ApiError(404, "NOT_FOUND", message);
}

export function badRequest(message: string, code = "VALIDATION_ERROR"): ApiError {
  return new ApiError(400, code, message);
}

export function unauthorized(message = "Authentification requise."): ApiError {
  return new ApiError(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "Accès refusé."): ApiError {
  return new ApiError(403, "FORBIDDEN", message);
}

export function serviceUnavailable(
  message = "Le service met du temps à répondre. Réessayez dans quelques secondes.",
): ApiError {
  return new ApiError(503, "DATABASE_UNAVAILABLE", message);
}
