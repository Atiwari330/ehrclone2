/**
 * Prompt Testing Framework
 * 
 * Validates prompt templates by testing with sample inputs and comparing
 * outputs against expected schemas and results. Supports token counting,
 * performance measurement, and A/B testing.
 */

import { PromptTemplate } from '@/lib/ai/types/prompt-template';
import { z } from 'zod';
import { getPromptRegistry } from '@/lib/ai/prompt-registry';

/**
 * Test case for a prompt template
 */
export interface PromptTestCase {
  name: string;
  description?: string;
  input: Record<string, any>;
  expectedOutput?: any;
  outputValidation?: (output: any) => boolean;
  maxTokens?: number;
  maxLatency?: number; // milliseconds
  tags?: string[];
}

/**
 * Test result for a single test case
 */
export interface TestResult {
  testName: string;
  promptId: string;
  promptVersion: string;
  passed: boolean;
  duration: number;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  errors?: string[];
  warnings?: string[];
  output?: any;
  metrics?: Record<string, number>;
}

/**
 * A/B test configuration
 */
export interface ABTestConfig {
  variantA: {
    promptId: string;
    version?: string;
  };
  variantB: {
    promptId: string;
    version?: string;
  };
  testCases: PromptTestCase[];
  metrics: string[]; // Metrics to compare
}

/**
 * A/B test results
 */
export interface ABTestResults {
  variantA: {
    promptId: string;
    version: string;
    results: TestResult[];
    aggregateMetrics: Record<string, number>;
  };
  variantB: {
    promptId: string;
    version: string;
    results: TestResult[];
    aggregateMetrics: Record<string, number>;
  };
  winner?: 'A' | 'B' | 'tie';
  analysis: string;
}

/**
 * Main prompt testing class
 */
export class PromptTester {
  private registry = getPromptRegistry();
  
  constructor(
    private llmExecutor?: (prompt: string, config: any) => Promise<any>
  ) {
    console.log('[PromptTester] Initialized');
  }

  /**
   * Run tests for a prompt template
   */
  async testPrompt(
    promptId: string,
    version: string | undefined,
    testCases: PromptTestCase[]
  ): Promise<TestResult[]> {
    console.log('[PromptTester] Starting tests for prompt:', {
      promptId,
      version,
      testCount: testCases.length,
    });

    const results: TestResult[] = [];
    
    // Get the prompt template
    const template = await this.registry.get(promptId, { version });
    
    for (const testCase of testCases) {
      const result = await this.runSingleTest(template, testCase);
      results.push(result);
      
      console.log('[PromptTester] Test completed:', {
        testName: result.testName,
        passed: result.passed,
        duration: result.duration,
        tokens: result.tokenUsage.total,
      });
    }
    
    // Log aggregate results
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const avgTokens = results.reduce((sum, r) => sum + r.tokenUsage.total, 0) / results.length;
    
    console.log('[PromptTester] Test suite completed:', {
      promptId,
      version: template.metadata.version,
      passed,
      failed,
      avgDuration: Math.round(avgDuration),
      avgTokens: Math.round(avgTokens),
    });
    
    return results;
  }

  /**
   * Run a single test case
   */
  private async runSingleTest(
    template: PromptTemplate,
    testCase: PromptTestCase
  ): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    let output: any;
    let passed = true;
    
    try {
      // Validate required variables
      const missingVars = this.validateInputVariables(template, testCase.input);
      if (missingVars.length > 0) {
        errors.push(`Missing required variables: ${missingVars.join(', ')}`);
        passed = false;
      }
      
      // Render the prompt
      const renderedPrompt = this.renderPrompt(template.template, testCase.input);
      
      // Count tokens
      const promptTokens = this.estimateTokens(renderedPrompt);
      
      // Check token limit
      if (testCase.maxTokens && promptTokens > testCase.maxTokens) {
        warnings.push(`Prompt exceeds token limit: ${promptTokens} > ${testCase.maxTokens}`);
      }
      
      // Execute if we have an executor
      if (this.llmExecutor && passed) {
        output = await this.llmExecutor(renderedPrompt, template.executionConfig);
        
        // Validate output schema
        if (template.outputSchema) {
          const validation = template.outputSchema.safeParse(output);
          if (!validation.success) {
            errors.push('Output schema validation failed');
            errors.push(...validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
            passed = false;
          }
        }
        
        // Custom validation
        if (testCase.outputValidation && !testCase.outputValidation(output)) {
          errors.push('Custom output validation failed');
          passed = false;
        }
        
        // Expected output comparison
        if (testCase.expectedOutput) {
          const matches = this.compareOutputs(output, testCase.expectedOutput);
          if (!matches) {
            errors.push('Output does not match expected result');
            passed = false;
          }
        }
      } else if (!this.llmExecutor) {
        // Dry run - just validate the prompt renders
        warnings.push('No LLM executor provided - dry run only');
        output = { dryRun: true, prompt: renderedPrompt };
      }
      
    } catch (error) {
      errors.push(`Execution error: ${error instanceof Error ? error.message : String(error)}`);
      passed = false;
    }
    
    const duration = Date.now() - startTime;
    
    // Check latency
    if (testCase.maxLatency && duration > testCase.maxLatency) {
      warnings.push(`Execution time exceeds limit: ${duration}ms > ${testCase.maxLatency}ms`);
    }
    
    return {
      testName: testCase.name,
      promptId: template.metadata.id,
      promptVersion: template.metadata.version,
      passed,
      duration,
      tokenUsage: {
        prompt: this.estimateTokens(this.renderPrompt(template.template, testCase.input)),
        completion: output ? this.estimateTokens(JSON.stringify(output)) : 0,
        total: 0, // Will be calculated
      },
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      output,
    };
  }

  /**
   * Run A/B tests between two prompts
   */
  async runABTest(config: ABTestConfig): Promise<ABTestResults> {
    console.log('[PromptTester] Starting A/B test:', {
      variantA: config.variantA,
      variantB: config.variantB,
      testCases: config.testCases.length,
    });
    
    // Run tests for variant A
    const resultsA = await this.testPrompt(
      config.variantA.promptId,
      config.variantA.version,
      config.testCases
    );
    
    // Run tests for variant B
    const resultsB = await this.testPrompt(
      config.variantB.promptId,
      config.variantB.version,
      config.testCases
    );
    
    // Calculate aggregate metrics
    const metricsA = this.calculateAggregateMetrics(resultsA, config.metrics);
    const metricsB = this.calculateAggregateMetrics(resultsB, config.metrics);
    
    // Determine winner
    const winner = this.determineWinner(metricsA, metricsB, config.metrics);
    
    // Generate analysis
    const analysis = this.generateABAnalysis(metricsA, metricsB, config.metrics);
    
    const abResults: ABTestResults = {
      variantA: {
        promptId: config.variantA.promptId,
        version: resultsA[0]?.promptVersion || 'unknown',
        results: resultsA,
        aggregateMetrics: metricsA,
      },
      variantB: {
        promptId: config.variantB.promptId,
        version: resultsB[0]?.promptVersion || 'unknown',
        results: resultsB,
        aggregateMetrics: metricsB,
      },
      winner,
      analysis,
    };
    
    console.log('[PromptTester] A/B test completed:', {
      winner,
      variantA: metricsA,
      variantB: metricsB,
    });
    
    return abResults;
  }

  /**
   * Validate input variables against template requirements
   */
  private validateInputVariables(
    template: PromptTemplate,
    input: Record<string, any>
  ): string[] {
    const missing: string[] = [];
    
    for (const variable of template.variables) {
      if (variable.required && !(variable.name in input)) {
        missing.push(variable.name);
      }
    }
    
    return missing;
  }

  /**
   * Render a prompt template with variables
   */
  private renderPrompt(template: string, variables: Record<string, any>): string {
    let rendered = template;
    
    // Simple variable replacement - in production, use a proper template engine
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    }
    
    // Handle conditionals (simplified)
    rendered = rendered.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, varName, content) => {
      return variables[varName] ? content : '';
    });
    
    return rendered;
  }

  /**
   * Estimate token count for a string
   */
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token per 4 characters
    // In production, use proper tokenizer
    return Math.ceil(text.length / 4);
  }

  /**
   * Compare actual output with expected output
   */
  private compareOutputs(actual: any, expected: any): boolean {
    // Deep equality check - in production, use more sophisticated comparison
    return JSON.stringify(actual) === JSON.stringify(expected);
  }

  /**
   * Calculate aggregate metrics from test results
   */
  private calculateAggregateMetrics(
    results: TestResult[],
    metricNames: string[]
  ): Record<string, number> {
    const metrics: Record<string, number> = {};
    
    // Standard metrics
    metrics.passRate = results.filter(r => r.passed).length / results.length;
    metrics.avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    metrics.avgTokens = results.reduce((sum, r) => sum + r.tokenUsage.total, 0) / results.length;
    metrics.errorRate = results.filter(r => r.errors && r.errors.length > 0).length / results.length;
    
    // Custom metrics from test results
    for (const metricName of metricNames) {
      const values = results
        .filter(r => r.metrics && metricName in r.metrics)
        .map(r => r.metrics![metricName]);
      
      if (values.length > 0) {
        metrics[metricName] = values.reduce((sum, v) => sum + v, 0) / values.length;
      }
    }
    
    return metrics;
  }

  /**
   * Determine winner of A/B test
   */
  private determineWinner(
    metricsA: Record<string, number>,
    metricsB: Record<string, number>,
    priorityMetrics: string[]
  ): 'A' | 'B' | 'tie' {
    let scoreA = 0;
    let scoreB = 0;
    
    // Compare priority metrics
    for (const metric of priorityMetrics) {
      if (metric in metricsA && metric in metricsB) {
        if (metricsA[metric] > metricsB[metric]) {
          scoreA++;
        } else if (metricsB[metric] > metricsA[metric]) {
          scoreB++;
        }
      }
    }
    
    // Default metrics comparison
    if (metricsA.passRate > metricsB.passRate) scoreA++;
    else if (metricsB.passRate > metricsA.passRate) scoreB++;
    
    if (metricsA.avgDuration < metricsB.avgDuration) scoreA++;
    else if (metricsB.avgDuration < metricsA.avgDuration) scoreB++;
    
    if (metricsA.avgTokens < metricsB.avgTokens) scoreA++;
    else if (metricsB.avgTokens < metricsA.avgTokens) scoreB++;
    
    if (scoreA > scoreB) return 'A';
    if (scoreB > scoreA) return 'B';
    return 'tie';
  }

  /**
   * Generate analysis text for A/B test results
   */
  private generateABAnalysis(
    metricsA: Record<string, number>,
    metricsB: Record<string, number>,
    priorityMetrics: string[]
  ): string {
    const analysis: string[] = [];
    
    // Pass rate comparison
    const passRateDiff = ((metricsA.passRate - metricsB.passRate) / metricsB.passRate) * 100;
    analysis.push(`Pass rate: Variant A ${passRateDiff > 0 ? 'outperforms' : 'underperforms'} B by ${Math.abs(passRateDiff).toFixed(1)}%`);
    
    // Performance comparison
    const durationDiff = ((metricsB.avgDuration - metricsA.avgDuration) / metricsB.avgDuration) * 100;
    analysis.push(`Performance: Variant A is ${durationDiff > 0 ? 'faster' : 'slower'} by ${Math.abs(durationDiff).toFixed(1)}%`);
    
    // Token usage comparison
    const tokenDiff = ((metricsB.avgTokens - metricsA.avgTokens) / metricsB.avgTokens) * 100;
    analysis.push(`Token usage: Variant A uses ${tokenDiff > 0 ? 'fewer' : 'more'} tokens by ${Math.abs(tokenDiff).toFixed(1)}%`);
    
    // Priority metrics
    for (const metric of priorityMetrics) {
      if (metric in metricsA && metric in metricsB) {
        const diff = ((metricsA[metric] - metricsB[metric]) / metricsB[metric]) * 100;
        analysis.push(`${metric}: Variant A ${diff > 0 ? 'higher' : 'lower'} by ${Math.abs(diff).toFixed(1)}%`);
      }
    }
    
    return analysis.join('\n');
  }
}

/**
 * Create a test suite for a prompt category
 */
export function createTestSuite(
  category: string,
  testCases: PromptTestCase[]
): PromptTestCase[] {
  console.log('[PromptTester] Creating test suite:', {
    category,
    testCount: testCases.length,
  });
  
  // Tag all test cases with the category
  return testCases.map(tc => ({
    ...tc,
    tags: [...(tc.tags || []), category],
  }));
}

/**
 * Run regression tests for all registered prompts
 */
export async function runRegressionTests(
  tester: PromptTester,
  testSuites: Map<string, PromptTestCase[]>
): Promise<Map<string, TestResult[]>> {
  console.log('[PromptTester] Starting regression tests for all prompts');
  
  const allResults = new Map<string, TestResult[]>();
  const registry = getPromptRegistry();
  const prompts = registry.list();
  
  for (const promptInfo of prompts) {
    const testCases = testSuites.get(promptInfo.id);
    if (testCases) {
      const results = await tester.testPrompt(
        promptInfo.id,
        promptInfo.latestVersion,
        testCases
      );
      allResults.set(promptInfo.id, results);
    } else {
      console.warn('[PromptTester] No test cases found for prompt:', promptInfo.id);
    }
  }
  
  // Summary
  let totalTests = 0;
  let totalPassed = 0;
  
  for (const [promptId, results] of allResults) {
    totalTests += results.length;
    totalPassed += results.filter(r => r.passed).length;
  }
  
  console.log('[PromptTester] Regression tests completed:', {
    totalPrompts: prompts.length,
    totalTests,
    totalPassed,
    passRate: ((totalPassed / totalTests) * 100).toFixed(1) + '%',
  });
  
  return allResults;
}
