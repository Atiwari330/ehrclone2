/**
 * AI Service Core Types
 * 
 * Central types and interfaces for the AI service layer
 */

import type { z } from 'zod';
import type { PipelineType } from '@/lib/ai/types/pipeline';
import type { PatientContext } from '@/lib/types/patient-context';
import type { PromptTemplate } from '@/lib/ai/types/prompt-template';
import type { TokenUsage } from './audit/types';

/**
 * Main AI Service interface
 */
export interface AIService {
  /**
   * Analyze data using a specific pipeline
   */
  analyze<T extends PipelineType>(
    pipelineType: T,
    options: AIExecutionOptions<T>
  ): Promise<AIServiceResult<T>>;
  
  /**
   * Batch analyze multiple requests
   */
  analyzeBatch<T extends PipelineType>(
    requests: BatchRequest<T>[]
  ): Promise<BatchResult<T>[]>;
  
  /**
   * Invalidate cache entries
   */
  invalidateCache(pattern?: string): Promise<void>;
  
  /**
   * Get cache statistics
   */
  getCacheStats(): Promise<CacheStats>;
  
  /**
   * Health check
   */
  healthCheck(): Promise<HealthStatus>;
}

/**
 * Execution options for AI operations
 */
export interface AIExecutionOptions<T extends PipelineType> {
  patientId: string;
  sessionId?: string;
  userId: string;
  organizationId: string;
  purpose: T;
  variables?: Record<string, any>;
  skipCache?: boolean;
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, any>;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Result of an AI operation
 */
export interface AIServiceResult<T extends PipelineType> {
  success: boolean;
  data?: InferredOutput<T>;
  error?: AIServiceError;
  metadata: ExecutionMetadata;
}

/**
 * Execution metadata
 */
export interface ExecutionMetadata {
  executionId: string;
  pipelineType: PipelineType;
  promptId: string;
  promptVersion: string;
  modelUsed: string;
  tokenUsage?: TokenUsage;
  latencyMs: number;
  latencyBreakdown?: {
    contextAggregationMs?: number;
    promptCompilationMs?: number;
    llmExecutionMs?: number;
    validationMs?: number;
  };
  cacheHit: boolean;
  timestamp: Date;
  retryCount?: number;
}

/**
 * Batch request
 */
export interface BatchRequest<T extends PipelineType> {
  id: string;
  pipelineType: T;
  options: AIExecutionOptions<T>;
}

/**
 * Batch result
 */
export interface BatchResult<T extends PipelineType> {
  id: string;
  result: AIServiceResult<T>;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  totalKeys: number;
  memoryUsedMB: number;
  hitRate: number;
  missRate: number;
  evictions: number;
  avgResponseTimeMs: number;
  itemsByPipeline: Record<PipelineType, number>;
}

/**
 * Health status
 */
export interface HealthStatus {
  healthy: boolean;
  services: {
    cache: ComponentHealth;
    audit: ComponentHealth;
    context: ComponentHealth;
    llm: ComponentHealth;
  };
  latencyMs: number;
  timestamp: Date;
}

/**
 * Component health
 */
export interface ComponentHealth {
  healthy: boolean;
  latencyMs: number;
  error?: string;
  details?: Record<string, any>;
}

/**
 * AI Service error class
 */
export class AIServiceError extends Error {
  constructor(
    public code: AIErrorCode,
    public message: string,
    public context?: Record<string, any>,
    public cause?: Error
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

/**
 * Error codes
 */
export enum AIErrorCode {
  // Context errors
  CONTEXT_AGGREGATION_FAILED = 'CONTEXT_001',
  PATIENT_NOT_FOUND = 'CONTEXT_002',
  INSUFFICIENT_CONTEXT = 'CONTEXT_003',
  
  // Prompt errors
  PROMPT_NOT_FOUND = 'PROMPT_001',
  PROMPT_COMPILATION_FAILED = 'PROMPT_002',
  PROMPT_TOO_LARGE = 'PROMPT_003',
  
  // LLM errors
  LLM_TIMEOUT = 'LLM_001',
  LLM_RATE_LIMIT = 'LLM_002',
  LLM_INVALID_RESPONSE = 'LLM_003',
  LLM_CONNECTION_ERROR = 'LLM_004',
  
  // Validation errors
  OUTPUT_VALIDATION_FAILED = 'VALIDATION_001',
  SCHEMA_MISMATCH = 'VALIDATION_002',
  MISSING_REQUIRED_FIELDS = 'VALIDATION_003',
  
  // System errors
  CACHE_ERROR = 'SYSTEM_001',
  AUDIT_ERROR = 'SYSTEM_002',
  CONFIGURATION_ERROR = 'SYSTEM_003',
  UNKNOWN_ERROR = 'SYSTEM_999'
}

/**
 * Error recovery strategies
 */
export interface ErrorRecoveryStrategy {
  strategy: 'retry' | 'fallback' | 'queue' | 'fail';
  maxAttempts?: number;
  backoff?: 'linear' | 'exponential';
  delayMs?: number;
  fallbackAction?: string;
}

/**
 * Error recovery configuration
 */
export const ERROR_RECOVERY_CONFIG: Record<AIErrorCode, ErrorRecoveryStrategy> = {
  [AIErrorCode.CONTEXT_AGGREGATION_FAILED]: { strategy: 'retry', maxAttempts: 2, backoff: 'linear', delayMs: 1000 },
  [AIErrorCode.PATIENT_NOT_FOUND]: { strategy: 'fail' },
  [AIErrorCode.INSUFFICIENT_CONTEXT]: { strategy: 'fail' },
  
  [AIErrorCode.PROMPT_NOT_FOUND]: { strategy: 'fail' },
  [AIErrorCode.PROMPT_COMPILATION_FAILED]: { strategy: 'retry', maxAttempts: 2 },
  [AIErrorCode.PROMPT_TOO_LARGE]: { strategy: 'fallback', fallbackAction: 'truncate_context' },
  
  [AIErrorCode.LLM_TIMEOUT]: { strategy: 'retry', maxAttempts: 3, backoff: 'exponential', delayMs: 1000 },
  [AIErrorCode.LLM_RATE_LIMIT]: { strategy: 'queue', delayMs: 60000 },
  [AIErrorCode.LLM_INVALID_RESPONSE]: { strategy: 'retry', maxAttempts: 2 },
  [AIErrorCode.LLM_CONNECTION_ERROR]: { strategy: 'retry', maxAttempts: 3, backoff: 'exponential', delayMs: 2000 },
  
  [AIErrorCode.OUTPUT_VALIDATION_FAILED]: { strategy: 'fallback', fallbackAction: 'use_raw_output' },
  [AIErrorCode.SCHEMA_MISMATCH]: { strategy: 'fail' },
  [AIErrorCode.MISSING_REQUIRED_FIELDS]: { strategy: 'retry', maxAttempts: 2 },
  
  [AIErrorCode.CACHE_ERROR]: { strategy: 'fail' }, // Continue without cache
  [AIErrorCode.AUDIT_ERROR]: { strategy: 'fail' }, // Continue without audit
  [AIErrorCode.CONFIGURATION_ERROR]: { strategy: 'fail' },
  [AIErrorCode.UNKNOWN_ERROR]: { strategy: 'fail' }
};

/**
 * Pipeline output type mapping
 */
export interface PipelineOutputMap {
  safety_check: z.infer<typeof import('@/lib/ai/schemas/safety-check').safetyCheckOutputSchema>;
  billing_cpt: z.infer<typeof import('@/lib/ai/schemas/billing').billingOutputSchema>;
  billing_icd10: z.infer<typeof import('@/lib/ai/schemas/billing').billingOutputSchema>;
  treatment_progress: z.infer<typeof import('@/lib/ai/schemas/treatment-progress').treatmentProgressOutputSchema>;
  chat_with_chart: { response: string; confidence: number };
}

/**
 * Inferred output type helper
 */
export type InferredOutput<T extends PipelineType> = PipelineOutputMap[T];

/**
 * Compiled prompt with all variables resolved
 */
export interface CompiledPrompt {
  text: string;
  estimatedTokens: number;
  variables: Record<string, any>;
  metadata: {
    promptId: string;
    promptVersion: string;
    pipelineType: PipelineType;
  };
}

/**
 * LLM response
 */
export interface LLMResponse {
  text: string;
  usage: TokenUsage;
  model: string;
  finishReason: string;
  metadata?: Record<string, any>;
}

/**
 * Execution configuration
 */
export interface ExecutionConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  timeout?: number;
}

/**
 * AI Service configuration
 */
export interface AIServiceConfig {
  cache: {
    enabled: boolean;
    type: 'memory' | 'redis';
    config?: any;
  };
  audit: {
    enabled: boolean;
    config?: any;
  };
  llm: {
    provider: 'openai' | 'anthropic' | 'azure';
    apiKey: string;
    defaultModel: string;
    timeout: number;
    maxRetries: number;
  };
  performance: {
    maxConcurrentRequests: number;
    requestTimeout: number;
    enableBatching: boolean;
    batchSize: number;
    batchTimeout: number;
  };
  security: {
    sanitizeInputs: boolean;
    maxInputLength: number;
    allowedPipelineTypes?: PipelineType[];
  };
}

/**
 * Default AI Service configuration
 */
export const DEFAULT_AI_SERVICE_CONFIG: AIServiceConfig = {
  cache: {
    enabled: true,
    type: 'memory'
  },
  audit: {
    enabled: true
  },
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || '',
    defaultModel: 'gpt-4',
    timeout: 30000, // 30 seconds
    maxRetries: 3
  },
  performance: {
    maxConcurrentRequests: 10,
    requestTimeout: 60000, // 60 seconds
    enableBatching: false,
    batchSize: 10,
    batchTimeout: 1000 // 1 second
  },
  security: {
    sanitizeInputs: true,
    maxInputLength: 100000 // ~25k tokens
  }
};
