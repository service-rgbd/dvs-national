import { index, integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { ddena, drena, localities } from './directorates';
import { departments, regions } from './geo';
import { establishmentStatusEnum } from './enums';

/**
 * Référentiel national des établissements scolaires.
 *
 * Colonnes alignées sur les fichiers Excel DRENA (9 colonnes) :
 * Ordre d'enseignement, N°, Localité, Code Étab., Établissement,
 * Cycle autorisé, Cycle reconnu, E-mail, Contacts.
 *
 * Le code établissement est une chaîne à 6 caractères (zéros significatifs).
 * Il n'est PAS unique globalement (doublon connu : 000218).
 */
export const establishments = pgTable(
  'establishments',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    regionId: uuid('region_id')
      .notNull()
      .references(() => regions.id, { onDelete: 'restrict' }),
    drenaId: uuid('drena_id')
      .notNull()
      .references(() => drena.id, { onDelete: 'restrict' }),
    ddenaId: uuid('ddena_id').references(() => ddena.id, { onDelete: 'set null' }),
    departmentId: uuid('department_id').references(() => departments.id, { onDelete: 'set null' }),
    localityId: uuid('locality_id')
      .notNull()
      .references(() => localities.id, { onDelete: 'restrict' }),

    /** Code Étab. — varchar(6), zéros préservés. Non unique (cf. 000218). */
    establishmentCode: varchar('establishment_code', { length: 6 }).notNull(),
    /** N° de ligne dans l'export Excel source. */
    listNumber: integer('list_number'),
    name: varchar('name', { length: 500 }).notNull(),

    /** Ordre d'enseignement (LAIC, CATHOLIQUE, ISLAMIQUE, …). */
    teachingOrder: varchar('teaching_order', { length: 50 }),
    /** Cycle autorisé (ex. 1, 1 & 2). */
    authorizedCycle: varchar('authorized_cycle', { length: 20 }),
    /** Cycle reconnu (ex. 1, 1 & 2). */
    recognizedCycle: varchar('recognized_cycle', { length: 20 }),

    email: varchar('email', { length: 255 }),
    contacts: varchar('contacts', { length: 255 }),

    status: establishmentStatusEnum('status').notNull().default('active'),

    /** Traçabilité import (étape 05). */
    sourceFile: varchar('source_file', { length: 255 }),
    sourceSheet: varchar('source_sheet', { length: 255 }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('establishments_code_idx').on(table.establishmentCode),
    index('establishments_name_idx').on(table.name),
    index('establishments_region_id_idx').on(table.regionId),
    index('establishments_drena_id_idx').on(table.drenaId),
    index('establishments_ddena_id_idx').on(table.ddenaId),
    index('establishments_department_id_idx').on(table.departmentId),
    index('establishments_locality_id_idx').on(table.localityId),
    index('establishments_status_idx').on(table.status),
    index('establishments_teaching_order_idx').on(table.teachingOrder),
    index('establishments_authorized_cycle_idx').on(table.authorizedCycle),
    index('establishments_recognized_cycle_idx').on(table.recognizedCycle),
    index('establishments_drena_code_idx').on(table.drenaId, table.establishmentCode),
    index('establishments_list_number_idx').on(table.listNumber),
  ],
);
