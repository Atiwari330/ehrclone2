import { AssemblyAI } from 'assemblyai';
import { NextRequest, NextResponse } from 'next/server';
import { AssemblyAITokenResponse } from '@/lib/types/transcription';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    
    if (!apiKey) {
      console.error('ASSEMBLYAI_API_KEY not configured');
      return NextResponse.json(
        { error: 'AssemblyAI API key not configured' },
        { status: 500 }
      );
    }

    const client = new AssemblyAI({ apiKey });

    // Create temporary token valid for 1 hour
    const tokenResponse = await client.realtime.createTemporaryToken({
      expires_in: 3600
    });

    console.log('Token response type:', typeof tokenResponse);
    console.log('Token response:', tokenResponse);

    // Extract token string from response
    let tokenString: string;
    if (typeof tokenResponse === 'string') {
      tokenString = tokenResponse;
    } else if (tokenResponse && typeof tokenResponse === 'object' && 'token' in tokenResponse) {
      tokenString = (tokenResponse as any).token;
    } else {
      throw new Error('Unexpected token response format');
    }

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const response: AssemblyAITokenResponse = {
      token: tokenString,
      expiresAt
    };

    console.log('Returning token response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating AssemblyAI token:', error);
    
    // Check if it's a specific error type
    if (error instanceof Error && error.message.includes('402')) {
      return NextResponse.json(
        { error: 'AssemblyAI account requires upgrade for real-time transcription' },
        { status: 402 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create authentication token' },
      { status: 500 }
    );
  }
}
