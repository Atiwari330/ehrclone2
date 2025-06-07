CREATE TABLE IF NOT EXISTS "transcript" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"entries" json NOT NULL,
	"duration" integer NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"word_count" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transcript" ADD CONSTRAINT "transcript_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
