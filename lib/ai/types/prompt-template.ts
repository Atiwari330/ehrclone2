/**
 * Prompt Template System Types
 * 
 * This module defines the TypeScript interfaces for the versioned prompt template system
 * that powers the AI pipeline infrastructure.
 */

import { z } from 'zod';

/**
 * Supported prompt categories for organization and discovery
 */
export enum PromptCategory {
  SAFETY = 'safety',
  BILLING = 'billing',
  CLINICAL = 'clinical',
  ADMINISTRATIVE = 'administrative',
  CHAT = 'chat',
  ANALYSIS = 'analysis',
}

/**
 * Prompt template metadata for tracking and management
 */
export interface PromptMetadata {
  /** Unique identifier for the prompt template */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Detailed description of what the prompt does */
  description: string;
  
  /** Category for organization */
  category: PromptCategory;
  
  /** Semantic version (e.g., "1.0.0") */
  version: string;
  
  /** Date when this version was created */
  createdAt: Date;
  
  /** Optional deprecation date */
  deprecatedAt?: Date;
  
  /** Author of the prompt template */
  author: string;
  
  /** Tags for additional categorization */
  tags: string[];
  
  /** Estimated token usage (input + expected output) */
  estimatedTokens: {
    min: number;
    max: number;
    typical: number;
  };
}

/**
 * Variable definition for template placeholders
 */
export interface PromptVariable {
  /** Variable name (used in template as {{name}}) */
  name: string;
  
  /** Description of what this variable represents */
  description: string;
  
  /** Whether this variable is required */
  required: boolean;
  
  /** Optional default value */
  defaultValue?: string;
  
  /** Optional validation schema */
  validationSchema?: z.ZodSchema<any>;
}

/**
 * Configuration for how the prompt should be executed
 */
export interface PromptExecutionConfig {
  /** Model to use (e.g., "gpt-4", "gpt-3.5-turbo") */
  model?: string;
  
  /** Temperature setting */
  temperature?: number;
  
  /** Maximum tokens for response */
  maxTokens?: number;
  
  /** System message to prepend */
  systemMessage?: string;
  
  /** Whether to use JSON mode */
  jsonMode?: boolean;
  
  /** Stop sequences */
  stopSequences?: string[];
}

/**
 * Main prompt template interface
 */
export interface PromptTemplate {
  /** Template metadata */
  metadata: PromptMetadata;
  
  /** The actual prompt template with {{variable}} placeholders */
  template: string;
  
  /** Variable definitions */
  variables: PromptVariable[];
  
  /** Output schema for structured responses */
  outputSchema?: z.ZodSchema<any>;
  
  /** Execution configuration */
  executionConfig?: PromptExecutionConfig;
  
  /** Example inputs and expected outputs for testing */
  examples?: PromptExample[];
  
  /** Previous version ID for version tracking */
  previousVersionId?: string;
}

/**
 * Example for testing and documentation
 */
export interface PromptExample {
  /** Example name/description */
  name: string;
  
  /** Input variables */
  input: Record<string, any>;
  
  /** Expected output (for testing) */
  expectedOutput?: any;
  
  /** Notes about this example */
  notes?: string;
}

/**
 * Result of rendering a prompt template with variables
 */
export interface RenderedPrompt {
  /** The final prompt text */
  prompt: string;
  
  /** Actual token count (if calculated) */
  tokenCount?: number;
  
  /** Variables that were used */
  usedVariables: string[];
  
  /** Any warnings during rendering */
  warnings?: string[];
}

/**
 * Registry entry for storing templates
 */
export interface PromptRegistryEntry {
  /** The template itself */
  template: PromptTemplate;
  
  /** When it was registered */
  registeredAt: Date;
  
  /** Whether this is the latest version */
  isLatest: boolean;
  
  /** Usage count for analytics */
  usageCount: number;
}

/**
 * Options for retrieving prompts from registry
 */
export interface PromptRetrievalOptions {
  /** Specific version to retrieve */
  version?: string;
  
  /** Whether to get latest version (default: true) */
  latest?: boolean;
  
  /** Include deprecated prompts */
  includeDeprecated?: boolean;
}

/**
 * Version resolution strategy
 */
export enum VersionStrategy {
  /** Always use the latest version */
  LATEST = 'latest',
  
  /** Use exact version match */
  EXACT = 'exact',
  
  /** Use compatible version (same major) */
  COMPATIBLE = 'compatible',
  
  /** Use any matching version */
  ANY = 'any',
}

/**
 * Prompt validation result
 */
export interface PromptValidationResult {
  /** Whether the prompt is valid */
  valid: boolean;
  
  /** Validation errors if any */
  errors?: Array<{
    field: string;
    message: string;
  }>;
  
  /** Warnings that don't prevent usage */
  warnings?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Interface for prompt template builders
 */
export interface PromptTemplateBuilder {
  /** Set metadata */
  setMetadata(metadata: Partial<PromptMetadata>): PromptTemplateBuilder;
  
  /** Set the template string */
  setTemplate(template: string): PromptTemplateBuilder;
  
  /** Add a variable */
  addVariable(variable: PromptVariable): PromptTemplateBuilder;
  
  /** Set output schema */
  setOutputSchema(schema: z.ZodSchema<any>): PromptTemplateBuilder;
  
  /** Set execution config */
  setExecutionConfig(config: PromptExecutionConfig): PromptTemplateBuilder;
  
  /** Add an example */
  addExample(example: PromptExample): PromptTemplateBuilder;
  
  /** Build the final template */
  build(): PromptTemplate;
}

/**
 * Type guard to check if a value is a PromptTemplate
 */
export function isPromptTemplate(value: unknown): value is PromptTemplate {
  return (
    typeof value === 'object' &&
    value !== null &&
    'metadata' in value &&
    'template' in value &&
    'variables' in value
  );
}

/**
 * Utility type for prompt input validation
 */
export type PromptInput<T extends PromptTemplate> = {
  [K in T['variables'][number]['name']]: string;
};

/**
 * Utility type for prompt output based on schema
 */
export type PromptOutput<T extends PromptTemplate> = T['outputSchema'] extends z.ZodSchema<infer O> ? O : any;
