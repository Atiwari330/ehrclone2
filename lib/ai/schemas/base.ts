/**
 * Base AI Schema Definitions
 * 
 * Core schemas used across all AI pipeline types.
 * This file contains only base definitions to avoid circular dependencies.
 */

import { z } from 'zod';

/**
 * Base confidence score schema used across all AI outputs
 */
export const confidenceScoreSchema = z.object({
  score: z.number().min(0).max(1).describe('Confidence score between 0 and 1'),
  reasoning: z.string().optional().describe('Optional explanation for the confidence score'),
});

/**
 * Base schema that all AI outputs should extend
 */
export const baseAIOutputSchema = z.object({
  success: z.boolean().describe('Whether the AI processing was successful'),
  confidence: confidenceScoreSchema.describe('Overall confidence in the output'),
  processingTime: z.number().optional().describe('Processing time in milliseconds'),
  modelUsed: z.string().optional().describe('The AI model used for processing'),
  warnings: z.array(z.string()).optional().describe('Any warnings during processing'),
  metadata: z.record(z.unknown()).optional().describe('Additional metadata'),
});

/**
 * Common schemas used across multiple pipelines
 */

// ICD-10 code schema
export const icd10CodeSchema = z.object({
  code: z.string().regex(/^[A-Z]\d{2}(\.\d{1,4})?$/, 'Invalid ICD-10 format'),
  description: z.string(),
  confidence: confidenceScoreSchema,
  supportingEvidence: z.string().optional(),
});

// CPT code schema
export const cptCodeSchema = z.object({
  code: z.string().regex(/^\d{5}$/, 'CPT code must be 5 digits'),
  description: z.string(),
  confidence: confidenceScoreSchema,
  modifiers: z.array(z.string()).optional(),
  units: z.number().min(1).default(1),
  supportingDocumentation: z.string().optional(),
});

// Date range schema
export const dateRangeSchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date().optional(),
});

// Severity levels
export const severityLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

// Risk category schema
export const riskCategorySchema = z.enum([
  'suicide',
  'self-harm',
  'violence',
  'abuse',
  'substance_use',
  'medication_non_compliance',
  'social_isolation',
  'other',
]);

// Treatment recommendation schema
export const treatmentRecommendationSchema = z.object({
  recommendation: z.string(),
  priority: z.enum(['immediate', 'urgent', 'routine', 'as_needed']),
  rationale: z.string(),
  confidence: confidenceScoreSchema,
});

/**
 * Validation helper with logging
 */
export function validateAIOutput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  pipelineType: string
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const validated = schema.parse(data);
    console.log(`[AI-Schema] Validation successful for ${pipelineType}`);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`[AI-Schema] Validation failed for ${pipelineType}:`, {
        errors: error.errors,
        received: data,
      });
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Safe parse with logging
 */
export function safeParseAIOutput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  pipelineType: string
): z.SafeParseReturnType<unknown, T> {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    console.error(`[AI-Schema] Safe parse failed for ${pipelineType}:`, {
      errors: result.error.errors,
      received: data,
    });
  } else {
    console.log(`[AI-Schema] Safe parse successful for ${pipelineType}`);
  }
  
  return result;
}

/**
 * Transform and validate with fallback
 */
export function transformAIOutput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  pipelineType: string,
  fallback: T
): T {
  const result = safeParseAIOutput(schema, data, pipelineType);
  
  if (result.success) {
    return result.data;
  }
  
  console.warn(`[AI-Schema] Using fallback for ${pipelineType} due to validation errors`);
  return fallback;
}

// Export utility types
export type BaseAIOutput = z.infer<typeof baseAIOutputSchema>;
export type ConfidenceScore = z.infer<typeof confidenceScoreSchema>;
export type ICD10Code = z.infer<typeof icd10CodeSchema>;
export type CPTCode = z.infer<typeof cptCodeSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type SeverityLevel = z.infer<typeof severityLevelSchema>;
export type RiskCategory = z.infer<typeof riskCategorySchema>;
export type TreatmentRecommendation = z.infer<typeof treatmentRecommendationSchema>;
