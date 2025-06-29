'use client';

/**
 * Billing Insights Tab Component
 * 
 * Progressive disclosure version of billing insights for the new V2 layout.
 * Displays billing analysis results with CPT and ICD-10 codes,
 * confidence percentages, one-click approval workflow, and progressive disclosure.
 * 
 * OPTIMIZED: React.memo wrapper and profiling for efficient re-renders
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Edit,
  Download,
  FileText,
  TrendingUp,
  AlertCircle,
  ThumbsUp,
  Eye,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';
import { BillingInsights, BillingCode } from '@/lib/types/ai-insights';
import { cn } from '@/lib/utils';
import { InsightSummaryCard } from '../insight-summary-card';

interface BillingInsightsTabProps {
  data: BillingInsights | null;
  isLoading?: boolean;
  error?: Error | null;
  onApproveCode?: (code: BillingCode) => void;
  onEditCode?: (code: BillingCode) => void;
  onExportCodes?: () => void;
  className?: string;
}

export function BillingInsightsTab({
  data: insights,
  isLoading = false,
  error = null,
  onApproveCode,
  onEditCode,
  onExportCodes,
  className
}: BillingInsightsTabProps) {
  const [approvedCodes, setApprovedCodes] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showAllCodes, setShowAllCodes] = useState(false);

  console.log('[BillingInsightsTab] Rendering:', {
    hasInsights: !!insights,
    isLoading,
    hasError: !!error,
    cptCount: insights?.cptCodes?.length || 0,
    icdCount: insights?.icd10Codes?.length || 0,
    sessionType: insights?.sessionType?.detected,
    approvedCount: approvedCodes.size,
    expandedSections: Array.from(expandedSections),
    showAllCodes,
    timestamp: Date.now()
  });

  // Handle code approval
  const handleApproveCode = React.useCallback((code: BillingCode) => {
    console.log('[BillingInsightsTab] Approving code:', {
      code: code.code,
      description: code.description,
      confidence: code.confidence,
      timestamp: Date.now()
    });

    setApprovedCodes(prev => new Set([...prev, code.code]));
    onApproveCode?.(code);
  }, [onApproveCode]);

  // Handle bulk approval
  const handleApproveBulk = React.useCallback((codes: BillingCode[]) => {
    console.log('[BillingInsightsTab] Bulk approval initiated:', {
      codeCount: codes.length,
      codes: codes.map(c => c.code),
      timestamp: Date.now()
    });

    codes.forEach(code => {
      setApprovedCodes(prev => new Set([...prev, code.code]));
      onApproveCode?.(code);
    });
  }, [onApproveCode]);

  // Handle section expansion
  const toggleSection = React.useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      
      console.log('[BillingInsightsTab] Section toggled:', {
        sectionId,
        expanded: newSet.has(sectionId),
        totalExpanded: newSet.size,
        timestamp: Date.now()
      });
      
      return newSet;
    });
  }, []);

  // Handle show all codes toggle
  const toggleShowAllCodes = React.useCallback(() => {
    setShowAllCodes(prev => {
      console.log('[BillingInsightsTab] Show all codes toggled:', {
        wasShowing: prev,
        willShow: !prev,
        timestamp: Date.now()
      });
      return !prev;
    });
  }, []);

  // Component lifecycle logging
  React.useEffect(() => {
    console.log('[BillingInsightsTab] Tab mounted:', {
      hasData: !!insights,
      isLoading,
      hasError: !!error,
      timestamp: Date.now()
    });

    return () => {
      console.log('[BillingInsightsTab] Tab unmounted:', {
        timestamp: Date.now()
      });
    };
  }, [insights, isLoading, error]);

  if (isLoading) {
    return <BillingInsightsLoading className={className} />;
  }

  if (error) {
    return <BillingInsightsError error={error} className={className} />;
  }

  if (!insights) {
    return <BillingInsightsEmpty className={className} />;
  }

  const { cptCodes, icd10Codes, sessionType, billingOptimization, confidence } = insights;
  
  // Helper function to extract confidence score
  const getConfidenceScore = (confidence: any): number => {
    if (typeof confidence === 'object' && confidence?.score !== undefined) {
      return confidence.score;
    }
    if (typeof confidence === 'number') {
      return confidence;
    }
    return 0;
  };

  // Progressive disclosure: Focus on high-confidence codes first
  const allCodes = [...cptCodes, ...icd10Codes];
  const highConfidenceCodes = allCodes.filter(code => {
    const confidenceScore = getConfidenceScore(code.confidence);
    return confidenceScore >= 0.8;
  });
  const mediumConfidenceCodes = allCodes.filter(code => {
    const confidenceScore = getConfidenceScore(code.confidence);
    return confidenceScore >= 0.6 && confidenceScore < 0.8;
  });
  const lowConfidenceCodes = allCodes.filter(code => {
    const confidenceScore = getConfidenceScore(code.confidence);
    return confidenceScore < 0.6;
  });

  // Show top 3 high-confidence codes by default
  const displayedHighConfidenceCodes = showAllCodes ? highConfidenceCodes : highConfidenceCodes.slice(0, 3);
  const hiddenHighConfidenceCount = highConfidenceCodes.length - displayedHighConfidenceCodes.length;

  // Get unapproved high-confidence codes for bulk approval
  const unapprovedHighConfidenceCodes = highConfidenceCodes.filter(code => !approvedCodes.has(code.code));

  return (
    <div className={cn('h-full flex flex-col', className)}>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Session Information */}
          {sessionType && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <h3 className="text-base font-medium">Session Information</h3>
                </div>
                <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-sm text-muted-foreground">
                  {Math.round(confidence * 100)}% confidence
                </Badge>
                  {onExportCodes && (
                    <Button variant="ghost" size="sm" onClick={onExportCodes}>
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Session Type</span>
                    <div className="mt-1">
                      <SessionTypeBadge 
                        sessionType={sessionType.detected} 
                        confidence={sessionType.confidence} 
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Duration</span>
                    <div className="mt-1 text-sm font-mono">{sessionType.duration} minutes</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* High-Confidence Codes - Quick Approval */}
          {highConfidenceCodes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                  <h3 className="text-base font-medium">High-Confidence Recommendations</h3>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {highConfidenceCodes.length} codes ≥80%
                  </Badge>
                </div>

                {hiddenHighConfidenceCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleShowAllCodes}
                    className="text-xs"
                  >
                    {showAllCodes ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Show fewer
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        View all {highConfidenceCodes.length} suggestions
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Bulk Approval Section */}
              {unapprovedHighConfidenceCodes.length > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-green-800">
                      Ready for one-click approval ({unapprovedHighConfidenceCodes.length} codes)
                    </p>
                    {unapprovedHighConfidenceCodes.length > 1 && (
                      <Button 
                        size="sm"
                        onClick={() => handleApproveBulk(unapprovedHighConfidenceCodes)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve All
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-green-700">
                    These codes have high confidence scores and match session content well.
                  </div>
                </div>
              )}

              {/* High-Confidence Code Cards */}
              <div className="space-y-2">
                {displayedHighConfidenceCodes.map((code) => (
                  <InsightSummaryCard
                    key={code.code}
                    id={code.code}
                    title={code.code}
                    description={code.description}
                    severity="high"
                    confidence={getConfidenceScore(code.confidence) * 100}
                    badges={[
                      { label: code.category, variant: 'outline' as const },
                      ...(approvedCodes.has(code.code) ? [{
                        label: 'Approved',
                        variant: 'default' as const,
                        className: 'bg-green-100 text-green-800 border-green-200'
                      }] : [])
                    ]}
                    expanded={expandedSections.has(code.code)}
                    onToggleExpanded={(expanded) => toggleSection(code.code)}
                  >
                    <ExpandedBillingContent 
                      code={code} 
                      isApproved={approvedCodes.has(code.code)}
                      onApproveCode={handleApproveCode}
                      onEditCode={onEditCode}
                    />
                  </InsightSummaryCard>
                ))}
              </div>
            </div>
          )}

          {/* Medium Confidence Codes - Collapsible */}
          {mediumConfidenceCodes.length > 0 && (
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('medium-confidence')}
                className="w-full justify-between p-3 h-auto"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-base font-medium">Medium Confidence Codes</span>
                  <Badge variant="outline" className="text-xs">
                    {mediumConfidenceCodes.length} codes 60-79%
                  </Badge>
                </div>
                {expandedSections.has('medium-confidence') ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {expandedSections.has('medium-confidence') && (
                <div className="space-y-2">
                  {mediumConfidenceCodes.map((code) => (
                    <InsightSummaryCard
                      key={code.code}
                      id={code.code}
                      title={code.code}
                      description={code.description}
                      severity="medium"
                      confidence={getConfidenceScore(code.confidence) * 100}
                      badges={[
                        { label: code.category, variant: 'outline' as const },
                        ...(approvedCodes.has(code.code) ? [{
                          label: 'Approved',
                          variant: 'default' as const,
                          className: 'bg-green-100 text-green-800 border-green-200'
                        }] : [])
                      ]}
                      expanded={expandedSections.has(code.code)}
                      onToggleExpanded={(expanded) => toggleSection(code.code)}
                    >
                      <ExpandedBillingContent 
                        code={code} 
                        isApproved={approvedCodes.has(code.code)}
                        onApproveCode={handleApproveCode}
                        onEditCode={onEditCode}
                      />
                    </InsightSummaryCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Low Confidence Codes - Collapsible */}
          {lowConfidenceCodes.length > 0 && (
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('low-confidence')}
                className="w-full justify-between p-3 h-auto"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-base font-medium">Review Required</span>
                  <Badge variant="outline" className="text-xs">
                    {lowConfidenceCodes.length} codes &lt;60%
                  </Badge>
                </div>
                {expandedSections.has('low-confidence') ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {expandedSections.has('low-confidence') && (
                <div className="space-y-2">
                  {lowConfidenceCodes.map((code) => (
                    <InsightSummaryCard
                      key={code.code}
                      id={code.code}
                      title={code.code}
                      description={code.description}
                      severity="low"
                      confidence={getConfidenceScore(code.confidence) * 100}
                      badges={[
                        { label: code.category, variant: 'outline' as const },
                        ...(approvedCodes.has(code.code) ? [{
                          label: 'Approved',
                          variant: 'default' as const,
                          className: 'bg-green-100 text-green-800 border-green-200'
                        }] : [])
                      ]}
                      expanded={expandedSections.has(code.code)}
                      onToggleExpanded={(expanded) => toggleSection(code.code)}
                    >
                      <ExpandedBillingContent 
                        code={code} 
                        isApproved={approvedCodes.has(code.code)}
                        onApproveCode={handleApproveCode}
                        onEditCode={onEditCode}
                      />
                    </InsightSummaryCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Billing Optimization - Collapsible */}
          {billingOptimization && (
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('optimization')}
                className="w-full justify-between p-3 h-auto"
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span className="text-base font-medium">Billing Optimization</span>
                  <Badge variant="outline" className="text-xs">
                    {(billingOptimization.suggestedAdjustments?.length || 0) + 
                     (billingOptimization.complianceIssues?.length || 0) + 
                     (billingOptimization.revenueOpportunities?.length || 0)} items
                  </Badge>
                </div>
                {expandedSections.has('optimization') ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {expandedSections.has('optimization') && (
                <BillingOptimizationSection optimization={billingOptimization} />
              )}
            </div>
          )}

          {/* Summary Statistics */}
          <BillingSummarySection 
            insights={insights}
            approvedCount={approvedCodes.size}
          />
        </div>
      </ScrollArea>
    </div>
  );
}

// Expanded Billing Content Component
function ExpandedBillingContent({
  code,
  isApproved,
  onApproveCode,
  onEditCode
}: {
  code: BillingCode;
  isApproved: boolean;
  onApproveCode: (code: BillingCode) => void;
  onEditCode?: (code: BillingCode) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Modifiers */}
      {code.modifiers && code.modifiers.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground mb-1">
            Modifiers:
          </h5>
          <div className="flex flex-wrap gap-1">
            {code.modifiers.map((modifier, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {modifier}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Documentation */}
      {code.documentation && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground mb-1">
            Documentation Requirements:
          </h5>
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            {code.documentation}
          </div>
        </div>
      )}

      {/* Compliance Notes */}
      {code.complianceNotes && code.complianceNotes.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground mb-1">
            Compliance Notes:
          </h5>
          <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
            <ul className="space-y-1">
              {code.complianceNotes.map((note, idx) => (
                <li key={idx} className="flex items-start space-x-1">
                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-2 border-t">
        {!isApproved && (
          <Button 
            size="sm"
            onClick={() => {
              console.log('[BillingInsightsTab] Code approved via expanded view:', {
                code: code.code,
                confidence: code.confidence,
                timestamp: Date.now()
              });
              onApproveCode(code);
            }}
            className="text-xs"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Approve Code
          </Button>
        )}
        
        {onEditCode && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              console.log('[BillingInsightsTab] Code edit requested via expanded view:', {
                code: code.code,
                timestamp: Date.now()
              });
              onEditCode(code);
            }}
            className="text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit Details
          </Button>
        )}
      </div>
    </div>
  );
}

// Session Type Badge Component
function SessionTypeBadge({
  sessionType, 
  confidence 
}: { 
  sessionType: string; 
  confidence: number; 
}) {
  const getSessionTypeColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge className={cn("border text-xs", getSessionTypeColor(confidence))}>
        {sessionType}
      </Badge>
      <span className="text-xs text-muted-foreground">
        {Math.round(confidence * 100)}% confidence
      </span>
    </div>
  );
}

// Confidence Badge Component
function ConfidenceBadge({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.9) return 'bg-green-100 text-green-800 border-green-200';
    if (conf >= 0.8) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (conf >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Badge className={cn("text-xs border", getConfidenceColor(confidence))}>
      {percentage}% confidence
    </Badge>
  );
}

// Billing Optimization Section Component
function BillingOptimizationSection({ 
  optimization 
}: { 
  optimization: BillingInsights['billingOptimization'] 
}) {
  const { suggestedAdjustments = [], complianceIssues = [], revenueOpportunities = [] } = optimization;

  return (
    <div className="p-3 bg-muted/30 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue Opportunities */}
        {revenueOpportunities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-700 flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>Revenue Opportunities ({revenueOpportunities.length})</span>
            </h4>
            <div className="space-y-1">
              {revenueOpportunities.map((opportunity, idx) => (
                <div key={idx} className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
                  {opportunity}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Issues */}
        {complianceIssues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-700 flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3" />
              <span>Compliance Issues ({complianceIssues.length})</span>
            </h4>
            <div className="space-y-1">
              {complianceIssues.map((issue, idx) => (
                <div key={idx} className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200">
                  {issue}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Adjustments */}
        {suggestedAdjustments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-700 flex items-center space-x-1">
              <Edit className="h-3 w-3" />
              <span>Suggested Adjustments ({suggestedAdjustments.length})</span>
            </h4>
            <div className="space-y-1">
              {suggestedAdjustments.map((adjustment, idx) => (
                <div key={idx} className="text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
                  {adjustment}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Billing Summary Section
function BillingSummarySection({
  insights,
  approvedCount
}: {
  insights: BillingInsights;
  approvedCount: number;
}) {
  const totalCodes = insights.cptCodes.length + insights.icd10Codes.length;
  const approvalRate = totalCodes > 0 ? Math.round((approvedCount / totalCodes) * 100) : 0;
  
  const highConfidenceCount = [...insights.cptCodes, ...insights.icd10Codes]
    .filter((code: any) => {
      const confidenceScore = typeof code.confidence === 'object' ? code.confidence.score : code.confidence;
      return confidenceScore >= 0.8;
    }).length;

  return (
    <div className="space-y-3 pt-4 border-t">
      <h3 className="text-base font-medium">Summary</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalCodes}</div>
          <div className="text-xs text-muted-foreground">Total Codes</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          <div className="text-xs text-muted-foreground">Approved</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{highConfidenceCount}</div>
          <div className="text-xs text-muted-foreground">High Confidence</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{approvalRate}%</div>
          <div className="text-xs text-muted-foreground">Approval Rate</div>
        </div>
      </div>
    </div>
  );
}

// Loading State
function BillingInsightsLoading({ className }: { className?: string }) {
  return (
    <div className={cn('h-full flex items-center justify-center', className)}>
      <div className="text-center space-y-2">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-muted-foreground">Analyzing billing codes...</p>
      </div>
    </div>
  );
}

// Error State
function BillingInsightsError({ 
  error, 
  className 
}: { 
  error: Error; 
  className?: string; 
}) {
  return (
    <div className={cn('h-full flex items-center justify-center', className)}>
      <div className="text-center space-y-2">
        <XCircle className="h-8 w-8 text-destructive mx-auto" />
        <p className="text-sm font-medium">Billing Analysis Failed</p>
        <p className="text-xs text-muted-foreground">
          {error.message || 'Failed to analyze billing codes'}
        </p>
      </div>
    </div>
  );
}

// Empty State
function BillingInsightsEmpty({ className }: { className?: string }) {
  return (
    <div className={cn('h-full flex items-center justify-center', className)}>
      <div className="text-center space-y-2">
        <DollarSign className="h-8 w-8 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">No billing analysis available</p>
      </div>
    </div>
  );
}

// Performance optimization: Wrap component with React.memo to prevent unnecessary re-renders
const MemoizedBillingInsightsTab = React.memo(BillingInsightsTab, (prevProps, nextProps) => {
  // Custom comparison for props to determine if re-render is needed
  const shouldSkipRender = (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.error === nextProps.error &&
    prevProps.data === nextProps.data &&
    prevProps.className === nextProps.className
  );

  console.log('[BillingInsightsTab] React.memo comparison:', {
    shouldSkipRender,
    dataChanged: prevProps.data !== nextProps.data,
    loadingChanged: prevProps.isLoading !== nextProps.isLoading,
    errorChanged: prevProps.error !== nextProps.error,
    renderCount: performance.now(),
    timestamp: Date.now()
  });

  return shouldSkipRender;
});

MemoizedBillingInsightsTab.displayName = 'BillingInsightsTab';

export default MemoizedBillingInsightsTab;
