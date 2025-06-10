/**
 * AI Audit Database Schema
 * 
 * Tables for storing AI service audit logs
 */

import { pgTable, text, timestamp, integer, jsonb, boolean, index, real, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Main audit log table
 */
export const aiAuditLogs = pgTable('ai_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  executionId: text('execution_id').notNull().unique(),
  pipelineType: text('pipeline_type').notNull(),
  patientId: text('patient_id').notNull(),
  sessionId: text('session_id'),
  userId: text('user_id').notNull(),
  organizationId: text('organization_id').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  
  // Request details (JSONB for flexibility)
  request: jsonb('request').notNull().$type<{
    promptTemplate: string;
    promptVersion: string;
    variables?: Record<string, any>;
    model: string;
    temperature?: number;
    maxTokens?: number;
  }>(),
  
  // Response details (JSONB)
  response: jsonb('response').$type<{
    success: boolean;
    data?: any;
    error?: string;
    errorCode?: string;
    errorStack?: string;
  }>(),
  
  // Performance metrics
  totalDurationMs: integer('total_duration_ms').notNull(),
  contextAggregationMs: integer('context_aggregation_ms'),
  promptCompilationMs: integer('prompt_compilation_ms'),
  llmExecutionMs: integer('llm_execution_ms'),
  validationMs: integer('validation_ms'),
  cacheHit: boolean('cache_hit').notNull().default(false),
  
  // Token usage
  promptTokens: integer('prompt_tokens'),
  completionTokens: integer('completion_tokens'),
  totalTokens: integer('total_tokens'),
  estimatedCost: real('estimated_cost'),
  
  // Additional metadata
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  
  // Audit metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => ({
  // Indexes for common queries
  timestampIdx: index('ai_audit_timestamp_idx').on(table.timestamp),
  executionIdIdx: index('ai_audit_execution_id_idx').on(table.executionId),
  pipelineTypeIdx: index('ai_audit_pipeline_type_idx').on(table.pipelineType),
  patientIdIdx: index('ai_audit_patient_id_idx').on(table.patientId),
  userIdIdx: index('ai_audit_user_id_idx').on(table.userId),
  organizationIdIdx: index('ai_audit_organization_id_idx').on(table.organizationId),
  successIdx: index('ai_audit_success_idx').on(table.response),
  cacheHitIdx: index('ai_audit_cache_hit_idx').on(table.cacheHit),
  // Composite indexes for common filter combinations
  orgTimestampIdx: index('ai_audit_org_timestamp_idx').on(table.organizationId, table.timestamp),
  pipelineOrgIdx: index('ai_audit_pipeline_org_idx').on(table.pipelineType, table.organizationId)
}));

/**
 * Aggregated metrics table (materialized daily)
 */
export const aiAuditMetrics = pgTable('ai_audit_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: timestamp('date').notNull(),
  organizationId: text('organization_id').notNull(),
  pipelineType: text('pipeline_type'),
  
  // Volume metrics
  totalExecutions: integer('total_executions').notNull().default(0),
  successfulExecutions: integer('successful_executions').notNull().default(0),
  failedExecutions: integer('failed_executions').notNull().default(0),
  cacheHits: integer('cache_hits').notNull().default(0),
  
  // Performance metrics
  avgDurationMs: real('avg_duration_ms'),
  p50DurationMs: real('p50_duration_ms'),
  p95DurationMs: real('p95_duration_ms'),
  p99DurationMs: real('p99_duration_ms'),
  minDurationMs: real('min_duration_ms'),
  maxDurationMs: real('max_duration_ms'),
  
  // Token usage metrics
  totalPromptTokens: integer('total_prompt_tokens').notNull().default(0),
  totalCompletionTokens: integer('total_completion_tokens').notNull().default(0),
  totalTokens: integer('total_tokens').notNull().default(0),
  avgTokensPerRequest: real('avg_tokens_per_request'),
  estimatedTotalCost: real('estimated_total_cost'),
  
  // Error tracking
  topErrors: jsonb('top_errors').$type<Array<{
    errorCode: string;
    count: number;
    message: string;
  }>>(),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => ({
  // Indexes for querying metrics
  dateIdx: index('ai_metrics_date_idx').on(table.date),
  orgDateIdx: index('ai_metrics_org_date_idx').on(table.organizationId, table.date),
  pipelineOrgDateIdx: index('ai_metrics_pipeline_org_date_idx').on(table.pipelineType, table.organizationId, table.date)
}));

/**
 * Relations
 */
export const aiAuditLogsRelations = relations(aiAuditLogs, ({ }) => ({
  // Future relations can be added here
}));

export const aiAuditMetricsRelations = relations(aiAuditMetrics, ({ }) => ({
  // Future relations can be added here
}));

/**
 * Type exports for TypeScript
 */
export type AiAuditLog = typeof aiAuditLogs.$inferSelect;
export type NewAiAuditLog = typeof aiAuditLogs.$inferInsert;
export type AiAuditMetric = typeof aiAuditMetrics.$inferSelect;
export type NewAiAuditMetric = typeof aiAuditMetrics.$inferInsert;
