'use client';

/**
 * Billing Insights Panel Component
 * 
 * Displays billing analysis results with CPT and ICD-10 codes,
 * confidence percentages, one-click approval workflow, and compliance checks
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Eye
} from 'lucide-react';
import { BillingInsights, BillingCode } from '@/lib/types/ai-insights';
import { cn } from '@/lib/utils';

interface BillingInsightsPanelProps {
  insights: BillingInsights | null;
  isLoading?: boolean;
  error?: Error | null;
  onApproveCode?: (code: BillingCode) => void;
  onEditCode?: (code: BillingCode) => void;
  onExportCodes?: () => void;
  className?: string;
}

export function BillingInsightsPanel({
  insights,
  isLoading = false,
  error = null,
  onApproveCode,
  onEditCode,
  onExportCodes,
  className
}: BillingInsightsPanelProps) {
  const [approvedCodes, setApprovedCodes] = useState<Set<string>>(new Set());

  console.log('[BillingInsightsPanel] Rendering:', {
    hasInsights: !!insights,
    isLoading,
    hasError: !!error,
    cptCount: insights?.cptCodes?.length || 0,
    icdCount: insights?.icd10Codes?.length || 0,
    sessionType: insights?.sessionType?.detected,
    timestamp: Date.now()
  });

  const handleApproveCode = (code: BillingCode) => {
    console.log('[BillingInsightsPanel] Approving code:', {
      code: code.code,
      description: code.description,
      confidence: code.confidence
    });

    setApprovedCodes(prev => new Set([...prev, code.code]));
    onApproveCode?.(code);
  };

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
  const highConfidenceCptCodes = cptCodes.filter(code => code.confidence >= 0.8);
  const highConfidenceIcdCodes = icd10Codes.filter(code => code.confidence >= 0.8);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Billing Analysis</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {Math.round(confidence * 100)}% confidence
            </Badge>
            {onExportCodes && (
              <Button variant="outline" size="sm" onClick={onExportCodes}>
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Session Type & Duration */}
        {sessionType && (
          <SessionTypeSection sessionType={sessionType} />
        )}

        {/* High Confidence Codes - Quick Approval */}
        {(highConfidenceCptCodes.length > 0 || highConfidenceIcdCodes.length > 0) && (
          <HighConfidenceCodesSection 
            cptCodes={highConfidenceCptCodes}
            icdCodes={highConfidenceIcdCodes}
            approvedCodes={approvedCodes}
            onApproveCode={handleApproveCode}
          />
        )}

        {/* CPT Codes Section */}
        {cptCodes.length > 0 && (
          <BillingCodesSection 
            title="CPT Codes"
            codes={cptCodes}
            icon={<FileText className="h-4 w-4 text-blue-500" />}
            approvedCodes={approvedCodes}
            onApproveCode={handleApproveCode}
            onEditCode={onEditCode}
          />
        )}

        {/* ICD-10 Codes Section */}
        {icd10Codes.length > 0 && (
          <BillingCodesSection 
            title="ICD-10 Diagnosis Codes"
            codes={icd10Codes}
            icon={<AlertCircle className="h-4 w-4 text-purple-500" />}
            approvedCodes={approvedCodes}
            onApproveCode={handleApproveCode}
            onEditCode={onEditCode}
          />
        )}

        {/* Billing Optimization */}
        {billingOptimization && (
          <BillingOptimizationSection optimization={billingOptimization} />
        )}

        {/* Summary Stats */}
        <BillingSummarySection 
          insights={insights}
          approvedCount={approvedCodes.size}
        />
      </CardContent>
    </Card>
  );
}

// Session Type Section
function SessionTypeSection({ sessionType }: { sessionType: BillingInsights['sessionType'] }) {
  if (!sessionType) return null;

  console.log('[BillingInsightsPanel] Session type section:', {
    detected: sessionType.detected,
    duration: sessionType.duration,
    confidence: sessionType.confidence
  });

  const getSessionTypeColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4 text-blue-500" />
        <h3 className="font-semibold">Session Information</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Session Type</span>
            <Badge className={cn("border", getSessionTypeColor(sessionType.confidence))}>
              {sessionType.detected}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Duration</span>
            <span className="text-sm font-mono">{sessionType.duration} minutes</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Type Confidence</span>
            <span className="text-sm font-mono">
              {Math.round(sessionType.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// High Confidence Codes Section
function HighConfidenceCodesSection({
  cptCodes,
  icdCodes,
  approvedCodes,
  onApproveCode
}: {
  cptCodes: BillingCode[];
  icdCodes: BillingCode[];
  approvedCodes: Set<string>;
  onApproveCode: (code: BillingCode) => void;
}) {
  const allHighConfidenceCodes = [...cptCodes, ...icdCodes];
  const unapprovedCodes = allHighConfidenceCodes.filter(code => !approvedCodes.has(code.code));

  console.log('[BillingInsightsPanel] High confidence codes section:', {
    totalHighConfidence: allHighConfidenceCodes.length,
    unapproved: unapprovedCodes.length,
    approved: allHighConfidenceCodes.length - unapprovedCodes.length
  });

  if (allHighConfidenceCodes.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ThumbsUp className="h-4 w-4 text-green-500" />
          <h3 className="font-semibold text-green-700">High Confidence Recommendations</h3>
        </div>
        <Badge className="bg-green-100 text-green-800">
          {allHighConfidenceCodes.length} codes ≥80% confidence
        </Badge>
      </div>

      {unapprovedCodes.length > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="space-y-3">
            <p className="text-sm text-green-800 font-medium">
              Ready for one-click approval ({unapprovedCodes.length} codes):
            </p>
            
            <div className="space-y-2">
              {unapprovedCodes.map((code) => (
                <div key={code.code} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="font-mono">
                        {code.code}
                      </Badge>
                      <span className="text-sm">{code.description}</span>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        {Math.round(code.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    onClick={() => onApproveCode(code)}
                    className="ml-3"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                </div>
              ))}
            </div>

            {unapprovedCodes.length > 1 && (
              <Button 
                className="w-full mt-3"
                onClick={() => unapprovedCodes.forEach(onApproveCode)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve All High Confidence Codes ({unapprovedCodes.length})
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Billing Codes Section
function BillingCodesSection({
  title,
  codes,
  icon,
  approvedCodes,
  onApproveCode,
  onEditCode
}: {
  title: string;
  codes: BillingCode[];
  icon: React.ReactNode;
  approvedCodes: Set<string>;
  onApproveCode: (code: BillingCode) => void;
  onEditCode?: (code: BillingCode) => void;
}) {
  console.log('[BillingInsightsPanel] Billing codes section:', {
    title,
    codeCount: codes.length,
    approvedCount: codes.filter(c => approvedCodes.has(c.code)).length
  });

  const groupedCodes = codes.reduce((acc, code) => {
    acc[code.category] = acc[code.category] || [];
    acc[code.category].push(code);
    return acc;
  }, {} as Record<string, BillingCode[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        {icon}
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="outline">{codes.length} codes</Badge>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedCodes).map(([category, categoryCodes]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium capitalize text-gray-700">
              {category} ({categoryCodes.length})
            </h4>
            
            <div className="space-y-2">
              {categoryCodes.map((code) => {
                const isApproved = approvedCodes.has(code.code);
                
                return (
                  <div 
                    key={code.code}
                    className={cn(
                      "p-3 rounded border transition-all",
                      isApproved 
                        ? "bg-green-50 border-green-200" 
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="font-mono font-medium">
                            {code.code}
                          </Badge>
                          <ConfidenceBadge confidence={code.confidence} />
                          {isApproved && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-700">{code.description}</p>
                        
                        {code.modifiers && code.modifiers.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Modifiers:</span>
                            {code.modifiers.map((modifier, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {modifier}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {code.documentation && (
                          <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                            <strong>Documentation:</strong> {code.documentation}
                          </div>
                        )}
                        
                        {code.complianceNotes && code.complianceNotes.length > 0 && (
                          <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                            <strong>Compliance Notes:</strong>
                            <ul className="mt-1 space-y-1">
                              {code.complianceNotes.map((note, idx) => (
                                <li key={idx} className="flex items-start space-x-1">
                                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span>{note}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-3">
                        {!isApproved && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onApproveCode(code)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                        )}
                        
                        {onEditCode && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onEditCode(code)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
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

// Billing Optimization Section
function BillingOptimizationSection({ 
  optimization 
}: { 
  optimization: BillingInsights['billingOptimization'] 
}) {
  const { suggestedAdjustments, complianceIssues, revenueOpportunities } = optimization;

  console.log('[BillingInsightsPanel] Billing optimization section:', {
    adjustmentCount: suggestedAdjustments.length,
    complianceIssueCount: complianceIssues.length,
    opportunityCount: revenueOpportunities.length
  });

  if (suggestedAdjustments.length === 0 && complianceIssues.length === 0 && revenueOpportunities.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <TrendingUp className="h-4 w-4 text-blue-500" />
        <h3 className="font-semibold">Billing Optimization</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue Opportunities */}
        {revenueOpportunities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-700 flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>Revenue Opportunities</span>
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
              <span>Compliance Issues</span>
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
              <span>Suggested Adjustments</span>
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
    .filter(code => code.confidence >= 0.8).length;

  console.log('[BillingInsightsPanel] Billing summary section:', {
    totalCodes,
    approvedCount,
    approvalRate,
    highConfidenceCount
  });

  return (
    <div className="space-y-3 pt-4 border-t">
      <h3 className="font-semibold">Summary</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalCodes}</div>
          <div className="text-xs text-gray-500">Total Codes</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          <div className="text-xs text-gray-500">Approved</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{highConfidenceCount}</div>
          <div className="text-xs text-gray-500">High Confidence</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{approvalRate}%</div>
          <div className="text-xs text-gray-500">Approval Rate</div>
        </div>
      </div>
    </div>
  );
}

// Loading State
function BillingInsightsLoading({ className }: { className?: string }) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          <CardTitle className="text-lg">Billing Analysis</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <XCircle className="h-5 w-5 text-red-500" />
          <CardTitle className="text-lg">Billing Analysis Failed</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-red-600">
          {error.message || 'Failed to analyze billing codes'}
        </div>
      </CardContent>
    </Card>
  );
}

// Empty State
function BillingInsightsEmpty({ className }: { className?: string }) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-gray-400" />
          <CardTitle className="text-lg text-gray-600">Billing Analysis</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500">
          No billing analysis available
        </div>
      </CardContent>
    </Card>
  );
}

export default BillingInsightsPanel;
