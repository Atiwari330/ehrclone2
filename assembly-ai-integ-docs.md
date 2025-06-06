# AssemblyAI Real-Time Transcription Integration for Next.js 14 Applications

This comprehensive research report provides complete implementation guidance for integrating AssemblyAI's real-time transcription service into a Next.js 14 application using the App Router. The integration enables live microphone audio capture, real-time speech-to-text processing, and seamless frontend state management for production-ready applications.

## Package Dependencies and Installation

The foundation for AssemblyAI real-time transcription requires specific NPM packages and proper environment configuration. The core dependency is the official AssemblyAI JavaScript SDK, which provides TypeScript support and streamlined WebSocket management[2][4]. Install the required packages using your preferred package manager:

```bash
npm install assemblyai
npm install @types/node
```

The AssemblyAI SDK supports multiple installation methods including npm, yarn, pnpm, and bun, ensuring compatibility with various development workflows[4]. For browser-based implementations, the SDK can also be loaded via CDN using UNPKG, though the npm installation is recommended for Next.js applications[2].

Environment variables must be configured in your `.env.local` file to securely store your AssemblyAI API key:

```bash
ASSEMBLYAI_API_KEY=your_api_key_here
```

Before proceeding with implementation, ensure your AssemblyAI account is upgraded, as real-time transcription features are only available to paid accounts[1][11]. Attempting to use the real-time API without an upgraded account will result in a 402 status code error.

## Browser Audio Capture Implementation

Browser audio capture forms the foundation of real-time transcription, requiring careful handling of the MediaRecorder API and audio stream management. The implementation must capture microphone audio in the correct format expected by AssemblyAI's streaming service[6][8].

Create a custom React hook for audio capture in `/hooks/use-audio-capture.tsx`:

```typescript
import { useRef, useState, useCallback } from 'react';

interface AudioCaptureHook {
  isRecording: boolean;
  startRecording: () => Promise;
  stopRecording: () => void;
  audioStream: MediaStream | null;
}

export const useAudioCapture = (
  onAudioData: (audioData: ArrayBuffer) => void
): AudioCaptureHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      setAudioStream(stream);
      setIsRecording(true);

      // Create AudioContext for processing
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Convert Float32Array to Int16Array (required by AssemblyAI)
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i  {
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
  }, [audioStream]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioStream
  };
};
```

The audio capture implementation ensures proper sample rate configuration (16kHz) and format conversion from Float32Array to Int16Array, which is required by AssemblyAI's real-time API[6]. The hook provides clean start and stop functionality while managing audio context resources appropriately.

## AssemblyAI WebSocket Integration

AssemblyAI's real-time transcription service operates through WebSocket connections that require proper authentication and session management. The integration involves creating secure temporary tokens and establishing persistent connections[2][5].

Create an API route for token generation in `/app/api/assemblyai-token/route.ts`:

```typescript
import { AssemblyAI } from 'assemblyai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AssemblyAI API key not configured' },
        { status: 500 }
      );
    }

    const client = new AssemblyAI({ apiKey });

    // Create temporary token valid for 1 hour
    const token = await client.realtime.createTemporaryToken({
      expires_in: 3600
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error creating AssemblyAI token:', error);
    return NextResponse.json(
      { error: 'Failed to create authentication token' },
      { status: 500 }
    );
  }
}
```

Create a utility function for token retrieval in `/utils/get-assembly-token.ts`:

```typescript
export async function getAssemblyToken(): Promise {
  const response = await fetch('/api/assemblyai-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch AssemblyAI token');
  }

  const data = await response.json();
  return data.token;
}
```

The token-based authentication approach ensures API key security by keeping sensitive credentials on the server while providing temporary access tokens to client-side components[5]. This pattern is essential for production applications where exposing API keys in client code would create security vulnerabilities.

## Real-Time Transcription Hook

The core transcription functionality requires a custom React hook that manages WebSocket connections, handles audio streaming, and processes real-time transcript responses from AssemblyAI[11][6].

Create the main transcription hook in `/hooks/use-realtime-transcription.tsx`:

```typescript
import { useRef, useState, useCallback, useEffect } from 'react';
import { RealtimeTranscriber, RealtimeTranscript } from 'assemblyai';
import { getAssemblyToken } from '@/utils/get-assembly-token';

interface TranscriptionState {
  isConnected: boolean;
  isTranscribing: boolean;
  currentTranscript: string;
  finalTranscripts: string[];
}

interface UseRealtimeTranscriptionProps {
  onTranscriptUpdate: (transcript: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
  sampleRate?: number;
}

export const useRealtimeTranscription = ({
  onTranscriptUpdate,
  onError,
  sampleRate = 16000
}: UseRealtimeTranscriptionProps) => {
  const transcriberRef = useRef(null);
  const [state, setState] = useState({
    isConnected: false,
    isTranscribing: false,
    currentTranscript: '',
    finalTranscripts: []
  });

  const initializeTranscriber = useCallback(async () => {
    try {
      const token = await getAssemblyToken();
      
      const transcriber = new RealtimeTranscriber({
        token,
        sampleRate,
        wordBoost: ['technical', 'medical', 'business'], // Customize as needed
        encoding: 'pcm_s16le'
      });

      // Handle connection events
      transcriber.on('open', ({ sessionId }) => {
        console.log(`Transcription session opened: ${sessionId}`);
        setState(prev => ({ ...prev, isConnected: true }));
      });

      transcriber.on('close', (code, reason) => {
        console.log('Transcription session closed:', code, reason);
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          isTranscribing: false 
        }));
      });

      transcriber.on('error', (error) => {
        console.error('Transcription error:', error);
        onError?.(error);
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          isTranscribing: false 
        }));
      });

      // Handle transcript events
      transcriber.on('transcript', (transcript: RealtimeTranscript) => {
        if (!transcript.text) return;

        const isPartial = transcript.message_type === 'PartialTranscript';
        const isFinal = transcript.message_type === 'FinalTranscript';

        if (isPartial) {
          setState(prev => ({ 
            ...prev, 
            currentTranscript: transcript.text 
          }));
          onTranscriptUpdate(transcript.text, false);
        } else if (isFinal) {
          setState(prev => ({ 
            ...prev, 
            currentTranscript: '',
            finalTranscripts: [...prev.finalTranscripts, transcript.text]
          }));
          onTranscriptUpdate(transcript.text, true);
        }
      });

      // Separate handlers for partial and final transcripts
      transcriber.on('transcript.partial', (transcript) => {
        setState(prev => ({ 
          ...prev, 
          currentTranscript: transcript.text 
        }));
        onTranscriptUpdate(transcript.text, false);
      });

      transcriber.on('transcript.final', (transcript) => {
        setState(prev => ({ 
          ...prev, 
          currentTranscript: '',
          finalTranscripts: [...prev.finalTranscripts, transcript.text]
        }));
        onTranscriptUpdate(transcript.text, true);
      });

      transcriberRef.current = transcriber;
      await transcriber.connect();

    } catch (error) {
      console.error('Failed to initialize transcriber:', error);
      onError?.(error as Error);
    }
  }, [sampleRate, onTranscriptUpdate, onError]);

  const startTranscription = useCallback(async () => {
    if (!transcriberRef.current) {
      await initializeTranscriber();
    }
    
    setState(prev => ({ ...prev, isTranscribing: true }));
  }, [initializeTranscriber]);

  const stopTranscription = useCallback(async () => {
    if (transcriberRef.current) {
      await transcriberRef.current.close();
      transcriberRef.current = null;
    }
    
    setState(prev => ({ 
      ...prev, 
      isTranscribing: false, 
      isConnected: false 
    }));
  }, []);

  const sendAudioData = useCallback((audioData: ArrayBuffer) => {
    if (transcriberRef.current && state.isConnected && state.isTranscribing) {
      transcriberRef.current.sendAudio(audioData);
    }
  }, [state.isConnected, state.isTranscribing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transcriberRef.current) {
        transcriberRef.current.close();
      }
    };
  }, []);

  return {
    ...state,
    startTranscription,
    stopTranscription,
    sendAudioData,
    initializeTranscriber
  };
};
```

This hook provides comprehensive WebSocket management with proper event handling for connection states, transcript processing, and error recovery[6]. The implementation supports both partial and final transcript events, allowing for real-time display updates while maintaining a complete transcript history.

## Session Context Integration

Integration with existing session management requires updating the session context to incorporate real-time transcription functionality while maintaining compatibility with existing mock transcript features.

Update your `/contexts/session-context.tsx`:

```typescript
import React, { createContext, useContext, useReducer, useCallback } from 'react';

interface TranscriptItem {
  id: string;
  text: string;
  timestamp: Date;
  isFinal: boolean;
  speaker?: string;
}

interface SessionState {
  sessionId: string;
  transcripts: TranscriptItem[];
  isRecording: boolean;
  isTranscribing: boolean;
  currentPartialTranscript: string;
}

type SessionAction =
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'ADD_TRANSCRIPT'; payload: { text: string; isFinal: boolean } }
  | { type: 'UPDATE_PARTIAL_TRANSCRIPT'; payload: string }
  | { type: 'CLEAR_PARTIAL_TRANSCRIPT' };

const sessionReducer = (state: SessionState, action: SessionAction): SessionState => {
  switch (action.type) {
    case 'START_RECORDING':
      return { ...state, isRecording: true, isTranscribing: true };
    
    case 'STOP_RECORDING':
      return { 
        ...state, 
        isRecording: false, 
        isTranscribing: false,
        currentPartialTranscript: ''
      };
    
    case 'ADD_TRANSCRIPT':
      const newTranscript: TranscriptItem = {
        id: `transcript-${Date.now()}-${Math.random()}`,
        text: action.payload.text,
        timestamp: new Date(),
        isFinal: action.payload.isFinal
      };
      
      return {
        ...state,
        transcripts: [...state.transcripts, newTranscript],
        currentPartialTranscript: action.payload.isFinal ? '' : state.currentPartialTranscript
      };
    
    case 'UPDATE_PARTIAL_TRANSCRIPT':
      return {
        ...state,
        currentPartialTranscript: action.payload
      };
    
    case 'CLEAR_PARTIAL_TRANSCRIPT':
      return {
        ...state,
        currentPartialTranscript: ''
      };
    
    default:
      return state;
  }
};

interface SessionContextType {
  state: SessionState;
  startRecording: () => void;
  stopRecording: () => void;
  addTranscript: (text: string, isFinal: boolean) => void;
  addMockTranscript: (text: string) => void; // Keep for backward compatibility
}

const SessionContext = createContext(undefined);

export const SessionProvider: React.FC = ({ 
  children, 
  sessionId 
}) => {
  const [state, dispatch] = useReducer(sessionReducer, {
    sessionId,
    transcripts: [],
    isRecording: false,
    isTranscribing: false,
    currentPartialTranscript: ''
  });

  const startRecording = useCallback(() => {
    dispatch({ type: 'START_RECORDING' });
  }, []);

  const stopRecording = useCallback(() => {
    dispatch({ type: 'STOP_RECORDING' });
  }, []);

  const addTranscript = useCallback((text: string, isFinal: boolean) => {
    if (isFinal) {
      dispatch({ type: 'ADD_TRANSCRIPT', payload: { text, isFinal } });
      dispatch({ type: 'CLEAR_PARTIAL_TRANSCRIPT' });
    } else {
      dispatch({ type: 'UPDATE_PARTIAL_TRANSCRIPT', payload: text });
    }
  }, []);

  // Keep for backward compatibility
  const addMockTranscript = useCallback((text: string) => {
    dispatch({ type: 'ADD_TRANSCRIPT', payload: { text, isFinal: true } });
  }, []);

  return (
    
      {children}
    
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};
```

## Complete Component Implementation

The final implementation combines all components into a cohesive real-time transcription interface that integrates seamlessly with your existing Next.js application structure.

Create the main transcription component in `/components/realtime-transcription.tsx`:

```typescript
'use client';

import React, { useCallback, useEffect } from 'react';
import { useAudioCapture } from '@/hooks/use-audio-capture';
import { useRealtimeTranscription } from '@/hooks/use-realtime-transcription';
import { useSession } from '@/contexts/session-context';

interface RealtimeTranscriptionProps {
  className?: string;
}

export const RealtimeTranscription: React.FC = ({
  className = ''
}) => {
  const { state, addTranscript, startRecording, stopRecording } = useSession();
  
  const handleTranscriptUpdate = useCallback((text: string, isFinal: boolean) => {
    addTranscript(text, isFinal);
  }, [addTranscript]);

  const handleTranscriptionError = useCallback((error: Error) => {
    console.error('Transcription error:', error);
    // Handle error state - could show toast notification
  }, []);

  const {
    isConnected,
    isTranscribing,
    startTranscription,
    stopTranscription,
    sendAudioData
  } = useRealtimeTranscription({
    onTranscriptUpdate: handleTranscriptUpdate,
    onError: handleTranscriptionError
  });

  const {
    isRecording,
    startRecording: startAudioCapture,
    stopRecording: stopAudioCapture
  } = useAudioCapture(sendAudioData);

  const handleStartRecording = useCallback(async () => {
    try {
      startRecording(); // Update session state
      await startTranscription(); // Connect to AssemblyAI
      await startAudioCapture(); // Start microphone
    } catch (error) {
      console.error('Failed to start recording:', error);
      stopRecording(); // Reset state on error
    }
  }, [startRecording, startTranscription, startAudioCapture, stopRecording]);

  const handleStopRecording = useCallback(async () => {
    stopAudioCapture(); // Stop microphone first
    await stopTranscription(); // Close AssemblyAI connection
    stopRecording(); // Update session state
  }, [stopAudioCapture, stopTranscription, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        handleStopRecording();
      }
    };
  }, [isRecording, handleStopRecording]);

  return (
    
      
        
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        
        
        
          
          
            {isConnected ? 'Connected' : 'Disconnected'}
          
          
          {isTranscribing && (
            <>
              
              Transcribing...
            
          )}
        
      

      
        
          {state.transcripts.filter(t => t.isFinal).map((transcript) => (
            
              {transcript.text}
              
                {transcript.timestamp.toLocaleTimeString()}
              
            
          ))}
        
        
        {state.currentPartialTranscript && (
          
            
              {state.currentPartialTranscript}
            
            
              Transcribing...
            
          
        )}
      
    
  );
};
```

## TypeScript Interface Definitions

Proper TypeScript definitions ensure type safety and improve development experience across the application. Create comprehensive interface definitions in `/types/transcription.ts`:

```typescript
export interface RealtimeTranscriptionConfig {
  sampleRate: number;
  encoding: 'pcm_s16le' | 'pcm_mulaw' | 'pcm_alaw';
  wordBoost?: string[];
  utteranceEndMs?: number;
  disablePartialTranscripts?: boolean;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  confidence: number;
  start: number;
  end: number;
  words?: TranscriptWord[];
}

export interface TranscriptWord {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

export interface RealtimeSessionMetadata {
  sessionId: string;
  status: 'connecting' | 'connected' | 'transcribing' | 'disconnected' | 'error';
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
}

export interface AudioCaptureOptions {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl?: boolean;
}

export interface TranscriptionError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}
```

## Error Handling and Production Considerations

Production deployments require robust error handling, connection management, and performance optimization. The implementation should handle network failures, authentication errors, and graceful degradation[18].

Create an error boundary component in `/components/transcription-error-boundary.tsx`:

```typescript
'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class TranscriptionErrorBoundary extends React.Component,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Transcription component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        
          
            Transcription Error
          
          
            Something went wrong with the real-time transcription service.
          
           this.setState({ hasError: false })}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          
        
      );
    }

    return this.props.children;
  }
}
```

For production deployments, consider implementing connection pooling, automatic reconnection logic, and performance monitoring. WebSocket connections can be unstable in mobile environments, requiring careful connection state management and fallback strategies[9][15].

## Conclusion

This comprehensive implementation provides a production-ready foundation for integrating AssemblyAI's real-time transcription service into Next.js 14 applications. The modular architecture supports easy maintenance and extension while ensuring type safety and robust error handling. The solution addresses browser audio capture, secure WebSocket communication, real-time state management, and seamless integration with existing application contexts. By following this implementation guide, developers can rapidly deploy real-time transcription functionality that scales with application requirements and provides reliable performance across different deployment environments.


