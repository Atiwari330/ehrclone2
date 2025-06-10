import 'server-only';

import { 
  getPatientById,
  getDiagnosesByPatientId,
  getMedicationsByPatientId,
  getTreatmentPlansByPatientId,
  getTreatmentGoalsByPlanId,
  getSessionsByPatientId,
  getTranscriptBySessionId,
  getAssessmentsByPatientId,
  getAlertsByPatientId,
  getProviderById
} from '@/lib/db/queries';

import type {
  PatientContext,
  PatientContextOptions,
  PatientDemographics,
  DiagnosisWithProvider,
  MedicationWithDetails,
  TreatmentPlanWithGoals,
  SessionWithTranscript,
  AssessmentResult,
  ContextPurpose,
  ContextSection,
} from '@/lib/types/patient-context';

import { 
  TOKEN_LIMITS, 
  CONTEXT_PRIORITIES, 
  REQUIRED_SECTIONS_BY_PURPOSE 
} from '@/lib/types/patient-context';

import { ChatSDKError } from '@/lib/errors';
import type { Alert } from '@/lib/db/schema';

// Constants
const CONTEXT_VERSION = '1.0.0';
const APPROXIMATE_CHARS_PER_TOKEN = 4;
const MAX_TRANSCRIPT_LENGTH = 1000; // Characters per transcript
const MAX_SESSION_COUNT_DEFAULT = 5;
const MAX_ASSESSMENT_COUNT_DEFAULT = 10;

export class PatientContextService {
  private patientId: string;
  
  constructor(patientId: string) {
    this.patientId = patientId;
  }

  /**
   * Get patient demographics with calculated age
   */
  async getPatientDemographics(): Promise<PatientDemographics | null> {
    const startTime = Date.now();
    console.log('[Patient-Context] Getting demographics for patient:', this.patientId);
    
    try {
      const patient = await getPatientById({ id: this.patientId });
      
      if (!patient) {
        console.log('[Patient-Context] Patient not found:', this.patientId);
        return null;
      }

      // Calculate age
      const today = new Date();
      const birthDate = new Date(patient.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      const demographics: PatientDemographics = {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        age,
        gender: patient.gender || undefined,
        contactPhone: patient.contactPhone || undefined,
        contactEmail: patient.contactEmail || undefined,
        address: patient.address || undefined,
      };

      console.log('[Patient-Context] Demographics retrieved in', Date.now() - startTime, 'ms');
      return demographics;
    } catch (error) {
      console.error('[Patient-Context] Failed to get demographics:', error);
      throw new ChatSDKError(
        'bad_request:database',
        'Failed to get patient demographics'
      );
    }
  }

  /**
   * Get patient diagnoses with provider information
   */
  async getDiagnoses(status?: string): Promise<DiagnosisWithProvider[]> {
    const startTime = Date.now();
    console.log('[Patient-Context] Getting diagnoses for patient:', this.patientId);
    
    try {
      const diagnoses = await getDiagnosesByPatientId({ 
        patientId: this.patientId,
        status: status || 'active'
      });

      // Enrich with provider information
      const enrichedDiagnoses = await Promise.all(
        diagnoses.map(async (diagnosis) => {
          const provider = diagnosis.providerId 
            ? await getProviderById({ id: diagnosis.providerId })
            : undefined;
          
          return {
            ...diagnosis,
            provider
          } as DiagnosisWithProvider;
        })
      );

      console.log('[Patient-Context] Found', enrichedDiagnoses.length, 'diagnoses in', Date.now() - startTime, 'ms');
      return enrichedDiagnoses;
    } catch (error) {
      console.error('[Patient-Context] Failed to get diagnoses:', error);
      throw new ChatSDKError(
        'bad_request:database',
        'Failed to get patient diagnoses'
      );
    }
  }

  /**
   * Get patient medications with provider details
   */
  async getMedications(status?: string): Promise<MedicationWithDetails[]> {
    const startTime = Date.now();
    console.log('[Patient-Context] Getting medications for patient:', this.patientId);
    
    try {
      const medications = await getMedicationsByPatientId({ 
        patientId: this.patientId,
        status: status || 'active'
      });

      // Enrich with provider information
      const enrichedMedications = await Promise.all(
        medications.map(async (medication) => {
          const provider = medication.providerId 
            ? await getProviderById({ id: medication.providerId })
            : undefined;
          
          return {
            ...medication,
            provider
          } as MedicationWithDetails;
        })
      );

      console.log('[Patient-Context] Found', enrichedMedications.length, 'medications in', Date.now() - startTime, 'ms');
      return enrichedMedications;
    } catch (error) {
      console.error('[Patient-Context] Failed to get medications:', error);
      throw new ChatSDKError(
        'bad_request:database',
        'Failed to get patient medications'
      );
    }
  }

  /**
   * Get active treatment plan with goals
   */
  async getTreatmentPlan(): Promise<TreatmentPlanWithGoals | null> {
    const startTime = Date.now();
    console.log('[Patient-Context] Getting treatment plan for patient:', this.patientId);
    
    try {
      const plans = await getTreatmentPlansByPatientId({ 
        patientId: this.patientId,
        status: 'active'
      });

      if (plans.length === 0) {
        console.log('[Patient-Context] No active treatment plan found');
        return null;
      }

      // Get the most recent active plan
      const plan = plans[0];

      // Get goals for the plan
      const goals = await getTreatmentGoalsByPlanId({ 
        treatmentPlanId: plan.id 
      });

      // Get provider information
      const provider = plan.providerId 
        ? await getProviderById({ id: plan.providerId })
        : undefined;

      const enrichedPlan: TreatmentPlanWithGoals = {
        ...plan,
        goals,
        provider
      };

      console.log('[Patient-Context] Treatment plan with', goals.length, 'goals retrieved in', Date.now() - startTime, 'ms');
      return enrichedPlan;
    } catch (error) {
      console.error('[Patient-Context] Failed to get treatment plan:', error);
      throw new ChatSDKError(
        'bad_request:database',
        'Failed to get treatment plan'
      );
    }
  }

  /**
   * Get recent sessions with transcripts
   */
  async getRecentSessions(
    limit: number = MAX_SESSION_COUNT_DEFAULT, 
    includeTranscripts: boolean = true
  ): Promise<SessionWithTranscript[]> {
    const startTime = Date.now();
    console.log('[Patient-Context] Getting recent sessions for patient:', this.patientId, 'Limit:', limit);
    
    try {
      const sessions = await getSessionsByPatientId({ 
        patientId: this.patientId,
        limit,
        status: 'ended'
      });

      // Enrich with transcripts and provider information
      const enrichedSessions = await Promise.all(
        sessions.map(async (session) => {
          const [transcript, provider] = await Promise.all([
            includeTranscripts 
              ? getTranscriptBySessionId({ sessionId: session.id })
              : Promise.resolve(undefined),
            session.providerId 
              ? getProviderById({ id: session.providerId })
              : Promise.resolve(undefined)
          ]);

          return {
            ...session,
            transcript,
            provider
          } as SessionWithTranscript;
        })
      );

      console.log('[Patient-Context] Found', enrichedSessions.length, 'sessions in', Date.now() - startTime, 'ms');
      return enrichedSessions;
    } catch (error) {
      console.error('[Patient-Context] Failed to get recent sessions:', error);
      throw new ChatSDKError(
        'bad_request:database',
        'Failed to get recent sessions'
      );
    }
  }

  /**
   * Get assessment history (PHQ-9, GAD-7, etc.)
   */
  async getAssessmentHistory(
    assessmentType?: string,
    limit: number = MAX_ASSESSMENT_COUNT_DEFAULT
  ): Promise<AssessmentResult[]> {
    const startTime = Date.now();
    console.log('[Patient-Context] Getting assessment history for patient:', this.patientId, 'Type:', assessmentType);
    
    try {
      const assessments = await getAssessmentsByPatientId({ 
        patientId: this.patientId,
        assessmentType,
        limit
      });

      // Enrich with provider information
      const enrichedAssessments = await Promise.all(
        assessments.map(async (assessment) => {
          const provider = assessment.providerId 
            ? await getProviderById({ id: assessment.providerId })
            : undefined;
          
          return {
            ...assessment,
            provider
          } as AssessmentResult;
        })
      );

      console.log('[Patient-Context] Found', enrichedAssessments.length, 'assessments in', Date.now() - startTime, 'ms');
      return enrichedAssessments;
    } catch (error) {
      console.error('[Patient-Context] Failed to get assessment history:', error);
      throw new ChatSDKError(
        'bad_request:database',
        'Failed to get assessment history'
      );
    }
  }

  /**
   * Get active alerts for the patient
   */
  async getAlerts(severity?: string): Promise<Alert[]> {
    const startTime = Date.now();
    console.log('[Patient-Context] Getting alerts for patient:', this.patientId, 'Severity:', severity);
    
    try {
      const alerts = await getAlertsByPatientId({ 
        patientId: this.patientId,
        status: 'new',
        severity
      });

      console.log('[Patient-Context] Found', alerts.length, 'alerts in', Date.now() - startTime, 'ms');
      return alerts;
    } catch (error) {
      console.error('[Patient-Context] Failed to get alerts:', error);
      throw new ChatSDKError(
        'bad_request:database',
        'Failed to get patient alerts'
      );
    }
  }

  /**
   * Get full patient context
   */
  async getFullContext(options: PatientContextOptions = {}): Promise<PatientContext | null> {
    const startTime = Date.now();
    console.log('[Patient-Context] Assembling full context for patient:', this.patientId);
    
    try {
      // Get patient record first to validate existence
      const patient = await getPatientById({ id: this.patientId });
      
      if (!patient) {
        console.log('[Patient-Context] Patient not found:', this.patientId);
        return null;
      }

      // Parallel fetch all data
      const [
        demographics,
        diagnoses,
        medications,
        treatmentPlan,
        recentSessions,
        assessmentHistory,
        alerts
      ] = await Promise.all([
        this.getPatientDemographics(),
        this.getDiagnoses(),
        this.getMedications(),
        this.getTreatmentPlan(),
        this.getRecentSessions(
          options.maxSessionCount || MAX_SESSION_COUNT_DEFAULT,
          options.includeTranscripts !== false
        ),
        this.getAssessmentHistory(
          undefined,
          options.maxAssessmentCount || MAX_ASSESSMENT_COUNT_DEFAULT
        ),
        this.getAlerts()
      ]);

      if (!demographics) {
        throw new ChatSDKError(
          'not_found:database',
          'Patient demographics not found'
        );
      }

      // Build context
      let context: PatientContext = {
        patient,
        demographics,
        diagnoses,
        medications,
        treatmentPlan: treatmentPlan || undefined,
        recentSessions,
        assessmentHistory,
        alerts: alerts.length > 0 ? alerts : undefined,
        metadata: {
          contextVersion: CONTEXT_VERSION,
          generatedAt: new Date(),
          tokenCount: 0,
          purpose: options.purpose,
          truncated: false,
          queryDurationMs: Date.now() - startTime
        }
      };

      // Estimate token count and optimize if needed
      context = this.optimizeContextForTokenLimit(context, options);

      console.log('[Patient-Context] Full context assembled in', Date.now() - startTime, 'ms, tokens:', context.metadata.tokenCount);
      return context;
    } catch (error) {
      console.error('[Patient-Context] Failed to get full context:', error);
      throw new ChatSDKError(
        'bad_request:database',
        'Failed to get full patient context'
      );
    }
  }

  /**
   * Get context optimized for a specific purpose
   */
  async getContextForPurpose(purpose: ContextPurpose): Promise<PatientContext | null> {
    const startTime = Date.now();
    console.log('[Patient-Context] Getting context for purpose:', purpose);
    
    // Get required sections for this purpose
    const requiredSections = REQUIRED_SECTIONS_BY_PURPOSE[purpose];
    
    try {
      // Get patient record first to validate existence
      const patient = await getPatientById({ id: this.patientId });
      
      if (!patient) {
        console.log('[Patient-Context] Patient not found:', this.patientId);
        return null;
      }

      // Fetch only required data in parallel
      const fetchPromises: Promise<any>[] = [];
      const sectionMap: Record<string, number> = {};
      
      if (requiredSections.includes('demographics')) {
        sectionMap.demographics = fetchPromises.length;
        fetchPromises.push(this.getPatientDemographics());
      }
      
      if (requiredSections.includes('diagnoses')) {
        sectionMap.diagnoses = fetchPromises.length;
        fetchPromises.push(this.getDiagnoses());
      }
      
      if (requiredSections.includes('medications')) {
        sectionMap.medications = fetchPromises.length;
        fetchPromises.push(this.getMedications());
      }
      
      if (requiredSections.includes('treatmentPlan')) {
        sectionMap.treatmentPlan = fetchPromises.length;
        fetchPromises.push(this.getTreatmentPlan());
      }
      
      if (requiredSections.includes('recentSessions')) {
        sectionMap.recentSessions = fetchPromises.length;
        const includeTranscripts = purpose === 'billing' || purpose === 'chat';
        const maxSessions = purpose === 'billing' ? 1 : 3;
        fetchPromises.push(this.getRecentSessions(maxSessions, includeTranscripts));
      }
      
      if (requiredSections.includes('assessmentHistory')) {
        sectionMap.assessmentHistory = fetchPromises.length;
        const limit = purpose === 'safety_check' ? 5 : 3;
        fetchPromises.push(this.getAssessmentHistory(undefined, limit));
      }
      
      if (requiredSections.includes('alerts')) {
        sectionMap.alerts = fetchPromises.length;
        fetchPromises.push(this.getAlerts());
      }

      const results = await Promise.all(fetchPromises);
      
      // Build context with only required data
      const context: PatientContext = {
        patient,
        demographics: sectionMap.demographics !== undefined 
          ? results[sectionMap.demographics] 
          : { id: patient.id, firstName: patient.firstName, lastName: patient.lastName } as PatientDemographics,
        diagnoses: sectionMap.diagnoses !== undefined ? results[sectionMap.diagnoses] : [],
        medications: sectionMap.medications !== undefined ? results[sectionMap.medications] : [],
        treatmentPlan: sectionMap.treatmentPlan !== undefined ? results[sectionMap.treatmentPlan] : undefined,
        recentSessions: sectionMap.recentSessions !== undefined ? results[sectionMap.recentSessions] : [],
        assessmentHistory: sectionMap.assessmentHistory !== undefined ? results[sectionMap.assessmentHistory] : [],
        alerts: sectionMap.alerts !== undefined ? results[sectionMap.alerts] : undefined,
        metadata: {
          contextVersion: CONTEXT_VERSION,
          generatedAt: new Date(),
          tokenCount: 0,
          purpose,
          truncated: false,
          queryDurationMs: Date.now() - startTime
        }
      };

      // Optimize for token limit
      const optimizedContext = this.optimizeContextForTokenLimit(context, { purpose });
      
      console.log('[Patient-Context] Purpose-specific context assembled in', Date.now() - startTime, 'ms, tokens:', optimizedContext.metadata.tokenCount);
      return optimizedContext;
    } catch (error) {
      console.error('[Patient-Context] Failed to get context for purpose:', error);
      throw new ChatSDKError(
        'bad_request:database',
        `Failed to get patient context for purpose: ${purpose}`
      );
    }
  }

  /**
   * Optimize context to fit within token limits
   */
  private optimizeContextForTokenLimit(
    context: PatientContext, 
    options: PatientContextOptions
  ): PatientContext {
    const maxTokens = options.maxTokens || TOKEN_LIMITS[options.purpose || 'general'];
    
    // Estimate current token count
    let currentTokens = this.estimateTokenCount(context);
    context.metadata.tokenCount = currentTokens;
    
    if (currentTokens <= maxTokens) {
      return context;
    }

    console.log('[Patient-Context] Optimizing context from', currentTokens, 'to', maxTokens, 'tokens');
    
    // Truncate transcripts first
    if (context.recentSessions.length > 0) {
      context.recentSessions = context.recentSessions.map(session => {
        if (session.transcript && session.transcript.entries) {
          const entries = session.transcript.entries as any[];
          const truncatedEntries = this.truncateTranscript(entries, MAX_TRANSCRIPT_LENGTH);
          return {
            ...session,
            transcript: {
              ...session.transcript,
              entries: truncatedEntries
            }
          };
        }
        return session;
      });
    }

    // Re-estimate tokens
    currentTokens = this.estimateTokenCount(context);
    context.metadata.tokenCount = currentTokens;
    
    if (currentTokens <= maxTokens) {
      context.metadata.truncated = true;
      return context;
    }

    // Remove older sessions if still over limit
    if (context.recentSessions.length > 1) {
      context.recentSessions = context.recentSessions.slice(0, 1);
    }

    // Remove older assessments
    if (context.assessmentHistory.length > 3) {
      context.assessmentHistory = context.assessmentHistory.slice(0, 3);
    }

    // Final token count
    context.metadata.tokenCount = this.estimateTokenCount(context);
    context.metadata.truncated = true;
    
    return context;
  }

  /**
   * Estimate token count for a context object
   */
  private estimateTokenCount(context: PatientContext): number {
    const jsonString = JSON.stringify(context);
    return Math.ceil(jsonString.length / APPROXIMATE_CHARS_PER_TOKEN);
  }

  /**
   * Truncate transcript entries to a maximum character length
   */
  private truncateTranscript(entries: any[], maxLength: number): any[] {
    let totalLength = 0;
    const truncatedEntries: any[] = [];
    
    for (const entry of entries) {
      const entryText = entry.text || '';
      totalLength += entryText.length;
      
      if (totalLength > maxLength) {
        // Add a truncation indicator
        truncatedEntries.push({
          ...entry,
          text: '... [transcript truncated for context optimization]'
        });
        break;
      }
      
      truncatedEntries.push(entry);
    }
    
    return truncatedEntries;
  }
}

/**
 * Factory function to create a PatientContextService instance
 */
export function createPatientContextService(patientId: string): PatientContextService {
  return new PatientContextService(patientId);
}
