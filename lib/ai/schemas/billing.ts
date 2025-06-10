/**
 * Billing Pipeline Output Schemas
 * 
 * Zod schemas for validating billing and coding AI responses.
 * Includes CPT codes, ICD-10 diagnoses, and documentation validation.
 */

import { z } from 'zod';
import { 
  baseAIOutputSchema, 
  confidenceScoreSchema, 
  cptCodeSchema,
  icd10CodeSchema,
} from './base';

/**
 * Session billing information
 */
export const sessionBillingInfoSchema = z.object({
  sessionId: z.string(),
  sessionDate: z.coerce.date(),
  duration: z.number().min(0).describe('Session duration in minutes'),
  modality: z.enum(['in_person', 'telehealth_video', 'telehealth_audio', 'group']),
  sessionType: z.enum(['initial', 'follow_up', 'crisis', 'assessment']),
  placeOfService: z.string().optional(),
});

/**
 * Billing modifier schema
 */
export const billingModifierSchema = z.object({
  code: z.string().regex(/^[A-Z0-9]{2}$/, 'Modifier must be 2 characters'),
  description: z.string(),
  reason: z.string(),
  confidence: confidenceScoreSchema,
});

/**
 * Extended CPT code suggestion with billing context
 */
export const cptCodeSuggestionSchema = cptCodeSchema.extend({
  primaryCode: z.boolean().default(true),
  timeBasedBilling: z.boolean().optional(),
  requiredDocumentation: z.array(z.string()),
  billingNotes: z.string().optional(),
  alternativeCodes: z.array(cptCodeSchema).optional(),
});

/**
 * Documentation completeness check
 */
export const documentationCompletenessSchema = z.object({
  complete: z.boolean(),
  missingElements: z.array(z.object({
    element: z.string(),
    requirement: z.string(),
    impact: z.enum(['billing_denied', 'reduced_reimbursement', 'audit_risk']),
  })),
  complianceScore: z.number().min(0).max(100),
  recommendations: z.array(z.string()),
});

/**
 * Medical necessity validation
 */
export const medicalNecessitySchema = z.object({
  justified: z.boolean(),
  rationale: z.string(),
  supportingDiagnoses: z.array(z.string()),
  clinicalIndicators: z.array(z.string()),
  confidence: confidenceScoreSchema,
});

/**
 * Billing compliance check
 */
export const billingComplianceSchema = z.object({
  compliant: z.boolean(),
  issues: z.array(z.object({
    type: z.enum(['coding', 'documentation', 'medical_necessity', 'timing', 'modifier']),
    description: z.string(),
    severity: z.enum(['minor', 'moderate', 'major']),
    recommendation: z.string(),
  })),
  auditRisk: z.enum(['low', 'medium', 'high']),
});

/**
 * Main billing output schema
 */
export const billingOutputSchema = baseAIOutputSchema.extend({
  sessionInfo: sessionBillingInfoSchema,
  cptCodes: z.array(cptCodeSuggestionSchema),
  icd10Codes: z.array(icd10CodeSchema),
  modifiers: z.array(billingModifierSchema),
  totalUnits: z.number().min(1),
  documentationComplete: documentationCompletenessSchema,
  medicalNecessity: medicalNecessitySchema,
  compliance: billingComplianceSchema,
  estimatedReimbursement: z.object({
    amount: z.number().min(0).optional(),
    currency: z.string().default('USD'),
    confidence: confidenceScoreSchema,
  }).optional(),
  billingNotes: z.string().optional(),
  additionalDocumentationRequired: z.boolean().optional(),
});

/**
 * Billing history analysis (for patterns and optimization)
 */
export const billingHistoryAnalysisSchema = z.object({
  timeframe: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }),
  commonCodes: z.array(z.object({
    code: z.string(),
    frequency: z.number(),
    averageReimbursement: z.number().optional(),
  })),
  denialPatterns: z.array(z.object({
    reason: z.string(),
    frequency: z.number(),
    preventionStrategy: z.string(),
  })),
  optimizationOpportunities: z.array(z.object({
    opportunity: z.string(),
    potentialImpact: z.string(),
    implementation: z.string(),
  })),
});

/**
 * Prior authorization requirement check
 */
export const priorAuthorizationSchema = z.object({
  required: z.boolean(),
  codes: z.array(z.string()),
  rationale: z.string().optional(),
  documentationNeeded: z.array(z.string()),
  typicalApprovalTime: z.string().optional(),
});

// Export types
export type SessionBillingInfo = z.infer<typeof sessionBillingInfoSchema>;
export type BillingModifier = z.infer<typeof billingModifierSchema>;
export type CPTCodeSuggestion = z.infer<typeof cptCodeSuggestionSchema>;
export type DocumentationCompleteness = z.infer<typeof documentationCompletenessSchema>;
export type MedicalNecessity = z.infer<typeof medicalNecessitySchema>;
export type BillingCompliance = z.infer<typeof billingComplianceSchema>;
export type BillingOutput = z.infer<typeof billingOutputSchema>;
export type BillingHistoryAnalysis = z.infer<typeof billingHistoryAnalysisSchema>;
export type PriorAuthorization = z.infer<typeof priorAuthorizationSchema>;

/**
 * Validation helpers specific to billing
 */
export function validateBillingOutput(data: unknown): BillingOutput {
  const result = billingOutputSchema.safeParse(data);
  
  if (!result.success) {
    console.error('[Billing-Schema] Validation failed:', result.error.errors);
    throw new Error('Invalid billing output format');
  }
  
  console.log('[Billing-Schema] Validation successful:', {
    cptCodes: result.data.cptCodes.map(c => c.code),
    icd10Codes: result.data.icd10Codes.map(c => c.code),
    complianceStatus: result.data.compliance.compliant,
    documentationComplete: result.data.documentationComplete.complete,
  });
  
  return result.data;
}

/**
 * Helper to check if billing is ready for submission
 */
export function isBillingReadyForSubmission(billing: BillingOutput): boolean {
  return (
    billing.documentationComplete.complete &&
    billing.medicalNecessity.justified &&
    billing.compliance.compliant &&
    billing.compliance.auditRisk !== 'high'
  );
}
