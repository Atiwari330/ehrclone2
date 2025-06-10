/**
 * Safety Check Prompt Template
 * 
 * Comprehensive risk assessment prompt for identifying patient safety concerns
 * including suicide risk, violence, substance abuse, and other safety indicators.
 */

import { PromptTemplate, PromptCategory } from '@/lib/ai/types/prompt-template';
import { safetyCheckOutputSchema } from '@/lib/ai/schemas/safety-check';
import { z } from 'zod';

/**
 * Variables for the safety check prompt
 */
const safetyCheckVariables = [
  {
    name: 'patientContext',
    description: 'Complete patient context including demographics, diagnoses, medications, and history',
    required: true,
  },
  {
    name: 'sessionTranscript',
    description: 'The therapy session transcript to analyze for safety concerns',
    required: true,
  },
  {
    name: 'assessmentHistory',
    description: 'Recent PHQ-9, GAD-7, and other assessment scores',
    required: false,
  },
  {
    name: 'previousAlerts',
    description: 'History of previous safety alerts for context',
    required: false,
  },
];

/**
 * Main safety check prompt template
 */
export const safetyCheckPromptTemplate: PromptTemplate = {
  metadata: {
    id: 'safety-check-comprehensive',
    name: 'Comprehensive Safety Risk Assessment',
    description: 'Analyzes therapy session transcripts and patient context to identify safety risks and generate appropriate alerts',
    category: PromptCategory.SAFETY,
    version: '1.0.0',
    createdAt: new Date(),
    author: 'AI Pipeline Infrastructure',
    tags: ['safety', 'risk-assessment', 'suicide', 'violence', 'substance-use'],
    estimatedTokens: {
      min: 2000,
      max: 4000,
      typical: 3000,
    },
  },

  template: `You are a clinical safety assessment specialist analyzing a therapy session for potential safety risks. Your goal is to identify any indicators of risk to the patient or others and provide actionable clinical recommendations.

<patient_context>
{{patientContext}}
</patient_context>

<session_transcript>
{{sessionTranscript}}
</session_transcript>

{{#if assessmentHistory}}
<assessment_history>
{{assessmentHistory}}
</assessment_history>
{{/if}}

{{#if previousAlerts}}
<previous_alerts>
{{previousAlerts}}
</previous_alerts>
{{/if}}

## Instructions

Analyze the provided information to identify and assess safety risks. Focus on:

1. **Suicide Risk Indicators**
   - Direct statements about self-harm or suicide
   - Expressions of hopelessness, worthlessness, or being a burden
   - Previous attempts or detailed planning
   - Access to means
   - Recent losses or major life changes

2. **Violence Risk Indicators**
   - Threats toward others
   - History of violence
   - Access to weapons
   - Specific targets or plans
   - Escalating anger or aggression

3. **Substance Use Concerns**
   - Current intoxication
   - Increased use or relapse
   - Risky behaviors while using
   - Withdrawal symptoms
   - Impact on medication compliance

4. **Self-Harm Behaviors**
   - Cutting, burning, or other self-injury
   - Eating disorder behaviors
   - Reckless behaviors
   - Self-punishment patterns

5. **Environmental Safety**
   - Unsafe living conditions
   - Domestic violence
   - Neglect or abuse
   - Isolation or lack of support

6. **Medical Safety**
   - Medication non-compliance
   - Medical conditions requiring attention
   - Cognitive impairment affecting safety
   - Physical health emergencies

## Response Format

You MUST respond with valid JSON in this exact structure (do not add any text before or after the JSON):

{
  "success": true,
  "confidence": {
    "score": 0.85,
    "reasoning": "Clear indicators present with sufficient context"
  },
  "riskIndicators": [
    {
      "category": "suicide",
      "indicator": "Description of the risk indicator",
      "context": "Direct quote from session or specific context",
      "confidence": {
        "score": 0.9,
        "reasoning": "Why this confidence level"
      },
      "temporalContext": "present",
      "frequency": "recurring"
    }
  ],
  "riskAssessment": {
    "overallRisk": "high",
    "riskScore": 7,
    "primaryConcern": "suicide",
    "imminentDanger": false,
    "requiresImmediateAction": true,
    "confidence": {
      "score": 0.85,
      "reasoning": "Assessment confidence explanation"
    }
  },
  "alerts": [
    {
      "alertId": "generate-uuid-here",
      "title": "Alert title",
      "description": "Detailed alert description",
      "severity": "high",
      "category": "suicide",
      "triggeringFactors": ["factor1", "factor2"],
      "recommendedActions": ["action1", "action2"],
      "notificationPriority": "urgent"
    }
  ],
  "protectiveFactors": {
    "factors": [
      {
        "factor": "Protective factor description",
        "strength": "moderate",
        "category": "personal"
      }
    ],
    "overallResilience": "moderate"
  },
  "recommendations": [
    {
      "recommendation": "Specific recommendation",
      "priority": "urgent",
      "rationale": "Why this recommendation",
      "confidence": {
        "score": 0.8,
        "reasoning": "Confidence explanation"
      }
    }
  ],
  "followUpRequired": true,
  "nextAssessmentDate": "2024-01-15T10:00:00Z",
  "clinicalNotes": "Additional clinical observations"
}

**CRITICAL**: Use exactly these field names. Do not change capitalization or add spaces.
**Risk Categories**: Use only: "suicide", "self-harm", "violence", "abuse", "substance_use", "medication_non_compliance", "social_isolation", "other"
**Frequency**: Use only: "isolated", "recurring", "escalating"
**Severity Levels**: Use only: "low", "medium", "high", "critical"
**Priority Levels**: Use only: "routine", "urgent", "immediate"

## Important Considerations

- Err on the side of caution - it's better to flag a potential risk than miss one
- Consider both immediate and longer-term risks
- Account for cultural factors that may influence risk expression
- Note any limitations in the assessment (e.g., missing information)
- Prioritize risks by severity and immediacy

## Example Risk Indicators (for reference)

**High Risk Statement**: "I can't do this anymore. I've been thinking about ending it all. I have my father's gun in the closet."
**Medium Risk Statement**: "Sometimes I wonder if everyone would be better off without me."
**Low Risk Statement**: "I've been feeling really down lately, but I know I need to keep going for my kids."

Analyze the session carefully and provide a comprehensive safety assessment.`,

  variables: safetyCheckVariables,

  outputSchema: safetyCheckOutputSchema,

  executionConfig: {
    model: 'gpt-4',
    temperature: 0.2, // Lower temperature for more consistent safety assessments
    maxTokens: 2000,
    jsonMode: true,
    systemMessage: 'You are a clinical safety specialist trained in risk assessment. Always prioritize patient safety and err on the side of caution when identifying potential risks.',
  },

  examples: [
    {
      name: 'High suicide risk example',
      input: {
        patientContext: 'Patient: John Doe, 45, diagnosed with major depressive disorder and PTSD. Recent job loss. History of one previous suicide attempt 2 years ago.',
        sessionTranscript: 'Patient: "I\'ve been thinking about it a lot lately. I can\'t see any way out of this pain. I\'ve been looking at my medication bottles and wondering if I have enough. My family would be better off without me being such a burden."',
      },
      expectedOutput: {
        success: true,
        confidence: { score: 0.95, reasoning: 'Clear suicidal ideation with planning' },
        riskIndicators: [
          {
            category: 'suicide',
            indicator: 'Active suicidal ideation with planning',
            context: 'I\'ve been looking at my medication bottles and wondering if I have enough',
            confidence: { score: 0.95 },
            temporalContext: 'present',
            frequency: 'recurring',
          },
        ],
        riskAssessment: {
          overallRisk: 'critical',
          riskScore: 9,
          primaryConcern: 'suicide',
          imminentDanger: true,
          requiresImmediateAction: true,
          confidence: { score: 0.95 },
        },
        alerts: [
          {
            alertId: 'uuid-here',
            title: 'Critical Suicide Risk - Immediate Action Required',
            description: 'Patient expressing active suicidal ideation with potential means (medication overdose)',
            severity: 'critical',
            category: 'suicide',
            triggeringFactors: ['Active planning', 'Access to means', 'Previous attempt history'],
            recommendedActions: [
              'Immediate safety assessment',
              'Consider emergency evaluation',
              'Remove access to means',
              'Increase session frequency',
              'Involve support system',
            ],
            notificationPriority: 'immediate',
          },
        ],
        recommendations: [
          {
            recommendation: 'Conduct immediate safety planning session',
            priority: 'immediate',
            rationale: 'Patient showing active suicidal ideation with means',
            confidence: { score: 0.95 },
          },
        ],
        followUpRequired: true,
        nextAssessmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      },
    },
    {
      name: 'Substance use relapse risk',
      input: {
        patientContext: 'Patient: Sarah Smith, 28, in recovery from alcohol use disorder. 6 months sober. Recently experienced relationship breakup.',
        sessionTranscript: 'Patient: "The breakup has been really hard. I drove by the liquor store three times yesterday. I didn\'t go in, but I really wanted to. My sponsor isn\'t returning my calls and I\'m feeling really alone."',
      },
      expectedOutput: {
        success: true,
        confidence: { score: 0.85, reasoning: 'High relapse risk indicators present' },
        riskIndicators: [
          {
            category: 'substance_use',
            indicator: 'High relapse risk with cravings',
            context: 'I drove by the liquor store three times yesterday',
            confidence: { score: 0.85 },
            temporalContext: 'present',
            frequency: 'escalating',
          },
        ],
        riskAssessment: {
          overallRisk: 'high',
          riskScore: 7,
          primaryConcern: 'substance_use',
          imminentDanger: false,
          requiresImmediateAction: true,
          confidence: { score: 0.85 },
        },
        alerts: [
          {
            alertId: 'uuid-here',
            title: 'High Substance Use Relapse Risk',
            description: 'Patient experiencing strong cravings and loss of support system',
            severity: 'high',
            category: 'substance_use',
            triggeringFactors: ['Relationship stressor', 'Cravings', 'Isolation from support'],
            recommendedActions: [
              'Connect with sponsor/support immediately',
              'Increase meeting attendance',
              'Consider intensive outpatient program',
              'Develop coping strategies for cravings',
            ],
            notificationPriority: 'urgent',
          },
        ],
        protectiveFactors: {
          factors: [
            {
              factor: 'Did not act on cravings',
              strength: 'moderate',
              category: 'personal',
            },
            {
              factor: '6 months of sobriety',
              strength: 'strong',
              category: 'personal',
            },
          ],
          overallResilience: 'moderate',
        },
        recommendations: [
          {
            recommendation: 'Immediate connection with support system',
            priority: 'urgent',
            rationale: 'Patient isolated and experiencing cravings',
            confidence: { score: 0.85 },
          },
        ],
        followUpRequired: true,
        nextAssessmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      },
    },
  ],

  previousVersionId: undefined, // This is version 1.0.0
};

/**
 * Simplified safety check prompt for quick assessments
 */
export const quickSafetyCheckPromptTemplate: PromptTemplate = {
  metadata: {
    id: 'safety-check-quick',
    name: 'Quick Safety Screen',
    description: 'Rapid safety screening for routine check-ins',
    category: PromptCategory.SAFETY,
    version: '1.0.0',
    createdAt: new Date(),
    author: 'AI Pipeline Infrastructure',
    tags: ['safety', 'screening', 'quick-assessment'],
    estimatedTokens: {
      min: 500,
      max: 1500,
      typical: 1000,
    },
  },

  template: `Perform a quick safety screen of this therapy session. Focus only on immediate safety concerns.

<session_transcript>
{{sessionTranscript}}
</session_transcript>

Identify any:
1. Suicide or self-harm risk
2. Violence risk
3. Substance use concerns
4. Medical emergencies
5. Environmental dangers

Respond with a brief JSON assessment including risk level (low/medium/high/critical) and any required actions.`,

  variables: [
    {
      name: 'sessionTranscript',
      description: 'The therapy session transcript to screen',
      required: true,
    },
  ],

  outputSchema: safetyCheckOutputSchema.pick({
    success: true,
    confidence: true,
    riskAssessment: true,
    alerts: true,
    followUpRequired: true,
  }),

  executionConfig: {
    model: 'gpt-3.5-turbo',
    temperature: 0.1,
    maxTokens: 500,
    jsonMode: true,
  },

  examples: [],

  previousVersionId: undefined,
};

/**
 * Helper function to estimate token count for safety check
 */
export function estimateSafetyCheckTokens(
  patientContextLength: number,
  transcriptLength: number
): number {
  // Rough estimation: 1 token per 4 characters
  const contextTokens = Math.ceil(patientContextLength / 4);
  const transcriptTokens = Math.ceil(transcriptLength / 4);
  const promptTokens = 1000; // Base prompt template
  
  const totalTokens = contextTokens + transcriptTokens + promptTokens;
  
  console.log('[Safety-Check-Prompt] Token estimation:', {
    contextTokens,
    transcriptTokens,
    promptTokens,
    totalTokens,
  });
  
  return totalTokens;
}
