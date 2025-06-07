import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { transcript, document as documentSchema } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/app/(auth)/auth';
import { myProvider } from '@/lib/ai/providers';
import { clinicalNotePrompt } from '@/lib/ai/prompts/clinical-note-prompt';
import { streamText, smoothStream } from 'ai';

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[API] POST /api/sessions/[id]/generate-note - Start');
    const authSession = await auth();
    if (!authSession?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let { id: sessionId } = await params;
    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(sessionId)) {
      console.warn(`[API] GENERATE-NOTE: Invalid UUID for sessionId: "${sessionId}". Using placeholder.`);
      sessionId = '00000000-0000-0000-0000-000000000001';
    }

    // 1. Fetch the transcript
    const [transcriptData] = await db
      .select()
      .from(transcript)
      .where(eq(transcript.sessionId, sessionId))
      .orderBy(desc(transcript.createdAt))
      .limit(1);

    if (!transcriptData) {
      return NextResponse.json({ error: 'Transcript not found' }, { status: 404 });
    }

    const transcriptText = (transcriptData.entries as any[])
      .map(e => `${e.speaker}: ${e.text}`)
      .join('\n');

    // 2. Call the AI service
    const { textStream } = await streamText({
        model: myProvider.languageModel('artifact-model'),
        system: clinicalNotePrompt(transcriptText),
        prompt: 'Generate the clinical note based on the provided transcript.',
    });
    
    // This is a non-streaming approach for now to simplify saving
    // We can implement streaming to the client in a later step if needed.
    let noteContent = '';
    for await (const delta of textStream) {
        noteContent += delta;
    }

    const noteTitle = `Clinical Note for Session on ${new Date(transcriptData.startTime).toLocaleDateString()}`;

    // 3. Save the generated note as a document
    const [newDocument] = await db
      .insert(documentSchema)
      .values({
        title: noteTitle,
        content: noteContent,
        kind: 'text', // Using 'text' for now, can be 'clinical-note' if type is updated
        userId: authSession.user.id,
        createdAt: new Date(),
      })
      .returning({ id: documentSchema.id });

    if (!newDocument) {
      throw new Error('Failed to save the generated note.');
    }

    console.log(`[API] Successfully created draft document ${newDocument.id} for session ${sessionId}`);

    // 4. Return the new draft ID
    return NextResponse.json({ success: true, draftId: newDocument.id });

  } catch (error) {
    console.error('[API] Error generating note:', error);
    return NextResponse.json(
      { error: 'Failed to generate clinical note' },
      { status: 500 }
    );
  }
}
