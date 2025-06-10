import type { 
  Patient, 
  Provider, 
  Session, 
  Transcript,
  TreatmentPlan,
  TreatmentGoal,
  Diagnosis,
  Medication,
  Assessment,
  Alert
} from '@/lib/db/schema';

// Purpose types for context optimization
export type ContextPurpose = 
  | 'safety_check' 
  | 'billing' 
  | 'progress_tracking' 
  | 'general' 
  | 'chat';

// Extended types with relationships
export interface DiagnosisWithProvider extends Diagnosis {
  provider?: Provider;
}

export interface MedicationWithDetails extends Medication {
  provider?: Provider;
}

export interface TreatmentPlanWithGoals extends TreatmentPlan {
  goals: TreatmentGoal[];
  provider?: Provider;
}

export interface SessionWithTranscript extends Session {
  transcript?: Transcript;
  provider?: Provider;
}

export interface AssessmentResult extends Assessment {
  provider?: Provider;
}

// Patient demographics for easy access
export interface PatientDemographics {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  age: number;
  gender?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
}

// Main patient context interface
export interface PatientContext {
  patient: Patient;
  demographics: PatientDemographics;
  diagnoses: DiagnosisWithProvider[];
  medications: MedicationWithDetails[];
  treatmentPlan?: TreatmentPlanWithGoals;
  recentSessions: SessionWithTranscript[];
  assessmentHistory: AssessmentResult[];
  alerts?: Alert[];
  metadata: PatientContextMetadata;
}

// Metadata about the context
export interface PatientContextMetadata {
  contextVersion: string;
  generatedAt: Date;
  tokenCount: number;
  purpose?: ContextPurpose;
  truncated: boolean;
  queryDurationMs: number;
}

// Options for context generation
export interface PatientContextOptions {
  includeTranscripts?: boolean;
  maxSessionCount?: number;
  maxAssessmentCount?: number;
  maxTokens?: number;
  purpose?: ContextPurpose;
}

// Token limits by purpose
export const TOKEN_LIMITS: Record<ContextPurpose, number> = {
  safety_check: 3000,
  billing: 2500,
  progress_tracking: 3500,
  general: 4000,
  chat: 4000,
};

// Priority weights for different data types by purpose
export const CONTEXT_PRIORITIES: Record<ContextPurpose, Record<string, number>> = {
  safety_check: {
    alerts: 10,
    assessmentHistory: 9,
    medications: 8,
    diagnoses: 7,
    recentSessions: 6,
    treatmentPlan: 5,
  },
  billing: {
    recentSessions: 10,
    diagnoses: 9,
    treatmentPlan: 7,
    medications: 5,
    assessmentHistory: 3,
    alerts: 2,
  },
  progress_tracking: {
    treatmentPlan: 10,
    assessmentHistory: 9,
    recentSessions: 8,
    diagnoses: 6,
    medications: 5,
    alerts: 4,
  },
  general: {
    diagnoses: 8,
    medications: 8,
    treatmentPlan: 8,
    recentSessions: 7,
    assessmentHistory: 6,
    alerts: 5,
  },
  chat: {
    recentSessions: 9,
    diagnoses: 8,
    medications: 8,
    treatmentPlan: 7,
    assessmentHistory: 6,
    alerts: 5,
  },
};

// Context sections for selective loading
export type ContextSection = 
  | 'demographics'
  | 'diagnoses'
  | 'medications'
  | 'treatmentPlan'
  | 'recentSessions'
  | 'assessmentHistory'
  | 'alerts';

export const REQUIRED_SECTIONS_BY_PURPOSE: Record<ContextPurpose, ContextSection[]> = {
  safety_check: ['demographics', 'medications', 'assessmentHistory', 'alerts'],
  billing: ['demographics', 'diagnoses', 'recentSessions'],
  progress_tracking: ['demographics', 'treatmentPlan', 'assessmentHistory', 'recentSessions'],
  general: ['demographics', 'diagnoses', 'medications', 'treatmentPlan'],
  chat: ['demographics', 'diagnoses', 'medications', 'recentSessions'],
};
