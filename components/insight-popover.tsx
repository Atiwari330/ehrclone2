'use client';

/**
 * Insight Popover Component
 * 
 * Displays detailed insights on hover with 200ms delay, quick action buttons,
 * and smart viewport positioning for FAANG-quality user experience
 */

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Plus,
  Flag,
  CheckCircle,
  ArrowRight,
  Clock,
  User,
  Shield,
  FileText,
  Edit,
  ExternalLink,
  Copy,
  Loader2
} from 'lucide-react';
import { 
  TranscriptHighlight,
  SafetyAlert,
  BillingCode,
  GoalProgress,
  AIInsightsState,
  InsightSeverity
} from '@/lib/types/ai-insights';
import type { TranscriptEntry } from '@/lib/types/transcription';

// Props interface
export interface InsightPopoverProps {
  highlight: TranscriptHighlight;
  transcriptEntry: TranscriptEntry;
  insights: AIInsightsState;
  children: React.ReactNode;
  onAddToNote?: (highlight: TranscriptHighlight, content: string) => void;
  onFlagForReview?: (highlight: TranscriptHighlight, reason: string) => void;
  onCopyText?: (text: string) => void;
  hoverDelay?: number;
  className?: string;
  disabled?: boolean;
}

// Action result state
interface ActionResult {
  type: 'success' | 'error';
  message: string;
}

export function InsightPopover({
  highlight,
  transcriptEntry,
  insights,
  children,
  onAddToNote,
  onFlagForReview,
  onCopyText,
  hoverDelay = 200,
  className,
  disabled = false
}: InsightPopoverProps) {
  const [open, setOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  // Get relevant insight data based on highlight type
  const insightData = useMemo(() => {
    console.log('[InsightPopover] Getting insight data:', {
      highlightType: highlight.type,
      insightId: highlight.insightId,
      transcriptEntryId: transcriptEntry.id,
      timestamp: Date.now()
    });

    switch (highlight.type) {
      case 'safety':
        if (insights.safety.status === 'success' && insights.safety.data) {
          const alert = insights.safety.data.alerts.find(a => a.id === highlight.insightId);
          return { type: 'safety' as const, data: alert };
        }
        break;
      case 'billing':
        if (insights.billing.status === 'success' && insights.billing.data) {
          // Extract code from insightId (format: billing-cpt-12345 or billing-icd-A123)
          const [, codeType, code] = highlight.insightId.split('-');
          const codes = codeType === 'cpt' ? insights.billing.data.cptCodes : insights.billing.data.icd10Codes;
          const billingCode = codes.find(c => c.code === code);
          return { type: 'billing' as const, data: billingCode };
        }
        break;
      case 'progress':
        if (insights.progress.status === 'success' && insights.progress.data) {
          const goal = insights.progress.data.goalProgress.find(g => g.goalId === highlight.insightId);
          return { type: 'progress' as const, data: goal };
        }
        break;
    }
    return null;
  }, [highlight, insights, transcriptEntry.id]);

  // Calculate popover position when opening
  const updatePopoverPosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;
      
      setPopoverPosition({
        top: rect.bottom + scrollY + 8, // 8px gap below trigger
        left: rect.left + scrollX + rect.width / 2 // Center horizontally
      });
    }
  }, []);

  // Handle hover interactions
  const handleMouseEnter = useCallback(() => {
    if (disabled) return;

    // Clear any existing close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    // Set hover timeout
    hoverTimeoutRef.current = setTimeout(() => {
      console.log('[InsightPopover] Opening after hover delay:', {
        highlightId: highlight.insightId,
        delay: hoverDelay,
        timestamp: Date.now()
      });
      updatePopoverPosition();
      setOpen(true);
    }, hoverDelay);
  }, [disabled, hoverDelay, highlight.insightId, updatePopoverPosition]);

  const handleMouseLeave = useCallback(() => {
    // Clear hover timeout if not yet opened
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // Add small delay before closing to allow moving to popover content
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
      setActionResult(null);
    }, 100);
  }, []);

  // Handle popover content interactions
  const handlePopoverMouseEnter = useCallback(() => {
    // Clear close timeout when entering popover
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const handlePopoverMouseLeave = useCallback(() => {
    // Close popover when leaving
    setOpen(false);
    setActionResult(null);
  }, []);

  // Handle quick actions
  const handleAddToNote = useCallback(async () => {
    if (!onAddToNote || !insightData) return;

    console.log('[InsightPopover] Add to note action:', {
      highlightId: highlight.insightId,
      type: highlight.type,
      timestamp: Date.now()
    });

    setActionLoading('add-to-note');
    try {
      const content = formatInsightForNote(insightData, transcriptEntry);
      await onAddToNote(highlight, content);
      setActionResult({ type: 'success', message: 'Added to note' });
      
      // Auto-close after success
      setTimeout(() => {
        setOpen(false);
        setActionResult(null);
      }, 1500);
    } catch (error) {
      setActionResult({ type: 'error', message: 'Failed to add to note' });
      console.error('[InsightPopover] Add to note error:', error);
    } finally {
      setActionLoading(null);
    }
  }, [onAddToNote, insightData, highlight, transcriptEntry]);

  const handleFlagForReview = useCallback(async () => {
    if (!onFlagForReview || !insightData) return;

    console.log('[InsightPopover] Flag for review action:', {
      highlightId: highlight.insightId,
      type: highlight.type,
      timestamp: Date.now()
    });

    setActionLoading('flag-for-review');
    try {
      const reason = formatFlagReason(insightData, highlight);
      await onFlagForReview(highlight, reason);
      setActionResult({ type: 'success', message: 'Flagged for review' });
      
      // Auto-close after success
      setTimeout(() => {
        setOpen(false);
        setActionResult(null);
      }, 1500);
    } catch (error) {
      setActionResult({ type: 'error', message: 'Failed to flag' });
      console.error('[InsightPopover] Flag for review error:', error);
    } finally {
      setActionLoading(null);
    }
  }, [onFlagForReview, insightData, highlight]);

  const handleCopyHighlightedText = useCallback(() => {
    const highlightedText = transcriptEntry.text.substring(
      highlight.startIndex,
      highlight.endIndex
    );
    
    if (onCopyText) {
      onCopyText(highlightedText);
    } else {
      navigator.clipboard.writeText(highlightedText);
    }
    
    setActionResult({ type: 'success', message: 'Copied to clipboard' });
    
    console.log('[InsightPopover] Copy text action:', {
      highlightId: highlight.insightId,
      textLength: highlightedText.length,
      timestamp: Date.now()
    });
    
    setTimeout(() => {
      setActionResult(null);
    }, 2000);
  }, [transcriptEntry.text, highlight, onCopyText]);

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Don't render if no insight data found
  if (!insightData || !insightData.data) {
    return <>{children}</>;
  }

  return (
    <span className="relative inline-block">
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "cursor-help transition-all duration-200",
          className
        )}
      >
        {children}
      </span>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          className={cn(
            "absolute z-50 w-96 rounded-lg border bg-popover p-0 text-popover-foreground shadow-lg",
            "animate-in fade-in-0 zoom-in-95"
          )}
          style={{
            position: 'absolute',
            top: popoverPosition.top,
            left: popoverPosition.left,
            transform: 'translateX(-50%)'
          }}
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
        >
          <ScrollArea className="max-h-[500px]">
            {insightData.type === 'safety' && (
              <SafetyInsightContent 
                alert={insightData.data as SafetyAlert}
                highlight={highlight}
                transcriptEntry={transcriptEntry}
              />
            )}
            
            {insightData.type === 'billing' && (
              <BillingInsightContent 
                code={insightData.data as BillingCode}
                highlight={highlight}
                transcriptEntry={transcriptEntry}
              />
            )}
            
            {insightData.type === 'progress' && (
              <ProgressInsightContent 
                goal={insightData.data as GoalProgress}
                highlight={highlight}
                transcriptEntry={transcriptEntry}
              />
            )}

            <Separator />

            {/* Quick Actions */}
            <div className="p-4 space-y-3">
              {actionResult && (
                <div className={cn(
                  "p-2 rounded text-sm font-medium text-center",
                  actionResult.type === 'success' 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                )}>
                  {actionResult.message}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {onAddToNote && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleAddToNote}
                    disabled={actionLoading !== null}
                    className="flex-1"
                  >
                    {actionLoading === 'add-to-note' ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3 mr-1" />
                    )}
                    Add to Note
                  </Button>
                )}

                {onFlagForReview && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleFlagForReview}
                    disabled={actionLoading !== null}
                    className="flex-1"
                  >
                    {actionLoading === 'flag-for-review' ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Flag className="h-3 w-3 mr-1" />
                    )}
                    Flag for Review
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyHighlightedText}
                  disabled={actionLoading !== null}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              {/* Context Information */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span>Speaker: {transcriptEntry.speaker}</span>
                  <span>{new Date(transcriptEntry.timestamp).toLocaleTimeString()}</span>
                </div>
                {transcriptEntry.confidence && transcriptEntry.confidence < 0.8 && (
                  <div className="text-amber-600">
                    Low confidence: {Math.round(transcriptEntry.confidence * 100)}%
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>,
        document.body
      )}
    </span>
  );
}

// Safety Insight Content
function SafetyInsightContent({ 
  alert, 
  highlight,
  transcriptEntry 
}: { 
  alert: SafetyAlert; 
  highlight: TranscriptHighlight;
  transcriptEntry: TranscriptEntry;
}) {
  const getSeverityIcon = (severity: InsightSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Shield className="h-4 w-4 text-yellow-500" />;
      default:
        return <Shield className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getSeverityIcon(alert.severity)}
            <CardTitle className="text-sm font-semibold">Safety Alert</CardTitle>
          </div>
          <Badge 
            variant="destructive"
            className={cn(
              "text-xs capitalize",
              alert.severity === 'critical' && "bg-red-500",
              alert.severity === 'high' && "bg-orange-500"
            )}
          >
            {alert.severity}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
          <p className="text-sm text-muted-foreground">{alert.description}</p>
        </div>

        {alert.riskScore !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Risk Score</span>
            <span className="font-mono font-medium">{alert.riskScore}/100</span>
          </div>
        )}

        {alert.recommendedActions.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium uppercase text-muted-foreground">
              Recommended Actions
            </h5>
            <ul className="space-y-1">
              {alert.recommendedActions.slice(0, 3).map((action, idx) => (
                <li key={idx} className="flex items-start space-x-1 text-sm">
                  <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {alert.urgentResponse && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            <strong>Urgent Response Required</strong>
          </div>
        )}

        {/* Highlighted Text Context */}
        <div className="space-y-1">
          <h5 className="text-xs font-medium uppercase text-muted-foreground">
            Highlighted Text
          </h5>
            <p className="text-sm italic text-muted-foreground bg-muted p-2 rounded">
              &ldquo;...{transcriptEntry.text.substring(
                Math.max(0, highlight.startIndex - 20),
                Math.min(transcriptEntry.text.length, highlight.endIndex + 20)
              )}...&rdquo;
            </p>
        </div>
      </CardContent>
    </>
  );
}

// Billing Insight Content
function BillingInsightContent({ 
  code, 
  highlight,
  transcriptEntry 
}: { 
  code: BillingCode; 
  highlight: TranscriptHighlight;
  transcriptEntry: TranscriptEntry;
}) {
  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <CardTitle className="text-sm font-semibold">Billing Code</CardTitle>
          </div>
          <Badge 
            variant="outline"
            className="text-xs font-mono"
          >
            {code.code}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <h4 className="font-medium text-sm mb-1">{code.description}</h4>
          {code.documentation && (
            <p className="text-sm text-muted-foreground">{code.documentation}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Confidence</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-medium">{Math.round(code.confidence * 100)}%</span>
            <Badge 
              variant={code.confidence >= 0.8 ? "default" : "secondary"}
              className="text-xs"
            >
              {code.confidence >= 0.8 ? 'High' : code.confidence >= 0.6 ? 'Medium' : 'Low'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Category</span>
          <Badge variant="outline" className="text-xs capitalize">
            {code.category}
          </Badge>
        </div>

        {code.modifiers && code.modifiers.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium uppercase text-muted-foreground">
              Modifiers
            </h5>
            <div className="flex flex-wrap gap-1">
              {code.modifiers.map((modifier, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {modifier}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {code.complianceNotes && code.complianceNotes.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium uppercase text-muted-foreground">
              Compliance Notes
            </h5>
            <ul className="space-y-1">
              {code.complianceNotes.map((note, idx) => (
                <li key={idx} className="flex items-start space-x-1 text-sm text-amber-700">
                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Highlighted Text Context */}
        <div className="space-y-1">
          <h5 className="text-xs font-medium uppercase text-muted-foreground">
            Supporting Documentation
          </h5>
          <p className="text-sm italic text-muted-foreground bg-muted p-2 rounded">
            &ldquo;...{transcriptEntry.text.substring(
              Math.max(0, highlight.startIndex - 20),
              Math.min(transcriptEntry.text.length, highlight.endIndex + 20)
            )}...&rdquo;
          </p>
        </div>
      </CardContent>
    </>
  );
}

// Progress Insight Content
function ProgressInsightContent({ 
  goal, 
  highlight,
  transcriptEntry 
}: { 
  goal: GoalProgress; 
  highlight: TranscriptHighlight;
  transcriptEntry: TranscriptEntry;
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'achieved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'partially_met':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(goal.currentStatus)}
            <CardTitle className="text-sm font-semibold">Treatment Goal</CardTitle>
          </div>
          <Badge 
            variant="outline"
            className="text-xs"
          >
            {goal.progressPercentage}% Complete
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <h4 className="font-medium text-sm mb-1">{goal.goalDescription}</h4>
          <Badge 
            variant={goal.currentStatus === 'achieved' ? 'default' : 'secondary'}
            className="text-xs capitalize"
          >
            {goal.currentStatus.replace('_', ' ')}
          </Badge>
        </div>

        {goal.evidence.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium uppercase text-green-700">
              Evidence of Progress
            </h5>
            <ul className="space-y-1">
              {goal.evidence.slice(0, 3).map((evidence, idx) => (
                <li key={idx} className="flex items-start space-x-1 text-sm text-green-700">
                  <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{evidence}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {goal.barriers.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium uppercase text-red-700">
              Barriers
            </h5>
            <ul className="space-y-1">
              {goal.barriers.slice(0, 2).map((barrier, idx) => (
                <li key={idx} className="flex items-start space-x-1 text-sm text-red-700">
                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{barrier}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {goal.nextSteps.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium uppercase text-blue-700">
              Next Steps
            </h5>
            <ul className="space-y-1">
              {goal.nextSteps.slice(0, 2).map((step, idx) => (
                <li key={idx} className="flex items-start space-x-1 text-sm text-blue-700">
                  <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Highlighted Text Context */}
        <div className="space-y-1">
          <h5 className="text-xs font-medium uppercase text-muted-foreground">
            Related Discussion
          </h5>
          <p className="text-sm italic text-muted-foreground bg-muted p-2 rounded">
            &ldquo;...{transcriptEntry.text.substring(
              Math.max(0, highlight.startIndex - 20),
              Math.min(transcriptEntry.text.length, highlight.endIndex + 20)
            )}...&rdquo;
          </p>
        </div>
      </CardContent>
    </>
  );
}

// Helper function to format insight for clinical note
function formatInsightForNote(
  insightData: { type: string; data: any },
  transcriptEntry: TranscriptEntry
): string {
  const { type, data } = insightData;
  const timestamp = new Date(transcriptEntry.timestamp).toLocaleTimeString();
  
  switch (type) {
    case 'safety':
      const alert = data as SafetyAlert;
      return `[Safety Alert - ${alert.severity}] ${alert.title}: ${alert.description} (noted at ${timestamp} during discussion with ${transcriptEntry.speaker})`;
      
    case 'billing':
      const code = data as BillingCode;
      return `[Billing Code] ${code.code} - ${code.description} (${Math.round(code.confidence * 100)}% confidence based on ${timestamp} discussion)`;
      
    case 'progress':
      const goal = data as GoalProgress;
      return `[Treatment Goal] ${goal.goalDescription} - ${goal.currentStatus} (${goal.progressPercentage}% complete as discussed at ${timestamp})`;
      
    default:
      return `[${type}] Insight noted at ${timestamp}`;
  }
}

// Helper function to format flag reason
function formatFlagReason(
  insightData: { type: string; data: any },
  highlight: TranscriptHighlight
): string {
  const { type, data } = insightData;
  
  switch (type) {
    case 'safety':
      const alert = data as SafetyAlert;
      return `${alert.severity} severity safety alert: ${alert.title}`;
      
    case 'billing':
      const code = data as BillingCode;
      return `Billing code ${code.code} requires review (${Math.round(code.confidence * 100)}% confidence)`;
      
    case 'progress':
      const goal = data as GoalProgress;
      return `Goal progress review needed: ${goal.goalDescription} (${goal.currentStatus})`;
      
    default:
      return `${type} insight flagged for review`;
  }
}

export default InsightPopover;
