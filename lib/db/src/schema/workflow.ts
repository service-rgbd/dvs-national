import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { establishments } from './establishments';
import { requestStatusEnum } from './enums';

/** Activités scolaires — implémentation métier étape 10. */
export const activities = pgTable(
  'activities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    establishmentId: uuid('establishment_id')
      .notNull()
      .references(() => establishments.id, { onDelete: 'restrict' }),
    type: varchar('type', { length: 64 }).notNull(),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    location: varchar('location', { length: 500 }),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('activities_establishment_id_idx').on(table.establishmentId),
    index('activities_type_idx').on(table.type),
    index('activities_scheduled_at_idx').on(table.scheduledAt),
  ],
);

/** Demandes d'autorisation — workflow Établissement → DREN → DVS. */
export const requests = pgTable(
  'requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    establishmentId: uuid('establishment_id')
      .notNull()
      .references(() => establishments.id, { onDelete: 'restrict' }),
    activityId: uuid('activity_id').references(() => activities.id, { onDelete: 'set null' }),
    status: requestStatusEnum('status').notNull().default('draft'),
    description: text('description'),
    decisionReason: text('decision_reason'),
    /** Checklist établissement (entretien Voyage Découverte, formulaire DVS, …). */
    checklist: jsonb('checklist').notNull().default({}),
    /** Contrôles internes DVS (prospection, TDR, certificat formation). */
    dvsValidation: jsonb('dvs_validation').notNull().default({}),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('requests_establishment_id_idx').on(table.establishmentId),
    index('requests_activity_id_idx').on(table.activityId),
    index('requests_status_idx').on(table.status),
    index('requests_submitted_at_idx').on(table.submittedAt),
  ],
);

/** Historique des transitions de statut d'une demande. */
export const requestStatusHistory = pgTable(
  'request_status_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    requestId: uuid('request_id')
      .notNull()
      .references(() => requests.id, { onDelete: 'cascade' }),
    previousStatus: requestStatusEnum('previous_status'),
    newStatus: requestStatusEnum('new_status').notNull(),
    changedBy: uuid('changed_by'),
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('request_status_history_request_id_idx').on(table.requestId),
    index('request_status_history_created_at_idx').on(table.createdAt),
  ],
);
