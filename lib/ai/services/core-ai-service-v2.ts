/**
 * Core AI Service Implementation (Simplified)
 * 
 * Central service that orchestrates all AI operations, integrating
 * caching, auditing, context aggregation, and LLM execution.
 */

import { nanoid } from 'nanoid';
import { generateText } from 'ai';
import { 
  AIService, 
  AIServiceConfig, 
  AIExecutionOptions, 
  AIServiceResult,
  ExecutionMetadata,
  AIServiceError,
  CompiledPrompt,
  LLMResponse,
  BatchRequest,
  BatchResult,
  CacheStats,
  HealthStatus,
  InferredOutput
} from './types';
import { AIErrorCode, ERROR_RECOVERY_CONFIG, DEFAULT_AI_SERVICE_CONFIG } from './types';
import type { PipelineType } from '@/lib/ai/types/pipeline';
import type { PatientContext } from '@/lib/types/patient-context';
import { PatientContextService } from '@/lib/services/patient-context';
import { getPromptRegistry, type PromptRegistry } from '@/lib/ai/prompt-registry';
import type { AICache, CacheMetadata } from './cache/types';
import { createAICache } from './cache';
import type { AuditService, AuditEntry } from './audit/types';
import { createAuditService } from './audit';
import { generateCacheKey } from './cache/cache-key-generator';
import { getParserForPipeline } from '@/lib/ai/output-parser';
import { myProvider } from '@/lib/ai/providers';
import { getStructuredAIService } from './structured-ai-service';

/**
 * Core AI Service implementation
 */
export class CoreAIService implements AIService {
  private config: AIServiceConfig;
  private cache: AICache;
  private audit: AuditService;
  private promptRegistry: PromptRegistry;
  
  constructor(config?: Partial<AIServiceConfig>) {
    this.config = { ...DEFAULT_AI_SERVICE_CONFIG, ...config };
    
    // Initialize services
    this.cache = createAICache({
      type: this.config.cache.type,
      ...this.config.cache.config
    });
    
    this.audit = createAuditService({
      enabled: this.config.audit.enabled,
      ...this.config.audit.config
    });
    
    this.promptRegistry = getPromptRegistry();
  }
  
  /**
   * Main analyze method
   */
  async analyze<T extends PipelineType>(
    pipelineType: T,
    options: AIExecutionOptions<T>
  ): Promise<AIServiceResult<T>> {
    const startTime = Date.now();
    const executionId = nanoid();
    
    console.log(`[AIService] Starting execution ${executionId} for ${pipelineType}`);
    
    // Create initial audit entry
    const auditEntry: Omit<AuditEntry, 'id' | 'timestamp'> = {
      executionId,
      pipelineType,
      patientId: options.patientId,
      sessionId: options.sessionId,
      userId: options.userId,
      organizationId: options.organizationId,
      request: {
        promptTemplate: '',
        promptVersion: '',
        variables: options.variables,
        model: this.config.llm.defaultModel,
        temperature: 0.7,
        maxTokens: 2000
      },
      performance: {
        totalDurationMs: 0,
        cacheHit: false
      },
      metadata: options.metadata
    };
    
    try {
      // 1. Check cache unless explicitly skipped
      if (!options.skipCache) {
        const cached = await this.checkCache(pipelineType, options);
        if (cached) {
          console.log(`[AIService] Cache hit for ${executionId}`);
          
          // Update audit with cache hit
          auditEntry.performance.cacheHit = true;
          auditEntry.performance.totalDurationMs = Date.now() - startTime;
          auditEntry.response = { success: true, data: cached.value };
          await this.audit.logExecution(auditEntry);
          
          return {
            success: true,
            data: cached.value as InferredOutput<T>,
            metadata: {
              executionId,
              pipelineType,
              promptId: cached.metadata.promptVersion,
              promptVersion: cached.metadata.promptVersion,
              modelUsed: this.config.llm.defaultModel,
              latencyMs: Date.now() - startTime,
              cacheHit: true,
              timestamp: new Date()
            } as ExecutionMetadata
          };
        }
      }
      
      // 2. Aggregate patient context
      const contextStart = Date.now();
      const context = await this.aggregateContext(options);
      const contextDuration = Date.now() - contextStart;
      
      // 3. Get and compile prompt
      const promptStart = Date.now();
      const compiledPrompt = await this.compilePrompt(pipelineType, context, options);
      const promptDuration = Date.now() - promptStart;
      
      // Update audit with prompt info
      auditEntry.request.promptTemplate = compiledPrompt.metadata.promptId;
      auditEntry.request.promptVersion = compiledPrompt.metadata.promptVersion;
      
      // 4. Execute LLM call with retry logic
      const llmStart = Date.now();
      const llmResponse = await this.executeLLM(compiledPrompt, options);
      const llmDuration = Date.now() - llmStart;
      
      // 5. Validate and parse output
      const validationStart = Date.now();
      const parsedOutput = await this.validateOutput(pipelineType, llmResponse);
      const validationDuration = Date.now() - validationStart;
      
      // 6. Store in cache
      const cacheKey = generateCacheKey({
        pipelineType,
        patientId: options.patientId,
        sessionId: options.sessionId,
        promptVersion: compiledPrompt.metadata.promptVersion,
        variables: options.variables
      });
      
      console.log(`[AIService] Storing in cache with key version: ${compiledPrompt.metadata.promptVersion}`);
      
      const cacheMetadata: Omit<CacheMetadata, 'createdAt' | 'hitCount' | 'lastAccessedAt'> = {
        pipelineType,
        promptVersion: compiledPrompt.metadata.promptVersion,
        patientId: options.patientId,
        sessionId: options.sessionId
      };
      
      await this.cache.set(cacheKey, parsedOutput, cacheMetadata);
      
      const metadata: ExecutionMetadata = {
        executionId,
        pipelineType,
        promptId: compiledPrompt.metadata.promptId,
        promptVersion: compiledPrompt.metadata.promptVersion,
        modelUsed: llmResponse.model,
        tokenUsage: llmResponse.usage,
        latencyMs: Date.now() - startTime,
        latencyBreakdown: {
          contextAggregationMs: contextDuration,
          promptCompilationMs: promptDuration,
          llmExecutionMs: llmDuration,
          validationMs: validationDuration
        },
        cacheHit: false,
        timestamp: new Date()
      };
      
      // 7. Complete audit entry
      auditEntry.response = { success: true, data: parsedOutput };
      auditEntry.performance = {
        totalDurationMs: Date.now() - startTime,
        contextAggregationMs: contextDuration,
        promptCompilationMs: promptDuration,
        llmExecutionMs: llmDuration,
        validationMs: validationDuration,
        cacheHit: false,
        tokenUsage: llmResponse.usage
      };
      await this.audit.logExecution(auditEntry);
      
      console.log(`[AIService] Execution ${executionId} completed successfully`);
      
      return {
        success: true,
        data: parsedOutput as InferredOutput<T>,
        metadata
      };
      
    } catch (error) {
      console.error(`[AIService] Execution ${executionId} failed:`, error);
      
      // Update audit with error
      const aiError = this.normalizeError(error);
      auditEntry.response = {
        success: false,
        error: aiError.message,
        errorCode: aiError.code
      };
      auditEntry.performance.totalDurationMs = Date.now() - startTime;
      await this.audit.logExecution(auditEntry);
      
      // Apply error recovery strategy
      const recovery = ERROR_RECOVERY_CONFIG[aiError.code];
      if (recovery.strategy === 'retry' && (!options.maxRetries || options.maxRetries > 0)) {
        console.log(`[AIService] Retrying execution ${executionId}`);
        return this.analyze(pipelineType, {
          ...options,
          maxRetries: (options.maxRetries || recovery.maxAttempts || 3) - 1
        });
      }
      
      return {
        success: false,
        error: aiError,
        metadata: {
          executionId,
          pipelineType,
          promptId: '',
          promptVersion: '',
          modelUsed: this.config.llm.defaultModel,
          latencyMs: Date.now() - startTime,
          cacheHit: false,
          timestamp: new Date()
        }
      };
    }
  }
  
  /**
   * Batch analyze implementation
   */
  async analyzeBatch<T extends PipelineType>(
    requests: BatchRequest<T>[]
  ): Promise<BatchResult<T>[]> {
    console.log(`[AIService] Processing batch of ${requests.length} requests`);
    
    // Process in parallel with concurrency limit
    const results = await Promise.all(
      requests.map(async (request) => {
        const result = await this.analyze(request.pipelineType, request.options);
        return {
          id: request.id,
          result
        };
      })
    );
    
    return results;
  }
  
  /**
   * Invalidate cache entries
   */
  async invalidateCache(pattern?: string): Promise<void> {
    console.log(`[AIService] Invalidating cache${pattern ? ` with pattern: ${pattern}` : ''}`);
    
    // Use clear method which accepts a pattern
    await this.cache.clear(pattern);
  }
  
  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    const stats = await this.cache.getStats();
    
    // Map the actual stats to our expected interface
    return {
      totalKeys: stats.totalKeys,
      memoryUsedMB: stats.memoryUsedMB,
      hitRate: stats.hitRate,
      missRate: stats.missRate,
      evictions: stats.evictions,
      avgResponseTimeMs: stats.avgResponseTimeMs,
      itemsByPipeline: stats.itemsByPipeline
    };
  }
  
  /**
   * Health check
   */
  async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    const [auditHealth, contextHealth] = await Promise.allSettled([
      this.audit.healthCheck(),
      this.checkContextHealth()
    ]);
    
    // Simple cache health check
    const cacheHealth = await this.checkCacheHealth();
    
    return {
      healthy: 
        cacheHealth.healthy &&
        auditHealth.status === 'fulfilled' && auditHealth.value.healthy &&
        contextHealth.status === 'fulfilled' && contextHealth.value.healthy,
      services: {
        cache: cacheHealth,
        audit: auditHealth.status === 'fulfilled'
          ? auditHealth.value
          : { healthy: false, latencyMs: 0, error: 'Audit health check failed' },
        context: contextHealth.status === 'fulfilled'
          ? contextHealth.value
          : { healthy: false, latencyMs: 0, error: 'Context health check failed' },
        llm: await this.checkLLMHealth()
      },
      latencyMs: Date.now() - startTime,
      timestamp: new Date()
    };
  }
  
  // Private helper methods
  
  private async checkCache<T extends PipelineType>(
    pipelineType: T,
    options: AIExecutionOptions<T>
  ): Promise<any | null> {
    // First get the prompt template to get the actual version
    const promptId = this.getPromptIdForPipeline(pipelineType);
    const promptTemplate = await this.promptRegistry.get(promptId);
    
    const cacheKey = generateCacheKey({
      pipelineType,
      patientId: options.patientId,
      sessionId: options.sessionId,
      promptVersion: promptTemplate?.metadata.version || 'default',
      variables: options.variables
    });
    
    console.log(`[AIService] Checking cache with key version: ${promptTemplate?.metadata.version || 'default'}`);
    
    const cached = await this.cache.get(cacheKey);
    return cached;
  }
  
  private async aggregateContext(
    options: AIExecutionOptions<any>
  ): Promise<PatientContext> {
    try {
      // Check if patient context is provided directly in variables (for testing)
      if (options.variables?.patientContext) {
        console.log(`[AIService] Using provided patient context for testing`);
        return options.variables.patientContext as PatientContext;
      }
      
      // Create a context service for the patient
      const contextService = new PatientContextService(options.patientId);
      
      // Get context based on purpose
      const context = await contextService.getContextForPurpose(options.purpose);
      
      if (!context) {
        throw new Error('Patient context not found');
      }
      
      return context;
    } catch (error) {
      throw new AIServiceError(
        AIErrorCode.CONTEXT_AGGREGATION_FAILED,
        'Failed to aggregate patient context',
        { patientId: options.patientId },
        error as Error
      );
    }
  }
  
  private async compilePrompt(
    pipelineType: PipelineType,
    context: PatientContext,
    options: AIExecutionOptions<any>
  ): Promise<CompiledPrompt> {
    try {
      // Get appropriate prompt based on pipeline type
      const promptId = this.getPromptIdForPipeline(pipelineType);
      const promptTemplate = await this.promptRegistry.get(promptId);
      
      if (!promptTemplate) {
        throw new Error(`Prompt template not found: ${promptId}`);
      }
      
      // Compile the prompt manually
      let compiledText = promptTemplate.template;
      const variables = { ...context, ...options.variables };
      
      // Replace all {{variable}} placeholders
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        compiledText = compiledText.replace(regex, String(value || ''));
      });
      
      // Estimate tokens
      const estimatedTokens = Math.ceil(compiledText.length / 4);
      
      return {
        text: compiledText,
        estimatedTokens,
        variables,
        metadata: {
          promptId: promptTemplate.metadata.id,
          promptVersion: promptTemplate.metadata.version,
          pipelineType
        }
      };
    } catch (error) {
      throw new AIServiceError(
        AIErrorCode.PROMPT_COMPILATION_FAILED,
        'Failed to compile prompt',
        { pipelineType },
        error as Error
      );
    }
  }
  
  private async executeLLM(
    prompt: CompiledPrompt,
    options: AIExecutionOptions<any>
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    const pipelineType = prompt.metadata.pipelineType;
    
    console.log(`[AIService] Starting LLM execution for ${pipelineType}`);
    console.log(`[AIService] Estimated tokens: ${prompt.estimatedTokens}`);
    console.log(`[AIService] Selected model: ${this.getModelForPipeline(pipelineType)}`);
    
    // Check if this pipeline type should use structured output
    const useStructuredOutput = this.shouldUseStructuredOutput(pipelineType);
    
    if (useStructuredOutput) {
      console.log(`[AIService] Using structured output for ${pipelineType}`);
      return this.executeStructuredLLM(prompt, options);
    }
    
    try {
      // Fallback to regular generateText for non-structured pipelines
      const modelId = this.getModelForPipeline(pipelineType);
      const model = myProvider.languageModel(modelId);
      
      // Configure generation parameters
      const temperature = this.getTemperatureForPipeline(pipelineType);
      const maxTokens = this.getMaxTokensForPipeline(pipelineType);
      
      console.log(`[AIService] LLM parameters - temperature: ${temperature}, maxTokens: ${maxTokens}`);
      
      // Execute the LLM call
      const result = await generateText({
        model,
        prompt: prompt.text,
        temperature,
        maxTokens,
        abortSignal: options.timeout 
          ? AbortSignal.timeout(options.timeout) 
          : undefined,
      });
      
      const executionTime = Date.now() - startTime;
      
      console.log(`[AIService] LLM execution completed in ${executionTime}ms`);
      console.log(`[AIService] Token usage - prompt: ${result.usage?.promptTokens}, completion: ${result.usage?.completionTokens}, total: ${result.usage?.totalTokens}`);
      console.log(`[AIService] Finish reason: ${result.finishReason}`);
      
      // Map the response to our expected format
      return {
        text: result.text,
        usage: {
          prompt: result.usage?.promptTokens || prompt.estimatedTokens,
          completion: result.usage?.completionTokens || 0,
          total: result.usage?.totalTokens || prompt.estimatedTokens
        },
        model: modelId,
        finishReason: result.finishReason || 'stop',
        metadata: {
          executionTimeMs: executionTime,
          warnings: result.warnings
        }
      };
      
    } catch (error) {
      console.error(`[AIService] LLM execution failed:`, error);
      
      // Handle specific error types
      if (error instanceof Error) {
        // Check for timeout
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          throw new AIServiceError(
            AIErrorCode.LLM_TIMEOUT,
            'LLM request timed out',
            { 
              pipelineType, 
              timeout: options.timeout,
              estimatedTokens: prompt.estimatedTokens 
            },
            error
          );
        }
        
        // Check for rate limit
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          throw new AIServiceError(
            AIErrorCode.LLM_RATE_LIMIT,
            'LLM rate limit exceeded',
            { pipelineType },
            error
          );
        }
        
        // Check for connection errors
        if (error.message.includes('ECONNREFUSED') || error.message.includes('network')) {
          throw new AIServiceError(
            AIErrorCode.LLM_CONNECTION_ERROR,
            'Failed to connect to LLM provider',
            { pipelineType },
            error
          );
        }
      }
      
      // Generic LLM error
      throw new AIServiceError(
        AIErrorCode.LLM_INVALID_RESPONSE,
        'LLM execution failed',
        { 
          pipelineType,
          error: error instanceof Error ? error.message : String(error)
        },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Execute structured LLM generation using the new structured AI service
   */
  private async executeStructuredLLM(
    prompt: CompiledPrompt,
    options: AIExecutionOptions<any>
  ): Promise<LLMResponse> {
    const pipelineType = prompt.metadata.pipelineType;
    const structuredService = getStructuredAIService();
    
    try {
      let result;
      
      // Call the appropriate structured generation method
      switch (pipelineType) {
        case 'safety_check':
          result = await structuredService.generateSafetyAssessment(prompt.text);
          break;
        case 'billing_cpt':
        case 'billing_icd10':
          result = await structuredService.generateBillingAnalysis(prompt.text);
          break;
        case 'treatment_progress':
          result = await structuredService.generateTreatmentProgress(prompt.text);
          break;
        default:
          throw new Error(`Unsupported structured pipeline type: ${pipelineType}`);
      }
      
      console.log(`[AIService] Structured output generation completed for ${pipelineType}`);
      
      // Convert structured result to LLMResponse format
      return {
        text: JSON.stringify(result.data), // Convert structured data to text for compatibility
        usage: result.metadata.tokenUsage,
        model: this.getModelForPipeline(pipelineType),
        finishReason: result.metadata.finishReason,
        metadata: {
          executionTimeMs: result.metadata.executionTimeMs,
          warnings: result.metadata.warnings,
          structuredOutput: result.data // Store the actual structured data
        }
      };
      
    } catch (error) {
      console.error(`[AIService] Structured LLM execution failed for ${pipelineType}:`, error);
      
      // Re-throw AIServiceErrors as-is
      if (error instanceof AIServiceError) {
        throw error;
      }
      
      // Wrap other errors
      throw new AIServiceError(
        AIErrorCode.LLM_INVALID_RESPONSE,
        'Structured LLM execution failed',
        { 
          pipelineType,
          error: error instanceof Error ? error.message : String(error)
        },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Determine if a pipeline type should use structured output
   */
  private shouldUseStructuredOutput(pipelineType: PipelineType): boolean {
    const structuredPipelines: PipelineType[] = [
      'safety_check',
      'billing_cpt', 
      'billing_icd10',
      'treatment_progress'
    ];
    
    return structuredPipelines.includes(pipelineType);
  }
  
  /**
   * Get the appropriate model for a pipeline type
   */
  private getModelForPipeline(pipelineType: PipelineType): string {
    // Map pipeline types to model IDs
    const modelMap: Record<PipelineType, string> = {
      safety_check: 'chat-model-reasoning',      // Use reasoning model for safety analysis
      billing_cpt: 'chat-model',                 // Standard model for billing
      billing_icd10: 'chat-model',               // Standard model for diagnoses
      treatment_progress: 'chat-model-reasoning', // Reasoning for progress insights
      chat_with_chart: 'chat-model',             // Standard model for chat
      clinical_note: 'chat-model'                // Standard model for clinical notes
    };
    
    return modelMap[pipelineType] || 'chat-model';
  }
  
  /**
   * Get the appropriate temperature for a pipeline type
   */
  private getTemperatureForPipeline(pipelineType: PipelineType): number {
    // Map pipeline types to temperature settings
    const temperatureMap: Record<PipelineType, number> = {
      safety_check: 0.3,       // Lower temperature for consistency in safety assessments
      billing_cpt: 0.2,        // Very low for accurate code selection
      billing_icd10: 0.2,      // Very low for accurate diagnosis codes
      treatment_progress: 0.5, // Moderate for balanced analysis
      chat_with_chart: 0.7,    // Higher for more natural conversation
      clinical_note: 0.3       // Lower temperature for consistent clinical documentation
    };
    
    return temperatureMap[pipelineType] || 0.7;
  }
  
  /**
   * Get the appropriate max tokens for a pipeline type
   */
  private getMaxTokensForPipeline(pipelineType: PipelineType): number {
    // Map pipeline types to max token limits
    const maxTokensMap: Record<PipelineType, number> = {
      safety_check: 1500,       // Enough for detailed risk assessment
      billing_cpt: 1000,        // Moderate for code suggestions
      billing_icd10: 1000,      // Moderate for diagnosis extraction
      treatment_progress: 2000, // More for comprehensive progress report
      chat_with_chart: 2000,    // Flexible for chat responses
      clinical_note: 2000       // Sufficient for comprehensive SOAP notes
    };
    
    return maxTokensMap[pipelineType] || 2000;
  }
  
  private async validateOutput(
    pipelineType: PipelineType,
    response: LLMResponse
  ): Promise<any> {
    console.log(`[AIService] Validating output for ${pipelineType}`);
    
    try {
      // Check if we have structured output (from generateObject)
      if (response.metadata?.structuredOutput) {
        console.log(`[AIService] Using pre-validated structured output for ${pipelineType}`);
        return response.metadata.structuredOutput;
      }
      
      // Fallback to parser-based validation for non-structured responses
      const parser = await getParserForPipeline(pipelineType);
      
      // Parse and validate the response
      const validatedOutput = await parser.parse(response.text);
      
      console.log(`[AIService] Output validation successful for ${pipelineType}`);
      return validatedOutput;
      
    } catch (error) {
      // The parser already throws AIServiceError with proper context
      if (error instanceof AIServiceError) {
        throw error;
      }
      
      // Wrap any other errors
      throw new AIServiceError(
        AIErrorCode.OUTPUT_VALIDATION_FAILED,
        'Failed to validate LLM output',
        { pipelineType, response: response.text },
        error as Error
      );
    }
  }
  
  private getPromptIdForPipeline(pipelineType: PipelineType): string {
    const promptMap: Record<PipelineType, string> = {
      safety_check: 'safety-check-comprehensive',
      billing_cpt: 'billing-cpt-suggestion',
      billing_icd10: 'billing-diagnosis-extraction',
      treatment_progress: 'clinical-treatment-progress',
      chat_with_chart: 'chat-with-chart',
      clinical_note: 'clinical-note-generation'
    };
    
    return promptMap[pipelineType];
  }
  
  private normalizeError(error: unknown): AIServiceError {
    if (error instanceof AIServiceError) {
      return error;
    }
    
    if (error instanceof Error) {
      return new AIServiceError(
        AIErrorCode.UNKNOWN_ERROR,
        error.message,
        {},
        error
      );
    }
    
    return new AIServiceError(
      AIErrorCode.UNKNOWN_ERROR,
      'An unknown error occurred',
      { error }
    );
  }
  
  private async checkContextHealth() {
    const start = Date.now();
    try {
      // Simple health check - try to get context for a test patient
      const contextService = new PatientContextService('health-check');
      // Just check if we can construct a service
      return {
        healthy: true,
        latencyMs: Date.now() - start
      };
    } catch (error) {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  private async checkCacheHealth() {
    const start = Date.now();
    try {
      // Try to get stats as a health check
      await this.cache.getStats();
      return {
        healthy: true,
        latencyMs: Date.now() - start
      };
    } catch (error) {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  private async checkLLMHealth() {
    // Placeholder for LLM health check
    return {
      healthy: true,
      latencyMs: 0,
      details: {
        provider: this.config.llm.provider,
        model: this.config.llm.defaultModel
      }
    };
  }
}

/**
 * Create a core AI service instance
 */
export function createCoreAIService(config?: Partial<AIServiceConfig>): AIService {
  return new CoreAIService(config);
}
