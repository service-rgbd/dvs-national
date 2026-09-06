import { eq } from "drizzle-orm";

import { db, drena, establishments, roles, userRoles } from "@workspace/db";

import { getPrimaryRoleCode } from "../lib/role-priority";
import type { AuthenticatedUser } from "./auth";

export type UserScope = {
  primaryRoleCode: string;
  primaryRoleLabel: string;
  scopeLabel: string;
  roleCodes: string[];
  regionId?: string;
  drenaId?: string;
  drenaName?: string;
  drenaContactName?: string;
  drenaContactEmail?: string;
  establishmentId?: string;
};

const NATIONAL_ROLES = new Set(["dvs_director", "dvs_staff"]);

export function isNationalRole(roleCodes: string[]): boolean {
  return roleCodes.some((code) => NATIONAL_ROLES.has(code));
}

async function loadUserRoleRows(userId: string) {
  return db
    .select({
      roleCode: roles.code,
      roleLabel: roles.label,
      regionId: userRoles.regionId,
      drenaId: userRoles.drenaId,
      drenaName: drena.name,
      establishmentId: userRoles.establishmentId,
      establishmentName: establishments.name,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .leftJoin(drena, eq(userRoles.drenaId, drena.id))
    .leftJoin(establishments, eq(userRoles.establishmentId, establishments.id))
    .where(eq(userRoles.userId, userId));
}

export async function getUserScope(user: AuthenticatedUser): Promise<UserScope> {
  const roleRows = await loadUserRoleRows(user.id);
  const roleCodes = roleRows.map((row) => row.roleCode);
  const primaryRoleCode = getPrimaryRoleCode(roleCodes) ?? roleCodes[0] ?? "unknown";
  const primaryRow =
    roleRows.find((row) => row.roleCode === primaryRoleCode) ?? roleRows[0];

  const scopedRow =
    roleRows.find((row) => row.establishmentId) ??
    roleRows.find((row) => row.drenaId) ??
    roleRows.find((row) => row.regionId);

  let scopeLabel = "Périmètre national";
  let drenaId = scopedRow?.drenaId ?? undefined;
  let drenaName = scopedRow?.drenaName ?? undefined;

  if (scopedRow?.establishmentId) {
    scopeLabel = scopedRow.establishmentName ?? "Votre établissement";
    if (!drenaId) {
      const [fromSchool] = await db
        .select({ drenaId: establishments.drenaId, drenaName: drena.name })
        .from(establishments)
        .innerJoin(drena, eq(establishments.drenaId, drena.id))
        .where(eq(establishments.id, scopedRow.establishmentId))
        .limit(1);
      drenaId = fromSchool?.drenaId;
      drenaName = fromSchool?.drenaName ?? drenaName;
    }
  } else if (drenaName) {
    scopeLabel = drenaName;
  } else if (drenaId) {
    scopeLabel = "Périmètre DRENA";
  } else if (isNationalRole(roleCodes)) {
    scopeLabel = "Périmètre national";
  } else if (primaryRoleCode === "external_partner") {
    scopeLabel = "Accès partenaire restreint";
  }

  return {
    primaryRoleCode,
    primaryRoleLabel: primaryRow?.roleLabel ?? primaryRoleCode,
    scopeLabel,
    roleCodes,
    regionId: scopedRow?.regionId ?? undefined,
    drenaId,
    drenaName,
    establishmentId: scopedRow?.establishmentId ?? undefined,
  };
}
