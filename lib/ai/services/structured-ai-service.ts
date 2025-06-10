/**
 * Structured AI Service Implementation
 * 
 * Uses Vercel AI SDK's `generateObject` for reliable structured output generation.
 * Replaces manual JSON prompt engineering with native AI SDK capabilities.
 */

import { nanoid } from 'nanoid';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { PipelineType } from '@/lib/ai/types/pipeline';
import type { PatientContext } from '@/lib/types/patient-context';
import { myProvider } from '@/lib/ai/providers';
import { 
  AIServiceError, 
  AIErrorCode,
  type CompiledPrompt,
  type ExecutionMetadata 
} from './types';
import { 
  billingOutputSchema,
  treatmentProgressOutputSchema, 
  safetyCheckAIOutputSchema 
} from '@/lib/ai/schemas';

/**
 * Configuration for structured output generation
 */
export interface StructuredOutputConfig {
  pipelineType: PipelineType;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

/**
 * Result of structured output generation
 */
export interface StructuredOutputResult<T> {
  data: T;
  metadata: {
    executionTimeMs: number;
    tokenUsage: {
      prompt: number;
      completion: number;
      total: number;
    };
    finishReason: string;
    warnings?: string[];
  };
}

/**
 * Structured AI Service using generateObject
 */
export class StructuredAIService {
  constructor() {
    console.log('[StructuredAIService] Initialized with generateObject support');
  }

  /**
   * Generate structured output using AI SDK's generateObject
   */
  async generateStructuredOutput<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    config: StructuredOutputConfig
  ): Promise<StructuredOutputResult<T>> {
    const startTime = Date.now();
    const executionId = nanoid();
    
    console.log(`[StructuredAIService] Starting structured generation ${executionId}`, {
      pipelineType: config.pipelineType,
      model: this.getModelForPipeline(config.pipelineType),
      promptLength: prompt.length
    });

    try {
      // Select appropriate model
      const modelId = config.model || this.getModelForPipeline(config.pipelineType);
      const model = myProvider.languageModel(modelId);
      
      // Configure generation parameters
      const temperature = config.temperature ?? this.getTemperatureForPipeline(config.pipelineType);
      const maxTokens = config.maxTokens ?? this.getMaxTokensForPipeline(config.pipelineType);
      
      console.log(`[StructuredAIService] Generation parameters:`, {
        model: modelId,
        temperature,
        maxTokens,
        schemaName: schema.constructor.name
      });

      // Execute generateObject with schema
      const result = await generateObject({
        model,
        schema,
        prompt,
        temperature,
        maxTokens,
        abortSignal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
      });

      const executionTime = Date.now() - startTime;
      
      console.log(`[StructuredAIService] Generation completed successfully`, {
        executionId,
        executionTimeMs: executionTime,
        finishReason: result.finishReason,
        tokenUsage: result.usage
      });

      // Validate the generated object (this should always pass since generateObject handles validation)
      const validationResult = schema.safeParse(result.object);
      if (!validationResult.success) {
        console.warn('[StructuredAIService] Unexpected validation failure after generateObject:', validationResult.error);
        throw new AIServiceError(
          AIErrorCode.OUTPUT_VALIDATION_FAILED,
          'Generated object failed schema validation',
          { 
            pipelineType: config.pipelineType,
            validationErrors: validationResult.error.errors 
          }
        );
      }

      return {
        data: result.object,
        metadata: {
          executionTimeMs: executionTime,
          tokenUsage: {
            prompt: result.usage?.promptTokens || 0,
            completion: result.usage?.completionTokens || 0,
            total: result.usage?.totalTokens || 0
          },
          finishReason: result.finishReason || 'stop',
          warnings: result.warnings?.map(w => {
            if (w.type === 'unsupported-setting') {
              return `${w.type}: ${w.setting}${w.details ? ` - ${w.details}` : ''}`;
            }
            if (w.type === 'other') {
              return `${w.type}: ${w.message}`;
            }
            return w.type;
          })
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      console.error(`[StructuredAIService] Generation failed:`, {
        executionId,
        pipelineType: config.pipelineType,
        executionTimeMs: executionTime,
        error: error instanceof Error ? error.message : String(error)
      });

      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          throw new AIServiceError(
            AIErrorCode.LLM_TIMEOUT,
            'Structured output generation timed out',
            { 
              pipelineType: config.pipelineType,
              timeout: config.timeout,
              executionTimeMs: executionTime
            },
            error
          );
        }

        if (error.message.includes('rate limit') || error.message.includes('429')) {
          throw new AIServiceError(
            AIErrorCode.LLM_RATE_LIMIT,
            'Rate limit exceeded during structured generation',
            { pipelineType: config.pipelineType },
            error
          );
        }

        if (error.message.includes('ECONNREFUSED') || error.message.includes('network')) {
          throw new AIServiceError(
            AIErrorCode.LLM_CONNECTION_ERROR,
            'Network error during structured generation',
            { pipelineType: config.pipelineType },
            error
          );
        }
      }

      // Generic structured generation error
      throw new AIServiceError(
        AIErrorCode.LLM_INVALID_RESPONSE,
        'Structured output generation failed',
        { 
          pipelineType: config.pipelineType,
          executionTimeMs: executionTime,
          error: error instanceof Error ? error.message : String(error)
        },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Generate safety assessment with structured output
   */
  async generateSafetyAssessment(
    prompt: string,
    patientContext?: PatientContext
  ): Promise<StructuredOutputResult<any>> {
    console.log('[StructuredAIService] Generating safety assessment');
    
    const result = await this.generateStructuredOutput(
      prompt,
      safetyCheckAIOutputSchema,
      {
        pipelineType: 'safety_check',
        temperature: 0.3, // Low temperature for consistent safety assessments
        maxTokens: 1500
      }
    );

    // Add system-generated UUIDs to alerts
    const enhancedData = {
      ...result.data,
      alerts: result.data.alerts.map((alert: any) => ({
        ...alert,
        alertId: nanoid()
      }))
    };

    console.log('[StructuredAIService] Added UUIDs to alerts:', {
      alertCount: enhancedData.alerts.length,
      alertIds: enhancedData.alerts.map((a: any) => a.alertId)
    });

    return {
      ...result,
      data: enhancedData
    };
  }

  /**
   * Generate billing analysis with structured output
   */
  async generateBillingAnalysis(
    prompt: string,
    patientContext?: PatientContext
  ): Promise<StructuredOutputResult<any>> {
    console.log('[StructuredAIService] Generating billing analysis');
    
    return this.generateStructuredOutput(
      prompt,
      billingOutputSchema,
      {
        pipelineType: 'billing_cpt',
        temperature: 0.2, // Very low temperature for accurate billing codes
        maxTokens: 1500
      }
    );
  }

  /**
   * Generate treatment progress assessment with structured output
   */
  async generateTreatmentProgress(
    prompt: string,
    patientContext?: PatientContext
  ): Promise<StructuredOutputResult<any>> {
    console.log('[StructuredAIService] Generating treatment progress assessment');
    
    return this.generateStructuredOutput(
      prompt,
      treatmentProgressOutputSchema,
      {
        pipelineType: 'treatment_progress',
        temperature: 0.5, // Moderate temperature for balanced analysis
        maxTokens: 2500
      }
    );
  }

  /**
   * Get the appropriate model for a pipeline type
   */
  private getModelForPipeline(pipelineType: PipelineType): string {
    const modelMap: Record<PipelineType, string> = {
      safety_check: 'chat-model-reasoning',      // Use reasoning model for safety analysis
      billing_cpt: 'chat-model',                 // Standard model for billing
      billing_icd10: 'chat-model',               // Standard model for diagnoses
      treatment_progress: 'chat-model-reasoning', // Reasoning for progress insights
      chat_with_chart: 'chat-model'              // Standard model for chat
    };
    
    return modelMap[pipelineType] || 'chat-model';
  }

  /**
   * Get the appropriate temperature for a pipeline type
   */
  private getTemperatureForPipeline(pipelineType: PipelineType): number {
    const temperatureMap: Record<PipelineType, number> = {
      safety_check: 0.3,       // Lower temperature for consistency in safety assessments
      billing_cpt: 0.2,        // Very low for accurate code selection
      billing_icd10: 0.2,      // Very low for accurate diagnosis codes
      treatment_progress: 0.5, // Moderate for balanced analysis
      chat_with_chart: 0.7     // Higher for more natural conversation
    };
    
    return temperatureMap[pipelineType] || 0.7;
  }

  /**
   * Get the appropriate max tokens for a pipeline type
   */
  private getMaxTokensForPipeline(pipelineType: PipelineType): number {
    const maxTokensMap: Record<PipelineType, number> = {
      safety_check: 1500,       // Enough for detailed risk assessment
      billing_cpt: 1500,        // Increased for comprehensive billing analysis
      billing_icd10: 1000,      // Moderate for diagnosis extraction
      treatment_progress: 2500, // More for comprehensive progress report
      chat_with_chart: 2000     // Flexible for chat responses
    };
    
    return maxTokensMap[pipelineType] || 2000;
  }
}

/**
 * Create a structured AI service instance
 */
export function createStructuredAIService(): StructuredAIService {
  return new StructuredAIService();
}

/**
 * Singleton instance for reuse
 */
let structuredAIServiceInstance: StructuredAIService | null = null;

/**
 * Get the global structured AI service instance
 */
export function getStructuredAIService(): StructuredAIService {
  if (!structuredAIServiceInstance) {
    structuredAIServiceInstance = createStructuredAIService();
  }
  return structuredAIServiceInstance;
}
