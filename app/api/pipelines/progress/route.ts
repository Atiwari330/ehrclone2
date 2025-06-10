/**
 * Treatment Progress Pipeline API Endpoint
 * 
 * Analyzes treatment progress against goals and generates recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDefaultAIService } from '@/lib/ai/factory';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[API-Progress] Starting treatment progress analysis');
  
  try {
    // Parse request body
    const body = await request.json();
    const { sessionId, patientId, transcript, userId, organizationId } = body;
    
    // Validate required fields
    if (!sessionId || !patientId || !transcript) {
      console.error('[API-Progress] Missing required fields:', { sessionId, patientId, transcript: !!transcript });
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: sessionId, patientId, and transcript are required'
      }, { status: 400 });
    }
    
    console.log('[API-Progress] Processing request:', {
      sessionId,
      patientId,
      userId: userId || 'anonymous',
      transcriptLength: transcript.length
    });
    
    // Get AI service instance
    const aiService = await getDefaultAIService();
    
    // Execute treatment progress analysis
    const result = await aiService.analyze('treatment_progress', {
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
          treatmentPlan: { 
            goals: body.treatmentGoals || [
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
      skipCache: body.skipCache || false,
      metadata: {
        apiCall: true,
        endpoint: '/api/pipelines/progress'
      }
    });
    
    const executionTime = Date.now() - startTime;
    
    if (result.success) {
      console.log('[API-Progress] Analysis completed successfully:', {
        executionTime,
        goalsAssessed: result.data?.goalProgress?.length || 0,
        overallEffectiveness: result.data?.effectiveness?.overallEffectiveness,
        confidence: result.data?.confidence,
        recommendationsCount: result.data?.recommendations?.length || 0
      });
      
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
      console.error('[API-Progress] Analysis failed:', result.error);
      
      return NextResponse.json({
        success: false,
        error: result.error?.message || 'Treatment progress analysis failed',
        executionTime,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[API-Progress] Request failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      executionTime,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
