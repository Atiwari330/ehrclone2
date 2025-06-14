'use client';

/**
 * Safety Insights Tab Component
 * 
 * Progressive disclosure version of safety insights for the new V2 layout.
 * Displays safety analysis results with prominent high-risk alerts,
 * severity-based styling, and progressive disclosure patterns.
 * 
 * OPTIMIZED: React.memo wrapper and profiling for efficient re-renders
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  AlertCircle, 
  Phone, 
  User, 
  Shield, 
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
  BarChart3
} from 'lucide-react';
import { SafetyInsights, SafetyAlert } from '@/lib/types/ai-insights';
import { cn } from '@/lib/utils';
import { InsightSummaryCard } from '../insight-summary-card';

interface SafetyInsightsTabProps {
  data: SafetyInsights | null;
  isLoading?: boolean;
  error?: Error | null;
  onContactCrisis?: () => void;
  onContactSupervisor?: () => void;
  onMarkReviewed?: (alertId: string) => void;
  className?: string;
}

export function SafetyInsightsTab({
  data: insights,
  isLoading = false,
  error = null,
  onContactCrisis,
  onContactSupervisor,
  onMarkReviewed,
  className
}: SafetyInsightsTabProps) {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set());
  const [showAllAlerts, setShowAllAlerts] = React.useState(false);

  console.log('[SafetyInsightsTab] Rendering:', {
    hasInsights: !!insights,
    isLoading,
    hasError: !!error,
    alertCount: insights?.alerts?.length || 0,
    riskLevel: insights?.riskAssessment?.overallRisk,
    expandedSections: Array.from(expandedSections),
    showAllAlerts,
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
      
      console.log('[SafetyInsightsTab] Section toggled:', {
        sectionId,
        expanded: newSet.has(sectionId),
        totalExpanded: newSet.size,
        timestamp: Date.now()
      });
      
      return newSet;
    });
  }, []);

  // Handle show all alerts toggle
  const toggleShowAllAlerts = React.useCallback(() => {
    setShowAllAlerts(prev => {
      console.log('[SafetyInsightsTab] Show all alerts toggled:', {
        wasShowing: prev,
        willShow: !prev,
        timestamp: Date.now()
      });
      return !prev;
    });
  }, []);

  // Component lifecycle logging
  React.useEffect(() => {
    console.log('[SafetyInsightsTab] Tab mounted:', {
      hasData: !!insights,
      isLoading,
      hasError: !!error,
      timestamp: Date.now()
    });

    return () => {
      console.log('[SafetyInsightsTab] Tab unmounted:', {
        timestamp: Date.now()
      });
    };
  }, [insights, isLoading, error]);

  if (isLoading) {
    return <SafetyInsightsLoading className={className} />;
  }

  if (error) {
    return <SafetyInsightsError error={error} className={className} />;
  }

  if (!insights) {
    return <SafetyInsightsEmpty className={className} />;
  }

  const { riskAssessment, alerts, recommendations, confidence } = insights;
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const highAlerts = alerts.filter(alert => alert.severity === 'high');
  const otherAlerts = alerts.filter(alert => !['critical', 'high'].includes(alert.severity));
  const urgentResponse = alerts.some(alert => alert.urgentResponse);

  // Progressive disclosure: Show top 3 critical/high alerts by default
  const priorityAlerts = [...criticalAlerts, ...highAlerts];
  const displayedAlerts = showAllAlerts ? priorityAlerts : priorityAlerts.slice(0, 3);
  const hiddenAlertsCount = priorityAlerts.length - displayedAlerts.length;

  return (
    <div className={cn('h-full flex flex-col', className)}>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Overall Risk Assessment Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <h3 className="font-medium">Risk Assessment</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {Math.round(confidence * 100)}% confidence
                </Badge>
                <RiskLevelBadge risk={riskAssessment.overallRisk} />
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Risk Level</span>
                <span className="text-sm font-mono">
                  {riskAssessment.riskScore}/100
                </span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all",
                    riskAssessment.overallRisk === 'critical' ? "bg-red-500" :
                    riskAssessment.overallRisk === 'high' ? "bg-orange-500" :
                    riskAssessment.overallRisk === 'medium' ? "bg-yellow-500" :
                    "bg-green-500"
                  )}
                  style={{ width: `${riskAssessment.riskScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Critical & High Priority Alerts - Progressive Disclosure */}
          {priorityAlerts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <h3 className="font-medium">Priority Alerts</h3>
                  <Badge variant="destructive" className="text-xs">
                    {priorityAlerts.length}
                  </Badge>
                </div>

                {hiddenAlertsCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleShowAllAlerts}
                    className="text-xs"
                  >
                    {showAllAlerts ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Show fewer
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        View all {priorityAlerts.length} alerts
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {displayedAlerts.map((alert, idx) => (
                  <InsightSummaryCard
                    key={alert.id || `priority-alert-${idx}`}
                    id={alert.id}
                    title={alert.title}
                    description={alert.description}
                    severity={alert.severity as 'critical' | 'high' | 'medium' | 'low'}
                    confidence={alert.confidence ? alert.confidence * 100 : undefined}
                    badges={[
                      { label: alert.category.replace('_', ' '), variant: 'outline' as const },
                      ...(alert.riskScore ? [{ label: `Risk: ${alert.riskScore}/100`, variant: 'outline' as const }] : [])
                    ]}
                    expanded={expandedSections.has(alert.id)}
                    onToggleExpanded={(expanded) => toggleSection(alert.id)}
                  >
                    {/* Expanded Content */}
                    <div className="space-y-3">
                      {/* Recommended Actions */}
                      {alert.recommendedActions.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium text-muted-foreground mb-1">
                            Immediate Actions:
                          </h5>
                          <ul className="space-y-1">
                            {alert.recommendedActions.map((action, actionIdx) => (
                              <li key={`${alert.id}-action-${actionIdx}`} className="flex items-start space-x-1 text-xs">
                                <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Contact Information */}
                      {alert.contactInformation && (
                        <div>
                          <h5 className="text-xs font-medium text-muted-foreground mb-1">
                            Emergency Contacts:
                          </h5>
                          <div className="space-y-1">
                            {alert.contactInformation.crisisHotline && (
                              <div className="flex items-center space-x-1 text-xs">
                                <Phone className="h-3 w-3 text-red-500" />
                                <span>Crisis: {alert.contactInformation.crisisHotline}</span>
                              </div>
                            )}
                            {alert.contactInformation.emergencyServices && (
                              <div className="flex items-center space-x-1 text-xs">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                <span>Emergency: {alert.contactInformation.emergencyServices}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions slot for Mark as Reviewed */}
                    {onMarkReviewed && (
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            console.log('[SafetyInsightsTab] Alert marked as reviewed:', {
                              alertId: alert.id,
                              severity: alert.severity,
                              timestamp: Date.now()
                            });
                            onMarkReviewed(alert.id);
                          }}
                          className="text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark Reviewed
                        </Button>
                      </div>
                    )}
                  </InsightSummaryCard>
                ))}
              </div>
            </div>
          )}

          {/* Risk Factors & Protective Factors - Expandable */}
          {(riskAssessment.riskFactors?.length > 0 || riskAssessment.protectiveFactors?.length > 0) && (
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('risk-factors')}
                className="w-full justify-between p-3 h-auto"
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Risk & Protective Factors</span>
                  <Badge variant="outline" className="text-xs">
                    {(riskAssessment.riskFactors?.length || 0) + (riskAssessment.protectiveFactors?.length || 0)} factors
                  </Badge>
                </div>
                {expandedSections.has('risk-factors') ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {expandedSections.has('risk-factors') && (
                <div className="p-3 bg-muted/30 rounded-lg space-y-3">
                  {/* Risk Factors */}
                  {riskAssessment.riskFactors?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-2">
                        Risk Factors ({riskAssessment.riskFactors.length})
                      </h4>
                      <div className="space-y-1">
                        {riskAssessment.riskFactors.map((factor, idx) => (
                          <div key={`risk-factor-${idx}`} className="flex items-start space-x-2 text-sm">
                            <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-red-700">{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Protective Factors */}
                  {riskAssessment.protectiveFactors?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-700 mb-2">
                        Protective Factors ({riskAssessment.protectiveFactors.length})
                      </h4>
                      <div className="space-y-1">
                        {riskAssessment.protectiveFactors.map((factor, idx) => (
                          <div key={`protective-factor-${idx}`} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-green-700">{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Other Alerts - Collapsed by Default */}
          {otherAlerts.length > 0 && (
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('other-alerts')}
                className="w-full justify-between p-3 h-auto"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Other Alerts</span>
                  <Badge variant="outline" className="text-xs">
                    {otherAlerts.length}
                  </Badge>
                </div>
                {expandedSections.has('other-alerts') ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {expandedSections.has('other-alerts') && (
                <div className="space-y-2">
                  {otherAlerts.map((alert, idx) => (
                    <div key={alert.id || `other-alert-${idx}`} className="p-3 bg-muted/30 rounded border">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        {onMarkReviewed && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onMarkReviewed(alert.id)}
                            className="h-6 w-6 p-0"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recommendations - Expandable */}
          {recommendations && (
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('recommendations')}
                className="w-full justify-between p-3 h-auto"
              >
                <div className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Recommendations</span>
                  <Badge variant="outline" className="text-xs">
                    {(recommendations.immediate?.length || 0) + 
                     (recommendations.shortTerm?.length || 0) + 
                     (recommendations.longTerm?.length || 0)} items
                  </Badge>
                </div>
                {expandedSections.has('recommendations') ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {expandedSections.has('recommendations') && (
                <RecommendationsSection recommendations={recommendations} />
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Urgent Actions Footer */}
      {urgentResponse && (
        <div className="border-t p-3 bg-red-50">
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-800">Urgent Response Required</p>
            <div className="flex space-x-2">
              {onContactCrisis && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    console.log('[SafetyInsightsTab] Crisis contact initiated:', {
                      timestamp: Date.now()
                    });
                    onContactCrisis();
                  }}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Crisis Team
                </Button>
              )}
              
              {onContactSupervisor && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    console.log('[SafetyInsightsTab] Supervisor contact initiated:', {
                      timestamp: Date.now()
                    });
                    onContactSupervisor();
                  }}
                >
                  <User className="h-3 w-3 mr-1" />
                  Supervisor
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Risk Level Badge Component
function RiskLevelBadge({ risk }: { risk: string }) {
  const getRiskStyling = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={cn("capitalize border text-xs", getRiskStyling(risk))}>
      {risk} Risk
    </Badge>
  );
}


// Recommendations Section Component
function RecommendationsSection({ 
  recommendations 
}: { 
  recommendations: SafetyInsights['recommendations'] 
}) {
  const immediate = recommendations?.immediate || [];
  const shortTerm = recommendations?.shortTerm || [];
  const longTerm = recommendations?.longTerm || [];

  return (
    <div className="p-3 bg-muted/30 rounded-lg space-y-3">
      {immediate.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-700 mb-2">
            Immediate Actions ({immediate.length})
          </h4>
          <ul className="space-y-1">
            {immediate.map((rec, idx) => (
              <li key={`immediate-${idx}`} className="flex items-start space-x-2 text-sm">
                <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-red-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {shortTerm.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-orange-700 mb-2">
            Short-term Actions ({shortTerm.length})
          </h4>
          <ul className="space-y-1">
            {shortTerm.map((rec, idx) => (
              <li key={`shortterm-${idx}`} className="flex items-start space-x-2 text-sm">
                <Clock className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-orange-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {longTerm.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-blue-700 mb-2">
            Long-term Actions ({longTerm.length})
          </h4>
          <ul className="space-y-1">
            {longTerm.map((rec, idx) => (
              <li key={`longterm-${idx}`} className="flex items-start space-x-2 text-sm">
                <ArrowRight className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-blue-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Loading State
function SafetyInsightsLoading({ className }: { className?: string }) {
  return (
    <div className={cn('h-full flex items-center justify-center', className)}>
      <div className="text-center space-y-2">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-muted-foreground">Analyzing safety risks...</p>
      </div>
    </div>
  );
}

// Error State
function SafetyInsightsError({ 
  error, 
  className 
}: { 
  error: Error; 
  className?: string; 
}) {
  return (
    <div className={cn('h-full flex items-center justify-center', className)}>
      <div className="text-center space-y-2">
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
        <p className="text-sm font-medium">Safety Analysis Failed</p>
        <p className="text-xs text-muted-foreground">
          {error.message || 'Failed to analyze safety risks'}
        </p>
      </div>
    </div>
  );
}

// Empty State
function SafetyInsightsEmpty({ className }: { className?: string }) {
  return (
    <div className={cn('h-full flex items-center justify-center', className)}>
      <div className="text-center space-y-2">
        <Shield className="h-8 w-8 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">No safety analysis available</p>
      </div>
    </div>
  );
}

// Performance optimization: Wrap component with React.memo to prevent unnecessary re-renders
const MemoizedSafetyInsightsTab = React.memo(SafetyInsightsTab, (prevProps, nextProps) => {
  // Custom comparison for props to determine if re-render is needed
  const shouldSkipRender = (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.error === nextProps.error &&
    prevProps.data === nextProps.data &&
    prevProps.className === nextProps.className
  );

  console.log('[SafetyInsightsTab] React.memo comparison:', {
    shouldSkipRender,
    dataChanged: prevProps.data !== nextProps.data,
    loadingChanged: prevProps.isLoading !== nextProps.isLoading,
    errorChanged: prevProps.error !== nextProps.error,
    renderCount: performance.now(),
    timestamp: Date.now()
  });

  return shouldSkipRender;
});

MemoizedSafetyInsightsTab.displayName = 'SafetyInsightsTab';

export default MemoizedSafetyInsightsTab;
