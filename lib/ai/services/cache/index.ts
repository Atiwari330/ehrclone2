/**
 * AI Cache Module
 * 
 * Exports all cache-related functionality
 */

// Types
export type {
  AICache,
  CachedItem,
  CacheMetadata,
  CacheStats,
  CacheConfig,
  CacheKeyParams,
  CacheKeyGenerator,
  CacheEvent,
  CacheEventListener
} from './types';

export { DEFAULT_CACHE_CONFIG } from './types';

// Cache implementations
export { InMemoryAICache, createInMemoryCache } from './in-memory-cache';
export { 
  RedisAICache, 
  createRedisCache, 
  createRedisCacheWithClient 
} from './redis-cache';

// Cache key generator
export {
  DefaultCacheKeyGenerator,
  getCacheKeyGenerator,
  generateCacheKey,
  parseCacheKey,
  createKeyPattern
} from './cache-key-generator';

import type { AICache } from './types';
import type { CacheConfig } from './types';
import { createInMemoryCache } from './in-memory-cache';
import { createRedisCache } from './redis-cache';

// Factory function to create appropriate cache based on environment
export function createAICache(config?: Partial<CacheConfig>): AICache {
  // In production, check for Redis availability
  if (process.env.REDIS_URL) {
    console.log('[AICache] Redis URL found, creating Redis cache');
    return createRedisCache(config);
  }
  
  // Default to in-memory cache
  console.log('[AICache] Using in-memory cache');
  return createInMemoryCache(config);
}
