import { and, eq } from "drizzle-orm";

import { db, establishments } from "@workspace/db";

import { badRequest, forbidden, notFound } from "../lib/errors";
import { isNationalRole, type UserScope } from "./user-scope";

export async function assertEstablishmentInScope(
  scope: UserScope,
  establishmentId: string,
): Promise<{ id: string; name: string; drenaId: string }> {
  const [establishment] = await db
    .select({
      id: establishments.id,
      name: establishments.name,
      drenaId: establishments.drenaId,
      regionId: establishments.regionId,
    })
    .from(establishments)
    .where(eq(establishments.id, establishmentId))
    .limit(1);

  if (!establishment) {
    throw notFound("Établissement introuvable.");
  }

  if (isNationalRole(scope.roleCodes)) {
    return establishment;
  }

  if (scope.establishmentId && scope.establishmentId !== establishment.id) {
    throw forbidden("Cet établissement est hors de votre périmètre.");
  }

  if (scope.drenaId && scope.drenaId !== establishment.drenaId) {
    throw forbidden("Cet établissement est hors de votre périmètre DRENA.");
  }

  if (scope.regionId && scope.regionId !== establishment.regionId) {
    throw forbidden("Cet établissement est hors de votre périmètre régional.");
  }

  if (!scope.establishmentId && !scope.drenaId && !scope.regionId) {
    throw forbidden("Aucun périmètre géographique n'est associé à votre compte.");
  }

  return establishment;
}

export function resolveEstablishmentIdForCreate(
  scope: UserScope,
  requestedEstablishmentId?: string,
): string {
  if (scope.establishmentId) {
    if (requestedEstablishmentId && requestedEstablishmentId !== scope.establishmentId) {
      throw forbidden("Vous ne pouvez créer des dossiers que pour votre établissement.");
    }
    return scope.establishmentId;
  }

  if (!requestedEstablishmentId) {
    throw badRequest("L'identifiant de l'établissement est requis.");
  }

  return requestedEstablishmentId;
}
