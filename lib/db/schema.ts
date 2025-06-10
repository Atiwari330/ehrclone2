import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const messageDeprecated = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable('Message_v2', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  'Vote_v2',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  'Stream',
  {
    id: uuid('id').notNull().defaultRandom(),
    chatId: uuid('chatId').notNull(),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  }),
);

export type Stream = InferSelectModel<typeof stream>;

// EHR-specific tables

export const patient = pgTable('patient', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: timestamp('date_of_birth').notNull(),
  gender: varchar('gender', { length: 20 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  contactEmail: varchar('contact_email', { length: 64 }),
  address: text('address'),
  photoUrl: text('photo_url'),
});

export type Patient = InferSelectModel<typeof patient>;

export const provider = pgTable('provider', {
  id: uuid('id').primaryKey().notNull().references(() => user.id),
  title: varchar('title', { length: 100 }),
  specialty: varchar('specialty', { length: 100 }),
  npiNumber: varchar('npi_number', { length: 10 }),
});

export type Provider = InferSelectModel<typeof provider>;

export const session = pgTable('session', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  patientId: uuid('patient_id').notNull().references(() => patient.id),
  providerId: uuid('provider_id').notNull().references(() => provider.id),
  sessionType: varchar('session_type', { length: 50 }).notNull(),
  sessionStatus: varchar('session_status', { length: 50 }).notNull(),
  scheduledAt: timestamp('scheduled_at').notNull(),
  endedAt: timestamp('ended_at'),
  videoCallLink: text('video_call_link'),
});

export type Session = InferSelectModel<typeof session>;

// Transcript table for storing session transcripts
export const transcript = pgTable('transcript', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => session.id),
  entries: json('entries').notNull(), // Array of TranscriptEntry objects
  duration: integer('duration').notNull(), // Duration in seconds
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  wordCount: integer('word_count'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Transcript = InferSelectModel<typeof transcript>;

// AI Pipeline Infrastructure Tables

// Treatment plan table for tracking patient treatment
export const treatmentPlan = pgTable('treatment_plan', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patient.id),
  providerId: uuid('provider_id').notNull().references(() => provider.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('active'), // 'active', 'completed', 'paused', 'cancelled'
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type TreatmentPlan = InferSelectModel<typeof treatmentPlan>;

// Treatment goals within a treatment plan
export const treatmentGoal = pgTable('treatment_goal', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  treatmentPlanId: uuid('treatment_plan_id').notNull().references(() => treatmentPlan.id),
  goalText: text('goal_text').notNull(),
  targetDate: timestamp('target_date'),
  status: varchar('status', { length: 50 }).notNull().default('not_started'), // 'not_started', 'in_progress', 'achieved', 'modified', 'discontinued'
  progressPercentage: integer('progress_percentage').default(0), // 0-100
  priority: integer('priority').notNull().default(3), // 1 (highest) to 5 (lowest)
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  achievedAt: timestamp('achieved_at'),
});

export type TreatmentGoal = InferSelectModel<typeof treatmentGoal>;

// Diagnosis table for patient diagnoses with ICD-10 codes
export const diagnosis = pgTable('diagnosis', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patient.id),
  providerId: uuid('provider_id').notNull().references(() => provider.id),
  sessionId: uuid('session_id').references(() => session.id), // Nullable - link to session where diagnosed
  icd10Code: varchar('icd10_code', { length: 10 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'), // 'active', 'resolved', 'in_remission'
  onsetDate: timestamp('onset_date'),
  resolvedDate: timestamp('resolved_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Diagnosis = InferSelectModel<typeof diagnosis>;

// Medication table for patient medications
export const medication = pgTable('medication', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patient.id),
  providerId: uuid('provider_id').notNull().references(() => provider.id),
  medicationName: varchar('medication_name', { length: 255 }).notNull(),
  dosage: varchar('dosage', { length: 100 }).notNull(),
  frequency: varchar('frequency', { length: 100 }).notNull(),
  route: varchar('route', { length: 50 }).notNull().default('oral'), // 'oral', 'injection', 'topical', etc.
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  status: varchar('status', { length: 50 }).notNull().default('active'), // 'active', 'discontinued', 'completed'
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Medication = InferSelectModel<typeof medication>;

// Assessment table for standardized assessments (PHQ-9, GAD-7, etc.)
export const assessment = pgTable('assessment', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patient.id),
  providerId: uuid('provider_id').notNull().references(() => provider.id),
  sessionId: uuid('session_id').references(() => session.id), // Nullable - can be done outside of session
  assessmentType: varchar('assessment_type', { length: 50 }).notNull(), // 'PHQ-9', 'GAD-7', 'PCL-5', 'AUDIT', etc.
  totalScore: integer('total_score').notNull(),
  severity: varchar('severity', { length: 50 }), // Calculated based on type and score
  responses: json('responses').notNull(), // JSONB - Array of question/answer pairs
  administeredAt: timestamp('administered_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Assessment = InferSelectModel<typeof assessment>;

// AI Pipeline Execution audit table for tracking all AI operations
export const aiPipelineExecution = pgTable('ai_pipeline_execution', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  pipelineType: varchar('pipeline_type', { length: 100 }).notNull(), // 'safety_check', 'billing_automation', 'progress_tracking', etc.
  sessionId: uuid('session_id').references(() => session.id), // Nullable
  patientId: uuid('patient_id').references(() => patient.id), // Nullable
  userId: uuid('user_id').notNull().references(() => user.id), // Who triggered the pipeline
  
  // Input/Output tracking
  inputData: json('input_data').notNull(), // Full input context
  outputData: json('output_data').notNull(), // AI response/results
  
  // Performance metrics
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  durationMs: integer('duration_ms'),
  
  // Token usage (for cost tracking)
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  totalTokens: integer('total_tokens'),
  modelUsed: varchar('model_used', { length: 100 }),
  
  // Status tracking
  status: varchar('status', { length: 50 }).notNull().default('started'), // 'started', 'completed', 'failed', 'cancelled'
  errorMessage: text('error_message'),
  
  // Caching
  cacheHit: boolean('cache_hit').default(false),
  cacheKey: varchar('cache_key', { length: 255 }),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type AIPipelineExecution = InferSelectModel<typeof aiPipelineExecution>;

// Alert table for safety alerts generated by AI
export const alert = pgTable('alert', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patient.id),
  providerId: uuid('provider_id').notNull().references(() => provider.id),
  sessionId: uuid('session_id').references(() => session.id), // Nullable
  pipelineExecutionId: uuid('pipeline_execution_id').notNull().references(() => aiPipelineExecution.id),
  
  alertType: varchar('alert_type', { length: 100 }).notNull(), // 'suicide_risk', 'violence_risk', 'substance_abuse', etc.
  severity: varchar('severity', { length: 20 }).notNull(), // 'low', 'medium', 'high', 'critical'
  riskScore: integer('risk_score'), // 0-100 representing confidence percentage
  
  alertTitle: varchar('alert_title', { length: 255 }).notNull(),
  alertDescription: text('alert_description').notNull(),
  recommendedActions: json('recommended_actions'), // Array of recommended actions
  
  status: varchar('status', { length: 50 }).notNull().default('new'), // 'new', 'acknowledged', 'resolved', 'false_positive'
  acknowledgedBy: uuid('acknowledged_by').references(() => user.id),
  acknowledgedAt: timestamp('acknowledged_at'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Alert = InferSelectModel<typeof alert>;

// Billing suggestion table for AI-generated billing codes
export const billingSuggestion = pgTable('billing_suggestion', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => session.id),
  pipelineExecutionId: uuid('pipeline_execution_id').notNull().references(() => aiPipelineExecution.id),
  
  cptCodes: json('cpt_codes').notNull(), // Array of {code, description, confidence}
  icd10Codes: json('icd10_codes').notNull(), // Array of {code, description, confidence}
  modifiers: json('modifiers'), // Array of billing modifiers
  
  documentationComplete: boolean('documentation_complete').notNull().default(true),
  missingElements: json('missing_elements'), // Array of missing documentation
  
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending', 'approved', 'modified', 'rejected'
  reviewedBy: uuid('reviewed_by').references(() => user.id),
  reviewedAt: timestamp('reviewed_at'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type BillingSuggestion = InferSelectModel<typeof billingSuggestion>;

// AI Audit Schema - Import audit tables
export * from './schema/ai-audit';
