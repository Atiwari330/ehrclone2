/**
 * AI Audit Service Module
 * 
 * Exports all audit-related functionality
 */

// Types
export type {
  AuditService,
  AuditEntry,
  AuditFilter,
  AuditMetrics,
  AuditConfig,
  TokenUsage,
  AuditEvent,
  AuditEventListener
} from './types';

export { DEFAULT_AUDIT_CONFIG } from './types';

// Audit service implementations
export { PostgresAuditService, createPostgresAuditService } from './postgres-audit-service';

// Factory function to create appropriate audit service based on configuration
import type { AuditService, AuditConfig, AuditEntry, AuditMetrics } from './types';
import { createPostgresAuditService } from './postgres-audit-service';

export function createAuditService(config?: Partial<AuditConfig>): AuditService {
  // Default to PostgreSQL audit service
  // In the future, could support other storage backends
  const storage = config?.storage || 'postgres';
  
  switch (storage) {
    case 'postgres':
      return createPostgresAuditService(config);
    case 'memory':
      // For testing or development
      console.warn('[AuditService] Memory storage not implemented, falling back to PostgreSQL');
      return createPostgresAuditService(config);
    case 'file':
      // For environments without database access
      console.warn('[AuditService] File storage not implemented, falling back to PostgreSQL');
      return createPostgresAuditService(config);
    default:
      return createPostgresAuditService(config);
  }
}

// Null audit service for testing
export class NullAuditService implements AuditService {
  async logExecution(): Promise<string> {
    return 'test-execution-id';
  }
  
  async updateExecution(): Promise<void> {
    // No-op
  }
  
  async getExecution(): Promise<AuditEntry | null> {
    return null;
  }
  
  async getExecutions(): Promise<{ entries: AuditEntry[]; total: number; hasMore: boolean }> {
    return { entries: [], total: 0, hasMore: false };
  }
  
  async getMetrics(): Promise<AuditMetrics> {
    return {
      timeRange: { start: new Date(), end: new Date() },
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      cacheHits: 0,
      avgDurationMs: 0,
      p50DurationMs: 0,
      p95DurationMs: 0,
      p99DurationMs: 0,
      totalTokensUsed: 0,
      avgTokensPerRequest: 0,
      estimatedTotalCost: 0,
      byPipeline: {
        safety_check: { count: 0, avgDurationMs: 0, successRate: 0, avgTokens: 0 },
        billing_cpt: { count: 0, avgDurationMs: 0, successRate: 0, avgTokens: 0 },
        billing_icd10: { count: 0, avgDurationMs: 0, successRate: 0, avgTokens: 0 },
        treatment_progress: { count: 0, avgDurationMs: 0, successRate: 0, avgTokens: 0 },
        chat_with_chart: { count: 0, avgDurationMs: 0, successRate: 0, avgTokens: 0 }
      },
      topErrors: []
    };
  }
  
  async exportAuditLog(): Promise<Buffer> {
    return Buffer.from('[]');
  }
  
  async cleanup(): Promise<number> {
    return 0;
  }
  
  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
    return { healthy: true, latencyMs: 0 };
  }
}

// Create a null audit service for testing
export function createNullAuditService(): AuditService {
  return new NullAuditService();
}
