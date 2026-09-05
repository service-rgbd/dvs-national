import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db, establishments, roles, userRoles, users } from "@workspace/db";

const DEMO_PASSWORD = "DemoPNIGVS2026!";

const DEMO_USERS = [
  { email: "staff.dev@dvs.ci", fullName: "Collaborateur DVS (demo)", role: "dvs_staff" },
  { email: "drena.dev@dvs.ci", fullName: "Responsable DREN (demo)", role: "drena_manager" },
  {
    email: "ecole.dev@dvs.ci",
    fullName: "Chef d'établissement (demo)",
    role: "school_head_secondary",
  },
  {
    email: "encadrement.dev@dvs.ci",
    fullName: "Responsable éducatif (demo)",
    role: "education_officer",
  },
  { email: "partenaire.dev@dvs.ci", fullName: "Partenaire externe (demo)", role: "external_partner" },
] as const;

async function main(): Promise<void> {
  const [sampleEstablishment] = await db.select().from(establishments).limit(1);
  if (!sampleEstablishment) {
    throw new Error("Aucun établissement en base — lancer l'import établissements d'abord.");
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  for (const demo of DEMO_USERS) {
    const [role] = await db.select().from(roles).where(eq(roles.code, demo.role)).limit(1);
    if (!role) {
      throw new Error(`Rôle introuvable : ${demo.role}`);
    }

    const [existing] = await db.select().from(users).where(eq(users.email, demo.email)).limit(1);

    let userId: string;
    if (existing) {
      await db
        .update(users)
        .set({ passwordHash, fullName: demo.fullName, status: "active", updatedAt: new Date() })
        .where(eq(users.id, existing.id));
      userId = existing.id;
    } else {
      const [created] = await db
        .insert(users)
        .values({
          email: demo.email,
          passwordHash,
          fullName: demo.fullName,
          status: "active",
        })
        .returning({ id: users.id });
      if (!created) throw new Error(`Impossible de créer ${demo.email}`);
      userId = created.id;
    }

    await db.delete(userRoles).where(eq(userRoles.userId, userId));

    await db.insert(userRoles).values({
      userId,
      roleId: role.id,
      drenaId:
        demo.role === "drena_manager" || demo.role.startsWith("school_") || demo.role === "education_officer"
          ? sampleEstablishment.drenaId
          : null,
      establishmentId:
        demo.role.startsWith("school_") || demo.role === "education_officer"
          ? sampleEstablishment.id
          : null,
    });

    console.log(`OK ${demo.email} (${demo.role})`);
  }

  console.log(`\nMot de passe commun demo : ${DEMO_PASSWORD}`);
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
