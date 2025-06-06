'use client';

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TimeSavingsBannerProps {
  weeklySavedMinutes: number;
}

export function TimeSavingsBanner({ weeklySavedMinutes }: TimeSavingsBannerProps) {
  const [displayMinutes, setDisplayMinutes] = useState(0);
  
  // Animate the number on mount
  useEffect(() => {
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = weeklySavedMinutes / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setDisplayMinutes(Math.floor(increment * currentStep));
      } else {
        setDisplayMinutes(weeklySavedMinutes);
        clearInterval(timer);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [weeklySavedMinutes]);
  
  const hours = Math.floor(displayMinutes / 60);
  const minutes = displayMinutes % 60;
  
  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">
              You're saving
            </p>
            <p className="text-3xl font-bold">
              {hours > 0 && `${hours} h `}{minutes} m
            </p>
            <p className="text-sm font-medium opacity-90">
              this week
            </p>
          </div>
          <TrendingUp className="h-12 w-12 opacity-20" />
        </div>
      </CardContent>
    </Card>
  );
}
