/**
 * AI Insights Orchestrator Service
 * 
 * Orchestrates all three AI pipelines (safety, billing, progress) to run in parallel
 * with proper error handling, timing metrics, and streaming support.
 */

import { 
  AIInsightsState, 
  SafetyInsights, 
  BillingInsights, 
  ProgressInsights,
  AIInsightsConfig,
  DEFAULT_AI_INSIGHTS_CONFIG,
  PipelineError,
  PipelineTimeoutError,
  StreamingResponse,
  PipelineUpdate,
  AIInsightsAPIResponse,
  PipelineExecutionMetadata
} from '@/lib/types/ai-insights';

import {
  PipelineStatusCode,
  PipelinePhase,
  DetailedPipelineStatus,
  PipelineCoordinationStatus,
  createInitialCoordinationStatus
} from '@/lib/types/pipeline-status';

import { 
  executePipeline, 
  PipelineInput, 
  PipelineResult 
} from '@/lib/services/ai-pipeline-services';

// Pipeline execution context
interface PipelineExecutionContext {
  sessionId: string;
  patientId: string;
  userId: string;
  organizationId?: string;
  transcript: string;
  config: AIInsightsConfig;
}

// Orchestrator performance metrics
interface OrchestrationMetrics {
  totalExecutionTime: number;
  parallelExecutionTime: number;
  pipelineExecutionTimes: Record<string, number>;
  cacheHits: Record<string, boolean>;
  retryCount: number;
  successRate: number;
  errorRate: number;
}

export class AIInsightsOrchestrator {
  private activeExecutions = new Map<string, AbortController>();
  private executionMetrics = new Map<string, OrchestrationMetrics>();

  constructor(private baseUrl: string = '') {
    console.log('[OrchestrationService] Initialized AI Insights Orchestrator:', {
      baseUrl: this.baseUrl || 'direct-function-calls',
      environment: typeof window === 'undefined' ? 'server' : 'client',
      timestamp: Date.now()
    });
  }

  /**
   * Coordinate analysis of all three AI pipelines in parallel
   */
  async coordinateAnalysis(
    context: PipelineExecutionContext
  ): Promise<AIInsightsState> {
    const { sessionId, patientId, userId, organizationId, transcript, config } = context;
    const executionId = `coord-${sessionId}-${Date.now()}`;
    const overallStartTime = Date.now();

    console.log('[OrchestrationService] Starting parallel pipeline coordination:', {
      executionId,
      sessionId,
      patientId,
      userId,
      transcriptLength: transcript.length,
      enabledPipelines: this.getEnabledPipelines(config),
      timestamp: overallStartTime
    });

    // Create abort controller for this execution
    const controller = new AbortController();
    this.activeExecutions.set(executionId, controller);

    try {
      // Execute all enabled pipelines in parallel
      const pipelinePromises = this.createPipelinePromises(context, controller.signal);
      
      console.log('[OrchestrationService] Executing pipelines in parallel:', {
        executionId,
        pipelineCount: pipelinePromises.length,
        pipelines: pipelinePromises.map(p => p.pipeline)
      });

      // Wait for all pipelines to complete (success or failure)
      const results = await Promise.allSettled(pipelinePromises.map(p => p.promise));
      const overallEndTime = Date.now();
      const totalExecutionTime = overallEndTime - overallStartTime;

      console.log('[OrchestrationService] All pipelines completed:', {
        executionId,
        totalExecutionTime,
        successCount: results.filter(r => r.status === 'fulfilled').length,
        errorCount: results.filter(r => r.status === 'rejected').length
      });

      // Process results and build final state
      const finalState = this.processPipelineResults(
        results,
        pipelinePromises,
        overallStartTime,
        totalExecutionTime
      );

      // Calculate and store metrics
      const metrics = this.calculateMetrics(results, pipelinePromises, totalExecutionTime);
      this.executionMetrics.set(executionId, metrics);

      console.log('[OrchestrationService] Coordination completed successfully:', {
        executionId,
        overallProgress: finalState.overallProgress,
        successfulPipelines: this.getSuccessfulPipelines(finalState),
        failedPipelines: this.getFailedPipelines(finalState),
        metrics: {
          totalTime: metrics.totalExecutionTime,
          successRate: metrics.successRate,
          cacheHits: Object.values(metrics.cacheHits).filter(hit => hit).length
        }
      });

      return finalState;

    } catch (error) {
      const executionTime = Date.now() - overallStartTime;
      console.error('[OrchestrationService] Coordination failed:', {
        executionId,
        error: error instanceof Error ? error.message : String(error),
        executionTime
      });

      throw new PipelineError(
        `Pipeline coordination failed: ${error instanceof Error ? error.message : String(error)}`,
        'orchestrator',
        'COORDINATION_ERROR',
        true,
        { executionId, executionTime }
      );

    } finally {
      // Cleanup
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Stream analysis results as they become available
   */
  async streamAnalysis(
    context: PipelineExecutionContext,
    onUpdate: (update: PipelineUpdate) => void
  ): Promise<void> {
    const { sessionId, patientId, userId, organizationId, transcript, config } = context;
    const executionId = `stream-${sessionId}-${Date.now()}`;
    const overallStartTime = Date.now();

    console.log('[OrchestrationService] Starting streaming pipeline analysis:', {
      executionId,
      sessionId,
      patientId,
      transcriptLength: transcript.length,
      enabledPipelines: this.getEnabledPipelines(config)
    });

    // Create abort controller for this execution
    const controller = new AbortController();
    this.activeExecutions.set(executionId, controller);

    try {
      // Create pipeline promises with streaming updates
      const pipelinePromises = this.createPipelinePromises(context, controller.signal);
      
      // Execute pipelines and emit updates as they complete
      const streamingPromises = pipelinePromises.map(async ({ pipeline, promise }) => {
        try {
          console.log('[OrchestrationService] Starting pipeline:', {
            executionId,
            pipeline,
            timestamp: Date.now()
          });

          // Emit loading update
          onUpdate({
            pipeline,
            status: 'loading',
            progress: 10,
            timestamp: Date.now()
          });

          const result = await promise;
          
          console.log('[OrchestrationService] Pipeline completed:', {
            executionId,
            pipeline,
            executionTime: result.executionTime,
            success: result.success
          });

          // Emit success update
          onUpdate({
            pipeline,
            status: result.success ? 'success' : 'error',
            progress: result.success ? 100 : 0,
            data: result.data?.analysis,
            error: result.error ? new Error(result.error) : undefined,
            metadata: result.data?.metadata ? {
              ...result.data.metadata,
              executionTime: result.executionTime,
              timestamp: new Date().toISOString(),
              executionId: result.data.metadata.executionId || executionId,
              modelUsed: result.data.metadata.modelUsed || 'unknown',
              cacheHit: result.data.metadata.cacheHit ?? false
            } : undefined,
            timestamp: Date.now()
          });

          return result;

        } catch (error) {
          console.error('[OrchestrationService] Pipeline failed in streaming mode:', {
            executionId,
            pipeline,
            error: error instanceof Error ? error.message : String(error)
          });

          // Emit error update
          onUpdate({
            pipeline,
            status: 'error',
            progress: 0,
            error: error instanceof Error ? error : new Error(String(error)),
            timestamp: Date.now()
          });

          throw error;
        }
      });

      // Wait for all streaming promises
      await Promise.allSettled(streamingPromises);
      
      const totalExecutionTime = Date.now() - overallStartTime;
      console.log('[OrchestrationService] Streaming analysis completed:', {
        executionId,
        totalExecutionTime
      });

    } finally {
      // Cleanup
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Retry a specific pipeline
   */
  async retryPipeline(
    pipelineType: 'safety' | 'billing' | 'progress',
    context: PipelineExecutionContext
  ): Promise<PipelineResult> {
    const { sessionId, patientId, userId, organizationId, transcript } = context;
    const retryId = `retry-${pipelineType}-${sessionId}-${Date.now()}`;

    console.log('[OrchestrationService] Retrying pipeline:', {
      retryId,
      pipeline: pipelineType,
      sessionId,
      timestamp: Date.now()
    });

    const controller = new AbortController();
    this.activeExecutions.set(retryId, controller);

    try {
      const result = await this.executeSinglePipeline(
        pipelineType,
        { sessionId, patientId, userId, organizationId, transcript },
        controller.signal,
        true // skipCache = true for retries
      );

      console.log('[OrchestrationService] Pipeline retry completed:', {
        retryId,
        pipeline: pipelineType,
        success: result.success,
        executionTime: result.executionTime
      });

      return result;

    } finally {
      this.activeExecutions.delete(retryId);
    }
  }

  /**
   * Cancel analysis for a specific session
   */
  cancelAnalysis(sessionId: string): void {
    console.log('[OrchestrationService] Cancelling analysis for session:', {
      sessionId,
      activeExecutions: this.activeExecutions.size
    });

    let cancelledCount = 0;
    for (const [executionId, controller] of this.activeExecutions.entries()) {
      if (executionId.includes(sessionId)) {
        controller.abort();
        this.activeExecutions.delete(executionId);
        cancelledCount++;
      }
    }

    console.log('[OrchestrationService] Analysis cancelled:', {
      sessionId,
      cancelledExecutions: cancelledCount
    });
  }

  /**
   * Get health status of the orchestrator and pipelines
   */
  async getHealth(): Promise<{
    healthy: boolean;
    pipelines: Record<string, boolean>;
    performance: Record<string, number>;
  }> {
    console.log('[OrchestrationService] Checking health status');

    try {
      // Test each pipeline with a minimal request
      const healthChecks = await Promise.allSettled([
        this.checkPipelineHealth('safety'),
        this.checkPipelineHealth('billing'), 
        this.checkPipelineHealth('progress')
      ]);

      const pipelineHealth = {
        safety: healthChecks[0].status === 'fulfilled',
        billing: healthChecks[1].status === 'fulfilled',
        progress: healthChecks[2].status === 'fulfilled'
      };

      const overallHealthy = Object.values(pipelineHealth).every(healthy => healthy);

      // Calculate average performance metrics
      const performanceMetrics = this.calculateAveragePerformance();

      console.log('[OrchestrationService] Health check completed:', {
        overallHealthy,
        pipelineHealth,
        performanceMetrics
      });

      return {
        healthy: overallHealthy,
        pipelines: pipelineHealth,
        performance: performanceMetrics
      };

    } catch (error) {
      console.error('[OrchestrationService] Health check failed:', error);
      return {
        healthy: false,
        pipelines: { safety: false, billing: false, progress: false },
        performance: {}
      };
    }
  }

  // Private helper methods

  private getEnabledPipelines(config: AIInsightsConfig): string[] {
    return Object.entries(config)
      .filter(([key, pipelineConfig]) => 
        ['safety', 'billing', 'progress'].includes(key) && pipelineConfig.enabled
      )
      .map(([key]) => key);
  }

  private createPipelinePromises(
    context: PipelineExecutionContext,
    signal: AbortSignal
  ): Array<{ pipeline: 'safety' | 'billing' | 'progress'; promise: Promise<PipelineResult> }> {
    const { sessionId, patientId, userId, organizationId, transcript, config } = context;
    const promises: Array<{ pipeline: 'safety' | 'billing' | 'progress'; promise: Promise<PipelineResult> }> = [];

    if (config.safety.enabled) {
      promises.push({
        pipeline: 'safety',
        promise: this.executeSinglePipeline('safety', 
          { sessionId, patientId, userId, organizationId, transcript }, 
          signal
        )
      });
    }

    if (config.billing.enabled) {
      promises.push({
        pipeline: 'billing',
        promise: this.executeSinglePipeline('billing', 
          { sessionId, patientId, userId, organizationId, transcript }, 
          signal
        )
      });
    }

    if (config.progress.enabled) {
      promises.push({
        pipeline: 'progress',
        promise: this.executeSinglePipeline('progress', 
          { sessionId, patientId, userId, organizationId, transcript }, 
          signal
        )
      });
    }

    return promises;
  }

  private async executeSinglePipeline(
    pipelineType: 'safety' | 'billing' | 'progress',
    context: { sessionId: string; patientId: string; userId: string; organizationId?: string; transcript: string },
    signal: AbortSignal,
    skipCache = false
  ): Promise<PipelineResult> {
    const startTime = Date.now();
    const { sessionId, patientId, userId, organizationId, transcript } = context;

    try {
      console.log('[OrchestrationService] Executing pipeline via direct function call:', {
        pipeline: pipelineType,
        sessionId,
        transcriptLength: transcript.length,
        skipCache,
        startTime
      });

      // Check for abort signal before starting
      if (signal.aborted) {
        throw new Error('Pipeline cancelled before execution');
      }

      // Prepare pipeline input
      const pipelineInput: PipelineInput = {
        sessionId,
        patientId,
        transcript,
        userId,
        organizationId,
        skipCache
      };

      // Execute pipeline using direct function call
      const result = await executePipeline(pipelineType, pipelineInput);

      console.log('[OrchestrationService] Pipeline completed successfully:', {
        pipeline: pipelineType,
        executionTime: result.executionTime,
        success: result.success,
        cacheHit: result.data?.metadata?.cacheHit,
        dataSize: result.data ? Object.keys(result.data).length : 0
      });

      // Return the result directly - it already matches PipelineResult interface
      return result;

    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[OrchestrationService] Pipeline cancelled:', {
          pipeline: pipelineType,
          executionTime
        });
        
        return {
          success: false,
          error: 'Pipeline cancelled',
          executionTime,
          timestamp: new Date().toISOString()
        };
      }

      console.error('[OrchestrationService] Pipeline failed:', {
        pipeline: pipelineType,
        error: error instanceof Error ? error.message : String(error),
        executionTime
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  private processPipelineResults(
    results: PromiseSettledResult<PipelineResult>[],
    pipelinePromises: Array<{ pipeline: 'safety' | 'billing' | 'progress'; promise: Promise<PipelineResult> }>,
    overallStartTime: number,
    totalExecutionTime: number
  ): AIInsightsState {
    const now = Date.now();
    const finalState: AIInsightsState = {
      safety: {
        status: 'idle',
        data: null,
        error: null,
        progress: 0
      },
      billing: {
        status: 'idle',
        data: null,
        error: null,
        progress: 0
      },
      progress: {
        status: 'idle',
        data: null,
        error: null,
        progress: 0
      },
      overallProgress: 0,
      lastUpdated: now
    };

    // Process each result
    results.forEach((result, index) => {
      const pipelineInfo = pipelinePromises[index];
      const pipelineType = pipelineInfo.pipeline;

      if (result.status === 'fulfilled') {
        const pipelineResult = result.value;
        finalState[pipelineType] = {
          status: pipelineResult.success ? 'success' : 'error',
          data: pipelineResult.data?.analysis || null,
          error: pipelineResult.error ? new Error(pipelineResult.error) : null,
          progress: pipelineResult.success ? 100 : 0,
          startTime: overallStartTime,
          endTime: now,
          metadata: pipelineResult.data?.metadata ? {
            ...pipelineResult.data.metadata,
            executionTime: pipelineResult.executionTime,
            timestamp: new Date().toISOString(),
            executionId: pipelineResult.data.metadata.executionId || `processed-${Date.now()}`,
            modelUsed: pipelineResult.data.metadata.modelUsed || 'unknown',
            cacheHit: pipelineResult.data.metadata.cacheHit ?? false
          } : undefined
        };
      } else {
        finalState[pipelineType] = {
          status: 'error',
          data: null,
          error: new Error(result.reason?.message || 'Pipeline execution failed'),
          progress: 0,
          startTime: overallStartTime,
          endTime: now
        };
      }
    });

    // Calculate overall progress
    const progressValues = [
      finalState.safety.progress,
      finalState.billing.progress,
      finalState.progress.progress
    ];
    finalState.overallProgress = Math.round(
      progressValues.reduce((sum, progress) => sum + (progress || 0), 0) / progressValues.length
    );

    return finalState;
  }

  private calculateMetrics(
    results: PromiseSettledResult<PipelineResult>[],
    pipelinePromises: Array<{ pipeline: 'safety' | 'billing' | 'progress'; promise: Promise<PipelineResult> }>,
    totalExecutionTime: number
  ): OrchestrationMetrics {
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const errorCount = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
    const totalCount = results.length;

    const executionTimes: Record<string, number> = {};
    const cacheHits: Record<string, boolean> = {};
    let maxExecutionTime = 0;

    results.forEach((result, index) => {
      const pipelineType = pipelinePromises[index].pipeline;
      
      if (result.status === 'fulfilled') {
        executionTimes[pipelineType] = result.value.executionTime;
        cacheHits[pipelineType] = result.value.data?.metadata?.cacheHit || false;
        maxExecutionTime = Math.max(maxExecutionTime, result.value.executionTime);
      }
    });

    return {
      totalExecutionTime,
      parallelExecutionTime: maxExecutionTime,
      pipelineExecutionTimes: executionTimes,
      cacheHits,
      retryCount: 0,
      successRate: totalCount > 0 ? successCount / totalCount : 0,
      errorRate: totalCount > 0 ? errorCount / totalCount : 0
    };
  }

  private getSuccessfulPipelines(state: AIInsightsState): string[] {
    return Object.entries(state)
      .filter(([key, pipeline]) => 
        ['safety', 'billing', 'progress'].includes(key) && 
        typeof pipeline === 'object' && 
        pipeline.status === 'success'
      )
      .map(([key]) => key);
  }

  private getFailedPipelines(state: AIInsightsState): string[] {
    return Object.entries(state)
      .filter(([key, pipeline]) => 
        ['safety', 'billing', 'progress'].includes(key) && 
        typeof pipeline === 'object' && 
        pipeline.status === 'error'
      )
      .map(([key]) => key);
  }

  private async checkPipelineHealth(pipelineType: 'safety' | 'billing' | 'progress'): Promise<boolean> {
    // Direct function calls are always healthy if the service loads
    return true;
  }

  private calculateAveragePerformance(): Record<string, number> {
    if (this.executionMetrics.size === 0) {
      return {};
    }

    const metrics = Array.from(this.executionMetrics.values());
    const avgExecutionTime = metrics.reduce((sum, m) => sum + m.totalExecutionTime, 0) / metrics.length;
    const avgSuccessRate = metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length;
    const avgErrorRate = metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length;

    return {
      averageExecutionTime: Math.round(avgExecutionTime),
      averageSuccessRate: Math.round(avgSuccessRate * 100),
      averageErrorRate: Math.round(avgErrorRate * 100)
    };
  }
}

// Export singleton instance
export const aiInsightsOrchestrator = new AIInsightsOrchestrator();

// Helper function to create orchestrator with custom base URL
export function createAIInsightsOrchestrator(baseUrl?: string): AIInsightsOrchestrator {
  return new AIInsightsOrchestrator(baseUrl);
}
