'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radio, Users, Clock } from 'lucide-react';

const mockActiveSessions = [
  {
    id: '1',
    patientName: 'John Doe',
    provider: 'Dr. Sarah Johnson',
    startTime: '10:00 AM',
    duration: '15 min',
    status: 'recording',
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    provider: 'Dr. Michael Chen',
    startTime: '10:30 AM',
    duration: '8 min',
    status: 'transcribing',
  },
];

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Sessions</h1>
        <p className="text-muted-foreground">
          Monitor ongoing virtual sessions and transcriptions
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
              <p className="text-2xl font-bold">{mockActiveSessions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Providers Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <p className="text-2xl font-bold">4</p>
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
              <p className="text-2xl font-bold">22 min</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Active sessions list */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {mockActiveSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active sessions at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockActiveSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Radio className={`h-5 w-5 ${
                        session.status === 'recording' 
                          ? 'text-red-500 animate-pulse' 
                          : 'text-blue-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{session.patientName}</p>
                      <p className="text-sm text-muted-foreground">{session.provider}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {session.status === 'recording' ? 'Recording' : 'Transcribing'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Started {session.startTime} • {session.duration}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
