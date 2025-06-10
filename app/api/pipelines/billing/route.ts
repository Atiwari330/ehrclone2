/**
 * Billing Analysis Pipeline API Endpoint
 * 
 * Analyzes session data to suggest appropriate CPT codes and billing information
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDefaultAIService } from '@/lib/ai/factory';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[API-Billing] Starting billing analysis');
  
  try {
    // Parse request body
    const body = await request.json();
    const { sessionId, patientId, transcript, sessionType, duration, userId, organizationId } = body;
    
    // Validate required fields
    if (!sessionId || !patientId || !transcript) {
      console.error('[API-Billing] Missing required fields:', { sessionId, patientId, transcript: !!transcript });
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: sessionId, patientId, and transcript are required'
      }, { status: 400 });
    }
    
    console.log('[API-Billing] Processing request:', {
      sessionId,
      patientId,
      userId: userId || 'anonymous',
      sessionType: sessionType || 'unknown',
      duration: duration || 'unknown',
      transcriptLength: transcript.length
    });
    
    // Get AI service instance
    const aiService = await getDefaultAIService();
    
    // Execute billing analysis
    const result = await aiService.analyze('billing_cpt', {
      patientId,
      sessionId,
      userId: userId || 'api-user',
      organizationId: organizationId || 'default-org',
      variables: {
        transcript,
        sessionType: sessionType || 'psychotherapy',
        duration: duration || '50 minutes',
        // Add minimal patient context for testing
        patientContext: body.patientContext || {
          demographics: { age: null, gender: null, insurance: null },
          medicalHistory: [],
          currentMedications: [],
          treatmentPlan: { goals: [] },
          recentSessions: [],
          assessmentHistory: []
        }
      },
      purpose: 'billing_cpt' as const,
      skipCache: body.skipCache || false,
      metadata: {
        apiCall: true,
        endpoint: '/api/pipelines/billing'
      }
    });
    
    const executionTime = Date.now() - startTime;
    
    if (result.success) {
      console.log('[API-Billing] Analysis completed successfully:', {
        executionTime,
        cptCodesFound: result.data?.cptCodes?.length || 0,
        primaryCode: result.data?.cptCodes?.[0]?.code,
        confidence: result.data?.confidence,
        icd10CodesFound: result.data?.icd10Codes?.length || 0
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
      console.error('[API-Billing] Analysis failed:', result.error);
      
      return NextResponse.json({
        success: false,
        error: result.error?.message || 'Billing analysis failed',
        executionTime,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[API-Billing] Request failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      executionTime,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
