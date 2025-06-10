/**
 * AI Service Cache Test Endpoint
 * 
 * Tests cache hit/miss behavior and performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDefaultAIService } from '@/lib/ai/factory';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('[AI-Test-Cache] Starting cache behavior test');
  
  try {
    // Get AI service instance
    console.log('[AI-Test-Cache] Getting AI service instance');
    const aiService = await getDefaultAIService();
    
    const testResults = {
      cacheEnabled: false,
      firstCallDuration: 0,
      secondCallDuration: 0,
      cacheHit: false,
      cacheMiss: false,
      error: null as string | null
    };
    
    // Test data - properly structured for AIExecutionOptions
    const testInput = {
      patientId: 'test-patient-123',
      sessionId: 'test-session-123',
      userId: 'test-user-123',
      organizationId: 'test-org-123',
      purpose: 'safety_check' as const,
      variables: {
        transcript: 'Patient reports feeling anxious about upcoming procedure.',
        patientContext: {
          demographics: { age: 35, gender: 'F' },
          medicalHistory: ['anxiety disorder'],
          currentMedications: [],
          treatmentPlan: { goals: [] },
          recentSessions: [],
          assessmentHistory: []
        }
      },
      skipCache: false,
      metadata: {
        testRun: true,
        testType: 'cache_behavior'
      }
    };
    
    console.log('[AI-Test-Cache] Testing safety check pipeline for cache behavior');
    
    // First call (should be cache miss)
    console.log('[AI-Test-Cache] Making first call (expecting cache miss)');
    const firstCallStart = Date.now();
    
    try {
      const firstResult = await aiService.analyze('safety_check', testInput);
      testResults.firstCallDuration = Date.now() - firstCallStart;
      testResults.cacheMiss = true;
      
      console.log('[AI-Test-Cache] First call completed:', {
        duration: testResults.firstCallDuration,
        resultReceived: !!firstResult
      });
      
      // Second call with same input (should be cache hit if caching enabled)
      console.log('[AI-Test-Cache] Making second call (expecting cache hit if enabled)');
      const secondCallStart = Date.now();
      
      const secondResult = await aiService.analyze('safety_check', testInput);
      testResults.secondCallDuration = Date.now() - secondCallStart;
      
      console.log('[AI-Test-Cache] Second call completed:', {
        duration: testResults.secondCallDuration,
        resultReceived: !!secondResult
      });
      
      // Analyze cache behavior
      const speedImprovement = testResults.firstCallDuration > 0 
        ? ((testResults.firstCallDuration - testResults.secondCallDuration) / testResults.firstCallDuration) * 100
        : 0;
      
      // If second call is significantly faster (>50% improvement), likely cache hit
      testResults.cacheHit = speedImprovement > 50;
      testResults.cacheEnabled = testResults.cacheHit;
      
      console.log('[AI-Test-Cache] Cache analysis:', {
        speedImprovement: `${speedImprovement.toFixed(1)}%`,
        likelyCacheHit: testResults.cacheHit,
        cacheEnabled: testResults.cacheEnabled
      });
      
    } catch (error) {
      console.error('[AI-Test-Cache] Error during AI calls:', error);
      testResults.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`[AI-Test-Cache] Cache test completed in ${totalTime}ms`);
    
    return NextResponse.json({
      success: true,
      testDuration: totalTime,
      cacheTest: {
        ...testResults,
        speedImprovement: testResults.firstCallDuration > 0 
          ? `${(((testResults.firstCallDuration - testResults.secondCallDuration) / testResults.firstCallDuration) * 100).toFixed(1)}%`
          : '0%',
        analysis: testResults.cacheHit 
          ? 'Cache appears to be working - second call was significantly faster'
          : testResults.error
          ? 'Cache test failed due to error'
          : 'Cache may not be enabled or working - second call took similar time'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[AI-Test-Cache] Test failed after ${totalTime}ms:`, error);
    
    return NextResponse.json({
      success: false,
      testDuration: totalTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
