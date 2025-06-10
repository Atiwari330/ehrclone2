/**
 * Test Data Seeder for Patient Context Aggregator Testing
 * This script creates minimal test data needed to run the context aggregator tests
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { randomUUID } from 'crypto';
import {
  user,
  patient,
  provider,
  session,
  diagnosis,
  medication,
  treatmentPlan,
  treatmentGoal,
  assessment,
  alert,
  aiPipelineExecution,
} from './lib/db/schema';

// Create database connection
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

async function seedTestData() {
  console.log('🌱 Seeding test data for Patient Context Aggregator...\n');

  try {
    // 1. Create a test user first (provider references user table)
    console.log('Creating test user...');
    const [testUser] = await db
      .insert(user)
      .values({
        email: 'test.provider@example.com',
        password: 'test-password-hash', // In real app, this would be hashed
      })
      .returning();
    console.log('✓ User created:', testUser.email);

    // 2. Create a test provider
    console.log('\nCreating test provider...');
    const [testProvider] = await db
      .insert(provider)
      .values({
        id: testUser.id, // Must match the user id
        title: 'Dr.',
        specialty: 'Psychiatry',
        npiNumber: '1234567890',
      })
      .returning();
    console.log('✓ Provider created:', `${testProvider.title} (${testProvider.specialty})`);

    // 3. Create a test patient
    console.log('\nCreating test patient...');
    const [testPatient] = await db
      .insert(patient)
      .values({
        createdAt: new Date(),
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-15'),
        gender: 'male',
        contactPhone: '555-0123',
        contactEmail: 'john.doe@example.com',
        address: '123 Test Street, Test City, TS 12345',
      })
      .returning();
    console.log('✓ Patient created:', `${testPatient.firstName} ${testPatient.lastName}`);

    // 4. Create a few sessions
    console.log('\nCreating test sessions...');
    const sessionIds = [];
    for (let i = 0; i < 3; i++) {
      const scheduledAt = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000); // i weeks ago
      const [newSession] = await db
        .insert(session)
        .values({
          createdAt: new Date(),
          patientId: testPatient.id,
          providerId: testProvider.id,
          sessionType: 'individual',
          sessionStatus: i === 0 ? 'completed' : 'scheduled',
          scheduledAt: scheduledAt,
          endedAt: i === 0 ? new Date(scheduledAt.getTime() + 50 * 60 * 1000) : undefined, // 50 minutes later if completed
        })
        .returning();
      sessionIds.push(newSession.id);
      console.log(`✓ Session ${i + 1} created`);
    }

    // 5. Create diagnoses
    console.log('\nCreating test diagnoses...');
    await db.insert(diagnosis).values([
      {
        patientId: testPatient.id,
        providerId: testProvider.id,
        sessionId: sessionIds[0],
        icd10Code: 'F32.1',
        description: 'Major depressive disorder, single episode, moderate',
        status: 'active',
        onsetDate: new Date('2024-01-01'),
      },
      {
        patientId: testPatient.id,
        providerId: testProvider.id,
        sessionId: sessionIds[0],
        icd10Code: 'F41.1',
        description: 'Generalized anxiety disorder',
        status: 'active',
        onsetDate: new Date('2024-02-01'),
      },
    ]);
    console.log('✓ 2 diagnoses created');

    // 6. Create medications
    console.log('\nCreating test medications...');
    await db.insert(medication).values([
      {
        patientId: testPatient.id,
        providerId: testProvider.id,
        medicationName: 'Sertraline',
        dosage: '50mg',
        frequency: 'Once daily',
        route: 'oral',
        startDate: new Date('2024-01-15'),
        status: 'active',
        notes: 'Start with 50mg, may increase to 100mg after 2 weeks',
      },
      {
        patientId: testPatient.id,
        providerId: testProvider.id,
        medicationName: 'Lorazepam',
        dosage: '0.5mg',
        frequency: 'As needed for anxiety',
        route: 'oral',
        startDate: new Date('2024-02-01'),
        status: 'active',
        notes: 'PRN for acute anxiety, max 2mg/day',
      },
    ]);
    console.log('✓ 2 medications created');

    // 7. Create treatment plan with goals
    console.log('\nCreating test treatment plan...');
    const [testPlan] = await db
      .insert(treatmentPlan)
      .values({
        patientId: testPatient.id,
        providerId: testProvider.id,
        title: 'Depression and Anxiety Management Plan',
        description: 'Comprehensive treatment plan for managing depression and anxiety symptoms',
        status: 'active',
        startDate: new Date('2024-01-01'),
      })
      .returning();
    console.log('✓ Treatment plan created');

    // Create treatment goals
    await db.insert(treatmentGoal).values([
      {
        treatmentPlanId: testPlan.id,
        goalText: 'Reduce PHQ-9 score from 15 to below 10',
        targetDate: new Date('2024-06-01'),
        priority: 1,
        status: 'in_progress',
        progressPercentage: 40,
      },
      {
        treatmentPlanId: testPlan.id,
        goalText: 'Establish consistent sleep schedule (7-8 hours/night)',
        targetDate: new Date('2024-04-01'),
        priority: 2,
        status: 'in_progress',
        progressPercentage: 60,
      },
      {
        treatmentPlanId: testPlan.id,
        goalText: 'Resume social activities at least 2x per week',
        targetDate: new Date('2024-05-01'),
        priority: 3,
        status: 'pending',
        progressPercentage: 0,
      },
    ]);
    console.log('✓ 3 treatment goals created');

    // 8. Create assessments
    console.log('\nCreating test assessments...');
    const assessmentDates = [
      new Date('2024-01-01'),
      new Date('2024-02-01'),
      new Date('2024-03-01'),
    ];
    const phq9Scores = [15, 12, 10];
    const gad7Scores = [14, 11, 8];

    for (let i = 0; i < 3; i++) {
      // PHQ-9 Assessment
      await db.insert(assessment).values({
        patientId: testPatient.id,
        providerId: testProvider.id,
        sessionId: i < sessionIds.length ? sessionIds[i] : undefined,
        assessmentType: 'PHQ-9',
        totalScore: phq9Scores[i],
        severity: phq9Scores[i] >= 15 ? 'severe' : phq9Scores[i] >= 10 ? 'moderate' : 'mild',
        responses: { q1: 2, q2: 2, q3: 1, q4: 2, q5: 1, q6: 2, q7: 1, q8: 2, q9: 1 },
        administeredAt: assessmentDates[i],
      });

      // GAD-7 Assessment
      await db.insert(assessment).values({
        patientId: testPatient.id,
        providerId: testProvider.id,
        sessionId: i < sessionIds.length ? sessionIds[i] : undefined,
        assessmentType: 'GAD-7',
        totalScore: gad7Scores[i],
        severity: gad7Scores[i] >= 15 ? 'severe' : gad7Scores[i] >= 10 ? 'moderate' : 'mild',
        responses: { q1: 2, q2: 2, q3: 2, q4: 2, q5: 2, q6: 2, q7: 2 },
        administeredAt: assessmentDates[i],
      });
    }
    console.log('✓ 6 assessments created (3 PHQ-9, 3 GAD-7)');

    // 9. Create AI pipeline executions (needed for alerts)
    console.log('\nCreating test AI pipeline executions...');
    const startTime = new Date();
    const [pipeline1] = await db.insert(aiPipelineExecution).values({
      pipelineType: 'safety_check',
      sessionId: sessionIds[0],
      patientId: testPatient.id,
      userId: testUser.id,
      inputData: { context: 'Patient session data' },
      outputData: { alerts: ['medication_adherence'] },
      startTime: startTime,
      endTime: new Date(startTime.getTime() + 1500),
      durationMs: 1500,
      inputTokens: 500,
      outputTokens: 200,
      totalTokens: 700,
      modelUsed: 'gpt-4',
      status: 'completed',
    }).returning();
    
    const [pipeline2] = await db.insert(aiPipelineExecution).values({
      pipelineType: 'progress_tracking',
      sessionId: sessionIds[0],
      patientId: testPatient.id,
      userId: testUser.id,
      inputData: { context: 'Assessment data' },
      outputData: { alerts: ['symptom_change'] },
      startTime: new Date(startTime.getTime() + 5000),
      endTime: new Date(startTime.getTime() + 6200),
      durationMs: 1200,
      inputTokens: 400,
      outputTokens: 150,
      totalTokens: 550,
      modelUsed: 'gpt-4',
      status: 'completed',
    }).returning();
    console.log('✓ 2 AI pipeline executions created');

    // 10. Create alerts
    console.log('\nCreating test alerts...');
    await db.insert(alert).values([
      {
        patientId: testPatient.id,
        providerId: testProvider.id,
        sessionId: sessionIds[0],
        pipelineExecutionId: pipeline1.id,
        alertType: 'medication_adherence',
        severity: 'medium',
        riskScore: 65,
        alertTitle: 'Potential Medication Non-Adherence',
        alertDescription: 'Patient reported missing doses of Sertraline 3 times this week',
        recommendedActions: ['Review medication schedule', 'Consider simplifying regimen'],
        status: 'active',
      },
      {
        patientId: testPatient.id,
        providerId: testProvider.id,
        sessionId: sessionIds[0],
        pipelineExecutionId: pipeline2.id,
        alertType: 'symptom_deterioration',
        severity: 'low',
        riskScore: 30,
        alertTitle: 'Mild Increase in Anxiety Symptoms',
        alertDescription: 'GAD-7 score increased by 2 points from last assessment',
        recommendedActions: ['Monitor in next session', 'Review coping strategies'],
        status: 'active',
      },
    ]);
    console.log('✓ 2 alerts created');

    console.log('\n✅ Test data seeding completed successfully!');
    console.log(`\nTest Patient ID: ${testPatient.id}`);
    console.log('You can now run the Patient Context Aggregator tests.\n');

    // Close the database connection
    await client.end();
  } catch (error) {
    console.error('\n❌ Error seeding test data:', error);
    await client.end();
    process.exit(1);
  }
}

// Run the seeder
seedTestData();
