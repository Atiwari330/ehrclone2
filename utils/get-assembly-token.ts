import { AssemblyAITokenResponse } from '@/lib/types/transcription';

/**
 * Fetches a temporary AssemblyAI token from the API
 * @returns Promise with the token response
 * @throws Error if the request fails
 */
export async function getAssemblyToken(): Promise<AssemblyAITokenResponse> {
  try {
    console.log('[AssemblyAI Token] Fetching token from /api/assemblyai-token...');
    
    const response = await fetch('/api/assemblyai-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache tokens
    });
    
    console.log('[AssemblyAI Token] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 402) {
        throw new Error('AssemblyAI account requires upgrade for real-time transcription');
      }
      
      throw new Error(errorData.error || `Failed to fetch AssemblyAI token: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('[AssemblyAI Token] Token received:', {
      hasToken: !!data.token,
      expiresAt: data.expiresAt,
      timestamp: new Date().toISOString()
    });
    
    // Convert the expiresAt string back to a Date object
    return {
      token: data.token,
      expiresAt: new Date(data.expiresAt)
    };
  } catch (error) {
    console.error('Error fetching AssemblyAI token:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to fetch AssemblyAI token');
  }
}

/**
 * Checks if a token is still valid (not expired)
 * @param expiresAt The expiration date of the token
 * @returns true if the token is still valid
 */
export function isTokenValid(expiresAt: Date): boolean {
  // Add a 5-minute buffer to account for clock differences and network delays
  const bufferMs = 5 * 60 * 1000; // 5 minutes
  const now = new Date();
  return expiresAt.getTime() - bufferMs > now.getTime();
}
