'use client';

import { format } from 'date-fns';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { TranscriptEntry } from '@/lib/types/transcription';

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
  return (
    <div className={`space-y-4 ${className}`}>
      {entries.map((entry, index) => (
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
                {entry.isPartial && (
                  <span className="text-xs text-blue-600">
                    (speaking...)
                  </span>
                )}
              </div>
              <p className={`text-sm leading-relaxed ${entry.isPartial ? 'italic opacity-70' : ''}`}>
                {entry.text}
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
      ))}
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
