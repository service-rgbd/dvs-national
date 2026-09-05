import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db, roles, userRoles, users } from "@workspace/db";

/** Rôles CDC — alignés sur artifacts/education-portal/src/config/roles.ts */
const ROLE_DEFINITIONS = [
  {
    code: "dvs_director",
    label: "Directeur de la Vie Scolaire",
    description: "Administrateur principal — tous les accès",
  },
  {
    code: "dvs_staff",
    label: "Collaborateur DVS",
    description: "Administrateur secondaire — accès étendu limité par permissions",
  },
  {
    code: "drena_manager",
    label: "Responsable régional DREN",
    description: "Administrateur secondaire — périmètre régional",
  },
  {
    code: "school_head_primary",
    label: "Chef d'établissement primaire",
    description: "Utilisateur opérationnel établissement",
  },
  {
    code: "school_head_secondary",
    label: "Chef d'établissement secondaire",
    description: "Utilisateur opérationnel établissement",
  },
  {
    code: "education_officer",
    label: "Responsable éducatif",
    description: "Utilisateur opérationnel encadrement",
  },
  {
    code: "external_partner",
    label: "Partenaire externe",
    description: "Accès restreint et contrôlé",
  },
] as const;

async function seedRoles(): Promise<Map<string, string>> {
  const roleIds = new Map<string, string>();

  for (const definition of ROLE_DEFINITIONS) {
    const [existing] = await db
      .select()
      .from(roles)
      .where(eq(roles.code, definition.code))
      .limit(1);

    if (existing) {
      roleIds.set(definition.code, existing.id);
      continue;
    }

    const [created] = await db
      .insert(roles)
      .values({
        code: definition.code,
        label: definition.label,
        description: definition.description,
      })
      .returning({ id: roles.id });

    if (!created) {
      throw new Error(`Impossible de créer le rôle ${definition.code}.`);
    }

    roleIds.set(definition.code, created.id);
  }

  return roleIds;
}

async function bootstrapAdmin(roleIds: Map<string, string>): Promise<void> {
  const email = process.env.PNIGVS_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.PNIGVS_ADMIN_PASSWORD;
  const fullName = process.env.PNIGVS_ADMIN_FULL_NAME?.trim() || "Administrateur PNIGVS";

  if (!email || !password) {
    console.log("PNIGVS_ADMIN_EMAIL / PNIGVS_ADMIN_PASSWORD absents — compte admin non créé.");
    return;
  }

  if (password.length < 12) {
    throw new Error("PNIGVS_ADMIN_PASSWORD doit contenir au moins 12 caractères.");
  }

  const directorRoleId = roleIds.get("dvs_director");
  if (!directorRoleId) {
    throw new Error("Rôle dvs_director introuvable après seed.");
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const passwordHash = await bcrypt.hash(password, 12);

  let userId: string;

  if (existing) {
    await db
      .update(users)
      .set({
        passwordHash,
        fullName,
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id));
    userId = existing.id;
    console.log(`Compte admin mis à jour : ${email}`);
  } else {
    const [created] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        fullName,
        status: "active",
      })
      .returning({ id: users.id });

    if (!created) {
      throw new Error("Impossible de créer le compte admin.");
    }

    userId = created.id;
    console.log(`Compte admin créé : ${email}`);
  }

  const [existingRole] = await db
    .select()
    .from(userRoles)
    .where(eq(userRoles.userId, userId))
    .limit(1);

  if (!existingRole) {
    await db.insert(userRoles).values({
      userId,
      roleId: directorRoleId,
    });
    console.log("Rôle dvs_director attribué au compte admin.");
  }
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL doit être défini.");
  }

  console.log("=== Bootstrap auth PNIGVS ===");
  const roleIds = await seedRoles();
  console.log(`${roleIds.size} rôle(s) disponibles.`);
  await bootstrapAdmin(roleIds);
  console.log("Bootstrap terminé.");
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
