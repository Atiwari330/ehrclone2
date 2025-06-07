import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { session, patient, provider, transcript, document as documentSchema } from '@/lib/db/schema';
import { eq, desc, sql, and, like } from 'drizzle-orm';
import { auth } from '@/app/(auth)/auth';

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function GET() {
  try {
    const authSession = await auth();
    if (!authSession?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch sessions with patient and provider info, plus transcript status
    const sessionsWithStatus = await db
      .select({
        id: session.id,
        createdAt: session.createdAt,
        sessionType: session.sessionType,
        sessionStatus: session.sessionStatus,
        scheduledAt: session.scheduledAt,
        endedAt: session.endedAt,
        patient: {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
        },
        provider: {
          id: provider.id,
          title: provider.title,
        },
        hasTranscript: sql<boolean>`EXISTS (
          SELECT 1 FROM ${transcript} t 
          WHERE t.session_id = ${session.id}
        )`.as('hasTranscript'),
        // Check if a document exists with a title pattern matching this session
        // This is a workaround since documents aren't directly linked to sessions
        hasNote: sql<boolean>`EXISTS (
          SELECT 1 FROM ${documentSchema} d 
          WHERE d.title LIKE '%Clinical Note for Session%' 
          AND d.created_at >= ${session.createdAt}
          AND d.user_id = ${authSession.user.id}
        )`.as('hasNote'),
      })
      .from(session)
      .leftJoin(patient, eq(session.patientId, patient.id))
      .leftJoin(provider, eq(session.providerId, provider.id))
      .orderBy(desc(session.scheduledAt))
      .limit(20); // Fetch recent sessions

    return NextResponse.json({ sessions: sessionsWithStatus });
  } catch (error) {
    console.error('[API] Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
