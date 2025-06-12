/**
 * AI Insights API Endpoint
 * 
 * Triggers all AI pipelines for comprehensive session analysis
 * Supports both immediate and progressive response modes
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiInsightsOrchestrator } from '@/lib/services/ai-insights-orchestrator';
import { 
  AIInsightsAPIResponse,
  AIInsightsConfig,
  DEFAULT_AI_INSIGHTS_CONFIG,
  PipelineError 
} from '@/lib/types/ai-insights';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const { id: sessionId } = await params;
  
  console.log('[API-AIInsights] Starting AI insights analysis:', {
    sessionId,
    timestamp: startTime,
    endpoint: '/api/sessions/[id]/ai-insights'
  });

  try {
    // Parse request body
    const body = await request.json();
    const { 
      patientId, 
      transcript, 
      userId, 
      organizationId,
      config = {},
      mode = 'immediate' // 'immediate' or 'progressive'
    } = body;

    // Validate required fields
    if (!sessionId) {
      console.error('[API-AIInsights] Missing sessionId from params');
      return NextResponse.json({
        success: false,
        error: 'Session ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    if (!patientId || !transcript || !userId) {
      console.error('[API-AIInsights] Missing required fields:', { 
        sessionId,
        patientId: !!patientId, 
        transcript: !!transcript, 
        userId: !!userId 
      });
      
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: patientId, transcript, and userId are required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    console.log('[API-AIInsights] Processing AI insights request:', {
      sessionId,
      patientId,
      userId,
      organizationId: organizationId || 'default-org',
      transcriptLength: transcript.length,
      mode,
      configOverrides: Object.keys(config).length > 0 ? Object.keys(config) : 'none'
    });

    // Merge configuration with defaults
    const finalConfig: AIInsightsConfig = {
      ...DEFAULT_AI_INSIGHTS_CONFIG,
      ...config
    } as AIInsightsConfig;

    // Log enabled pipelines
    const enabledPipelines = (['safety', 'billing', 'progress'] as const)
      .filter(key => finalConfig[key].enabled);

    console.log('[API-AIInsights] Pipeline configuration:', {
      sessionId,
      enabledPipelines,
      parallelExecution: finalConfig.parallelExecution,
      progressiveLoading: finalConfig.progressiveLoading,
      globalTimeout: finalConfig.globalTimeout
    });

    // Handle different response modes
    if (mode === 'progressive') {
      return handleProgressiveMode(request, {
        sessionId,
        patientId,
        userId,
        organizationId,
        transcript,
        config: finalConfig
      });
    }

    // Default: Immediate mode - wait for all pipelines to complete
    const context = {
      sessionId,
      patientId,
      userId,
      organizationId: organizationId || 'default-org',
      transcript,
      config: finalConfig
    };

    console.log('[API-AIInsights] Executing immediate mode analysis');
    const insights = await aiInsightsOrchestrator.coordinateAnalysis(context);
    
    const executionTime = Date.now() - startTime;
    
    // Calculate success metrics
    const successfulPipelines = Object.entries(insights)
      .filter(([key, state]) => 
        ['safety', 'billing', 'progress'].includes(key) && 
        typeof state === 'object' && 
        state.status === 'success'
      ).length;

    const totalEnabledPipelines = enabledPipelines.length;
    const cacheHits = Object.entries(insights)
      .filter(([key, state]) => 
        ['safety', 'billing', 'progress'].includes(key) && 
        typeof state === 'object' && 
        state.metadata?.cacheHit
      ).length;

    console.log('[API-AIInsights] Analysis completed successfully:', {
      sessionId,
      executionTime,
      overallProgress: insights.overallProgress,
      successfulPipelines,
      totalEnabledPipelines,
      cacheHits,
      failedPipelines: totalEnabledPipelines - successfulPipelines
    });

    const response: AIInsightsAPIResponse = {
      success: true,
      data: {
        sessionId,
        patientId,
        insights,
        executionTime,
        metadata: {
          pipelineCount: totalEnabledPipelines,
          cacheHits,
          retryCount: 0 // TODO: Track retries from orchestrator
        }
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    console.error('[API-AIInsights] Request failed:', {
      sessionId,
      error: error instanceof Error ? error.message : String(error),
      executionTime,
      errorType: error instanceof PipelineError ? 'PipelineError' : 'Unknown'
    });

    // Determine if error is retryable
    const isRetryable = error instanceof PipelineError ? error.retryable : true;
    
    const response: AIInsightsAPIResponse = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PipelineError ? error.code : 'UNKNOWN_ERROR',
        pipeline: error instanceof PipelineError ? error.pipeline : undefined,
        retryable: isRetryable
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { 
      status: error instanceof PipelineError && error.code === 'VALIDATION_ERROR' ? 400 : 500 
    });
  }
}

/**
 * Handle progressive mode with streaming responses
 * Note: This is a simplified implementation. Production would use Server-Sent Events or WebSockets
 */
async function handleProgressiveMode(
  request: NextRequest,
  context: {
    sessionId: string;
    patientId: string;
    userId: string;
    organizationId?: string;
    transcript: string;
    config: any;
  }
): Promise<NextResponse> {
  const { sessionId, patientId, userId, organizationId, transcript, config } = context;
  
  console.log('[API-AIInsights] Starting progressive mode analysis:', {
    sessionId,
    patientId,
    mode: 'progressive'
  });

  // In a real implementation, this would use streaming responses
  // For now, we'll return the coordination result with progressive metadata
  try {
    const orchestrationContext = {
      sessionId,
      patientId,
      userId,
      organizationId: organizationId || 'default-org',
      transcript,
      config
    };

    const insights = await aiInsightsOrchestrator.coordinateAnalysis(orchestrationContext);
    
    console.log('[API-AIInsights] Progressive mode completed:', {
      sessionId,
      overallProgress: insights.overallProgress
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        patientId,
        insights,
        mode: 'progressive',
        metadata: {
          streamingSupported: false, // TODO: Implement streaming
          progressiveUpdates: true
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[API-AIInsights] Progressive mode failed:', {
      sessionId,
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Progressive analysis failed',
        code: 'PROGRESSIVE_MODE_ERROR',
        retryable: true
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET endpoint for retrieving cached insights
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  
  console.log('[API-AIInsights] GET request for cached insights:', {
    sessionId,
    timestamp: Date.now()
  });

  try {
    // TODO: Implement cache retrieval from database
    // For now, return not implemented
    return NextResponse.json({
      success: false,
      error: {
        message: 'Cached insights retrieval not yet implemented',
        code: 'NOT_IMPLEMENTED',
        retryable: false
      },
      timestamp: new Date().toISOString()
    }, { status: 501 });

  } catch (error) {
    console.error('[API-AIInsights] GET request failed:', {
      sessionId,
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to retrieve cached insights',
        code: 'CACHE_RETRIEVAL_ERROR',
        retryable: true
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// PATCH endpoint for retrying specific pipelines
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const startTime = Date.now();
  
  console.log('[API-AIInsights] PATCH request for pipeline retry:', {
    sessionId,
    timestamp: startTime
  });

  try {
    const body = await request.json();
    const { 
      pipelineType, 
      patientId, 
      transcript, 
      userId, 
      organizationId,
      config = {}
    } = body;

    // Validate required fields
    if (!pipelineType || !patientId || !transcript || !userId) {
      console.error('[API-AIInsights] PATCH missing required fields:', { 
        sessionId,
        pipelineType: !!pipelineType,
        patientId: !!patientId, 
        transcript: !!transcript, 
        userId: !!userId 
      });
      
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: pipelineType, patientId, transcript, and userId are required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate pipeline type
    if (!['safety', 'billing', 'progress'].includes(pipelineType)) {
      console.error('[API-AIInsights] Invalid pipeline type:', { 
        sessionId,
        pipelineType 
      });
      
      return NextResponse.json({
        success: false,
        error: 'Invalid pipeline type. Must be one of: safety, billing, progress',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    console.log('[API-AIInsights] Retrying pipeline:', {
      sessionId,
      pipelineType,
      patientId,
      transcriptLength: transcript.length
    });

    // Merge configuration with defaults
    const finalConfig = {
      ...DEFAULT_AI_INSIGHTS_CONFIG,
      ...config
    };

    const context = {
      sessionId,
      patientId,
      userId,
      organizationId: organizationId || 'default-org',
      transcript,
      config: finalConfig
    };

      const result = await aiInsightsOrchestrator.retryPipeline(pipelineType, context);
      const executionTime = Date.now() - startTime;

      console.log('[API-AIInsights] Pipeline retry completed:', {
        sessionId,
        pipelineType,
        success: result.success,
        executionTime,
        cacheHit: result.data?.metadata?.cacheHit
      });

      return NextResponse.json({
        success: true,
        data: {
          sessionId,
          pipelineType,
          result: {
            success: result.success,
            data: result.data,
            error: result.error,
            executionTime: result.executionTime,
            metadata: result.data?.metadata
          },
          executionTime
        },
        timestamp: new Date().toISOString()
      });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    console.error('[API-AIInsights] PATCH request failed:', {
      sessionId,
      error: error instanceof Error ? error.message : String(error),
      executionTime
    });

    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Pipeline retry failed',
        code: error instanceof PipelineError ? error.code : 'RETRY_ERROR',
        retryable: true
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// DELETE endpoint for cancelling analysis
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  
  console.log('[API-AIInsights] DELETE request for analysis cancellation:', {
    sessionId,
    timestamp: Date.now()
  });

  try {
    aiInsightsOrchestrator.cancelAnalysis(sessionId);
    
    console.log('[API-AIInsights] Analysis cancelled successfully:', {
      sessionId
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        cancelled: true
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[API-AIInsights] DELETE request failed:', {
      sessionId,
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to cancel analysis',
        code: 'CANCELLATION_ERROR',
        retryable: true
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
