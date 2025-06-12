'use client';

/**
 * Safety Insights Panel Component
 * 
 * Displays safety analysis results with prominent high-risk alerts,
 * severity-based styling, and immediate response actions
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  ExternalLink
} from 'lucide-react';
import { SafetyInsights, SafetyAlert } from '@/lib/types/ai-insights';
import { cn } from '@/lib/utils';

interface SafetyInsightsPanelProps {
  insights: SafetyInsights | null;
  isLoading?: boolean;
  error?: Error | null;
  onContactCrisis?: () => void;
  onContactSupervisor?: () => void;
  onMarkReviewed?: (alertId: string) => void;
  className?: string;
}

export function SafetyInsightsPanel({
  insights,
  isLoading = false,
  error = null,
  onContactCrisis,
  onContactSupervisor,
  onMarkReviewed,
  className
}: SafetyInsightsPanelProps) {
  console.log('[SafetyInsightsPanel] Rendering:', {
    hasInsights: !!insights,
    isLoading,
    hasError: !!error,
    alertCount: insights?.alerts?.length || 0,
    riskLevel: insights?.riskAssessment?.overallRisk,
    timestamp: Date.now()
  });

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
  const urgentResponse = alerts.some(alert => alert.urgentResponse);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">Safety Analysis</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {Math.round(confidence * 100)}% confidence
            </Badge>
            <RiskLevelBadge risk={riskAssessment.overallRisk} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Critical Alerts - Prominent Display */}
        {criticalAlerts.length > 0 && (
          <CriticalAlertsSection 
            alerts={criticalAlerts}
            onContactCrisis={onContactCrisis}
            onMarkReviewed={onMarkReviewed}
          />
        )}

        {/* High Priority Alerts */}
        {highAlerts.length > 0 && (
          <HighPriorityAlertsSection 
            alerts={highAlerts}
            onContactSupervisor={onContactSupervisor}
            onMarkReviewed={onMarkReviewed}
          />
        )}

        {/* Risk Assessment Summary */}
        <RiskAssessmentSection riskAssessment={riskAssessment} />

        {/* All Alerts List */}
        {alerts.length > 0 && (
          <AllAlertsSection 
            alerts={alerts}
            onMarkReviewed={onMarkReviewed}
          />
        )}

        {/* Recommendations */}
        {recommendations && (
          <RecommendationsSection recommendations={recommendations} />
        )}

        {/* Action Buttons */}
        {urgentResponse && (
          <UrgentActionButtons 
            onContactCrisis={onContactCrisis}
            onContactSupervisor={onContactSupervisor}
          />
        )}
      </CardContent>
    </Card>
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
    <Badge className={cn("capitalize border", getRiskStyling(risk))}>
      {risk} Risk
    </Badge>
  );
}

// Critical Alerts Section
function CriticalAlertsSection({ 
  alerts, 
  onContactCrisis, 
  onMarkReviewed 
}: {
  alerts: SafetyAlert[];
  onContactCrisis?: () => void;
  onMarkReviewed?: (alertId: string) => void;
}) {
  console.log('[SafetyInsightsPanel] Critical alerts section:', {
    criticalCount: alerts.length
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <h3 className="font-semibold text-red-700">Critical Safety Alerts</h3>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert, idx) => (
          <div 
            key={alert.id || `critical-alert-${idx}`}
            className="p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className="bg-red-100 text-red-800 border-red-300">
                    {alert.category.replace('_', ' ')}
                  </Badge>
                  {alert.riskScore && (
                    <span className="text-sm text-red-600">
                      Risk: {alert.riskScore}/100
                    </span>
                  )}
                </div>
                
                <h4 className="font-medium text-red-900 mb-1">{alert.title}</h4>
                <p className="text-sm text-red-700 mb-3">{alert.description}</p>
                
                {alert.recommendedActions.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-red-800">Immediate Actions:</p>
                    <ul className="text-xs text-red-700 space-y-1">
                      {alert.recommendedActions.map((action, idx) => (
                        <li key={`${alert.id}-action-${idx}`} className="flex items-start space-x-1">
                          <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {onMarkReviewed && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onMarkReviewed(alert.id)}
                  className="ml-3"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Reviewed
                </Button>
              )}
            </div>

            {/* Emergency Contact Information */}
            {alert.contactInformation && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <div className="flex items-center space-x-4 text-sm">
                  {alert.contactInformation.crisisHotline && (
                    <div key={`${alert.id}-crisis-hotline`} className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>Crisis: {alert.contactInformation.crisisHotline}</span>
                    </div>
                  )}
                  
                  {alert.contactInformation.emergencyServices && (
                    <div key={`${alert.id}-emergency-services`} className="flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Emergency: {alert.contactInformation.emergencyServices}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {onContactCrisis && (
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={onContactCrisis}
        >
          <Phone className="h-4 w-4 mr-2" />
          Contact Crisis Team Immediately
        </Button>
      )}
    </div>
  );
}

// High Priority Alerts Section
function HighPriorityAlertsSection({ 
  alerts, 
  onContactSupervisor, 
  onMarkReviewed 
}: {
  alerts: SafetyAlert[];
  onContactSupervisor?: () => void;
  onMarkReviewed?: (alertId: string) => void;
}) {
  console.log('[SafetyInsightsPanel] High priority alerts section:', {
    highCount: alerts.length
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <h3 className="font-semibold text-orange-700">High Priority Alerts</h3>
        </div>
        
        {onContactSupervisor && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onContactSupervisor}
          >
            <User className="h-3 w-3 mr-1" />
            Notify Supervisor
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {alerts.map((alert, idx) => (
          <div 
            key={alert.id || `high-priority-alert-${idx}`}
            className="p-3 bg-orange-50 border border-orange-200 rounded"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                    {alert.category.replace('_', ' ')}
                  </Badge>
                  {alert.riskScore && (
                    <span className="text-xs text-orange-600">
                      Risk: {alert.riskScore}/100
                    </span>
                  )}
                </div>
                
                <h4 className="font-medium text-orange-900 text-sm mb-1">{alert.title}</h4>
                <p className="text-xs text-orange-700">{alert.description}</p>
              </div>
              
              {onMarkReviewed && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onMarkReviewed(alert.id)}
                  className="ml-2 h-8 w-8 p-0"
                >
                  <CheckCircle className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Risk Assessment Section
function RiskAssessmentSection({ 
  riskAssessment 
}: { 
  riskAssessment: SafetyInsights['riskAssessment'] 
}) {
  const { overallRisk, riskScore, riskFactors = [], protectiveFactors = [] } = riskAssessment;

  console.log('[SafetyInsightsPanel] Risk assessment section:', {
    overallRisk,
    riskScore,
    riskFactorCount: riskFactors?.length || 0,
    protectiveFactorCount: protectiveFactors?.length || 0,
    riskAssessmentStructure: riskAssessment // Log full structure for debugging
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Shield className="h-4 w-4 text-blue-500" />
        <h3 className="font-semibold">Risk Assessment</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Risk Level</span>
            <RiskLevelBadge risk={overallRisk} />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Risk Score</span>
            <span className="text-sm font-mono">{riskScore}/100</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-600">Risk Factors</span>
            <Badge variant="outline" className="text-red-600">
              {riskFactors.length}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-600">Protective Factors</span>
            <Badge variant="outline" className="text-green-600">
              {protectiveFactors.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      {riskFactors.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-700 mb-2">Risk Factors</h4>
          <div className="space-y-1">
            {riskFactors.map((factor, idx) => (
              <div key={`risk-factor-${idx}`} className="flex items-start space-x-2 text-sm">
                <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-red-700">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Protective Factors */}
      {protectiveFactors.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-green-700 mb-2">Protective Factors</h4>
          <div className="space-y-1">
            {protectiveFactors.map((factor, idx) => (
              <div key={`protective-factor-${idx}`} className="flex items-start space-x-2 text-sm">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-green-700">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// All Alerts Section
function AllAlertsSection({ 
  alerts, 
  onMarkReviewed 
}: {
  alerts: SafetyAlert[];
  onMarkReviewed?: (alertId: string) => void;
}) {
  console.log('[SafetyInsightsPanel] All alerts section:', {
    totalCount: alerts.length
  });

  // Group alerts by severity
  const alertsBySeverity = alerts.reduce((acc, alert) => {
    acc[alert.severity] = acc[alert.severity] || [];
    acc[alert.severity].push(alert);
    return acc;
  }, {} as Record<string, SafetyAlert[]>);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">All Safety Alerts ({alerts.length})</h3>
      
      <div className="space-y-3">
        {Object.entries(alertsBySeverity).map(([severity, severityAlerts]) => (
          <div key={severity} className="space-y-2">
            <h4 className="text-sm font-medium capitalize text-gray-700">
              {severity} ({severityAlerts.length})
            </h4>
            
            <div className="space-y-1">
              {severityAlerts.map((alert, idx) => (
                <div 
                  key={alert.id || `${severity}-alert-${idx}`}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {alert.category.replace('_', ' ')}
                    </Badge>
                    <span>{alert.title}</span>
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
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Recommendations Section
function RecommendationsSection({ 
  recommendations 
}: { 
  recommendations: SafetyInsights['recommendations'] 
}) {
  // Add defensive programming to handle undefined/missing properties
  const immediate = recommendations?.immediate || [];
  const shortTerm = recommendations?.shortTerm || [];
  const longTerm = recommendations?.longTerm || [];

  console.log('[SafetyInsightsPanel] Recommendations section:', {
    immediateCount: immediate.length,
    shortTermCount: shortTerm.length,
    longTermCount: longTerm.length
  });

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Recommendations</h3>
      
      <div className="space-y-4">
        {immediate.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-700 mb-2">Immediate Actions</h4>
            <ul className="space-y-1">
              {immediate.map((rec, idx) => (
                <li key={`immediate-${idx}`} className="flex items-start space-x-2 text-sm">
                  <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {shortTerm.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-orange-700 mb-2">Short-term Actions</h4>
            <ul className="space-y-1">
              {shortTerm.map((rec, idx) => (
                <li key={`shortterm-${idx}`} className="flex items-start space-x-2 text-sm">
                  <Clock className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {longTerm.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-blue-700 mb-2">Long-term Actions</h4>
            <ul className="space-y-1">
              {longTerm.map((rec, idx) => (
                <li key={`longterm-${idx}`} className="flex items-start space-x-2 text-sm">
                  <ArrowRight className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Urgent Action Buttons
function UrgentActionButtons({ 
  onContactCrisis, 
  onContactSupervisor 
}: {
  onContactCrisis?: () => void;
  onContactSupervisor?: () => void;
}) {
  console.log('[SafetyInsightsPanel] Urgent action buttons');

  return (
    <div className="flex space-x-2 pt-4 border-t">
      {onContactCrisis && (
        <Button 
          variant="destructive" 
          className="flex-1"
          onClick={onContactCrisis}
        >
          <Phone className="h-4 w-4 mr-2" />
          Crisis Team
        </Button>
      )}
      
      {onContactSupervisor && (
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={onContactSupervisor}
        >
          <User className="h-4 w-4 mr-2" />
          Supervisor
        </Button>
      )}
    </div>
  );
}

// Loading State
function SafetyInsightsLoading({ className }: { className?: string }) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <CardTitle className="text-lg">Safety Analysis</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <XCircle className="h-5 w-5 text-red-500" />
          <CardTitle className="text-lg">Safety Analysis Failed</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-red-600">
          {error.message || 'Failed to analyze safety risks'}
        </div>
      </CardContent>
    </Card>
  );
}

// Empty State
function SafetyInsightsEmpty({ className }: { className?: string }) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-gray-400" />
          <CardTitle className="text-lg text-gray-600">Safety Analysis</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500">
          No safety analysis available
        </div>
      </CardContent>
    </Card>
  );
}

export default SafetyInsightsPanel;
