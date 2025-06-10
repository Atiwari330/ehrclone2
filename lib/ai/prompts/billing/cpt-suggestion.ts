/**
 * CPT Code Suggestion Prompt Template
 * 
 * Analyzes therapy session transcripts and context to suggest appropriate CPT codes
 * for mental health billing with confidence scores and documentation requirements.
 */

import { PromptTemplate, PromptCategory } from '@/lib/ai/types/prompt-template';
import { billingOutputSchema } from '@/lib/ai/schemas/billing';

/**
 * Variables for CPT code suggestion
 */
const cptSuggestionVariables = [
  {
    name: 'sessionInfo',
    description: 'Session metadata including date, duration, modality, and type',
    required: true,
  },
  {
    name: 'sessionTranscript',
    description: 'The therapy session transcript',
    required: true,
  },
  {
    name: 'patientContext',
    description: 'Patient demographics and insurance information',
    required: true,
  },
  {
    name: 'providerInfo',
    description: 'Provider credentials and specialization',
    required: true,
  },
  {
    name: 'previousBilling',
    description: 'Recent billing history for consistency',
    required: false,
  },
];

/**
 * Main CPT code suggestion prompt template
 */
export const cptSuggestionPromptTemplate: PromptTemplate = {
  metadata: {
    id: 'billing-cpt-suggestion',
    name: 'CPT Code Suggestion for Mental Health',
    description: 'Suggests appropriate CPT codes based on session characteristics and documentation',
    category: PromptCategory.BILLING,
    version: '1.0.0',
    createdAt: new Date(),
    author: 'AI Pipeline Infrastructure',
    tags: ['billing', 'cpt-codes', 'mental-health', 'reimbursement'],
    estimatedTokens: {
      min: 1500,
      max: 3000,
      typical: 2000,
    },
  },

  template: `You are a mental health billing specialist with expertise in CPT coding for psychotherapy services. Analyze the session information to suggest the most appropriate CPT codes with high accuracy.

<session_info>
{{sessionInfo}}
</session_info>

<session_transcript>
{{sessionTranscript}}
</session_transcript>

<patient_context>
{{patientContext}}
</patient_context>

<provider_info>
{{providerInfo}}
</provider_info>

{{#if previousBilling}}
<previous_billing>
{{previousBilling}}
</previous_billing>
{{/if}}

## CPT Code Guidelines for Mental Health

### Individual Psychotherapy Codes:
- **90832**: 16-37 minutes of psychotherapy
- **90834**: 38-52 minutes of psychotherapy  
- **90837**: 53+ minutes of psychotherapy

### With E&M (Evaluation & Management):
- **90833**: 16-37 min psychotherapy add-on to E&M
- **90836**: 38-52 min psychotherapy add-on to E&M
- **90838**: 53+ min psychotherapy add-on to E&M

### Initial Evaluation Codes:
- **90791**: Psychiatric diagnostic evaluation (no medical services)
- **90792**: Psychiatric diagnostic evaluation with medical services

### Group/Family Codes:
- **90847**: Family therapy with patient present
- **90846**: Family therapy without patient
- **90853**: Group psychotherapy

### Crisis/Interactive Codes:
- **90839**: Crisis therapy, first 60 minutes
- **90840**: Crisis therapy, each additional 30 minutes
- **90785**: Interactive complexity add-on

### Telehealth Modifiers:
- **GT**: Via interactive audio and video
- **95**: Synchronous telemedicine via real-time interactive audio/video

## Analysis Instructions

1. **Duration Analysis**:
   - Extract exact session duration from transcript/notes
   - Account for documentation time if applicable
   - Consider time-based billing rules

2. **Service Type Identification**:
   - Initial evaluation vs. follow-up therapy
   - Individual vs. family/couple session
   - Crisis intervention indicators
   - Medical services involvement

3. **Complexity Assessment**:
   - Interactive complexity factors (young age, disability, third party)
   - Crisis elements requiring immediate attention
   - Coordination with other providers

4. **Modality Considerations**:
   - In-person vs. telehealth
   - Audio-only limitations
   - Geographic/regulatory requirements

5. **Documentation Requirements**:
   - Verify all required elements present
   - Note any missing documentation
   - Suggest documentation improvements

## Response Format

Provide a comprehensive billing analysis with:

1. **Primary CPT Code**: Most appropriate code with rationale
2. **Alternative Codes**: Other valid options with pros/cons
3. **Modifiers**: Required modifiers with explanations
4. **Documentation Check**: Completeness assessment
5. **Medical Necessity**: Justification based on content
6. **Compliance Notes**: Any billing risks or concerns
7. **Reimbursement Estimate**: Typical rates if available

## Important Billing Rules

- Time must be documented for time-based codes
- Crisis codes require immediate safety concerns
- E&M codes need medical decision-making documentation
- Group therapy requires multiple patients
- Interactive complexity needs specific criteria
- Telehealth must meet parity requirements

Analyze the session carefully and provide accurate CPT code recommendations.`,

  variables: cptSuggestionVariables,

  outputSchema: billingOutputSchema,

  executionConfig: {
    model: 'gpt-4',
    temperature: 0.1, // Very low temperature for consistent billing codes
    maxTokens: 1500,
    jsonMode: true,
    systemMessage: 'You are a certified medical billing specialist with expertise in mental health CPT coding. Accuracy and compliance are paramount.',
  },

  examples: [
    {
      name: 'Standard individual therapy session',
      input: {
        sessionInfo: {
          date: '2024-03-15',
          duration: 45,
          modality: 'in_person',
          type: 'follow_up',
        },
        sessionTranscript: 'Patient discussed ongoing anxiety about work. Explored coping strategies including mindfulness techniques. Patient reports improvement in sleep patterns.',
        patientContext: 'John Doe, 35, diagnosed with Generalized Anxiety Disorder',
        providerInfo: 'Dr. Smith, Licensed Clinical Psychologist',
      },
      expectedOutput: {
        success: true,
        confidence: { score: 0.95, reasoning: 'Clear individual therapy session with documented time' },
        sessionInfo: {
          sessionId: 'session-123',
          sessionDate: new Date('2024-03-15'),
          duration: 45,
          modality: 'in_person',
          sessionType: 'follow_up',
        },
        cptCodes: [
          {
            code: '90834',
            description: 'Individual psychotherapy, 45 minutes',
            confidence: { score: 0.95 },
            primaryCode: true,
            requiredDocumentation: ['Session start/end time', 'Treatment interventions', 'Patient response'],
            units: 1,
          },
        ],
        icd10Codes: [],
        modifiers: [],
        totalUnits: 1,
        documentationComplete: {
          complete: true,
          missingElements: [],
          complianceScore: 95,
          recommendations: ['Consider adding specific intervention outcomes'],
        },
        medicalNecessity: {
          justified: true,
          rationale: 'Ongoing treatment for diagnosed anxiety disorder',
          supportingDiagnoses: ['Generalized Anxiety Disorder'],
          clinicalIndicators: ['Sleep improvement', 'Anxiety management'],
          confidence: { score: 0.9 },
        },
        compliance: {
          compliant: true,
          issues: [],
          auditRisk: 'low',
        },
        additionalDocumentationRequired: false,
      },
    },
    {
      name: 'Telehealth crisis session',
      input: {
        sessionInfo: {
          date: '2024-03-15',
          duration: 75,
          modality: 'telehealth_video',
          type: 'crisis',
        },
        sessionTranscript: 'Patient called in crisis state with suicidal ideation. Conducted safety assessment. Created safety plan. Patient contracted for safety.',
        patientContext: 'Sarah Johnson, 28, Major Depressive Disorder',
        providerInfo: 'Dr. Jones, Psychiatrist',
      },
      expectedOutput: {
        success: true,
        confidence: { score: 0.9, reasoning: 'Crisis intervention clearly documented' },
        sessionInfo: {
          sessionId: 'session-456',
          sessionDate: new Date('2024-03-15'),
          duration: 75,
          modality: 'telehealth_video',
          sessionType: 'crisis',
        },
        cptCodes: [
          {
            code: '90839',
            description: 'Crisis psychotherapy, first 60 minutes',
            confidence: { score: 0.9 },
            primaryCode: true,
            requiredDocumentation: ['Crisis nature', 'Safety assessment', 'Intervention plan'],
            units: 1,
          },
          {
            code: '90840',
            description: 'Crisis psychotherapy, additional 30 minutes',
            confidence: { score: 0.9 },
            primaryCode: false,
            requiredDocumentation: ['Continued crisis intervention'],
            units: 1,
          },
        ],
        icd10Codes: [],
        modifiers: [
          {
            code: '95',
            description: 'Synchronous telemedicine service',
            reason: 'Session conducted via video',
            confidence: { score: 0.95 },
          },
        ],
        totalUnits: 2,
        documentationComplete: {
          complete: true,
          missingElements: [],
          complianceScore: 100,
          recommendations: [],
        },
        medicalNecessity: {
          justified: true,
          rationale: 'Immediate intervention required for suicidal ideation',
          supportingDiagnoses: ['Major Depressive Disorder'],
          clinicalIndicators: ['Suicidal ideation', 'Crisis state'],
          confidence: { score: 0.95 },
        },
        compliance: {
          compliant: true,
          issues: [],
          auditRisk: 'low',
        },
        additionalDocumentationRequired: false,
      },
    },
  ],

  previousVersionId: undefined,
};

/**
 * Helper function to estimate complexity of billing scenario
 */
export function assessBillingComplexity(
  duration: number,
  sessionType: string,
  hasMultipleParticipants: boolean,
  hasMedicalComponent: boolean
): 'simple' | 'moderate' | 'complex' {
  let complexity = 0;
  
  // Duration factors
  if (duration > 60) complexity++;
  if (duration < 30 || duration > 90) complexity++;
  
  // Session type factors
  if (sessionType === 'crisis') complexity += 2;
  if (sessionType === 'initial') complexity++;
  
  // Other factors
  if (hasMultipleParticipants) complexity++;
  if (hasMedicalComponent) complexity++;
  
  console.log('[CPT-Suggestion] Billing complexity assessment:', {
    duration,
    sessionType,
    hasMultipleParticipants,
    hasMedicalComponent,
    complexityScore: complexity,
  });
  
  if (complexity >= 3) return 'complex';
  if (complexity >= 1) return 'moderate';
  return 'simple';
}

/**
 * Validate CPT code against session characteristics
 */
export function validateCPTCode(
  code: string,
  duration: number,
  modality: string
): { valid: boolean; reason?: string } {
  // Duration-based validation
  if (code === '90832' && (duration < 16 || duration > 37)) {
    return { valid: false, reason: 'Duration not within 16-37 minute range' };
  }
  if (code === '90834' && (duration < 38 || duration > 52)) {
    return { valid: false, reason: 'Duration not within 38-52 minute range' };
  }
  if (code === '90837' && duration < 53) {
    return { valid: false, reason: 'Duration must be 53+ minutes' };
  }
  
  // Telehealth validation
  if (modality.includes('telehealth') && !['90832', '90834', '90837', '90791'].includes(code)) {
    console.warn('[CPT-Suggestion] Non-standard telehealth code:', code);
  }
  
  console.log('[CPT-Suggestion] Code validation:', {
    code,
    duration,
    modality,
    valid: true,
  });
  
  return { valid: true };
}
