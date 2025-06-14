'use client';

/**
 * Progress Insights Panel Component
 * 
 * Displays treatment progress analysis with visual indicators,
 * improvement metrics, trend analysis, and suggested next actions
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  BarChart3
} from 'lucide-react';
import { ProgressInsights, GoalProgress } from '@/lib/types/ai-insights';
import { cn } from '@/lib/utils';

interface ProgressInsightsPanelProps {
  insights: ProgressInsights | null;
  isLoading?: boolean;
  error?: Error | null;
  onUpdateGoal?: (goalId: string, updates: Partial<GoalProgress>) => void;
  onAddGoal?: () => void;
  onViewDetails?: (goalId: string) => void;
  className?: string;
}

export function ProgressInsightsPanel({
  insights,
  isLoading = false,
  error = null,
  onUpdateGoal,
  onAddGoal,
  onViewDetails,
  className
}: ProgressInsightsPanelProps) {
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

  console.log('[ProgressInsightsPanel] Rendering:', {
    hasInsights: !!insights,
    isLoading,
    hasError: !!error,
    goalCount: insights?.goalProgress?.length || 0,
    overallRating: overallTreatmentEffectiveness?.rating,
    trends: overallTreatmentEffectiveness?.trends,
    timestamp: Date.now()
  });

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

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Progress Analysis</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {Math.round(confidence * 100)}% confidence
            </Badge>
            <EffectivenessBadge rating={overallTreatmentEffectiveness.rating} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Treatment Effectiveness */}
        <TreatmentEffectivenessSection effectiveness={overallTreatmentEffectiveness} />

        {/* Session Quality Metrics */}
        {sessionQuality && (
          <SessionQualitySection quality={sessionQuality} />
        )}

        {/* Goal Progress Overview */}
        {goalProgress.length > 0 && (
          <GoalProgressOverviewSection 
            goals={goalProgress}
            onUpdateGoal={onUpdateGoal}
            onViewDetails={onViewDetails}
          />
        )}

        {/* Individual Goal Details */}
        {goalProgress.length > 0 && (
          <IndividualGoalsSection 
            goals={goalProgress}
            onUpdateGoal={onUpdateGoal}
            onViewDetails={onViewDetails}
          />
        )}

        {/* Recommendations */}
        {recommendations && (
          <RecommendationsSection 
            recommendations={recommendations}
            onAddGoal={onAddGoal}
          />
        )}

        {/* Progress Summary */}
        <ProgressSummarySection 
          insights={insights}
          onAddGoal={onAddGoal}
        />
      </CardContent>
    </Card>
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
    <Badge className={cn("border", getEffectivenessColor(rating))}>
      {rating}/10 Effectiveness
    </Badge>
  );
}

// Treatment Effectiveness Section
function TreatmentEffectivenessSection({ 
  effectiveness 
}: { 
  effectiveness: ProgressInsights['overallTreatmentEffectiveness'] 
}) {
  const { rating, trends, keyIndicators } = effectiveness;

  console.log('[ProgressInsightsPanel] Treatment effectiveness section:', {
    rating,
    trends,
    indicatorCount: keyIndicators.length
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-blue-500" />;
      case 'mixed':
        return <BarChart3 className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
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
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Star className="h-4 w-4 text-yellow-500" />
        <h3 className="font-semibold">Overall Treatment Effectiveness</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Effectiveness Rating</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">{rating}</span>
              <span className="text-sm text-gray-500">/10</span>
            </div>
          </div>
          
          <Progress value={rating * 10} className="h-2" />
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Trend</span>
            <div className={cn("flex items-center space-x-1 px-2 py-1 rounded border text-xs", getTrendColor(trends))}>
              {getTrendIcon(trends)}
              <span className="capitalize">{trends}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Key Indicators</h4>
          <div className="space-y-1">
            {keyIndicators.map((indicator, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-sm">
                <CheckCircle className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{indicator}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Session Quality Section
function SessionQualitySection({ 
  quality 
}: { 
  quality: ProgressInsights['sessionQuality'] 
}) {
  if (!quality) return null;

  const { engagement, therapeuticRapport, progressTowardGoals } = quality;

  console.log('[ProgressInsightsPanel] Session quality section:', {
    engagement,
    therapeuticRapport,
    progressTowardGoals
  });

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4 text-purple-500" />
        <h3 className="font-semibold">Session Quality Metrics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center space-y-2">
          <div className={cn("text-2xl font-bold", getQualityColor(engagement))}>
            {engagement}
          </div>
          <div className="text-xs text-gray-500">Patient Engagement</div>
          <Progress value={engagement * 10} className="h-1" />
        </div>

        <div className="text-center space-y-2">
          <div className={cn("text-2xl font-bold", getQualityColor(therapeuticRapport))}>
            {therapeuticRapport}
          </div>
          <div className="text-xs text-gray-500">Therapeutic Rapport</div>
          <Progress value={therapeuticRapport * 10} className="h-1" />
        </div>

        <div className="text-center space-y-2">
          <div className={cn("text-2xl font-bold", getQualityColor(progressTowardGoals))}>
            {progressTowardGoals}
          </div>
          <div className="text-xs text-gray-500">Goal Progress</div>
          <Progress value={progressTowardGoals * 10} className="h-1" />
        </div>
      </div>
    </div>
  );
}

// Goal Progress Overview Section
function GoalProgressOverviewSection({ 
  goals, 
  onUpdateGoal, 
  onViewDetails 
}: {
  goals: GoalProgress[];
  onUpdateGoal?: (goalId: string, updates: Partial<GoalProgress>) => void;
  onViewDetails?: (goalId: string) => void;
}) {
  const statusCounts = goals.reduce((acc, goal) => {
    const status = goal.currentStatus || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, goal) => sum + (goal.progressPercentage || 0), 0) / goals.length)
    : 0;

  console.log('[ProgressInsightsPanel] Goal progress overview:', {
    totalGoals: goals.length,
    statusCounts,
    averageProgress
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-green-500" />
          <h3 className="font-semibold">Treatment Goals Overview</h3>
        </div>
        <Badge variant="outline">{goals.length} goals</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{statusCounts.achieved || 0}</div>
          <div className="text-xs text-gray-500">Achieved</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{statusCounts.in_progress || 0}</div>
          <div className="text-xs text-gray-500">In Progress</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{statusCounts.partially_met || 0}</div>
          <div className="text-xs text-gray-500">Partial</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{averageProgress}%</div>
          <div className="text-xs text-gray-500">Avg Progress</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Overall Goal Progress</span>
          <span>{averageProgress}%</span>
        </div>
        <Progress value={averageProgress} className="h-2" />
      </div>
    </div>
  );
}

// Individual Goals Section
function IndividualGoalsSection({ 
  goals, 
  onUpdateGoal, 
  onViewDetails 
}: {
  goals: GoalProgress[];
  onUpdateGoal?: (goalId: string, updates: Partial<GoalProgress>) => void;
  onViewDetails?: (goalId: string) => void;
}) {
  console.log('[ProgressInsightsPanel] Individual goals section:', {
    goalCount: goals.length
  });

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

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'achieved':
        return 'bg-green-50 border-green-200';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200';
      case 'partially_met':
        return 'bg-yellow-50 border-yellow-200';
      case 'modified':
        return 'bg-purple-50 border-purple-200';
      case 'not_started':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Individual Goal Progress</h3>

      <div className="space-y-3">
        {goals.map((goal) => (
          <div 
            key={goal.goalId}
            className={cn("p-4 rounded-lg border", getStatusColor(goal.currentStatus))}
          >
            <div className="space-y-3">
              {/* Goal Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(goal.currentStatus)}
                    <Badge variant="outline" className="text-xs capitalize">
                      {goal.currentStatus?.replace('_', ' ') || 'Unknown Status'}
                    </Badge>
                    <span className="text-sm font-medium">
                      {goal.progressPercentage || 0}% complete
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">
                    {goal.goalDescription}
                  </h4>
                  
                  <Progress value={goal.progressPercentage || 0} className="h-2 mb-2" />
                </div>

                {onViewDetails && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewDetails(goal.goalId)}
                    className="ml-3"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Evidence */}
              {goal.evidence && goal.evidence.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-green-700 mb-1">Evidence of Progress</h5>
                  <div className="space-y-1">
                    {goal.evidence.map((evidence, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm">
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
                  <h5 className="text-sm font-medium text-red-700 mb-1">Barriers to Progress</h5>
                  <div className="space-y-1">
                    {goal.barriers.map((barrier, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm">
                        <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-red-700">{barrier}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {goal.nextSteps && goal.nextSteps.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-blue-700 mb-1">Next Steps</h5>
                  <div className="space-y-1">
                    {goal.nextSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm">
                        <ArrowRight className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-blue-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Recommendations Section
function RecommendationsSection({ 
  recommendations, 
  onAddGoal 
}: { 
  recommendations: ProgressInsights['recommendations'];
  onAddGoal?: () => void;
}) {
  const { treatmentAdjustments = [], newGoals = [], interventions = [] } = recommendations || {};

  console.log('[ProgressInsightsPanel] Recommendations section:', {
    adjustmentCount: treatmentAdjustments.length,
    newGoalCount: newGoals.length,
    interventionCount: interventions.length
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Recommendations</h3>
        {onAddGoal && newGoals.length > 0 && (
          <Button variant="outline" size="sm" onClick={onAddGoal}>
            <Plus className="h-3 w-3 mr-1" />
            Add Goals
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Treatment Adjustments */}
        {treatmentAdjustments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-700 flex items-center space-x-1">
              <Edit className="h-3 w-3" />
              <span>Treatment Adjustments</span>
            </h4>
            <div className="space-y-1">
              {treatmentAdjustments.map((adjustment, idx) => (
                <div key={idx} className="text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
                  {typeof adjustment === 'string' ? adjustment : (adjustment as any).target || (adjustment as any).rationale || 'Treatment adjustment'}
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
              <span>Suggested New Goals</span>
            </h4>
            <div className="space-y-1">
              {newGoals.map((goal, idx) => (
                <div key={idx} className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
                  {typeof goal === 'string' ? goal : (goal as any).target || (goal as any).rationale || 'New goal'}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interventions */}
        {interventions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-purple-700 flex items-center space-x-1">
              <Star className="h-3 w-3" />
              <span>Recommended Interventions</span>
            </h4>
            <div className="space-y-1">
              {interventions.map((intervention, idx) => (
                <div key={idx} className="text-xs text-purple-700 bg-purple-50 p-2 rounded border border-purple-200">
                  {typeof intervention === 'string' ? intervention : (intervention as any).target || (intervention as any).rationale || 'Intervention'}
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

  console.log('[ProgressInsightsPanel] Progress summary section:', {
    totalGoals,
    achievedGoals,
    inProgressGoals,
    averageProgress
  });

  return (
    <div className="space-y-3 pt-4 border-t">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Progress Summary</h3>
        {onAddGoal && (
          <Button variant="outline" size="sm" onClick={onAddGoal}>
            <Plus className="h-3 w-3 mr-1" />
            Add Goal
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalGoals}</div>
          <div className="text-xs text-gray-500">Total Goals</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{achievedGoals}</div>
          <div className="text-xs text-gray-500">Achieved</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{inProgressGoals}</div>
          <div className="text-xs text-gray-500">Active</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{averageProgress}%</div>
          <div className="text-xs text-gray-500">Avg Progress</div>
        </div>
      </div>
    </div>
  );
}

// Loading State
function ProgressInsightsLoading({ className }: { className?: string }) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-lg">Progress Analysis</CardTitle>
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
function ProgressInsightsError({ 
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
          <CardTitle className="text-lg">Progress Analysis Failed</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-red-600">
          {error.message || 'Failed to analyze treatment progress'}
        </div>
      </CardContent>
    </Card>
  );
}

// Empty State
function ProgressInsightsEmpty({ className }: { className?: string }) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-gray-400" />
          <CardTitle className="text-lg text-gray-600">Progress Analysis</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500">
          No progress analysis available
        </div>
      </CardContent>
    </Card>
  );
}

export default ProgressInsightsPanel;
