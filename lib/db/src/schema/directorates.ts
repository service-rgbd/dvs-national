import { index, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { directorateKindEnum } from './enums';
import { departments, regions } from './geo';

export const drena = pgTable(
  'drena',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    regionId: uuid('region_id')
      .notNull()
      .references(() => regions.id, { onDelete: 'restrict' }),
    code: varchar('code', { length: 64 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('drena_region_code_uidx').on(table.regionId, table.code),
    index('drena_name_idx').on(table.name),
    index('drena_region_id_idx').on(table.regionId),
  ],
);

export const ddena = pgTable(
  'ddena',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    regionId: uuid('region_id')
      .notNull()
      .references(() => regions.id, { onDelete: 'restrict' }),
    drenaId: uuid('drena_id').references(() => drena.id, { onDelete: 'set null' }),
    code: varchar('code', { length: 64 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    kind: directorateKindEnum('kind').notNull().default('ddena'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('ddena_region_code_uidx').on(table.regionId, table.code),
    index('ddena_drena_id_idx').on(table.drenaId),
    index('ddena_name_idx').on(table.name),
  ],
);

export const localities = pgTable(
  'localities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    regionId: uuid('region_id')
      .notNull()
      .references(() => regions.id, { onDelete: 'restrict' }),
    departmentId: uuid('department_id').references(() => departments.id, { onDelete: 'set null' }),
    drenaId: uuid('drena_id')
      .notNull()
      .references(() => drena.id, { onDelete: 'restrict' }),
    /** Libellé brut issu des fichiers officiels (ex. COCODY, COCODY ANGRE). */
    name: varchar('name', { length: 255 }).notNull(),
    /** Forme normalisée (pipeline import — étape 05). */
    normalizedName: varchar('normalized_name', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('localities_region_id_idx').on(table.regionId),
    index('localities_department_id_idx').on(table.departmentId),
    index('localities_drena_id_idx').on(table.drenaId),
    index('localities_name_idx').on(table.name),
    index('localities_normalized_name_idx').on(table.normalizedName),
  ],
);
