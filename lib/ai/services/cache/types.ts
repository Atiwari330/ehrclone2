/**
 * AI Cache Types and Interfaces
 * 
 * Provides caching capabilities for AI service results to improve performance
 * and reduce redundant LLM calls.
 */

import type { PipelineType } from '@/lib/ai/types/pipeline';

/**
 * Represents an item stored in the cache
 */
export interface CachedItem<T = any> {
  key: string;
  value: T;
  metadata: CacheMetadata;
  expiresAt: Date;
}

/**
 * Metadata associated with a cached item
 */
export interface CacheMetadata {
  pipelineType: PipelineType;
  promptVersion: string;
  patientId: string;
  sessionId?: string;
  createdAt: Date;
  hitCount: number;
  lastAccessedAt: Date;
  tags?: string[];
}

/**
 * Statistics about cache performance
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
 * Configuration for cache behavior
 */
export interface CacheConfig {
  // Time-to-live in seconds by pipeline type
  ttl: Partial<Record<PipelineType, number>> & {
    default: number;
  };
  
  // Maximum number of items in cache
  maxSize: number;
  
  // Maximum memory usage in MB
  maxMemoryMB: number;
  
  // Eviction policy when cache is full
  evictionPolicy: 'LRU' | 'LFU' | 'FIFO';
  
  // Whether to compress cached values
  enableCompression?: boolean;
  
  // Redis-specific configuration
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
  };
}

/**
 * Parameters for generating cache keys
 */
export interface CacheKeyParams {
  pipelineType: PipelineType;
  patientId: string;
  promptVersion: string;
  variables?: Record<string, any>;
  sessionId?: string;
}

/**
 * Main cache interface
 */
export interface AICache {
  /**
   * Get an item from the cache
   */
  get<T = any>(key: string): Promise<CachedItem<T> | null>;
  
  /**
   * Set an item in the cache
   */
  set<T = any>(
    key: string,
    value: T,
    metadata: Omit<CacheMetadata, 'createdAt' | 'hitCount' | 'lastAccessedAt'>,
    ttlSeconds?: number
  ): Promise<void>;
  
  /**
   * Delete an item from the cache
   */
  delete(key: string): Promise<boolean>;
  
  /**
   * Clear items matching a pattern
   */
  clear(pattern?: string): Promise<number>;
  
  /**
   * Get cache statistics
   */
  getStats(): Promise<CacheStats>;
  
  /**
   * Check if a key exists
   */
  has(key: string): Promise<boolean>;
  
  /**
   * Get all keys matching a pattern
   */
  keys(pattern?: string): Promise<string[]>;
  
  /**
   * Update metadata for a cached item (e.g., increment hit count)
   */
  touch(key: string): Promise<boolean>;
  
  /**
   * Get the remaining TTL for a key in seconds
   */
  ttl(key: string): Promise<number>;
  
  /**
   * Warm up the cache with preloaded data
   */
  warmUp?(data: Array<{ key: string; value: any; metadata: Omit<CacheMetadata, 'createdAt' | 'hitCount' | 'lastAccessedAt'> }>): Promise<void>;
  
  /**
   * Shutdown and cleanup resources
   */
  shutdown(): Promise<void>;
}

/**
 * Interface for cache key generation
 */
export interface CacheKeyGenerator {
  /**
   * Generate a cache key from parameters
   */
  generate(params: CacheKeyParams): string;
  
  /**
   * Parse a cache key back into its components
   */
  parse(key: string): Partial<CacheKeyParams>;
  
  /**
   * Generate a pattern for matching keys
   */
  pattern(params: Partial<CacheKeyParams>): string;
}

/**
 * Cache event types for monitoring
 */
export type CacheEvent = 
  | { type: 'hit'; key: string; latencyMs: number }
  | { type: 'miss'; key: string; latencyMs: number }
  | { type: 'set'; key: string; ttl: number; size: number }
  | { type: 'delete'; key: string; reason: 'manual' | 'expired' | 'evicted' }
  | { type: 'error'; key?: string; error: Error };

/**
 * Cache event listener
 */
export interface CacheEventListener {
  (event: CacheEvent): void;
}

/**
 * Default cache configuration
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: {
    safety_check: 300,        // 5 minutes
    billing_cpt: 3600,        // 1 hour
    billing_icd10: 3600,      // 1 hour
    treatment_progress: 1800, // 30 minutes
    chat_with_chart: 300,     // 5 minutes
    default: 600              // 10 minutes
  },
  maxSize: 1000,
  maxMemoryMB: 100,
  evictionPolicy: 'LRU',
  enableCompression: false
};
