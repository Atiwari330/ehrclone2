'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft,
  Clock,
  Calendar,
  User,
  FileText,
  Download,
  Edit,
  AlertCircle,
  Loader2,
  CheckCircle,
  Activity,
  ChevronRight,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Transcript } from '@/lib/db/schema';
import type { TranscriptEntry } from '@/lib/types/transcription';

interface TranscriptWithEntries extends Omit<Transcript, 'entries'> {
  entries: TranscriptEntry[];
}

export default function TranscriptReviewPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [transcript, setTranscript] = useState<TranscriptWithEntries | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Fetch transcript data
  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/sessions/${sessionId}/transcript`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch transcript');
        }
        
        const data = await response.json();
        setTranscript(data.transcript);
        
        // TODO: Also fetch session details
        // For now, using mock data
        setSession({
          id: sessionId,
          patientName: 'John Doe',
          providerName: 'Dr. Sarah Johnson',
          type: 'virtual',
          metadata: {
            serviceType: 'Follow-up Visit',
            appointmentReason: 'Diabetes management follow-up',
          }
        });
        
      } catch (err) {
        console.error('Error fetching transcript:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transcript');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTranscript();
  }, [sessionId]);
  
  const handleGenerateNote = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/generate-note`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate note');
      }

      const result = await response.json();
      if (result.draftId) {
        router.push(`/dashboard/drafts/${result.draftId}`);
      } else {
        throw new Error('Failed to get draft ID from server');
      }
    } catch (err) {
      console.error('Error generating note:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };
  
  // Calculate statistics
  const getTranscriptStats = () => {
    if (!transcript) return { speakerCount: 0, avgConfidence: 0 };
    
    const speakers = new Set(transcript.entries.map(e => e.speakerId));
    const confidences = transcript.entries
      .filter(e => e.confidence !== undefined)
      .map(e => e.confidence as number);
    
    const avgConfidence = confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;
    
    return {
      speakerCount: speakers.size,
      avgConfidence: Math.round(avgConfidence * 100),
    };
  };
  
  const stats = getTranscriptStats();
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Skeleton breadcrumb */}
        <div className="flex items-center space-x-2 mb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Skeleton header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skeleton transcript area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-start space-x-3">
                        <Skeleton className="h-4 w-20" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-baseline space-x-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                      {i < 5 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skeleton sidebar */}
          <div className="space-y-4">
            {/* Session info skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-36" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stats skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-20" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Separator className="my-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !transcript) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error || 'Transcript not found'}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/sessions/${sessionId}`)}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard/sessions" className="hover:text-foreground flex items-center">
          <Home className="h-4 w-4 mr-1" />
          Sessions
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/dashboard/sessions/${sessionId}`} className="hover:text-foreground">
          Session Detail
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Review Transcript</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/sessions/${sessionId}`)}
            title="Back to Session"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Transcript Review</h1>
            <p className="text-muted-foreground">
              Review and verify the session transcript before generating clinical notes
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              // TODO: Implement export functionality
              console.log('Export transcript');
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="default"
            onClick={handleGenerateNote}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Clinical Note'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main transcript area */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] overflow-y-auto pr-4">
                <div className="space-y-4">
                  {transcript.entries.map((entry, index) => (
                    <div key={entry.id} className="group relative">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-20 text-right">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(entry.timestamp), 'HH:mm:ss')}
                          </span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-baseline space-x-2">
                            <span className="font-medium text-sm">
                              {entry.speaker}
                            </span>
                            {entry.confidence && entry.confidence < 0.8 && (
                              <span className="text-xs text-amber-600">
                                ({Math.round(entry.confidence * 100)}% confidence)
                              </span>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed">{entry.text}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            // TODO: Implement edit functionality
                            console.log('Edit entry:', entry.id);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      {index < transcript.entries.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar with metadata */}
        <div className="space-y-4">
          {/* Session info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Patient</p>
                  <p className="text-sm text-muted-foreground">{session?.patientName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Provider</p>
                  <p className="text-sm text-muted-foreground">{session?.providerName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transcript.startTime), 'PPP')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(transcript.duration)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Transcript stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transcript Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Total Entries</p>
                <p className="text-2xl font-bold">{transcript.entries.length}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Word Count</p>
                <p className="text-2xl font-bold">{transcript.wordCount || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Speakers</p>
                <p className="text-2xl font-bold">{stats.speakerCount}</p>
              </div>
              
              {stats.avgConfidence > 0 && (
                <div>
                  <p className="text-sm font-medium">Average Confidence</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold">{stats.avgConfidence}%</p>
                    {stats.avgConfidence >= 80 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // TODO: Implement re-transcribe
                  console.log('Re-transcribe audio');
                }}
              >
                <Activity className="h-4 w-4 mr-2" />
                Re-transcribe Audio
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // TODO: Implement manual edit mode
                  console.log('Edit transcript');
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Transcript
              </Button>
              
              <Separator className="my-4" />
              
              <Button
                variant="default"
                className="w-full"
                onClick={handleGenerateNote}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Clinical Note'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
