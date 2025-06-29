/**
 * Smart Actions Engine
 * 
 * Analyzes AI insights to generate contextual action recommendations
 * with clinical urgency prioritization and workflow efficiency optimization
 */

import {
  SmartAction,
  AIInsightsState,
  SafetyInsights,
  BillingInsights,
  ProgressInsights,
  SafetyAlert,
  BillingCode,
  GoalProgress,
  InsightSeverity,
  InsightConfidence
} from '@/lib/types/ai-insights';

// Generate unique IDs for actions
function generateActionId(): string {
  return `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Action type priorities (base values)
const ACTION_TYPE_PRIORITIES = {
  safety: 8,
  billing: 5,
  progress: 4,
  note: 3
} as const;

// Severity multipliers for prioritization
const SEVERITY_MULTIPLIERS: Record<InsightSeverity, number> = {
  critical: 1.5,
  high: 1.3,
  medium: 1.1,
  low: 1.0
};

// Confidence thresholds for action generation
const CONFIDENCE_THRESHOLDS = {
  high: 0.8,
  medium: 0.6,
  low: 0.4
} as const;

// Action generation configuration
interface ActionGenerationConfig {
  maxActionsPerType: number;
  includeConfidenceScores: boolean;
  urgencyThreshold: number;
  enableSmartGrouping: boolean;
}

// Action analytics metrics
interface ActionMetrics {
  generationTime: number;
  totalActionsGenerated: number;
  actionsByType: Record<string, number>;
  averagePriority: number;
  highPriorityCount: number;
}

// Default configuration
const DEFAULT_CONFIG: ActionGenerationConfig = {
  maxActionsPerType: 5,
  includeConfidenceScores: true,
  urgencyThreshold: 7, // Actions with priority >= 7 are considered urgent
  enableSmartGrouping: true
};

export class SmartActionsEngine {
  private config: ActionGenerationConfig;
  private metrics: ActionMetrics;
  private actionCache: Map<string, SmartAction[]>;

  constructor(config: ActionGenerationConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.actionCache = new Map();
    this.metrics = {
      generationTime: 0,
      totalActionsGenerated: 0,
      actionsByType: {},
      averagePriority: 0,
      highPriorityCount: 0
    };

    console.log('[SmartActions] Engine initialized:', {
      config: this.config,
      timestamp: Date.now()
    });
  }

  /**
   * Generate smart actions based on AI insights
   */
  public generateActions(insights: AIInsightsState): SmartAction[] {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(insights);

    console.log('[SmartActions] Starting action generation:', {
      safetyStatus: insights.safety.status,
      billingStatus: insights.billing.status,
      progressStatus: insights.progress.status,
      cacheKey,
      timestamp: Date.now()
    });

    // Check cache first
    if (this.actionCache.has(cacheKey)) {
      console.log('[SmartActions] Cache hit:', {
        cacheKey,
        actionsCount: this.actionCache.get(cacheKey)!.length
      });
      return this.actionCache.get(cacheKey)!;
    }

    const actions: SmartAction[] = [];

    // Generate safety-related actions
    if (insights.safety.status === 'success' && insights.safety.data) {
      const safetyActions = this.generateSafetyActions(insights.safety.data);
      actions.push(...safetyActions);
      console.log('[SmartActions] Safety actions generated:', {
        count: safetyActions.length,
        priorities: safetyActions.map(a => a.priority)
      });
    }

    // Generate billing-related actions
    if (insights.billing.status === 'success' && insights.billing.data) {
      const billingActions = this.generateBillingActions(insights.billing.data);
      actions.push(...billingActions);
      console.log('[SmartActions] Billing actions generated:', {
        count: billingActions.length,
        priorities: billingActions.map(a => a.priority)
      });
    }

    // Generate progress-related actions
    if (insights.progress.status === 'success' && insights.progress.data) {
      const progressActions = this.generateProgressActions(insights.progress.data);
      actions.push(...progressActions);
      console.log('[SmartActions] Progress actions generated:', {
        count: progressActions.length,
        priorities: progressActions.map(a => a.priority)
      });
    }

    // Generate note-related actions if multiple insights are available
    if (this.shouldGenerateNoteActions(insights)) {
      const noteActions = this.generateNoteActions(insights);
      actions.push(...noteActions);
      console.log('[SmartActions] Note actions generated:', {
        count: noteActions.length
      });
    }

    // Prioritize and deduplicate actions
    const prioritizedActions = this.prioritizeActions(actions);

    // Apply smart grouping if enabled
    const finalActions = this.config.enableSmartGrouping
      ? this.applySmartGrouping(prioritizedActions)
      : prioritizedActions;

    // Update metrics
    const endTime = performance.now();
    this.updateMetrics(finalActions, endTime - startTime);

    // Cache results
    this.actionCache.set(cacheKey, finalActions);

    console.log('[SmartActions] Action generation complete:', {
      totalActions: finalActions.length,
      urgentActions: finalActions.filter(a => a.priority >= this.config.urgencyThreshold).length,
      executionTime: endTime - startTime,
      metrics: this.metrics,
      topActions: finalActions.slice(0, 3).map(a => ({
        title: a.title,
        priority: a.priority,
        type: a.type
      }))
    });

    return finalActions;
  }

  /**
   * Generate safety-related actions
   */
  private generateSafetyActions(safetyInsights: SafetyInsights): SmartAction[] {
    const actions: SmartAction[] = [];

    // Add defensive checks for all properties
    const alerts = safetyInsights.alerts || [];
    const riskAssessment = safetyInsights.riskAssessment || {
      overallRisk: 'low' as const,
      riskScore: 0,
      riskFactors: [],
      protectiveFactors: []
    };

    console.log('[SmartActions] Processing safety insights:', {
      alertCount: alerts.length,
      overallRisk: riskAssessment.overallRisk,
      riskScore: riskAssessment.riskScore,
      hasRiskAssessment: !!safetyInsights.riskAssessment
    });

    // Process critical and high severity alerts
    const urgentAlerts = alerts.filter(
      alert => alert.severity === 'critical' || alert.severity === 'high'
    );

    for (const alert of urgentAlerts) {
      if (alert.escalationRequired) {
        actions.push(this.createSafetyEscalationAction(alert));
      }

      if (alert.urgentResponse) {
        actions.push(this.createUrgentResponseAction(alert));
      }

      // Add specific actions based on alert category
      switch (alert.category) {
        case 'suicide_risk':
        case 'self_harm':
          actions.push(this.createCrisisInterventionAction(alert));
          break;
        case 'medication_concern':
          actions.push(this.createMedicationReviewAction(alert));
          break;
        case 'substance_abuse':
          actions.push(this.createSubstanceAbuseAction(alert));
          break;
      }
    }

    // Add general safety follow-up if needed
    if (riskAssessment.riskScore >= 70) {
      actions.push(this.createSafetyFollowUpAction(safetyInsights));
    }

    return actions.slice(0, this.config.maxActionsPerType);
  }

  /**
   * Generate billing-related actions
   */
  private generateBillingActions(billingInsights: BillingInsights): SmartAction[] {
    const actions: SmartAction[] = [];

    // Add defensive checks for all properties
    const cptCodes = billingInsights.cptCodes || [];
    const icd10Codes = billingInsights.icd10Codes || [];
    const billingOptimization = billingInsights.billingOptimization || {
      suggestedAdjustments: [],
      complianceIssues: [],
      revenueOpportunities: []
    };

    console.log('[SmartActions] Processing billing insights:', {
      cptCount: cptCodes.length,
      icdCount: icd10Codes.length,
      complianceIssues: billingOptimization.complianceIssues.length,
      hasBillingOptimization: !!billingInsights.billingOptimization
    });

    // High-confidence billing codes for approval
    const highConfidenceCodes = [
      ...cptCodes,
      ...icd10Codes
    ].filter(code => code.confidence >= CONFIDENCE_THRESHOLDS.high);

    if (highConfidenceCodes.length > 0) {
      actions.push(this.createBillingApprovalAction(highConfidenceCodes));
    }

    // Medium-confidence codes for review
    const mediumConfidenceCodes = [
      ...cptCodes,
      ...icd10Codes
    ].filter(
      code => code.confidence >= CONFIDENCE_THRESHOLDS.medium && 
              code.confidence < CONFIDENCE_THRESHOLDS.high
    );

    if (mediumConfidenceCodes.length > 0) {
      actions.push(this.createBillingReviewAction(mediumConfidenceCodes));
    }

    // Compliance issues
    if (billingOptimization.complianceIssues && billingOptimization.complianceIssues.length > 0) {
      actions.push(this.createComplianceAction(billingOptimization));
    }

    // Revenue opportunities
    if (billingOptimization.revenueOpportunities && billingOptimization.revenueOpportunities.length > 0) {
      actions.push(this.createRevenueOptimizationAction(billingOptimization));
    }

    return actions.slice(0, this.config.maxActionsPerType);
  }

  /**
   * Generate progress-related actions
   */
  private generateProgressActions(progressInsights: ProgressInsights): SmartAction[] {
    const actions: SmartAction[] = [];

    // Add defensive checks for all properties
    const goalProgress = progressInsights.goalProgress || [];
    const overallEffectiveness = progressInsights.overallTreatmentEffectiveness || {
      rating: 5,
      trends: 'stable' as const,
      keyIndicators: []
    };
    const recommendations = progressInsights.recommendations || {
      treatmentAdjustments: [],
      newGoals: [],
      interventions: []
    };
    const sessionQuality = progressInsights.sessionQuality || {
      engagement: 5,
      therapeuticRapport: 5,
      progressTowardGoals: 5
    };

    console.log('[SmartActions] Processing progress insights:', {
      goalCount: goalProgress.length,
      overallEffectiveness: overallEffectiveness.rating,
      trends: overallEffectiveness.trends,
      hasRecommendations: recommendations.interventions.length > 0,
      hasSessionQuality: !!progressInsights.sessionQuality
    });

    // Process goal progress
    for (const goal of goalProgress) {
      if (goal.currentStatus === 'achieved') {
        actions.push(this.createGoalAchievedAction(goal));
      } else if (goal.barriers && goal.barriers.length > 0) {
        actions.push(this.createAddressBarriersAction(goal));
      }
    }

    // Treatment effectiveness actions
    if (overallEffectiveness.rating < 5) {
      actions.push(this.createTreatmentAdjustmentAction(progressInsights));
    }

    // New interventions
    if (recommendations.interventions && recommendations.interventions.length > 0) {
      actions.push(this.createNewInterventionAction(recommendations));
    }

    // Session quality actions
    if (sessionQuality.engagement < 5 || sessionQuality.therapeuticRapport < 5) {
      actions.push(this.createImproveEngagementAction(sessionQuality));
    }

    return actions.slice(0, this.config.maxActionsPerType);
  }

  /**
   * Generate note-related actions
   */
  private generateNoteActions(insights: AIInsightsState): SmartAction[] {
    const actions: SmartAction[] = [];

    const hasMultipleInsights = 
      [insights.safety.status, insights.billing.status, insights.progress.status]
        .filter(status => status === 'success').length >= 2;

    if (hasMultipleInsights) {
      actions.push({
        id: generateActionId(),
        type: 'note',
        title: 'Generate Comprehensive Clinical Note',
        description: 'Create a complete clinical note incorporating all AI insights',
        icon: 'FileText',
        priority: this.calculateNotePriority(insights),
        requiresConfirmation: false,
        estimatedTime: 5,
        context: {
          relatedData: {
            insightTypes: ['safety', 'billing', 'progress'].filter(
              type => (insights[type as keyof Omit<AIInsightsState, 'overallProgress' | 'estimatedCompletion' | 'lastUpdated'>] as any)?.status === 'success'
            )
          }
        },
        action: async () => {
          console.log('[SmartActions] Generating comprehensive clinical note');
        }
      });
    }

    return actions;
  }

  /**
   * Create safety escalation action
   */
  private createSafetyEscalationAction(alert: SafetyAlert): SmartAction {
    return {
      id: generateActionId(),
      type: 'safety',
      title: 'Escalate Safety Alert',
      description: `Immediate escalation required: ${alert.title}`,
      icon: 'AlertTriangle',
      priority: this.calculatePriority('safety', alert.severity, 1.0, true),
      requiresConfirmation: true,
      estimatedTime: 2,
      context: {
        insightId: alert.id,
        relatedData: {
          alertCategory: alert.category,
          riskScore: alert.riskScore
        }
      },
      action: async () => {
        console.log('[SmartActions] Escalating safety alert:', alert.id);
      }
    };
  }

  /**
   * Create urgent response action
   */
  private createUrgentResponseAction(alert: SafetyAlert): SmartAction {
    return {
      id: generateActionId(),
      type: 'safety',
      title: 'Contact Crisis Team',
      description: `Urgent: ${alert.contactInformation?.crisisHotline || 'Contact emergency services'}`,
      icon: 'Phone',
      priority: this.calculatePriority('safety', 'critical', 1.0, true),
      requiresConfirmation: false,
      estimatedTime: 1,
      context: {
        insightId: alert.id,
        relatedData: {
          contactInfo: alert.contactInformation
        }
      },
      action: async () => {
        console.log('[SmartActions] Initiating crisis contact');
      }
    };
  }

  /**
   * Create crisis intervention action
   */
  private createCrisisInterventionAction(alert: SafetyAlert): SmartAction {
    return {
      id: generateActionId(),
      type: 'safety',
      title: 'Initiate Crisis Intervention Protocol',
      description: 'Follow established crisis intervention procedures',
      icon: 'Shield',
      priority: this.calculatePriority('safety', alert.severity, 0.95, true),
      requiresConfirmation: true,
      estimatedTime: 10,
      context: {
        insightId: alert.id,
        relatedData: {
          protocol: 'crisis_intervention',
          category: alert.category
        }
      },
      action: async () => {
        console.log('[SmartActions] Initiating crisis intervention protocol');
      }
    };
  }

  /**
   * Create medication review action
   */
  private createMedicationReviewAction(alert: SafetyAlert): SmartAction {
    return {
      id: generateActionId(),
      type: 'safety',
      title: 'Review Medication Concerns',
      description: `Medication safety issue detected: ${alert.description.substring(0, 100)}...`,
      icon: 'Pill',
      priority: this.calculatePriority('safety', alert.severity, 0.85),
      requiresConfirmation: true,
      estimatedTime: 5,
      context: {
        insightId: alert.id,
        relatedData: {
          category: 'medication_concern'
        }
      },
      action: async () => {
        console.log('[SmartActions] Reviewing medication concerns');
      }
    };
  }

  /**
   * Create substance abuse action
   */
  private createSubstanceAbuseAction(alert: SafetyAlert): SmartAction {
    return {
      id: generateActionId(),
      type: 'safety',
      title: 'Address Substance Use Concerns',
      description: 'Review substance use patterns and consider intervention',
      icon: 'AlertCircle',
      priority: this.calculatePriority('safety', alert.severity, 0.8),
      requiresConfirmation: true,
      estimatedTime: 8,
      context: {
        insightId: alert.id,
        relatedData: {
          category: 'substance_abuse'
        }
      },
      action: async () => {
        console.log('[SmartActions] Addressing substance use concerns');
      }
    };
  }

  /**
   * Create safety follow-up action
   */
  private createSafetyFollowUpAction(safetyInsights: SafetyInsights): SmartAction {
    return {
      id: generateActionId(),
      type: 'safety',
      title: 'Schedule Safety Follow-up',
      description: `High risk score (${safetyInsights.riskAssessment.riskScore}/100) requires follow-up`,
      icon: 'Calendar',
      priority: this.calculatePriority('safety', safetyInsights.riskAssessment.overallRisk, 0.75),
      requiresConfirmation: true,
      estimatedTime: 3,
      context: {
        relatedData: {
          riskScore: safetyInsights.riskAssessment.riskScore,
          riskFactors: safetyInsights.riskAssessment.riskFactors
        }
      },
      action: async () => {
        console.log('[SmartActions] Scheduling safety follow-up');
      }
    };
  }

  /**
   * Create billing approval action
   */
  private createBillingApprovalAction(codes: BillingCode[]): SmartAction {
    const avgConfidence = codes.reduce((sum, code) => sum + code.confidence, 0) / codes.length;
    
    return {
      id: generateActionId(),
      type: 'billing',
      title: 'Approve High-Confidence Billing Codes',
      description: `${codes.length} codes ready for approval (avg. ${Math.round(avgConfidence * 100)}% confidence)`,
      icon: 'CheckCircle',
      priority: this.calculatePriority('billing', 'high', avgConfidence),
      requiresConfirmation: true,
      estimatedTime: 2,
      context: {
        relatedData: {
          codes: codes.map(c => ({ code: c.code, confidence: c.confidence })),
          totalCodes: codes.length
        }
      },
      action: async () => {
        console.log('[SmartActions] Approving billing codes:', codes.length);
      }
    };
  }

  /**
   * Create billing review action
   */
  private createBillingReviewAction(codes: BillingCode[]): SmartAction {
    return {
      id: generateActionId(),
      type: 'billing',
      title: 'Review Medium-Confidence Codes',
      description: `${codes.length} codes need review before approval`,
      icon: 'Eye',
      priority: this.calculatePriority('billing', 'medium', 0.7),
      requiresConfirmation: false,
      estimatedTime: 5,
      context: {
        relatedData: {
          codes: codes.map(c => ({ code: c.code, confidence: c.confidence })),
          totalCodes: codes.length
        }
      },
      action: async () => {
        console.log('[SmartActions] Reviewing billing codes:', codes.length);
      }
    };
  }

  /**
   * Create compliance action
   */
  private createComplianceAction(optimization: BillingInsights['billingOptimization']): SmartAction {
    return {
      id: generateActionId(),
      type: 'billing',
      title: 'Address Billing Compliance Issues',
      description: `${optimization.complianceIssues.length} compliance issues detected`,
      icon: 'AlertTriangle',
      priority: this.calculatePriority('billing', 'high', 0.9),
      requiresConfirmation: true,
      estimatedTime: 10,
      context: {
        relatedData: {
          issues: optimization.complianceIssues
        }
      },
      action: async () => {
        console.log('[SmartActions] Addressing compliance issues');
      }
    };
  }

  /**
   * Create revenue optimization action
   */
  private createRevenueOptimizationAction(optimization: BillingInsights['billingOptimization']): SmartAction {
    return {
      id: generateActionId(),
      type: 'billing',
      title: 'Review Revenue Opportunities',
      description: `${optimization.revenueOpportunities.length} potential optimizations identified`,
      icon: 'DollarSign',
      priority: this.calculatePriority('billing', 'medium', 0.6),
      requiresConfirmation: false,
      estimatedTime: 5,
      context: {
        relatedData: {
          opportunities: optimization.revenueOpportunities
        }
      },
      action: async () => {
        console.log('[SmartActions] Reviewing revenue opportunities');
      }
    };
  }

  /**
   * Create goal achieved action
   */
  private createGoalAchievedAction(goal: GoalProgress): SmartAction {
    return {
      id: generateActionId(),
      type: 'progress',
      title: 'Document Goal Achievement',
      description: `Goal achieved: ${goal.goalDescription}`,
      icon: 'Trophy',
      priority: this.calculatePriority('progress', 'medium', 0.8),
      requiresConfirmation: false,
      estimatedTime: 3,
      context: {
        relatedData: {
          goalId: goal.goalId,
          evidence: goal.evidence
        }
      },
      action: async () => {
        console.log('[SmartActions] Documenting goal achievement:', goal.goalId);
      }
    };
  }

  /**
   * Create address barriers action
   */
  private createAddressBarriersAction(goal: GoalProgress): SmartAction {
    return {
      id: generateActionId(),
      type: 'progress',
      title: 'Address Treatment Barriers',
      description: `${goal.barriers.length} barriers identified for: ${goal.goalDescription}`,
      icon: 'Target',
      priority: this.calculatePriority('progress', 'high', 0.7),
      requiresConfirmation: true,
      estimatedTime: 8,
      context: {
        relatedData: {
          goalId: goal.goalId,
          barriers: goal.barriers
        }
      },
      action: async () => {
        console.log('[SmartActions] Addressing treatment barriers:', goal.goalId);
      }
    };
  }

  /**
   * Create treatment adjustment action
   */
  private createTreatmentAdjustmentAction(progressInsights: ProgressInsights): SmartAction {
    return {
      id: generateActionId(),
      type: 'progress',
      title: 'Adjust Treatment Plan',
      description: `Low effectiveness rating (${progressInsights.overallTreatmentEffectiveness.rating}/10) suggests plan adjustment`,
      icon: 'RefreshCw',
      priority: this.calculatePriority('progress', 'high', 0.85),
      requiresConfirmation: true,
      estimatedTime: 15,
      context: {
        relatedData: {
          currentRating: progressInsights.overallTreatmentEffectiveness.rating,
          trends: progressInsights.overallTreatmentEffectiveness.trends,
          recommendations: progressInsights.recommendations.treatmentAdjustments
        }
      },
      action: async () => {
        console.log('[SmartActions] Adjusting treatment plan');
      }
    };
  }

  /**
   * Create new intervention action
   */
  private createNewInterventionAction(recommendations: ProgressInsights['recommendations']): SmartAction {
    return {
      id: generateActionId(),
      type: 'progress',
      title: 'Add New Interventions',
      description: `${recommendations.interventions.length} new interventions recommended`,
      icon: 'Plus',
      priority: this.calculatePriority('progress', 'medium', 0.7),
      requiresConfirmation: true,
      estimatedTime: 10,
      context: {
        relatedData: {
          interventions: recommendations.interventions
        }
      },
      action: async () => {
        console.log('[SmartActions] Adding new interventions');
      }
    };
  }

  /**
   * Create improve engagement action
   */
  private createImproveEngagementAction(sessionQuality: ProgressInsights['sessionQuality']): SmartAction {
    return {
      id: generateActionId(),
      type: 'progress',
      title: 'Improve Session Engagement',
      description: `Low engagement (${sessionQuality.engagement}/10) or rapport (${sessionQuality.therapeuticRapport}/10)`,
      icon: 'Users',
      priority: this.calculatePriority('progress', 'medium', 0.6),
      requiresConfirmation: false,
      estimatedTime: 5,
      context: {
        relatedData: {
          engagement: sessionQuality.engagement,
          rapport: sessionQuality.therapeuticRapport
        }
      },
      action: async () => {
        console.log('[SmartActions] Improving session engagement');
      }
    };
  }

  /**
   * Calculate action priority
   */
  private calculatePriority(
    type: SmartAction['type'],
    severity: InsightSeverity | string,
    confidence: InsightConfidence,
    isUrgent: boolean = false
  ): number {
    const basePriority = ACTION_TYPE_PRIORITIES[type];
    const severityMultiplier = SEVERITY_MULTIPLIERS[severity as InsightSeverity] || 1.0;
    const confidenceMultiplier = 0.5 + (confidence * 0.5); // 0.5 to 1.0
    const urgencyFactor = isUrgent ? 1.5 : 1.0;

    const priority = Math.round(
      basePriority * severityMultiplier * confidenceMultiplier * urgencyFactor
    );

    return Math.min(10, Math.max(1, priority)); // Clamp between 1-10
  }

  /**
   * Calculate note priority based on insights
   */
  private calculateNotePriority(insights: AIInsightsState): number {
    let priority = ACTION_TYPE_PRIORITIES.note;

    // Increase priority if safety concerns exist
    if (insights.safety.status === 'success' && insights.safety.data) {
      const hasHighRisk = insights.safety.data.riskAssessment.overallRisk === 'high' ||
                         insights.safety.data.riskAssessment.overallRisk === 'critical';
      if (hasHighRisk) priority += 2;
    }

    // Increase priority if high-confidence billing codes exist
    if (insights.billing.status === 'success' && insights.billing.data) {
      const hasHighConfidenceCodes = insights.billing.data.cptCodes.some(
        code => code.confidence >= CONFIDENCE_THRESHOLDS.high
      );
      if (hasHighConfidenceCodes) priority += 1;
    }

    return Math.min(10, priority);
  }

  /**
   * Prioritize and deduplicate actions
   */
  private prioritizeActions(actions: SmartAction[]): SmartAction[] {
    // Sort by priority (descending) and remove duplicates
    const uniqueActions = new Map<string, SmartAction>();
    
    actions
      .sort((a, b) => b.priority - a.priority)
      .forEach(action => {
        const key = `${action.type}-${action.title}`;
        if (!uniqueActions.has(key)) {
          uniqueActions.set(key, action);
        }
      });

    return Array.from(uniqueActions.values());
  }

  /**
   * Apply smart grouping to related actions
   */
  private applySmartGrouping(actions: SmartAction[]): SmartAction[] {
    console.log('[SmartActions] Applying smart grouping to actions');

    // Group related billing actions
    const billingActions = actions.filter(a => a.type === 'billing');
    if (billingActions.length > 2) {
      const groupedBillingAction: SmartAction = {
        id: generateActionId(),
        type: 'billing',
        title: 'Review All Billing Items',
        description: `${billingActions.length} billing actions grouped for efficiency`,
        icon: 'FileText',
        priority: Math.max(...billingActions.map(a => a.priority)),
        requiresConfirmation: true,
        estimatedTime: billingActions.reduce((sum, a) => sum + a.estimatedTime, 0),
        context: {
          relatedData: {
            groupedActions: billingActions.map(a => a.id)
          }
        },
        action: async () => {
          console.log('[SmartActions] Executing grouped billing actions');
        }
      };

      // Replace individual billing actions with grouped action
      actions = actions.filter(a => a.type !== 'billing');
      actions.push(groupedBillingAction);
    }

    // Re-sort after grouping
    return actions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Check if note actions should be generated
   */
  private shouldGenerateNoteActions(insights: AIInsightsState): boolean {
    const successfulPipelines = [
      insights.safety.status,
      insights.billing.status,
      insights.progress.status
    ].filter(status => status === 'success').length;

    return successfulPipelines >= 2;
  }

  /**
   * Update metrics
   */
  private updateMetrics(actions: SmartAction[], executionTime: number): void {
    this.metrics.generationTime = executionTime;
    this.metrics.totalActionsGenerated = actions.length;
    this.metrics.actionsByType = {};
    
    let totalPriority = 0;
    let highPriorityCount = 0;

    for (const action of actions) {
      // Count by type
      this.metrics.actionsByType[action.type] = 
        (this.metrics.actionsByType[action.type] || 0) + 1;
      
      // Calculate average priority
      totalPriority += action.priority;
      
      // Count high priority actions
      if (action.priority >= this.config.urgencyThreshold) {
        highPriorityCount++;
      }
    }

    this.metrics.averagePriority = actions.length > 0 
      ? totalPriority / actions.length 
      : 0;
    this.metrics.highPriorityCount = highPriorityCount;
  }

  /**
   * Generate cache key for action results
   */
  private generateCacheKey(insights: AIInsightsState): string {
    const parts = [
      insights.safety.status,
      insights.safety.data ? 'safety-data' : 'no-safety',
      insights.billing.status,
      insights.billing.data ? 'billing-data' : 'no-billing',
      insights.progress.status,
      insights.progress.data ? 'progress-data' : 'no-progress',
      insights.lastUpdated.toString()
    ];
    
    return parts.join('-');
  }

  /**
   * Get performance metrics
   */
  public getMetrics(): ActionMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear action cache
   */
  public clearCache(): void {
    console.log('[SmartActions] Clearing action cache:', {
      cacheSize: this.actionCache.size,
      timestamp: Date.now()
    });
    
    this.actionCache.clear();
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ActionGenerationConfig>): void {
    console.log('[SmartActions] Updating configuration:', {
      oldConfig: this.config,
      newConfig,
      timestamp: Date.now()
    });
    
    this.config = { ...this.config, ...newConfig };
    this.clearCache(); // Clear cache when config changes
  }
}

// Singleton instance for application-wide use
export const smartActionsEngine = new SmartActionsEngine();

// Export factory function for custom configurations
export function createSmartActionsEngine(
  config?: Partial<ActionGenerationConfig>
): SmartActionsEngine {
  return new SmartActionsEngine({ ...DEFAULT_CONFIG, ...config });
}

// Utility functions for quick action generation
export function generateSmartActions(
  insights: AIInsightsState,
  config?: Partial<ActionGenerationConfig>
): SmartAction[] {
  const engine = config ? createSmartActionsEngine(config) : smartActionsEngine;
  return engine.generateActions(insights);
}

export function clearActionCache(): void {
  smartActionsEngine.clearCache();
}
