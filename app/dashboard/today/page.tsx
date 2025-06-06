'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SessionCard } from '@/components/session-card';
import { TimeSavingsBanner } from '@/components/time-savings-banner';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data - in a real app, this would come from the database
const mockSessions = [
  {
    id: '1',
    patientName: 'John Doe',
    patientPhoto: undefined,
    serviceType: 'Initial Consultation',
    location: 'office' as const,
    scheduledTime: '9:00 AM',
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    patientPhoto: undefined,
    serviceType: 'Follow-up',
    location: 'virtual' as const,
    scheduledTime: '10:30 AM',
  },
  {
    id: '3',
    patientName: 'Robert Johnson',
    patientPhoto: undefined,
    serviceType: 'Therapy Session',
    location: 'office' as const,
    scheduledTime: '2:00 PM',
  },
  {
    id: '4',
    patientName: 'Emily Davis',
    patientPhoto: undefined,
    serviceType: 'Medication Review',
    location: 'virtual' as const,
    scheduledTime: '3:30 PM',
  },
];

export default function TodayPage() {
  const router = useRouter();
  const [isLoading] = useState(false);
  
  // Mock time saved - 102 minutes (1h 42m)
  const weeklySavedMinutes = 102;
  
  const handleStartSession = (sessionId: string) => {
    // Navigate to the live session page
    router.push(`/dashboard/sessions/${sessionId}`);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Today</h1>
        <p className="text-muted-foreground">
          Your schedule for {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      
      <TimeSavingsBanner weeklySavedMinutes={weeklySavedMinutes} />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Sessions</h2>
        
        {mockSessions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              No sessions scheduled for today
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockSessions.map((session) => (
              <SessionCard
                key={session.id}
                patientName={session.patientName}
                patientPhoto={session.patientPhoto}
                serviceType={session.serviceType}
                location={session.location}
                scheduledTime={session.scheduledTime}
                onStartSession={() => handleStartSession(session.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
