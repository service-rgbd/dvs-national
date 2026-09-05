-- Workflow voyage découverte : statut renvoi correction + checklist dossier
ALTER TYPE "public"."request_status" ADD VALUE IF NOT EXISTS 'returned_for_correction';

ALTER TABLE "requests" ADD COLUMN IF NOT EXISTS "checklist" jsonb NOT NULL DEFAULT '{}';
ALTER TABLE "requests" ADD COLUMN IF NOT EXISTS "dvs_validation" jsonb NOT NULL DEFAULT '{}';
