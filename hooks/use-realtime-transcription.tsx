'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { RealtimeTranscriber, RealtimeTranscript } from 'assemblyai';
import { getAssemblyToken } from '@/utils/get-assembly-token';
import { getBehavioralHealthVocabulary } from '@/lib/transcription/behavioral-health-vocab';
import { 
  UseRealtimeTranscriptionReturn, 
  TranscriptionState,
  TranscriptionError 
} from '@/lib/types/transcription';

interface UseRealtimeTranscriptionProps {
  onTranscriptUpdate: (transcript: string, isFinal: boolean) => void;
  onError?: (error: TranscriptionError) => void;
  sampleRate?: number;
}

/**
 * Custom hook for managing real-time transcription with AssemblyAI
 * Handles WebSocket connections, authentication, and transcript processing
 * 
 * @param props - Configuration options for transcription
 * @returns Transcription controls and state
 */
export function useRealtimeTranscription({
  onTranscriptUpdate,
  onError,
  sampleRate = 16000
}: UseRealtimeTranscriptionProps): UseRealtimeTranscriptionReturn {
  const transcriberRef = useRef<RealtimeTranscriber | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<TranscriptionState>({
    isConnected: false,
    isTranscribing: false,
    currentPartialTranscript: '',
    finalTranscripts: [],
    error: null
  });

  // Clean up function for timeouts
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Error handler with logging
  const handleError = useCallback((error: Error | TranscriptionError) => {
    console.error('Transcription error:', error);
    
    const transcriptionError: TranscriptionError = {
      code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      details: error,
      timestamp: new Date()
    };
    
    setState(prev => ({ 
      ...prev, 
      isConnected: false, 
      isTranscribing: false,
      error: transcriptionError
    }));
    
    onError?.(transcriptionError);
  }, [onError]);

  // Initialize the transcriber with AssemblyAI
  const initializeTranscriber = useCallback(async () => {
    console.log('[RealtimeTranscription] initializeTranscriber called');
    
    try {
      clearReconnectTimeout();
      
      // Clear any existing error state
      setState(prev => ({ ...prev, error: null }));
      
      // Get authentication token
      console.log('[RealtimeTranscription] Getting AssemblyAI token...');
      const { token } = await getAssemblyToken();
      console.log('[RealtimeTranscription] Token obtained successfully');
      
      // Get behavioral health vocabulary
      const vocabulary = getBehavioralHealthVocabulary();
      
      console.log('[RealtimeTranscription] Initializing with config:', {
        sampleRate,
        vocabularySize: vocabulary.length,
        encoding: 'pcm_s16le',
        timestamp: new Date().toISOString()
      });
      
      // Create transcriber instance
      const transcriber = new RealtimeTranscriber({
        token,
        sampleRate,
        wordBoost: vocabulary,
        encoding: 'pcm_s16le'
      });

      // Handle connection events
      transcriber.on('open', ({ sessionId }) => {
        console.log('[RealtimeTranscription] Session opened:', {
          sessionId,
          configuredSampleRate: sampleRate,
          timestamp: new Date().toISOString()
        });
        setState(prev => ({ 
          ...prev, 
          isConnected: true,
          error: null 
        }));
      });

      transcriber.on('close', (code, reason) => {
        console.log('[RealtimeTranscription] Session closed:', {
          code,
          reason,
          configuredSampleRate: sampleRate,
          timestamp: new Date().toISOString()
        });
        
        // Log specific close reasons
        if (code === 4000) {
          console.error('[RealtimeTranscription] ERROR: WebSocket closed with code 4000 - Sample rate mismatch!', {
            configuredRate: sampleRate,
            message: 'The actual audio sample rate does not match the configured rate.'
          });
        } else if (code === 4001) {
          console.error('[RealtimeTranscription] ERROR: WebSocket closed with code 4001 - Invalid audio encoding.');
        } else if (code === 4002) {
          console.error('[RealtimeTranscription] ERROR: WebSocket closed with code 4002 - Rate limit exceeded.');
        } else if (code === 4003) {
          console.error('[RealtimeTranscription] ERROR: WebSocket closed with code 4003 - Invalid authentication.');
        }
        
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          isTranscribing: false 
        }));
        
        // Attempt reconnection if it was an unexpected close (not initiated by client)
        if (code !== 1000) {
          console.log('Attempting to reconnect in 3 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            initializeTranscriber();
          }, 3000);
        }
      });

      transcriber.on('error', (error) => {
        handleError(error);
      });

      // Handle transcript events with specific event handlers
      transcriber.on('transcript.partial', (transcript: RealtimeTranscript) => {
        if (transcript.text) {
          setState(prev => ({ 
            ...prev, 
            currentPartialTranscript: transcript.text 
          }));
          onTranscriptUpdate(transcript.text, false);
        }
      });

      transcriber.on('transcript.final', (transcript: RealtimeTranscript) => {
        if (transcript.text) {
          setState(prev => ({ 
            ...prev, 
            currentPartialTranscript: '',
            finalTranscripts: [...prev.finalTranscripts, transcript.text]
          }));
          onTranscriptUpdate(transcript.text, true);
        }
      });

      transcriberRef.current = transcriber;
      
      // Connect to AssemblyAI
      console.log('[RealtimeTranscription] Connecting to AssemblyAI WebSocket...');
      await transcriber.connect();
      console.log('[RealtimeTranscription] WebSocket connect() called');

    } catch (error) {
      console.error('[RealtimeTranscription] Failed to initialize transcriber:', error);
      
      if (error instanceof Error && error.message.includes('402')) {
        handleError(new Error('AssemblyAI account requires upgrade for real-time transcription. Please upgrade your account at https://www.assemblyai.com/'));
      } else {
        handleError(error as Error);
      }
    }
  }, [sampleRate, onTranscriptUpdate, handleError, clearReconnectTimeout, state.isTranscribing]);

  // Start transcription
  const startTranscription = useCallback(async () => {
    console.log('[RealtimeTranscription] startTranscription called');
    
    try {
      if (!transcriberRef.current) {
        console.log('[RealtimeTranscription] No transcriber instance, initializing...');
        await initializeTranscriber();
      } else {
        console.log('[RealtimeTranscription] Using existing transcriber instance');
      }
      
      setState(prev => ({ 
        ...prev, 
        isTranscribing: true,
        currentPartialTranscript: '',
        finalTranscripts: [],
        error: null
      }));
      
      console.log('[RealtimeTranscription] State updated to isTranscribing: true');
    } catch (error) {
      console.error('[RealtimeTranscription] Error in startTranscription:', error);
      handleError(error as Error);
    }
  }, [initializeTranscriber, handleError]);

  // Stop transcription
  const stopTranscription = useCallback(async () => {
    try {
      clearReconnectTimeout();
      
      if (transcriberRef.current) {
        await transcriberRef.current.close();
        transcriberRef.current = null;
      }
      
      setState(prev => ({ 
        ...prev, 
        isTranscribing: false, 
        isConnected: false,
        currentPartialTranscript: ''
      }));
    } catch (error) {
      handleError(error as Error);
    }
  }, [clearReconnectTimeout, handleError]);

  // Send audio data to AssemblyAI
  const sendAudioData = useCallback((audioData: ArrayBuffer) => {
    if (!transcriberRef.current) {
      console.log('[RealtimeTranscription] sendAudioData: No transcriber instance');
      return;
    }
    
    if (!state.isConnected) {
      console.log('[RealtimeTranscription] sendAudioData: Not connected (WebSocket not open)');
      return;
    }
    
    if (!state.isTranscribing) {
      console.log('[RealtimeTranscription] sendAudioData: Not transcribing (transcription not started)');
      return;
    }
    
    try {
      // Log first successful send
      if (!sendAudioDataRef.current) {
        console.log('[RealtimeTranscription] Sending first audio data to AssemblyAI:', {
          size: audioData.byteLength,
          isConnected: state.isConnected,
          isTranscribing: state.isTranscribing,
          hasTranscriber: !!transcriberRef.current,
          timestamp: new Date().toISOString()
        });
        sendAudioDataRef.current = true;
      }
      
      transcriberRef.current.sendAudio(audioData);
    } catch (error) {
      console.error('[RealtimeTranscription] Error sending audio data:', error);
      // Don't treat send errors as fatal - connection might recover
    }
  }, [state.isConnected, state.isTranscribing]);
  
  // Add a ref to track if we've sent data
  const sendAudioDataRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearReconnectTimeout();
      if (transcriberRef.current) {
        transcriberRef.current.close().catch(console.error);
      }
    };
  }, [clearReconnectTimeout]);

  return {
    isConnected: state.isConnected,
    isTranscribing: state.isTranscribing,
    currentTranscript: state.currentPartialTranscript,
    finalTranscripts: state.finalTranscripts,
    startTranscription,
    stopTranscription,
    sendAudioData,
    initializeTranscriber,
    error: state.error
  };
}
