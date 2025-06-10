/**
 * AI Audit Service Types
 * 
 * Provides audit logging for all AI service operations for compliance and debugging
 */

import type { PipelineType } from '@/lib/ai/types/pipeline';

/**
 * Audit entry for AI operations
 */
export interface AuditEntry {
  id: string;
  executionId: string;
  pipelineType: PipelineType;
  patientId: string;
  sessionId?: string;
  userId: string;
  organizationId: string;
  timestamp: Date;
  
  // Request details
  request: {
    promptTemplate: string;
    promptVersion: string;
    variables?: Record<string, any>;
    model: string;
    temperature?: number;
    maxTokens?: number;
  };
  
  // Response details
  response?: {
    success: boolean;
    data?: any;
    error?: string;
    errorCode?: string;
    errorStack?: string;
  };
  
  // Performance metrics
  performance: {
    totalDurationMs: number;
    contextAggregationMs?: number;
    promptCompilationMs?: number;
    llmExecutionMs?: number;
    validationMs?: number;
    cacheHit: boolean;
    tokenUsage?: TokenUsage;
  };
  
  // Additional metadata
  metadata?: Record<string, any>;
}

/**
 * Token usage information
 */
export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
  estimatedCost?: number;
}

/**
 * Filter options for querying audit entries
 */
export interface AuditFilter {
  executionId?: string;
  pipelineType?: PipelineType;
  patientId?: string;
  sessionId?: string;
  userId?: string;
  organizationId?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  cacheHit?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: 'timestamp' | 'duration' | 'tokens';
  orderDirection?: 'asc' | 'desc';
}

/**
 * Aggregated metrics for a time period
 */
export interface AuditMetrics {
  timeRange: {
    start: Date;
    end: Date;
  };
  
  // Volume metrics
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  cacheHits: number;
  
  // Performance metrics
  avgDurationMs: number;
  p50DurationMs: number;
  p95DurationMs: number;
  p99DurationMs: number;
  
  // Token usage metrics
  totalTokensUsed: number;
  avgTokensPerRequest: number;
  estimatedTotalCost: number;
  
  // Breakdown by pipeline
  byPipeline: Record<PipelineType, {
    count: number;
    avgDurationMs: number;
    successRate: number;
    avgTokens: number;
  }>;
  
  // Error analysis
  topErrors: Array<{
    errorCode: string;
    count: number;
    message: string;
  }>;
}

/**
 * Main audit service interface
 */
export interface AuditService {
  /**
   * Log an AI execution
   */
  logExecution(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<string>;
  
  /**
   * Update an existing execution entry
   */
  updateExecution(
    executionId: string, 
    update: Partial<AuditEntry>
  ): Promise<void>;
  
  /**
   * Get a single audit entry
   */
  getExecution(executionId: string): Promise<AuditEntry | null>;
  
  /**
   * Query audit entries with filters
   */
  getExecutions(filter: AuditFilter): Promise<{
    entries: AuditEntry[];
    total: number;
    hasMore: boolean;
  }>;
  
  /**
   * Get aggregated metrics for a time period
   */
  getMetrics(
    startDate: Date,
    endDate: Date,
    organizationId?: string
  ): Promise<AuditMetrics>;
  
  /**
   * Export audit data for compliance
   */
  exportAuditLog(
    filter: AuditFilter,
    format: 'json' | 'csv'
  ): Promise<Buffer>;
  
  /**
   * Clean up old audit entries
   */
  cleanup(retentionDays: number): Promise<number>;
  
  /**
   * Health check
   */
  healthCheck(): Promise<{
    healthy: boolean;
    latencyMs: number;
    error?: string;
  }>;
}

/**
 * Configuration for audit service
 */
export interface AuditConfig {
  // Whether auditing is enabled
  enabled: boolean;
  
  // Storage backend
  storage: 'postgres' | 'file' | 'memory';
  
  // Retention period in days
  retentionDays: number;
  
  // Whether to include request/response data
  includeRequestData: boolean;
  includeResponseData: boolean;
  
  // Maximum size of data to store (to prevent huge payloads)
  maxDataSizeBytes: number;
  
  // Whether to calculate token costs
  calculateCosts: boolean;
  
  // Cost per token (for estimation)
  costPerToken?: {
    prompt: number;
    completion: number;
  };
}

/**
 * Default audit configuration
 */
export const DEFAULT_AUDIT_CONFIG: AuditConfig = {
  enabled: true,
  storage: 'postgres',
  retentionDays: 90,
  includeRequestData: true,
  includeResponseData: true,
  maxDataSizeBytes: 100 * 1024, // 100KB
  calculateCosts: true,
  costPerToken: {
    prompt: 0.00001,      // $0.01 per 1K tokens
    completion: 0.00003   // $0.03 per 1K tokens
  }
};

/**
 * Audit event types for real-time monitoring
 */
export type AuditEvent = 
  | { type: 'execution_start'; executionId: string; pipelineType: PipelineType }
  | { type: 'execution_complete'; executionId: string; success: boolean; durationMs: number }
  | { type: 'execution_error'; executionId: string; error: string; errorCode?: string }
  | { type: 'high_latency'; executionId: string; durationMs: number }
  | { type: 'high_token_usage'; executionId: string; tokens: number };

/**
 * Audit event listener
 */
export interface AuditEventListener {
  (event: AuditEvent): void;
}
