/**
 * Note Generation Pipeline API Endpoint
 * 
 * Analyzes session data to generate structured clinical SOAP notes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDefaultAIService } from '@/lib/ai/factory';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[API-NoteGeneration] Starting note generation analysis');
  
  try {
    // Parse request body
    const body = await request.json();
    const { sessionId, patientId, transcript, sessionType, duration, userId, organizationId } = body;
    
    // Validate required fields
    if (!sessionId || !patientId || !transcript) {
      console.error('[API-NoteGeneration] Missing required fields:', { sessionId, patientId, transcript: !!transcript });
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: sessionId, patientId, and transcript are required'
      }, { status: 400 });
    }
    
    console.log('[API-NoteGeneration] Processing request:', {
      sessionId,
      patientId,
      userId: userId || 'anonymous',
      sessionType: sessionType || 'unknown',
      duration: duration || 'unknown',
      transcriptLength: transcript.length
    });
    
    // Get AI service instance
    const aiService = await getDefaultAIService();
    
    // Execute note generation analysis
    const result = await aiService.analyze('clinical_note', {
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
      purpose: 'clinical_note' as const,
      skipCache: body.skipCache || false,
      metadata: {
        apiCall: true,
        endpoint: '/api/pipelines/note-generation'
      }
    });
    
    const executionTime = Date.now() - startTime;
    
    if (result.success) {
      console.log('[API-NoteGeneration] Analysis completed successfully:', {
        executionTime,
        sectionsFound: result.data?.sections?.length || 0,
        confidence: result.data?.confidence,
        hasData: !!result.data
      });
      
      // Log exact response structure for debugging transformer integration
      console.log('[API-NoteGeneration] API response structure:', {
        sessionId,
        sectionsCount: result.data?.sections?.length || 0,
        sectionTypes: result.data?.sections?.map(s => s.type) || [],
        confidence: result.data?.confidence || 0
      });
      
      return NextResponse.json({
        success: true,
        data: {
          sessionId,
          patientId,
          analysis: {
            sections: result.data?.sections || [],
            confidence: result.data?.confidence || 0.8
          },
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
      console.error('[API-NoteGeneration] Analysis failed:', result.error);
      
      return NextResponse.json({
        success: false,
        error: result.error?.message || 'Note generation failed',
        executionTime,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[API-NoteGeneration] Request failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      executionTime,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
