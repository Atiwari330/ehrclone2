'use client';

/**
 * Transcript Navigation Component
 * 
 * Intelligent navigation sidebar for quickly jumping to important transcript sections
 * based on AI insights. Provides category grouping, severity indicators, and smooth scrolling.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Navigation,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Hash
} from 'lucide-react';
import { 
  TranscriptHighlight,
  InsightSeverity,
  SafetyInsights,
  BillingInsights,
  ProgressInsights,
  AIInsightsState
} from '@/lib/types/ai-insights';
import type { TranscriptEntry } from '@/lib/types/transcription';

interface TranscriptNavigationProps {
  highlights: TranscriptHighlight[];
  transcriptEntries: TranscriptEntry[];
  insights: AIInsightsState | null;
  onNavigate?: (entryId: string, highlightId: string) => void;
  className?: string;
  disabled?: boolean;
}

interface NavigationGroup {
  type: 'safety' | 'billing' | 'progress';
  title: string;
  icon: React.ReactNode;
  items: NavigationItem[];
  count: number;
  highPriorityCount: number;
}

interface NavigationItem {
  highlight: TranscriptHighlight;
  entry: TranscriptEntry;
  title: string;
  subtitle: string;
  severity: InsightSeverity;
  timestamp: string;
}

export function TranscriptNavigation({
  highlights,
  transcriptEntries,
  insights,
  onNavigate,
  className,
  disabled = false
}: TranscriptNavigationProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['safety', 'billing', 'progress'])
  );
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const [navigationMetrics, setNavigationMetrics] = useState({
    totalNavigations: 0,
    navigationsByType: { safety: 0, billing: 0, progress: 0 },
    lastNavigation: null as { type: string; time: number } | null
  });

  // Group highlights by type and prepare navigation items
  const navigationGroups = useMemo(() => {
    console.log('[TranscriptNavigation] Grouping highlights:', {
      totalHighlights: highlights.length,
      entriesCount: transcriptEntries.length,
      hasInsights: !!insights,
      timestamp: Date.now()
    });

    const groups: NavigationGroup[] = [];

    // Safety navigation group
    const safetyHighlights = highlights.filter(h => h.type === 'safety');
    const safetyItems = safetyHighlights.map(highlight => {
      const entry = transcriptEntries.find(e => e.id === highlight.entryId);
      if (!entry) return null;

      let title = 'Safety Alert';
      let subtitle = highlight.tooltip || 'Review safety concern';

      // Get detailed info from insights if available
      if (insights?.safety.status === 'success' && insights.safety.data) {
        const alert = insights.safety.data.alerts.find(a => a.id === highlight.insightId);
        if (alert) {
          title = alert.title;
          subtitle = alert.description.substring(0, 80) + '...';
        }
      }

      return {
        highlight,
        entry,
        title,
        subtitle,
        severity: highlight.severity,
        timestamp: new Date(entry.timestamp).toLocaleTimeString()
      };
    }).filter(Boolean) as NavigationItem[];

    if (safetyItems.length > 0) {
      groups.push({
        type: 'safety',
        title: 'Safety Alerts',
        icon: <Shield className="h-4 w-4" />,
        items: safetyItems.sort((a, b) => {
          // Sort by severity first, then by timestamp
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
          if (severityDiff !== 0) return severityDiff;
          return new Date(a.entry.timestamp).getTime() - new Date(b.entry.timestamp).getTime();
        }),
        count: safetyItems.length,
        highPriorityCount: safetyItems.filter(item => 
          item.severity === 'critical' || item.severity === 'high'
        ).length
      });
    }

    // Billing navigation group
    const billingHighlights = highlights.filter(h => h.type === 'billing');
    const billingItems = billingHighlights.map(highlight => {
      const entry = transcriptEntries.find(e => e.id === highlight.entryId);
      if (!entry) return null;

      let title = 'Billing Code';
      let subtitle = highlight.tooltip || 'Review billing code';

      // Extract code info from tooltip if available
      if (highlight.tooltip) {
        const codeMatch = highlight.tooltip.match(/(CPT|ICD-10)\s+(\S+):/);
        if (codeMatch) {
          title = `${codeMatch[1]} ${codeMatch[2]}`;
        }
      }

      return {
        highlight,
        entry,
        title,
        subtitle,
        severity: highlight.severity,
        timestamp: new Date(entry.timestamp).toLocaleTimeString()
      };
    }).filter(Boolean) as NavigationItem[];

    if (billingItems.length > 0) {
      groups.push({
        type: 'billing',
        title: 'Billing Codes',
        icon: <DollarSign className="h-4 w-4" />,
        items: billingItems,
        count: billingItems.length,
        highPriorityCount: billingItems.filter(item => item.severity === 'high').length
      });
    }

    // Progress navigation group
    const progressHighlights = highlights.filter(h => h.type === 'progress');
    const progressItems = progressHighlights.map(highlight => {
      const entry = transcriptEntries.find(e => e.id === highlight.entryId);
      if (!entry) return null;

      let title = 'Treatment Goal';
      let subtitle = highlight.tooltip || 'Review progress';

      // Get detailed info from insights if available
      if (insights?.progress.status === 'success' && insights.progress.data) {
        const goal = insights.progress.data.goalProgress.find(g => g.goalId === highlight.insightId);
        if (goal) {
          title = `Goal: ${goal.progressPercentage}% Complete`;
          subtitle = goal.goalDescription.substring(0, 80) + '...';
        }
      }

      return {
        highlight,
        entry,
        title,
        subtitle,
        severity: highlight.severity,
        timestamp: new Date(entry.timestamp).toLocaleTimeString()
      };
    }).filter(Boolean) as NavigationItem[];

    if (progressItems.length > 0) {
      groups.push({
        type: 'progress',
        title: 'Progress Insights',
        icon: <TrendingUp className="h-4 w-4" />,
        items: progressItems,
        count: progressItems.length,
        highPriorityCount: progressItems.filter(item => item.severity === 'high').length
      });
    }

    console.log('[TranscriptNavigation] Navigation groups created:', {
      groupCount: groups.length,
      safetyCount: safetyItems.length,
      billingCount: billingItems.length,
      progressCount: progressItems.length,
      totalItems: safetyItems.length + billingItems.length + progressItems.length,
      timestamp: Date.now()
    });

    return groups;
  }, [highlights, transcriptEntries, insights]);

  // Handle section expand/collapse
  const toggleSection = useCallback((type: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
        console.log('[TranscriptNavigation] Section collapsed:', {
          type,
          timestamp: Date.now()
        });
      } else {
        newSet.add(type);
        console.log('[TranscriptNavigation] Section expanded:', {
          type,
          timestamp: Date.now()
        });
      }
      return newSet;
    });
  }, []);

  // Handle navigation to transcript entry
  const handleNavigate = useCallback((item: NavigationItem) => {
    const entryElement = document.querySelector(`[data-entry-id="${item.entry.id}"]`);
    
    if (entryElement) {
      // Update metrics
      setNavigationMetrics(prev => ({
        totalNavigations: prev.totalNavigations + 1,
        navigationsByType: {
          ...prev.navigationsByType,
          [item.highlight.type]: prev.navigationsByType[item.highlight.type] + 1
        },
        lastNavigation: {
          type: item.highlight.type,
          time: Date.now()
        }
      }));

      console.log('[TranscriptNavigation] Navigating to transcript entry:', {
        entryId: item.entry.id,
        highlightId: item.highlight.insightId,
        type: item.highlight.type,
        severity: item.highlight.severity,
        scrollTarget: entryElement.getBoundingClientRect().top,
        timestamp: Date.now()
      });

      // Smooth scroll to element
      entryElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // Set active highlight for visual feedback
      setActiveHighlight(item.highlight.insightId);
      
      // Flash the element
      entryElement.classList.add('animate-pulse', 'bg-accent/20');
      setTimeout(() => {
        entryElement.classList.remove('animate-pulse', 'bg-accent/20');
      }, 2000);

      // Call external navigation handler
      if (onNavigate) {
        onNavigate(item.entry.id, item.highlight.insightId);
      }

      // Clear active highlight after a delay
      setTimeout(() => {
        setActiveHighlight(null);
      }, 3000);
    } else {
      console.error('[TranscriptNavigation] Entry element not found:', {
        entryId: item.entry.id,
        timestamp: Date.now()
      });
    }
  }, [onNavigate]);

  // Log navigation metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigationMetrics.totalNavigations > 0) {
        console.log('[TranscriptNavigation] Navigation metrics summary:', {
          ...navigationMetrics,
          averageNavigationsPerMinute: navigationMetrics.lastNavigation 
            ? (navigationMetrics.totalNavigations / ((Date.now() - navigationMetrics.lastNavigation.time) / 60000))
            : 0,
          mostUsedCategory: Object.entries(navigationMetrics.navigationsByType)
            .sort(([,a], [,b]) => b - a)[0]?.[0],
          timestamp: Date.now()
        });
      }
    }, 60000); // Log every minute

    return () => clearInterval(interval);
  }, [navigationMetrics]);

  // Get severity badge variant
  const getSeverityBadgeVariant = (severity: InsightSeverity) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Get severity icon
  const getSeverityIcon = (type: string, severity: InsightSeverity) => {
    if (type === 'safety' && (severity === 'critical' || severity === 'high')) {
      return <AlertTriangle className="h-3 w-3" />;
    }
    if (type === 'progress' && severity === 'high') {
      return <CheckCircle className="h-3 w-3" />;
    }
    if (type === 'billing' && severity === 'high') {
      return <CheckCircle className="h-3 w-3" />;
    }
    return null;
  };

  if (navigationGroups.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Navigation className="h-4 w-4 mr-2" />
            Transcript Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No insights available for navigation
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Navigation className="h-4 w-4 mr-2" />
            Transcript Navigation
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {highlights.length} insights
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-4 space-y-4">
            {navigationGroups.map((group) => (
              <div key={group.type} className="space-y-2">
                {/* Section Header */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between p-2 hover:bg-accent/50"
                  onClick={() => toggleSection(group.type)}
                  disabled={disabled}
                >
                  <div className="flex items-center space-x-2">
                    {expandedSections.has(group.type) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    {group.icon}
                    <span className="font-medium">{group.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {group.highPriorityCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {group.highPriorityCount} high
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {group.count}
                    </Badge>
                  </div>
                </Button>

                {/* Section Items */}
                {expandedSections.has(group.type) && (
                  <div className="space-y-1 pl-6">
                    {group.items.map((item, index) => (
                      <Button
                        key={`${item.highlight.insightId}-${index}`}
                        variant={activeHighlight === item.highlight.insightId ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full justify-start p-2 h-auto",
                          "hover:bg-accent hover:text-accent-foreground",
                          "transition-all duration-200"
                        )}
                        onClick={() => handleNavigate(item)}
                        disabled={disabled}
                      >
                        <div className="flex items-start space-x-2 text-left w-full">
                          <div className="flex-shrink-0 mt-0.5">
                            {getSeverityIcon(group.type, item.severity)}
                          </div>
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium truncate">
                                {item.title}
                              </span>
                              <Badge 
                                variant={getSeverityBadgeVariant(item.severity)}
                                className="text-xs ml-2 flex-shrink-0"
                              >
                                {item.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {item.subtitle}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{item.timestamp}</span>
                              <span>•</span>
                              <span>{item.entry.speaker}</span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 flex-shrink-0 opacity-50" />
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Navigation Stats */}
            {navigationMetrics.totalNavigations > 0 && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Hash className="h-3 w-3 mr-1" />
                    {navigationMetrics.totalNavigations} navigations
                  </span>
                  <span>
                    Most used: {Object.entries(navigationMetrics.navigationsByType)
                      .sort(([,a], [,b]) => b - a)[0]?.[0]}
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Export with memo for performance
export default React.memo(TranscriptNavigation);
