/**
 * Clinical Note Schema
 * 
 * Zod schema for validating clinical note generation output
 */

import { z } from 'zod';

/**
 * Individual SOAP section schema
 */
export const noteSectionSchema = z.object({
  type: z.enum(['subjective', 'objective', 'assessment', 'plan']),
  title: z.string().min(1),
  content: z.string().min(1),
  confidence: z.number().min(0).max(1)
});

/**
 * Clinical note generation output schema
 */
export const clinicalNoteOutputSchema = z.object({
  sections: z.array(noteSectionSchema).min(1),
  confidence: z.number().min(0).max(1),
  metadata: z.object({
    generatedAt: z.string().datetime().optional(),
    wordCount: z.number().positive().optional(),
    processingTimeMs: z.number().positive().optional()
  }).optional()
});

/**
 * Type exports
 */
export type NoteSection = z.infer<typeof noteSectionSchema>;
export type ClinicalNoteOutput = z.infer<typeof clinicalNoteOutputSchema>;
