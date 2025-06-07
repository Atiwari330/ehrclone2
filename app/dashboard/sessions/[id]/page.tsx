'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Pause,
  Play,
  StopCircle,
  Users,
  Clock,
  AlertCircle,
  Loader2,
  Wifi,
  WifiOff,
  FlaskConical
} from 'lucide-react';
import { SessionProvider } from '@/contexts/session-context';
import { useSessionManager, useTranscriptScroll } from '@/hooks/use-session';
import { useSessionTranscription } from '@/hooks/use-session-transcription';
import { MedicalSession } from '@/lib/types/session';
import { getMockTherapyTranscript } from '@/lib/mock-data/therapy-session-transcript';

// Mock session data for testing
const mockSession: MedicalSession = {
  id: '550e8400-e29b-41d4-a716-446655440001', // Valid UUID
  patientId: '550e8400-e29b-41d4-a716-446655440002', // Valid UUID
  patientName: 'John Doe',
  providerId: '550e8400-e29b-41d4-a716-446655440003', // Valid UUID
  providerName: 'Dr. Sarah Johnson',
  type: 'virtual',
  status: 'scheduled',
  scheduledStart: new Date(),
  participants: [
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Dr. Sarah Johnson',
      role: 'provider',
      joinedAt: new Date(),
    }
  ],
  transcript: [],
  metadata: {
    serviceType: 'Follow-up Visit',
    appointmentReason: 'Diabetes management follow-up',
    zoomMeetingId: '123-456-789',
  },
};

function SessionContent() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const {
    session,
    isLoading,
    error,
    transcriptLength,
    aiSuggestions,
    medicalData,
    endSession,
    sessionDuration,
    isSessionActive,
    canStartSession,
    canEndSession,
    addTranscriptEntry,
  } = useSessionManager({ sessionId, autoStart: false });
  
  // Real-time transcription hook
  const {
    isRecording,
    startRecording,
    stopRecording,
    isConnected,
    connectionStatus,
    currentPartialTranscript,
    error: transcriptionError,
  } = useSessionTranscription();
  
  const { containerRef, handleScroll, scrollToBottom, isAtBottom } = useTranscriptScroll(session?.transcript || []);
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isLoadingMockData, setIsLoadingMockData] = useState(false);
  const [isSavingTranscript, setIsSavingTranscript] = useState(false);
  
  // Handle loading mock transcript for testing
  const handleLoadMockTranscript = async () => {
    setIsLoadingMockData(true);
    try {
      const mockEntries = getMockTherapyTranscript();
      
      // Add entries one by one with a small delay to simulate real-time transcription
      for (const entry of mockEntries) {
        if (addTranscriptEntry) {
          addTranscriptEntry(entry);
        }
        // Small delay to make it feel more realistic
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      console.log(`[SessionPage] Loaded ${mockEntries.length} mock transcript entries`);
    } catch (error) {
      console.error('[SessionPage] Error loading mock transcript:', error);
    } finally {
      setIsLoadingMockData(false);
    }
  };
  
  // Format session duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle session end
  const handleEndSession = async () => {
    console.log('[SessionPage] handleEndSession called');
    if (isRecording) {
      console.log('[SessionPage] Stopping recording before ending session...');
      await stopRecording();
    }
    await endSession();
    router.push('/dashboard/sessions');
  };
  
  // Handle recording toggle
  const handleRecordingToggle = async () => {
    console.log('[SessionPage] handleRecordingToggle called, isRecording:', isRecording);
    try {
      if (isRecording) {
        console.log('[SessionPage] Stopping recording via toggle...');
        await stopRecording();
      } else {
        console.log('[SessionPage] Starting recording via toggle...');
        await startRecording();
      }
    } catch (err) {
      console.error('[SessionPage] Failed to toggle recording:', err);
      // The error will be available in the transcriptionError state
    }
  };

  // Display transcription errors in the UI
  useEffect(() => {
    if (transcriptionError) {
      console.error('Transcription error details:', transcriptionError);
    }
  }, [transcriptionError]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Error: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p>Session not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-background">
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Session header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{session.patientName}</h1>
              <p className="text-muted-foreground">
                {session.metadata.serviceType} • {session.metadata.appointmentReason}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(sessionDuration)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{session.participants.length}</span>
              </div>
              {isSessionActive && (
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Recording</span>
                </div>
              )}
              
              {/* Connection status indicator */}
              {isSessionActive && (
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${
                    connectionStatus === 'disconnected' ? 'bg-red-500' :
                    connectionStatus === 'transcribing' ? 'bg-green-500 animate-pulse' :
                    'bg-green-500'
                  }`} />
                  <span className="text-sm text-muted-foreground">
                    {connectionStatus === 'disconnected' ? 'Disconnected' :
                     connectionStatus === 'transcribing' ? 'Transcribing' :
                     'Connected'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Video area */}
        <div className="flex-1 bg-black relative">
          {/* Placeholder for video */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Video placeholder</p>
              <p className="text-sm opacity-75 mt-2">
                {session.type === 'virtual' ? 'Zoom integration pending' : 'In-person session'}
              </p>
            </div>
          </div>
          
          {/* Control bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant={isVideoOn ? "secondary" : "destructive"}
                size="icon"
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              
              <Button
                variant={isMicOn ? "secondary" : "destructive"}
                size="icon"
                onClick={() => setIsMicOn(!isMicOn)}
              >
                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              
              {canStartSession && !isRecording && (
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleRecordingToggle}
                  className="px-8"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </Button>
              )}
              
              {isSessionActive && (
                <>
                  {isRecording && (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={handleRecordingToggle}
                      className="px-8"
                    >
                      <MicOff className="h-5 w-5 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                  
                  {!isRecording && session.transcript.length > 0 && (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={handleRecordingToggle}
                      className="px-8"
                    >
                      <Mic className="h-5 w-5 mr-2" />
                      Resume Recording
                    </Button>
                  )}
                  
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleEndSession}
                    className="px-8"
                  >
                    <PhoneOff className="h-5 w-5 mr-2" />
                    End Session
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Right sidebar - Transcript panel */}
      <div className="w-96 border-l flex flex-col bg-background">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Live Transcript</h2>
          <p className="text-sm text-muted-foreground">
            {transcriptLength} entries • Auto-scroll {isAtBottom ? 'on' : 'off'}
          </p>
        </div>
        
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {/* Show skeleton loader when connecting to transcription service */}
          {isRecording && connectionStatus === 'connecting' && session.transcript.length === 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Connecting to transcription service...</span>
              </div>
              {/* Skeleton placeholders for transcript entries */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : session.transcript.length === 0 && !currentPartialTranscript ? (
            <div className="text-center text-muted-foreground py-8 space-y-4">
              <p>Transcript will appear here once the session starts</p>
              
              {/* Test Data Button - Only show in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="pt-4 border-t border-dashed">
                  <p className="text-xs text-amber-600 mb-2">🧪 Testing Mode</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadMockTranscript}
                    disabled={isLoadingMockData}
                    className="gap-2"
                  >
                    {isLoadingMockData ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading Mock Data...
                      </>
                    ) : (
                      <>
                        <FlaskConical className="h-4 w-4" />
                        Load Test Transcript
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Loads a realistic therapy session for testing
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {session.transcript.map((entry) => (
                <div key={entry.id} className="space-y-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-medium text-sm">
                      {entry.speaker}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    {entry.confidence && entry.confidence < 0.8 && (
                      <span className="text-xs text-amber-600">
                        ({Math.round(entry.confidence * 100)}% confidence)
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{entry.text}</p>
                </div>
              ))}
              
              {/* Show partial transcript while speaking */}
              {currentPartialTranscript && (
                <div className="space-y-1 opacity-70">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-medium text-sm">Speaker</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </span>
                    <span className="text-xs text-blue-600">
                      (speaking...)
                    </span>
                  </div>
                  <p className="text-sm italic">{currentPartialTranscript}</p>
                </div>
              )}
            </>
          )}
          
          {!isAtBottom && transcriptLength > 5 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => scrollToBottom()}
              className="sticky bottom-0 w-full"
            >
              Scroll to bottom
            </Button>
          )}
          
          {/* Show error if transcription failed */}
          {transcriptionError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Transcription Error</p>
                  <p className="text-xs text-red-600 mt-1">{transcriptionError.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <Separator />
        
        {/* Save & Review button */}
        {session.transcript.length > 0 && (
          <div className="p-4 border-b">
            <Button
              variant="default"
              className="w-full"
              disabled={isSavingTranscript}
              onClick={async () => {
                setIsSavingTranscript(true);
                try {
                  // Stop recording if currently recording
                  if (isRecording) {
                    console.log('[SessionPage] Stopping recording before saving...');
                    await stopRecording();
                  }
                  
                  // Calculate session duration
                  const startTime = session.transcript[0]?.timestamp || new Date();
                  const endTime = session.transcript[session.transcript.length - 1]?.timestamp || new Date();
                  const calculatedDuration = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000);
                  // Ensure minimum duration of 1 second
                  const duration = Math.max(1, calculatedDuration);
                  
                  // Debug log the data being sent
                  const requestData = {
                    entries: session.transcript,
                    duration,
                    startTime,
                    endTime,
                  };
                  console.log('[Frontend] Sending transcript data:', {
                    sessionId,
                    entriesCount: requestData.entries.length,
                    duration: requestData.duration,
                    startTime: requestData.startTime,
                    endTime: requestData.endTime,
                    firstEntry: requestData.entries[0],
                    lastEntry: requestData.entries[requestData.entries.length - 1],
                  });
                  
                  // Save transcript to database
                  const response = await fetch(`/api/sessions/${sessionId}/transcript`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                  });
                  
                  if (!response.ok) {
                    throw new Error('Failed to save transcript');
                  }
                  
                  const data = await response.json();
                  console.log('Transcript saved:', data.transcriptId);
                  
                  // Navigate to review page
                  router.push(`/dashboard/sessions/${sessionId}/review`);
                } catch (error) {
                  console.error('Error saving transcript:', error);
                  // TODO: Show error toast
                } finally {
                  setIsSavingTranscript(false);
                }
              }}
            >
              {isSavingTranscript ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isRecording ? (
                'Stop Recording & Save'
              ) : (
                'Save & Review'
              )}
            </Button>
          </div>
        )}
        
        {/* AI Suggestions panel */}
        <div className="p-4 space-y-3">
          <h3 className="text-sm font-medium">AI Suggestions</h3>
          
          {aiSuggestions.followUpQuestions && aiSuggestions.followUpQuestions.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
              <div className="space-y-1">
                {aiSuggestions.followUpQuestions.slice(0, 3).map((question, i) => (
                  <p key={i} className="text-xs bg-muted p-2 rounded">
                    {question}
                  </p>
                ))}
              </div>
            </div>
          )}
          
          {medicalData.chiefComplaint && (
            <div>
              <p className="text-xs text-muted-foreground">Chief Complaint:</p>
              <p className="text-sm font-medium">{medicalData.chiefComplaint}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LiveSessionPage() {
  return (
    <SessionProvider initialSession={mockSession}>
      <SessionContent />
    </SessionProvider>
  );
}
