/**
 * Prompt Template Registration Module
 * 
 * Central initialization point for registering all prompt templates
 * with the prompt registry. This ensures all prompts are available
 * when the AI service attempts to use them.
 */

import { getPromptRegistry } from '../prompt-registry';
import { safetyCheckPromptTemplate, quickSafetyCheckPromptTemplate } from './safety/risk-assessment';
import { cptSuggestionPromptTemplate } from './billing/cpt-suggestion';
import { diagnosisExtractionPromptTemplate } from './billing/diagnosis-extraction';
import { treatmentProgressPromptTemplate } from './clinical/treatment-progress';

/**
 * Track initialization state to prevent double registration
 */
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Register all prompt templates with the prompt registry
 */
export async function registerAllPrompts(): Promise<void> {
  // Prevent double initialization
  if (isInitialized) {
    console.log('[PromptInitialization] Prompts already registered, skipping');
    return;
  }
  
  // If initialization is in progress, wait for it
  if (initializationPromise) {
    console.log('[PromptInitialization] Registration in progress, waiting...');
    return initializationPromise;
  }
  
  // Start initialization
  initializationPromise = performRegistration();
  
  try {
    await initializationPromise;
    isInitialized = true;
    console.log('[PromptInitialization] All prompts registered successfully');
  } catch (error) {
    console.error('[PromptInitialization] Failed to register prompts:', error);
    // Reset state on failure
    initializationPromise = null;
    throw error;
  }
}

/**
 * Perform the actual registration
 */
async function performRegistration(): Promise<void> {
  const startTime = Date.now();
  console.log('[PromptInitialization] Starting prompt registration');
  
  const registry = getPromptRegistry();
  const promptsToRegister = [
    // Safety prompts
    { name: 'Safety Check Comprehensive', template: safetyCheckPromptTemplate },
    { name: 'Quick Safety Screen', template: quickSafetyCheckPromptTemplate },
    
    // Billing prompts  
    { name: 'CPT Code Suggestion', template: cptSuggestionPromptTemplate },
    { name: 'Diagnosis Extraction', template: diagnosisExtractionPromptTemplate },
    
    // Clinical prompts
    { name: 'Treatment Progress', template: treatmentProgressPromptTemplate },
  ];
  
  const registrationResults: Array<{ name: string; id: string; success: boolean; error?: string }> = [];
  
  for (const { name, template } of promptsToRegister) {
    try {
      console.log(`[PromptInitialization] Registering: ${name} (${template.metadata.id})`);
      registry.register(template);
      
      registrationResults.push({
        name,
        id: template.metadata.id,
        success: true
      });
      
      console.log(`[PromptInitialization] ✓ Registered: ${name}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[PromptInitialization] ✗ Failed to register ${name}:`, errorMessage);
      
      registrationResults.push({
        name,
        id: template.metadata.id,
        success: false,
        error: errorMessage
      });
    }
  }
  
  // Log summary
  const successful = registrationResults.filter(r => r.success).length;
  const failed = registrationResults.filter(r => !r.success).length;
  const totalTime = Date.now() - startTime;
  
  console.log(`[PromptInitialization] Registration complete in ${totalTime}ms:`);
  console.log(`[PromptInitialization] - Successful: ${successful}`);
  console.log(`[PromptInitialization] - Failed: ${failed}`);
  
  if (failed > 0) {
    console.error('[PromptInitialization] Failed registrations:', 
      registrationResults.filter(r => !r.success).map(r => `${r.name}: ${r.error}`));
  }
  
  // Verify registry state
  const registryStats = registry.getStats();
  console.log('[PromptInitialization] Registry stats:', {
    totalPrompts: registryStats.totalPrompts,
    totalVersions: registryStats.totalVersions,
    cacheSize: registryStats.cacheSize
  });
  
  // List all registered prompts for verification
  const allPrompts = registry.list();
  console.log('[PromptInitialization] Registered prompts:', 
    allPrompts.map(p => `${p.id} (latest: ${p.latestVersion})`));
  
  if (failed > 0) {
    throw new Error(`Failed to register ${failed} prompt templates`);
  }
}

/**
 * Reset prompt registration state (useful for testing)
 */
export function resetPromptRegistration(): void {
  console.log('[PromptInitialization] Resetting prompt registration state');
  isInitialized = false;
  initializationPromise = null;
  
  // Also reset the prompt registry itself
  const registry = getPromptRegistry();
  registry.clearCache();
  
  console.log('[PromptInitialization] Reset complete');
}

/**
 * Check if prompts are initialized
 */
export function arePromptsInitialized(): boolean {
  return isInitialized;
}

/**
 * Get initialization status
 */
export function getInitializationStatus(): {
  initialized: boolean;
  inProgress: boolean;
  stats?: ReturnType<typeof getPromptRegistry.prototype.getStats>;
} {
  const registry = getPromptRegistry();
  
  return {
    initialized: isInitialized,
    inProgress: initializationPromise !== null,
    stats: isInitialized ? registry.getStats() : undefined
  };
}

/**
 * Verify that all expected prompts are registered for the given pipeline types
 */
export function verifyPromptAvailability(pipelineTypes: string[]): {
  available: string[];
  missing: string[];
  errors: Array<{ pipelineType: string; error: string }>;
} {
  const registry = getPromptRegistry();
  const available: string[] = [];
  const missing: string[] = [];
  const errors: Array<{ pipelineType: string; error: string }> = [];
  
  // Pipeline type to prompt ID mapping (should match CoreAIService)
  const pipelineToPromptMap: Record<string, string> = {
    safety_check: 'safety-check-comprehensive',
    billing_cpt: 'billing-cpt-suggestion',
    billing_icd10: 'billing-diagnosis-extraction',
    treatment_progress: 'clinical-treatment-progress', // Fixed mapping!
    chat_with_chart: 'chat-with-chart'
  };
  
  for (const pipelineType of pipelineTypes) {
    const promptId = pipelineToPromptMap[pipelineType];
    
    if (!promptId) {
      errors.push({ 
        pipelineType, 
        error: `No prompt mapping found for pipeline type: ${pipelineType}` 
      });
      continue;
    }
    
    try {
      if (registry.has(promptId)) {
        available.push(pipelineType);
      } else {
        missing.push(pipelineType);
      }
    } catch (error) {
      errors.push({ 
        pipelineType, 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  return { available, missing, errors };
}
