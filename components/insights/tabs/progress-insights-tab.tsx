'use client';

/**
 * Progress Insights Tab Component
 * 
 * Progressive disclosure version of progress insights for the new V2 layout.
 * Displays treatment progress analysis with visual indicators,
 * improvement metrics, trend analysis, and progressive disclosure patterns.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown,
  Minus,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Star,
  ArrowRight,
  Plus,
  Edit,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';
import { ProgressInsights, GoalProgress } from '@/lib/types/ai-insights';
import { cn } from '@/lib/utils';
import { InsightSummaryCard } from '../insight-summary-card';

interface ProgressInsightsTabProps {
  data: ProgressInsights | null;
  isLoading?: boolean;
  error?: Error | null;
  onUpdateGoal?: (goalId: string, updates: Partial<GoalProgress>) => void;
  onAddGoal?: () => void;
  onViewDetails?: (goalId: string) => void;
  className?: string;
}

export function ProgressInsightsTab({
  data: insights,
  isLoading = false,
  error = null,
  onUpdateGoal,
  onAddGoal,
  onViewDetails,
  className
}: ProgressInsightsTabProps) {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set());
  const [showAllGoals, setShowAllGoals] = React.useState(false);

  // Helper function to determine goal severity based on status and progress
  const getGoalSeverity = React.useCallback((goal: GoalProgress): 'critical' | 'high' | 'medium' | 'low' | 'info' => {
    const progress = goal.progressPercentage || 0;
    const status = goal.currentStatus;
    
    switch (status) {
      case 'achieved':
        return 'info'; // Positive progress
      case 'in_progress':
        if (progress >= 70) return 'info';
        if (progress >= 40) return 'medium';
        return 'low';
      case 'partially_met':
        return 'medium';
      case 'not_started':
        return 'low';
      default:
        return progress >= 70 ? 'info' : progress >= 40 ? 'medium' : 'low';
    }
  }, []);

  // Handle API data structure mismatch - convert string to expected object structure
  const overallTreatmentEffectiveness = React.useMemo(() => {
    const rawEffectiveness = insights?.overallTreatmentEffectiveness;
    
    if (!rawEffectiveness) {
      return {
        rating: 5,
        trends: 'stable' as const,
        keyIndicators: []
      };
    }

    // If it's already an object with the expected structure, use it
    if (typeof rawEffectiveness === 'object' && 'rating' in rawEffectiveness) {
      return rawEffectiveness;
    }

    // If it's a string, convert to object structure
    if (typeof rawEffectiveness === 'string') {
      const effectivenessMap: Record<string, { rating: number; trends: 'improving' | 'stable' | 'declining' | 'mixed' }> = {
        'highly_effective': { rating: 9, trends: 'improving' },
        'moderately_effective': { rating: 7, trends: 'stable' },
        'somewhat_effective': { rating: 5, trends: 'mixed' },
        'minimally_effective': { rating: 3, trends: 'declining' },
        'ineffective': { rating: 1, trends: 'declining' }
      };

      const mapped = effectivenessMap[rawEffectiveness] || { rating: 5, trends: 'stable' };
      return {
        rating: mapped.rating,
        trends: mapped.trends,
        keyIndicators: ['Treatment plan being followed', 'Patient engagement noted']
      };
    }

    // Fallback for any other case
    return {
      rating: 5,
      trends: 'stable' as const,
      keyIndicators: []
    };
  }, [insights?.overallTreatmentEffectiveness]);

  console.log('[ProgressInsightsTab] Rendering:', {
    hasInsights: !!insights,
    isLoading,
    hasError: !!error,
    goalCount: insights?.goalProgress?.length || 0,
    overallRating: overallTreatmentEffectiveness?.rating,
    trends: overallTreatmentEffectiveness?.trends,
    expandedSections: Array.from(expandedSections),
    showAllGoals,
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
      
      console.log('[ProgressInsightsTab] Section toggled:', {
        sectionId,
        expanded: newSet.has(sectionId),
        totalExpanded: newSet.size,
        timestamp: Date.now()
      });
      
      return newSet;
    });
  }, []);

  // Handle show all goals toggle
  const toggleShowAllGoals = React.useCallback(() => {
    setShowAllGoals(prev => {
      console.log('[ProgressInsightsTab] Show all goals toggled:', {
        wasShowing: prev,
        willShow: !prev,
        timestamp: Date.now()
      });
      return !prev;
    });
  }, []);

  // Component lifecycle logging
  React.useEffect(() => {
    console.log('[ProgressInsightsTab] Tab mounted:', {
      hasData: !!insights,
      isLoading,
      hasError: !!error,
      timestamp: Date.now()
    });

    return () => {
      console.log('[ProgressInsightsTab] Tab unmounted:', {
        timestamp: Date.now()
      });
    };
  }, [insights, isLoading, error]);

  if (isLoading) {
    return <ProgressInsightsLoading className={className} />;
  }

  if (error) {
    return <ProgressInsightsError error={error} className={className} />;
  }

  if (!insights) {
    return <ProgressInsightsEmpty className={className} />;
  }

  const { goalProgress, recommendations, sessionQuality, confidence } = insights;

  // Progressive disclosure: Show top 3 active goals by default
  const activeGoals = goalProgress.filter(goal => 
    ['in_progress', 'partially_met'].includes(goal.currentStatus || '')
  );
  const achievedGoals = goalProgress.filter(goal => goal.currentStatus === 'achieved');
  const otherGoals = goalProgress.filter(goal => 
    !['in_progress', 'partially_met', 'achieved'].includes(goal.currentStatus || '')
  );

  const displayedActiveGoals = showAllGoals ? activeGoals : activeGoals.slice(0, 3);
  const hiddenActiveGoalsCount = activeGoals.length - displayedActiveGoals.length;

  return (
    <div className={cn('h-full flex flex-col', className)}>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Overall Treatment Effectiveness */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <h3 className="font-medium">Treatment Effectiveness</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {Math.round(confidence * 100)}% confidence
                </Badge>
                <EffectivenessBadge rating={overallTreatmentEffectiveness.rating} />
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Effectiveness Rating</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-lg font-bold text-blue-600">
                        {overallTreatmentEffectiveness.rating}
                      </span>
                      <span className="text-sm text-muted-foreground">/10</span>
                    </div>
                  </div>
                  <Progress value={overallTreatmentEffectiveness.rating * 10} className="h-2" />
                </div>
                
                <div>
                  <span className="text-sm font-medium">Trend</span>
                  <div className="mt-1">
                    <TrendBadge trend={overallTreatmentEffectiveness.trends} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Session Quality Metrics */}
          {sessionQuality && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-purple-500" />
                <h3 className="font-medium">Session Quality</h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center space-y-1">
                  <div className="text-lg font-bold text-green-600">
                    {sessionQuality.engagement}
                  </div>
                  <div className="text-xs text-muted-foreground">Engagement</div>
                  <Progress value={sessionQuality.engagement * 10} className="h-1" />
                </div>

                <div className="text-center space-y-1">
                  <div className="text-lg font-bold text-blue-600">
                    {sessionQuality.therapeuticRapport}
                  </div>
                  <div className="text-xs text-muted-foreground">Rapport</div>
                  <Progress value={sessionQuality.therapeuticRapport * 10} className="h-1" />
                </div>

                <div className="text-center space-y-1">
                  <div className="text-lg font-bold text-purple-600">
                    {sessionQuality.progressTowardGoals}
                  </div>
                  <div className="text-xs text-muted-foreground">Goal Progress</div>
                  <Progress value={sessionQuality.progressTowardGoals * 10} className="h-1" />
                </div>
              </div>
            </div>
          )}

          {/* Active Goals - Progressive Disclosure */}
          {activeGoals.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <h3 className="font-medium">Active Goals</h3>
                  <Badge variant="default" className="text-xs">
                    {activeGoals.length}
                  </Badge>
                </div>

                {hiddenActiveGoalsCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleShowAllGoals}
                    className="text-xs"
                  >
                    {showAllGoals ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Show fewer
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        View all {activeGoals.length} goals
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {displayedActiveGoals.map((goal) => (
                  <InsightSummaryCard
                    key={goal.goalId}
                    id={goal.goalId}
                    title={goal.goalDescription}
                    description={`${goal.currentStatus?.replace('_', ' ') || 'Unknown Status'} • ${goal.progressPercentage || 0}% complete`}
                    severity={getGoalSeverity(goal)}
                    confidence={goal.progressPercentage || 0}
                    badges={[
                      { 
                        label: goal.currentStatus?.replace('_', ' ') || 'Unknown Status', 
                        variant: 'outline' as const,
                        className: 'capitalize'
                      }
                    ]}
                    expanded={expandedSections.has(goal.goalId)}
                    onToggleExpanded={(expanded) => {
                      console.log('[ProgressInsightsTab] Goal card expansion toggled:', {
                        goalId: goal.goalId,
                        expanded,
                        timestamp: Date.now()
                      });
                      toggleSection(goal.goalId);
                    }}
                  >
                    <GoalExpandedContent 
                      goal={goal} 
                      onUpdateGoal={onUpdateGoal}
                      onViewDetails={onViewDetails}
                    />
                  </InsightSummaryCard>
                ))}
              </div>
            </div>
          )}

          {/* Achieved Goals - Collapsible */}
          {achievedGoals.length > 0 && (
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('achieved-goals')}
                className="w-full justify-between p-3 h-auto"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Achieved Goals</span>
                  <Badge variant="outline" className="text-xs">
                    {achievedGoals.length}
                  </Badge>
                </div>
                {expandedSections.has('achieved-goals') ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {expandedSections.has('achieved-goals') && (
                <div className="space-y-2">
                  {achievedGoals.map((goal) => (
                    <InsightSummaryCard
                      key={goal.goalId}
                      id={goal.goalId}
                      title={goal.goalDescription}
                      description={`${goal.currentStatus?.replace('_', ' ') || 'Unknown Status'} • ${goal.progressPercentage || 0}% complete`}
                      severity={getGoalSeverity(goal)}
                      confidence={goal.progressPercentage || 0}
                      badges={[
                        { 
                          label: goal.currentStatus?.replace('_', ' ') || 'Unknown Status', 
                          variant: 'outline' as const,
                          className: 'capitalize'
                        }
                      ]}
                      expanded={expandedSections.has(goal.goalId)}
                      onToggleExpanded={(expanded) => {
                        console.log('[ProgressInsightsTab] Achieved goal card expansion toggled:', {
                          goalId: goal.goalId,
                          expanded,
                          timestamp: Date.now()
                        });
                        toggleSection(goal.goalId);
                      }}
                    >
                      <GoalExpandedContent 
                        goal={goal} 
                        onUpdateGoal={onUpdateGoal}
                        onViewDetails={onViewDetails}
                      />
                    </InsightSummaryCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Treatment Effectiveness Details - Expandable */}
          {overallTreatmentEffectiveness.keyIndicators?.length > 0 && (
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('effectiveness-details')}
                className="w-full justify-between p-3 h-auto"
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Key Indicators</span>
                  <Badge variant="outline" className="text-xs">
                    {overallTreatmentEffectiveness.keyIndicators.length}
                  </Badge>
                </div>
                {expandedSections.has('effectiveness-details') ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {expandedSections.has('effectiveness-details') && (
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  {overallTreatmentEffectiveness.keyIndicators.map((indicator, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{indicator}</span>
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
                    {(recommendations.treatmentAdjustments?.length || 0) + 
                     (recommendations.newGoals?.length || 0) + 
                     (recommendations.interventions?.length || 0)} items
                  </Badge>
                </div>
                {expandedSections.has('recommendations') ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {expandedSections.has('recommendations') && (
                <RecommendationsSection 
                  recommendations={recommendations} 
                  onAddGoal={onAddGoal}
                />
              )}
            </div>
          )}

          {/* Other Goals - Collapsible */}
          {otherGoals.length > 0 && (
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('other-goals')}
                className="w-full justify-between p-3 h-auto"
              >
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Other Goals</span>
                  <Badge variant="outline" className="text-xs">
                    {otherGoals.length}
                  </Badge>
                </div>
                {expandedSections.has('other-goals') ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {expandedSections.has('other-goals') && (
                <div className="space-y-2">
                  {otherGoals.map((goal) => (
                    <InsightSummaryCard
                      key={goal.goalId}
                      id={goal.goalId}
                      title={goal.goalDescription}
                      description={`${goal.currentStatus?.replace('_', ' ') || 'Unknown Status'} • ${goal.progressPercentage || 0}% complete`}
                      severity={getGoalSeverity(goal)}
                      confidence={goal.progressPercentage || 0}
                      badges={[
                        { 
                          label: goal.currentStatus?.replace('_', ' ') || 'Unknown Status', 
                          variant: 'outline' as const,
                          className: 'capitalize'
                        }
                      ]}
                      expanded={expandedSections.has(goal.goalId)}
                      onToggleExpanded={(expanded) => {
                        console.log('[ProgressInsightsTab] Other goal card expansion toggled:', {
                          goalId: goal.goalId,
                          expanded,
                          timestamp: Date.now()
                        });
                        toggleSection(goal.goalId);
                      }}
                    >
                      <GoalExpandedContent 
                        goal={goal} 
                        onUpdateGoal={onUpdateGoal}
                        onViewDetails={onViewDetails}
                      />
                    </InsightSummaryCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Progress Summary */}
          <ProgressSummarySection 
            insights={insights}
            onAddGoal={onAddGoal}
          />
        </div>
      </ScrollArea>
    </div>
  );
}

// Effectiveness Badge Component
function EffectivenessBadge({ rating }: { rating: number }) {
  const getEffectivenessColor = (rating: number) => {
    if (rating >= 8) return 'bg-green-100 text-green-800 border-green-200';
    if (rating >= 6) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (rating >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Badge className={cn("border text-xs", getEffectivenessColor(rating))}>
      {rating}/10
    </Badge>
  );
}

// Goal Expanded Content Component
function GoalExpandedContent({
  goal,
  onUpdateGoal,
  onViewDetails
}: {
  goal: GoalProgress;
  onUpdateGoal?: (goalId: string, updates: Partial<GoalProgress>) => void;
  onViewDetails?: (goalId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Progress Bar with detailed breakdown */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground">Progress</span>
          <span className="text-xs font-medium">{goal.progressPercentage || 0}%</span>
        </div>
        <Progress value={goal.progressPercentage || 0} className="h-2" />
      </div>

      {/* Evidence */}
      {goal.evidence && goal.evidence.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground mb-1">
            Evidence ({goal.evidence.length}):
          </h5>
          <div className="space-y-1">
            {goal.evidence.map((evidence, idx) => (
              <div key={idx} className="flex items-start space-x-1 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-green-700">{evidence}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barriers */}
      {goal.barriers && goal.barriers.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground mb-1">
            Barriers ({goal.barriers.length}):
          </h5>
          <div className="space-y-1">
            {goal.barriers.map((barrier, idx) => (
              <div key={idx} className="flex items-start space-x-1 text-xs">
                <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-red-700">{barrier}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-2 border-t">
        {onViewDetails && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              console.log('[ProgressInsightsTab] Goal details viewed via expanded view:', {
                goalId: goal.goalId,
                timestamp: Date.now()
              });
              onViewDetails(goal.goalId);
            }}
            className="text-xs"
          >
            <ArrowRight className="h-3 w-3 mr-1" />
            View Details
          </Button>
        )}
        
        {onUpdateGoal && (
          <Button 
            size="sm"
            onClick={() => {
              console.log('[ProgressInsightsTab] Goal update requested via expanded view:', {
                goalId: goal.goalId,
                timestamp: Date.now()
              });
              onUpdateGoal(goal.goalId, {});
            }}
            className="text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Update Goal
          </Button>
        )}
      </div>
    </div>
  );
}

// Trend Badge Component
function TrendBadge({ trend }: { trend: string }) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      case 'stable':
        return <Minus className="h-3 w-3 text-blue-500" />;
      case 'mixed':
        return <BarChart3 className="h-3 w-3 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'declining':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'stable':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'mixed':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={cn("flex items-center space-x-1 px-2 py-1 rounded border text-xs", getTrendColor(trend))}>
      {getTrendIcon(trend)}
      <span className="capitalize">{trend}</span>
    </div>
  );
}

// Goal Card Component
function GoalCard({
  goal,
  onUpdateGoal,
  onViewDetails,
  variant
}: {
  goal: GoalProgress;
  onUpdateGoal?: (goalId: string, updates: Partial<GoalProgress>) => void;
  onViewDetails?: (goalId: string) => void;
  variant: 'active' | 'achieved' | 'other';
}) {
  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'achieved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'partially_met':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'modified':
        return <Edit className="h-4 w-4 text-purple-500" />;
      case 'not_started':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCardStyle = (variant: string, status: string | undefined) => {
    switch (status) {
      case 'achieved':
        return 'bg-green-50 border-green-200 shadow-sm';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200 shadow-sm';
      case 'partially_met':
        return 'bg-yellow-50 border-yellow-200 shadow-sm';
      default:
        return 'bg-gray-50 border-gray-200 shadow-sm';
    }
  };

  return (
    <div className={cn("rounded-lg border transition-all", getCardStyle(variant, goal.currentStatus))}>
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2 flex-1">
            {getStatusIcon(goal.currentStatus)}
            <Badge variant="outline" className="text-xs capitalize">
              {goal.currentStatus?.replace('_', ' ') || 'Unknown Status'}
            </Badge>
            <span className="text-sm font-medium">
              {goal.progressPercentage || 0}% complete
            </span>
          </div>
          
          {onViewDetails && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                console.log('[ProgressInsightsTab] Goal details viewed:', {
                  goalId: goal.goalId,
                  timestamp: Date.now()
                });
                onViewDetails(goal.goalId);
              }}
              className="h-6 w-6 p-0"
            >
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <h4 className="font-medium text-sm mb-2">{goal.goalDescription}</h4>
        <Progress value={goal.progressPercentage || 0} className="h-2 mb-2" />

        {/* Evidence */}
        {goal.evidence && goal.evidence.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium text-green-700 mb-1">Evidence:</p>
            <div className="space-y-1">
              {goal.evidence.slice(0, 2).map((evidence, idx) => (
                <div key={idx} className="flex items-start space-x-1 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-green-700">{evidence}</span>
                </div>
              ))}
              {goal.evidence.length > 2 && (
                <p className="text-xs text-green-600">+{goal.evidence.length - 2} more</p>
              )}
            </div>
          </div>
        )}

        {/* Barriers */}
        {goal.barriers && goal.barriers.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium text-red-700 mb-1">Barriers:</p>
            <div className="space-y-1">
              {goal.barriers.slice(0, 2).map((barrier, idx) => (
                <div key={idx} className="flex items-start space-x-1 text-xs">
                  <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-red-700">{barrier}</span>
                </div>
              ))}
              {goal.barriers.length > 2 && (
                <p className="text-xs text-red-600">+{goal.barriers.length - 2} more</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Recommendations Section Component
function RecommendationsSection({ 
  recommendations, 
  onAddGoal 
}: { 
  recommendations: ProgressInsights['recommendations'];
  onAddGoal?: () => void;
}) {
  const { treatmentAdjustments = [], newGoals = [], interventions = [] } = recommendations || {};

  return (
    <div className="p-3 bg-muted/30 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Treatment Adjustments */}
        {treatmentAdjustments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-700 flex items-center space-x-1">
              <Edit className="h-3 w-3" />
              <span>Adjustments ({treatmentAdjustments.length})</span>
            </h4>
            <div className="space-y-1">
              {treatmentAdjustments.map((adjustment, idx) => (
                <div key={idx} className="text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
                  {typeof adjustment === 'string' ? adjustment : (adjustment as any).target || 'Treatment adjustment'}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Goals */}
        {newGoals.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-700 flex items-center space-x-1">
              <Target className="h-3 w-3" />
              <span>New Goals ({newGoals.length})</span>
            </h4>
            <div className="space-y-1">
              {newGoals.map((goal, idx) => (
                <div key={idx} className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
                  {typeof goal === 'string' ? goal : (goal as any).target || 'New goal'}
                </div>
              ))}
            </div>
            {onAddGoal && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  console.log('[ProgressInsightsTab] Add goals clicked:', {
                    timestamp: Date.now()
                  });
                  onAddGoal();
                }}
                className="w-full text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Goals
              </Button>
            )}
          </div>
        )}

        {/* Interventions */}
        {interventions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-purple-700 flex items-center space-x-1">
              <Star className="h-3 w-3" />
              <span>Interventions ({interventions.length})</span>
            </h4>
            <div className="space-y-1">
              {interventions.map((intervention, idx) => (
                <div key={idx} className="text-xs text-purple-700 bg-purple-50 p-2 rounded border border-purple-200">
                  {typeof intervention === 'string' ? intervention : (intervention as any).target || 'Intervention'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Progress Summary Section
function ProgressSummarySection({
  insights,
  onAddGoal
}: {
  insights: ProgressInsights;
  onAddGoal?: () => void;
}) {
  const totalGoals = insights.goalProgress.length;
  const achievedGoals = insights.goalProgress.filter(g => g.currentStatus === 'achieved').length;
  const inProgressGoals = insights.goalProgress.filter(g => g.currentStatus === 'in_progress').length;
  const averageProgress = totalGoals > 0 
    ? Math.round(insights.goalProgress.reduce((sum, goal) => sum + (goal.progressPercentage || 0), 0) / totalGoals)
    : 0;

  return (
    <div className="space-y-3 pt-4 border-t">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Summary</h3>
        {onAddGoal && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              console.log('[ProgressInsightsTab] Add goal clicked:', {
                timestamp: Date.now()
              });
              onAddGoal();
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Goal
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalGoals}</div>
          <div className="text-xs text-muted-foreground">Total Goals</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{achievedGoals}</div>
          <div className="text-xs text-muted-foreground">Achieved</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{inProgressGoals}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{averageProgress}%</div>
          <div className="text-xs text-muted-foreground">Avg Progress</div>
        </div>
      </div>
    </div>
  );
}

// Loading State
function ProgressInsightsLoading({ className }: { className?: string }) {
  return (
    <div className={cn('h-full flex items-center justify-center', className)}>
      <div className="text-center space-y-2">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-muted-foreground">Analyzing progress...</p>
      </div>
    </div>
  );
}

// Error State
function ProgressInsightsError({ 
  error, 
  className 
}: { 
  error: Error; 
  className?: string; 
}) {
  return (
    <div className={cn('h-full flex items-center justify-center', className)}>
      <div className="text-center space-y-2">
        <TrendingUp className="h-8 w-8 text-destructive mx-auto" />
        <p className="text-sm font-medium">Progress Analysis Failed</p>
        <p className="text-xs text-muted-foreground">
          {error.message || 'Failed to analyze treatment progress'}
        </p>
      </div>
    </div>
  );
}

// Empty State
function ProgressInsightsEmpty({ className }: { className?: string }) {
  return (
    <div className={cn('h-full flex items-center justify-center', className)}>
      <div className="text-center space-y-2">
        <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">No progress analysis available</p>
      </div>
    </div>
  );
}

// Performance optimization: Wrap component with React.memo to prevent unnecessary re-renders
const MemoizedProgressInsightsTab = React.memo(ProgressInsightsTab, (prevProps, nextProps) => {
  // Custom comparison for props to determine if re-render is needed
  const shouldSkipRender = (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.error === nextProps.error &&
    prevProps.data === nextProps.data &&
    prevProps.className === nextProps.className
  );

  console.log('[ProgressInsightsTab] React.memo comparison:', {
    shouldSkipRender,
    dataChanged: prevProps.data !== nextProps.data,
    loadingChanged: prevProps.isLoading !== nextProps.isLoading,
    errorChanged: prevProps.error !== nextProps.error,
    renderCount: performance.now(),
    timestamp: Date.now()
  });

  return shouldSkipRender;
});

MemoizedProgressInsightsTab.displayName = 'ProgressInsightsTab';

export default MemoizedProgressInsightsTab;
