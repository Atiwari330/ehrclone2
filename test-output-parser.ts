/**
 * Test file for Output Parser functionality
 * 
 * Tests various parsing scenarios including:
 * - Direct JSON parsing
 * - Markdown code block extraction
 * - Schema validation
 * - Partial data extraction
 * - Error handling
 */

import { createOutputParser, getParserForPipeline, safeParseAIOutput } from './lib/ai/output-parser';
import { safetyCheckOutputSchema } from './lib/ai/schemas/safety-check';
import { billingOutputSchema } from './lib/ai/schemas/billing';
import { treatmentProgressOutputSchema } from './lib/ai/schemas/treatment-progress';

async function testOutputParser() {
  console.log('[OutputParser Test] Starting tests...\n');

  // Test 1: Direct JSON parsing with safety check schema
  console.log('=== Test 1: Direct JSON Safety Check ===');
  const safetyParser = createOutputParser({
    schema: safetyCheckOutputSchema,
    pipelineType: 'safety_check',
    attemptPartialExtraction: true
  });

  const validSafetyJson = JSON.stringify({
    success: true,
    confidence: { score: 0.85, reasoning: 'High confidence based on clear indicators' },
    riskIndicators: [
      {
        category: 'suicide',
        indicator: 'Patient mentioned feeling hopeless',
        context: 'During discussion about recent job loss',
        confidence: { score: 0.7 }
      }
    ],
    riskAssessment: {
      overallRisk: 'medium',
      riskScore: 6.5,
      primaryConcern: 'suicide',
      imminentDanger: false,
      requiresImmediateAction: false,
      confidence: { score: 0.8 }
    },
    alerts: [],
    recommendations: [
      {
        recommendation: 'Increase session frequency',
        priority: 'urgent',
        rationale: 'Patient showing increased risk indicators',
        confidence: { score: 0.75 }
      }
    ],
    followUpRequired: true
  });

  try {
    const result1 = await safetyParser.parse(validSafetyJson);
    console.log('✅ Direct JSON parsing successful');
    console.log(`   Risk level: ${result1.riskAssessment.overallRisk}`);
    console.log(`   Risk indicators: ${result1.riskIndicators.length}`);
  } catch (error) {
    console.error('❌ Direct JSON parsing failed:', error);
  }

  // Test 2: Markdown code block extraction
  console.log('\n=== Test 2: Markdown Code Block Extraction ===');
  const markdownResponse = `
Here's the billing analysis:

\`\`\`json
{
  "success": true,
  "confidence": { "score": 0.9 },
  "sessionInfo": {
    "sessionId": "sess_123",
    "sessionDate": "2025-06-08",
    "duration": 45,
    "modality": "telehealth_video",
    "sessionType": "follow_up"
  },
  "cptCodes": [{
    "code": "90834",
    "description": "Psychotherapy, 45 minutes",
    "confidence": { "score": 0.95 },
    "primaryCode": true,
    "requiredDocumentation": ["Progress note", "Treatment plan"],
    "units": 1
  }],
  "icd10Codes": [{
    "code": "F32.1",
    "description": "Major depressive disorder, single episode, moderate",
    "confidence": { "score": 0.85 }
  }],
  "modifiers": [],
  "totalUnits": 1,
  "documentationComplete": {
    "complete": true,
    "missingElements": [],
    "complianceScore": 95,
    "recommendations": []
  },
  "medicalNecessity": {
    "justified": true,
    "rationale": "Ongoing treatment for moderate depression",
    "supportingDiagnoses": ["F32.1"],
    "clinicalIndicators": ["PHQ-9 score of 12"],
    "confidence": { "score": 0.88 }
  },
  "compliance": {
    "compliant": true,
    "issues": [],
    "auditRisk": "low"
  }
}
\`\`\`
`;

  const billingParser = await getParserForPipeline('billing_cpt');
  try {
    const result2 = await billingParser.parse(markdownResponse);
    console.log('✅ Markdown extraction successful');
    console.log(`   CPT Code: ${result2.cptCodes[0].code}`);
    console.log(`   Compliance: ${result2.compliance.compliant ? 'Compliant' : 'Non-compliant'}`);
  } catch (error) {
    console.error('❌ Markdown extraction failed:', error);
  }

  // Test 3: Invalid JSON with partial extraction
  console.log('\n=== Test 3: Invalid JSON with Partial Extraction ===');
  const partialJson = `{
    "success": true,
    "confidence": { "score": 0.75 },
    "assessmentPeriod": {
      "start": "2025-05-01",
      "end": "2025-06-01",
      "sessionsIncluded": 8
    },
    "goalProgress": "invalid_data_here",
    "effectiveness": {
      "overallEffectiveness": "moderately_effective",
      "confidence": { "score": 0.7 }
    }
  }`;

  const progressParser = await getParserForPipeline('treatment_progress');
  const safeResult = await progressParser.safeParse(partialJson);
  
  if (!safeResult.success) {
    console.log('✅ Invalid data correctly rejected');
    console.log(`   Error type: ${safeResult.error.type}`);
    console.log(`   Partial data extracted: ${safeResult.partial ? Object.keys(safeResult.partial).length : 0} fields`);
  } else {
    console.log('❌ Invalid data unexpectedly passed validation');
  }

  // Test 4: Malformed JSON with cleaning
  console.log('\n=== Test 4: Malformed JSON Cleaning ===');
  const malformedJson = `{
    'success': true,
    'confidence': { 'score': 0.8, },
    'riskIndicators': [],
    'riskAssessment': {
      'overallRisk': 'low',
      'riskScore': 2,
      'imminentDanger': false,
      'requiresImmediateAction': false,
      'confidence': { 'score': 0.9 }
    },
    'alerts': [],
    'recommendations': [],
    'followUpRequired': false,
  }`;

  const safetyParser2 = createOutputParser({
    schema: safetyCheckOutputSchema,
    pipelineType: 'safety_check'
  });

  try {
    const result4 = await safetyParser2.parse(malformedJson);
    console.log('✅ Malformed JSON cleaned and parsed');
    console.log(`   Risk level: ${result4.riskAssessment.overallRisk}`);
  } catch (error) {
    console.error('❌ Malformed JSON parsing failed:', error);
  }

  // Test 5: Pipeline-specific parser selection
  console.log('\n=== Test 5: Pipeline-Specific Parser Selection ===');
  const pipelineTypes = ['safety_check', 'billing_cpt', 'billing_icd10', 'treatment_progress'];
  
  for (const pipelineType of pipelineTypes) {
    try {
      const parser = await getParserForPipeline(pipelineType as any);
      console.log(`✅ Parser created for ${pipelineType}`);
    } catch (error) {
      console.error(`❌ Failed to create parser for ${pipelineType}:`, error);
    }
  }

  console.log('\n[OutputParser Test] Tests completed!');
}

// Run the tests
testOutputParser().catch(console.error);
