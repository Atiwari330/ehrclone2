/**
 * Test Cases for Prompt Templates
 * 
 * Comprehensive test cases for each prompt template category including
 * edge cases, expected outputs, and validation criteria.
 */

import { PromptTestCase } from './prompt-tester';
import { SafetyCheckOutput } from '@/lib/ai/schemas/safety-check';
import { BillingOutput } from '@/lib/ai/schemas/billing';
import { TreatmentProgressOutput } from '@/lib/ai/schemas/treatment-progress';

/**
 * Safety Check Test Cases
 */
export const safetyCheckTestCases: PromptTestCase[] = [
  {
    name: 'High suicide risk detection',
    description: 'Should identify immediate suicide risk with appropriate urgency',
    input: {
      patientContext: 'John Doe, 45, Major Depressive Disorder, previous suicide attempt 2 years ago',
      sessionTranscript: 'Patient states: "I can\'t do this anymore. I\'ve been thinking about ending it all. I have my father\'s gun in the closet and I\'ve been looking at it every night."',
      assessmentHistory: 'PHQ-9: 22 (severe), increased from 18 last week',
    },
    outputValidation: (output: SafetyCheckOutput) => {
      return output.riskAssessment.overallRisk === 'critical' &&
             output.riskAssessment.imminentDanger === true &&
             output.alerts.length > 0 &&
             output.alerts[0].severity === 'critical';
    },
    maxTokens: 4000,
    maxLatency: 3000,
    tags: ['safety', 'critical', 'suicide'],
  },
  {
    name: 'Substance use relapse risk',
    description: 'Should identify relapse risk indicators',
    input: {
      patientContext: 'Sarah Johnson, 32, Alcohol Use Disorder, 6 months sober',
      sessionTranscript: 'Patient reports: "My partner left me last week. I drove by the liquor store three times yesterday. I didn\'t go in but the urge was really strong."',
      previousAlerts: 'No previous substance use alerts',
    },
    outputValidation: (output: SafetyCheckOutput) => {
      return output.riskAssessment.overallRisk === 'high' &&
             output.riskIndicators.some(r => r.category === 'substance_use') &&
             output.recommendations.length > 0;
    },
    maxTokens: 3500,
    maxLatency: 2500,
    tags: ['safety', 'substance-use'],
  },
  {
    name: 'Low risk routine session',
    description: 'Should correctly identify low risk in routine therapy',
    input: {
      patientContext: 'Emily Chen, 28, Generalized Anxiety Disorder, stable on medication',
      sessionTranscript: 'Patient discusses work stress and using coping strategies effectively. "The breathing exercises really help when I feel anxious."',
      assessmentHistory: 'GAD-7: 8 (mild), stable for 3 months',
    },
    outputValidation: (output: SafetyCheckOutput) => {
      return output.riskAssessment.overallRisk === 'low' &&
             output.riskAssessment.imminentDanger === false &&
             output.alerts.length === 0;
    },
    maxTokens: 3000,
    maxLatency: 2000,
    tags: ['safety', 'routine'],
  },
  {
    name: 'Violence risk assessment',
    description: 'Should identify potential violence risk',
    input: {
      patientContext: 'Michael Brown, 35, Intermittent Explosive Disorder',
      sessionTranscript: 'Patient: "My neighbor keeps parking in my spot. I swear if he does it again, I\'m going to slash his tires. Maybe worse. I\'ve had enough of people disrespecting me."',
      assessmentHistory: 'Recent aggressive incidents documented',
    },
    outputValidation: (output: SafetyCheckOutput) => {
      return output.riskIndicators.some(r => r.category === 'violence') &&
             output.riskAssessment.overallRisk !== 'low';
    },
    maxTokens: 3500,
    maxLatency: 2500,
    tags: ['safety', 'violence'],
  },
];

/**
 * Billing Test Cases
 */
export const billingTestCases: PromptTestCase[] = [
  {
    name: 'Standard 45-minute individual therapy',
    description: 'Should suggest CPT 90834 for standard session',
    input: {
      sessionInfo: {
        date: '2024-03-15',
        duration: 45,
        modality: 'in_person',
        type: 'follow_up',
      },
      sessionTranscript: 'Routine therapy session discussing anxiety management techniques.',
      patientContext: 'Jane Smith, established patient with GAD',
      providerInfo: 'Dr. Johnson, Licensed Psychologist',
    },
    outputValidation: (output: BillingOutput) => {
      return output.cptCodes.some(c => c.code === '90834') &&
             output.cptCodes[0].confidence.score > 0.8;
    },
    maxTokens: 2500,
    maxLatency: 2000,
    tags: ['billing', 'standard'],
  },
  {
    name: 'Telehealth crisis intervention',
    description: 'Should identify crisis codes with telehealth modifier',
    input: {
      sessionInfo: {
        date: '2024-03-15',
        duration: 75,
        modality: 'telehealth_video',
        type: 'crisis',
      },
      sessionTranscript: 'Patient called in crisis with suicidal ideation. Conducted safety assessment and created safety plan.',
      patientContext: 'John Doe, Major Depressive Disorder',
      providerInfo: 'Dr. Smith, Psychiatrist',
    },
    outputValidation: (output: BillingOutput) => {
      return output.cptCodes.some(c => c.code === '90839') &&
             output.modifiers.some(m => m.code === '95' || m.code === 'GT');
    },
    maxTokens: 3000,
    maxLatency: 2500,
    tags: ['billing', 'crisis', 'telehealth'],
  },
  {
    name: 'Initial psychiatric evaluation',
    description: 'Should identify 90791 for initial eval',
    input: {
      sessionInfo: {
        date: '2024-03-15',
        duration: 60,
        modality: 'in_person',
        type: 'initial',
      },
      sessionTranscript: 'Initial psychiatric evaluation. Comprehensive history taken, mental status exam performed.',
      patientContext: 'New patient, referred for depression evaluation',
      providerInfo: 'Dr. Lee, Psychiatrist',
    },
    outputValidation: (output: BillingOutput) => {
      return output.cptCodes.some(c => c.code === '90791');
    },
    maxTokens: 2500,
    maxLatency: 2000,
    tags: ['billing', 'initial-eval'],
  },
  {
    name: 'ICD-10 diagnosis extraction',
    description: 'Should extract appropriate diagnosis codes',
    input: {
      sessionTranscript: 'Patient presents with persistent low mood, anhedonia, sleep disturbance for 3+ months. Also reports excessive worry about multiple life domains.',
      patientContext: 'Alice Johnson, 42, referred for mood evaluation',
      existingDiagnoses: 'None documented',
      assessmentScores: 'PHQ-9: 16 (moderately severe), GAD-7: 12 (moderate)',
    },
    outputValidation: (output: BillingOutput) => {
      return output.icd10Codes.some(c => c.code.startsWith('F33')) && // Recurrent depression
             output.icd10Codes.some(c => c.code === 'F41.1'); // GAD
    },
    maxTokens: 3000,
    maxLatency: 2500,
    tags: ['billing', 'diagnosis'],
  },
];

/**
 * Treatment Progress Test Cases
 */
export const treatmentProgressTestCases: PromptTestCase[] = [
  {
    name: 'Good progress toward goals',
    description: 'Should identify positive progress indicators',
    input: {
      patientContext: 'Maria Garcia, 30, Depression, in treatment 3 months',
      treatmentPlan: 'Goals: 1) Reduce PHQ-9 to <10, 2) Return to work, 3) Improve sleep',
      sessionTranscripts: 'Session notes: Patient reports working 3 days/week, sleeping 6-7 hours, mood improved',
      assessmentHistory: 'PHQ-9: Baseline 18, Current 11',
    },
    outputValidation: (output: TreatmentProgressOutput) => {
      return output.effectiveness.overallEffectiveness.includes('effective') &&
             output.goalProgress.some(g => g.progressPercentage > 50);
    },
    maxTokens: 3500,
    maxLatency: 3000,
    tags: ['progress', 'positive'],
  },
  {
    name: 'Identify treatment barriers',
    description: 'Should identify barriers to progress',
    input: {
      patientContext: 'Robert Chen, 45, PTSD, minimal improvement',
      treatmentPlan: 'Goals: 1) Reduce nightmares, 2) Decrease avoidance, 3) Improve social functioning',
      sessionTranscripts: 'Patient missed 3 sessions, reports "therapy isn\'t helping", continues to avoid triggers',
      previousProgress: 'No significant improvement in 2 months',
    },
    outputValidation: (output: TreatmentProgressOutput) => {
      return output.barriers.length > 0 &&
             output.barriers.some(b => b.impact === 'high') &&
             output.treatmentAdjustments.length > 0;
    },
    maxTokens: 3500,
    maxLatency: 3000,
    tags: ['progress', 'barriers'],
  },
  {
    name: 'Mixed progress assessment',
    description: 'Should identify both progress and challenges',
    input: {
      patientContext: 'Lisa Wong, 38, Bipolar Disorder, stable on medication',
      treatmentPlan: 'Goals: 1) Mood stability, 2) Medication compliance, 3) Return to full-time work',
      sessionTranscripts: 'Mood stable for 6 weeks, taking medication consistently, but still only working part-time due to anxiety about stress',
      assessmentHistory: 'Mood charts show stability, GAD-7 elevated at 14',
    },
    outputValidation: (output: TreatmentProgressOutput) => {
      return output.goalProgress.some(g => g.status === 'achieved') &&
             output.goalProgress.some(g => g.status === 'in_progress') &&
             output.progressIndicators.length > 0;
    },
    maxTokens: 3500,
    maxLatency: 3000,
    tags: ['progress', 'mixed'],
  },
];

/**
 * Edge case test scenarios
 */
export const edgeCaseTests: PromptTestCase[] = [
  {
    name: 'Missing required context',
    description: 'Should handle missing patient context gracefully',
    input: {
      sessionTranscript: 'Patient discussed various concerns',
      // Missing patientContext
    },
    outputValidation: (output: any) => {
      return output.errors && output.errors.length > 0;
    },
    maxTokens: 1000,
    maxLatency: 1000,
    tags: ['edge-case', 'validation'],
  },
  {
    name: 'Extremely long transcript',
    description: 'Should handle token limits appropriately',
    input: {
      patientContext: 'Test patient',
      sessionTranscript: 'Lorem ipsum '.repeat(2000), // Very long transcript
      treatmentPlan: 'Standard treatment plan',
    },
    outputValidation: (output: any) => {
      return output.warnings && output.warnings.some((w: string) => w.includes('token'));
    },
    maxTokens: 4000,
    maxLatency: 5000,
    tags: ['edge-case', 'token-limit'],
  },
  {
    name: 'Non-English content',
    description: 'Should handle non-English input appropriately',
    input: {
      patientContext: 'Patient speaks primarily Spanish',
      sessionTranscript: 'El paciente reporta sentirse muy ansioso y preocupado por su trabajo.',
    },
    outputValidation: (output: any) => {
      return output.success === true || 
             (output.warnings && output.warnings.some((w: string) => w.includes('language')));
    },
    maxTokens: 2000,
    maxLatency: 2500,
    tags: ['edge-case', 'language'],
  },
];

/**
 * Performance test cases
 */
export const performanceTests: PromptTestCase[] = [
  {
    name: 'Quick safety screen',
    description: 'Should complete basic safety screen quickly',
    input: {
      sessionTranscript: 'Routine therapy session, no safety concerns mentioned.',
    },
    maxTokens: 1500,
    maxLatency: 1000, // Strict latency requirement
    tags: ['performance', 'quick'],
  },
  {
    name: 'Batch processing simulation',
    description: 'Should handle rapid successive calls',
    input: {
      patientContext: 'Standard patient context',
      sessionTranscript: 'Standard session content for batch testing',
    },
    maxTokens: 2000,
    maxLatency: 1500,
    tags: ['performance', 'batch'],
  },
];

/**
 * Create test suites for each prompt category
 */
export const testSuites = new Map<string, PromptTestCase[]>([
  ['safety-check-comprehensive', safetyCheckTestCases],
  ['safety-check-quick', safetyCheckTestCases.slice(0, 2)], // Subset for quick safety
  ['billing-cpt-suggestion', billingTestCases.filter(tc => !tc.name.includes('diagnosis'))],
  ['billing-diagnosis-extraction', billingTestCases.filter(tc => tc.name.includes('diagnosis'))],
  ['clinical-treatment-progress', treatmentProgressTestCases],
]);

/**
 * Get all test cases for regression testing
 */
export function getAllTestCases(): PromptTestCase[] {
  return [
    ...safetyCheckTestCases,
    ...billingTestCases,
    ...treatmentProgressTestCases,
    ...edgeCaseTests,
    ...performanceTests,
  ];
}

/**
 * Get test cases by tag
 */
export function getTestCasesByTag(tag: string): PromptTestCase[] {
  return getAllTestCases().filter(tc => tc.tags?.includes(tag));
}

/**
 * Get critical test cases (for smoke testing)
 */
export function getCriticalTestCases(): PromptTestCase[] {
  return getAllTestCases().filter(tc => 
    tc.tags?.includes('critical') || 
    tc.tags?.includes('safety') && tc.name.includes('High')
  );
}

console.log('[TestCases] Loaded test suites:', {
  totalSuites: testSuites.size,
  totalTestCases: getAllTestCases().length,
  criticalTests: getCriticalTestCases().length,
  performanceTests: performanceTests.length,
});
