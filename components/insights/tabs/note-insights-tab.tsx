'use client';

/**
 * Note Insights Tab Component
 * 
 * Displays AI-generated clinical notes in SOAP format (Subjective, Objective, Assessment, Plan).
 * Follows the same progressive disclosure patterns as other insight tabs.
 * 
 * OPTIMIZED: React.memo wrapper and profiling for efficient re-renders
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Clock, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Copy,
  Download,
  Edit
} from 'lucide-react';
import { NoteGenerationInsights, NoteSection } from '@/lib/types/ai-insights';
import { cn } from '@/lib/utils';
import { InsightSummaryCard } from '../insight-summary-card';

interface NoteInsightsTabProps {
  data: NoteGenerationInsights | null;
  isLoading?: boolean;
  error?: Error | null;
  onCopyNote?: () => void;
  onDownloadNote?: () => void;
  onEditNote?: () => void;
  className?: string;
}

export function NoteInsightsTab({
  data: insights,
  isLoading = false,
  error = null,
  onCopyNote,
  onDownloadNote,
  onEditNote,
  className
}: NoteInsightsTabProps) {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set());
  const [showAllSections, setShowAllSections] = React.useState(true);

  console.log('[NoteInsightsTab] Rendering:', {
    hasInsights: !!insights,
    isLoading,
    hasError: !!error,
    sectionCount: insights?.sections?.length || 0,
    confidence: insights?.confidence,
    expandedSections: Array.from(expandedSections),
    showAllSections,
    timestamp: Date.now()
  });

  // Handle section expansion
  const toggleSection = React.useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      
      console.log('[NoteInsightsTab] Section toggled:', {
        sectionId,
        expanded: newSet.has(sectionId),
        totalExpanded: newSet.size,
        timestamp: Date.now()
      });
      
      return newSet;
    });
  }, []);

  // Handle show all sections toggle
  const toggleShowAllSections = React.useCallback(() => {
    setShowAllSections(prev => {
      console.log('[NoteInsightsTab] Show all sections toggled:', {
        wasShowing: prev,
        willShow: !prev,
        timestamp: Date.now()
      });
      return !prev;
    });
  }, []);

  // Component lifecycle logging
  React.useEffect(() => {
    console.log('[NoteInsightsTab] Tab mounted:', {
      hasData: !!insights,
      isLoading,
      hasError: !!error,
      timestamp: Date.now()
    });

    return () => {
      console.log('[NoteInsightsTab] Tab unmounted:', {
        timestamp: Date.now()
      });
    };
  }, [insights, isLoading, error]);

  if (isLoading) {
    return <NoteInsightsLoading className={className} />;
  }

  if (error) {
    return <NoteInsightsError error={error} className={className} />;
  }

  if (!insights || !insights.sections || insights.sections.length === 0) {
    return <NoteInsightsEmpty className={className} />;
  }

  const { sections, confidence } = insights;
  
  // Sort sections in SOAP order
  const soapOrder = ['subjective', 'objective', 'assessment', 'plan'];
  const sortedSections = [...sections].sort((a, b) => {
    const aIndex = soapOrder.indexOf(a.type);
    const bIndex = soapOrder.indexOf(b.type);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  // Progressive disclosure: Show first 2 sections by default
  const displayedSections = showAllSections ? sortedSections : sortedSections.slice(0, 2);
  const hiddenSectionsCount = sortedSections.length - displayedSections.length;

  return (
    <div className={cn('h-full flex flex-col', className)}>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">

          {/* SOAP Sections - Progressive Disclosure */}
          {sortedSections.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <h3 className="text-base font-medium">SOAP Documentation</h3>
                  <Badge variant="outline" className="text-xs">
                    {sections.length} sections
                  </Badge>
                </div>

                {hiddenSectionsCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleShowAllSections}
                    className="text-xs"
                  >
                    {showAllSections ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Show fewer
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        View all {sections.length} sections
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {displayedSections.map((section, idx) => (
                  <InsightSummaryCard
                    key={section.type || `note-section-${idx}`}
                    id={section.type}
                    title={section.title}
                    description={section.content.substring(0, 150) + (section.content.length > 150 ? '...' : '')}
                    expanded={expandedSections.has(section.type)}
                    onToggleExpanded={(expanded) => toggleSection(section.type)}
                  >
                    {/* Expanded Content - Full Section Text */}
                    <div className="space-y-3">
                      <div className="p-3 bg-background border rounded-lg">
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {section.content}
                          </div>
                        </div>
                      </div>

                      {/* Section Metadata */}
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Word count: {section.content.split(' ').length}</span>
                          <span>Confidence: {Math.round(section.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </InsightSummaryCard>
                ))}
              </div>
            </div>
          )}

          {/* Note Summary - Expandable */}
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('note-summary')}
              className="w-full justify-between p-3 h-auto"
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-base font-medium">Complete Note Preview</span>
                <Badge variant="outline" className="text-xs">
                  {sections.reduce((total, section) => total + section.content.split(' ').length, 0)} words
                </Badge>
              </div>
              {expandedSections.has('note-summary') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {expandedSections.has('note-summary') && (
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                {sortedSections.map((section, idx) => (
                  <div key={`summary-${section.type}-${idx}`} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSectionVariant(section.type)} className="text-xs">
                        {section.title}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(section.confidence * 100)}% confidence
                      </span>
                    </div>
                    <div className="p-3 bg-background border rounded text-sm leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

    </div>
  );
}

// Helper function to get section variant
function getSectionVariant(sectionType: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (sectionType) {
    case 'subjective':
      return 'default';
    case 'objective':
      return 'secondary';
    case 'assessment':
      return 'destructive';
    case 'plan':
      return 'outline';
    default:
      return 'outline';
  }
}

// Loading State
function NoteInsightsLoading({ className }: { className?: string }) {
  return (
    <div className={cn('h-full flex items-center justify-center', className)}>
      <div className="text-center space-y-2">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-muted-foreground">Generating clinical note...</p>
      </div>
    </div>
  );
}

// Error State
function NoteInsightsError({ 
  error, 
  className 
}: { 
  error: Error; 
  className?: string; 
}) {
  return (
    <div className={cn('h-full flex items-center justify-center', className)}>
      <div className="text-center space-y-2">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
        <p className="text-sm font-medium">Clinical Note Generation Failed</p>
        <p className="text-xs text-muted-foreground">
          {error.message || 'Failed to generate clinical note'}
        </p>
      </div>
    </div>
  );
}

// Empty State
function NoteInsightsEmpty({ className }: { className?: string }) {
  return (
    <div className={cn('h-full flex items-center justify-center', className)}>
      <div className="text-center space-y-2">
        <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">No clinical note available</p>
      </div>
    </div>
  );
}

// Performance optimization: Wrap component with React.memo to prevent unnecessary re-renders
const MemoizedNoteInsightsTab = React.memo(NoteInsightsTab, (prevProps, nextProps) => {
  // Custom comparison for props to determine if re-render is needed
  const shouldSkipRender = (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.error === nextProps.error &&
    prevProps.data === nextProps.data &&
    prevProps.className === nextProps.className
  );

  console.log('[NoteInsightsTab] React.memo comparison:', {
    shouldSkipRender,
    dataChanged: prevProps.data !== nextProps.data,
    loadingChanged: prevProps.isLoading !== nextProps.isLoading,
    errorChanged: prevProps.error !== nextProps.error,
    renderCount: performance.now(),
    timestamp: Date.now()
  });

  return shouldSkipRender;
});

MemoizedNoteInsightsTab.displayName = 'NoteInsightsTab';

export default MemoizedNoteInsightsTab;
