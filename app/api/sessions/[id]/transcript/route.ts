import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { transcript, session, patient, provider } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/app/(auth)/auth';
import { ChatSDKError } from '@/lib/errors';
import type { TranscriptEntry } from '@/lib/types/transcription';

// Schema for validating request body
const saveTranscriptSchema = z.object({
  entries: z.array(z.object({
    id: z.string(),
    timestamp: z.string().or(z.date()).transform(val => new Date(val)),
    speaker: z.string(),
    speakerId: z.string(),
    text: z.string(),
    confidence: z.number().optional(),
    aiProcessed: z.boolean().optional(),
    isFinal: z.boolean(),
    isPartial: z.boolean().optional(),
  })),
  duration: z.number().int().positive(),
  startTime: z.string().or(z.date()).transform(val => new Date(val)),
  endTime: z.string().or(z.date()).transform(val => new Date(val)).optional(),
});

// Initialize database connection
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[API] POST /api/sessions/[id]/transcript - Start');
    
    // Authenticate user
    const authSession = await auth();
    console.log('[API] Auth session:', authSession?.user?.id ? 'authenticated' : 'not authenticated');
    
    if (!authSession?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let { id: sessionId } = await params;
    console.log('[API] Session ID from params:', sessionId);

    // TODO: Remove this temporary workaround for numeric session IDs
    // This is a temporary fix to allow testing with numeric IDs like '1'.
    // The frontend should be updated to use valid UUIDs for sessions.
    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(sessionId)) {
      console.warn(`[API] WARNING: Invalid UUID for sessionId: "${sessionId}". Using a placeholder for testing.`);
      // Using a static, valid UUID for development purposes.
      // Replace with a dynamic lookup or ensure frontend sends correct UUIDs.
      sessionId = '00000000-0000-0000-0000-000000000001'; 
    }
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    console.log('[API] Request body:', {
      entries: body.entries?.length || 0,
      duration: body.duration,
      startTime: body.startTime,
      endTime: body.endTime,
      firstEntry: body.entries?.[0],
    });
    
    let validatedData;
    
    try {
      validatedData = saveTranscriptSchema.parse(body);
      console.log('[API] Validation successful');
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('[API] Validation error:', error.errors);
        return NextResponse.json(
          { error: 'Invalid request data', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

    // Verify session exists and belongs to the authenticated provider
    console.log('[API] Checking if session exists in database...');
    
    // Verify session exists and belongs to the authenticated provider
    console.log('[API] Checking if session exists in database...');
    
    // TEMPORARY: Skip session check for testing and create dummy data if needed
    const [existingSession] = await db
      .select()
      .from(session)
      .where(eq(session.id, sessionId))
      .limit(1);

    if (!existingSession) {
      console.warn(`[API] Session with ID ${sessionId} not found. Creating dummy session for testing.`);
      
      const placeholderPatientId = '00000000-0000-0000-0000-000000000002';
      const placeholderProviderId = authSession.user.id!;

      // Ensure a dummy patient exists
      const [existingPatient] = await db.select().from(patient).where(eq(patient.id, placeholderPatientId));
      if (!existingPatient) {
        console.warn(`[API] Creating dummy patient with ID ${placeholderPatientId}`);
        await db.insert(patient).values({
          id: placeholderPatientId,
          createdAt: new Date(),
          firstName: 'Test',
          lastName: 'Patient',
          dateOfBirth: new Date('1990-01-01'),
        });
      }

      // Ensure a dummy provider exists (linked to the user)
      const [existingProvider] = await db.select().from(provider).where(eq(provider.id, placeholderProviderId));
      if (!existingProvider) {
        console.warn(`[API] Creating dummy provider with ID ${placeholderProviderId}`);
        await db.insert(provider).values({
          id: placeholderProviderId,
          title: 'MD',
          specialty: 'Testing',
        });
      }

      // Create the dummy session
      console.warn(`[API] Creating dummy session with ID ${sessionId}`);
      await db.insert(session).values({
        id: sessionId,
        createdAt: new Date(),
        patientId: placeholderPatientId,
        providerId: placeholderProviderId,
        sessionType: 'In-Office',
        sessionStatus: 'Completed',
        scheduledAt: new Date(),
      });
    }

    // Note: In a real implementation, we would check if the user is the provider
    // For now, we'll skip this check as the auth system might not have provider info yet

    // Calculate word count from all transcript entries
    const wordCount = validatedData.entries.reduce((total, entry) => {
      return total + entry.text.split(/\s+/).filter(word => word.length > 0).length;
    }, 0);
    
    console.log('[API] Calculated word count:', wordCount);

    // Save transcript to database
    console.log('[API] Saving transcript to database...');
    const [savedTranscript] = await db
      .insert(transcript)
      .values({
        sessionId,
        entries: validatedData.entries as any, // JSON column
        duration: validatedData.duration,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        wordCount,
      })
      .returning({ id: transcript.id });

    if (!savedTranscript) {
      throw new ChatSDKError(
        'bad_request:database',
        'Failed to save transcript'
      );
    }

    console.log(`[API] Transcript saved successfully for session ${sessionId}:`, {
      transcriptId: savedTranscript.id,
      entryCount: validatedData.entries.length,
      duration: validatedData.duration,
      wordCount,
    });

    return NextResponse.json({
      transcriptId: savedTranscript.id,
      success: true,
    });

  } catch (error) {
    console.error('[API] Error saving transcript:', error);
    
    if (error instanceof ChatSDKError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save transcript' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve transcript for a session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[API] GET /api/sessions/[id]/transcript - Start');
    
    // Authenticate user
    const authSession = await auth();
    if (!authSession?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let { id: sessionId } = await params;
    console.log('[API] Session ID from params:', sessionId);

    // TODO: Remove this temporary workaround for numeric session IDs
    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(sessionId)) {
      console.warn(`[API] GET: Invalid UUID for sessionId: "${sessionId}". Using a placeholder for testing.`);
      sessionId = '00000000-0000-0000-0000-000000000001'; 
    }
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get transcript for the session
    console.log('[API] Fetching transcript from database...');
    const [sessionTranscript] = await db
      .select()
      .from(transcript)
      .where(eq(transcript.sessionId, sessionId))
      .orderBy(desc(transcript.createdAt))
      .limit(1);

    console.log('[API] Transcript lookup result:', sessionTranscript ? 'found' : 'not found');
    
    if (!sessionTranscript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      transcript: sessionTranscript,
    });

  } catch (error) {
    console.error('[API] Error retrieving transcript:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve transcript' },
      { status: 500 }
    );
  }
}
