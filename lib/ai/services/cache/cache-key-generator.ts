/**
 * Cache Key Generator
 * 
 * Generates consistent, deterministic cache keys for AI service results
 */

import { createHash } from 'crypto';
import type { CacheKeyParams, CacheKeyGenerator } from './types';
import type { PipelineType } from '@/lib/ai/types/pipeline';

/**
 * Default implementation of cache key generator
 */
export class DefaultCacheKeyGenerator implements CacheKeyGenerator {
  private readonly prefix: string;
  private readonly separator: string;
  
  constructor(prefix = 'ai', separator = ':') {
    this.prefix = prefix;
    this.separator = separator;
  }
  
  /**
   * Generate a cache key from parameters
   * Format: ai:pipeline:patientId:version:hash(variables)
   */
  generate(params: CacheKeyParams): string {
    const parts = [
      this.prefix,
      params.pipelineType,
      params.patientId,
      params.promptVersion
    ];
    
    // Add session ID if present
    if (params.sessionId) {
      parts.push(params.sessionId);
    }
    
    // Add hash of variables if present
    if (params.variables && Object.keys(params.variables).length > 0) {
      const variableHash = this.hashVariables(params.variables);
      parts.push(variableHash);
    }
    
    return parts.join(this.separator);
  }
  
  /**
   * Parse a cache key back into its components
   */
  parse(key: string): Partial<CacheKeyParams> {
    const parts = key.split(this.separator);
    
    if (parts.length < 4 || parts[0] !== this.prefix) {
      return {};
    }
    
    const result: Partial<CacheKeyParams> = {
      pipelineType: parts[1] as PipelineType,
      patientId: parts[2],
      promptVersion: parts[3]
    };
    
    // Check for sessionId or variable hash
    if (parts.length === 5) {
      // Could be either sessionId or variable hash
      if (this.isHash(parts[4])) {
        // It's a variable hash (no sessionId)
      } else {
        result.sessionId = parts[4];
      }
    } else if (parts.length === 6) {
      // Both sessionId and variable hash present
      result.sessionId = parts[4];
    }
    
    return result;
  }
  
  /**
   * Generate a pattern for matching keys
   * Uses * as wildcard
   */
  pattern(params: Partial<CacheKeyParams>): string {
    const parts = [this.prefix];
    
    // Pipeline type
    parts.push(params.pipelineType || '*');
    
    // Patient ID
    parts.push(params.patientId || '*');
    
    // Prompt version
    parts.push(params.promptVersion || '*');
    
    // Add wildcards for optional fields
    if (params.sessionId !== undefined || params.variables !== undefined) {
      parts.push('*');
      
      if (params.variables !== undefined) {
        parts.push('*');
      }
    }
    
    return parts.join(this.separator);
  }
  
  /**
   * Create a deterministic hash of variables
   */
  private hashVariables(variables: Record<string, any>): string {
    // Sort keys for consistent hashing
    const sortedKeys = Object.keys(variables).sort();
    const sortedObject: Record<string, any> = {};
    
    for (const key of sortedKeys) {
      sortedObject[key] = variables[key];
    }
    
    // Create hash
    const json = JSON.stringify(sortedObject);
    const hash = createHash('sha256').update(json).digest('hex');
    
    // Return first 8 characters for brevity
    return hash.substring(0, 8);
  }
  
  /**
   * Check if a string looks like a hash
   */
  private isHash(str: string): boolean {
    return /^[a-f0-9]{8}$/.test(str);
  }
}

/**
 * Singleton instance of the default cache key generator
 */
let defaultGenerator: CacheKeyGenerator | null = null;

/**
 * Get the default cache key generator instance
 */
export function getCacheKeyGenerator(): CacheKeyGenerator {
  if (!defaultGenerator) {
    defaultGenerator = new DefaultCacheKeyGenerator();
  }
  return defaultGenerator;
}

/**
 * Helper function to generate a cache key
 */
export function generateCacheKey(params: CacheKeyParams): string {
  return getCacheKeyGenerator().generate(params);
}

/**
 * Helper function to parse a cache key
 */
export function parseCacheKey(key: string): Partial<CacheKeyParams> {
  return getCacheKeyGenerator().parse(key);
}

/**
 * Helper function to create a key pattern
 */
export function createKeyPattern(params: Partial<CacheKeyParams>): string {
  return getCacheKeyGenerator().pattern(params);
}
