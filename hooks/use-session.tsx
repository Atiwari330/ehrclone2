'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from '@/contexts/session-context';
import { TranscriptEntry } from '@/lib/types/session';

interface UseSessionOptions {
  sessionId?: string;
  autoStart?: boolean;
  onTranscriptUpdate?: (transcript: TranscriptEntry[]) => void;
  onSessionEnd?: () => void;
}

export function useSessionManager(options: UseSessionOptions = {}) {
  const { sessionId, autoStart = false, onTranscriptUpdate, onSessionEnd } = options;
  const { session, aiState, actions, isLoading, error } = useSession();
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptLength, setTranscriptLength] = useState(0);
  const prevTranscriptLengthRef = useRef(0);
  
  // Auto-start session if requested
  useEffect(() => {
    if (autoStart && session && session.status === 'scheduled') {
      actions.startSession();
    }
  }, [autoStart, session, actions]);
  
  // Monitor transcript changes
  useEffect(() => {
    if (session && session.transcript.length !== prevTranscriptLengthRef.current) {
      prevTranscriptLengthRef.current = session.transcript.length;
      setTranscriptLength(session.transcript.length);
      onTranscriptUpdate?.(session.transcript);
    }
  }, [session, onTranscriptUpdate]);
  
  // Monitor session end
  useEffect(() => {
    if (session && session.status === 'ended') {
      setIsRecording(false);
      onSessionEnd?.();
    }
  }, [session, onSessionEnd]);
  
  // Toggle recording (start/pause)
  const toggleRecording = useCallback(async () => {
    if (!session) return;
    
    if (session.status === 'active') {
      await actions.pauseSession();
      setIsRecording(false);
    } else if (session.status === 'paused') {
      await actions.resumeSession();
      setIsRecording(true);
    } else if (session.status === 'scheduled') {
      await actions.startSession();
      setIsRecording(true);
    }
  }, [session, actions]);
  
  // Add a mock transcript entry (for testing)
  const addMockTranscript = useCallback((text: string, speaker = 'Provider') => {
    if (!session) return;
    
    actions.addTranscriptEntry({
      timestamp: new Date(),
      speaker,
      speakerId: speaker === 'Provider' ? session.providerId : session.patientId,
      text,
      confidence: 0.95,
      aiProcessed: false,
    });
  }, [session, actions]);
  
  // Get latest AI suggestions
  const getAISuggestions = useCallback(() => {
    return aiState.suggestions || {
      followUpQuestions: [],
      relevantHistory: [],
      possibleDiagnoses: [],
    };
  }, [aiState]);
  
  // Get extracted medical data
  const getMedicalData = useCallback(() => {
    return aiState.extractedData || {
      chiefComplaint: undefined,
      hpi: undefined,
      reviewOfSystems: [],
      assessment: undefined,
      plan: [],
    };
  }, [aiState]);
  
  // Calculate session duration
  const getSessionDuration = useCallback(() => {
    if (!session || !session.actualStart) return 0;
    
    const endTime = session.actualEnd || new Date();
    return Math.floor((endTime.getTime() - session.actualStart.getTime()) / 1000); // in seconds
  }, [session]);
  
  return {
    // Session data
    session,
    isLoading,
    error,
    isRecording,
    transcriptLength,
    
    // AI data
    aiState,
    aiSuggestions: getAISuggestions(),
    medicalData: getMedicalData(),
    
    // Actions
    startSession: actions.startSession,
    pauseSession: actions.pauseSession,
    resumeSession: actions.resumeSession,
    endSession: actions.endSession,
    toggleRecording,
    addTranscriptEntry: actions.addTranscriptEntry,
    addMockTranscript,
    updateAIState: actions.updateAIState,
    
    // Utilities
    sessionDuration: getSessionDuration(),
    isSessionActive: session?.status === 'active',
    canStartSession: session?.status === 'scheduled',
    canEndSession: session?.status === 'active' || session?.status === 'paused',
  };
}

// Hook for managing transcript scrolling behavior
export function useTranscriptScroll(transcript: TranscriptEntry[] = []) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  // Check if user is at bottom of transcript
  const checkIfAtBottom = useCallback(() => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = 50; // pixels from bottom
    const atBottom = scrollHeight - scrollTop - clientHeight < threshold;
    
    setIsAtBottom(atBottom);
    if (atBottom) {
      setAutoScroll(true);
    }
  }, []);
  
  // Scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.current) return;
    
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior,
    });
  }, []);
  
  // Auto-scroll when new entries are added
  useEffect(() => {
    if (autoScroll && transcript.length > 0) {
      scrollToBottom();
    }
  }, [transcript.length, autoScroll, scrollToBottom]);
  
  // Handle manual scrolling
  const handleScroll = useCallback(() => {
    checkIfAtBottom();
    if (!isAtBottom) {
      setAutoScroll(false);
    }
  }, [checkIfAtBottom, isAtBottom]);
  
  return {
    containerRef,
    isAtBottom,
    autoScroll,
    scrollToBottom,
    handleScroll,
    setAutoScroll,
  };
}
