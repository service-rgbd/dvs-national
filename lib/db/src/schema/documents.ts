import { boolean, index, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    /** circulaire | rapport | fichier_scolaire | autre */
    category: varchar('category', { length: 64 }).notNull().default('autre'),
    storageKey: varchar('storage_key', { length: 512 }).notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 128 }).notNull(),
    sizeBytes: integer('size_bytes'),
    isPublic: boolean('is_public').notNull().default(false),
    uploadedBy: uuid('uploaded_by'),
    establishmentId: uuid('establishment_id'),
    drenaId: uuid('drena_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (table) => [
    index('documents_establishment_id_idx').on(table.establishmentId),
    index('documents_drena_id_idx').on(table.drenaId),
    index('documents_uploaded_by_idx').on(table.uploadedBy),
    index('documents_category_idx').on(table.category),
    index('documents_is_public_idx').on(table.isPublic),
  ],
);

export const reports = pgTable(
  'reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: varchar('type', { length: 64 }).notNull(),
    periodStart: timestamp('period_start', { withTimezone: true }),
    periodEnd: timestamp('period_end', { withTimezone: true }),
    regionId: uuid('region_id'),
    drenaId: uuid('drena_id'),
    establishmentId: uuid('establishment_id'),
    documentId: uuid('document_id').references(() => documents.id, { onDelete: 'set null' }),
    generatedBy: uuid('generated_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('reports_type_idx').on(table.type),
    index('reports_region_id_idx').on(table.regionId),
    index('reports_drena_id_idx').on(table.drenaId),
    index('reports_establishment_id_idx').on(table.establishmentId),
  ],
);
