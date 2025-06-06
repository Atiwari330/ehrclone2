'use client';

import { Building2, Laptop } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SessionCardProps {
  patientName: string;
  patientPhoto?: string;
  serviceType: string;
  location: 'office' | 'virtual';
  scheduledTime: string;
  onStartSession: () => void;
}

export function SessionCard({
  patientName,
  patientPhoto,
  serviceType,
  location,
  scheduledTime,
  onStartSession,
}: SessionCardProps) {
  const LocationIcon = location === 'office' ? Building2 : Laptop;
  
  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted">
            {patientPhoto ? (
              <Image
                src={patientPhoto}
                alt={patientName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-semibold">
                {patientName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">{patientName}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <LocationIcon className="h-3.5 w-3.5" />
              {serviceType}
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {scheduledTime}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          onClick={onStartSession}
          className="w-full"
          size="sm"
        >
          Start Session
        </Button>
      </CardContent>
    </Card>
  );
}
