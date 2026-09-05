import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const apiTarget = path.resolve(root, "api-zod/src/generated/api.ts");
let content = fs.readFileSync(apiTarget, "utf8");
content = content.replace(/zod\.uuid\(\)/g, "zod.string().uuid()");
content = content.replace(/zod\.int\(\)/g, "zod.number().int()");
content = content.replace(/zod\.email\(\)/g, "zod.string().email()");
fs.writeFileSync(apiTarget, content);

const indexTarget = path.resolve(root, "api-zod/src/index.ts");
const indexContent = `export * from "./generated/api";
export type {
  ApiError,
  ApiErrorError,
  AppDashboardKpis,
  AppDashboardProfile,
  AppDashboardResponse,
  AuthRole,
  AuthUser,
  AuthUserStatus,
  DdenaParamParameter,
  DepartmentParamParameter,
  DrenaParamParameter,
  EstablishmentDetail,
  EstablishmentListResponse,
  EstablishmentSummary,
  GeoRef,
  HealthStatus,
  ListEstablishmentsParams,
  LocalityParamParameter,
  LocalityRef,
  OrderParamParameter,
  PageParamParameter,
  PageSizeParamParameter,
  PaginationMeta,
  RegionParamParameter,
  SearchParamParameter,
  SortParamParameter,
  StatusParamParameter,
  TypeParamParameter,
} from "./generated/types";
`;
fs.writeFileSync(indexTarget, indexContent);

console.log("Patched generated Zod schemas for Zod v3 compatibility.");
