/**
 * AI Service Audit Test Endpoint
 * 
 * Tests audit logging functionality and database persistence
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDefaultAIService } from '@/lib/ai/factory';
import { db } from '@/lib/db/drizzle';
import { aiAuditLogs } from '@/lib/db/schema/ai-audit';
import { desc, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('[AI-Test-Audit] Starting audit functionality test');
  
  try {
    // Get AI service instance
    console.log('[AI-Test-Audit] Getting AI service instance');
    const aiService = await getDefaultAIService();
    
    const testResults = {
      preTestAuditCount: 0,
      postTestAuditCount: 0,
      newAuditEntries: 0,
      auditEntriesCreated: [] as any[],
      auditFunctioning: false,
      databaseConnected: false,
      sampleExecution: null as any,
      error: null as string | null
    };
    
    // Test 1: Check database connectivity and current audit count
    console.log('[AI-Test-Audit] Checking database connectivity and current audit count');
    try {
      const preCount = await db
        .select({ count: count() })
        .from(aiAuditLogs);
      
      testResults.preTestAuditCount = preCount[0]?.count || 0;
      testResults.databaseConnected = true;
      
      console.log('[AI-Test-Audit] Database connected successfully:', {
        currentAuditEntries: testResults.preTestAuditCount
      });
      
    } catch (error) {
      console.error('[AI-Test-Audit] Database connectivity failed:', error);
      testResults.error = `Database connectivity failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      testResults.databaseConnected = false;
    }
    
    // Test 2: Execute AI pipeline to generate audit entries
    if (testResults.databaseConnected) {
      console.log('[AI-Test-Audit] Executing AI pipeline to test audit logging');
      
      try {
        const testInput = {
          patientId: '123e4567-e89b-12d3-a456-426614174000',
          sessionId: '123e4567-e89b-12d3-a456-426614174001',
          userId: '123e4567-e89b-12d3-a456-426614174002',
          organizationId: '123e4567-e89b-12d3-a456-426614174003',
          purpose: 'safety_check' as const,
          variables: {
            transcript: 'Patient reports feeling better today. No safety concerns identified during this brief check-in session.',
            patientContext: {
              demographics: { age: 28, gender: 'F' },
              medicalHistory: ['Depression'],
              currentMedications: ['Fluoxetine 20mg daily'],
              treatmentPlan: { goals: ['Improve mood', 'Increase social activities'] },
              recentSessions: [],
              assessmentHistory: []
            }
          },
          skipCache: true, // Force fresh execution to ensure audit logging
          metadata: {
            testRun: true,
            testType: 'audit_verification'
          }
        };
        
        const executionStart = Date.now();
        const result = await aiService.analyze('safety_check', testInput);
        const executionDuration = Date.now() - executionStart;
        
        testResults.sampleExecution = {
          success: result.success,
          duration: executionDuration,
          executionId: result.metadata?.executionId,
          hasMetadata: !!result.metadata,
          error: result.error?.message
        };
        
        console.log('[AI-Test-Audit] Sample execution completed:', {
          success: result.success,
          duration: executionDuration,
          executionId: result.metadata?.executionId
        });
        
      } catch (error) {
        console.error('[AI-Test-Audit] Sample execution failed:', error);
        testResults.error = `Sample execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
      
      // Small delay to ensure audit entries are written
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test 3: Check for new audit entries
      console.log('[AI-Test-Audit] Checking for new audit entries');
      try {
        const postCount = await db
          .select({ count: count() })
          .from(aiAuditLogs);
        
        testResults.postTestAuditCount = postCount[0]?.count || 0;
        testResults.newAuditEntries = testResults.postTestAuditCount - testResults.preTestAuditCount;
        
        console.log('[AI-Test-Audit] Audit count check completed:', {
          before: testResults.preTestAuditCount,
          after: testResults.postTestAuditCount,
          newEntries: testResults.newAuditEntries
        });
        
        // Get recent audit entries for verification
        if (testResults.newAuditEntries > 0) {
          const recentEntries = await db
            .select({
              id: aiAuditLogs.id,
              executionId: aiAuditLogs.executionId,
              pipelineType: aiAuditLogs.pipelineType,
              patientId: aiAuditLogs.patientId,
              success: aiAuditLogs.response,
              latencyMs: aiAuditLogs.totalDurationMs,
              tokensUsed: aiAuditLogs.totalTokens,
              createdAt: aiAuditLogs.createdAt
            })
            .from(aiAuditLogs)
            .orderBy(desc(aiAuditLogs.createdAt))
            .limit(testResults.newAuditEntries);
          
          testResults.auditEntriesCreated = recentEntries.map(entry => ({
            id: entry.id,
            executionId: entry.executionId,
            pipelineType: entry.pipelineType,
            patientId: entry.patientId,
            success: entry.success,
            latencyMs: entry.latencyMs,
            tokensUsed: entry.tokensUsed,
            createdAt: entry.createdAt,
            isTestEntry: entry.patientId === '123e4567-e89b-12d3-a456-426614174000'
          }));
          
          testResults.auditFunctioning = testResults.auditEntriesCreated.some(
            entry => entry.isTestEntry && entry.pipelineType === 'safety_check'
          );
          
          console.log('[AI-Test-Audit] Recent audit entries retrieved:', {
            totalEntries: testResults.auditEntriesCreated.length,
            testEntries: testResults.auditEntriesCreated.filter(e => e.isTestEntry).length,
            auditFunctioning: testResults.auditFunctioning
          });
          
        } else {
          console.warn('[AI-Test-Audit] No new audit entries found - audit may not be functioning');
          testResults.auditFunctioning = false;
        }
        
      } catch (error) {
        console.error('[AI-Test-Audit] Audit verification failed:', error);
        testResults.error = `Audit verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }
    
    const totalTime = Date.now() - startTime;
    const overallSuccess = testResults.databaseConnected && testResults.auditFunctioning && !testResults.error;
    
    console.log(`[AI-Test-Audit] Audit test completed in ${totalTime}ms:`, {
      databaseConnected: testResults.databaseConnected,
      auditFunctioning: testResults.auditFunctioning,
      newEntries: testResults.newAuditEntries,
      overallSuccess
    });
    
    return NextResponse.json({
      success: overallSuccess,
      testDuration: totalTime,
      auditTest: {
        ...testResults,
        summary: {
          databaseConnected: testResults.databaseConnected,
          auditFunctioning: testResults.auditFunctioning,
          entriesBeforeTest: testResults.preTestAuditCount,
          entriesAfterTest: testResults.postTestAuditCount,
          newEntriesCreated: testResults.newAuditEntries,
          testEntriesFound: testResults.auditEntriesCreated.filter(e => e.isTestEntry).length
        }
      },
      timestamp: new Date().toISOString(),
      message: overallSuccess 
        ? 'Audit logging is functioning correctly'
        : testResults.error || 'Audit logging appears to have issues'
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[AI-Test-Audit] Test failed after ${totalTime}ms:`, error);
    
    return NextResponse.json({
      success: false,
      testDuration: totalTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
