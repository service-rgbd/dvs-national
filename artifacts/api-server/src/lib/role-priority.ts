const ROLE_PRIORITY = [
  "dvs_director",
  "dvs_staff",
  "drena_manager",
  "school_head_primary",
  "school_head_secondary",
  "education_officer",
  "external_partner",
] as const;

export function getPrimaryRoleCode(roleCodes: string[]): string {
  for (const code of ROLE_PRIORITY) {
    if (roleCodes.includes(code)) return code;
  }
  return roleCodes[0] ?? "unknown";
}
