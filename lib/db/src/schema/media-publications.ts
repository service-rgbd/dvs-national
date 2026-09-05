import { boolean, index, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { activities } from './workflow';
import { establishments } from './establishments';
import { mediaPublicationStatusEnum, mediaTypeEnum } from './enums';
import { requests } from './workflow';

/** Dossier de publication média lié à une activité autorisée. */
export const mediaPublications = pgTable(
  'media_publications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    establishmentId: uuid('establishment_id')
      .notNull()
      .references(() => establishments.id, { onDelete: 'restrict' }),
    activityId: uuid('activity_id')
      .notNull()
      .references(() => activities.id, { onDelete: 'restrict' }),
    requestId: uuid('request_id').references(() => requests.id, { onDelete: 'set null' }),
    status: mediaPublicationStatusEnum('status').notNull().default('draft'),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    decisionReason: text('decision_reason'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    incidentReported: boolean('incident_reported').notNull().default(false),
    incidentDescription: text('incident_description'),
    incidentReportedAt: timestamp('incident_reported_at', { withTimezone: true }),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('media_publications_establishment_id_idx').on(table.establishmentId),
    index('media_publications_activity_id_idx').on(table.activityId),
    index('media_publications_status_idx').on(table.status),
    index('media_publications_published_at_idx').on(table.publishedAt),
  ],
);

/** Fichiers photo/vidéo rattachés à un dossier de publication. */
export const mediaPublicationFiles = pgTable(
  'media_publication_files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    publicationId: uuid('publication_id')
      .notNull()
      .references(() => mediaPublications.id, { onDelete: 'cascade' }),
    mediaType: mediaTypeEnum('media_type').notNull(),
    storageKey: varchar('storage_key', { length: 512 }).notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 128 }).notNull(),
    sizeBytes: integer('size_bytes'),
    caption: text('caption'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('media_publication_files_publication_id_idx').on(table.publicationId),
    index('media_publication_files_media_type_idx').on(table.mediaType),
  ],
);

/** Historique des transitions de statut d'une publication média. */
export const mediaPublicationStatusHistory = pgTable(
  'media_publication_status_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    publicationId: uuid('publication_id')
      .notNull()
      .references(() => mediaPublications.id, { onDelete: 'cascade' }),
    previousStatus: mediaPublicationStatusEnum('previous_status'),
    newStatus: mediaPublicationStatusEnum('new_status').notNull(),
    changedBy: uuid('changed_by'),
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('media_publication_status_history_publication_id_idx').on(table.publicationId),
    index('media_publication_status_history_created_at_idx').on(table.createdAt),
  ],
);
