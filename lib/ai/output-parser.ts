/**
 * AI Output Parser
 * 
 * Generic parser for validating and transforming LLM responses
 * using Zod schemas. Handles various response formats and provides
 * graceful error handling with fallback mechanisms.
 */

import { z } from 'zod';
import type { PipelineType } from '@/lib/ai/types/pipeline';
import { AIServiceError, AIErrorCode } from './services/types';

/**
 * Parser configuration options
 */
export interface OutputParserConfig<T> {
  /** Schema to validate against */
  schema: z.ZodSchema<T>;
  /** Pipeline type for logging */
  pipelineType: PipelineType;
  /** Optional fallback value if parsing fails */
  fallback?: T;
  /** Whether to attempt partial extraction on failure */
  attemptPartialExtraction?: boolean;
  /** Maximum retries for parsing */
  maxRetries?: number;
}

/**
 * Parsing result types
 */
export type ParseResult<T> = 
  | { success: true; data: T; warnings?: string[] }
  | { success: false; error: ParseError; partial?: Partial<T> };

/**
 * Structured parse error information
 */
export interface ParseError {
  type: 'json_parse' | 'validation' | 'extraction';
  message: string;
  details?: any;
  rawResponse?: string;
}

/**
 * Generic output parser for AI responses
 */
export class OutputParser<T> {
  private config: Required<OutputParserConfig<T>>;
  
  constructor(config: OutputParserConfig<T>) {
    this.config = {
      attemptPartialExtraction: false,
      maxRetries: 3,
      ...config,
      fallback: config.fallback as T
    };
  }
  
  /**
   * Parse LLM response with validation
   */
  async parse(response: string): Promise<T> {
    console.log(`[OutputParser] Starting parse for ${this.config.pipelineType}`);
    
    const result = await this.attemptParse(response);
    
    if (result.success) {
      if (result.warnings?.length) {
        console.warn(`[OutputParser] Parse succeeded with warnings:`, result.warnings);
      }
      return result.data;
    }
    
    // Handle parse failure
    console.error(`[OutputParser] Parse failed for ${this.config.pipelineType}:`, {
      error: result.error,
      partial: result.partial
    });
    
    // If we have a fallback, use it
    if (this.config.fallback !== undefined) {
      console.log(`[OutputParser] Using fallback value for ${this.config.pipelineType}`);
      return this.config.fallback;
    }
    
    // Otherwise throw a structured error
    throw new AIServiceError(
      AIErrorCode.OUTPUT_VALIDATION_FAILED,
      `Failed to parse ${this.config.pipelineType} output: ${result.error.message}`,
      {
        pipelineType: this.config.pipelineType,
        parseError: result.error,
        partialData: result.partial
      }
    );
  }
  
  /**
   * Safe parse that returns a result object
   */
  async safeParse(response: string): Promise<ParseResult<T>> {
    return this.attemptParse(response);
  }
  
  /**
   * Core parsing logic
   */
  private async attemptParse(response: string): Promise<ParseResult<T>> {
    const trimmedResponse = response.trim();
    
    // Step 1: Extract JSON from various formats
    const extracted = this.extractJSON(trimmedResponse);
    if (!extracted.success) {
      return {
        success: false,
        error: extracted.error
      };
    }
    
    // Step 2: Validate with Zod schema
    const validation = await this.validateWithSchema(extracted.data);
    if (!validation.success) {
      // Try partial extraction if enabled
      if (this.config.attemptPartialExtraction) {
        const partial = await this.extractPartialData(extracted.data);
        return {
          success: false,
          error: validation.error,
          partial
        };
      }
      
      return validation;
    }
    
    return validation;
  }
  
  /**
   * Extract JSON from various response formats
   */
  private extractJSON(response: string): { success: true; data: any } | { success: false; error: ParseError } {
    // Try direct JSON parse first
    try {
      const parsed = JSON.parse(response);
      console.log(`[OutputParser] Direct JSON parse successful`);
      return { success: true, data: parsed };
    } catch (directError) {
      console.log(`[OutputParser] Direct JSON parse failed, trying extraction methods`);
    }
    
    // Try to extract from markdown code blocks
    const codeBlockMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      try {
        const parsed = JSON.parse(codeBlockMatch[1].trim());
        console.log(`[OutputParser] Extracted JSON from markdown code block`);
        return { success: true, data: parsed };
      } catch (error) {
        console.log(`[OutputParser] Failed to parse markdown code block content`);
      }
    }
    
    // Try to find JSON object in text
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log(`[OutputParser] Extracted JSON object from text`);
        return { success: true, data: parsed };
      } catch (error) {
        console.log(`[OutputParser] Failed to parse extracted JSON object`);
      }
    }
    
    // Try to clean common issues
    const cleaned = this.cleanResponse(response);
    if (cleaned !== response) {
      try {
        const parsed = JSON.parse(cleaned);
        console.log(`[OutputParser] Parsed after cleaning response`);
        return { success: true, data: parsed };
      } catch (error) {
        console.log(`[OutputParser] Failed to parse cleaned response`);
      }
    }
    
    return {
      success: false,
      error: {
        type: 'json_parse',
        message: 'Failed to extract valid JSON from response',
        rawResponse: response.substring(0, 500) + (response.length > 500 ? '...' : '')
      }
    };
  }
  
  /**
   * Validate parsed data with Zod schema
   */
  private async validateWithSchema(data: any): Promise<ParseResult<T>> {
    try {
      const result = this.config.schema.safeParse(data);
      
      if (result.success) {
        console.log(`[OutputParser] Schema validation successful for ${this.config.pipelineType}`);
        return { success: true, data: result.data };
      }
      
      // Extract meaningful errors
      const errors = result.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      
      console.error(`[OutputParser] Schema validation failed:`, errors);
      
      return {
        success: false,
        error: {
          type: 'validation',
          message: `Validation failed: ${errors.map(e => `${e.path}: ${e.message}`).join(', ')}`,
          details: errors
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: error instanceof Error ? error.message : 'Unknown validation error',
          details: error
        }
      };
    }
  }
  
  /**
   * Attempt to extract partial data when full validation fails
   */
  private async extractPartialData(data: any): Promise<Partial<T>> {
    console.log(`[OutputParser] Attempting partial data extraction`);
    
    if (!data || typeof data !== 'object') {
      return {};
    }
    
    const partial: any = {};
    
    // Try to preserve any valid top-level fields
    for (const [key, value] of Object.entries(data)) {
      try {
        // For ZodObject schemas, we can access the shape property
        const schema = this.config.schema as any;
        if (schema._def?.typeName === 'ZodObject' && schema.shape && key in schema.shape) {
          const fieldSchema = schema.shape[key];
          const fieldResult = fieldSchema.safeParse(value);
          if (fieldResult.success) {
            partial[key] = fieldResult.data;
          }
        } else {
          // For other schema types, try to validate the whole value
          const result = this.config.schema.safeParse({ [key]: value });
          if (result.success && key in (result.data as any)) {
            partial[key] = (result.data as any)[key];
          }
        }
      } catch (error) {
        // Skip fields that cause errors
        console.log(`[OutputParser] Skipping field ${key} due to error`);
      }
    }
    
    console.log(`[OutputParser] Extracted ${Object.keys(partial).length} partial fields`);
    return partial;
  }
  
  /**
   * Clean common issues in responses
   */
  private cleanResponse(response: string): string {
    let cleaned = response;
    
    // Remove trailing commas
    cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    
    // Fix single quotes (carefully)
    cleaned = cleaned.replace(/'/g, '"');
    
    // Remove control characters
    cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    return cleaned;
  }
}

/**
 * Factory function for creating typed parsers
 */
export function createOutputParser<T>(config: OutputParserConfig<T>): OutputParser<T> {
  return new OutputParser(config);
}

/**
 * Get appropriate parser for a pipeline type
 */
export async function getParserForPipeline(pipelineType: PipelineType): Promise<OutputParser<any>> {
  // Dynamic import to avoid circular dependencies
  const schemas = await import('./schemas');
  
  switch (pipelineType) {
    case 'safety_check':
      return new OutputParser({
        schema: schemas.safetyCheckOutputSchema,
        pipelineType,
        attemptPartialExtraction: true
      });
      
    case 'billing_cpt':
    case 'billing_icd10':
      // Both billing pipelines use the same output schema
      return new OutputParser({
        schema: schemas.billingOutputSchema,
        pipelineType,
        attemptPartialExtraction: true
      });
      
    case 'treatment_progress':
      return new OutputParser({
        schema: schemas.treatmentProgressOutputSchema,
        pipelineType,
        attemptPartialExtraction: true
      });
      
    case 'clinical_note':
      return new OutputParser({
        schema: schemas.clinicalNoteOutputSchema,
        pipelineType,
        attemptPartialExtraction: true
      });
      
    default:
      throw new Error(`No parser configured for pipeline type: ${pipelineType}`);
  }
}

/**
 * Parse with automatic pipeline detection
 */
export async function parseAIOutput<T = any>(
  response: string,
  pipelineType: PipelineType
): Promise<T> {
  const parser = await getParserForPipeline(pipelineType);
  return parser.parse(response);
}

/**
 * Safe parse with automatic pipeline detection
 */
export async function safeParseAIOutput<T = any>(
  response: string,
  pipelineType: PipelineType
): Promise<ParseResult<T>> {
  const parser = await getParserForPipeline(pipelineType);
  return parser.safeParse(response);
}
