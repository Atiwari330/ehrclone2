'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radio, Users, Clock, FileText, Mic } from 'lucide-react';
import Link from 'next/link';

interface SessionWithStatus {
  id: string;
  createdAt: string;
  sessionType: string;
  sessionStatus: string;
  scheduledAt: string;
  endedAt: string | null;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  provider: {
    id: string;
    title: string;
  };
  hasTranscript: boolean;
  hasNote: boolean;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Filter active sessions (ongoing)
  const activeSessions = sessions.filter(
    (s) => s.sessionStatus === 'active' || s.sessionStatus === 'recording'
  );

  // Calculate stats
  const activeCount = activeSessions.length;
  const completedCount = sessions.filter(s => s.sessionStatus === 'completed').length;
  const avgDuration = sessions.length > 0
    ? Math.round(
        sessions
          .filter(s => s.endedAt)
          .reduce((acc, s) => {
            const duration = new Date(s.endedAt!).getTime() - new Date(s.scheduledAt).getTime();
            return acc + duration / 1000 / 60; // Convert to minutes
          }, 0) / sessions.filter(s => s.endedAt).length || 0
      )
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sessions</h1>
        <p className="text-muted-foreground">
          Monitor session recordings and transcriptions
        </p>
      </div>
      
      {/* Status cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-red-500 animate-pulse" />
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <p className="text-2xl font-bold">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Session Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <p className="text-2xl font-bold">{avgDuration} min</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sessions list */}
      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading sessions...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error: {error}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sessions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Radio className={`h-5 w-5 ${
                        session.sessionStatus === 'active' || session.sessionStatus === 'recording'
                          ? 'text-red-500 animate-pulse' 
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {session.patient.firstName} {session.patient.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.provider.title || 'Provider'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Status indicators */}
                    <div className="flex items-center gap-2">
                      {session.hasTranscript && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                          <Mic className="h-3 w-3" />
                          <span>Transcript</span>
                        </div>
                      )}
                      {session.hasNote && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                          <FileText className="h-3 w-3" />
                          <span>Note</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {session.sessionStatus === 'active' ? 'Active' : 
                         session.sessionStatus === 'recording' ? 'Recording' :
                         session.sessionStatus === 'completed' ? 'Completed' : 
                         session.sessionStatus}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <Link href={`/dashboard/sessions/${session.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
