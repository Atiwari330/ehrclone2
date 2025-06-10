/**
 * AI Service Health Check Test Endpoint
 * 
 * Tests the health check functionality of the AI service
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDefaultAIService } from '@/lib/ai/factory';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('[AI-Test-Health] Starting health check test');
  
  try {
    // Get AI service instance
    console.log('[AI-Test-Health] Getting AI service instance');
    const aiService = await getDefaultAIService();
    
    // Perform health check
    console.log('[AI-Test-Health] Performing health check');
    const healthCheckStart = Date.now();
    const healthResult = await aiService.healthCheck();
    const healthCheckDuration = Date.now() - healthCheckStart;
    
    console.log('[AI-Test-Health] Health check completed:', {
      duration: healthCheckDuration,
      healthy: healthResult.healthy,
      serviceCount: Object.keys(healthResult.services).length
    });
    
    // Analyze results
    const analysis = {
      overall: healthResult.healthy,
      totalDuration: healthCheckDuration,
      services: Object.entries(healthResult.services).map(([name, status]) => ({
        name,
        healthy: status.healthy,
        latency: status.latencyMs,
        error: status.error || null
      })),
      issues: Object.entries(healthResult.services)
        .filter(([_, status]) => !status.healthy)
        .map(([name, status]) => ({
          service: name,
          error: status.error
        }))
    };
    
    const totalTime = Date.now() - startTime;
    console.log(`[AI-Test-Health] Test completed in ${totalTime}ms`);
    
    return NextResponse.json({
      success: true,
      testDuration: totalTime,
      healthCheck: analysis,
      timestamp: new Date().toISOString(),
      message: healthResult.healthy 
        ? 'All AI service components are healthy'
        : `${analysis.issues.length} service(s) have issues`
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[AI-Test-Health] Test failed after ${totalTime}ms:`, error);
    
    return NextResponse.json({
      success: false,
      testDuration: totalTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
