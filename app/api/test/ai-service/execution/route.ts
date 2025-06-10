/**
 * AI Service LLM Execution Test Endpoint
 * 
 * Tests actual LLM execution with different pipeline types
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDefaultAIService } from '@/lib/ai/factory';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('[AI-Test-Execution] Starting LLM execution test');
  
  try {
    // Get AI service instance
    console.log('[AI-Test-Execution] Getting AI service instance');
    const aiService = await getDefaultAIService();
    
    const testResults = {
      safetyCheck: null as any,
      billingCpt: null as any,
      treatmentProgress: null as any,
      totalExecutionTime: 0,
      successfulPipelines: 0,
      failedPipelines: 0,
      errors: [] as string[]
    };
    
    const baseTestInput = {
      patientId: 'test-patient-456',
      sessionId: 'test-session-456',
      userId: 'test-user-456',
      organizationId: 'test-org-456',
      variables: {
        transcript: `Patient: "I've been feeling really anxious about everything lately. Sometimes I have thoughts about hurting myself, but I don't think I would actually do it. I just feel overwhelmed."
        
Therapist: "Thank you for sharing that with me. Can you tell me more about these thoughts? When do they typically occur?"

Patient: "Usually when I'm alone at night. I've been having trouble sleeping. I'm also behind on my bills and that's making everything worse."

Therapist: "It sounds like you're dealing with a lot right now. Have you been taking your prescribed medication for anxiety?"

Patient: "Yes, I take the Sertraline every morning. It helps some, but lately it doesn't feel like enough."`,
        patientContext: {
          demographics: { 
            age: 32, 
            gender: 'M',
            insurance: 'Blue Cross Blue Shield'
          },
          medicalHistory: ['Generalized Anxiety Disorder', 'Major Depressive Disorder'],
          currentMedications: ['Sertraline 50mg daily'],
          treatmentPlan: { 
            goals: [
              'Reduce anxiety symptoms',
              'Improve sleep quality',
              'Develop coping strategies'
            ]
          },
          recentSessions: [],
          assessmentHistory: [
            { type: 'PHQ-9', score: 12, date: '2023-12-01' },
            { type: 'GAD-7', score: 14, date: '2023-12-01' }
          ]
        }
      },
      skipCache: true, // Force fresh execution for testing
      metadata: {
        testRun: true,
        testType: 'llm_execution'
      }
    };
    
    // Test 1: Safety Check Pipeline
    console.log('[AI-Test-Execution] Testing safety check pipeline');
    try {
      const safetyStart = Date.now();
      const safetyResult = await aiService.analyze('safety_check', {
        ...baseTestInput,
        purpose: 'safety_check' as const
      });
      
      const safetyDuration = Date.now() - safetyStart;
      testResults.safetyCheck = {
        success: safetyResult.success,
        duration: safetyDuration,
        hasData: !!safetyResult.data,
        cacheHit: safetyResult.metadata?.cacheHit || false,
        tokenUsage: safetyResult.metadata?.tokenUsage,
        model: safetyResult.metadata?.modelUsed,
        confidence: safetyResult.data?.confidence,
        riskLevel: safetyResult.data?.riskAssessment?.overallRisk,
        error: safetyResult.error?.message
      };
      
      if (safetyResult.success) {
        testResults.successfulPipelines++;
        console.log('[AI-Test-Execution] Safety check completed successfully:', {
          duration: safetyDuration,
          riskLevel: safetyResult.data?.riskAssessment?.overallRisk,
          confidence: safetyResult.data?.confidence
        });
      } else {
        testResults.failedPipelines++;
        testResults.errors.push(`Safety check failed: ${safetyResult.error?.message}`);
        console.error('[AI-Test-Execution] Safety check failed:', safetyResult.error);
      }
      
    } catch (error) {
      testResults.failedPipelines++;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      testResults.errors.push(`Safety check exception: ${errorMsg}`);
      console.error('[AI-Test-Execution] Safety check exception:', error);
    }
    
    // Test 2: Billing CPT Pipeline
    console.log('[AI-Test-Execution] Testing billing CPT pipeline');
    try {
      const billingStart = Date.now();
      const billingResult = await aiService.analyze('billing_cpt', {
        ...baseTestInput,
        purpose: 'billing_cpt' as const
      });
      
      const billingDuration = Date.now() - billingStart;
      testResults.billingCpt = {
        success: billingResult.success,
        duration: billingDuration,
        hasData: !!billingResult.data,
        cacheHit: billingResult.metadata?.cacheHit || false,
        tokenUsage: billingResult.metadata?.tokenUsage,
        model: billingResult.metadata?.modelUsed,
        suggestedCodes: billingResult.data?.cptCodes?.length || 0,
        primaryCode: billingResult.data?.cptCodes?.[0]?.code,
        confidence: billingResult.data?.confidence,
        error: billingResult.error?.message
      };
      
      if (billingResult.success) {
        testResults.successfulPipelines++;
        console.log('[AI-Test-Execution] Billing CPT completed successfully:', {
          duration: billingDuration,
          codesFound: billingResult.data?.cptCodes?.length,
          primaryCode: billingResult.data?.cptCodes?.[0]?.code
        });
      } else {
        testResults.failedPipelines++;
        testResults.errors.push(`Billing CPT failed: ${billingResult.error?.message}`);
        console.error('[AI-Test-Execution] Billing CPT failed:', billingResult.error);
      }
      
    } catch (error) {
      testResults.failedPipelines++;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      testResults.errors.push(`Billing CPT exception: ${errorMsg}`);
      console.error('[AI-Test-Execution] Billing CPT exception:', error);
    }
    
    // Test 3: Treatment Progress Pipeline
    console.log('[AI-Test-Execution] Testing treatment progress pipeline');
    try {
      const progressStart = Date.now();
      const progressResult = await aiService.analyze('treatment_progress', {
        ...baseTestInput,
        purpose: 'treatment_progress' as const
      });
      
      const progressDuration = Date.now() - progressStart;
      testResults.treatmentProgress = {
        success: progressResult.success,
        duration: progressDuration,
        hasData: !!progressResult.data,
        cacheHit: progressResult.metadata?.cacheHit || false,
        tokenUsage: progressResult.metadata?.tokenUsage,
        model: progressResult.metadata?.modelUsed,
        goalsAssessed: progressResult.data?.goalProgress?.length || 0,
        overallProgress: progressResult.data?.effectiveness?.overallEffectiveness,
        confidence: progressResult.data?.confidence,
        error: progressResult.error?.message
      };
      
      if (progressResult.success) {
        testResults.successfulPipelines++;
        console.log('[AI-Test-Execution] Treatment progress completed successfully:', {
          duration: progressDuration,
          goalsAssessed: progressResult.data?.goalProgress?.length,
          overallProgress: progressResult.data?.effectiveness?.overallEffectiveness
        });
      } else {
        testResults.failedPipelines++;
        testResults.errors.push(`Treatment progress failed: ${progressResult.error?.message}`);
        console.error('[AI-Test-Execution] Treatment progress failed:', progressResult.error);
      }
      
    } catch (error) {
      testResults.failedPipelines++;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      testResults.errors.push(`Treatment progress exception: ${errorMsg}`);
      console.error('[AI-Test-Execution] Treatment progress exception:', error);
    }
    
    testResults.totalExecutionTime = Date.now() - startTime;
    
    const overallSuccess = testResults.successfulPipelines > 0 && testResults.failedPipelines === 0;
    console.log(`[AI-Test-Execution] Execution test completed in ${testResults.totalExecutionTime}ms:`, {
      successful: testResults.successfulPipelines,
      failed: testResults.failedPipelines,
      overallSuccess
    });
    
    return NextResponse.json({
      success: overallSuccess,
      testDuration: testResults.totalExecutionTime,
      executionTest: {
        ...testResults,
        summary: {
          totalPipelines: 3,
          successfulPipelines: testResults.successfulPipelines,
          failedPipelines: testResults.failedPipelines,
          successRate: `${((testResults.successfulPipelines / 3) * 100).toFixed(1)}%`,
          averageExecutionTime: testResults.totalExecutionTime / 3
        }
      },
      timestamp: new Date().toISOString(),
      message: overallSuccess 
        ? 'All AI pipelines executed successfully'
        : `${testResults.failedPipelines} pipeline(s) failed execution`
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[AI-Test-Execution] Test failed after ${totalTime}ms:`, error);
    
    return NextResponse.json({
      success: false,
      testDuration: totalTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
