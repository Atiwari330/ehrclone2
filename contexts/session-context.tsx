'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  MedicalSession, 
  SessionAIState, 
  SessionContextValue,
  TranscriptEntry,
  SessionParticipant,
  SessionStatus
} from '@/lib/types/session';

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

interface SessionProviderProps {
  children: ReactNode;
  initialSession?: MedicalSession;
}

export function SessionProvider({ children, initialSession }: SessionProviderProps) {
  const [session, setSession] = useState<MedicalSession | null>(initialSession || null);
  const [aiState, setAIState] = useState<SessionAIState>({
    isProcessing: false,
    isRecording: false,
    isTranscribing: false,
    currentPartialTranscript: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start session
  const startSession = useCallback(async () => {
    if (!session) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: API call to start session
      // For now, just update local state
      setSession(prev => prev ? {
        ...prev,
        status: 'active' as SessionStatus,
        actualStart: new Date(),
      } : null);
      
      // Start AI processing
      setAIState(prev => ({ ...prev, isProcessing: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Pause session
  const pauseSession = useCallback(async () => {
    if (!session || session.status !== 'active') return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: API call to pause session
      setSession(prev => prev ? {
        ...prev,
        status: 'paused' as SessionStatus,
      } : null);
      
      // Pause AI processing
      setAIState(prev => ({ ...prev, isProcessing: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause session');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Resume session
  const resumeSession = useCallback(async () => {
    if (!session || session.status !== 'paused') return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: API call to resume session
      setSession(prev => prev ? {
        ...prev,
        status: 'active' as SessionStatus,
      } : null);
      
      // Resume AI processing
      setAIState(prev => ({ ...prev, isProcessing: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume session');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // End session
  const endSession = useCallback(async () => {
    if (!session || (session.status !== 'active' && session.status !== 'paused')) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: API call to end session
      setSession(prev => prev ? {
        ...prev,
        status: 'ended' as SessionStatus,
        actualEnd: new Date(),
      } : null);
      
      // Stop AI processing
      setAIState(prev => ({ ...prev, isProcessing: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end session');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Add transcript entry
  const addTranscriptEntry = useCallback((entry: Omit<TranscriptEntry, 'id'>) => {
    const newEntry: TranscriptEntry = {
      ...entry,
      id: `transcript-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        transcript: [...prev.transcript, newEntry],
      };
    });
    
    // Mark for AI processing
    setAIState(prev => ({
      ...prev,
      lastProcessedTimestamp: new Date(),
    }));
  }, []);

  // Update AI state
  const updateAIState = useCallback((state: Partial<SessionAIState>) => {
    setAIState(prev => ({ ...prev, ...state }));
  }, []);

  // Add participant
  const addParticipant = useCallback((participant: SessionParticipant) => {
    setSession(prev => {
      if (!prev) return null;
      
      // Check if participant already exists
      const exists = prev.participants.some(p => p.id === participant.id);
      if (exists) return prev;
      
      return {
        ...prev,
        participants: [...prev.participants, participant],
      };
    });
  }, []);

  // Remove participant
  const removeParticipant = useCallback((participantId: string) => {
    setSession(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        participants: prev.participants.map(p => 
          p.id === participantId 
            ? { ...p, leftAt: new Date() }
            : p
        ),
      };
    });
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    setError(null);
    
    try {
      // Update AI state to indicate recording has started
      setAIState(prev => ({
        ...prev,
        isRecording: true,
        isTranscribing: true,
        currentPartialTranscript: undefined,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      throw err;
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(async () => {
    setError(null);
    
    try {
      // Update AI state to indicate recording has stopped
      setAIState(prev => ({
        ...prev,
        isRecording: false,
        isTranscribing: false,
        currentPartialTranscript: undefined,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
      throw err;
    }
  }, []);

  // Update partial transcript
  const updatePartialTranscript = useCallback((text: string) => {
    setAIState(prev => ({
      ...prev,
      currentPartialTranscript: text,
    }));
  }, []);

  // Clear partial transcript
  const clearPartialTranscript = useCallback(() => {
    setAIState(prev => ({
      ...prev,
      currentPartialTranscript: undefined,
    }));
  }, []);

  // Add transcript (handles both partial and final transcripts from real-time transcription)
  const addTranscript = useCallback((text: string, isFinal: boolean) => {
    if (isFinal) {
      // Add as a final transcript entry
      addTranscriptEntry({
        timestamp: new Date(),
        speaker: 'Patient', // Default speaker for in-office sessions
        speakerId: session?.patientId || 'unknown',
        text,
        confidence: 1.0, // Real-time transcripts don't provide confidence per entry
        aiProcessed: false,
      });
      
      // Clear the partial transcript
      clearPartialTranscript();
    } else {
      // Update partial transcript
      updatePartialTranscript(text);
    }
  }, [session, addTranscriptEntry, updatePartialTranscript, clearPartialTranscript]);

  // Add mock transcript for backward compatibility and testing
  const addMockTranscript = useCallback((text: string) => {
    addTranscriptEntry({
      timestamp: new Date(),
      speaker: 'Mock Speaker',
      speakerId: 'mock-' + Date.now(),
      text,
      confidence: 1.0,
      aiProcessed: false,
    });
  }, [addTranscriptEntry]);

  const contextValue: SessionContextValue = {
    session,
    aiState,
    actions: {
      startSession,
      pauseSession,
      resumeSession,
      endSession,
      addTranscriptEntry,
      updateAIState,
      addParticipant,
      removeParticipant,
      startRecording,
      stopRecording,
      updatePartialTranscript,
      clearPartialTranscript,
      addTranscript,
      addMockTranscript,
    },
    isLoading,
    error,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}
