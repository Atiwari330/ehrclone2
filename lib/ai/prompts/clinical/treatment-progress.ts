/**
 * Treatment Progress Assessment Prompt Template
 * 
 * Analyzes therapy sessions to assess progress against treatment plan goals,
 * identify barriers, and generate recommendations for treatment adjustments.
 */

import { PromptTemplate, PromptCategory } from '@/lib/ai/types/prompt-template';
import { treatmentProgressOutputSchema } from '@/lib/ai/schemas/treatment-progress';

/**
 * Variables for treatment progress assessment
 */
const treatmentProgressVariables = [
  {
    name: 'patientContext',
    description: 'Complete patient context including treatment plan and goals',
    required: true,
  },
  {
    name: 'sessionTranscripts',
    description: 'Recent therapy session transcripts for progress analysis',
    required: true,
  },
  {
    name: 'treatmentPlan',
    description: 'Current treatment plan with goals and interventions',
    required: true,
  },
  {
    name: 'assessmentHistory',
    description: 'Recent assessment scores (PHQ-9, GAD-7, etc.)',
    required: false,
  },
  {
    name: 'previousProgress',
    description: 'Previous progress assessments for trend analysis',
    required: false,
  },
];

/**
 * Main treatment progress assessment prompt template
 */
export const treatmentProgressPromptTemplate: PromptTemplate = {
  metadata: {
    id: 'clinical-treatment-progress',
    name: 'Treatment Progress Assessment',
    description: 'Analyzes therapy progress against treatment goals and identifies barriers',
    category: PromptCategory.CLINICAL,
    version: '1.0.0',
    createdAt: new Date(),
    author: 'AI Pipeline Infrastructure',
    tags: ['clinical', 'progress', 'treatment-goals', 'barriers', 'recommendations'],
    estimatedTokens: {
      min: 2500,
      max: 4000,
      typical: 3200,
    },
  },

  template: `You are a clinical treatment specialist analyzing therapy progress. Your goal is to assess how well the patient is progressing toward their treatment goals and identify any barriers to success.

<patient_context>
{{patientContext}}
</patient_context>

<treatment_plan>
{{treatmentPlan}}
</treatment_plan>

<session_transcripts>
{{sessionTranscripts}}
</session_transcripts>

{{#if assessmentHistory}}
<assessment_history>
{{assessmentHistory}}
</assessment_history>
{{/if}}

{{#if previousProgress}}
<previous_progress>
{{previousProgress}}
</previous_progress>
{{/if}}

## Analysis Instructions

### 1. Goal Progress Assessment
For each treatment goal, analyze:
- **Progress Indicators**: Evidence from sessions showing movement toward goal
- **Progress Percentage**: Estimate 0-100% completion
- **Status**: Not started, in progress, achieved, discontinued, or modified
- **Supporting Evidence**: Direct quotes or observations from sessions
- **Barriers**: Obstacles preventing goal achievement

### 2. Progress Indicators
Identify and categorize progress across domains:
- **Symptom Changes**: Improvement, maintenance, or regression
- **Functional Changes**: Daily living, work, relationships
- **Behavioral Changes**: New skills, habits, or patterns
- **Cognitive Changes**: Thought patterns, beliefs, insights
- **Quality of Life**: Overall wellbeing indicators

### 3. Treatment Effectiveness
Evaluate current interventions:
- **Effective Interventions**: What's working well and why
- **Ineffective Interventions**: What's not working and why
- **Patient Engagement**: Level of participation and homework compliance
- **Therapeutic Alliance**: Strength of provider-patient relationship

### 4. Barriers to Progress
Identify obstacles:
- **Personal Barriers**: Motivation, beliefs, skills deficits
- **Environmental Barriers**: Life stressors, lack of support
- **Systemic Barriers**: Access issues, scheduling, resources
- **Clinical Barriers**: Severity of symptoms, comorbidities
- **Treatment Barriers**: Intervention-patient mismatch

### 5. Clinical Outcomes
If assessments available:
- Compare current to previous scores
- Determine clinical significance of changes
- Identify score trends over time
- Correlate with subjective reports

### 6. Recommendations
Based on analysis, suggest:
- **Continue**: Interventions showing effectiveness
- **Modify**: Adjustments to current approaches
- **Add**: New interventions to address barriers
- **Discontinue**: Ineffective or counterproductive elements
- **Refer**: Specialized services if needed

## Response Format

Provide a comprehensive progress assessment including:

1. **Assessment Period**: Timeframe and sessions analyzed
2. **Goal Progress**: Detailed progress for each treatment goal
3. **Progress Indicators**: Evidence of change across domains
4. **Barriers**: Obstacles to treatment success
5. **Clinical Outcomes**: Assessment score changes if available
6. **Treatment Effectiveness**: What's working and what's not
7. **Recommendations**: Specific treatment adjustments
8. **Summary Narrative**: Overall progress summary

## Important Considerations

- Focus on observable, measurable progress indicators
- Balance objective data with clinical judgment
- Consider cultural factors affecting progress
- Note any safety concerns that emerge
- Be specific in recommendations
- Acknowledge when progress is limited but effort is high

## Example Progress Indicators

**Significant Progress**: "Patient now using mindfulness techniques daily, reporting 'I caught myself catastrophizing and was able to stop and reframe' - demonstrates cognitive skill application"

**Moderate Progress**: "Sleep improved from 3-4 hours to 5-6 hours nightly, still below target but meaningful improvement"

**Limited Progress**: "Patient continues to avoid social situations despite exposure homework, reports 'I know I should try but I just can't'"

Analyze the sessions comprehensively to provide actionable progress insights.`,

  variables: treatmentProgressVariables,

  outputSchema: treatmentProgressOutputSchema,

  executionConfig: {
    model: 'gpt-4',
    temperature: 0.3, // Slightly higher than billing for more nuanced clinical insights
    maxTokens: 2500,
    jsonMode: true,
    systemMessage: 'You are a clinical specialist with expertise in treatment progress assessment and outcome measurement. Focus on observable evidence and actionable recommendations.',
  },

  examples: [
    {
      name: 'Depression treatment progress',
      input: {
        patientContext: 'Jane Doe, 35, Major Depressive Disorder, in treatment for 3 months',
        treatmentPlan: 'Goals: 1) Reduce depressive symptoms (PHQ-9 < 10), 2) Return to work full-time, 3) Improve sleep to 7+ hours',
        sessionTranscripts: 'Session 8: "I\'ve been getting to work 3 days a week now. It\'s hard but I\'m doing it." Session 9: "Sleep is better, maybe 6 hours most nights. Still tired but not exhausted." Session 10: "Had a really bad week, called in sick twice. Felt like all my progress disappeared."',
        assessmentHistory: 'PHQ-9: Baseline 18, Week 4: 15, Week 8: 12, Week 12: 14',
      },
      expectedOutput: {
        success: true,
        confidence: { score: 0.85, reasoning: 'Clear progress indicators with recent setback' },
        assessmentPeriod: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
          sessionsIncluded: 3,
        },
        goalProgress: [
          {
            goalId: 'goal-1',
            goalText: 'Reduce depressive symptoms (PHQ-9 < 10)',
            progressPercentage: 60,
            status: 'in_progress',
            evidence: ['PHQ-9 reduced from 18 to 12-14 range', 'Recent increase suggests vulnerability'],
            barriers: ['Stress response causing symptom recurrence'],
            lastUpdated: new Date(),
            confidence: { score: 0.9 },
            category: 'emotional',
          },
          {
            goalId: 'goal-2',
            goalText: 'Return to work full-time',
            progressPercentage: 50,
            status: 'in_progress',
            evidence: ['Working 3 days per week', 'Recent absences due to symptoms'],
            barriers: ['Symptom flare-ups affecting consistency'],
            lastUpdated: new Date(),
            confidence: { score: 0.85 },
            category: 'functional',
          },
        ],
        progressIndicators: [
          {
            indicator: 'Partial work attendance improvement',
            type: 'improvement',
            domain: 'functioning',
            magnitude: 'moderate',
            timeframe: 'Past month',
            supportingData: ['Increased from 0 to 3 days per week'],
          },
        ],
        barriers: [
          {
            barrier: 'Vulnerability to stress-induced setbacks',
            category: 'clinical',
            impact: 'high',
            addressable: true,
            suggestedInterventions: ['Relapse prevention planning', 'Stress management skills'],
          },
        ],
        clinicalOutcomes: [
          {
            measure: 'PHQ-9',
            currentScore: 14,
            previousScore: 18,
            changeDirection: 'improved',
            changePercentage: 22,
            clinicalSignificance: true,
            interpretation: 'Clinically significant improvement with recent increase',
          },
        ],
        effectiveness: {
          overallEffectiveness: 'moderately_effective',
          effectiveInterventions: [
            {
              intervention: 'Behavioral activation',
              effectiveness: 'moderate',
              patientResponse: 'Engaged with work return despite difficulty',
            },
          ],
          ineffectiveInterventions: [],
          confidence: { score: 0.8 },
        },
        recommendations: [
          {
            recommendation: 'Add relapse prevention module',
            priority: 'urgent',
            rationale: 'Recent setback indicates need for coping with symptom return',
            confidence: { score: 0.9 },
          },
        ],
        treatmentAdjustments: [
          {
            type: 'add',
            target: 'Relapse prevention strategies',
            rationale: 'Address vulnerability to setbacks',
            expectedOutcome: 'Improved resilience to stressors',
          },
        ],
        nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        summaryNarrative: 'Patient showing moderate progress with 60% symptom reduction and partial work return. Recent setback highlights need for relapse prevention strategies. Overall trajectory positive but requires treatment adjustment.',
      },
    },
    {
      name: 'Anxiety treatment with excellent progress',
      input: {
        patientContext: 'John Smith, 28, Generalized Anxiety Disorder, Social Anxiety',
        treatmentPlan: 'Goals: 1) Reduce anxiety (GAD-7 < 5), 2) Attend social events weekly, 3) Complete public speaking at work',
        sessionTranscripts: 'Session 5: "I went to my friend\'s party and stayed for 2 hours!" Session 6: "Gave a presentation to 5 people at work. Was nervous but did it." Session 7: "I\'m noticing my worry thoughts but not believing them as much."',
        assessmentHistory: 'GAD-7: Baseline 16, Week 4: 11, Week 8: 6',
      },
      expectedOutput: {
        success: true,
        confidence: { score: 0.95, reasoning: 'Strong evidence of progress across all goals' },
        assessmentPeriod: {
          start: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
          end: new Date(),
          sessionsIncluded: 3,
        },
        goalProgress: [
          {
            goalId: 'goal-1',
            goalText: 'Reduce anxiety (GAD-7 < 5)',
            progressPercentage: 90,
            status: 'in_progress',
            evidence: ['GAD-7 reduced from 16 to 6', 'Close to target of <5'],
            barriers: [],
            lastUpdated: new Date(),
            confidence: { score: 0.95 },
            category: 'emotional',
          },
          {
            goalId: 'goal-2',
            goalText: 'Attend social events weekly',
            progressPercentage: 100,
            status: 'achieved',
            evidence: ['Attended friend\'s party for 2 hours'],
            barriers: [],
            lastUpdated: new Date(),
            confidence: { score: 0.9 },
            category: 'social',
          },
        ],
        progressIndicators: [
          {
            indicator: 'Successful social event attendance',
            type: 'improvement',
            domain: 'relationships',
            magnitude: 'significant',
            timeframe: 'Past 3 weeks',
            supportingData: ['Attended party, stayed 2 hours'],
          },
          {
            indicator: 'Cognitive restructuring skills',
            type: 'improvement',
            domain: 'symptoms',
            magnitude: 'significant',
            timeframe: 'Ongoing',
            supportingData: ['Noticing worry thoughts but not believing them'],
          },
        ],
        barriers: [],
        clinicalOutcomes: [
          {
            measure: 'GAD-7',
            currentScore: 6,
            previousScore: 16,
            changeDirection: 'improved',
            changePercentage: 62.5,
            clinicalSignificance: true,
            interpretation: 'Dramatic improvement, approaching remission',
          },
        ],
        effectiveness: {
          overallEffectiveness: 'highly_effective',
          effectiveInterventions: [
            {
              intervention: 'Cognitive restructuring',
              effectiveness: 'high',
              patientResponse: 'Successfully challenging worry thoughts',
            },
            {
              intervention: 'Exposure therapy',
              effectiveness: 'high',
              patientResponse: 'Completing social and work exposures',
            },
          ],
          ineffectiveInterventions: [],
          confidence: { score: 0.95 },
        },
        recommendations: [
          {
            recommendation: 'Continue current interventions',
            priority: 'routine',
            rationale: 'Excellent progress across all domains',
            confidence: { score: 0.95 },
          },
          {
            recommendation: 'Plan for maintenance phase',
            priority: 'routine',
            rationale: 'Approaching goal completion',
            confidence: { score: 0.9 },
          },
        ],
        treatmentAdjustments: [],
        nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        summaryNarrative: 'Exceptional progress across all treatment goals. Anxiety symptoms reduced by 62.5%, social goals achieved, and work functioning improved. Patient demonstrating strong skill application. Consider transition to maintenance phase.',
      },
    },
  ],

  previousVersionId: undefined,
};

/**
 * Helper function to calculate progress percentage
 */
export function calculateProgressPercentage(
  baselineScore: number,
  currentScore: number,
  targetScore: number
): number {
  if (baselineScore === targetScore) return 100;
  
  const totalChange = Math.abs(targetScore - baselineScore);
  const actualChange = Math.abs(currentScore - baselineScore);
  const percentage = Math.round((actualChange / totalChange) * 100);
  
  console.log('[Treatment-Progress] Progress calculation:', {
    baseline: baselineScore,
    current: currentScore,
    target: targetScore,
    percentage,
  });
  
  return Math.min(100, Math.max(0, percentage));
}

/**
 * Determine if treatment plan modifications are needed
 */
export function assessNeedForModification(
  goalProgress: Array<{ progressPercentage: number; status: string }>,
  barriers: Array<{ impact: string }>,
  effectiveness: string
): { 
  needsModification: boolean; 
  urgency: 'immediate' | 'soon' | 'routine' | 'none';
  reason?: string;
} {
  // Check for stalled or discontinued goals
  const stalledGoals = goalProgress.filter(
    g => g.progressPercentage < 25 || g.status === 'discontinued'
  ).length;
  
  // Check for high-impact barriers
  const highImpactBarriers = barriers.filter(b => b.impact === 'high').length;
  
  // Check overall effectiveness
  const ineffective = effectiveness === 'ineffective' || effectiveness === 'minimally_effective';
  
  let needsModification = false;
  let urgency: 'immediate' | 'soon' | 'routine' | 'none' = 'none';
  let reason = '';
  
  if (ineffective || stalledGoals > goalProgress.length / 2) {
    needsModification = true;
    urgency = 'immediate';
    reason = 'Treatment showing minimal effectiveness';
  } else if (highImpactBarriers > 0) {
    needsModification = true;
    urgency = 'soon';
    reason = 'High-impact barriers preventing progress';
  } else if (stalledGoals > 0) {
    needsModification = true;
    urgency = 'routine';
    reason = 'Some goals showing limited progress';
  }
  
  console.log('[Treatment-Progress] Modification assessment:', {
    stalledGoals,
    highImpactBarriers,
    effectiveness,
    needsModification,
    urgency,
    reason,
  });
  
  return { needsModification, urgency, reason };
}

/**
 * Format progress summary for clinical notes
 */
export function formatProgressSummary(
  goalProgress: Array<{
    goalText: string;
    progressPercentage: number;
    status: string;
  }>,
  effectiveness: string
): string {
  const summaryParts = [
    `Treatment effectiveness: ${effectiveness.replace('_', ' ')}`,
    'Goal Progress:',
  ];
  
  goalProgress.forEach(goal => {
    const statusEmoji = goal.status === 'achieved' ? '✓' : 
                       goal.status === 'in_progress' ? '→' : 
                       goal.status === 'discontinued' ? '✗' : '○';
    summaryParts.push(`${statusEmoji} ${goal.goalText}: ${goal.progressPercentage}% complete`);
  });
  
  const summary = summaryParts.join('\n');
  
  console.log('[Treatment-Progress] Progress summary formatted:', {
    goalCount: goalProgress.length,
    effectiveness,
    summaryLength: summary.length,
  });
  
  return summary;
}
