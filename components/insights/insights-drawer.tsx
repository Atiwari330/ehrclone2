'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  EyeOff,
  Settings 
} from 'lucide-react';
import { AIInsightsState, SmartAction } from '@/lib/types/ai-insights';
import { cn } from '@/lib/utils';
import { smartActionsEngine } from '@/lib/services/smart-actions-engine';
import { SafetyInsightsTab } from './tabs/safety-insights-tab';
import { BillingInsightsTab } from './tabs/billing-insights-tab';
import { ProgressInsightsTab } from './tabs/progress-insights-tab';

interface InsightsDrawerProps {
  insights: AIInsightsState;
  activeTab?: 'safety' | 'billing' | 'progress';
  onTabChange?: (tab: string) => void;
  onActionExecute?: (action: SmartAction) => void;
  highlightsEnabled?: boolean;
  onToggleHighlights?: () => void;
  className?: string;
}

export function InsightsDrawer({
  insights,
  activeTab = 'safety',
  onTabChange,
  onActionExecute,
  highlightsEnabled = true,
  onToggleHighlights,
  className
}: InsightsDrawerProps) {
  // Calculate badge counts from insights data - OPTIMIZED: Enhanced memoization with detailed logging
  const badges = React.useMemo(() => {
    console.log('[InsightsDrawer] Calculating badges:', {
      safetyStatus: insights.safety?.status,
      billingStatus: insights.billing?.status,
      progressStatus: insights.progress?.status,
      timestamp: Date.now()
    });

    const safety = insights.safety?.data?.alerts?.filter(
      (alert: any) => ['critical', 'high'].includes(alert.severity)
    ).length || 0;

    const billing = insights.billing?.data?.cptCodes?.filter(
      (code: any) => code.status === 'pending'
    ).length || 0;

    const progress = insights.progress?.data?.goalProgress?.filter(
      (goal: any) => goal.status === 'active'
    ).length || 0;

    const result = { safety, billing, progress };
    
    console.log('[InsightsDrawer] Badge counts calculated:', {
      badges: result,
      totalBadges: safety + billing + progress,
      timestamp: Date.now()
    });

    return result;
  }, [
    insights.safety?.status,
    insights.safety?.data?.alerts,
    insights.billing?.status, 
    insights.billing?.data?.cptCodes,
    insights.progress?.status,
    insights.progress?.data?.goalProgress
  ]);

  // Handle tab change with logging
  const handleTabChange = React.useCallback((newTab: string) => {
    console.log('[InsightsDrawer] Tab changed:', {
      from: activeTab,
      to: newTab,
      timestamp: Date.now()
    });
    
    onTabChange?.(newTab);
  }, [activeTab, onTabChange]);

  // Handle highlight toggle
  const handleToggleHighlights = React.useCallback(() => {
    console.log('[InsightsDrawer] Toggle highlights:', {
      wasEnabled: highlightsEnabled,
      willBeEnabled: !highlightsEnabled,
      timestamp: Date.now()
    });
    
    onToggleHighlights?.();
  }, [highlightsEnabled, onToggleHighlights]);

  // Calculate overall analysis progress
  const overallProgress = insights.overallProgress || 0;
  const isAnalysisComplete = overallProgress >= 100;

  // Get contextual smart actions for active tab using the smart actions engine
  const contextualActions = React.useMemo(() => {
    console.log('[InsightsDrawer] Generating contextual actions:', {
      activeTab,
      safetyStatus: insights.safety.status,
      billingStatus: insights.billing.status,
      progressStatus: insights.progress.status,
      timestamp: Date.now()
    });

    try {
      // Generate all actions from the smart actions engine
      const allActions = smartActionsEngine.generateActions(insights);
      
      console.log('[InsightsDrawer] All actions generated:', {
        totalActions: allActions.length,
        actionsByType: allActions.reduce((acc, action) => {
          acc[action.type] = (acc[action.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });

      // Filter actions by active tab type and limit to 3
      const filteredActions = allActions
        .filter(action => action.type === activeTab)
        .slice(0, 3);

      console.log('[InsightsDrawer] Filtered actions for tab:', {
        activeTab,
        filteredCount: filteredActions.length,
        actions: filteredActions.map(a => ({
          id: a.id,
          title: a.title,
          priority: a.priority,
          type: a.type
        }))
      });

      return filteredActions;
    } catch (error) {
      console.error('[InsightsDrawer] Error generating smart actions:', error);
      return [];
    }
  }, [insights, activeTab]);

  // Component lifecycle logging
  React.useEffect(() => {
    console.log('[InsightsDrawer] Component mounted:', {
      activeTab,
      badges,
      overallProgress,
      isAnalysisComplete,
      timestamp: Date.now()
    });

    return () => {
      console.log('[InsightsDrawer] Component unmounted:', {
        timestamp: Date.now()
      });
    };
  }, []);

  return (
    <div className={cn('h-full flex flex-col bg-background', className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-medium">AI Insights</h2>
          
          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Highlights Toggle */}
            {onToggleHighlights && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleHighlights}
                className="flex items-center space-x-1"
              >
                {highlightsEnabled ? (
                  <>
                    <EyeOff className="h-3 w-3" />
                    <span className="text-xs">Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3" />
                    <span className="text-xs">Show</span>
                  </>
                )}
              </Button>
            )}
            
            {/* Settings */}
            <Button variant="ghost" size="sm">
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Analysis Progress</span>
            <span className="font-medium">
              {Math.round(overallProgress)}%
            </span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                isAnalysisComplete 
                  ? "bg-green-500" 
                  : "bg-primary"
              )}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          
          {!isAnalysisComplete && (
            <p className="text-xs text-muted-foreground">
              AI is analyzing your session...
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="flex-1 flex flex-col h-full"
        >
          {/* Tab Navigation */}
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger 
                value="safety" 
                badge={badges.safety}
                badgeVariant={badges.safety > 0 ? "destructive" : "outline"}
                className="flex items-center space-x-1"
              >
                <AlertTriangle className="h-3 w-3" />
                <span>Safety</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="billing" 
                badge={badges.billing}
                badgeVariant={badges.billing > 0 ? "secondary" : "outline"}
                className="flex items-center space-x-1"
              >
                <DollarSign className="h-3 w-3" />
                <span>Billing</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="progress" 
                badge={badges.progress}
                badgeVariant={badges.progress > 0 ? "default" : "outline"}
                className="flex items-center space-x-1"
              >
                <TrendingUp className="h-3 w-3" />
                <span>Progress</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0">
            <TabsContent value="safety" className="h-full m-0">
              <SafetyInsightsTab 
                data={insights.safety?.data}
                isLoading={insights.safety?.status === 'loading'}
                error={insights.safety?.error}
                onContactCrisis={() => {
                  console.log('[InsightsDrawer] Crisis contact requested');
                  // TODO: Implement crisis contact workflow
                }}
                onContactSupervisor={() => {
                  console.log('[InsightsDrawer] Supervisor contact requested');
                  // TODO: Implement supervisor contact workflow
                }}
                onMarkReviewed={(alertId: string) => {
                  console.log('[InsightsDrawer] Alert marked as reviewed:', { alertId });
                  // TODO: Implement alert review workflow
                }}
              />
            </TabsContent>

            <TabsContent value="billing" className="h-full m-0">
              <BillingInsightsTab 
                data={insights.billing?.data}
                isLoading={insights.billing?.status === 'loading'}
                error={insights.billing?.error}
                onApproveCode={(code) => {
                  console.log('[InsightsDrawer] Code approved:', { code: code.code });
                  // TODO: Implement code approval workflow
                }}
                onEditCode={(code) => {
                  console.log('[InsightsDrawer] Code edit requested:', { code: code.code });
                  // TODO: Implement code editing workflow
                }}
                onExportCodes={() => {
                  console.log('[InsightsDrawer] Export codes requested');
                  // TODO: Implement export workflow
                }}
              />
            </TabsContent>

            <TabsContent value="progress" className="h-full m-0">
              <ProgressInsightsTab 
                data={insights.progress?.data}
                isLoading={insights.progress?.status === 'loading'}
                error={insights.progress?.error}
                onUpdateGoal={(goalId: string, updates) => {
                  console.log('[InsightsDrawer] Goal update requested:', { goalId, updates });
                  // TODO: Implement goal update workflow
                }}
                onAddGoal={() => {
                  console.log('[InsightsDrawer] Add goal requested');
                  // TODO: Implement add goal workflow
                }}
                onViewDetails={(goalId: string) => {
                  console.log('[InsightsDrawer] Goal details requested:', { goalId });
                  // TODO: Implement goal details workflow
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Smart Actions Footer */}
      {contextualActions.length > 0 && (
        <div className="border-t p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Suggested Actions
            </h3>
            <div className="space-y-2">
              {contextualActions.slice(0, 3).map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={async () => {
                    console.log('[InsightsDrawer] Action execution started:', {
                      actionId: action.id,
                      title: action.title,
                      tab: activeTab,
                      priority: action.priority,
                      requiresConfirmation: action.requiresConfirmation,
                      timestamp: Date.now()
                    });

                    try {
                      // Execute the action's function
                      if (action.action) {
                        await action.action();
                      }

                      // Call the onActionExecute callback for parent component handling
                      onActionExecute?.(action);

                      console.log('[InsightsDrawer] Action executed successfully:', {
                        actionId: action.id,
                        tab: activeTab,
                        timestamp: Date.now()
                      });
                    } catch (error) {
                      console.error('[InsightsDrawer] Action execution failed:', {
                        actionId: action.id,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        timestamp: Date.now()
                      });
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs">{action.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {action.description}
                    </div>
                  </div>
                  <Badge 
                    variant={action.priority >= 8 ? 'destructive' : 'secondary'}
                    className="ml-2 text-xs"
                  >
                    {action.priority >= 8 ? 'high' : action.priority >= 5 ? 'medium' : 'low'}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Safety insights tab content
function SafetyInsightsContent({ 
  data, 
  isLoading, 
  error 
}: { 
  data: any; 
  isLoading: boolean; 
  error: Error | null; 
}) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Analyzing safety...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-sm font-medium">Analysis Failed</p>
          <p className="text-xs text-muted-foreground">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No safety data available</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* TODO: Implement actual safety insights display */}
        <div className="space-y-3">
          <h3 className="font-medium">Critical Alerts</h3>
          {data.alerts?.map((alert: any, index: number) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="destructive" className="text-xs">
                  {alert.severity}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {alert.confidence}% confidence
                </span>
              </div>
              <p className="text-sm">{alert.message || 'Safety alert detected'}</p>
            </div>
          )) || (
            <p className="text-sm text-muted-foreground">No critical alerts</p>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}

// Billing insights tab content
function BillingInsightsContent({ 
  data, 
  isLoading, 
  error 
}: { 
  data: any; 
  isLoading: boolean; 
  error: Error | null; 
}) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Analyzing billing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <DollarSign className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-sm font-medium">Analysis Failed</p>
          <p className="text-xs text-muted-foreground">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No billing data available</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* TODO: Implement actual billing insights display */}
        <div className="space-y-3">
          <h3 className="font-medium">Suggested Codes</h3>
          {data.cptCodes?.map((code: any, index: number) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{code.code}</span>
                <Badge variant="secondary" className="text-xs">
                  {code.confidence}% match
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {code.description || 'Billing code suggestion'}
              </p>
            </div>
          )) || (
            <p className="text-sm text-muted-foreground">No code suggestions</p>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}

// Progress insights tab content
function ProgressInsightsContent({ 
  data, 
  isLoading, 
  error 
}: { 
  data: any; 
  isLoading: boolean; 
  error: Error | null; 
}) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Analyzing progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <TrendingUp className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-sm font-medium">Analysis Failed</p>
          <p className="text-xs text-muted-foreground">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No progress data available</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* TODO: Implement actual progress insights display */}
        <div className="space-y-3">
          <h3 className="font-medium">Goal Progress</h3>
          {data.goalProgress?.map((goal: any, index: number) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{goal.title || `Goal ${index + 1}`}</span>
                <Badge variant="outline" className="text-xs">
                  {goal.progress || 0}% complete
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {goal.description || 'Treatment goal in progress'}
              </p>
            </div>
          )) || (
            <p className="text-sm text-muted-foreground">No active goals</p>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
