-- Create transcript table
CREATE TABLE IF NOT EXISTS "transcript" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "entries" json NOT NULL,
  "duration" integer NOT NULL,
  "start_time" timestamp NOT NULL,
  "end_time" timestamp,
  "word_count" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "transcript_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE no action ON UPDATE no action
);

-- Create index on session_id for faster lookups
CREATE INDEX IF NOT EXISTS "transcript_session_id_idx" ON "transcript" ("session_id");
