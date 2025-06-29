/**
 * In-Memory Cache Implementation
 * 
 * Development cache using Map with LRU eviction and TTL support
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

/**
 * LRU Cache node for doubly linked list
 */
interface LRUNode<T> {
  key: string;
  value: CachedItem<T>;
  prev: LRUNode<T> | null;
  next: LRUNode<T> | null;
}

/**
 * In-memory cache with LRU eviction
 */
export class InMemoryAICache implements AICache {
  private cache: Map<string, LRUNode<any>>;
  private head: LRUNode<any> | null = null;
  private tail: LRUNode<any> | null = null;
  private config: CacheConfig;
  private stats: {
    hits: number;
    misses: number;
    evictions: number;
    totalLatency: number;
    requestCount: number;
  };
  private eventListeners: CacheEventListener[] = [];
  private memoryUsage = 0;
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalLatency: 0,
      requestCount: 0
    };
    
    // Start cleanup interval for expired items
    this.startCleanupInterval();
  }
  
  async get<T = any>(key: string): Promise<CachedItem<T> | null> {
    const startTime = Date.now();
    
    try {
      const node = this.cache.get(key);
      
      if (!node) {
        this.stats.misses++;
        this.emitEvent({ type: 'miss', key, latencyMs: Date.now() - startTime });
        return null;
      }
      
      // Check if expired
      if (new Date() > node.value.expiresAt) {
        await this.delete(key);
        this.stats.misses++;
        this.emitEvent({ type: 'miss', key, latencyMs: Date.now() - startTime });
        return null;
      }
      
      // Move to front (most recently used)
      this.moveToFront(node);
      
      // Update metadata
      node.value.metadata.hitCount++;
      node.value.metadata.lastAccessedAt = new Date();
      
      this.stats.hits++;
      this.stats.requestCount++;
      this.stats.totalLatency += Date.now() - startTime;
      
      this.emitEvent({ type: 'hit', key, latencyMs: Date.now() - startTime });
      
      return node.value;
    } catch (error) {
      this.emitEvent({ type: 'error', key, error: error as Error });
      throw error;
    }
  }
  
  async set<T = any>(
    key: string,
    value: T,
    metadata: Omit<CacheMetadata, 'createdAt' | 'hitCount' | 'lastAccessedAt'>,
    ttlSeconds?: number
  ): Promise<void> {
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
      
      // Estimate size (rough approximation)
      const estimatedSize = this.estimateSize(cachedItem);
      
      // Check memory limit
      if (this.memoryUsage + estimatedSize > this.config.maxMemoryMB * 1024 * 1024) {
        await this.evictToFitMemory(estimatedSize);
      }
      
      // Check size limit
      if (this.cache.size >= this.config.maxSize) {
        await this.evictLRU();
      }
      
      // Create new node
      const node: LRUNode<T> = {
        key,
        value: cachedItem,
        prev: null,
        next: null
      };
      
      // Remove old node if exists
      const existingNode = this.cache.get(key);
      if (existingNode) {
        this.removeNode(existingNode);
        this.memoryUsage -= this.estimateSize(existingNode.value);
      }
      
      // Add to cache and front of list
      this.cache.set(key, node);
      this.addToFront(node);
      this.memoryUsage += estimatedSize;
      
      this.emitEvent({ 
        type: 'set', 
        key, 
        ttl, 
        size: estimatedSize 
      });
    } catch (error) {
      this.emitEvent({ type: 'error', key, error: error as Error });
      throw error;
    }
  }
  
  async delete(key: string): Promise<boolean> {
    const node = this.cache.get(key);
    
    if (!node) {
      return false;
    }
    
    this.removeNode(node);
    this.cache.delete(key);
    this.memoryUsage -= this.estimateSize(node.value);
    
    this.emitEvent({ 
      type: 'delete', 
      key, 
      reason: 'manual' 
    });
    
    return true;
  }
  
  async clear(pattern?: string): Promise<number> {
    let count = 0;
    
    if (!pattern) {
      // Clear all
      count = this.cache.size;
      this.cache.clear();
      this.head = null;
      this.tail = null;
      this.memoryUsage = 0;
    } else {
      // Clear by pattern
      const regex = this.patternToRegex(pattern);
      const keysToDelete: string[] = [];
      
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      }
      
      for (const key of keysToDelete) {
        await this.delete(key);
        count++;
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
      chat_with_chart: 0,
      clinical_note: 0
    };
    
    for (const node of this.cache.values()) {
      const pipelineType = node.value.metadata.pipelineType;
      itemsByPipeline[pipelineType]++;
    }
    
    const totalRequests = this.stats.hits + this.stats.misses;
    
    return {
      totalKeys: this.cache.size,
      memoryUsedMB: this.memoryUsage / (1024 * 1024),
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
    const node = this.cache.get(key);
    
    if (!node) {
      return false;
    }
    
    // Check if expired
    if (new Date() > node.value.expiresAt) {
      await this.delete(key);
      return false;
    }
    
    return true;
  }
  
  async keys(pattern?: string): Promise<string[]> {
    const keys: string[] = [];
    const regex = pattern ? this.patternToRegex(pattern) : null;
    
    for (const [key, node] of this.cache.entries()) {
      // Skip expired items
      if (new Date() > node.value.expiresAt) {
        continue;
      }
      
      if (!regex || regex.test(key)) {
        keys.push(key);
      }
    }
    
    return keys;
  }
  
  async touch(key: string): Promise<boolean> {
    const node = this.cache.get(key);
    
    if (!node || new Date() > node.value.expiresAt) {
      return false;
    }
    
    // Update access time and move to front
    node.value.metadata.lastAccessedAt = new Date();
    this.moveToFront(node);
    
    return true;
  }
  
  async ttl(key: string): Promise<number> {
    const node = this.cache.get(key);
    
    if (!node) {
      return -1;
    }
    
    const remainingMs = node.value.expiresAt.getTime() - Date.now();
    
    if (remainingMs <= 0) {
      return -1;
    }
    
    return Math.floor(remainingMs / 1000);
  }
  
  async warmUp(data: Array<{ key: string; value: any; metadata: Omit<CacheMetadata, 'createdAt' | 'hitCount' | 'lastAccessedAt'> }>): Promise<void> {
    for (const item of data) {
      await this.set(item.key, item.value, item.metadata);
    }
  }
  
  async shutdown(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.cache.clear();
    this.head = null;
    this.tail = null;
    this.memoryUsage = 0;
    this.eventListeners = [];
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
  
  private moveToFront(node: LRUNode<any>): void {
    if (node === this.head) {
      return;
    }
    
    this.removeNode(node);
    this.addToFront(node);
  }
  
  private addToFront(node: LRUNode<any>): void {
    node.next = this.head;
    node.prev = null;
    
    if (this.head) {
      this.head.prev = node;
    }
    
    this.head = node;
    
    if (!this.tail) {
      this.tail = node;
    }
  }
  
  private removeNode(node: LRUNode<any>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }
  
  private async evictLRU(): Promise<void> {
    if (!this.tail) {
      return;
    }
    
    const key = this.tail.key;
    await this.delete(key);
    this.stats.evictions++;
    
    this.emitEvent({ 
      type: 'delete', 
      key, 
      reason: 'evicted' 
    });
  }
  
  private async evictToFitMemory(requiredSize: number): Promise<void> {
    let freedMemory = 0;
    
    while (this.tail && freedMemory < requiredSize) {
      const node = this.tail;
      const size = this.estimateSize(node.value);
      
      await this.delete(node.key);
      freedMemory += size;
      this.stats.evictions++;
      
      this.emitEvent({ 
        type: 'delete', 
        key: node.key, 
        reason: 'evicted' 
      });
    }
  }
  
  private estimateSize(item: CachedItem<any>): number {
    // Rough estimation of object size in bytes
    const str = JSON.stringify(item);
    return str.length * 2; // 2 bytes per character
  }
  
  private patternToRegex(pattern: string): RegExp {
    // Convert wildcard pattern to regex
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = escaped.replace(/\*/g, '.*');
    return new RegExp(`^${regex}$`);
  }
  
  private emitEvent(event: CacheEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('[InMemoryCache] Event listener error:', error);
      }
    }
  }
  
  private startCleanupInterval(): void {
    // Clean up expired items every minute
    this.cleanupInterval = setInterval(async () => {
      const now = new Date();
      const keysToDelete: string[] = [];
      
      for (const [key, node] of this.cache.entries()) {
        if (now > node.value.expiresAt) {
          keysToDelete.push(key);
        }
      }
      
      for (const key of keysToDelete) {
        await this.delete(key);
        this.emitEvent({ 
          type: 'delete', 
          key, 
          reason: 'expired' 
        });
      }
    }, 60000); // 1 minute
  }
}

/**
 * Create an in-memory cache instance
 */
export function createInMemoryCache(config?: Partial<CacheConfig>): AICache {
  return new InMemoryAICache(config);
}
