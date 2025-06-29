/**
 * Pipeline Type Definitions
 * 
 * Defines the different AI pipeline types and their configurations
 */

/**
 * Available pipeline types in the system
 */
export type PipelineType = 
  | 'safety_check'
  | 'billing_cpt'
  | 'billing_icd10'
  | 'treatment_progress'
  | 'chat_with_chart'
  | 'clinical_note';

/**
 * Pipeline configuration by type
 */
export const PIPELINE_CONFIG: Record<PipelineType, PipelineConfig> = {
  safety_check: {
    name: 'Safety Check',
    description: 'Assess patient safety risks and generate recommendations',
    category: 'clinical',
    priority: 'high',
    maxRetries: 3
  },
  billing_cpt: {
    name: 'CPT Code Suggestion',
    description: 'Suggest appropriate CPT codes based on visit details',
    category: 'billing',
    priority: 'normal',
    maxRetries: 2
  },
  billing_icd10: {
    name: 'ICD-10 Diagnosis Extraction',
    description: 'Extract and suggest ICD-10 diagnosis codes',
    category: 'billing',
    priority: 'normal',
    maxRetries: 2
  },
  treatment_progress: {
    name: 'Treatment Progress Analysis',
    description: 'Analyze patient treatment progress and outcomes',
    category: 'clinical',
    priority: 'normal',
    maxRetries: 2
  },
  chat_with_chart: {
    name: 'Chat with Patient Chart',
    description: 'Interactive Q&A with patient medical records',
    category: 'interactive',
    priority: 'low',
    maxRetries: 1
  },
  clinical_note: {
    name: 'Clinical Note Generation',
    description: 'Generate structured SOAP clinical notes from session transcripts',
    category: 'clinical',
    priority: 'normal',
    maxRetries: 2
  }
};

/**
 * Pipeline configuration interface
 */
export interface PipelineConfig {
  name: string;
  description: string;
  category: 'clinical' | 'billing' | 'interactive';
  priority: 'low' | 'normal' | 'high';
  maxRetries: number;
}

/**
 * Pipeline execution context
 */
export interface PipelineContext {
  pipelineType: PipelineType;
  patientId: string;
  sessionId?: string;
  userId: string;
  organizationId: string;
  timestamp: Date;
}

/**
 * Type guard to check if a string is a valid pipeline type
 */
export function isPipelineType(type: string): type is PipelineType {
  return Object.keys(PIPELINE_CONFIG).includes(type as PipelineType);
}

/**
 * Get pipeline configuration
 */
export function getPipelineConfig(type: PipelineType): PipelineConfig {
  return PIPELINE_CONFIG[type];
}
