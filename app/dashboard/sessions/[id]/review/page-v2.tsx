'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { StickyHeader } from '@/components/layout/sticky-header';
import { SplitPane } from '@/components/layout/split-pane';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useAIInsights } from '@/hooks/use-ai-insights';
import { TranscriptDisplay } from '@/components/transcript-display';
import { InsightsDrawer } from '@/components/insights/insights-drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronLeft, 
  FileText, 
  Download, 
  Settings, 
  MoreHorizontal,
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TranscriptEntry } from '@/lib/types/transcription';

interface TranscriptWithEntries {
  id: string;
  entries: TranscriptEntry[];
  duration?: number;
  startTime?: Date;
  endTime?: Date;
}

export default function TranscriptReviewPageV2() {
  const params = useParams();
  const sessionId = params.id as string;
  const { data: authSession } = useSession();
  
  // Transcript data state
  const [transcript, setTranscript] = React.useState<TranscriptWithEntries | null>(null);
  const [session, setSession] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Responsive layout detection
  const { mode, isMobile, isTablet, isDesktop } = useResponsiveLayout({
    mobileBreakpoint: 768,
    tabletBreakpoint: 1024
  });

  // Convert transcript to text for AI analysis
  const transcriptText = transcript?.entries
    .map(entry => `[${entry.timestamp}] ${entry.speaker}: ${entry.text}`)
    .join('\n') || '';

  // Convert sessionId to valid UUID if it's "test-session"
  const validSessionId = sessionId === 'test-session' ? 
    '123e4567-e89b-12d3-a456-426614174000' : sessionId;

  // AI insights integration
  const { 
    insights: aiInsights, 
    isLoading: insightsLoading, 
    hasErrors: insightsError,
    overallProgress: analysisProgress 
  } = useAIInsights({
    sessionId: validSessionId,
    patientId: session?.patientId || '456e4567-e89b-12d3-a456-426614174001',
    transcript: transcriptText,
    userId: authSession?.user?.id,
    autoStart: !!transcript && !!transcriptText && !!authSession?.user?.id,
    onInsightUpdate: (pipeline, data) => {
      console.log('[TranscriptReviewV2] AI insight received:', {
        sessionId,
        pipeline,
        timestamp: Date.now(),
        hasData: !!data
      });
    },
    onError: (pipeline, error) => {
      console.error('[TranscriptReviewV2] AI pipeline error:', {
        sessionId,
        pipeline,
        error: error.message,
        timestamp: Date.now()
      });
    },
    onComplete: (insights) => {
      console.log('[TranscriptReviewV2] AI analysis complete:', {
        sessionId,
        safetyComplete: insights.safety.status === 'success',
        billingComplete: insights.billing.status === 'success',
        progressComplete: insights.progress.status === 'success',
        overallProgress: insights.overallProgress,
        timestamp: Date.now()
      });
    }
  });

  // Header state management
  const [headerCollapsed, setHeaderCollapsed] = React.useState(false);
  const [panelSizes, setPanelSizes] = React.useState<[number, number]>([60, 40]);
  
  // Insights drawer state
  const [activeInsightTab, setActiveInsightTab] = React.useState<'safety' | 'billing' | 'progress'>('safety');
  const [highlightsEnabled, setHighlightsEnabled] = React.useState(true);

  // Fetch transcript data
  React.useEffect(() => {
    const fetchTranscript = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('[TranscriptReviewV2] Fetching transcript:', {
          sessionId,
          timestamp: Date.now()
        });

        const response = await fetch(`/api/sessions/${sessionId}/transcript`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch transcript');
        }
        
        const data = await response.json();
        setTranscript(data.transcript);
        
        console.log('[TranscriptReviewV2] Transcript fetched successfully:', {
          sessionId,
          entryCount: data.transcript?.entries?.length || 0,
          duration: data.transcript?.duration,
          timestamp: Date.now()
        });
        
        // TODO: Also fetch session details
        // For now, using mock data
        setSession({
          id: sessionId,
          patientId: '456e4567-e89b-12d3-a456-426614174001',
          patientName: 'John Doe',
          providerName: 'Dr. Sarah Johnson',
          type: 'virtual',
          metadata: {
            serviceType: 'Follow-up Visit',
            appointmentReason: 'Diabetes management follow-up',
          }
        });
        
      } catch (err) {
        console.error('[TranscriptReviewV2] Error fetching transcript:', {
          sessionId,
          error: err instanceof Error ? err.message : 'Unknown error',
          timestamp: Date.now()
        });
        setError(err instanceof Error ? err.message : 'Failed to load transcript');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTranscript();
  }, [sessionId]);

  // Component lifecycle logging
  React.useEffect(() => {
    console.log('[TranscriptReviewV2] Page mounted:', {
      sessionId,
      layoutMode: mode,
      isMobile,
      isTablet,
      isDesktop,
      timestamp: Date.now()
    });

    return () => {
      console.log('[TranscriptReviewV2] Page unmounted:', {
        sessionId,
        finalPanelSizes: panelSizes,
        timestamp: Date.now()
      });
    };
  }, [sessionId, mode, isMobile, isTablet, isDesktop, panelSizes]);

  // Panel resize handler
  const handlePanelResize = React.useCallback((sizes: number[]) => {
    setPanelSizes(sizes as [number, number]);
    
    console.log('[TranscriptReviewV2] Panel sizes updated:', {
      sizes,
      sessionId,
      timestamp: Date.now()
    });
  }, [sessionId]);

  // Header collapse toggle
  const handleHeaderToggle = React.useCallback(() => {
    setHeaderCollapsed(prev => !prev);
    
    console.log('[TranscriptReviewV2] Header toggle:', {
      wasCollapsed: headerCollapsed,
      willBeCollapsed: !headerCollapsed,
      sessionId,
      timestamp: Date.now()
    });
  }, [headerCollapsed, sessionId]);

  // Handle insights tab change
  const handleInsightTabChange = React.useCallback((tab: string) => {
    setActiveInsightTab(tab as 'safety' | 'billing' | 'progress');
    
    console.log('[TranscriptReviewV2] Insights tab changed:', {
      tab,
      sessionId,
      timestamp: Date.now()
    });
  }, [sessionId]);

  // Handle highlights toggle
  const handleToggleHighlights = React.useCallback(() => {
    setHighlightsEnabled(prev => !prev);
    
    console.log('[TranscriptReviewV2] Highlights toggled:', {
      enabled: !highlightsEnabled,
      sessionId,
      timestamp: Date.now()
    });
  }, [highlightsEnabled, sessionId]);

  // Handle smart action execution
  const handleActionExecute = React.useCallback((action: any) => {
    console.log('[TranscriptReviewV2] Smart action executed:', {
      actionId: action.id,
      actionType: action.type,
      sessionId,
      timestamp: Date.now()
    });
    
    // Execute the action
    action.action?.();
  }, [sessionId]);

  // Calculate tab badges from AI insights
  const tabBadges = React.useMemo(() => {
    if (!aiInsights) return { safety: 0, billing: 0, progress: 0 };

    const safety = aiInsights.safety?.data?.alerts?.filter(
      (alert: any) => ['critical', 'high'].includes(alert.severity)
    ).length || 0;

    const billing = aiInsights.billing?.data?.cptCodes?.filter(
      (code: any) => code.status === 'pending'
    ).length || 0;

    const progress = aiInsights.progress?.data?.goalProgress?.filter(
      (goal: any) => goal.status === 'active'
    ).length || 0;

    return { safety, billing, progress };
  }, [aiInsights]);

  // Breadcrumb navigation component
  const BreadcrumbNav = React.useMemo(() => (
    <nav className="flex items-center space-x-2 min-w-0">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => {
          console.log('[TranscriptReviewV2] Back navigation:', {
            sessionId,
            timestamp: Date.now()
          });
          window.history.back();
        }}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center space-x-2 min-w-0">
        <span className="text-sm text-muted-foreground">Sessions</span>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm font-medium truncate">
          Session {sessionId}
        </span>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm text-muted-foreground">Review</span>
      </div>

      {/* New Layout Badge */}
      <Badge variant="secondary" className="ml-2 text-xs">
        V2
      </Badge>
    </nav>
  ), [sessionId]);

  // Primary action component
  const PrimaryAction = React.useMemo(() => (
    <Button 
      className="flex items-center space-x-2"
      onClick={() => {
        console.log('[TranscriptReviewV2] Generate note clicked:', {
          sessionId,
          analysisProgress,
          timestamp: Date.now()
        });
        // TODO: Implement note generation
      }}
      disabled={insightsLoading || analysisProgress < 100}
    >
      <FileText className="h-4 w-4" />
      <span>Generate Clinical Note</span>
    </Button>
  ), [sessionId, insightsLoading, analysisProgress]);

  // Secondary actions menu
  const SecondaryActions = React.useMemo(() => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-1"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">More actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            console.log('[TranscriptReviewV2] Export clicked:', {
              sessionId,
              timestamp: Date.now()
            });
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Transcript
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            console.log('[TranscriptReviewV2] Settings clicked:', {
              sessionId,
              timestamp: Date.now()
            });
          }}
        >
          <Settings className="h-4 w-4 mr-2" />
          Review Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ), [sessionId]);

  // Error state handling - Log the error but don't return early
  React.useEffect(() => {
    if (insightsError) {
      console.error('[TranscriptReviewV2] AI insights error:', {
        error: insightsError,
        sessionId,
        timestamp: Date.now()
      });
    }
  }, [insightsError, sessionId]);

  // Loading skeleton component
  const LoadingSkeleton = React.useMemo(() => (
    <div className="space-y-4 p-4">
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
        </div>
      ))}
    </div>
  ), []);

  // Single render logic based on state - no early returns
  const renderContent = () => {
    // Error state (transcript fetch error or AI insights error)
    if (error || insightsError) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-lg font-semibold">Unable to Load Session</h2>
            <p className="text-muted-foreground">
              {error || 'There was an error loading the AI insights for this session.'}
            </p>
            <Button onClick={() => window.location.reload()}>
              <Loader2 className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      );
    }

    // Get transcript entries or empty array if still loading
    const transcriptEntries = transcript?.entries || [];

    // Mobile layout - stacked panels with bottom sheet
    if (isMobile) {
      return (
        <div className="h-screen flex flex-col">
          <StickyHeader
            progress={analysisProgress}
            isCollapsed={headerCollapsed}
            onToggleCollapse={handleHeaderToggle}
            primaryAction={PrimaryAction}
            aiInsights={aiInsights}
            activeInsightTab={activeInsightTab}
            onInsightTabClick={handleInsightTabChange}
            className="mobile-header"
          >
            {BreadcrumbNav}
          </StickyHeader>

          <main className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Transcript takes most space on mobile */}
              <div className="flex-1 overflow-hidden">
                {isLoading ? (
                  LoadingSkeleton
                ) : (
                  <TranscriptDisplay 
                    entries={transcriptEntries}
                    className="h-full p-4"
                    insights={aiInsights}
                    enableHighlighting={highlightsEnabled}
                  />
                )}
              </div>
              
              {/* TODO: Mobile insights sheet implementation */}
              <div className="h-20 bg-muted/30 border-t flex items-center justify-center">
                <Button variant="outline" size="sm">
                  View Insights ({tabBadges.safety + tabBadges.billing + tabBadges.progress})
                </Button>
              </div>
            </div>
          </main>
        </div>
      );
    }

    // Tablet layout - stacked panels vertically
    if (isTablet) {
      return (
        <div className="h-screen flex flex-col">
          <StickyHeader
            progress={analysisProgress}
            isCollapsed={headerCollapsed}
            onToggleCollapse={handleHeaderToggle}
            primaryAction={PrimaryAction}
            secondaryActions={SecondaryActions}
            aiInsights={aiInsights}
            activeInsightTab={activeInsightTab}
            onInsightTabClick={handleInsightTabChange}
          >
            {BreadcrumbNav}
          </StickyHeader>

          <main className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col space-y-2 p-2">
              {/* Transcript on top */}
              <div className="flex-1 min-h-0">
                {isLoading ? (
                  <div className="h-full rounded-lg border p-4">
                    {LoadingSkeleton}
                  </div>
                ) : (
                  <TranscriptDisplay 
                    entries={transcriptEntries}
                    className="h-full rounded-lg border p-4"
                    insights={aiInsights}
                    enableHighlighting={highlightsEnabled}
                  />
                )}
              </div>
              
              {/* Insights section on bottom */}
              <div className="h-48 min-h-0 rounded-lg border">
                <InsightsDrawer
                  insights={aiInsights}
                  activeTab={activeInsightTab}
                  onTabChange={handleInsightTabChange}
                  onActionExecute={handleActionExecute}
                  highlightsEnabled={highlightsEnabled}
                  onToggleHighlights={handleToggleHighlights}
                  className="h-full"
                />
              </div>
            </div>
          </main>
        </div>
      );
    }

    // Desktop layout - two-pane split (default)
    return (
      <div className="h-screen flex flex-col">
        <StickyHeader
          progress={analysisProgress}
          isCollapsed={headerCollapsed}
          onToggleCollapse={handleHeaderToggle}
          primaryAction={PrimaryAction}
          secondaryActions={SecondaryActions}
          aiInsights={aiInsights}
          activeInsightTab={activeInsightTab}
          onInsightTabClick={handleInsightTabChange}
        >
          {BreadcrumbNav}
        </StickyHeader>

        <main className="flex-1 overflow-hidden">
          <SplitPane
            defaultSizes={[60, 40]}
            minSize={30}
            maxSize={80}
            onResize={handlePanelResize}
            storageKey={`transcript-review-${sessionId}`}
            className="h-full"
          >
            {/* Left Pane: Transcript */}
            <div className="h-full overflow-hidden bg-background">
              {isLoading ? (
                LoadingSkeleton
              ) : (
                <TranscriptDisplay 
                  entries={transcriptEntries}
                  className="h-full p-4"
                  insights={aiInsights}
                  enableHighlighting={highlightsEnabled}
                />
              )}
            </div>

            {/* Right Pane: Insights Drawer */}
            <div className="h-full overflow-hidden bg-background border-l">
              <InsightsDrawer
                insights={aiInsights}
                activeTab={activeInsightTab}
                onTabChange={handleInsightTabChange}
                onActionExecute={handleActionExecute}
                highlightsEnabled={highlightsEnabled}
                onToggleHighlights={handleToggleHighlights}
                className="h-full"
              />
            </div>
          </SplitPane>
        </main>
      </div>
    );
  };

  return renderContent();
}
