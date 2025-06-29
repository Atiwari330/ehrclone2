/**
 * Clinical Note Generation Prompt Template
 * 
 * SOAP format clinical note generation from therapy session transcripts
 * for behavioral health providers
 */

import { PromptTemplate, PromptCategory } from '@/lib/ai/types/prompt-template';
import { clinicalNoteOutputSchema } from '@/lib/ai/schemas/clinical-note';

/**
 * Variables for the clinical note prompt
 */
const clinicalNoteVariables = [
  {
    name: 'transcript',
    description: 'The therapy session transcript to generate clinical notes from',
    required: true,
  },
  {
    name: 'sessionType',
    description: 'Type of therapy session (e.g., individual, group, intake)',
    required: false,
  },
  {
    name: 'duration',
    description: 'Duration of the session in minutes',
    required: false,
  },
  {
    name: 'patientContext',
    description: 'Patient demographic and clinical context information',
    required: false,
  },
];

/**
 * Clinical note generation prompt template
 */
export const clinicalNotePromptTemplate: PromptTemplate = {
  metadata: {
    id: 'clinical-note-generation',
    name: 'Clinical SOAP Note Generation',
    description: 'Generates structured clinical notes in SOAP format from therapy session transcripts for behavioral health providers',
    category: PromptCategory.CLINICAL,
    version: '1.0.0',
    createdAt: new Date(),
    author: 'AI Pipeline Infrastructure',
    tags: ['clinical-notes', 'soap', 'documentation', 'behavioral-health', 'therapy-sessions'],
    estimatedTokens: {
      min: 1500,
      max: 3500,
      typical: 2500,
    },
  },

  template: `You are an expert medical scribe specializing in behavioral health. Your task is to generate a concise, accurate, and well-structured clinical SOAP note based on the provided session transcript.

{{#if patientContext}}
<patient_context>
{{patientContext}}
</patient_context>
{{/if}}

<session_transcript>
{{transcript}}
</session_transcript>

{{#if sessionType}}
<session_details>
Session Type: {{sessionType}}
{{#if duration}}Duration: {{duration}} minutes{{/if}}
</session_details>
{{/if}}

## Instructions

Based on the transcript, generate a clinical note using the SOAP format. Each section should be clearly structured and professionally written.

**CRITICAL**: You MUST respond with valid JSON in this exact structure (do not add any text before or after the JSON):

{
  "sections": [
    {
      "type": "subjective",
      "title": "Subjective",
      "content": "Document the patient's chief complaint (CC) and history of present illness (HPI). Capture the patient's self-reported feelings, symptoms, and progress since the last visit. Use direct quotes from the patient where appropriate to convey their perspective.",
      "confidence": 0.85
    },
    {
      "type": "objective",
      "title": "Objective", 
      "content": "Describe the provider's observations of the patient's appearance, mood, affect, and behavior during the session. Note any specific behaviors, speech patterns, or non-verbal cues observed. Since this is from a transcript, state 'Mental Status Exam (MSE) based on observation during the session.'",
      "confidence": 0.80
    },
    {
      "type": "assessment",
      "title": "Assessment",
      "content": "Provide a summary of the session's key themes and the patient's current clinical status. List any relevant diagnoses (if mentioned or clearly indicated). Assess the patient's progress towards treatment goals.",
      "confidence": 0.90
    },
    {
      "type": "plan",
      "title": "Plan",
      "content": "Outline the treatment plan discussed during the session. Include any medication changes, therapeutic interventions, patient homework, or referrals. Specify the plan for the next session (e.g., 'Follow-up in 2 weeks to monitor progress.').",
      "confidence": 0.85
    }
  ],
  "confidence": 0.85,
  "metadata": {
    "generatedAt": "2024-01-15T10:30:00Z",
    "wordCount": 250,
    "processingTimeMs": 1500
  }
}

## SOAP Format Guidelines

### Subjective
- Document the patient's chief complaint and history of present illness
- Capture self-reported feelings, symptoms, and progress since last visit
- Include direct patient quotes where meaningful
- Note any changes in symptoms or functioning reported by patient

### Objective
- Describe provider observations of appearance, mood, affect, and behavior
- Note speech patterns, eye contact, psychomotor activity
- Document mental status exam findings based on session observations
- Include any objective measures or assessments completed

### Assessment
- Summarize key themes and clinical status from the session
- List relevant diagnoses if mentioned or clearly indicated
- Assess progress toward established treatment goals
- Note any clinical concerns or areas requiring attention

### Plan
- Outline treatment interventions discussed or implemented
- Document any medication changes or recommendations
- Include therapeutic homework or between-session tasks
- Specify follow-up plans and next appointment scheduling
- Note any referrals or coordination of care

## Important Guidelines

- **Be objective and professional**: Use clinical language appropriate for medical records
- **Stay within transcript bounds**: Do not add information not present in the transcript
- **Handle missing information**: If a section cannot be completed based on the transcript, write "Not specified in transcript" for that section's content
- **Confidence scoring**: Rate each section's confidence (0.0-1.0) based on how well the transcript supports the documented information
- **Privacy compliance**: Ensure all documentation follows HIPAA guidelines and professional standards

## Quality Standards

- Each section should be substantive and clinically relevant
- Use proper medical terminology and abbreviations when appropriate
- Maintain consistent tense and professional tone throughout
- Ensure logical flow between sections
- Include specific details that support clinical decision-making

Generate a comprehensive SOAP note that accurately reflects the session content while maintaining professional clinical documentation standards.`,

  variables: clinicalNoteVariables,

  outputSchema: clinicalNoteOutputSchema,

  executionConfig: {
    model: 'gpt-4',
    temperature: 0.3, // Lower temperature for more consistent clinical documentation
    maxTokens: 2000,
    jsonMode: true,
    systemMessage: 'You are a professional medical scribe specializing in behavioral health documentation. Generate accurate, compliant clinical notes in SOAP format.',
  },

  examples: [
    {
      name: 'Individual therapy session note',
      input: {
        transcript: 'Patient: "I\'ve been feeling much better since we started the cognitive exercises. The anxiety attacks have decreased from daily to maybe twice a week. I\'m still having trouble sleeping though." Therapist: "That\'s great progress on the anxiety. Tell me more about the sleep issues." Patient: "I wake up around 3 AM and can\'t get back to sleep. My mind starts racing about work stuff."',
        sessionType: 'individual',
        duration: '50',
      },
      expectedOutput: {
        sections: [
          {
            type: 'subjective',
            title: 'Subjective',
            content: 'Patient reports significant improvement in anxiety symptoms since implementing cognitive exercises in treatment. States anxiety attacks have decreased from daily occurrences to "twice a week." However, continues to experience sleep difficulties, specifically middle insomnia with awakening around 3 AM accompanied by racing thoughts about work-related concerns. Patient unable to return to sleep after these awakenings.',
            confidence: 0.9,
          },
          {
            type: 'objective',
            title: 'Objective',
            content: 'Mental Status Exam (MSE) based on observation during the session. Patient appeared alert and engaged throughout session. Speech was clear and goal-directed. Mood appeared improved compared to previous sessions. Affect was congruent with stated mood improvements. Patient demonstrated good insight into symptom patterns and treatment progress.',
            confidence: 0.75,
          },
          {
            type: 'assessment',
            title: 'Assessment',
            content: 'Patient demonstrates significant improvement in anxiety management with reported decrease in frequency of panic attacks. Cognitive behavioral interventions appear effective for anxiety symptoms. However, persistent middle insomnia with cognitive arousal remains problematic and may be impacting overall recovery. Sleep hygiene and worry management techniques may need to be addressed.',
            confidence: 0.85,
          },
          {
            type: 'plan',
            title: 'Plan',
            content: 'Continue current cognitive behavioral techniques for anxiety management. Introduce sleep hygiene education and cognitive techniques for managing racing thoughts at night. Patient to implement worry time scheduling and bedtime routine modifications. Follow-up in 1 week to assess sleep intervention effectiveness and anxiety symptom maintenance.',
            confidence: 0.8,
          },
        ],
        confidence: 0.82,
      },
    },
  ],

  previousVersionId: undefined, // This is version 1.0.0
};

/**
 * Helper function to estimate token count for clinical note generation
 */
export function estimateClinicalNoteTokens(
  transcriptLength: number,
  contextLength?: number
): number {
  // Rough estimation: 1 token per 4 characters
  const transcriptTokens = Math.ceil(transcriptLength / 4);
  const contextTokens = contextLength ? Math.ceil(contextLength / 4) : 0;
  const promptTokens = 1200; // Base prompt template
  
  const totalTokens = transcriptTokens + contextTokens + promptTokens;
  
  console.log('[Clinical-Note-Prompt] Token estimation:', {
    transcriptTokens,
    contextTokens,
    promptTokens,
    totalTokens,
  });
  
  return totalTokens;
}
