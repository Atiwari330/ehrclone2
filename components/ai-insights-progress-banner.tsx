'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  DollarSign, 
  TrendingUp,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIInsightsState } from '@/lib/types/ai-insights';

interface AIInsightsProgressBannerProps {
  insights: AIInsightsState;
  activeInsightTab?: 'safety' | 'billing' | 'progress';
  onMetricClick?: (tab: 'safety' | 'billing' | 'progress') => void;
  className?: string;
}

export function AIInsightsProgressBanner({
  insights,
  activeInsightTab = 'safety',
  onMetricClick,
  className
}: AIInsightsProgressBannerProps) {
  // Calculate metric counts from insights data
  const metrics = React.useMemo(() => {
    const safetyCount = insights.safety?.data?.alerts?.filter(
      (alert: any) => ['critical', 'high'].includes(alert.severity)
    ).length || 0;

    const billingCount = insights.billing?.data?.cptCodes?.filter(
      (code: any) => code.status === 'pending'
    ).length || 0;

    const progressCount = insights.progress?.data?.goalProgress?.filter(
      (goal: any) => goal.status === 'active'
    ).length || 0;

    console.log('[AIInsightsProgressBanner] Metrics calculated:', {
      safetyCount,
      billingCount,
      progressCount,
      safetyStatus: insights.safety?.status,
      billingStatus: insights.billing?.status,
      progressStatus: insights.progress?.status,
      overallProgress: insights.overallProgress,
      timestamp: Date.now()
    });

    return { safetyCount, billingCount, progressCount };
  }, [insights]);

  // Handle metric click with logging
  const handleMetricClick = React.useCallback((tab: 'safety' | 'billing' | 'progress', count: number) => {
    console.log('[AIInsightsProgressBanner] Metric clicked:', {
      tab,
      count,
      previousTab: activeInsightTab,
      overallProgress: insights.overallProgress,
      timestamp: Date.now()
    });
    
    onMetricClick?.(tab);
  }, [activeInsightTab, insights.overallProgress, onMetricClick]);

  // Check if analysis is in progress
  const isAnalysisInProgress = insights.overallProgress < 100;
  const hasAnyInsights = metrics.safetyCount > 0 || metrics.billingCount > 0 || metrics.progressCount > 0;
  const isAnalysisComplete = insights.overallProgress >= 100;

  // Component lifecycle logging
  React.useEffect(() => {
    console.log('[AIInsightsProgressBanner] Component rendered:', {
      metrics,
      isAnalysisInProgress,
      hasAnyInsights,
      isAnalysisComplete,
      activeInsightTab,
      timestamp: Date.now()
    });
  }, [metrics, isAnalysisInProgress, hasAnyInsights, isAnalysisComplete, activeInsightTab]);

  // Render loading state during analysis
  if (isAnalysisInProgress && !hasAnyInsights) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          AI analysis in progress... ({Math.round(insights.overallProgress)}%)
        </span>
      </div>
    );
  }

  // Render no insights state when analysis is complete but no insights found
  if (isAnalysisComplete && !hasAnyInsights) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <span className="text-sm text-muted-foreground">
          No critical insights found
        </span>
      </div>
    );
  }

  // Build metrics display array
  const metricsToShow = [];

  if (metrics.safetyCount > 0) {
    metricsToShow.push({
      tab: 'safety' as const,
      count: metrics.safetyCount,
      label: metrics.safetyCount === 1 ? 'safety alert' : 'safety alerts',
      icon: AlertTriangle,
      color: 'text-red-600',
      hoverColor: 'hover:text-red-700',
      isActive: activeInsightTab === 'safety'
    });
  }

  if (metrics.billingCount > 0) {
    metricsToShow.push({
      tab: 'billing' as const,
      count: metrics.billingCount,
      label: metrics.billingCount === 1 ? 'billing code' : 'billing codes',
      icon: DollarSign,
      color: 'text-green-600',
      hoverColor: 'hover:text-green-700',
      isActive: activeInsightTab === 'billing'
    });
  }

  if (metrics.progressCount > 0) {
    metricsToShow.push({
      tab: 'progress' as const,
      count: metrics.progressCount,
      label: metrics.progressCount === 1 ? 'goal update' : 'goal updates',
      icon: TrendingUp,
      color: 'text-blue-600',
      hoverColor: 'hover:text-blue-700',
      isActive: activeInsightTab === 'progress'
    });
  }

  // If no metrics to show, don't render anything
  if (metricsToShow.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* AI Analysis Complete Indicator */}
      {isAnalysisComplete && (
        <Badge variant="secondary" className="text-xs">
          Complete
        </Badge>
      )}

      {/* Metrics */}
      <div className="flex items-center space-x-3">
        {metricsToShow.map((metric, index) => (
          <React.Fragment key={metric.tab}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMetricClick(metric.tab, metric.count)}
              className={cn(
                'flex items-center space-x-1 h-auto py-1 px-2 transition-colors',
                metric.color,
                metric.hoverColor,
                metric.isActive && 'bg-muted'
              )}
            >
              <metric.icon className="h-3 w-3" />
              <span className="text-sm font-medium">
                {metric.count}
              </span>
              <span className="text-sm">
                {metric.label}
              </span>
            </Button>
            
            {/* Separator between metrics */}
            {index < metricsToShow.length - 1 && (
              <Separator orientation="vertical" className="h-4" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Analysis Progress Indicator */}
      {isAnalysisInProgress && (
        <div className="flex items-center space-x-2 ml-3">
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center space-x-1">
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {Math.round(insights.overallProgress)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
