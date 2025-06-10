/**
 * AI Service Factory
 * 
 * Sophisticated factory for creating and managing AI service instances
 * with environment-based configuration and comprehensive logging
 */

import { AIService, AIServiceConfig, DEFAULT_AI_SERVICE_CONFIG } from './services/types';
import { CoreAIService } from './services/core-ai-service-v2';
import { registerAllPrompts } from './prompts/index';

/**
 * Service instance registry
 */
const serviceInstances = new Map<string, AIService>();
const initializationPromises = new Map<string, Promise<AIService>>();

/**
 * Environment types
 */
type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Get current environment
 */
function getCurrentEnvironment(): Environment {
  const env = (process.env.NODE_ENV || 'development') as string;
  
  switch (env) {
    case 'production':
    case 'staging':
    case 'test':
    case 'development':
      return env as Environment;
    default:
      return 'development';
  }
}

/**
 * Build configuration from environment variables
 */
function getEnvironmentConfig(): Partial<AIServiceConfig> {
  const env = getCurrentEnvironment();
  console.log(`[AIFactory] Building configuration for environment: ${env}`);
  
  const config: Partial<AIServiceConfig> = {};
  
  // Cache configuration
  const cacheType = process.env.AI_CACHE_TYPE;
  if (cacheType === 'redis' || cacheType === 'memory') {
    config.cache = {
      enabled: process.env.AI_CACHE_ENABLED !== 'false',
      type: cacheType,
      config: {
        // Redis-specific config
        ...(cacheType === 'redis' && process.env.REDIS_URL ? {
          url: process.env.REDIS_URL,
          keyPrefix: process.env.AI_CACHE_PREFIX || 'ai:cache:',
          ttl: parseInt(process.env.AI_CACHE_TTL || '3600')
        } : {}),
        // Memory cache config
        ...(cacheType === 'memory' ? {
          maxSize: parseInt(process.env.AI_CACHE_MAX_SIZE || '100'),
          ttl: parseInt(process.env.AI_CACHE_TTL || '3600')
        } : {})
      }
    };
  }
  
  // Audit configuration
  config.audit = {
    enabled: process.env.AI_AUDIT_ENABLED !== 'false',
    config: {
      retentionDays: parseInt(process.env.AI_AUDIT_RETENTION_DAYS || '90'),
      batchSize: parseInt(process.env.AI_AUDIT_BATCH_SIZE || '10')
    }
  };
  
  // LLM configuration
  const provider = process.env.AI_PROVIDER || 'openai';
  if (provider === 'openai' || provider === 'anthropic' || provider === 'azure') {
    config.llm = {
      provider,
      apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || '',
      defaultModel: process.env.AI_DEFAULT_MODEL || 
        (provider === 'openai' ? 'gpt-4' : 
         provider === 'anthropic' ? 'claude-3-opus-20240229' : 
         'gpt-4'),
      timeout: parseInt(process.env.AI_TIMEOUT || '30000'),
      maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3')
    };
  }
  
  // Performance configuration
  config.performance = {
    maxConcurrentRequests: parseInt(process.env.AI_MAX_CONCURRENT || '10'),
    requestTimeout: parseInt(process.env.AI_REQUEST_TIMEOUT || '60000'),
    enableBatching: process.env.AI_ENABLE_BATCHING === 'true',
    batchSize: parseInt(process.env.AI_BATCH_SIZE || '10'),
    batchTimeout: parseInt(process.env.AI_BATCH_TIMEOUT || '1000')
  };
  
  // Security configuration
  config.security = {
    sanitizeInputs: process.env.AI_SANITIZE_INPUTS !== 'false',
    maxInputLength: parseInt(process.env.AI_MAX_INPUT_LENGTH || '100000')
  };
  
  // Environment-specific overrides
  if (env === 'development') {
    // More verbose logging in development
    console.log('[AIFactory] Using development configuration overrides');
    config.cache = { ...config.cache, enabled: true, type: 'memory' };
    config.audit = { ...config.audit, enabled: true };
  } else if (env === 'test') {
    // Minimal config for testing
    console.log('[AIFactory] Using test configuration overrides');
    config.cache = { enabled: false, type: 'memory' };
    config.audit = { enabled: false };
    if (config.llm) {
      config.llm = { ...config.llm, timeout: 5000, maxRetries: 1 };
    }
  } else if (env === 'production') {
    // Stricter settings for production
    console.log('[AIFactory] Using production configuration overrides');
    config.security = { ...config.security, sanitizeInputs: true };
    config.performance = { ...config.performance, enableBatching: true };
  }
  
  return config;
}

/**
 * Merge configurations with proper deep merging
 */
function mergeConfigs(
  base: AIServiceConfig,
  ...overrides: Partial<AIServiceConfig>[]
): AIServiceConfig {
  let result = { ...base };
  
  for (const override of overrides) {
    result = {
      ...result,
      ...override,
      cache: { ...result.cache, ...(override.cache || {}) },
      audit: { ...result.audit, ...(override.audit || {}) },
      llm: { ...result.llm, ...(override.llm || {}) },
      performance: { ...result.performance, ...(override.performance || {}) },
      security: { ...result.security, ...(override.security || {}) }
    };
  }
  
  return result;
}

/**
 * Sanitize configuration for logging (remove sensitive data)
 */
function sanitizeConfigForLogging(config: AIServiceConfig): any {
  return {
    ...config,
    llm: {
      ...config.llm,
      apiKey: config.llm.apiKey ? '***' + config.llm.apiKey.slice(-4) : 'not set'
    }
  };
}

/**
 * Validate configuration
 */
function validateConfiguration(config: AIServiceConfig): void {
  console.log('[AIFactory] Validating configuration');
  
  // Check required fields
  if (!config.llm.apiKey) {
    console.warn('[AIFactory] WARNING: No API key configured for LLM provider');
  }
  
  if (config.cache.type === 'redis' && config.cache.enabled) {
    if (!config.cache.config?.url && !process.env.REDIS_URL) {
      console.warn('[AIFactory] WARNING: Redis cache enabled but no Redis URL configured');
      // Fallback to memory cache
      config.cache.type = 'memory';
      console.log('[AIFactory] Falling back to in-memory cache');
    }
  }
  
  if (config.performance.maxConcurrentRequests < 1) {
    console.warn('[AIFactory] WARNING: Invalid maxConcurrentRequests, using default');
    config.performance.maxConcurrentRequests = 10;
  }
  
  if (config.llm.timeout < 1000) {
    console.warn('[AIFactory] WARNING: LLM timeout too low, setting to minimum 1000ms');
    config.llm.timeout = 1000;
  }
}

/**
 * Create an AI service instance with full configuration
 */
export async function createAIServiceWithConfig(
  config?: Partial<AIServiceConfig>,
  options?: {
    skipValidation?: boolean;
    skipHealthCheck?: boolean;
  }
): Promise<AIService> {
  const startTime = Date.now();
  console.log('[AIFactory] Starting AI service creation');
  
  try {
    // Build final configuration
    const envConfig = getEnvironmentConfig();
    const finalConfig = mergeConfigs(DEFAULT_AI_SERVICE_CONFIG, envConfig, config || {});
    
    // Validate unless skipped
    if (!options?.skipValidation) {
      validateConfiguration(finalConfig);
    }
    
    // Log sanitized configuration
    console.log('[AIFactory] Final configuration:', sanitizeConfigForLogging(finalConfig));
    
    // Create service instance
    console.log('[AIFactory] Creating CoreAIService instance');
    const service = new CoreAIService(finalConfig);
    
    // Initialize prompt templates
    console.log('[AIFactory] Registering prompt templates');
    try {
      await registerAllPrompts();
      console.log('[AIFactory] Prompt templates registered successfully');
    } catch (error) {
      console.error('[AIFactory] Failed to register prompt templates:', error);
      throw new Error(`Failed to register prompt templates: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Perform health check unless skipped
    if (!options?.skipHealthCheck) {
      console.log('[AIFactory] Performing initial health check');
      const healthStart = Date.now();
      
      try {
        const health = await service.healthCheck();
        console.log(`[AIFactory] Health check completed in ${Date.now() - healthStart}ms`);
        console.log('[AIFactory] Health status:', {
          healthy: health.healthy,
          services: Object.entries(health.services).map(([name, status]) => ({
            name,
            healthy: status.healthy,
            latency: status.latencyMs
          }))
        });
        
        if (!health.healthy) {
          console.warn('[AIFactory] WARNING: Service created but some components are unhealthy');
        }
      } catch (error) {
        console.error('[AIFactory] Health check failed:', error);
        console.warn('[AIFactory] WARNING: Proceeding without health check');
      }
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`[AIFactory] AI service created successfully in ${totalTime}ms`);
    
    return service;
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[AIFactory] Failed to create AI service after ${totalTime}ms:`, error);
    throw error;
  }
}

/**
 * Get or create the default singleton AI service
 */
export async function getDefaultAIService(
  config?: Partial<AIServiceConfig>
): Promise<AIService> {
  return getNamedAIService('default', config);
}

/**
 * Get or create a named AI service instance
 */
export async function getNamedAIService(
  name: string,
  config?: Partial<AIServiceConfig>
): Promise<AIService> {
  console.log(`[AIFactory] Requesting AI service instance: ${name}`);
  
  // Check if already exists
  const existing = serviceInstances.get(name);
  if (existing) {
    console.log(`[AIFactory] Returning existing instance: ${name}`);
    return existing;
  }
  
  // Check if initialization is in progress
  const inProgress = initializationPromises.get(name);
  if (inProgress) {
    console.log(`[AIFactory] Waiting for in-progress initialization: ${name}`);
    return inProgress;
  }
  
  // Create new instance
  console.log(`[AIFactory] Creating new instance: ${name}`);
  const initPromise = createAIServiceWithConfig(config).then(service => {
    serviceInstances.set(name, service);
    initializationPromises.delete(name);
    console.log(`[AIFactory] Instance registered: ${name}`);
    return service;
  }).catch(error => {
    initializationPromises.delete(name);
    console.error(`[AIFactory] Failed to create instance ${name}:`, error);
    throw error;
  });
  
  initializationPromises.set(name, initPromise);
  return initPromise;
}

/**
 * Reset all AI service instances
 */
export function resetAIServices(): void {
  console.log('[AIFactory] Resetting all AI service instances');
  
  const instanceCount = serviceInstances.size;
  serviceInstances.clear();
  initializationPromises.clear();
  
  console.log(`[AIFactory] Reset complete. Cleared ${instanceCount} instances`);
}

/**
 * Reset a specific named instance
 */
export function resetNamedAIService(name: string): void {
  console.log(`[AIFactory] Resetting AI service instance: ${name}`);
  
  const deleted = serviceInstances.delete(name);
  initializationPromises.delete(name);
  
  if (deleted) {
    console.log(`[AIFactory] Instance reset: ${name}`);
  } else {
    console.log(`[AIFactory] No instance found to reset: ${name}`);
  }
}

/**
 * Get all active instance names
 */
export function getActiveInstances(): string[] {
  return Array.from(serviceInstances.keys());
}

/**
 * Create a test instance with minimal configuration
 */
export async function createTestAIService(
  overrides?: Partial<AIServiceConfig>
): Promise<AIService> {
  console.log('[AIFactory] Creating test AI service instance');
  
  const testConfig: Partial<AIServiceConfig> = {
    cache: { enabled: false, type: 'memory' },
    audit: { enabled: false },
    llm: {
      provider: 'openai',
      apiKey: 'test-key',
      defaultModel: 'gpt-4',
      timeout: 5000,
      maxRetries: 1
    },
    performance: {
      maxConcurrentRequests: 1,
      requestTimeout: 5000,
      enableBatching: false,
      batchSize: 1,
      batchTimeout: 100
    },
    ...overrides
  };
  
  return createAIServiceWithConfig(testConfig, {
    skipValidation: true,
    skipHealthCheck: true
  });
}

/**
 * Log current factory state
 */
export function logFactoryState(): void {
  console.log('[AIFactory] Current factory state:');
  console.log(`[AIFactory] - Environment: ${getCurrentEnvironment()}`);
  console.log(`[AIFactory] - Active instances: ${serviceInstances.size}`);
  console.log(`[AIFactory] - Instance names: ${Array.from(serviceInstances.keys()).join(', ') || 'none'}`);
  console.log(`[AIFactory] - Pending initializations: ${initializationPromises.size}`);
}
