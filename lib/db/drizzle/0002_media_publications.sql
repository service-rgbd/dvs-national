CREATE TYPE "public"."media_publication_status" AS ENUM('draft', 'submitted', 'under_review', 'approved', 'published', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('photo', 'video');--> statement-breakpoint
CREATE TABLE "media_publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"establishment_id" uuid NOT NULL,
	"activity_id" uuid NOT NULL,
	"request_id" uuid,
	"status" "media_publication_status" DEFAULT 'draft' NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"decision_reason" text,
	"submitted_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "media_publication_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publication_id" uuid NOT NULL,
	"media_type" "media_type" NOT NULL,
	"storage_key" varchar(512) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"mime_type" varchar(128) NOT NULL,
	"size_bytes" integer,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "media_publication_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publication_id" uuid NOT NULL,
	"previous_status" "media_publication_status",
	"new_status" "media_publication_status" NOT NULL,
	"changed_by" uuid,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "media_publications" ADD CONSTRAINT "media_publications_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_publications" ADD CONSTRAINT "media_publications_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_publications" ADD CONSTRAINT "media_publications_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_publication_files" ADD CONSTRAINT "media_publication_files_publication_id_media_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."media_publications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_publication_status_history" ADD CONSTRAINT "media_publication_status_history_publication_id_media_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."media_publications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_publications_establishment_id_idx" ON "media_publications" USING btree ("establishment_id");--> statement-breakpoint
CREATE INDEX "media_publications_activity_id_idx" ON "media_publications" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "media_publications_status_idx" ON "media_publications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "media_publications_published_at_idx" ON "media_publications" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "media_publication_files_publication_id_idx" ON "media_publication_files" USING btree ("publication_id");--> statement-breakpoint
CREATE INDEX "media_publication_files_media_type_idx" ON "media_publication_files" USING btree ("media_type");--> statement-breakpoint
CREATE INDEX "media_publication_status_history_publication_id_idx" ON "media_publication_status_history" USING btree ("publication_id");--> statement-breakpoint
CREATE INDEX "media_publication_status_history_created_at_idx" ON "media_publication_status_history" USING btree ("created_at");
