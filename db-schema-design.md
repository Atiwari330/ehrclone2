# Database Schema Design for EHR Conversion

This document outlines the proposed database schema changes required to convert the chatbot application into a healthcare EHR system. The design considers the entities described in the product vision and user stories, with a focus on data integrity and future HIPAA compliance considerations.

## 1. Guiding Principles

-   **Clarity**: Table and column names should be explicit and clear.
-   **Relationships**: Use foreign keys to enforce relationships between entities (e.g., a `Session` must be linked to a `Patient` and a `Provider`).
-   **Data Types**: Use appropriate data types (e.g., `timestamp` for dates, `text` for notes, `varchar` for codes).
-   **HIPAA Considerations**: While not a full compliance guide, the design includes basic considerations like separating patient-identifiable information and preparing for audit trails. All patient data should be treated as Protected Health Information (PHI).

## 2. Proposed New Tables

The following new tables are proposed.

### `patient`

Stores demographic and contact information for patients.

```sql
CREATE TABLE "patient" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp NOT NULL,
  "first_name" varchar(100) NOT NULL,
  "last_name" varchar(100) NOT NULL,
  "date_of_birth" date NOT NULL,
  "gender" varchar(20),
  "contact_phone" varchar(20),
  "contact_email" varchar(64),
  "address" text,
  "photo_url" text -- URL to a profile picture
);
```

### `provider`

Stores information about healthcare providers. This table will have a one-to-one relationship with the existing `user` table.

```sql
CREATE TABLE "provider" (
  "id" uuid PRIMARY KEY NOT NULL, -- This will be a foreign key to user.id
  "title" varchar(100), -- e.g., "MD", "PhD", "LCSW"
  "specialty" varchar(100), -- e.g., "Cardiology", "Psychology"
  "npi_number" varchar(10) UNIQUE,
  FOREIGN KEY ("id") REFERENCES "User"("id")
);
```

### `session`

Represents a single clinical encounter. This is a central table linking patients, providers, and the resulting documentation.

```sql
CREATE TABLE "session" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp NOT NULL,
  "patient_id" uuid NOT NULL,
  "provider_id" uuid NOT NULL,
  "session_type" varchar(50) NOT NULL, -- e.g., 'Telehealth', 'In-Office'
  "session_status" varchar(50) NOT NULL, -- e.g., 'Scheduled', 'In-Progress', 'Completed'
  "scheduled_at" timestamp NOT NULL,
  "ended_at" timestamp,
  "video_call_link" text,
  FOREIGN KEY ("patient_id") REFERENCES "patient"("id"),
  FOREIGN KEY ("provider_id") REFERENCES "provider"("id")
);
```

### `clinical_note`

Stores the AI-generated and human-edited clinical notes for each session.

```sql
CREATE TABLE "clinical_note" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid UNIQUE NOT NULL, -- Each session has one note
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  "status" varchar(50) NOT NULL, -- e.g., 'Draft', 'Pending-Review', 'Signed'
  "content_soap" jsonb, -- Store the note in SOAP format (Subjective, Objective, Assessment, Plan)
  "transcript" text, -- Full transcript of the session
  "signed_by_provider_id" uuid,
  "signed_at" timestamp,
  FOREIGN KEY ("session_id") REFERENCES "session"("id"),
  FOREIGN KEY ("signed_by_provider_id") REFERENCES "provider"("id")
);
```

### `billing_code`

Stores the suggested and finalized billing codes for a session.

```sql
CREATE TABLE "billing_code" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "cpt_code" varchar(10) NOT NULL,
  "icd10_code" varchar(10) NOT NULL,
  "modifiers" varchar(10)[],
  "fee" numeric(10, 2),
  "status" varchar(50) NOT NULL, -- e.g., 'Suggested', 'Approved', 'Billed'
  "justification" text, -- Snippet from transcript justifying the code
  FOREIGN KEY ("session_id") REFERENCES "session"("id")
);
```

### `audit_log`

A table for tracking access and modifications to PHI, which is critical for HIPAA compliance.

```sql
CREATE TABLE "audit_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "action" varchar(100) NOT NULL, -- e.g., 'VIEW_PATIENT', 'EDIT_NOTE', 'SIGN_NOTE'
  "target_entity" varchar(50) NOT NULL, -- e.g., 'patient', 'clinical_note'
  "target_id" uuid NOT NULL,
  "timestamp" timestamp NOT NULL,
  "details" jsonb, -- e.g., IP address, user agent
  FOREIGN KEY ("user_id") REFERENCES "User"("id")
);
```

## 3. Modifications to Existing Tables

-   **`user`**: A `role` column will be added to distinguish between different user types (e.g., `provider`, `supervisor`, `admin`). This will be essential for implementing Role-Based Access Control (RBAC).

    ```sql
    ALTER TABLE "User" ADD COLUMN "role" varchar(50) DEFAULT 'provider' NOT NULL;
    ```

## 4. Relationships Diagram (Mermaid)

```mermaid
erDiagram
    "User" ||--o{ "provider" : "has"
    "User" }|--|| "audit_log" : "performs"

    "provider" ||--|{ "session" : "conducts"
    "provider" ||--o| "clinical_note" : "signs"

    "patient" ||--|{ "session" : "attends"

    "session" ||--|{ "billing_code" : "generates"
    "session" }|--|| "clinical_note" : "documents"

    "clinical_note" {
        uuid id PK
        uuid session_id FK
        timestamp created_at
        timestamp updated_at
        varchar status
        jsonb content_soap
        text transcript
        uuid signed_by_provider_id FK
        timestamp signed_at
    }

    "session" {
        uuid id PK
        timestamp created_at
        uuid patient_id FK
        uuid provider_id FK
        varchar session_type
        varchar session_status
        timestamp scheduled_at
        timestamp ended_at
        text video_call_link
    }

    "patient" {
        uuid id PK
        timestamp created_at
        varchar first_name
        varchar last_name
        date date_of_birth
        varchar gender
        varchar contact_phone
        varchar contact_email
        text address
        text photo_url
    }

    "provider" {
        uuid id PK, FK
        varchar title
        varchar specialty
        varchar npi_number
    }

    "billing_code" {
        uuid id PK
        uuid session_id FK
        varchar cpt_code
        varchar icd10_code
        varchar[] modifiers
        numeric fee
        varchar status
        text justification
    }

    "User" {
        uuid id PK
        varchar email
        varchar password
        varchar role
    }

    "audit_log" {
        uuid id PK
        uuid user_id FK
        varchar action
        varchar target_entity
        uuid target_id
        timestamp timestamp
        jsonb details
    }
