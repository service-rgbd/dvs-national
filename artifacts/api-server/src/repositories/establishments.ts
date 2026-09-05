import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
  type SQL,
} from "drizzle-orm";

import {
  db,
  ddena,
  departments,
  drena,
  establishments,
  localities,
  regions,
} from "@workspace/db";

import type { AuthenticatedUser } from "./auth";
import { assertEstablishmentInScope } from "./establishment-access";
import { getUserScope, isNationalRole, type UserScope } from "./user-scope";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

export type ListEstablishmentsInput = {
  page: number;
  pageSize: number;
  search?: string;
  region?: string;
  drena?: string;
  ddena?: string;
  department?: string;
  locality?: string;
  type?: string;
  status?: "active" | "inactive" | "pending" | "archived";
  sort: "name" | "establishmentCode" | "listNumber" | "createdAt" | "updatedAt";
  order: "asc" | "desc";
};

export type EstablishmentGeoRef = {
  id: string;
  code?: string;
  name: string;
};

export type EstablishmentLocalityRef = {
  id: string;
  name: string;
};

export type EstablishmentSummary = {
  id: string;
  establishmentCode: string;
  name: string;
  teachingOrder: string | null;
  authorizedCycle: string | null;
  recognizedCycle: string | null;
  email: string | null;
  contacts: string | null;
  status: string;
  listNumber: number | null;
  region: EstablishmentGeoRef;
  drena: EstablishmentGeoRef;
  ddena: EstablishmentGeoRef | null;
  department: EstablishmentGeoRef | null;
  locality: EstablishmentLocalityRef;
};

export type EstablishmentDetail = EstablishmentSummary & {
  sourceFile: string | null;
  sourceSheet: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function likeTerm(value: string): string {
  return `%${value.trim()}%`;
}

function matchCodeOrName(
  codeColumn: typeof regions.code,
  nameColumn: typeof regions.name,
  value: string,
): SQL {
  const term = likeTerm(value);
  return or(ilike(codeColumn, term), ilike(nameColumn, term))!;
}

function buildFilters(input: ListEstablishmentsInput): SQL[] {
  const filters: SQL[] = [];

  if (input.search?.trim()) {
    const term = likeTerm(input.search);
    filters.push(
      or(
        ilike(establishments.name, term),
        ilike(establishments.establishmentCode, term),
        ilike(localities.name, term),
        ilike(regions.name, term),
        ilike(regions.code, term),
        ilike(drena.name, term),
        ilike(drena.code, term),
      )!,
    );
  }

  if (input.region) {
    filters.push(
      isUuid(input.region)
        ? eq(regions.id, input.region)
        : matchCodeOrName(regions.code, regions.name, input.region),
    );
  }

  if (input.drena) {
    filters.push(
      isUuid(input.drena)
        ? eq(drena.id, input.drena)
        : matchCodeOrName(drena.code, drena.name, input.drena),
    );
  }

  if (input.ddena) {
    filters.push(
      isUuid(input.ddena)
        ? eq(ddena.id, input.ddena)
        : matchCodeOrName(ddena.code, ddena.name, input.ddena),
    );
  }

  if (input.department) {
    filters.push(
      isUuid(input.department)
        ? eq(departments.id, input.department)
        : matchCodeOrName(departments.code, departments.name, input.department),
    );
  }

  if (input.locality) {
    filters.push(
      isUuid(input.locality)
        ? eq(localities.id, input.locality)
        : ilike(localities.name, likeTerm(input.locality)),
    );
  }

  if (input.type) {
    filters.push(ilike(establishments.teachingOrder, likeTerm(input.type)));
  }

  if (input.status) {
    filters.push(eq(establishments.status, input.status));
  }

  return filters;
}

const NO_ACCESS_ESTABLISHMENT_ID = "00000000-0000-0000-0000-000000000000";

function establishmentScopeCondition(scope: UserScope): SQL | undefined {
  if (scope.establishmentId) return eq(establishments.id, scope.establishmentId);
  if (scope.drenaId) return eq(establishments.drenaId, scope.drenaId);
  if (scope.regionId) return eq(establishments.regionId, scope.regionId);
  if (isNationalRole(scope.roleCodes)) return undefined;
  return eq(establishments.id, NO_ACCESS_ESTABLISHMENT_ID);
}

function withScopeFilters(filters: SQL[], scope?: UserScope): SQL[] {
  if (!scope) return filters;
  const scopeCondition = establishmentScopeCondition(scope);
  if (scopeCondition) return [...filters, scopeCondition];
  if (!isNationalRole(scope.roleCodes)) {
    return [...filters, eq(establishments.id, NO_ACCESS_ESTABLISHMENT_ID)];
  }
  return filters;
}

function sortColumn(sort: ListEstablishmentsInput["sort"]) {
  switch (sort) {
    case "establishmentCode":
      return establishments.establishmentCode;
    case "listNumber":
      return establishments.listNumber;
    case "createdAt":
      return establishments.createdAt;
    case "updatedAt":
      return establishments.updatedAt;
    default:
      return establishments.name;
  }
}

function mapRow(row: {
  establishment: typeof establishments.$inferSelect;
  region: typeof regions.$inferSelect;
  drena: typeof drena.$inferSelect;
  ddena: typeof ddena.$inferSelect | null;
  department: typeof departments.$inferSelect | null;
  locality: typeof localities.$inferSelect;
}): EstablishmentSummary {
  return {
    id: row.establishment.id,
    establishmentCode: row.establishment.establishmentCode,
    name: row.establishment.name,
    teachingOrder: row.establishment.teachingOrder,
    authorizedCycle: row.establishment.authorizedCycle,
    recognizedCycle: row.establishment.recognizedCycle,
    email: row.establishment.email,
    contacts: row.establishment.contacts,
    status: row.establishment.status,
    listNumber: row.establishment.listNumber,
    region: {
      id: row.region.id,
      code: row.region.code,
      name: row.region.name,
    },
    drena: {
      id: row.drena.id,
      code: row.drena.code,
      name: row.drena.name,
    },
    ddena: row.ddena
      ? {
          id: row.ddena.id,
          code: row.ddena.code,
          name: row.ddena.name,
        }
      : null,
    department: row.department
      ? {
          id: row.department.id,
          code: row.department.code ?? undefined,
          name: row.department.name,
        }
      : null,
    locality: {
      id: row.locality.id,
      name: row.locality.name,
    },
  };
}

export async function listEstablishments(input: ListEstablishmentsInput, scope?: UserScope) {
  const whereClause = and(...withScopeFilters(buildFilters(input), scope));
  const orderFn = input.order === "desc" ? desc : asc;
  const offset = (input.page - 1) * input.pageSize;

  const baseQuery = db
    .select({
      establishment: establishments,
      region: regions,
      drena: drena,
      ddena: ddena,
      department: departments,
      locality: localities,
    })
    .from(establishments)
    .innerJoin(regions, eq(establishments.regionId, regions.id))
    .innerJoin(drena, eq(establishments.drenaId, drena.id))
    .leftJoin(ddena, eq(establishments.ddenaId, ddena.id))
    .leftJoin(departments, eq(establishments.departmentId, departments.id))
    .innerJoin(localities, eq(establishments.localityId, localities.id))
    .$dynamic();

  const filteredQuery = whereClause ? baseQuery.where(whereClause) : baseQuery;

  const [totalRow] = await db
    .select({ total: count() })
    .from(establishments)
    .innerJoin(regions, eq(establishments.regionId, regions.id))
    .innerJoin(drena, eq(establishments.drenaId, drena.id))
    .leftJoin(ddena, eq(establishments.ddenaId, ddena.id))
    .leftJoin(departments, eq(establishments.departmentId, departments.id))
    .innerJoin(localities, eq(establishments.localityId, localities.id))
    .where(whereClause ?? undefined);

  const total = totalRow?.total ?? 0;

  const rows = await filteredQuery
    .orderBy(orderFn(sortColumn(input.sort)), orderFn(establishments.id))
    .limit(input.pageSize)
    .offset(offset);

  return {
    data: rows.map(mapRow),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / input.pageSize),
    },
  };
}

export async function listEstablishmentsForUser(
  user: AuthenticatedUser,
  input: ListEstablishmentsInput,
) {
  const scope = await getUserScope(user);
  return listEstablishments(input, scope);
}

export async function getEstablishmentById(id: string): Promise<EstablishmentDetail | null> {
  const rows = await db
    .select({
      establishment: establishments,
      region: regions,
      drena: drena,
      ddena: ddena,
      department: departments,
      locality: localities,
    })
    .from(establishments)
    .innerJoin(regions, eq(establishments.regionId, regions.id))
    .innerJoin(drena, eq(establishments.drenaId, drena.id))
    .leftJoin(ddena, eq(establishments.ddenaId, ddena.id))
    .leftJoin(departments, eq(establishments.departmentId, departments.id))
    .innerJoin(localities, eq(establishments.localityId, localities.id))
    .where(eq(establishments.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const summary = mapRow(row);
  return {
    ...summary,
    sourceFile: row.establishment.sourceFile,
    sourceSheet: row.establishment.sourceSheet,
    createdAt: row.establishment.createdAt,
    updatedAt: row.establishment.updatedAt,
  };
}

export async function getEstablishmentByIdForUser(
  user: AuthenticatedUser,
  id: string,
): Promise<EstablishmentDetail | null> {
  const establishment = await getEstablishmentById(id);
  if (!establishment) return null;

  const scope = await getUserScope(user);
  await assertEstablishmentInScope(scope, establishment.id);
  return establishment;
}
