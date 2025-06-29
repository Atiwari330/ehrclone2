/**
 * AI Insights Type Definitions
 * 
 * Comprehensive TypeScript interfaces for AI pipeline results
 * and progressive loading state management
 */

// Centralized Pipeline Configuration
export const PIPELINES = ['safety', 'billing', 'progress', 'note'] as const;
export type PipelineKey = typeof PIPELINES[number];

// Base types for all AI insights
export type InsightSeverity = 'low' | 'medium' | 'high' | 'critical';
export type InsightConfidence = number; // 0.0 to 1.0
export type PipelineStatus = 'idle' | 'loading' | 'success' | 'error' | 'retrying';

// Pipeline execution metadata
export interface PipelineExecutionMetadata {
  executionId: string;
  modelUsed: string;
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
  cacheHit: boolean;
  executionTime: number; // milliseconds
  retryCount?: number;
  timestamp: string;
}

// Base insight interface
export interface BaseInsight {
  id: string;
  type: string;
  confidence: InsightConfidence;
  severity: InsightSeverity;
  title: string;
  description: string;
  recommendedActions: string[];
  transcriptReferences?: {
    entryId: string;
    startIndex: number;
    endIndex: number;
    relevantText: string;
  }[];
  metadata?: Record<string, any>;
}

// Safety Analysis Results
export interface SafetyAlert extends BaseInsight {
  category: 'suicide_risk' | 'self_harm' | 'violence_risk' | 'substance_abuse' | 'medication_concern' | 'crisis_intervention';
  riskScore?: number; // 0-100
  urgentResponse: boolean;
  escalationRequired: boolean;
  contactInformation?: {
    crisisHotline?: string;
    emergencyServices?: string;
    supervisor?: string;
  };
}

export interface SafetyInsights {
  riskAssessment: {
    overallRisk: InsightSeverity;
    riskScore: number;
    riskFactors: string[];
    protectiveFactors: string[];
  };
  alerts: SafetyAlert[];
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  confidence: InsightConfidence;
}

// Billing Analysis Results
export interface BillingCode {
  code: string;
  description: string;
  confidence: InsightConfidence;
  category: 'primary' | 'secondary' | 'suggested';
  modifiers?: string[];
  documentation?: string;
  complianceNotes?: string[];
}

export interface BillingInsights {
  cptCodes: BillingCode[];
  icd10Codes: BillingCode[];
  sessionType: {
    detected: string;
    confidence: InsightConfidence;
    duration: number; // minutes
  };
  billingOptimization: {
    suggestedAdjustments: string[];
    complianceIssues: string[];
    revenueOpportunities: string[];
  };
  confidence: InsightConfidence;
}

// Treatment Progress Results
export interface GoalProgress {
  goalId: string;
  goalDescription: string;
  currentStatus: 'not_started' | 'in_progress' | 'partially_met' | 'achieved' | 'modified';
  progressPercentage: number; // 0-100
  evidence: string[];
  barriers: string[];
  nextSteps: string[];
}

export interface ProgressInsights {
  goalProgress: GoalProgress[];
  overallTreatmentEffectiveness: {
    rating: number; // 1-10
    trends: 'improving' | 'stable' | 'declining' | 'mixed';
    keyIndicators: string[];
  };
  recommendations: {
    treatmentAdjustments: string[];
    newGoals: string[];
    interventions: string[];
  };
  sessionQuality: {
    engagement: number; // 1-10
    therapeuticRapport: number; // 1-10
    progressTowardGoals: number; // 1-10
  };
  confidence: InsightConfidence;
}

// Clinical Note Generation Results
export interface NoteSection {
  type: 'subjective' | 'objective' | 'assessment' | 'plan';
  title: string;
  content: string;
  confidence: InsightConfidence;
}

export interface NoteGenerationInsights {
  sections: NoteSection[];
  confidence: InsightConfidence;
}

// Pipeline State Management
export interface PipelineState<T = any> {
  status: PipelineStatus;
  data: T | null;
  error: Error | null;
  progress: number; // 0-100
  startTime?: number;
  endTime?: number;
  metadata?: PipelineExecutionMetadata;
}

// Combined AI Insights State
export interface AIInsightsState {
  safety: PipelineState<SafetyInsights>;
  billing: PipelineState<BillingInsights>;
  progress: PipelineState<ProgressInsights>;
  note: PipelineState<NoteGenerationInsights>;
  overallProgress: number; // 0-100
  estimatedCompletion?: number; // timestamp
  lastUpdated: number; // timestamp
}

// Pipeline Configuration
export interface PipelineConfig {
  enabled: boolean;
  priority: number; // 1-10, higher = runs first
  timeout: number; // milliseconds
  retryAttempts: number;
  cacheEnabled: boolean;
  cacheTTL?: number; // seconds
}

export interface AIInsightsConfig {
  safety: PipelineConfig;
  billing: PipelineConfig;
  progress: PipelineConfig;
  note: PipelineConfig;
  globalTimeout: number; // milliseconds
  parallelExecution: boolean;
  progressiveLoading: boolean;
}

// Pipeline Orchestrator Interface
export interface PipelineOrchestrator {
  coordinateAnalysis(
    transcript: string,
    sessionId: string,
    patientId: string,
    config?: Partial<AIInsightsConfig>
  ): Promise<AIInsightsState>;
  
  streamAnalysis(
    transcript: string,
    sessionId: string,
    patientId: string,
    onUpdate: (update: PipelineUpdate) => void,
    config?: Partial<AIInsightsConfig>
  ): Promise<void>;
  
  retryPipeline(
    pipelineType: keyof AIInsightsState,
    transcript: string,
    sessionId: string,
    patientId: string
  ): Promise<PipelineState>;
  
  cancelAnalysis(sessionId: string): void;
  
  getHealth(): Promise<{
    healthy: boolean;
    pipelines: Record<string, boolean>;
    performance: Record<string, number>;
  }>;
}

// Progressive Loading Updates
export interface PipelineUpdate {
  pipeline: keyof AIInsightsState;
  status: PipelineStatus;
  progress: number;
  data?: any;
  error?: Error;
  metadata?: PipelineExecutionMetadata;
  timestamp: number;
}

// Streaming Response Types
export interface StreamingResponse {
  sessionId: string;
  updates: PipelineUpdate[];
  completed: boolean;
  overallProgress: number;
  estimatedCompletion?: number;
}

// Error Types
export class PipelineError extends Error {
  constructor(
    message: string,
    public pipeline: string,
    public code: string,
    public retryable: boolean = true,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'PipelineError';
  }
}

export class PipelineTimeoutError extends PipelineError {
  constructor(pipeline: string, timeout: number) {
    super(
      `Pipeline ${pipeline} timed out after ${timeout}ms`,
      pipeline,
      'TIMEOUT',
      true,
      { timeout }
    );
    this.name = 'PipelineTimeoutError';
  }
}

export class PipelineValidationError extends PipelineError {
  constructor(pipeline: string, validationErrors: string[]) {
    super(
      `Pipeline ${pipeline} validation failed: ${validationErrors.join(', ')}`,
      pipeline,
      'VALIDATION_ERROR',
      false,
      { validationErrors }
    );
    this.name = 'PipelineValidationError';
  }
}

// API Response Types
export interface AIInsightsAPIResponse {
  success: boolean;
  data?: {
    sessionId: string;
    patientId: string;
    insights: AIInsightsState;
    executionTime: number;
    metadata: {
      pipelineCount: number;
      cacheHits: number;
      retryCount: number;
    };
  };
  error?: {
    message: string;
    code: string;
    pipeline?: string;
    retryable: boolean;
  };
  timestamp: string;
}

// Transcript Highlighting Types
export interface TranscriptHighlight {
  entryId: string;
  startIndex: number;
  endIndex: number;
  type: 'safety' | 'billing' | 'progress';
  severity: InsightSeverity;
  insightId: string;
  color: string;
  tooltip?: string;
}

export interface HighlightConfig {
  safety: {
    critical: { color: string; opacity: number };
    high: { color: string; opacity: number };
    medium: { color: string; opacity: number };
    low: { color: string; opacity: number };
  };
  billing: {
    primary: { color: string; opacity: number };
    secondary: { color: string; opacity: number };
    suggested: { color: string; opacity: number };
  };
  progress: {
    achieved: { color: string; opacity: number };
    in_progress: { color: string; opacity: number };
    barriers: { color: string; opacity: number };
  };
}

// Smart Actions Types
export interface SmartAction {
  id: string;
  type: 'safety' | 'billing' | 'progress' | 'note';
  title: string;
  description: string;
  icon: string;
  priority: number; // 1-10
  requiresConfirmation: boolean;
  estimatedTime: number; // seconds
  context: {
    insightId?: string;
    transcriptReference?: string;
    relatedData?: Record<string, any>;
  };
  action: () => Promise<void>;
}

// Real-time Note Preview Types
export interface LiveNotePreview {
  sections: NoteSection[];
  completionPercentage: number;
  qualityScore: number; // 1-10
  missingElements: string[];
  suggestedImprovements: string[];
  lastUpdated: number;
}

// Performance Analytics Types
export interface PerformanceMetrics {
  pipelineExecutionTimes: Record<string, number[]>;
  cacheHitRates: Record<string, number>;
  errorRates: Record<string, number>;
  userInteractionTimes: Record<string, number[]>;
  pageLoadTimes: number[];
  transcriptRenderingTimes: Record<number, number>; // entries count -> render time
}

// Export default configuration
export const DEFAULT_AI_INSIGHTS_CONFIG: AIInsightsConfig = {
  safety: {
    enabled: true,
    priority: 10, // Highest priority
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    cacheEnabled: true,
    cacheTTL: 3600, // 1 hour
  },
  billing: {
    enabled: true,
    priority: 8,
    timeout: 25000, // 25 seconds
    retryAttempts: 2,
    cacheEnabled: true,
    cacheTTL: 7200, // 2 hours
  },
  progress: {
    enabled: true,
    priority: 6,
    timeout: 20000, // 20 seconds
    retryAttempts: 2,
    cacheEnabled: true,
    cacheTTL: 1800, // 30 minutes
  },
  note: {
    enabled: true,
    priority: 4, // Lower priority than other pipelines
    timeout: 35000, // 35 seconds (note generation can take longer)
    retryAttempts: 2,
    cacheEnabled: true,
    cacheTTL: 1800, // 30 minutes
  },
  globalTimeout: 45000, // 45 seconds for all pipelines
  parallelExecution: true,
  progressiveLoading: true,
};

export const DEFAULT_HIGHLIGHT_CONFIG: HighlightConfig = {
  safety: {
    critical: { color: '#ef4444', opacity: 0.3 }, // red-500
    high: { color: '#f97316', opacity: 0.25 }, // orange-500
    medium: { color: '#eab308', opacity: 0.2 }, // yellow-500
    low: { color: '#84cc16', opacity: 0.15 }, // lime-500
  },
  billing: {
    primary: { color: '#22c55e', opacity: 0.25 }, // green-500
    secondary: { color: '#10b981', opacity: 0.2 }, // emerald-500
    suggested: { color: '#06b6d4', opacity: 0.15 }, // cyan-500
  },
  progress: {
    achieved: { color: '#3b82f6', opacity: 0.25 }, // blue-500
    in_progress: { color: '#8b5cf6', opacity: 0.2 }, // violet-500
    barriers: { color: '#ec4899', opacity: 0.15 }, // pink-500
  },
};
