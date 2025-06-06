// Session-related type definitions for the EHR system

export type SessionStatus = 
  | 'scheduled'
  | 'initializing' 
  | 'active'
  | 'paused'
  | 'ended'
  | 'cancelled';

export type SessionType = 'in-person' | 'virtual';

export interface SessionParticipant {
  id: string;
  name: string;
  role: 'provider' | 'patient' | 'supervisor';
  joinedAt?: Date;
  leftAt?: Date;
}

export interface TranscriptEntry {
  id: string;
  timestamp: Date;
  speaker: string;
  speakerId: string;
  text: string;
  confidence?: number;
  aiProcessed?: boolean;
}

export interface MedicalSession {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  type: SessionType;
  status: SessionStatus;
  scheduledStart: Date;
  actualStart?: Date;
  actualEnd?: Date;
  participants: SessionParticipant[];
  transcript: TranscriptEntry[];
  recordingUrl?: string;
  noteId?: string;
  metadata: {
    serviceType?: string;
    appointmentReason?: string;
    location?: string;
    zoomMeetingId?: string;
  };
}

export interface SessionAIState {
  isProcessing: boolean;
  lastProcessedTimestamp?: Date;
  extractedData?: {
    chiefComplaint?: string;
    hpi?: string;
    reviewOfSystems?: string[];
    assessment?: string;
    plan?: string[];
  };
  suggestions?: {
    followUpQuestions?: string[];
    relevantHistory?: string[];
    possibleDiagnoses?: string[];
  };
}

export interface SessionActions {
  startSession: () => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  endSession: () => Promise<void>;
  addTranscriptEntry: (entry: Omit<TranscriptEntry, 'id'>) => void;
  updateAIState: (state: Partial<SessionAIState>) => void;
  addParticipant: (participant: SessionParticipant) => void;
  removeParticipant: (participantId: string) => void;
}

export interface SessionContextValue {
  session: MedicalSession | null;
  aiState: SessionAIState;
  actions: SessionActions;
  isLoading: boolean;
  error: string | null;
}
