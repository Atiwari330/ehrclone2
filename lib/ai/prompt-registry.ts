/**
 * Prompt Registry Implementation
 * 
 * Central storage and retrieval system for versioned prompt templates.
 * Supports semantic versioning and multiple resolution strategies.
 */

import { 
  PromptTemplate, 
  PromptRegistryEntry, 
  PromptRetrievalOptions, 
  VersionStrategy,
  PromptValidationResult,
  isPromptTemplate 
} from './types/prompt-template';
import { ChatSDKError } from '@/lib/errors';

/**
 * Custom error types for prompt registry operations
 */
export class PromptNotFoundError extends ChatSDKError {
  constructor(promptId: string, version?: string) {
    const message = version 
      ? `Prompt not found: ${promptId} version ${version}`
      : `Prompt not found: ${promptId}`;
    super('not_found:database', message);
  }
}

export class VersionConflictError extends ChatSDKError {
  constructor(promptId: string, message: string) {
    super('bad_request:database', `Version conflict for prompt ${promptId}: ${message}`);
  }
}

export class DeprecatedPromptError extends ChatSDKError {
  constructor(promptId: string, version: string) {
    super('bad_request:database', `Prompt ${promptId} version ${version} is deprecated`);
  }
}

/**
 * Prompt Registry Class
 * 
 * Manages storage and retrieval of prompt templates with versioning support
 */
export class PromptRegistry {
  // Internal storage: promptId -> version -> entry
  private registry: Map<string, Map<string, PromptRegistryEntry>> = new Map();
  
  // Cache for frequently accessed prompts
  private cache: Map<string, PromptTemplate> = new Map();
  private cacheMaxSize = 50;
  
  // Registry statistics
  private stats = {
    totalPrompts: 0,
    totalVersions: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };

  constructor() {
    console.log('[PromptRegistry] Initialized with empty registry');
  }

  /**
   * Register a new prompt template
   */
  register(template: PromptTemplate): void {
    const startTime = Date.now();
    
    // Validate template
    const validation = this.validateTemplate(template);
    if (!validation.valid) {
      console.error('[PromptRegistry] Template validation failed:', validation.errors);
      throw new ChatSDKError(
        'bad_request:api',
        `Invalid template: ${validation.errors?.map(e => e.message).join(', ')}`
      );
    }

    const { id, version } = template.metadata;
    
    // Get or create version map for this prompt ID
    if (!this.registry.has(id)) {
      this.registry.set(id, new Map());
      this.stats.totalPrompts++;
    }
    
    const versionMap = this.registry.get(id)!;
    
    // Check if version already exists
    if (versionMap.has(version)) {
      console.warn('[PromptRegistry] Overwriting existing version:', { id, version });
    }
    
    // Update previous version's isLatest flag
    const latestVersion = this.findLatestVersion(id);
    if (latestVersion && latestVersion !== version) {
      const previousEntry = versionMap.get(latestVersion);
      if (previousEntry) {
        previousEntry.isLatest = false;
      }
    }
    
    // Create registry entry
    const entry: PromptRegistryEntry = {
      template,
      registeredAt: new Date(),
      isLatest: true,
      usageCount: 0,
    };
    
    // Store the template
    versionMap.set(version, entry);
    this.stats.totalVersions++;
    
    // Clear cache for this prompt ID
    this.clearCacheForPrompt(id);
    
    console.log('[PromptRegistry] Registered template:', {
      id: template.metadata.id,
      version: template.metadata.version,
      category: template.metadata.category,
      estimatedTokens: template.metadata.estimatedTokens,
      variables: template.variables.length,
      registrationTime: Date.now() - startTime + 'ms',
    });
    
    // Log warnings if present
    if (validation.warnings && validation.warnings.length > 0) {
      console.warn('[PromptRegistry] Template registered with warnings:', validation.warnings);
    }
  }

  /**
   * Get a prompt template by ID with version resolution
   */
  async get(
    promptId: string, 
    options: PromptRetrievalOptions = {}
  ): Promise<PromptTemplate> {
    const startTime = Date.now();
    const { version, latest = true, includeDeprecated = false } = options;
    
    // Check cache first
    const cacheKey = this.getCacheKey(promptId, options);
    if (this.cache.has(cacheKey)) {
      this.stats.cacheHits++;
      console.log('[PromptRegistry] Cache hit:', { promptId, cacheKey });
      return this.cache.get(cacheKey)!;
    }
    
    this.stats.cacheMisses++;
    
    // Get version map for this prompt
    const versionMap = this.registry.get(promptId);
    if (!versionMap || versionMap.size === 0) {
      console.error('[PromptRegistry] Prompt not found:', promptId);
      throw new PromptNotFoundError(promptId);
    }
    
    // Resolve version
    let resolvedVersion: string | undefined;
    
    if (version) {
      // Exact version requested
      resolvedVersion = version;
    } else if (latest) {
      // Get latest version
      resolvedVersion = this.findLatestVersion(promptId, includeDeprecated);
    }
    
    if (!resolvedVersion) {
      console.error('[PromptRegistry] Could not resolve version:', { promptId, options });
      throw new VersionConflictError(promptId, 'No suitable version found');
    }
    
    // Get the entry
    const entry = versionMap.get(resolvedVersion);
    if (!entry) {
      console.error('[PromptRegistry] Version not found:', { promptId, version: resolvedVersion });
      throw new PromptNotFoundError(promptId, resolvedVersion);
    }
    
    // Check if deprecated
    if (entry.template.metadata.deprecatedAt && !includeDeprecated) {
      console.warn('[PromptRegistry] Attempted to use deprecated prompt:', {
        promptId,
        version: resolvedVersion,
        deprecatedAt: entry.template.metadata.deprecatedAt,
      });
      throw new DeprecatedPromptError(promptId, resolvedVersion);
    }
    
    // Update usage count
    entry.usageCount++;
    
    // Add to cache
    this.addToCache(cacheKey, entry.template);
    
    console.log('[PromptRegistry] Retrieved template:', {
      id: promptId,
      version: resolvedVersion,
      usageCount: entry.usageCount,
      retrievalTime: Date.now() - startTime + 'ms',
    });
    
    return entry.template;
  }

  /**
   * Get all versions of a prompt
   */
  getAllVersions(promptId: string): PromptTemplate[] {
    const versionMap = this.registry.get(promptId);
    if (!versionMap) {
      return [];
    }
    
    const versions = Array.from(versionMap.values())
      .map(entry => entry.template)
      .sort((a, b) => this.compareVersions(b.metadata.version, a.metadata.version));
    
    console.log('[PromptRegistry] Retrieved all versions:', {
      promptId,
      count: versions.length,
      versions: versions.map(v => v.metadata.version),
    });
    
    return versions;
  }

  /**
   * List all registered prompts
   */
  list(): Array<{ id: string; versions: string[]; latestVersion: string }> {
    const prompts: Array<{ id: string; versions: string[]; latestVersion: string }> = [];
    
    for (const [promptId, versionMap] of this.registry) {
      const versions = Array.from(versionMap.keys()).sort(this.compareVersions);
      const latestVersion = this.findLatestVersion(promptId) || versions[versions.length - 1];
      
      prompts.push({
        id: promptId,
        versions,
        latestVersion,
      });
    }
    
    console.log('[PromptRegistry] Listed prompts:', {
      totalPrompts: prompts.length,
      totalVersions: this.stats.totalVersions,
    });
    
    return prompts;
  }

  /**
   * Check if a prompt exists
   */
  has(promptId: string, version?: string): boolean {
    const versionMap = this.registry.get(promptId);
    if (!versionMap) return false;
    
    if (version) {
      return versionMap.has(version);
    }
    
    return versionMap.size > 0;
  }

  /**
   * Remove a specific version or all versions of a prompt
   */
  remove(promptId: string, version?: string): boolean {
    const versionMap = this.registry.get(promptId);
    if (!versionMap) return false;
    
    if (version) {
      // Remove specific version
      const result = versionMap.delete(version);
      if (result) {
        this.stats.totalVersions--;
        console.log('[PromptRegistry] Removed version:', { promptId, version });
      }
      
      // If no versions left, remove the prompt entirely
      if (versionMap.size === 0) {
        this.registry.delete(promptId);
        this.stats.totalPrompts--;
      }
      
      return result;
    } else {
      // Remove all versions
      const versionCount = versionMap.size;
      this.registry.delete(promptId);
      this.stats.totalPrompts--;
      this.stats.totalVersions -= versionCount;
      
      console.log('[PromptRegistry] Removed all versions:', { promptId, versionCount });
      return true;
    }
  }

  /**
   * Get registry statistics
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      cacheHitRate: this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) || 0,
    };
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[PromptRegistry] Cache cleared');
  }

  /**
   * Validate a prompt template
   */
  private validateTemplate(template: PromptTemplate): PromptValidationResult {
    const errors: Array<{ field: string; message: string }> = [];
    const warnings: Array<{ field: string; message: string }> = [];
    
    // Check if it's a valid template
    if (!isPromptTemplate(template)) {
      errors.push({ field: 'template', message: 'Invalid template structure' });
    }
    
    // Validate metadata
    if (!template.metadata.id) {
      errors.push({ field: 'metadata.id', message: 'ID is required' });
    }
    
    if (!template.metadata.version) {
      errors.push({ field: 'metadata.version', message: 'Version is required' });
    } else if (!this.isValidSemver(template.metadata.version)) {
      errors.push({ field: 'metadata.version', message: 'Invalid semantic version' });
    }
    
    // Validate template content
    if (!template.template || template.template.trim().length === 0) {
      errors.push({ field: 'template', message: 'Template content is required' });
    }
    
    // Check for undefined variables in template
    const variableNames = new Set(template.variables.map(v => v.name));
    const templateVars = this.extractVariables(template.template);
    
    for (const varName of templateVars) {
      if (!variableNames.has(varName)) {
        warnings.push({ 
          field: 'template', 
          message: `Variable {{${varName}}} used in template but not defined` 
        });
      }
    }
    
    // Check for unused variables
    for (const variable of template.variables) {
      if (!templateVars.has(variable.name)) {
        warnings.push({ 
          field: 'variables', 
          message: `Variable ${variable.name} defined but not used in template` 
        });
      }
    }
    
    // Validate token estimates
    const { estimatedTokens } = template.metadata;
    if (estimatedTokens.min > estimatedTokens.max) {
      errors.push({ 
        field: 'metadata.estimatedTokens', 
        message: 'Min tokens cannot be greater than max tokens' 
      });
    }
    
    if (estimatedTokens.typical < estimatedTokens.min || estimatedTokens.typical > estimatedTokens.max) {
      warnings.push({ 
        field: 'metadata.estimatedTokens', 
        message: 'Typical tokens should be between min and max' 
      });
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Find the latest version of a prompt
   */
  private findLatestVersion(promptId: string, includeDeprecated = false): string | undefined {
    const versionMap = this.registry.get(promptId);
    if (!versionMap) return undefined;
    
    // First try to find the entry marked as latest
    for (const [version, entry] of versionMap) {
      if (entry.isLatest) {
        if (!entry.template.metadata.deprecatedAt || includeDeprecated) {
          return version;
        }
      }
    }
    
    // Fallback to finding highest version
    const versions = Array.from(versionMap.entries())
      .filter(([_, entry]) => !entry.template.metadata.deprecatedAt || includeDeprecated)
      .map(([version, _]) => version)
      .sort((a, b) => this.compareVersions(b, a));
    
    return versions[0];
  }

  /**
   * Compare semantic versions
   */
  private compareVersions(a: string, b: string): number {
    const parseVersion = (v: string) => {
      const parts = v.split('.').map(p => parseInt(p, 10));
      return {
        major: parts[0] || 0,
        minor: parts[1] || 0,
        patch: parts[2] || 0,
      };
    };
    
    const vA = parseVersion(a);
    const vB = parseVersion(b);
    
    if (vA.major !== vB.major) return vA.major - vB.major;
    if (vA.minor !== vB.minor) return vA.minor - vB.minor;
    return vA.patch - vB.patch;
  }

  /**
   * Check if a version string is valid semver
   */
  private isValidSemver(version: string): boolean {
    return /^\d+\.\d+\.\d+$/.test(version);
  }

  /**
   * Extract variable names from template
   */
  private extractVariables(template: string): Set<string> {
    const regex = /\{\{(\w+)\}\}/g;
    const variables = new Set<string>();
    let match;
    
    while ((match = regex.exec(template)) !== null) {
      variables.add(match[1]);
    }
    
    return variables;
  }

  /**
   * Generate cache key
   */
  private getCacheKey(promptId: string, options: PromptRetrievalOptions): string {
    const { version, latest = true, includeDeprecated = false } = options;
    
    if (version) {
      return `${promptId}:${version}`;
    }
    
    return `${promptId}:latest:${includeDeprecated}`;
  }

  /**
   * Add to cache with LRU eviction
   */
  private addToCache(key: string, template: PromptTemplate): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.cacheMaxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, template);
  }

  /**
   * Clear cache entries for a specific prompt
   */
  private clearCacheForPrompt(promptId: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${promptId}:`)) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
    
    if (keysToDelete.length > 0) {
      console.log('[PromptRegistry] Cleared cache entries:', { promptId, count: keysToDelete.length });
    }
  }
}

/**
 * Singleton instance
 */
let registryInstance: PromptRegistry | null = null;

/**
 * Get or create the prompt registry instance
 */
export function getPromptRegistry(): PromptRegistry {
  if (!registryInstance) {
    registryInstance = new PromptRegistry();
  }
  return registryInstance;
}

/**
 * Reset the registry (useful for testing)
 */
export function resetPromptRegistry(): void {
  registryInstance = null;
  console.log('[PromptRegistry] Registry reset');
}
