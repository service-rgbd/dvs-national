import { pgEnum } from 'drizzle-orm/pg-core';

/** Statut administratif d'un établissement (évolution future). */
export const establishmentStatusEnum = pgEnum('establishment_status', [
  'active',
  'inactive',
  'pending',
  'archived',
]);

/** Statut d'un compte utilisateur (auth — étape 08). */
export const userStatusEnum = pgEnum('user_status', [
  'active',
  'inactive',
  'locked',
  'pending_verification',
]);

/** Statut d'une demande d'autorisation (workflow — étape 10). */
export const requestStatusEnum = pgEnum('request_status', [
  'draft',
  'submitted',
  'under_review',
  'forwarded',
  'approved',
  'rejected',
  'cancelled',
  'archived',
  'returned_for_correction',
]);

/** Statut d'une publication média (sortie scolaire — validation avant site public). */
export const mediaPublicationStatusEnum = pgEnum('media_publication_status', [
  'draft',
  'submitted',
  'under_review',
  'approved',
  'published',
  'rejected',
  'cancelled',
]);

/** Type de média déposé. */
export const mediaTypeEnum = pgEnum('media_type', ['photo', 'video']);

/** Type de périmètre géographique DREN / DDENA. */
export const directorateKindEnum = pgEnum('directorate_kind', ['drena', 'ddena']);
