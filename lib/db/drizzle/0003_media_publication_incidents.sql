ALTER TABLE "media_publications"
  ADD COLUMN IF NOT EXISTS "incident_reported" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "incident_description" text,
  ADD COLUMN IF NOT EXISTS "incident_reported_at" timestamp with time zone;
