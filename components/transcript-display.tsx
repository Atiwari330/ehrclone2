'use client';

import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Edit, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { TranscriptEntry } from '@/lib/types/transcription';
import { 
  TranscriptHighlight, 
  AIInsightsState,
  DEFAULT_HIGHLIGHT_CONFIG 
} from '@/lib/types/ai-insights';
import { transcriptHighlighter } from '@/lib/services/transcript-highlighter';
import { InsightPopover } from '@/components/insight-popover';
import { cn } from '@/lib/utils';

interface TranscriptDisplayProps {
  entries: TranscriptEntry[];
  readOnly?: boolean;
  onEditEntry?: (entryId: string) => void;
  className?: string;
  // New props for AI insights integration
  insights?: AIInsightsState | null;
  enableHighlighting?: boolean;
  onAddToNote?: (highlight: TranscriptHighlight, content: string) => void;
  onFlagForReview?: (highlight: TranscriptHighlight, reason: string) => void;
  onCopyText?: (text: string) => void;
  showHighlightToggle?: boolean;
}

export function TranscriptDisplay({
  entries,
  readOnly = true,
  onEditEntry,
  className = '',
  insights = null,
  enableHighlighting = true,
  onAddToNote,
  onFlagForReview,
  onCopyText,
  showHighlightToggle = true,
}: TranscriptDisplayProps) {
  const [highlightsVisible, setHighlightsVisible] = useState(enableHighlighting);
  const [performanceMode, setPerformanceMode] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [visibleEntries, setVisibleEntries] = useState<Set<string>>(new Set());

  // Generate highlights using the transcript highlighter
  const highlights = useMemo(() => {
    if (!insights || !highlightsVisible || !enableHighlighting) {
      return [];
    }

    console.log('[TranscriptDisplay] Generating highlights:', {
      entriesCount: entries.length,
      hasInsights: !!insights,
      highlightsVisible,
      timestamp: Date.now()
    });

    const generatedHighlights = transcriptHighlighter.generateHighlights(
      entries,
      insights
    );

    console.log('[TranscriptDisplay] Highlights generated:', {
      highlightCount: generatedHighlights.length,
      metrics: transcriptHighlighter.getMetrics(),
      timestamp: Date.now()
    });

    return generatedHighlights;
  }, [entries, insights, highlightsVisible, enableHighlighting]);

  // Group highlights by entry ID for efficient lookup
  const highlightsByEntry = useMemo(() => {
    const grouped = new Map<string, TranscriptHighlight[]>();
    
    highlights.forEach(highlight => {
      const existing = grouped.get(highlight.entryId) || [];
      grouped.set(highlight.entryId, [...existing, highlight]);
    });

    return grouped;
  }, [highlights]);

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

  const handleToggleHighlights = useCallback(() => {
    setHighlightsVisible(prev => {
      const newValue = !prev;
      console.log('[TranscriptDisplay] Toggle highlights:', {
        from: prev,
        to: newValue,
        timestamp: Date.now()
      });
      return newValue;
    });
  }, []);

  // Render highlighted text with popovers
  const renderHighlightedText = useCallback((
    entry: TranscriptEntry,
    entryHighlights: TranscriptHighlight[]
  ) => {
    if (!entryHighlights.length || !insights) {
      return <span>{entry.text}</span>;
    }

    // Sort highlights by start position
    const sortedHighlights = [...entryHighlights].sort((a, b) => a.startIndex - b.startIndex);
    
    const segments: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedHighlights.forEach((highlight, idx) => {
      // Add text before highlight
      if (highlight.startIndex > lastIndex) {
        segments.push(
          <span key={`text-${idx}-before`}>
            {entry.text.substring(lastIndex, highlight.startIndex)}
          </span>
        );
      }

      // Add highlighted text with popover
      const highlightedText = entry.text.substring(highlight.startIndex, highlight.endIndex);
      
      segments.push(
        <InsightPopover
          key={`highlight-${highlight.insightId}-${idx}`}
          highlight={highlight}
          transcriptEntry={entry}
          insights={insights}
          onAddToNote={onAddToNote}
          onFlagForReview={onFlagForReview}
          onCopyText={onCopyText}
          className={cn(
            "px-0.5 rounded transition-colors",
            highlightsVisible && "cursor-help"
          )}
        >
          <span
            style={{
              backgroundColor: highlightsVisible ? highlight.color : 'transparent',
              opacity: highlightsVisible ? DEFAULT_HIGHLIGHT_CONFIG.safety[highlight.severity].opacity : 1
            }}
            className="transition-all duration-200"
          >
            {highlightedText}
          </span>
        </InsightPopover>
      );

      lastIndex = highlight.endIndex;
    });

    // Add remaining text
    if (lastIndex < entry.text.length) {
      segments.push(
        <span key="text-final">
          {entry.text.substring(lastIndex)}
        </span>
      );
    }

    return <>{segments}</>;
  }, [insights, highlightsVisible, onAddToNote, onFlagForReview, onCopyText]);

  // Render individual transcript entry
  const renderEntry = useCallback((entry: TranscriptEntry, index: number) => {
    const entryHighlights = highlightsByEntry.get(entry.id) || [];
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
              {entryHighlights.length > 0 && highlightsVisible && (
                <div className="inline-flex gap-1">
                  {Array.from(new Set(entryHighlights.map(h => h.type))).map(type => (
                    <Badge 
                      key={type} 
                      variant="outline" 
                      className="text-xs px-1 py-0"
                    >
                      {entryHighlights.filter(h => h.type === type).length} {type}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <p className={cn(
              "text-sm leading-relaxed",
              entry.isPartial && "italic opacity-70"
            )}>
              {isVisible ? (
                renderHighlightedText(entry, entryHighlights)
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
  }, [highlightsByEntry, performanceMode, visibleEntries, readOnly, onEditEntry, highlightsVisible, renderHighlightedText]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Highlight Toggle */}
      {showHighlightToggle && insights && highlights.length > 0 && (
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">AI Insights Highlighting</span>
            <Badge variant="outline" className="text-xs">
              {highlights.length} insights
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleHighlights}
            className="flex items-center gap-2"
          >
            {highlightsVisible ? (
              <>
                <EyeOff className="h-3 w-3" />
                Hide Highlights
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" />
                Show Highlights
              </>
            )}
          </Button>
        </div>
      )}

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
