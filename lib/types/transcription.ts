// TypeScript types for real-time transcription feature

// Audio capture configuration
export interface AudioCaptureOptions {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl?: boolean;
}

// Audio capture hook state
export interface AudioCaptureState {
  isRecording: boolean;
  audioStream: MediaStream | null;
  error: string | null;
}

// AssemblyAI configuration
export interface RealtimeTranscriptionConfig {
  sampleRate: number;
  encoding: 'pcm_s16le' | 'pcm_mulaw' | 'pcm_alaw';
  wordBoost?: string[];
  utteranceEndMs?: number;
  disablePartialTranscripts?: boolean;
}

// Transcript types
export interface TranscriptWord {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  confidence: number;
  start: number;
  end: number;
  words?: TranscriptWord[];
}

// Session transcript types
export interface SessionTranscript {
  sessionId: string;
  entries: TranscriptEntry[];
  duration: number;
  startTime: Date;
  endTime?: Date;
}

// Enhanced transcript entry (extends the existing one in session.ts)
export interface TranscriptEntry {
  id: string;
  timestamp: Date;
  speaker: string;
  speakerId: string;
  text: string;
  confidence?: number;
  aiProcessed?: boolean;
  isFinal: boolean;
  isPartial?: boolean;
}

// Real-time session metadata
export interface RealtimeSessionMetadata {
  sessionId: string;
  status: 'connecting' | 'connected' | 'transcribing' | 'disconnected' | 'error';
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  wordCount?: number;
}

// Transcription hook state
export interface TranscriptionState {
  isConnected: boolean;
  isTranscribing: boolean;
  currentPartialTranscript: string;
  finalTranscripts: string[];
  error: TranscriptionError | null;
}

// Error handling
export interface TranscriptionError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Token response from API
export interface AssemblyAITokenResponse {
  token: string;
  expiresAt: Date;
}

// Hook return types
export interface UseAudioCaptureReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  audioStream: MediaStream | null;
  error: string | null;
  sampleRate?: number; // Actual sample rate from AudioContext
}

export interface UseRealtimeTranscriptionReturn {
  isConnected: boolean;
  isTranscribing: boolean;
  currentTranscript: string;
  finalTranscripts: string[];
  startTranscription: () => Promise<void>;
  stopTranscription: () => Promise<void>;
  sendAudioData: (audioData: ArrayBuffer) => void;
  initializeTranscriber: () => Promise<void>;
  error: TranscriptionError | null;
}

export interface UseSessionTranscriptionReturn {
  // Recording controls
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  
  // Connection state
  isConnected: boolean;
  connectionStatus: RealtimeSessionMetadata['status'];
  
  // Transcript data
  currentPartialTranscript: string;
  transcripts: TranscriptEntry[];
  
  // Session info
  sessionDuration: number;
  
  // Error state
  error: TranscriptionError | null;
}
