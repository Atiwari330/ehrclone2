/**
 * AI Pipeline Service Functions
 * 
 * Direct function implementations of AI pipelines for server-side orchestration.
 * These functions provide the same functionality as the API endpoints but without HTTP overhead.
 */

import { getDefaultAIService } from '@/lib/ai/factory';
import { createSafetyAlert, createAIPipelineExecution, updateAIPipelineExecution } from '@/lib/db/queries';

// Common pipeline input interface
export interface PipelineInput {
  sessionId: string;
  patientId: string;
  transcript: string;
  userId?: string;
  organizationId?: string;
  skipCache?: boolean;
  patientContext?: any;
  sessionType?: string;
  duration?: string;
  treatmentGoals?: string[];
}

// Common pipeline result interface
export interface PipelineResult<T = any> {
  success: boolean;
  data?: {
    sessionId: string;
    patientId: string;
    analysis: T;
    executionTime: number;
    metadata: {
      executionId?: string;
      modelUsed?: string;
      tokenUsage?: any;
      cacheHit?: boolean;
    };
  };
  error?: string;
  executionTime: number;
  timestamp: string;
}

/**
 * Safety Check Pipeline Function
 * 
 * Analyzes session transcripts for safety risks and generates alerts
 */
export async function executeSafetyCheckPipeline(input: PipelineInput): Promise<PipelineResult> {
  const startTime = Date.now();
  console.log('[Pipeline-Safety] Starting safety check analysis:', {
    sessionId: input.sessionId,
    patientId: input.patientId,
    transcriptLength: input.transcript.length
  });
  
  let pipelineExecution: any = null;
  
  try {
    // Validate required fields
    if (!input.sessionId || !input.patientId || !input.transcript) {
      throw new Error('Missing required fields: sessionId, patientId, and transcript are required');
    }
    
    // Create pipeline execution record
    console.log('[Pipeline-Safety] Creating pipeline execution record');
    pipelineExecution = await createAIPipelineExecution({
      pipelineType: 'safety_check',
      sessionId: input.sessionId,
      patientId: input.patientId,
      userId: input.userId || 'orchestrator',
      inputData: {
        transcript: input.transcript,
        transcriptLength: input.transcript.length,
        patientContext: input.patientContext || {
          demographics: { age: null, gender: null },
          medicalHistory: [],
          currentMedications: [],
          treatmentPlan: { goals: [] },
          recentSessions: [],
          assessmentHistory: []
        }
      },
      startTime: new Date()
    });
    
    console.log('[Pipeline-Safety] Pipeline execution created:', {
      executionId: pipelineExecution.id,
      pipelineType: 'safety_check'
    });
    
    // Get AI service instance
    const aiService = await getDefaultAIService();
    
    // Execute safety check analysis
    const result = await aiService.analyze('safety_check', {
      patientId: input.patientId,
      sessionId: input.sessionId,
      userId: input.userId || 'orchestrator',
      organizationId: input.organizationId || 'default-org',
      variables: {
        transcript: input.transcript,
        patientContext: input.patientContext || {
          demographics: { age: null, gender: null },
          medicalHistory: [],
          currentMedications: [],
          treatmentPlan: { goals: [] },
          recentSessions: [],
          assessmentHistory: []
        }
      },
      purpose: 'safety_check' as const,
      skipCache: input.skipCache || false,
      metadata: {
        orchestratorCall: true,
        directFunction: true
      }
    });
    
    const executionTime = Date.now() - startTime;
    
    if (result.success) {
      console.log('[Pipeline-Safety] Analysis completed successfully:', {
        executionTime,
        riskLevel: result.data?.riskAssessment?.overallRisk,
        alertCount: result.data?.alerts?.length || 0,
        confidence: result.data?.confidence
      });
      
      // Update pipeline execution with results
      await updateAIPipelineExecution({
        id: pipelineExecution.id,
        outputData: result.data,
        endTime: new Date(),
        durationMs: executionTime,
        totalTokens: result.metadata?.tokenUsage?.total,
        modelUsed: result.metadata?.modelUsed,
        status: 'completed',
        cacheHit: result.metadata?.cacheHit || false
      });
      
      console.log('[Pipeline-Safety] Pipeline execution updated with successful results');
      
      // Store high-risk alerts in database
      const highRiskAlerts = result.data?.alerts?.filter((alert: any) => 
        alert.severity === 'high' || alert.severity === 'critical'
      ) || [];
      
      if (highRiskAlerts.length > 0) {
        console.warn('[Pipeline-Safety] High-risk alerts detected:', {
          count: highRiskAlerts.length,
          alerts: highRiskAlerts.map((a: any) => ({ severity: a.severity, type: a.type }))
        });
        
        // Persist high-risk alerts to database
        for (const alert of highRiskAlerts) {
          try {
            const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            await createSafetyAlert({
              alertId,
              sessionId: input.sessionId,
              patientId: input.patientId,
              providerId: input.userId || 'orchestrator',
              pipelineExecutionId: pipelineExecution.id,
              severity: alert.severity,
              type: alert.category,
              description: alert.description || `${alert.category} risk detected: ${alert.title}`,
              suggestedActions: alert.recommendedActions || [],
              riskScore: undefined,
            });
            
            console.log('[Pipeline-Safety] Alert persisted successfully:', {
              alertId,
              category: alert.category,
              severity: alert.severity
            });
            
          } catch (dbError) {
            console.error('[Pipeline-Safety] Failed to persist alert:', {
              category: alert.category,
              severity: alert.severity,
              error: dbError instanceof Error ? dbError.message : 'Unknown database error'
            });
          }
        }
      }
      
      return {
        success: true,
        data: {
          sessionId: input.sessionId,
          patientId: input.patientId,
          analysis: result.data,
          executionTime,
          metadata: {
            executionId: result.metadata?.executionId,
            modelUsed: result.metadata?.modelUsed,
            tokenUsage: result.metadata?.tokenUsage,
            cacheHit: result.metadata?.cacheHit
          }
        },
        executionTime,
        timestamp: new Date().toISOString()
      };
      
    } else {
      console.error('[Pipeline-Safety] Analysis failed:', result.error);
      
      // Update pipeline execution with failure
      await updateAIPipelineExecution({
        id: pipelineExecution.id,
        endTime: new Date(),
        durationMs: executionTime,
        status: 'failed',
        errorMessage: result.error?.message || 'Safety check analysis failed'
      });
      
      return {
        success: false,
        error: result.error?.message || 'Safety check analysis failed',
        executionTime,
        timestamp: new Date().toISOString()
      };
    }
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[Pipeline-Safety] Function failed:', error);
    
    // Update pipeline execution with error if we have the execution record
    if (pipelineExecution?.id) {
      try {
        await updateAIPipelineExecution({
          id: pipelineExecution.id,
          endTime: new Date(),
          durationMs: executionTime,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      } catch (updateError) {
        console.error('[Pipeline-Safety] Failed to update pipeline execution with error:', updateError);
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      executionTime,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Billing Analysis Pipeline Function
 * 
 * Analyzes session data to suggest appropriate CPT codes and billing information
 */
export async function executeBillingPipeline(input: PipelineInput): Promise<PipelineResult> {
  const startTime = Date.now();
  console.log('[Pipeline-Billing] Starting billing analysis:', {
    sessionId: input.sessionId,
    patientId: input.patientId,
    sessionType: input.sessionType || 'unknown',
    duration: input.duration || 'unknown',
    transcriptLength: input.transcript.length
  });
  
  try {
    // Validate required fields
    if (!input.sessionId || !input.patientId || !input.transcript) {
      throw new Error('Missing required fields: sessionId, patientId, and transcript are required');
    }
    
    // Get AI service instance
    const aiService = await getDefaultAIService();
    
    // Execute billing analysis
    const result = await aiService.analyze('billing_cpt', {
      patientId: input.patientId,
      sessionId: input.sessionId,
      userId: input.userId || 'orchestrator',
      organizationId: input.organizationId || 'default-org',
      variables: {
        transcript: input.transcript,
        sessionType: input.sessionType || 'psychotherapy',
        duration: input.duration || '50 minutes',
        patientContext: input.patientContext || {
          demographics: { age: null, gender: null, insurance: null },
          medicalHistory: [],
          currentMedications: [],
          treatmentPlan: { goals: [] },
          recentSessions: [],
          assessmentHistory: []
        }
      },
      purpose: 'billing_cpt' as const,
      skipCache: input.skipCache || false,
      metadata: {
        orchestratorCall: true,
        directFunction: true
      }
    });
    
    const executionTime = Date.now() - startTime;
    
    if (result.success) {
      console.log('[Pipeline-Billing] Analysis completed successfully:', {
        executionTime,
        cptCodesFound: result.data?.cptCodes?.length || 0,
        primaryCode: result.data?.cptCodes?.[0]?.code,
        confidence: result.data?.confidence,
        icd10CodesFound: result.data?.icd10Codes?.length || 0
      });
      
      return {
        success: true,
        data: {
          sessionId: input.sessionId,
          patientId: input.patientId,
          analysis: result.data,
          executionTime,
          metadata: {
            executionId: result.metadata?.executionId,
            modelUsed: result.metadata?.modelUsed,
            tokenUsage: result.metadata?.tokenUsage,
            cacheHit: result.metadata?.cacheHit
          }
        },
        executionTime,
        timestamp: new Date().toISOString()
      };
      
    } else {
      console.error('[Pipeline-Billing] Analysis failed:', result.error);
      
      return {
        success: false,
        error: result.error?.message || 'Billing analysis failed',
        executionTime,
        timestamp: new Date().toISOString()
      };
    }
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[Pipeline-Billing] Function failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      executionTime,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Treatment Progress Pipeline Function
 * 
 * Analyzes treatment progress against goals and generates recommendations
 */
export async function executeProgressPipeline(input: PipelineInput): Promise<PipelineResult> {
  const startTime = Date.now();
  console.log('[Pipeline-Progress] Starting treatment progress analysis:', {
    sessionId: input.sessionId,
    patientId: input.patientId,
    transcriptLength: input.transcript.length
  });
  
  try {
    // Validate required fields
    if (!input.sessionId || !input.patientId || !input.transcript) {
      throw new Error('Missing required fields: sessionId, patientId, and transcript are required');
    }
    
    // Get AI service instance
    const aiService = await getDefaultAIService();
    
    // Execute treatment progress analysis
    const result = await aiService.analyze('treatment_progress', {
      patientId: input.patientId,
      sessionId: input.sessionId,
      userId: input.userId || 'orchestrator',
      organizationId: input.organizationId || 'default-org',
      variables: {
        transcript: input.transcript,
        patientContext: input.patientContext || {
          demographics: { age: null, gender: null },
          medicalHistory: [],
          currentMedications: [],
          treatmentPlan: { 
            goals: input.treatmentGoals || [
              'Reduce anxiety symptoms',
              'Improve sleep quality',
              'Develop coping strategies'
            ]
          },
          recentSessions: [],
          assessmentHistory: []
        }
      },
      purpose: 'treatment_progress' as const,
      skipCache: input.skipCache || false,
      metadata: {
        orchestratorCall: true,
        directFunction: true
      }
    });
    
    const executionTime = Date.now() - startTime;
    
    if (result.success) {
      console.log('[Pipeline-Progress] Analysis completed successfully:', {
        executionTime,
        goalsAssessed: result.data?.goalProgress?.length || 0,
        overallEffectiveness: result.data?.effectiveness?.overallEffectiveness,
        confidence: result.data?.confidence,
        recommendationsCount: result.data?.recommendations?.length || 0
      });
      
      return {
        success: true,
        data: {
          sessionId: input.sessionId,
          patientId: input.patientId,
          analysis: result.data,
          executionTime,
          metadata: {
            executionId: result.metadata?.executionId,
            modelUsed: result.metadata?.modelUsed,
            tokenUsage: result.metadata?.tokenUsage,
            cacheHit: result.metadata?.cacheHit
          }
        },
        executionTime,
        timestamp: new Date().toISOString()
      };
      
    } else {
      console.error('[Pipeline-Progress] Analysis failed:', result.error);
      
      return {
        success: false,
        error: result.error?.message || 'Treatment progress analysis failed',
        executionTime,
        timestamp: new Date().toISOString()
      };
    }
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[Pipeline-Progress] Function failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      executionTime,
      timestamp: new Date().toISOString()
    };
  }
}

// Pipeline function registry for dynamic execution
export const PIPELINE_FUNCTIONS = {
  safety: executeSafetyCheckPipeline,
  billing: executeBillingPipeline,
  progress: executeProgressPipeline
} as const;

// Helper function to execute any pipeline by name
export async function executePipeline(
  pipelineType: 'safety' | 'billing' | 'progress',
  input: PipelineInput
): Promise<PipelineResult> {
  const pipelineFunction = PIPELINE_FUNCTIONS[pipelineType];
  
  if (!pipelineFunction) {
    throw new Error(`Unknown pipeline type: ${pipelineType}`);
  }
  
  console.log('[Pipeline-Registry] Executing pipeline:', {
    type: pipelineType,
    sessionId: input.sessionId,
    patientId: input.patientId
  });
  
  return await pipelineFunction(input);
}
