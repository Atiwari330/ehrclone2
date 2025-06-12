'use client';

/**
 * AI Insights Loader Component
 * 
 * Shows skeleton loading states for each AI insight type with smooth transitions
 * when results populate. Provides immediate feedback during pipeline execution.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { 
  AIInsightsState, 
  PipelineState, 
  SafetyInsights, 
  BillingInsights, 
  ProgressInsights 
} from '@/lib/types/ai-insights';
import { cn } from '@/lib/utils';

interface AIInsightsLoaderProps {
  insights: AIInsightsState;
  onRetryPipeline?: (pipeline: 'safety' | 'billing' | 'progress') => void;
  className?: string;
}

export function AIInsightsLoader({ insights, onRetryPipeline, className }: AIInsightsLoaderProps) {
  console.log('[AIInsightsLoader] Rendering with insights:', {
    overallProgress: insights.overallProgress,
    safetyStatus: insights.safety.status,
    billingStatus: insights.billing.status,
    progressStatus: insights.progress.status,
    timestamp: Date.now()
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Overall Progress Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">AI Analysis Progress</CardTitle>
            <Badge variant={insights.overallProgress === 100 ? "default" : "secondary"}>
              {insights.overallProgress}% Complete
            </Badge>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${insights.overallProgress}%` }}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Individual Pipeline Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <SafetyInsightCard 
          state={insights.safety} 
          onRetry={() => onRetryPipeline?.('safety')}
        />
        <BillingInsightCard 
          state={insights.billing} 
          onRetry={() => onRetryPipeline?.('billing')}
        />
        <ProgressInsightCard 
          state={insights.progress} 
          onRetry={() => onRetryPipeline?.('progress')}
        />
      </div>
    </div>
  );
}

// Safety Insights Card Component
function SafetyInsightCard({ 
  state, 
  onRetry 
}: { 
  state: PipelineState<SafetyInsights>; 
  onRetry: () => void;
}) {
  const getStatusIcon = () => {
    switch (state.status) {
      case 'loading':
      case 'retrying':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (state.status) {
      case 'loading':
      case 'retrying':
        return 'border-blue-200';
      case 'success':
        return 'border-green-200';
      case 'error':
        return 'border-red-200';
      default:
        return 'border-gray-200';
    }
  };

  console.log('[AIInsightsLoader] Safety card render:', {
    status: state.status,
    progress: state.progress,
    hasData: !!state.data,
    hasError: !!state.error
  });

  return (
    <Card className={cn("transition-all duration-300", getStatusColor())}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-base">Safety Analysis</CardTitle>
          </div>
          {getStatusIcon()}
        </div>
        
        {/* Progress Bar */}
        {(state.status === 'loading' || state.status === 'retrying') && (
          <div className="w-full bg-secondary rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${state.progress || 0}%` }}
            />
          </div>
        )}
      </CardHeader>

      <CardContent>
        {state.status === 'loading' || state.status === 'retrying' ? (
          <SafetySkeletonContent />
        ) : state.status === 'success' && state.data ? (
          <SafetySuccessContent data={state.data} />
        ) : state.status === 'error' ? (
          <SafetyErrorContent error={state.error} onRetry={onRetry} />
        ) : (
          <SafetyIdleContent />
        )}
      </CardContent>
    </Card>
  );
}

// Billing Insights Card Component
function BillingInsightCard({ 
  state, 
  onRetry 
}: { 
  state: PipelineState<BillingInsights>; 
  onRetry: () => void;
}) {
  const getStatusIcon = () => {
    switch (state.status) {
      case 'loading':
      case 'retrying':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (state.status) {
      case 'loading':
      case 'retrying':
        return 'border-blue-200';
      case 'success':
        return 'border-green-200';
      case 'error':
        return 'border-red-200';
      default:
        return 'border-gray-200';
    }
  };

  console.log('[AIInsightsLoader] Billing card render:', {
    status: state.status,
    progress: state.progress,
    hasData: !!state.data,
    hasError: !!state.error
  });

  return (
    <Card className={cn("transition-all duration-300", getStatusColor())}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <CardTitle className="text-base">Billing Analysis</CardTitle>
          </div>
          {getStatusIcon()}
        </div>
        
        {/* Progress Bar */}
        {(state.status === 'loading' || state.status === 'retrying') && (
          <div className="w-full bg-secondary rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${state.progress || 0}%` }}
            />
          </div>
        )}
      </CardHeader>

      <CardContent>
        {state.status === 'loading' || state.status === 'retrying' ? (
          <BillingSkeletonContent />
        ) : state.status === 'success' && state.data ? (
          <BillingSuccessContent data={state.data} />
        ) : state.status === 'error' ? (
          <BillingErrorContent error={state.error} onRetry={onRetry} />
        ) : (
          <BillingIdleContent />
        )}
      </CardContent>
    </Card>
  );
}

// Progress Insights Card Component
function ProgressInsightCard({ 
  state, 
  onRetry 
}: { 
  state: PipelineState<ProgressInsights>; 
  onRetry: () => void;
}) {
  const getStatusIcon = () => {
    switch (state.status) {
      case 'loading':
      case 'retrying':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (state.status) {
      case 'loading':
      case 'retrying':
        return 'border-blue-200';
      case 'success':
        return 'border-green-200';
      case 'error':
        return 'border-red-200';
      default:
        return 'border-gray-200';
    }
  };

  console.log('[AIInsightsLoader] Progress card render:', {
    status: state.status,
    progress: state.progress,
    hasData: !!state.data,
    hasError: !!state.error
  });

  return (
    <Card className={cn("transition-all duration-300", getStatusColor())}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-base">Progress Analysis</CardTitle>
          </div>
          {getStatusIcon()}
        </div>
        
        {/* Progress Bar */}
        {(state.status === 'loading' || state.status === 'retrying') && (
          <div className="w-full bg-secondary rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${state.progress || 0}%` }}
            />
          </div>
        )}
      </CardHeader>

      <CardContent>
        {state.status === 'loading' || state.status === 'retrying' ? (
          <ProgressSkeletonContent />
        ) : state.status === 'success' && state.data ? (
          <ProgressSuccessContent data={state.data} />
        ) : state.status === 'error' ? (
          <ProgressErrorContent error={state.error} onRetry={onRetry} />
        ) : (
          <ProgressIdleContent />
        )}
      </CardContent>
    </Card>
  );
}

// Skeleton Content Components
function SafetySkeletonContent() {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

function BillingSkeletonContent() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

function ProgressSkeletonContent() {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-2 w-16" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
      </div>
    </div>
  );
}

// Success Content Components
function SafetySuccessContent({ data }: { data: SafetyInsights }) {
  const alertCount = data.alerts?.length || 0;
  const riskLevel = data.riskAssessment?.overallRisk || 'low';
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  console.log('[AIInsightsLoader] Safety success content:', {
    alertCount,
    riskLevel,
    confidence: data.confidence
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Risk Level:</span>
        <Badge className={cn("capitalize", getRiskColor(riskLevel))}>
          {riskLevel}
        </Badge>
      </div>
      
      {alertCount > 0 && (
        <div className="text-sm text-muted-foreground">
          {alertCount} alert{alertCount !== 1 ? 's' : ''} detected
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        Confidence: {Math.round((data.confidence || 0) * 100)}%
      </div>
    </div>
  );
}

function BillingSuccessContent({ data }: { data: BillingInsights }) {
  const cptCount = data.cptCodes?.length || 0;
  const icdCount = data.icd10Codes?.length || 0;
  
  console.log('[AIInsightsLoader] Billing success content:', {
    cptCount,
    icdCount,
    confidence: data.confidence
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-medium">{cptCount}</span>
          <div className="text-xs text-muted-foreground">CPT Codes</div>
        </div>
        <div>
          <span className="font-medium">{icdCount}</span>
          <div className="text-xs text-muted-foreground">ICD-10 Codes</div>
        </div>
      </div>
      
      {data.sessionType && (
        <div className="text-sm">
          <div className="font-medium">{data.sessionType.detected}</div>
          <div className="text-xs text-muted-foreground">
            {data.sessionType.duration} minutes
          </div>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        Confidence: {Math.round((data.confidence || 0) * 100)}%
      </div>
    </div>
  );
}

function ProgressSuccessContent({ data }: { data: ProgressInsights }) {
  const goalCount = data.goalProgress?.length || 0;
  const rating = data.overallTreatmentEffectiveness?.rating || 0;
  
  console.log('[AIInsightsLoader] Progress success content:', {
    goalCount,
    rating,
    confidence: data.confidence
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Goals:</span>
        <Badge variant="outline">{goalCount}</Badge>
      </div>
      
      <div className="text-sm">
        <div className="flex items-center space-x-2">
          <span>Effectiveness:</span>
          <span className="font-medium">{rating}/10</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {data.overallTreatmentEffectiveness?.trends || 'No trend data'}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Confidence: {Math.round((data.confidence || 0) * 100)}%
      </div>
    </div>
  );
}

// Error Content Components
function SafetyErrorContent({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  console.log('[AIInsightsLoader] Safety error content:', {
    error: error?.message
  });

  return (
    <div className="space-y-3">
      <div className="text-sm text-red-600">
        {error?.message || 'Analysis failed'}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRetry}
        className="w-full"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Retry
      </Button>
    </div>
  );
}

function BillingErrorContent({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  console.log('[AIInsightsLoader] Billing error content:', {
    error: error?.message
  });

  return (
    <div className="space-y-3">
      <div className="text-sm text-red-600">
        {error?.message || 'Analysis failed'}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRetry}
        className="w-full"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Retry
      </Button>
    </div>
  );
}

function ProgressErrorContent({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  console.log('[AIInsightsLoader] Progress error content:', {
    error: error?.message
  });

  return (
    <div className="space-y-3">
      <div className="text-sm text-red-600">
        {error?.message || 'Analysis failed'}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRetry}
        className="w-full"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Retry
      </Button>
    </div>
  );
}

// Idle Content Components
function SafetyIdleContent() {
  return (
    <div className="text-sm text-muted-foreground">
      Waiting to start safety analysis...
    </div>
  );
}

function BillingIdleContent() {
  return (
    <div className="text-sm text-muted-foreground">
      Waiting to start billing analysis...
    </div>
  );
}

function ProgressIdleContent() {
  return (
    <div className="text-sm text-muted-foreground">
      Waiting to start progress analysis...
    </div>
  );
}

// Export the main component
export default AIInsightsLoader;
