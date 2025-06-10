/**
 * Treatment Progress Pipeline Output Schemas
 * 
 * Zod schemas for validating treatment progress assessment AI responses.
 * Includes goal tracking, barrier identification, and recommendations.
 */

import { z } from 'zod';
import { 
  baseAIOutputSchema, 
  confidenceScoreSchema,
  treatmentRecommendationSchema,
} from './base';

/**
 * Treatment goal progress schema
 */
export const goalProgressSchema = z.object({
  goalId: z.string(),
  goalText: z.string(),
  targetDate: z.coerce.date().optional(),
  category: z.enum(['behavioral', 'cognitive', 'social', 'emotional', 'functional']),
  progressPercentage: z.number().min(0).max(100),
  status: z.enum(['not_started', 'in_progress', 'achieved', 'discontinued', 'modified']),
  evidence: z.array(z.string()).describe('Evidence of progress from sessions'),
  barriers: z.array(z.string()).optional(),
  lastUpdated: z.coerce.date(),
  confidence: confidenceScoreSchema,
});

/**
 * Progress indicator schema
 */
export const progressIndicatorSchema = z.object({
  indicator: z.string(),
  type: z.enum(['improvement', 'maintenance', 'regression']),
  domain: z.enum(['symptoms', 'functioning', 'relationships', 'quality_of_life', 'treatment_engagement']),
  magnitude: z.enum(['minimal', 'moderate', 'significant']),
  timeframe: z.string().describe('Timeframe of observed change'),
  supportingData: z.array(z.string()),
});

/**
 * Treatment barrier schema
 */
export const treatmentBarrierSchema = z.object({
  barrier: z.string(),
  category: z.enum(['personal', 'environmental', 'systemic', 'clinical', 'social']),
  impact: z.enum(['low', 'medium', 'high']),
  addressable: z.boolean(),
  suggestedInterventions: z.array(z.string()),
  patientAwareness: z.enum(['unaware', 'partially_aware', 'fully_aware']).optional(),
});

/**
 * Clinical outcome measure
 */
export const clinicalOutcomeSchema = z.object({
  measure: z.string().describe('Name of outcome measure (e.g., PHQ-9, GAD-7)'),
  currentScore: z.number(),
  previousScore: z.number().optional(),
  changeDirection: z.enum(['improved', 'stable', 'worsened']),
  changePercentage: z.number().optional(),
  clinicalSignificance: z.boolean(),
  interpretation: z.string(),
});

/**
 * Treatment effectiveness analysis
 */
export const treatmentEffectivenessSchema = z.object({
  overallEffectiveness: z.enum(['highly_effective', 'moderately_effective', 'minimally_effective', 'ineffective']),
  effectiveInterventions: z.array(z.object({
    intervention: z.string(),
    effectiveness: z.enum(['high', 'moderate', 'low']),
    patientResponse: z.string(),
  })),
  ineffectiveInterventions: z.array(z.object({
    intervention: z.string(),
    reason: z.string(),
    alternativeApproach: z.string().optional(),
  })),
  confidence: confidenceScoreSchema,
});

/**
 * Main treatment progress output schema
 */
export const treatmentProgressOutputSchema = baseAIOutputSchema.extend({
  assessmentPeriod: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
    sessionsIncluded: z.number(),
  }),
  goalProgress: z.array(goalProgressSchema),
  progressIndicators: z.array(progressIndicatorSchema),
  barriers: z.array(treatmentBarrierSchema),
  clinicalOutcomes: z.array(clinicalOutcomeSchema),
  effectiveness: treatmentEffectivenessSchema,
  recommendations: z.array(treatmentRecommendationSchema),
  treatmentAdjustments: z.array(z.object({
    type: z.enum(['add', 'modify', 'discontinue']),
    target: z.string(),
    rationale: z.string(),
    expectedOutcome: z.string(),
  })),
  nextReviewDate: z.coerce.date(),
  summaryNarrative: z.string(),
});

/**
 * Progress trend analysis (for long-term tracking)
 */
export const progressTrendAnalysisSchema = z.object({
  timeframe: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }),
  overallTrend: z.enum(['improving', 'stable', 'declining', 'variable']),
  trendsByDomain: z.array(z.object({
    domain: z.string(),
    trend: z.enum(['improving', 'stable', 'declining', 'variable']),
    keyFactors: z.array(z.string()),
  })),
  criticalPeriods: z.array(z.object({
    period: z.object({
      start: z.coerce.date(),
      end: z.coerce.date(),
    }),
    event: z.string(),
    impact: z.enum(['positive', 'negative', 'neutral']),
  })),
  predictedTrajectory: z.object({
    direction: z.enum(['positive', 'stable', 'negative', 'uncertain']),
    confidence: confidenceScoreSchema,
    factors: z.array(z.string()),
  }),
});

/**
 * Treatment plan modification schema
 */
export const treatmentPlanModificationSchema = z.object({
  modificationType: z.enum(['minor_adjustment', 'significant_change', 'complete_revision']),
  currentApproach: z.string(),
  proposedChanges: z.array(z.object({
    change: z.string(),
    rationale: z.string(),
    expectedImpact: z.string(),
    implementation: z.string(),
  })),
  stakeholderInput: z.array(z.object({
    stakeholder: z.enum(['patient', 'provider', 'family', 'team']),
    feedback: z.string(),
    incorporated: z.boolean(),
  })).optional(),
  approvalRequired: z.boolean(),
});

// Export types
export type GoalProgress = z.infer<typeof goalProgressSchema>;
export type ProgressIndicator = z.infer<typeof progressIndicatorSchema>;
export type TreatmentBarrier = z.infer<typeof treatmentBarrierSchema>;
export type ClinicalOutcome = z.infer<typeof clinicalOutcomeSchema>;
export type TreatmentEffectiveness = z.infer<typeof treatmentEffectivenessSchema>;
export type TreatmentProgressOutput = z.infer<typeof treatmentProgressOutputSchema>;
export type ProgressTrendAnalysis = z.infer<typeof progressTrendAnalysisSchema>;
export type TreatmentPlanModification = z.infer<typeof treatmentPlanModificationSchema>;

/**
 * Validation helpers specific to treatment progress
 */
export function validateTreatmentProgressOutput(data: unknown): TreatmentProgressOutput {
  const result = treatmentProgressOutputSchema.safeParse(data);
  
  if (!result.success) {
    console.error('[Treatment-Progress-Schema] Validation failed:', result.error.errors);
    throw new Error('Invalid treatment progress output format');
  }
  
  console.log('[Treatment-Progress-Schema] Validation successful:', {
    goalsAssessed: result.data.goalProgress.length,
    progressIndicators: result.data.progressIndicators.length,
    barriers: result.data.barriers.length,
    overallEffectiveness: result.data.effectiveness.overallEffectiveness,
  });
  
  return result.data;
}

/**
 * Helper to determine if treatment plan needs modification
 */
export function needsTreatmentPlanModification(progress: TreatmentProgressOutput): boolean {
  const ineffectiveCount = progress.effectiveness.ineffectiveInterventions.length;
  const highImpactBarriers = progress.barriers.filter(b => b.impact === 'high').length;
  const regressingGoals = progress.goalProgress.filter(g => g.status === 'discontinued' || g.progressPercentage < 25).length;
  
  return (
    progress.effectiveness.overallEffectiveness === 'ineffective' ||
    ineffectiveCount > 2 ||
    highImpactBarriers > 1 ||
    regressingGoals > progress.goalProgress.length / 2
  );
}
