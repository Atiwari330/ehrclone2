/**
 * AI Services Module
 * 
 * Central export point for all AI service functionality
 */

// Core types
export type {
  AIService,
  AIServiceConfig,
  AIExecutionOptions,
  AIServiceResult,
  ExecutionMetadata,
  BatchRequest,
  BatchResult,
  CacheStats,
  HealthStatus,
  ComponentHealth,
  InferredOutput,
  CompiledPrompt,
  LLMResponse,
  ExecutionConfig,
  PipelineOutputMap
} from './types';

export {
  AIServiceError,
  AIErrorCode,
  ERROR_RECOVERY_CONFIG,
  DEFAULT_AI_SERVICE_CONFIG
} from './types';

// Cache exports
export type {
  AICache,
  CachedItem,
  CacheMetadata,
  CacheConfig,
  CacheKeyParams,
  CacheEvent,
  CacheEventListener
} from './cache/types';

export {
  createAICache,
  InMemoryAICache,
  RedisAICache,
  generateCacheKey,
  DEFAULT_CACHE_CONFIG
} from './cache';

// Audit exports
export type {
  AuditService,
  AuditEntry,
  AuditFilter,
  AuditMetrics,
  AuditConfig,
  TokenUsage,
  AuditEvent,
  AuditEventListener
} from './audit/types';

export {
  createAuditService,
  PostgresAuditService,
  NullAuditService,
  DEFAULT_AUDIT_CONFIG
} from './audit';

// Core AI Service
export { CoreAIService, createCoreAIService } from './core-ai-service-v2';

// Factory exports
export {
  // Advanced factory functions
  createAIServiceWithConfig,
  getDefaultAIService,
  getNamedAIService,
  resetAIServices,
  resetNamedAIService,
  getActiveInstances,
  createTestAIService,
  logFactoryState
} from '../factory';

// Main factory function
import type { AIService, AIServiceConfig } from './types';
import { getDefaultAIService } from '../factory';

/**
 * Create an AI service instance with the specified configuration
 * @deprecated Use createAIServiceWithConfig from factory module for more control
 */
export async function createAIService(config?: Partial<AIServiceConfig>): Promise<AIService> {
  console.warn('[AIService] createAIService is deprecated. Use createAIServiceWithConfig from factory module');
  return getDefaultAIService(config);
}

/**
 * Get the singleton AI service instance
 * @deprecated Use getDefaultAIService or getNamedAIService from factory module
 */
export async function getAIService(config?: Partial<AIServiceConfig>): Promise<AIService> {
  console.warn('[AIService] getAIService is deprecated. Use getDefaultAIService from factory module');
  return getDefaultAIService(config);
}

/**
 * Reset the singleton instance (useful for testing)
 * @deprecated Use resetAIServices or resetNamedAIService from factory module
 */
export function resetAIService(): void {
  console.warn('[AIService] resetAIService is deprecated. Use resetAIServices from factory module');
  // Import the function to avoid circular dependency
  const { resetNamedAIService } = require('../factory');
  resetNamedAIService('default');
}

// Re-export pipeline types for convenience
export type { PipelineType } from '@/lib/ai/types/pipeline';
