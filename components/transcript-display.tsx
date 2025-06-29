'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { TranscriptEntry } from '@/lib/types/transcription';
import { cn } from '@/lib/utils';

interface TranscriptDisplayProps {
  entries: TranscriptEntry[];
  readOnly?: boolean;
  onEditEntry?: (entryId: string) => void;
  className?: string;
}

export function TranscriptDisplay({
  entries,
  readOnly = true,
  onEditEntry,
  className = '',
}: TranscriptDisplayProps) {
  const [performanceMode, setPerformanceMode] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [visibleEntries, setVisibleEntries] = useState<Set<string>>(new Set());

  // Enable performance mode for large transcripts
  useEffect(() => {
    const shouldUsePerformanceMode = entries.length > 500;
    setPerformanceMode(shouldUsePerformanceMode);
    
    console.log('[TranscriptDisplay] Performance mode:', {
      enabled: shouldUsePerformanceMode,
      entryCount: entries.length,
      timestamp: Date.now()
    });
  }, [entries.length]);

  // Set up intersection observer for virtualization
  useEffect(() => {
    if (!performanceMode) return;

    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const updates = new Map<string, boolean>();
      
      entries.forEach(entry => {
        const entryId = entry.target.getAttribute('data-entry-id');
        if (entryId) {
          updates.set(entryId, entry.isIntersecting);
        }
      });

      setVisibleEntries(prev => {
        const newSet = new Set(prev);
        updates.forEach((isVisible, id) => {
          if (isVisible) {
            newSet.add(id);
          } else {
            newSet.delete(id);
          }
        });
        return newSet;
      });
    }, options);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [performanceMode]);

  // Render individual transcript entry
  const renderEntry = useCallback((entry: TranscriptEntry, index: number) => {
    const isVisible = !performanceMode || visibleEntries.has(entry.id);
    
    return (
      <div 
        key={entry.id} 
        className="group relative"
        data-entry-id={entry.id}
        ref={(el) => {
          if (el && performanceMode && observerRef.current) {
            observerRef.current.observe(el);
          }
        }}
      >
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
              {entry.isPartial && (
                <span className="text-xs text-blue-600">
                  (speaking...)
                </span>
              )}
            </div>
            <p className={cn(
              "text-sm leading-relaxed",
              entry.isPartial && "italic opacity-70"
            )}>
              {isVisible ? (
                <span>{entry.text}</span>
              ) : (
                <span className="text-muted-foreground">Loading...</span>
              )}
            </p>
          </div>
          {!readOnly && onEditEntry && !entry.isPartial && (
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onEditEntry(entry.id)}
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </div>
        {index < entries.length - 1 && (
          <Separator className="mt-4" />
        )}
      </div>
    );
  }, [performanceMode, visibleEntries, readOnly, onEditEntry]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Performance Mode Indicator */}
      {performanceMode && (
        <div className="text-xs text-muted-foreground text-center">
          Performance mode enabled for large transcript ({entries.length} entries)
        </div>
      )}

      {/* Transcript Entries */}
      {entries.map((entry, index) => renderEntry(entry, index))}
    </div>
  );
}

// Compact version for smaller displays
export function CompactTranscriptDisplay({
  entries,
  className = '',
}: {
  entries: TranscriptEntry[];
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {entries.map((entry) => (
        <div key={entry.id} className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className="font-medium text-sm">
              {entry.speaker}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(entry.timestamp), 'HH:mm:ss')}
            </span>
            {entry.confidence && entry.confidence < 0.8 && (
              <span className="text-xs text-amber-600">
                ({Math.round(entry.confidence * 100)}%)
              </span>
            )}
          </div>
          <p className={`text-sm ${entry.isPartial ? 'italic opacity-70' : ''}`}>
            {entry.text}
          </p>
        </div>
      ))}
    </div>
  );
}
