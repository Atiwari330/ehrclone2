'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSession } from '@/contexts/session-context';
import { useAudioCapture } from './use-audio-capture';
import { useRealtimeTranscription } from './use-realtime-transcription';
import { 
  UseSessionTranscriptionReturn, 
  TranscriptionError 
} from '@/lib/types/transcription';

export function useSessionTranscription(): UseSessionTranscriptionReturn {
  const { session, aiState, actions } = useSession();
  const startTimeRef = useRef<Date | null>(null);
  
  // Handle transcript updates from the real-time transcription service
  const handleTranscriptUpdate = useCallback((text: string, isFinal: boolean) => {
    actions.addTranscript(text, isFinal);
  }, [actions]);

  // Handle transcription errors
  const handleTranscriptionError = useCallback((error: TranscriptionError) => {
    console.error('Transcription error:', error);
    // Could show a toast notification here
  }, []);

  // We need a ref to hold the sendAudioData function
  const sendAudioDataRef = useRef<(audioData: ArrayBuffer) => void>(() => {});

  // Initialize audio capture first to get the sample rate
  const {
    isRecording: isCapturing,
    startRecording: startCapture,
    stopRecording: stopCapture,
    error: audioError,
    sampleRate,
  } = useAudioCapture((audioData) => sendAudioDataRef.current(audioData));

  // Initialize real-time transcription with the actual sample rate
  const {
    isConnected,
    isTranscribing,
    currentTranscript,
    error: transcriptionError,
    startTranscription,
    stopTranscription,
    sendAudioData,
  } = useRealtimeTranscription({
    onTranscriptUpdate: handleTranscriptUpdate,
    onError: handleTranscriptionError,
    sampleRate: sampleRate || 16000, // Use actual sample rate if available, fallback to 16000
  });

  // Update the ref with the actual sendAudioData function
  useEffect(() => {
    console.log('[SessionTranscription] Updating sendAudioData ref', {
      hasSendAudioData: !!sendAudioData,
      actualSampleRate: sampleRate,
      timestamp: new Date().toISOString()
    });
    sendAudioDataRef.current = sendAudioData;
  }, [sendAudioData, sampleRate]);

  // Combined start recording function
  const startRecording = useCallback(async () => {
    try {
      console.log('[SessionTranscription] Starting recording process...');
      
      // Start tracking session duration
      startTimeRef.current = new Date();
      
      // Update session state
      await actions.startRecording();
      console.log('[SessionTranscription] Session state updated');
      
      // Start audio capture FIRST to ensure we have audio ready
      console.log('[SessionTranscription] Starting audio capture...');
      await startCapture();
      console.log('[SessionTranscription] Audio capture started');
      
      // Small delay to ensure audio is fully initialized
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // THEN start transcription service once audio is flowing
      console.log('[SessionTranscription] Starting transcription service...');
      await startTranscription();
      console.log('[SessionTranscription] Transcription service started');
    } catch (error) {
      console.error('[SessionTranscription] Failed to start recording:', error);
      // Reset state on error
      await actions.stopRecording();
      throw error;
    }
  }, [actions, startTranscription, startCapture]);

  // Combined stop recording function
  const stopRecording = useCallback(async () => {
    console.log('[SessionTranscription] stopRecording called - Stack trace:', new Error().stack);
    console.log('[SessionTranscription] Current state:', {
      isCapturing,
      isTranscribing,
      isConnected,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Stop audio capture first
      console.log('[SessionTranscription] Stopping audio capture...');
      stopCapture();
      
      // Stop transcription service
      console.log('[SessionTranscription] Stopping transcription service...');
      await stopTranscription();
      
      // Update session state
      console.log('[SessionTranscription] Updating session state...');
      await actions.stopRecording();
      
      // Clear the start time
      startTimeRef.current = null;
      console.log('[SessionTranscription] Recording stopped successfully');
    } catch (error) {
      console.error('[SessionTranscription] Failed to stop recording:', error);
      throw error;
    }
  }, [actions, stopTranscription, stopCapture, isCapturing, isTranscribing, isConnected]);

  // Calculate session duration
  const sessionDuration = startTimeRef.current 
    ? Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000)
    : 0;

  // Combine errors from both hooks
  const error: TranscriptionError | null = transcriptionError || 
    (audioError ? {
      code: 'AUDIO_ERROR',
      message: audioError,
      timestamp: new Date(),
    } : null);

  // Determine connection status
  const connectionStatus = !isConnected ? 'disconnected' :
    isTranscribing ? 'transcribing' :
    aiState.isRecording ? 'connected' : 'connected';

  // Get transcripts from session
  const transcripts = (session?.transcript || []).map(entry => ({
    ...entry,
    isFinal: true, // Session transcripts are always final
    isPartial: false,
  }));

  // Note: Cleanup is handled by individual hooks (useAudioCapture and useRealtimeTranscription)
  // when they unmount, so we don't need additional cleanup here

  return {
    // Recording controls
    isRecording: aiState.isRecording,
    startRecording,
    stopRecording,
    
    // Connection state
    isConnected,
    connectionStatus,
    
    // Transcript data
    currentPartialTranscript: aiState.currentPartialTranscript || '',
    transcripts,
    
    // Session info
    sessionDuration,
    
    // Error state
    error,
  };
}
