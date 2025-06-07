import { createDocumentHandler } from '@/lib/artifacts/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { transcript } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { smoothStream, streamText } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { clinicalNotePrompt } from '@/lib/ai/prompts/clinical-note-prompt';

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export const clinicalNoteDocumentHandler = createDocumentHandler<'clinical-note'>({
  kind: 'clinical-note',
  onCreateDocument: async ({ title, dataStream, session, sessionId }) => {
    if (!sessionId) {
      throw new Error('Session ID is required to generate a clinical note.');
    }

    const [transcriptData] = await db
      .select()
      .from(transcript)
      .where(eq(transcript.sessionId, sessionId))
      .orderBy(desc(transcript.createdAt))
      .limit(1);

    if (!transcriptData) {
      throw new Error(`Transcript for session ${sessionId} not found.`);
    }

    const transcriptText = (transcriptData.entries as any[])
      .map(e => `${e.speaker}: ${e.text}`)
      .join('\n');

    let finalContent = '';
    const { fullStream } = await streamText({
      model: myProvider.languageModel('artifact-model'),
      system: clinicalNotePrompt(transcriptText),
      experimental_transform: smoothStream({ chunking: 'word' }),
      prompt: 'Generate the clinical note based on the provided transcript.',
    });

    for await (const delta of fullStream) {
      if (delta.type === 'text-delta') {
        const { textDelta } = delta;
        finalContent += textDelta;
        dataStream.writeData({
          type: 'text-delta',
          content: textDelta,
        });
      }
    }

    return finalContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    // Not in scope for this feature, but required by the handler type.
    dataStream.writeData({
      type: 'text-delta',
      content: document.content ?? '',
    });
    return document.content ?? '';
  },
});
