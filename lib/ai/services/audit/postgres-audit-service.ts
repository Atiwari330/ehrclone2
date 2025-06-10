/**
 * PostgreSQL Audit Service Implementation
 * 
 * Stores AI service audit logs in PostgreSQL for compliance and analysis
 */

import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import type { 
  AuditService, 
  AuditEntry, 
  AuditFilter, 
  AuditMetrics, 
  AuditConfig,
  AuditEventListener,
  AuditEvent
} from './types';
import { DEFAULT_AUDIT_CONFIG } from './types';
import { aiAuditLogs, type NewAiAuditLog } from '@/lib/db/schema/ai-audit';
import { db } from '@/lib/db/drizzle';
import type { PipelineType } from '@/lib/ai/types/pipeline';

/**
 * PostgreSQL implementation of audit service
 */
export class PostgresAuditService implements AuditService {
  private config: AuditConfig;
  private eventListeners: AuditEventListener[] = [];
  
  constructor(config?: Partial<AuditConfig>) {
    this.config = { ...DEFAULT_AUDIT_CONFIG, ...config };
  }
  
  async logExecution(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<string> {
    if (!this.config.enabled) {
      return entry.executionId;
    }
    
    try {
      // Emit start event
      this.emitEvent({
        type: 'execution_start',
        executionId: entry.executionId,
        pipelineType: entry.pipelineType
      });
      
      // Prepare audit log entry
      const auditLog: NewAiAuditLog = {
        executionId: entry.executionId,
        pipelineType: entry.pipelineType,
        patientId: entry.patientId,
        sessionId: entry.sessionId,
        userId: entry.userId,
        organizationId: entry.organizationId,
        timestamp: new Date(),
        
        // Truncate request/response data if needed
        request: this.config.includeRequestData 
          ? this.truncateData(entry.request)
          : { promptTemplate: entry.request.promptTemplate, promptVersion: entry.request.promptVersion },
        
        response: entry.response && this.config.includeResponseData
          ? this.truncateData(entry.response)
          : entry.response ? { success: entry.response.success } : null,
        
        // Performance metrics
        totalDurationMs: entry.performance.totalDurationMs,
        contextAggregationMs: entry.performance.contextAggregationMs,
        promptCompilationMs: entry.performance.promptCompilationMs,
        llmExecutionMs: entry.performance.llmExecutionMs,
        validationMs: entry.performance.validationMs,
        cacheHit: entry.performance.cacheHit,
        
        // Token usage
        promptTokens: entry.performance.tokenUsage?.prompt,
        completionTokens: entry.performance.tokenUsage?.completion,
        totalTokens: entry.performance.tokenUsage?.total,
        estimatedCost: this.calculateCost(entry.performance.tokenUsage),
        
        metadata: entry.metadata
      };
      
      // Insert into database
      await db.insert(aiAuditLogs).values(auditLog);
      
      // Emit completion event
      if (entry.response) {
        this.emitEvent({
          type: 'execution_complete',
          executionId: entry.executionId,
          success: entry.response.success,
          durationMs: entry.performance.totalDurationMs
        });
        
        // Check for high latency
        if (entry.performance.totalDurationMs > 5000) {
          this.emitEvent({
            type: 'high_latency',
            executionId: entry.executionId,
            durationMs: entry.performance.totalDurationMs
          });
        }
        
        // Check for high token usage
        if (entry.performance.tokenUsage && entry.performance.tokenUsage.total > 10000) {
          this.emitEvent({
            type: 'high_token_usage',
            executionId: entry.executionId,
            tokens: entry.performance.tokenUsage.total
          });
        }
      }
      
      return entry.executionId;
    } catch (error) {
      console.error('[AuditService] Failed to log execution:', error);
      // Don't throw - auditing should not break the main flow
      return entry.executionId;
    }
  }
  
  async updateExecution(executionId: string, update: Partial<AuditEntry>): Promise<void> {
    if (!this.config.enabled) {
      return;
    }
    
    try {
      const updateData: Partial<NewAiAuditLog> = {
        updatedAt: new Date()
      };
      
      // Update response if provided
      if (update.response) {
        updateData.response = this.config.includeResponseData
          ? this.truncateData(update.response)
          : { success: update.response.success };
          
        // Emit error event if response contains error
        if (update.response.error) {
          this.emitEvent({
            type: 'execution_error',
            executionId,
            error: update.response.error,
            errorCode: update.response.errorCode
          });
        }
      }
      
      // Update performance metrics if provided
      if (update.performance) {
        if (update.performance.totalDurationMs !== undefined) {
          updateData.totalDurationMs = update.performance.totalDurationMs;
        }
        if (update.performance.contextAggregationMs !== undefined) {
          updateData.contextAggregationMs = update.performance.contextAggregationMs;
        }
        if (update.performance.promptCompilationMs !== undefined) {
          updateData.promptCompilationMs = update.performance.promptCompilationMs;
        }
        if (update.performance.llmExecutionMs !== undefined) {
          updateData.llmExecutionMs = update.performance.llmExecutionMs;
        }
        if (update.performance.validationMs !== undefined) {
          updateData.validationMs = update.performance.validationMs;
        }
        if (update.performance.cacheHit !== undefined) {
          updateData.cacheHit = update.performance.cacheHit;
        }
        
        // Update token usage
        if (update.performance.tokenUsage) {
          updateData.promptTokens = update.performance.tokenUsage.prompt;
          updateData.completionTokens = update.performance.tokenUsage.completion;
          updateData.totalTokens = update.performance.tokenUsage.total;
          updateData.estimatedCost = this.calculateCost(update.performance.tokenUsage);
        }
      }
      
      // Update metadata if provided
      if (update.metadata) {
        updateData.metadata = update.metadata;
      }
      
      await db
        .update(aiAuditLogs)
        .set(updateData)
        .where(eq(aiAuditLogs.executionId, executionId));
    } catch (error) {
      console.error('[AuditService] Failed to update execution:', error);
    }
  }
  
  async getExecution(executionId: string): Promise<AuditEntry | null> {
    try {
      const result = await db
        .select()
        .from(aiAuditLogs)
        .where(eq(aiAuditLogs.executionId, executionId))
        .limit(1);
      
      if (result.length === 0) {
        return null;
      }
      
      return this.mapToAuditEntry(result[0]);
    } catch (error) {
      console.error('[AuditService] Failed to get execution:', error);
      return null;
    }
  }
  
  async getExecutions(filter: AuditFilter): Promise<{
    entries: AuditEntry[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const conditions = [];
      
      // Build filter conditions
      if (filter.executionId) {
        conditions.push(eq(aiAuditLogs.executionId, filter.executionId));
      }
      if (filter.pipelineType) {
        conditions.push(eq(aiAuditLogs.pipelineType, filter.pipelineType));
      }
      if (filter.patientId) {
        conditions.push(eq(aiAuditLogs.patientId, filter.patientId));
      }
      if (filter.sessionId) {
        conditions.push(eq(aiAuditLogs.sessionId, filter.sessionId));
      }
      if (filter.userId) {
        conditions.push(eq(aiAuditLogs.userId, filter.userId));
      }
      if (filter.organizationId) {
        conditions.push(eq(aiAuditLogs.organizationId, filter.organizationId));
      }
      if (filter.startDate) {
        conditions.push(gte(aiAuditLogs.timestamp, filter.startDate));
      }
      if (filter.endDate) {
        conditions.push(lte(aiAuditLogs.timestamp, filter.endDate));
      }
      if (filter.success !== undefined) {
        conditions.push(sql`${aiAuditLogs.response}->>'success' = ${filter.success.toString()}`);
      }
      if (filter.cacheHit !== undefined) {
        conditions.push(eq(aiAuditLogs.cacheHit, filter.cacheHit));
      }
      
      // Count total matching records
      const countResult = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(aiAuditLogs)
        .where(and(...conditions));
      
      const total = countResult[0]?.count || 0;
      
      // Build order by
      let orderByColumn;
      switch (filter.orderBy) {
        case 'timestamp':
          orderByColumn = aiAuditLogs.timestamp;
          break;
        case 'duration':
          orderByColumn = aiAuditLogs.totalDurationMs;
          break;
        case 'tokens':
          orderByColumn = aiAuditLogs.totalTokens;
          break;
        default:
          orderByColumn = aiAuditLogs.timestamp;
      }
      
      const orderByClause = filter.orderDirection === 'asc' 
        ? orderByColumn 
        : desc(orderByColumn);
      
      // Fetch entries
      const limit = filter.limit || 100;
      const offset = filter.offset || 0;
      
      const results = await db
        .select()
        .from(aiAuditLogs)
        .where(and(...conditions))
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);
      
      const entries = results.map((result: any) => this.mapToAuditEntry(result));
      const hasMore = offset + results.length < total;
      
      return { entries, total, hasMore };
    } catch (error) {
      console.error('[AuditService] Failed to get executions:', error);
      return { entries: [], total: 0, hasMore: false };
    }
  }
  
  async getMetrics(
    startDate: Date,
    endDate: Date,
    organizationId?: string
  ): Promise<AuditMetrics> {
    try {
      const conditions = [
        gte(aiAuditLogs.timestamp, startDate),
        lte(aiAuditLogs.timestamp, endDate)
      ];
      
      if (organizationId) {
        conditions.push(eq(aiAuditLogs.organizationId, organizationId));
      }
      
      // Get all logs for the period
      const logs = await db
        .select()
        .from(aiAuditLogs)
        .where(and(...conditions));
      
      // Calculate metrics
      const totalExecutions = logs.length;
      const successfulExecutions = logs.filter((log: any) => log.response?.success === true).length;
      const failedExecutions = logs.filter((log: any) => log.response?.success === false).length;
      const cacheHits = logs.filter((log: any) => log.cacheHit).length;
      
      // Performance metrics
      const durations = logs.map((log: any) => log.totalDurationMs).filter((d: any) => d !== null);
      durations.sort((a: number, b: number) => a - b);
      
      const avgDurationMs = durations.length > 0 
        ? durations.reduce((sum: number, d: number) => sum + d, 0) / durations.length 
        : 0;
      
      const p50DurationMs = this.percentile(durations, 0.5);
      const p95DurationMs = this.percentile(durations, 0.95);
      const p99DurationMs = this.percentile(durations, 0.99);
      
      // Token usage metrics
      const totalTokensUsed = logs.reduce((sum: number, log: any) => sum + (log.totalTokens || 0), 0);
      const avgTokensPerRequest = totalExecutions > 0 ? totalTokensUsed / totalExecutions : 0;
      const estimatedTotalCost = logs.reduce((sum: number, log: any) => sum + (log.estimatedCost || 0), 0);
      
      // Breakdown by pipeline
      const pipelineTypes: PipelineType[] = ['safety_check', 'billing_cpt', 'billing_icd10', 'treatment_progress', 'chat_with_chart'];
      const byPipeline = {} as Record<PipelineType, any>;
      
      for (const pipelineType of pipelineTypes) {
        const pipelineLogs = logs.filter((log: any) => log.pipelineType === pipelineType);
        const pipelineSuccesses = pipelineLogs.filter((log: any) => log.response?.success === true).length;
        const pipelineDurations = pipelineLogs.map((log: any) => log.totalDurationMs).filter((d: any) => d !== null);
        const pipelineTokens = pipelineLogs.reduce((sum: number, log: any) => sum + (log.totalTokens || 0), 0);
        
        byPipeline[pipelineType] = {
          count: pipelineLogs.length,
          avgDurationMs: pipelineDurations.length > 0
            ? pipelineDurations.reduce((sum: number, d: number) => sum + d, 0) / pipelineDurations.length
            : 0,
          successRate: pipelineLogs.length > 0 ? pipelineSuccesses / pipelineLogs.length : 0,
          avgTokens: pipelineLogs.length > 0 ? pipelineTokens / pipelineLogs.length : 0
        };
      }
      
      // Error analysis
      const errorMap = new Map<string, { count: number; message: string }>();
      logs.filter((log: any) => log.response?.error).forEach((log: any) => {
        const errorCode = log.response!.errorCode || 'UNKNOWN';
        const existing = errorMap.get(errorCode);
        if (existing) {
          existing.count++;
        } else {
          errorMap.set(errorCode, {
            count: 1,
            message: log.response!.error || 'Unknown error'
          });
        }
      });
      
      const topErrors = Array.from(errorMap.entries())
        .map(([errorCode, data]) => ({
          errorCode,
          count: data.count,
          message: data.message
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      return {
        timeRange: { start: startDate, end: endDate },
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        cacheHits,
        avgDurationMs,
        p50DurationMs,
        p95DurationMs,
        p99DurationMs,
        totalTokensUsed,
        avgTokensPerRequest,
        estimatedTotalCost,
        byPipeline,
        topErrors
      };
    } catch (error) {
      console.error('[AuditService] Failed to get metrics:', error);
      throw error;
    }
  }
  
  async exportAuditLog(filter: AuditFilter, format: 'json' | 'csv'): Promise<Buffer> {
    try {
      const { entries } = await this.getExecutions({ ...filter, limit: 10000 });
      
      if (format === 'json') {
        return Buffer.from(JSON.stringify(entries, null, 2));
      } else {
        // CSV format
        const headers = [
          'executionId',
          'timestamp',
          'pipelineType',
          'patientId',
          'sessionId',
          'userId',
          'organizationId',
          'success',
          'duration_ms',
          'cache_hit',
          'prompt_tokens',
          'completion_tokens',
          'total_tokens',
          'estimated_cost',
          'error'
        ];
        
        const rows = entries.map(entry => [
          entry.executionId,
          entry.timestamp.toISOString(),
          entry.pipelineType,
          entry.patientId,
          entry.sessionId || '',
          entry.userId,
          entry.organizationId,
          entry.response?.success?.toString() || '',
          entry.performance.totalDurationMs.toString(),
          entry.performance.cacheHit.toString(),
          entry.performance.tokenUsage?.prompt?.toString() || '',
          entry.performance.tokenUsage?.completion?.toString() || '',
          entry.performance.tokenUsage?.total?.toString() || '',
          entry.performance.tokenUsage?.estimatedCost?.toString() || '',
          entry.response?.error || ''
        ]);
        
        const csv = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        return Buffer.from(csv);
      }
    } catch (error) {
      console.error('[AuditService] Failed to export audit log:', error);
      throw error;
    }
  }
  
  async cleanup(retentionDays: number): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      // Count records to be deleted first
      const toDelete = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(aiAuditLogs)
        .where(lte(aiAuditLogs.timestamp, cutoffDate));
      
      const deleteCount = toDelete[0]?.count || 0;
      
      // Only delete if there are records to delete
      if (deleteCount > 0) {
        await db
          .delete(aiAuditLogs)
          .where(lte(aiAuditLogs.timestamp, cutoffDate));
        
        console.log(`[AuditService] Deleted ${deleteCount} audit records older than ${retentionDays} days`);
      }
      
      return deleteCount;
    } catch (error) {
      console.error('[AuditService] Failed to cleanup:', error);
      return 0;
    }
  }
  
  async healthCheck(): Promise<{
    healthy: boolean;
    latencyMs: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      // Simple query to check database connectivity
      await db
        .select({ count: sql<number>`1` })
        .from(aiAuditLogs)
        .limit(1);
      
      return {
        healthy: true,
        latencyMs: Date.now() - startTime
      };
    } catch (error) {
      return {
        healthy: false,
        latencyMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Add event listener
   */
  addEventListener(listener: AuditEventListener): void {
    this.eventListeners.push(listener);
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(listener: AuditEventListener): void {
    const index = this.eventListeners.indexOf(listener);
    if (index !== -1) {
      this.eventListeners.splice(index, 1);
    }
  }
  
  // Private helper methods
  
  private truncateData(data: any): any {
    const json = JSON.stringify(data);
    if (json.length <= this.config.maxDataSizeBytes) {
      return data;
    }
    
    // Truncate and add indicator
    return {
      ...data,
      _truncated: true,
      _originalSize: json.length
    };
  }
  
  private calculateCost(tokenUsage?: { prompt: number; completion: number; total: number }): number | undefined {
    if (!tokenUsage || !this.config.calculateCosts || !this.config.costPerToken) {
      return undefined;
    }
    
    const promptCost = (tokenUsage.prompt / 1000) * this.config.costPerToken.prompt;
    const completionCost = (tokenUsage.completion / 1000) * this.config.costPerToken.completion;
    
    return promptCost + completionCost;
  }
  
  private mapToAuditEntry(log: any): AuditEntry {
    return {
      id: log.id,
      executionId: log.executionId,
      pipelineType: log.pipelineType as PipelineType,
      patientId: log.patientId,
      sessionId: log.sessionId,
      userId: log.userId,
      organizationId: log.organizationId,
      timestamp: log.timestamp,
      request: log.request,
      response: log.response,
      performance: {
        totalDurationMs: log.totalDurationMs,
        contextAggregationMs: log.contextAggregationMs,
        promptCompilationMs: log.promptCompilationMs,
        llmExecutionMs: log.llmExecutionMs,
        validationMs: log.validationMs,
        cacheHit: log.cacheHit,
        tokenUsage: log.promptTokens ? {
          prompt: log.promptTokens,
          completion: log.completionTokens || 0,
          total: log.totalTokens || 0,
          estimatedCost: log.estimatedCost
        } : undefined
      },
      metadata: log.metadata
    };
  }
  
  private percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    
    const index = Math.ceil(values.length * p) - 1;
    return values[Math.max(0, Math.min(index, values.length - 1))];
  }
  
  private emitEvent(event: AuditEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('[AuditService] Event listener error:', error);
      }
    }
  }
}

/**
 * Create a PostgreSQL audit service instance
 */
export function createPostgresAuditService(config?: Partial<AuditConfig>): AuditService {
  return new PostgresAuditService(config);
}
