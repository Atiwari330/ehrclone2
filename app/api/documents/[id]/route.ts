import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { document } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/app/(auth)/auth';

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[API] GET /api/documents/[id] - Start');
    
    // Authenticate user
    const authSession = await auth();
    if (!authSession?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: documentId } = await params;
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Fetch document from database
    const [documentData] = await db
      .select()
      .from(document)
      .where(eq(document.id, documentId))
      .limit(1);

    if (!documentData) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if user owns the document
    if (documentData.userId !== authSession.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    console.log(`[API] Document ${documentId} fetched successfully`);

    return NextResponse.json({
      document: documentData,
    });

  } catch (error) {
    console.error('[API] Error fetching document:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}
