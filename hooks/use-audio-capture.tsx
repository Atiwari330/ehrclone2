'use client';

import { useRef, useState, useCallback } from 'react';
import { UseAudioCaptureReturn, AudioCaptureState } from '@/lib/types/transcription';

/**
 * Custom hook for capturing audio from the browser microphone
 * Uses modern AudioWorklet API for better performance and reliability
 * 
 * @param onAudioData - Callback function to handle audio data chunks
 * @returns Audio capture controls and state
 */
export function useAudioCapture(
  onAudioData: (audioData: ArrayBuffer) => void
): UseAudioCaptureReturn {
  const [state, setState] = useState<AudioCaptureState>({
    isRecording: false,
    audioStream: null,
    error: null
  });
  const [sampleRate, setSampleRate] = useState<number | undefined>(undefined);

  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Reset error state
      setState(prev => ({ ...prev, error: null }));

      // Check if we're in a secure context
      if (!window.isSecureContext) {
        throw new Error('Microphone access requires HTTPS or localhost');
      }

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      console.log('[AudioCapture] Requesting microphone access...');

      // Request microphone access with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      console.log('[AudioCapture] Microphone access granted');

      // Create AudioContext - browser may not honor the requested sample rate
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      // Get the actual sample rate (browser might ignore our request)
      const actualSampleRate = audioContext.sampleRate;
      console.log('[AudioCapture] Sample rate details:', {
        requested: 16000,
        actual: actualSampleRate,
        audioContextState: audioContext.state,
        timestamp: new Date().toISOString()
      });
      setSampleRate(actualSampleRate);

      // Resume audio context if it's suspended (required in some browsers)
      if (audioContext.state === 'suspended') {
        console.log('[AudioCapture] Resuming suspended AudioContext...');
        await audioContext.resume();
      }

      // Load the AudioWorklet module
      console.log('[AudioCapture] Loading AudioWorklet module...');
      try {
        await audioContext.audioWorklet.addModule('/audio-worklet-processor.js');
        console.log('[AudioCapture] AudioWorklet module loaded successfully');
      } catch (error) {
        console.error('[AudioCapture] Failed to load AudioWorklet module:', error);
        throw new Error('Failed to load audio processor module');
      }

      // Create audio source from stream
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Create AudioWorkletNode
      const workletNode = new AudioWorkletNode(audioContext, 'audio-capture-processor');
      workletNodeRef.current = workletNode;

      // Set up message handling from the worklet
      let audioDataReceived = false;
      workletNode.port.onmessage = (event) => {
        if (event.data.type === 'audio-data') {
          // Log first audio data received
          if (!audioDataReceived) {
            console.log('[AudioCapture] First audio data received from worklet:', {
              size: event.data.audioData.byteLength,
              hasAudioData: event.data.hasAudioData,
              timestamp: event.data.timestamp
            });
            audioDataReceived = true;
          }
          
          // Forward audio data to callback
          onAudioData(event.data.audioData);
        }
      };

      // Connect the audio graph
      source.connect(workletNode);
      // Note: We don't connect to destination to avoid audio feedback
      console.log('[AudioCapture] Audio graph connected: Mic → Source → WorkletNode');

      // Update state
      setState({
        isRecording: true,
        audioStream: stream,
        error: null
      });

      console.log('[AudioCapture] Recording started successfully');

    } catch (error) {
      console.error('[AudioCapture] Error starting audio capture:', error);
      
      let errorMessage = 'Failed to start recording';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = 'Microphone permission denied. Please allow microphone access and try again.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage = 'No microphone found. Please connect a microphone and try again.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          errorMessage = 'Microphone is already in use by another application.';
        } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
          errorMessage = 'Unable to access microphone with required settings.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setState({
        isRecording: false,
        audioStream: null,
        error: errorMessage
      });

      // Clean up on error
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  }, [onAudioData]);

  const stopRecording = useCallback(() => {
    console.log('[AudioCapture] stopRecording called - Stack trace:', new Error().stack);
    console.log('[AudioCapture] Current recording state:', state.isRecording);

    // Stop all audio tracks
    if (state.audioStream) {
      console.log('[AudioCapture] Stopping audio tracks...');
      state.audioStream.getTracks().forEach(track => {
        track.stop();
      });
    }

    // Disconnect and cleanup audio nodes
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current.port.close();
      workletNodeRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Update state
    setState({
      isRecording: false,
      audioStream: null,
      error: null
    });

    console.log('[AudioCapture] Recording stopped');
  }, [state.audioStream]);

  return {
    isRecording: state.isRecording,
    startRecording,
    stopRecording,
    audioStream: state.audioStream,
    error: state.error,
    sampleRate
  };
}
