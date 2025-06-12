/**
 * Safety Check Pipeline API Endpoint
 * 
 * Analyzes session transcripts for safety risks and generates alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDefaultAIService } from '@/lib/ai/factory';
import { createSafetyAlert, createAIPipelineExecution, updateAIPipelineExecution } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[API-SafetyCheck] Starting safety check analysis');
  
  let pipelineExecution: any = null; // Declare outside try block for error handling
  let isTestSession = false; // Declare outside try block for error handling
  
  try {
    // Parse request body
    const body = await request.json();
    const { sessionId, patientId, transcript, userId, organizationId } = body;
    
    // Validate required fields
    if (!sessionId || !patientId || !transcript) {
      console.error('[API-SafetyCheck] Missing required fields:', { sessionId, patientId, transcript: !!transcript });
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: sessionId, patientId, and transcript are required'
      }, { status: 400 });
    }
    
    console.log('[API-SafetyCheck] Processing request:', {
      sessionId,
      patientId,
      userId: userId || 'anonymous',
      transcriptLength: transcript.length
    });
    
    // Check if this is a test session (skip database operations for test sessions)
    isTestSession = sessionId === '123e4567-e89b-12d3-a456-426614174000' || 
                   sessionId === 'test-session';
    
    // Step 1: Create pipeline execution record FIRST (robust pattern) - skip for test sessions
    if (!isTestSession) {
      console.log('[API-SafetyCheck] Creating pipeline execution record');
      pipelineExecution = await createAIPipelineExecution({
        pipelineType: 'safety_check',
        sessionId,
        patientId,
        userId: userId || 'api-user',
        inputData: {
          transcript,
          transcriptLength: transcript.length,
          patientContext: body.patientContext || {
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
      
      console.log('[API-SafetyCheck] Pipeline execution created:', {
        executionId: pipelineExecution.id,
        pipelineType: 'safety_check'
      });
    } else {
      console.log('[API-SafetyCheck] Test session detected, skipping database pipeline execution creation');
      pipelineExecution = { id: 'test-execution-skip' }; // Mock for test sessions
    }
    
    // Get AI service instance
    const aiService = await getDefaultAIService();
    
    // Execute safety check analysis
    const result = await aiService.analyze('safety_check', {
      patientId,
      sessionId,
      userId: userId || 'api-user',
      organizationId: organizationId || 'default-org',
      variables: {
        transcript,
        // Add minimal patient context for testing
        patientContext: body.patientContext || {
          demographics: { age: null, gender: null },
          medicalHistory: [],
          currentMedications: [],
          treatmentPlan: { goals: [] },
          recentSessions: [],
          assessmentHistory: []
        }
      },
      purpose: 'safety_check' as const,
      skipCache: body.skipCache || false,
      metadata: {
        apiCall: true,
        endpoint: '/api/pipelines/safety-check'
      }
    });
    
    const executionTime = Date.now() - startTime;
    
    if (result.success) {
      console.log('[API-SafetyCheck] Analysis completed successfully:', {
        executionTime,
        riskLevel: result.data?.riskAssessment?.overallRisk,
        alertCount: result.data?.alerts?.length || 0,
        confidence: result.data?.confidence
      });
      
      // Step 2: Update pipeline execution with results (skip for test sessions)
      if (!isTestSession) {
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
        
        console.log('[API-SafetyCheck] Pipeline execution updated with successful results');
      } else {
        console.log('[API-SafetyCheck] Test session - skipping pipeline execution update');
      }
      
      // Store high-risk alerts in database - Story 7.6 Implementation (skip for test sessions)
      const highRiskAlerts = result.data?.alerts?.filter((alert: any) => 
        alert.severity === 'high' || alert.severity === 'critical'
      ) || [];
      
      if (highRiskAlerts.length > 0 && !isTestSession) {
        console.warn('[API-SafetyCheck] High-risk alerts detected:', {
          count: highRiskAlerts.length,
          alerts: highRiskAlerts.map((a: any) => ({ severity: a.severity, type: a.type }))
        });
        
        // Persist high-risk alerts to database
        const alertPersistenceResults = [];
        for (const alert of highRiskAlerts) {
          try {
            // Generate a unique alert ID for tracking
            const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            console.log('[API-SafetyCheck] Persisting alert to database:', {
              alertId,
              category: alert.category,
              severity: alert.severity,
              patientId
            });
            
            const savedAlert = await createSafetyAlert({
              alertId,
              sessionId,
              patientId,
              providerId: userId || 'api-user', // Use userId as providerId for this implementation
              pipelineExecutionId: pipelineExecution.id, // Use our robust pipeline execution UUID
              severity: alert.severity,
              type: alert.category, // Use category as type
              description: alert.description || `${alert.category} risk detected: ${alert.title}`,
              suggestedActions: alert.recommendedActions || [],
              riskScore: undefined, // Risk score not available in current alert structure
            });
            
            alertPersistenceResults.push({
              alertId,
              databaseId: savedAlert.id,
              status: 'saved'
            });
            
            console.log('[API-SafetyCheck] Alert persisted successfully:', {
              alertId,
              databaseId: savedAlert.id,
              category: alert.category,
              severity: alert.severity
            });
            
          } catch (dbError) {
            console.error('[API-SafetyCheck] Failed to persist alert to database:', {
              category: alert.category,
              severity: alert.severity,
              error: dbError instanceof Error ? dbError.message : 'Unknown database error'
            });
            
            alertPersistenceResults.push({
              alertId: 'unknown',
              status: 'failed',
              error: dbError instanceof Error ? dbError.message : 'Unknown database error'
            });
          }
        }
        
        console.log('[API-SafetyCheck] Alert persistence summary:', {
          total: highRiskAlerts.length,
          saved: alertPersistenceResults.filter(r => r.status === 'saved').length,
          failed: alertPersistenceResults.filter(r => r.status === 'failed').length
        });
      } else if (highRiskAlerts.length > 0 && isTestSession) {
        console.log('[API-SafetyCheck] High-risk alerts detected but skipping database persistence for test session:', {
          count: highRiskAlerts.length,
          alerts: highRiskAlerts.map((a: any) => ({ severity: a.severity, type: a.type }))
        });
      }
      
      return NextResponse.json({
        success: true,
        data: {
          sessionId,
          patientId,
          analysis: result.data,
          executionTime,
          metadata: {
            executionId: result.metadata?.executionId,
            modelUsed: result.metadata?.modelUsed,
            tokenUsage: result.metadata?.tokenUsage,
            cacheHit: result.metadata?.cacheHit
          }
        },
        timestamp: new Date().toISOString()
      });
      
    } else {
      console.error('[API-SafetyCheck] Analysis failed:', result.error);
      
      // Update pipeline execution with failure (skip for test sessions)
      if (!isTestSession) {
        await updateAIPipelineExecution({
          id: pipelineExecution.id,
          endTime: new Date(),
          durationMs: executionTime,
          status: 'failed',
          errorMessage: result.error?.message || 'Safety check analysis failed'
        });
      } else {
        console.log('[API-SafetyCheck] Test session - skipping pipeline execution failure update');
      }
      
      return NextResponse.json({
        success: false,
        error: result.error?.message || 'Safety check analysis failed',
        executionTime,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[API-SafetyCheck] Request failed:', error);
    
    // Update pipeline execution with error if we have the execution record (skip for test sessions)
    if (pipelineExecution?.id && !isTestSession) {
      try {
        await updateAIPipelineExecution({
          id: pipelineExecution.id,
          endTime: new Date(),
          durationMs: executionTime,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      } catch (updateError) {
        console.error('[API-SafetyCheck] Failed to update pipeline execution with error:', updateError);
      }
    } else if (pipelineExecution?.id && isTestSession) {
      console.log('[API-SafetyCheck] Test session - skipping pipeline execution error update');
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      executionTime,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
