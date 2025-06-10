/**
 * Redis Cache Implementation
 * 
 * Production cache using Redis with memory cache L1 layer
 */

import type { 
  AICache, 
  CachedItem, 
  CacheMetadata, 
  CacheStats, 
  CacheConfig,
  CacheEventListener,
  CacheEvent
} from './types';
import { DEFAULT_CACHE_CONFIG } from './types';
import type { PipelineType } from '@/lib/ai/types/pipeline';

// Stub Redis client type - in production, use 'ioredis' or similar
interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<string | null>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  ttl(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  flushdb(): Promise<string>;
  info(section?: string): Promise<string>;
  scan(cursor: string, ...args: any[]): Promise<[string, string[]]>;
}

/**
 * Simple LRU cache for L1 layer
 */
class SimpleLRUCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private maxSize: number;
  private ttlMs: number;
  
  constructor(maxSize = 100, ttlMs = 60000) { // 1 minute default
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.value;
  }
  
  set(key: string, value: T): void {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    
    this.cache.set(key, { value, timestamp: Date.now() });
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

/**
 * Redis cache with L1 memory cache layer
 */
export class RedisAICache implements AICache {
  private redis: RedisClient | null = null;
  private l1Cache: SimpleLRUCache<CachedItem<any>>;
  private config: CacheConfig;
  private stats: {
    hits: number;
    misses: number;
    evictions: number;
    totalLatency: number;
    requestCount: number;
    l1Hits: number;
    l2Hits: number;
  };
  private eventListeners: CacheEventListener[] = [];
  private keyPrefix: string;
  
  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.keyPrefix = this.config.redis?.keyPrefix || 'ai:';
    this.l1Cache = new SimpleLRUCache(100, 60000); // 100 items, 1 minute TTL
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalLatency: 0,
      requestCount: 0,
      l1Hits: 0,
      l2Hits: 0
    };
    
    // Note: In production, initialize Redis client here
    console.warn('[RedisAICache] Redis client not initialized. Install ioredis for production use.');
  }
  
  async get<T = any>(key: string): Promise<CachedItem<T> | null> {
    const startTime = Date.now();
    const prefixedKey = this.keyPrefix + key;
    
    try {
      // Check L1 cache first
      const l1Result = this.l1Cache.get(prefixedKey);
      if (l1Result) {
        this.stats.hits++;
        this.stats.l1Hits++;
        this.stats.requestCount++;
        this.stats.totalLatency += Date.now() - startTime;
        
        // Update hit count
        l1Result.metadata.hitCount++;
        l1Result.metadata.lastAccessedAt = new Date();
        
        this.emitEvent({ type: 'hit', key, latencyMs: Date.now() - startTime });
        return l1Result;
      }
      
      // If Redis not available, treat as miss
      if (!this.redis) {
        this.stats.misses++;
        this.emitEvent({ type: 'miss', key, latencyMs: Date.now() - startTime });
        return null;
      }
      
      // Check L2 cache (Redis)
      const redisValue = await this.redis.get(prefixedKey);
      if (!redisValue) {
        this.stats.misses++;
        this.emitEvent({ type: 'miss', key, latencyMs: Date.now() - startTime });
        return null;
      }
      
      // Parse and validate
      const cachedItem = JSON.parse(redisValue) as CachedItem<T>;
      
      // Check if expired
      if (new Date() > new Date(cachedItem.expiresAt)) {
        await this.delete(key);
        this.stats.misses++;
        this.emitEvent({ type: 'miss', key, latencyMs: Date.now() - startTime });
        return null;
      }
      
      // Update metadata
      cachedItem.metadata.hitCount++;
      cachedItem.metadata.lastAccessedAt = new Date();
      
      // Store in L1 cache
      this.l1Cache.set(prefixedKey, cachedItem);
      
      // Update in Redis
      await this.redis.set(prefixedKey, JSON.stringify(cachedItem));
      
      this.stats.hits++;
      this.stats.l2Hits++;
      this.stats.requestCount++;
      this.stats.totalLatency += Date.now() - startTime;
      
      this.emitEvent({ type: 'hit', key, latencyMs: Date.now() - startTime });
      
      return cachedItem;
    } catch (error) {
      this.emitEvent({ type: 'error', key, error: error as Error });
      
      // Fallback to L1 cache on Redis error
      const l1Result = this.l1Cache.get(prefixedKey);
      if (l1Result) {
        return l1Result;
      }
      
      throw error;
    }
  }
  
  async set<T = any>(
    key: string,
    value: T,
    metadata: Omit<CacheMetadata, 'createdAt' | 'hitCount' | 'lastAccessedAt'>,
    ttlSeconds?: number
  ): Promise<void> {
    const prefixedKey = this.keyPrefix + key;
    
    try {
      // Calculate TTL
      const ttl = ttlSeconds ?? this.config.ttl[metadata.pipelineType] ?? this.config.ttl.default;
      const expiresAt = new Date(Date.now() + ttl * 1000);
      
      // Create cached item
      const cachedItem: CachedItem<T> = {
        key,
        value,
        metadata: {
          ...metadata,
          createdAt: new Date(),
          hitCount: 0,
          lastAccessedAt: new Date()
        },
        expiresAt
      };
      
      // Store in L1 cache
      this.l1Cache.set(prefixedKey, cachedItem);
      
      // Store in Redis if available
      if (this.redis) {
        const serialized = JSON.stringify(cachedItem);
        await this.redis.set(prefixedKey, serialized, 'EX', ttl);
      }
      
      this.emitEvent({ 
        type: 'set', 
        key, 
        ttl, 
        size: JSON.stringify(cachedItem).length 
      });
    } catch (error) {
      this.emitEvent({ type: 'error', key, error: error as Error });
      throw error;
    }
  }
  
  async delete(key: string): Promise<boolean> {
    const prefixedKey = this.keyPrefix + key;
    
    // Delete from L1
    this.l1Cache.delete(prefixedKey);
    
    // Delete from Redis
    if (this.redis) {
      const result = await this.redis.del(prefixedKey);
      this.emitEvent({ type: 'delete', key, reason: 'manual' });
      return result > 0;
    }
    
    return false;
  }
  
  async clear(pattern?: string): Promise<number> {
    let count = 0;
    
    if (!pattern) {
      // Clear all
      this.l1Cache.clear();
      
      if (this.redis) {
        const keys = await this.redis.keys(this.keyPrefix + '*');
        for (const key of keys) {
          await this.redis.del(key);
          count++;
        }
      }
    } else {
      // Clear by pattern
      const fullPattern = this.keyPrefix + pattern;
      
      if (this.redis) {
        const keys = await this.redis.keys(fullPattern);
        for (const key of keys) {
          await this.redis.del(key);
          this.l1Cache.delete(key);
          count++;
        }
      }
    }
    
    return count;
  }
  
  async getStats(): Promise<CacheStats> {
    const itemsByPipeline: Record<PipelineType, number> = {
      safety_check: 0,
      billing_cpt: 0,
      billing_icd10: 0,
      treatment_progress: 0,
      chat_with_chart: 0
    };
    
    // Count items by pipeline type
    if (this.redis) {
      const keys = await this.redis.keys(this.keyPrefix + '*');
      
      for (const key of keys) {
        try {
          const value = await this.redis.get(key);
          if (value) {
            const item = JSON.parse(value) as CachedItem;
            const pipelineType = item.metadata.pipelineType;
            if (pipelineType in itemsByPipeline) {
              itemsByPipeline[pipelineType]++;
            }
          }
        } catch {
          // Skip invalid items
        }
      }
    }
    
    const totalRequests = this.stats.hits + this.stats.misses;
    
    // Estimate memory usage
    let memoryUsedMB = 0;
    if (this.redis) {
      try {
        const info = await this.redis.info('memory');
        const match = info.match(/used_memory:(\d+)/);
        if (match) {
          memoryUsedMB = parseInt(match[1]) / (1024 * 1024);
        }
      } catch {
        // Fallback estimate
        memoryUsedMB = this.l1Cache.size() * 0.001; // Rough estimate
      }
    }
    
    return {
      totalKeys: this.redis ? await this.countKeys() : this.l1Cache.size(),
      memoryUsedMB,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.stats.misses / totalRequests : 0,
      evictions: this.stats.evictions,
      avgResponseTimeMs: this.stats.requestCount > 0 
        ? this.stats.totalLatency / this.stats.requestCount 
        : 0,
      itemsByPipeline
    };
  }
  
  async has(key: string): Promise<boolean> {
    const prefixedKey = this.keyPrefix + key;
    
    // Check L1 first
    if (this.l1Cache.get(prefixedKey)) {
      return true;
    }
    
    // Check Redis
    if (this.redis) {
      const exists = await this.redis.exists(prefixedKey);
      return exists > 0;
    }
    
    return false;
  }
  
  async keys(pattern?: string): Promise<string[]> {
    if (!this.redis) {
      return [];
    }
    
    const fullPattern = this.keyPrefix + (pattern || '*');
    const keys = await this.redis.keys(fullPattern);
    
    // Remove prefix
    return keys.map(k => k.substring(this.keyPrefix.length));
  }
  
  async touch(key: string): Promise<boolean> {
    const item = await this.get(key);
    return item !== null;
  }
  
  async ttl(key: string): Promise<number> {
    const prefixedKey = this.keyPrefix + key;
    
    if (this.redis) {
      return await this.redis.ttl(prefixedKey);
    }
    
    return -1;
  }
  
  async warmUp(data: Array<{ key: string; value: any; metadata: Omit<CacheMetadata, 'createdAt' | 'hitCount' | 'lastAccessedAt'> }>): Promise<void> {
    for (const item of data) {
      await this.set(item.key, item.value, item.metadata);
    }
  }
  
  async shutdown(): Promise<void> {
    this.l1Cache.clear();
    this.eventListeners = [];
    // Note: Don't close Redis connection as it might be shared
  }
  
  /**
   * Set Redis client
   */
  setRedisClient(redis: RedisClient): void {
    this.redis = redis;
  }
  
  /**
   * Add event listener
   */
  addEventListener(listener: CacheEventListener): void {
    this.eventListeners.push(listener);
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(listener: CacheEventListener): void {
    const index = this.eventListeners.indexOf(listener);
    if (index !== -1) {
      this.eventListeners.splice(index, 1);
    }
  }
  
  // Private methods
  
  private emitEvent(event: CacheEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('[RedisCache] Event listener error:', error);
      }
    }
  }
  
  private async countKeys(): Promise<number> {
    if (!this.redis) return 0;
    
    let count = 0;
    let cursor = '0';
    
    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        this.keyPrefix + '*',
        'COUNT',
        '100'
      );
      cursor = nextCursor;
      count += keys.length;
    } while (cursor !== '0');
    
    return count;
  }
}

/**
 * Create a Redis cache instance
 */
export function createRedisCache(config?: Partial<CacheConfig>): RedisAICache {
  return new RedisAICache(config);
}

/**
 * Create a Redis cache with client
 */
export function createRedisCacheWithClient(
  redisClient: RedisClient,
  config?: Partial<CacheConfig>
): AICache {
  const cache = new RedisAICache(config);
  cache.setRedisClient(redisClient);
  return cache;
}
