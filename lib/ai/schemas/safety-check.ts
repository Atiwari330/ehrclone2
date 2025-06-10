/**
 * Safety Check Pipeline Output Schemas
 * 
 * Zod schemas for validating safety assessment AI responses.
 * Includes risk identification, severity assessment, and alert generation.
 */

import { z } from 'zod';
import { 
  baseAIOutputSchema, 
  confidenceScoreSchema, 
  severityLevelSchema, 
  riskCategorySchema,
  treatmentRecommendationSchema,
} from './base';

/**
 * Individual risk indicator schema
 */
export const riskIndicatorSchema = z.object({
  category: riskCategorySchema,
  indicator: z.string().describe('Specific risk indicator identified'),
  context: z.string().describe('Context or quote from session'),
  confidence: confidenceScoreSchema,
  temporalContext: z.enum(['past', 'present', 'future']).optional(),
  frequency: z.enum(['isolated', 'recurring', 'escalating']).optional(),
});

/**
 * Risk assessment summary
 */
export const riskAssessmentSchema = z.object({
  overallRisk: severityLevelSchema,
  riskScore: z.number().min(0).max(10).describe('Composite risk score 0-10'),
  primaryConcern: riskCategorySchema.optional(),
  imminentDanger: z.boolean(),
  requiresImmediateAction: z.boolean(),
  confidence: confidenceScoreSchema,
});

/**
 * Safety alert schema for AI generation (without system-generated fields)
 */
export const safetyAlertAISchema = z.object({
  title: z.string(),
  description: z.string(),
  severity: severityLevelSchema,
  category: riskCategorySchema,
  triggeringFactors: z.array(z.string()),
  recommendedActions: z.array(z.string()),
  notificationPriority: z.enum(['immediate', 'urgent', 'routine']),
  expiresAt: z.coerce.date().optional(),
});

/**
 * Complete safety alert schema (with system-generated fields)
 */
export const safetyAlertSchema = safetyAlertAISchema.extend({
  alertId: z.string().uuid(),
});

/**
 * Protective factors schema
 */
export const protectiveFactorsSchema = z.object({
  factors: z.array(z.object({
    factor: z.string(),
    strength: z.enum(['weak', 'moderate', 'strong']),
    category: z.enum(['personal', 'social', 'environmental', 'clinical']),
  })),
  overallResilience: z.enum(['low', 'moderate', 'high']),
});

/**
 * AI output schema for safety check (without system-generated fields)
 */
export const safetyCheckAIOutputSchema = baseAIOutputSchema.extend({
  riskIndicators: z.array(riskIndicatorSchema),
  riskAssessment: riskAssessmentSchema,
  alerts: z.array(safetyAlertAISchema),
  protectiveFactors: protectiveFactorsSchema.optional(),
  recommendations: z.array(treatmentRecommendationSchema),
  followUpRequired: z.boolean(),
  nextAssessmentDate: z.coerce.date().optional(),
  clinicalNotes: z.string().optional(),
});

/**
 * Complete safety check output schema (with system-generated fields)
 */
export const safetyCheckOutputSchema = baseAIOutputSchema.extend({
  riskIndicators: z.array(riskIndicatorSchema),
  riskAssessment: riskAssessmentSchema,
  alerts: z.array(safetyAlertSchema),
  protectiveFactors: protectiveFactorsSchema.optional(),
  recommendations: z.array(treatmentRecommendationSchema),
  followUpRequired: z.boolean(),
  nextAssessmentDate: z.coerce.date().optional(),
  clinicalNotes: z.string().optional(),
});

/**
 * Safety trend analysis schema (for historical comparison)
 */
export const safetyTrendSchema = z.object({
  timeframe: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }),
  trendDirection: z.enum(['improving', 'stable', 'deteriorating', 'fluctuating']),
  significantChanges: z.array(z.object({
    date: z.coerce.date(),
    change: z.string(),
    impact: z.enum(['positive', 'negative', 'neutral']),
  })),
  riskProgression: z.array(z.object({
    date: z.coerce.date(),
    riskScore: z.number().min(0).max(10),
    primaryConcerns: z.array(riskCategorySchema),
  })),
});

/**
 * Crisis intervention plan schema
 */
export const crisisInterventionPlanSchema = z.object({
  triggers: z.array(z.string()),
  warningSigns: z.array(z.string()),
  copingStrategies: z.array(z.object({
    strategy: z.string(),
    effectiveness: z.enum(['low', 'moderate', 'high']).optional(),
  })),
  supportContacts: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    contactInfo: z.string(),
    availability: z.string().optional(),
  })),
  professionalContacts: z.array(z.object({
    name: z.string(),
    role: z.string(),
    contactInfo: z.string(),
    emergencyAvailable: z.boolean(),
  })),
  safeEnvironmentSteps: z.array(z.string()),
});

// Export types
export type RiskIndicator = z.infer<typeof riskIndicatorSchema>;
export type RiskAssessment = z.infer<typeof riskAssessmentSchema>;
export type SafetyAlert = z.infer<typeof safetyAlertSchema>;
export type ProtectiveFactors = z.infer<typeof protectiveFactorsSchema>;
export type SafetyCheckOutput = z.infer<typeof safetyCheckOutputSchema>;
export type SafetyTrend = z.infer<typeof safetyTrendSchema>;
export type CrisisInterventionPlan = z.infer<typeof crisisInterventionPlanSchema>;

/**
 * Validation helpers specific to safety checks
 */
export function validateSafetyCheckOutput(data: unknown): SafetyCheckOutput {
  const result = safetyCheckOutputSchema.safeParse(data);
  
  if (!result.success) {
    console.error('[Safety-Check-Schema] Validation failed:', result.error.errors);
    throw new Error('Invalid safety check output format');
  }
  
  console.log('[Safety-Check-Schema] Validation successful:', {
    riskIndicators: result.data.riskIndicators.length,
    overallRisk: result.data.riskAssessment.overallRisk,
    alerts: result.data.alerts.length,
  });
  
  return result.data;
}
