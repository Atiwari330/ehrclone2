/**
 * Diagnosis Extraction Prompt Template
 * 
 * Extracts and suggests ICD-10 diagnosis codes from therapy session transcripts
 * and patient context for accurate billing and clinical documentation.
 */

import { PromptTemplate, PromptCategory } from '@/lib/ai/types/prompt-template';
import { billingOutputSchema } from '@/lib/ai/schemas/billing';

/**
 * Variables for diagnosis extraction
 */
const diagnosisExtractionVariables = [
  {
    name: 'sessionTranscript',
    description: 'The therapy session transcript containing clinical observations',
    required: true,
  },
  {
    name: 'patientContext',
    description: 'Patient demographics, history, and existing diagnoses',
    required: true,
  },
  {
    name: 'existingDiagnoses',
    description: 'Currently documented diagnoses for the patient',
    required: true,
  },
  {
    name: 'assessmentScores',
    description: 'Recent PHQ-9, GAD-7, or other assessment results',
    required: false,
  },
  {
    name: 'treatmentHistory',
    description: 'Previous treatments and their effectiveness',
    required: false,
  },
];

/**
 * Main diagnosis extraction prompt template
 */
export const diagnosisExtractionPromptTemplate: PromptTemplate = {
  metadata: {
    id: 'billing-diagnosis-extraction',
    name: 'ICD-10 Diagnosis Code Extraction',
    description: 'Extracts and validates ICD-10 diagnosis codes from clinical content',
    category: PromptCategory.BILLING,
    version: '1.0.0',
    createdAt: new Date(),
    author: 'AI Pipeline Infrastructure',
    tags: ['billing', 'icd-10', 'diagnosis', 'mental-health', 'coding'],
    estimatedTokens: {
      min: 2000,
      max: 3500,
      typical: 2500,
    },
  },

  template: `You are a clinical coding specialist with expertise in mental health ICD-10 diagnosis coding. Analyze the session content to identify and validate appropriate diagnosis codes.

<session_transcript>
{{sessionTranscript}}
</session_transcript>

<patient_context>
{{patientContext}}
</patient_context>

<existing_diagnoses>
{{existingDiagnoses}}
</existing_diagnoses>

{{#if assessmentScores}}
<assessment_scores>
{{assessmentScores}}
</assessment_scores>
{{/if}}

{{#if treatmentHistory}}
<treatment_history>
{{treatmentHistory}}
</treatment_history>
{{/if}}

## Common Mental Health ICD-10 Codes

### Depressive Disorders:
- **F32.0**: Major depressive disorder, single episode, mild
- **F32.1**: Major depressive disorder, single episode, moderate
- **F32.2**: Major depressive disorder, single episode, severe without psychotic features
- **F32.3**: Major depressive disorder, single episode, severe with psychotic features
- **F33.0**: Major depressive disorder, recurrent, mild
- **F33.1**: Major depressive disorder, recurrent, moderate
- **F33.2**: Major depressive disorder, recurrent severe without psychotic features
- **F34.1**: Dysthymic disorder (Persistent depressive disorder)

### Anxiety Disorders:
- **F41.0**: Panic disorder without agoraphobia
- **F41.1**: Generalized anxiety disorder
- **F41.9**: Anxiety disorder, unspecified
- **F40.10**: Social phobia, unspecified
- **F40.01**: Agoraphobia with panic disorder
- **F40.02**: Agoraphobia without panic disorder

### PTSD and Stress-Related:
- **F43.10**: Post-traumatic stress disorder, unspecified
- **F43.11**: Post-traumatic stress disorder, acute
- **F43.12**: Post-traumatic stress disorder, chronic
- **F43.0**: Acute stress reaction
- **F43.20**: Adjustment disorder, unspecified

### Bipolar and Related:
- **F31.9**: Bipolar disorder, unspecified
- **F31.0**: Bipolar disorder, current episode hypomanic
- **F31.1**: Bipolar disorder, current episode manic without psychotic features
- **F31.2**: Bipolar disorder, current episode manic with psychotic features
- **F31.3**: Bipolar disorder, current episode mild or moderate depression
- **F31.4**: Bipolar disorder, current episode severe depression without psychotic features

### Other Common Codes:
- **F90.0**: ADHD, predominantly inattentive type
- **F90.1**: ADHD, predominantly hyperactive type
- **F90.2**: ADHD, combined type
- **F42.9**: Obsessive-compulsive disorder
- **F60.3**: Borderline personality disorder
- **F10.20**: Alcohol use disorder, uncomplicated
- **F12.20**: Cannabis use disorder, uncomplicated

## Analysis Instructions

1. **Symptom Identification**:
   - Extract specific symptoms mentioned in session
   - Note duration and severity indicators
   - Identify functional impairment
   - Consider DSM-5 criteria alignment

2. **Diagnosis Validation**:
   - Verify existing diagnoses still apply
   - Check for symptom changes or remission
   - Identify potential new diagnoses
   - Consider differential diagnoses

3. **Severity Assessment**:
   - Use clinical indicators for severity
   - Consider assessment scores if available
   - Note functional impact on daily life
   - Apply appropriate severity specifiers

4. **Coding Precision**:
   - Use most specific code available
   - Include all relevant specifiers
   - Consider comorbid conditions
   - Verify code is billable/valid

5. **Documentation Support**:
   - Ensure clinical evidence supports each code
   - Note supporting statements from transcript
   - Identify any documentation gaps
   - Suggest additional assessments if needed

## Response Format

Provide comprehensive diagnosis analysis with:

1. **Primary Diagnosis**: Main focus of treatment
2. **Secondary Diagnoses**: Comorbid conditions
3. **Rule Out Diagnoses**: Conditions being evaluated
4. **Supporting Evidence**: Direct quotes and observations
5. **Severity Indicators**: Mild, moderate, severe justification
6. **Changes from Previous**: New, resolved, or modified diagnoses
7. **Documentation Quality**: Completeness assessment

## Important Coding Guidelines

- Use the most specific code available
- "Unspecified" codes should be last resort
- Severity must be clinically justified
- Personal history codes (Z codes) for past conditions
- Don't code suspected conditions as confirmed
- Rule out conditions use different codes
- Some codes require additional characters for laterality/episode

Analyze the clinical content carefully and provide accurate ICD-10 diagnosis recommendations.`,

  variables: diagnosisExtractionVariables,

  outputSchema: billingOutputSchema,

  executionConfig: {
    model: 'gpt-4',
    temperature: 0.2, // Low temperature for consistent diagnosis coding
    maxTokens: 2000,
    jsonMode: true,
    systemMessage: 'You are a certified clinical coding specialist with expertise in mental health ICD-10 diagnosis coding. Accuracy and clinical validity are essential.',
  },

  examples: [
    {
      name: 'Depression with anxiety',
      input: {
        sessionTranscript: 'Patient reports persistent low mood for the past 3 months. "I just can\'t enjoy anything anymore." Sleep disrupted, appetite decreased. Also experiencing excessive worry about work performance and health. PHQ-9 score of 15 indicates moderate depression.',
        patientContext: 'Jane Smith, 42, referred for depression evaluation',
        existingDiagnoses: 'None documented',
        assessmentScores: 'PHQ-9: 15 (moderate), GAD-7: 12 (moderate)',
      },
      expectedOutput: {
        success: true,
        confidence: { score: 0.9, reasoning: 'Clear symptoms with assessment validation' },
        sessionInfo: {
          sessionId: 'session-789',
          sessionDate: new Date(),
          duration: 50,
          modality: 'in_person',
          sessionType: 'follow_up',
        },
        cptCodes: [],
        icd10Codes: [
          {
            code: 'F33.1',
            description: 'Major depressive disorder, recurrent, moderate',
            confidence: { score: 0.9 },
            supportingEvidence: 'Persistent low mood 3 months, anhedonia, sleep/appetite changes, PHQ-9=15',
          },
          {
            code: 'F41.1',
            description: 'Generalized anxiety disorder',
            confidence: { score: 0.85 },
            supportingEvidence: 'Excessive worry about work and health, GAD-7=12',
          },
        ],
        modifiers: [],
        totalUnits: 1,
        documentationComplete: {
          complete: true,
          missingElements: [],
          complianceScore: 90,
          recommendations: ['Document prior episodes for recurrent classification'],
        },
        medicalNecessity: {
          justified: true,
          rationale: 'Moderate symptoms with functional impairment requiring treatment',
          supportingDiagnoses: ['Major depressive disorder', 'Generalized anxiety disorder'],
          clinicalIndicators: ['PHQ-9=15', 'GAD-7=12', 'Functional impairment'],
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
      name: 'PTSD with substance use',
      input: {
        sessionTranscript: 'Patient continues to experience nightmares and flashbacks from combat trauma. Hypervigilant in public spaces. Reports drinking 6-8 beers daily to "numb the memories." Previously diagnosed with PTSD 2 years ago.',
        patientContext: 'Michael Johnson, 35, Veteran',
        existingDiagnoses: 'F43.10 - PTSD, unspecified',
        treatmentHistory: 'CPT therapy for PTSD, discontinued after 3 sessions',
      },
      expectedOutput: {
        success: true,
        confidence: { score: 0.95, reasoning: 'Documented PTSD with clear substance use pattern' },
        sessionInfo: {
          sessionId: 'session-101',
          sessionDate: new Date(),
          duration: 60,
          modality: 'in_person',
          sessionType: 'follow_up',
        },
        cptCodes: [],
        icd10Codes: [
          {
            code: 'F43.12',
            description: 'Post-traumatic stress disorder, chronic',
            confidence: { score: 0.95 },
            supportingEvidence: 'Combat trauma, ongoing nightmares/flashbacks, hypervigilance, 2+ years',
          },
          {
            code: 'F10.20',
            description: 'Alcohol use disorder, moderate',
            confidence: { score: 0.9 },
            supportingEvidence: 'Daily drinking 6-8 beers, using to cope with trauma symptoms',
          },
        ],
        modifiers: [],
        totalUnits: 1,
        documentationComplete: {
          complete: true,
          missingElements: [],
          complianceScore: 95,
          recommendations: ['Consider adding severity specifier for alcohol use'],
        },
        medicalNecessity: {
          justified: true,
          rationale: 'Chronic PTSD with comorbid substance use requiring integrated treatment',
          supportingDiagnoses: ['PTSD chronic', 'Alcohol use disorder'],
          clinicalIndicators: ['Trauma symptoms', 'Daily alcohol use', 'Functional impairment'],
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
 * Helper function to validate ICD-10 code format
 */
export function validateICD10Format(code: string): boolean {
  // Basic ICD-10 format: Letter + 2 digits, optionally followed by . and up to 4 more characters
  const icd10Regex = /^[A-Z]\d{2}(\.\d{1,4})?$/;
  const isValid = icd10Regex.test(code);
  
  console.log('[Diagnosis-Extraction] ICD-10 format validation:', {
    code,
    isValid,
  });
  
  return isValid;
}

/**
 * Map severity descriptors to ICD-10 severity codes
 */
export function mapSeverityToCode(
  baseCode: string,
  severity: 'mild' | 'moderate' | 'severe',
  disorder: string
): string {
  const severityMappings: Record<string, Record<string, string>> = {
    'depression_single': {
      'mild': 'F32.0',
      'moderate': 'F32.1',
      'severe': 'F32.2',
    },
    'depression_recurrent': {
      'mild': 'F33.0',
      'moderate': 'F33.1',
      'severe': 'F33.2',
    },
    'bipolar_depression': {
      'mild': 'F31.3',
      'moderate': 'F31.3',
      'severe': 'F31.4',
    },
  };
  
  // Determine disorder type from base code
  let disorderType = '';
  if (baseCode.startsWith('F32')) disorderType = 'depression_single';
  else if (baseCode.startsWith('F33')) disorderType = 'depression_recurrent';
  else if (baseCode.startsWith('F31')) disorderType = 'bipolar_depression';
  
  const mappedCode = severityMappings[disorderType]?.[severity] || baseCode;
  
  console.log('[Diagnosis-Extraction] Severity mapping:', {
    baseCode,
    severity,
    disorder,
    mappedCode,
  });
  
  return mappedCode;
}

/**
 * Check if diagnosis requires additional documentation
 */
export function checkDocumentationRequirements(code: string): string[] {
  const requirements: Record<string, string[]> = {
    'F43.1': ['Trauma description', 'Symptom duration', 'Functional impact'],
    'F31': ['Mood episode history', 'Current episode type', 'Psychotic features presence'],
    'F60.3': ['Interpersonal patterns', 'Identity disturbance', 'Impulsivity examples'],
  };
  
  const baseCode = code.substring(0, 3);
  const required = requirements[baseCode] || requirements[code] || [];
  
  if (required.length > 0) {
    console.log('[Diagnosis-Extraction] Documentation requirements:', {
      code,
      requirements: required,
    });
  }
  
  return required;
}
