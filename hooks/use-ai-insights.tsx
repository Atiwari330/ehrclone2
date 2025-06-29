'use client';

/**
 * AI Insights State Management Hook
 * 
 * Custom hook for managing AI insights state with progressive loading,
 * error handling, and retry logic for all three AI pipelines
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AIInsightsState, 
  PipelineState, 
  SafetyInsights, 
  BillingInsights, 
  ProgressInsights,
  NoteGenerationInsights,
  AIInsightsConfig,
  DEFAULT_AI_INSIGHTS_CONFIG,
  PipelineUpdate,
  PipelineError,
  PipelineTimeoutError,
  PIPELINES,
  PipelineKey
} from '@/lib/types/ai-insights';
import { 
  PipelineStatusCode, 
  PipelinePhase,
  pipelineStatusManager,
  createInitialCoordinationStatus,
  calculateOverallProgress
} from '@/lib/types/pipeline-status';

// Transform API response to match expected TypeScript structure
function transformApiResponseToInsights(pipeline: PipelineKey, apiData: any): any {
  if (!apiData) return null;

  switch (pipeline) {
    case 'safety':
      return {
        riskAssessment: apiData.riskAssessment || {
          overallRisk: apiData.riskIndicators?.severity || 'low',
          riskScore: apiData.riskIndicators?.score || 0,
          riskFactors: apiData.riskIndicators?.factors || [],
          protectiveFactors: apiData.protectiveFactors || []
        },
        alerts: apiData.alerts || [],
        recommendations: apiData.recommendations || {
          immediate: [],
          shortTerm: [],
          longTerm: []
        },
        confidence: apiData.confidence?.score || apiData.confidence || 0
      };

    case 'billing':
      // Transform flat API response to nested structure expected by SmartActionsEngine
      return {
        cptCodes: apiData.cptCodes || [],
        icd10Codes: apiData.icd10Codes || [],
        sessionType: apiData.sessionInfo || {
          detected: apiData.sessionType || 'Unknown',
          confidence: apiData.confidence?.score || 0,
          duration: apiData.duration || 0
        },
        billingOptimization: {
          suggestedAdjustments: apiData.suggestedAdjustments || [],
          complianceIssues: apiData.compliance?.issues || [],
          revenueOpportunities: apiData.revenueOpportunities || []
        },
        confidence: apiData.confidence?.score || apiData.confidence || 0
      };

    case 'progress':
      return {
        goalProgress: apiData.goalProgress || [],
        overallTreatmentEffectiveness: apiData.effectiveness || {
          rating: apiData.effectiveness?.overallEffectiveness || 5,
          trends: apiData.progressIndicators?.trend || 'stable',
          keyIndicators: apiData.progressIndicators?.keyIndicators || []
        },
        recommendations: {
          treatmentAdjustments: apiData.treatmentAdjustments || apiData.recommendations?.treatmentAdjustments || [],
          newGoals: apiData.recommendations?.newGoals || [],
          interventions: apiData.recommendations?.interventions || []
        },
        sessionQuality: apiData.clinicalOutcomes || {
          engagement: apiData.clinicalOutcomes?.patientEngagement || 5,
          therapeuticRapport: apiData.clinicalOutcomes?.therapeuticAlliance || 5,
          progressTowardGoals: apiData.clinicalOutcomes?.progressMade || 5
        },
        confidence: apiData.confidence?.score || apiData.confidence || 0
      };

    case 'note':
      return {
        sections: apiData.sections || [],
        confidence: apiData.confidence?.score || apiData.confidence || 0
      };

    default:
      return apiData;
  }
}

// Hook options interface
export interface UseAIInsightsOptions {
  sessionId: string;
  patientId: string;
  transcript: string;
  userId?: string;
  autoStart?: boolean;
  config?: Partial<AIInsightsConfig>;
  onInsightUpdate?: (pipeline: PipelineKey, data: any) => void;
  onError?: (pipeline: PipelineKey, error: Error) => void;
  onComplete?: (insights: AIInsightsState) => void;
}

// Hook return interface
export interface AIInsightsHookResult {
  // State
  insights: AIInsightsState;
  isLoading: boolean;
  hasErrors: boolean;
  overallProgress: number;
  
  // Individual pipeline states
  safetyState: PipelineState<SafetyInsights>;
  billingState: PipelineState<BillingInsights>;
  progressState: PipelineState<ProgressInsights>;
  noteState: PipelineState<NoteGenerationInsights>;
  
  // Actions
  startAnalysis: () => void;
  retryPipeline: (pipeline: PipelineKey) => void;
  retryAll: () => void;
  cancelAnalysis: () => void;
  
  // Utilities
  getCompletedPipelines: () => string[];
  getFailedPipelines: () => string[];
  getEstimatedCompletion: () => number | null;
  isComplete: boolean;
  
  // Performance metrics
  performance: {
    executionTimes: Record<string, number>;
    cacheHits: Record<string, boolean>;
    retryCount: number;
  };
}

// Internal state for tracking active requests
interface ActiveRequest {
  controller: AbortController;
  startTime: number;
  pipeline: PipelineKey;
  retryAttempt: number;
}

export function useAIInsights(options: UseAIInsightsOptions): AIInsightsHookResult {
  const {
    sessionId,
    patientId,
    transcript,
    userId,
    autoStart = false,
    config = {},
    onInsightUpdate,
    onError,
    onComplete
  } = options;

  // Merge config with defaults
  const finalConfig = { ...DEFAULT_AI_INSIGHTS_CONFIG, ...config };
  
  // Core state
  const [insights, setInsights] = useState<AIInsightsState>(() => {
    const now = Date.now();
    return {
      safety: {
        status: 'idle' as const,
        data: null,
        error: null,
        progress: 0,
        startTime: undefined,
        endTime: undefined,
        metadata: undefined
      },
      billing: {
        status: 'idle' as const,
        data: null,
        error: null,
        progress: 0,
        startTime: undefined,
        endTime: undefined,
        metadata: undefined
      },
      progress: {
        status: 'idle' as const,
        data: null,
        error: null,
        progress: 0,
        startTime: undefined,
        endTime: undefined,
        metadata: undefined
      },
      note: {
        status: 'idle' as const,
        data: null,
        error: null,
        progress: 0,
        startTime: undefined,
        endTime: undefined,
        metadata: undefined
      },
      overallProgress: 0,
      lastUpdated: now
    };
  });

  // Performance tracking
  const [performance, setPerformance] = useState({
    executionTimes: {} as Record<string, number>,
    cacheHits: {} as Record<string, boolean>,
    retryCount: 0
  });

  // Track active requests for cancellation
  const activeRequests = useRef(new Map<string, ActiveRequest>());
  const analysisStartTime = useRef<number | null>(null);
  const hasAutoStarted = useRef(false);

  // Update individual pipeline state - FIXED: removed sessionId dependency to prevent infinite loops
  const updatePipelineState = useCallback((
    pipeline: PipelineKey,
    updates: Partial<PipelineState>
  ) => {
    setInsights(prev => {
      const prevPipelineState = prev[pipeline] as PipelineState;
      const oldStatus = prevPipelineState.status;
      const newState = {
        ...prev,
        [pipeline]: {
          ...prevPipelineState,
          ...updates
        },
        lastUpdated: Date.now()
      };

      // Calculate overall progress from pipeline states using centralized PIPELINES config
      const progressValues = PIPELINES.map(pipeline => 
        (newState[pipeline] as PipelineState).progress || 0
      );
      newState.overallProgress = Math.round(
        progressValues.reduce((sum, progress) => sum + progress, 0) / PIPELINES.length
      );

      // Log state transition (moved inline to avoid dependency issues)
      if (updates.status && updates.status !== oldStatus) {
        console.log('[AIInsights] State transition:', {
          sessionId: options.sessionId,
          pipeline,
          from: oldStatus,
          to: updates.status,
          timestamp: Date.now(),
          progress: newState[pipeline].progress,
          hasData: !!updates.data,
          overallProgress: newState.overallProgress
        });
      }

      // Progress logging
      if (updates.progress !== undefined && updates.progress !== prevPipelineState.progress) {
        console.log('[AIInsights] Progress update:', {
          sessionId: options.sessionId,
          pipeline,
          progress: updates.progress,
          overallProgress: newState.overallProgress,
          timestamp: Date.now()
        });
      }

      return newState;
    });
  }, []); // Remove sessionId dependency to prevent infinite loops

  // Execute individual pipeline
  const executePipeline = useCallback(async (
    pipelineType: PipelineKey,
    retryAttempt = 0
  ): Promise<void> => {
    const requestId = `${pipelineType}-${Date.now()}`;
    const controller = new AbortController();
    const startTime = Date.now();

    // Store active request
    activeRequests.current.set(requestId, {
      controller,
      startTime,
      pipeline: pipelineType,
      retryAttempt
    });

      console.log('[AIInsights] Starting pipeline execution:', {
        sessionId,
        pipeline: pipelineType,
        retryAttempt,
        requestId,
        transcriptLength: transcript.length,
        timestamp: startTime
      });

      // Determine API endpoint
      const endpoint = `/api/pipelines/${
        pipelineType === 'progress' ? 'progress' : 
        pipelineType === 'billing' ? 'billing' : 
        pipelineType === 'safety' ? 'safety-check' :
        pipelineType === 'note' ? 'note-generation' : 'safety-check'
      }`;

      // Network request tracking - Before API call
      console.log('[AIInsights] NETWORK REQUEST START:', {
        sessionId,
        pipeline: pipelineType,
        endpoint,
        requestId,
        retryAttempt,
        timestamp: startTime
      });

    try {
      // Update to loading state
      updatePipelineState(pipelineType, {
        status: 'loading',
        progress: 10,
        startTime,
        error: null
      });

      // Make API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          patientId,
          transcript,
          userId: userId || 'current-user', // Use provided userId or fallback
          skipCache: retryAttempt > 0 // Skip cache on retries
        }),
        signal: controller.signal
      });

      // Update progress
      updatePipelineState(pipelineType, { progress: 60 });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new PipelineError(
          errorData.error || `HTTP ${response.status}`,
          pipelineType,
          'API_ERROR',
          response.status >= 500 // Server errors are retryable
        );
      }

      const result = await response.json();
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Update progress
      updatePipelineState(pipelineType, { progress: 90 });

      // Enhanced logging to diagnose data structure
      console.log('[AIInsights] Pipeline API response structure:', {
        sessionId,
        pipeline: pipelineType,
        hasResult: !!result,
        hasData: !!result.data,
        hasAnalysis: !!result.data?.analysis,
        dataKeys: result.data ? Object.keys(result.data) : [],
        analysisKeys: result.data?.analysis ? Object.keys(result.data.analysis) : [],
        requestId
      });

      console.log('[AIInsights] Pipeline completed successfully:', {
        sessionId,
        pipeline: pipelineType,
        executionTime,
        confidence: result.data?.analysis?.confidence,
        cacheHit: result.data?.metadata?.cacheHit,
        tokenUsage: result.data?.metadata?.tokenUsage,
        requestId
      });

      // Update performance metrics
      setPerformance(prev => ({
        ...prev,
        executionTimes: {
          ...prev.executionTimes,
          [pipelineType]: executionTime
        },
        cacheHits: {
          ...prev.cacheHits,
          [pipelineType]: result.data?.metadata?.cacheHit || false
        }
      }));

      // Complete pipeline - handle both nested and non-nested response structures
      const analysisData = result.data?.analysis || result.data;
      
      // Transform API response to match expected TypeScript structure
      const transformedData = transformApiResponseToInsights(pipelineType, analysisData);
      
      updatePipelineState(pipelineType, {
        status: 'success',
        progress: 100,
        data: transformedData,
        endTime,
        metadata: result.data?.metadata
      });

      // Call update callback
      if (onInsightUpdate) {
        onInsightUpdate(pipelineType, result.data?.analysis);
      }

    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Handle abort
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[AIInsights] Pipeline cancelled:', {
          sessionId,
          pipeline: pipelineType,
          requestId,
          executionTime
        });
        
        updatePipelineState(pipelineType, {
          status: 'error',
          error: new Error('Analysis cancelled'),
          endTime
        });
        return;
      }

      console.error('[AIInsights] Pipeline failed:', {
        sessionId,
        pipeline: pipelineType,
        error: error instanceof Error ? error.message : String(error),
        retryAttempt,
        executionTime,
        requestId
      });

      const pipelineError = error instanceof PipelineError ? 
        error : 
        new PipelineError(
          error instanceof Error ? error.message : String(error),
          pipelineType,
          'UNKNOWN_ERROR'
        );

      // Check if we should retry
      const pipelineConfig = finalConfig[pipelineType];
      const maxRetries = pipelineConfig.retryAttempts;
      const shouldRetry = pipelineError.retryable && retryAttempt < maxRetries;

      if (shouldRetry) {
        console.log('[AIInsights] Scheduling retry:', {
          sessionId,
          pipeline: pipelineType,
          retryAttempt: retryAttempt + 1,
          maxRetries,
          delay: 1000 * Math.pow(2, retryAttempt) // Exponential backoff
        });

        updatePipelineState(pipelineType, {
          status: 'retrying',
          error: pipelineError,
          endTime
        });

        // Update retry count
        setPerformance(prev => ({
          ...prev,
          retryCount: prev.retryCount + 1
        }));

        // Schedule retry with exponential backoff
        setTimeout(() => {
          executePipeline(pipelineType, retryAttempt + 1);
        }, 1000 * Math.pow(2, retryAttempt));

      } else {
        // Final failure
        updatePipelineState(pipelineType, {
          status: 'error',
          error: pipelineError,
          endTime
        });

        // Call error callback
        if (onError) {
          onError(pipelineType, pipelineError);
        }
      }
    } finally {
      // Clean up active request
      activeRequests.current.delete(requestId);
    }
  }, [sessionId, patientId, transcript, userId, finalConfig, updatePipelineState, onInsightUpdate, onError]);

  // Start analysis of all pipelines
  const startAnalysis = useCallback(() => {
    console.log('[AIInsights] Starting parallel pipeline analysis:', {
      sessionId,
      patientId,
      transcriptLength: transcript.length,
      enabledPipelines: PIPELINES.filter(key => finalConfig[key].enabled),
      timestamp: Date.now()
    });

    analysisStartTime.current = Date.now();
    hasAutoStarted.current = true;

    // Start all enabled pipelines in parallel using centralized PIPELINES config
    PIPELINES.forEach(pipeline => {
      if (finalConfig[pipeline].enabled) {
        console.log('[AIInsights] Starting pipeline:', {
          sessionId,
          pipeline,
          enabled: finalConfig[pipeline].enabled,
          priority: finalConfig[pipeline].priority
        });
        executePipeline(pipeline, 0);
      }
    });
  }, [sessionId, patientId, transcript, finalConfig, executePipeline]);

  // Retry specific pipeline
  const retryPipeline = useCallback((pipeline: PipelineKey) => {
    const pipelineState = insights[pipeline] as PipelineState;
    console.log('[AIInsights] Manual retry requested:', {
      sessionId,
      pipeline,
      currentStatus: pipelineState.status,
      timestamp: Date.now()
    });

    executePipeline(pipeline, 0);
  }, [sessionId, insights, executePipeline]);

  // Retry all failed pipelines
  const retryAll = useCallback(() => {
    console.log('[AIInsights] Retry all requested:', {
      sessionId,
      currentStates: Object.fromEntries(
        PIPELINES.map(pipeline => [pipeline, insights[pipeline].status])
      ),
      timestamp: Date.now()
    });

    const failedPipelines = PIPELINES.filter(key => {
      const pipelineState = insights[key] as PipelineState;
      return pipelineState.status === 'error';
    });

    failedPipelines.forEach(pipeline => {
      executePipeline(pipeline, 0);
    });
  }, [sessionId, insights, executePipeline]);

  // Cancel analysis
  const cancelAnalysis = useCallback(() => {
    console.log('[AIInsights] Cancelling analysis:', {
      sessionId,
      activeRequests: activeRequests.current.size,
      timestamp: Date.now()
    });

    // Cancel all active requests
    activeRequests.current.forEach((request) => {
      request.controller.abort();
    });
    
    activeRequests.current.clear();
  }, [sessionId]);

  // Utility functions using centralized PIPELINES config
  const getCompletedPipelines = useCallback(() => {
    return PIPELINES.filter(key => {
      const pipelineState = insights[key] as PipelineState;
      return pipelineState.status === 'success';
    });
  }, [insights]);

  const getFailedPipelines = useCallback(() => {
    return PIPELINES.filter(key => {
      const pipelineState = insights[key] as PipelineState;
      return pipelineState.status === 'error';
    });
  }, [insights]);

  const getEstimatedCompletion = useCallback((): number | null => {
    if (!analysisStartTime.current) return null;

    const completedPipelines = getCompletedPipelines();
    const totalPipelines = PIPELINES.length;

    if (completedPipelines.length === 0) return null;

    const elapsed = Date.now() - analysisStartTime.current;
    const averageTimePerPipeline = elapsed / completedPipelines.length;
    const remainingPipelines = totalPipelines - completedPipelines.length;

    return remainingPipelines > 0 ? 
      Date.now() + (averageTimePerPipeline * remainingPipelines) : 
      null;
  }, [getCompletedPipelines]);

  // Auto-start if enabled - FIXED: Use ref to prevent infinite loops
  useEffect(() => {
    if (autoStart && transcript && sessionId && patientId && !hasAutoStarted.current) {
      console.log('[AIInsights] Auto-starting analysis:', {
        sessionId,
        transcriptLength: transcript.length
      });
      startAnalysis();
    }
  }, [autoStart, transcript, sessionId, patientId]); // Removed startAnalysis dependency

  // Check if analysis is complete using centralized PIPELINES config
  useEffect(() => {
    const completed = getCompletedPipelines();
    const failed = getFailedPipelines();
    const total = PIPELINES.length;

    if (completed.length + failed.length === total) {
      console.log('[AIInsights] Analysis complete:', {
        sessionId,
        completed: completed.length,
        failed: failed.length,
        totalPipelines: total,
        totalExecutionTime: analysisStartTime.current ? 
          Date.now() - analysisStartTime.current : null,
        performance
      });

      if (onComplete) {
        onComplete(insights);
      }
    }
  }, [insights, getCompletedPipelines, getFailedPipelines, onComplete, sessionId, performance]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[AIInsights] Cleaning up:', { sessionId });
      cancelAnalysis();
    };
  }, [sessionId, cancelAnalysis]);

  // Derived state using centralized PIPELINES config
  const isLoading = PIPELINES.some(pipeline => 
    ['loading', 'retrying'].includes((insights[pipeline] as PipelineState).status)
  );

  const hasErrors = PIPELINES.some(pipeline => 
    (insights[pipeline] as PipelineState).status === 'error'
  );

  const isComplete = PIPELINES.every(pipeline => 
    ['success', 'error'].includes((insights[pipeline] as PipelineState).status)
  );

  return {
    // State
    insights,
    isLoading,
    hasErrors,
    overallProgress: insights.overallProgress,
    
    // Individual pipeline states
    safetyState: insights.safety,
    billingState: insights.billing,
    progressState: insights.progress,
    noteState: insights.note,
    
    // Actions
    startAnalysis,
    retryPipeline,
    retryAll,
    cancelAnalysis,
    
    // Utilities
    getCompletedPipelines,
    getFailedPipelines,
    getEstimatedCompletion,
    isComplete,
    
    // Performance metrics
    performance
  };
}

// Helper hook for transcript scroll integration
export function useAIInsightsWithScroll(
  options: UseAIInsightsOptions,
  scrollRef?: React.RefObject<HTMLDivElement>
) {
  const aiInsights = useAIInsights(options);
  
  // Scroll to relevant sections when insights are available
  useEffect(() => {
    if (!scrollRef?.current) return;

    const { safetyState, billingState, progressState } = aiInsights;
    
    // Scroll to safety alerts if high priority
    if (safetyState.status === 'success' && safetyState.data) {
      const highPriorityAlerts = safetyState.data.alerts.filter(
        alert => alert.severity === 'high' || alert.severity === 'critical'
      );
      
      if (highPriorityAlerts.length > 0) {
        console.log('[AIInsights] High priority safety alerts detected, considering scroll:', {
          alertCount: highPriorityAlerts.length,
          sessionId: options.sessionId
        });
        // Note: Actual scrolling logic would be implemented based on transcript highlighting
      }
    }
  }, [aiInsights.safetyState, aiInsights.billingState, aiInsights.progressState, scrollRef, options.sessionId]);

  return aiInsights;
}
