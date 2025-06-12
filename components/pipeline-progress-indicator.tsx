'use client';

/**
 * Pipeline Progress Indicator Component
 * 
 * Shows execution status and progress for individual AI pipelines
 * with visual feedback and timing information
 */

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Clock, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { 
  PipelineState, 
  PipelineExecutionMetadata 
} from '@/lib/types/ai-insights';
import { cn } from '@/lib/utils';

interface PipelineProgressIndicatorProps {
  pipeline: 'safety' | 'billing' | 'progress';
  state: PipelineState;
  onRetry?: () => void;
  className?: string;
  showTiming?: boolean;
  showProgress?: boolean;
}

export function PipelineProgressIndicator({
  pipeline,
  state,
  onRetry,
  className,
  showTiming = true,
  showProgress = true
}: PipelineProgressIndicatorProps) {
  console.log('[PipelineProgressIndicator] Rendering:', {
    pipeline,
    status: state.status,
    progress: state.progress,
    executionTime: state.endTime && state.startTime ? state.endTime - state.startTime : null,
    timestamp: Date.now()
  });

  const getStatusIcon = () => {
    switch (state.status) {
      case 'loading':
      case 'retrying':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'idle':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (state.status) {
      case 'loading':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700">Loading</Badge>;
      case 'retrying':
        return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">Retrying</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-50 text-green-700">Complete</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      case 'idle':
        return <Badge variant="outline">Waiting</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getProgressColor = () => {
    switch (state.status) {
      case 'loading':
      case 'retrying':
        return 'bg-blue-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getExecutionTime = (): number | null => {
    if (state.startTime && state.endTime) {
      return state.endTime - state.startTime;
    }
    if (state.startTime && (state.status === 'loading' || state.status === 'retrying')) {
      return Date.now() - state.startTime;
    }
    return null;
  };

  const executionTime = getExecutionTime();
  const pipelineDisplayName = pipeline.charAt(0).toUpperCase() + pipeline.slice(1);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header with pipeline name, status icon, and badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-medium text-sm">{pipelineDisplayName}</span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Progress bar (shown during loading/retrying) */}
      {showProgress && (state.status === 'loading' || state.status === 'retrying') && (
        <div className="space-y-1">
          <Progress 
            value={state.progress || 0} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{state.progress || 0}% complete</span>
            {executionTime && (
              <span>{formatDuration(executionTime)} elapsed</span>
            )}
          </div>
        </div>
      )}

      {/* Execution timing information */}
      {showTiming && executionTime && state.status !== 'idle' && (
        <div className="text-xs text-muted-foreground">
          {state.status === 'success' ? 'Completed in' : 
           state.status === 'error' ? 'Failed after' : 
           'Running for'} {formatDuration(executionTime)}
          
          {/* Cache hit indicator */}
          {state.metadata?.cacheHit && state.status === 'success' && (
            <span className="ml-2 text-green-600">(cached)</span>
          )}
        </div>
      )}

      {/* Metadata information */}
      {state.metadata && state.status === 'success' && (
        <div className="text-xs text-muted-foreground space-y-1">
          {state.metadata.modelUsed && (
            <div>Model: {state.metadata.modelUsed}</div>
          )}
          
          {state.metadata.tokenUsage && (
            <div>
              Tokens: {state.metadata.tokenUsage.total} 
              ({state.metadata.tokenUsage.input} input, {state.metadata.tokenUsage.output} output)
            </div>
          )}
          
          <div>Confidence: {Math.round((state.data?.confidence || 0) * 100)}%</div>
        </div>
      )}

      {/* Error information and retry button */}
      {state.status === 'error' && (
        <div className="space-y-2">
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {state.error?.message || 'Pipeline execution failed'}
          </div>
          
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="w-full"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Retry {pipelineDisplayName}
            </Button>
          )}
        </div>
      )}

      {/* Success summary */}
      {state.status === 'success' && state.data && (
        <div className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200">
          <PipelineSuccessSummary pipeline={pipeline} data={state.data} />
        </div>
      )}
    </div>
  );
}

// Pipeline-specific success summaries
function PipelineSuccessSummary({ 
  pipeline, 
  data 
}: { 
  pipeline: string; 
  data: any;
}) {
  console.log('[PipelineProgressIndicator] Success summary:', {
    pipeline,
    dataKeys: data ? Object.keys(data) : [],
    hasAlerts: !!data?.alerts,
    hasGoals: !!data?.goalProgress
  });

  switch (pipeline) {
    case 'safety':
      const alertCount = data?.alerts?.length || 0;
      const riskLevel = data?.riskAssessment?.overallRisk || 'low';
      return (
        <div className="flex items-center justify-between">
          <span>Risk level: {riskLevel}</span>
          {alertCount > 0 && (
            <span>{alertCount} alert{alertCount !== 1 ? 's' : ''}</span>
          )}
        </div>
      );

    case 'billing':
      const cptCount = data?.cptCodes?.length || 0;
      const icdCount = data?.icd10Codes?.length || 0;
      return (
        <div className="flex items-center justify-between">
          <span>{cptCount} CPT, {icdCount} ICD-10 codes</span>
          {data?.sessionType && (
            <span>{data.sessionType.detected}</span>
          )}
        </div>
      );

    case 'progress':
      const goalCount = data?.goalProgress?.length || 0;
      const effectiveness = data?.overallTreatmentEffectiveness?.rating || 0;
      return (
        <div className="flex items-center justify-between">
          <span>{goalCount} goal{goalCount !== 1 ? 's' : ''} tracked</span>
          <span>Effectiveness: {effectiveness}/10</span>
        </div>
      );

    default:
      return <span>Analysis completed successfully</span>;
  }
}

// Compact version for inline use
export function CompactPipelineIndicator({
  pipeline,
  state,
  className
}: {
  pipeline: 'safety' | 'billing' | 'progress';
  state: PipelineState;
  className?: string;
}) {
  const getStatusIcon = () => {
    switch (state.status) {
      case 'loading':
      case 'retrying':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  console.log('[PipelineProgressIndicator] Compact render:', {
    pipeline,
    status: state.status,
    progress: state.progress
  });

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {getStatusIcon()}
      <span className="text-sm capitalize">{pipeline}</span>
      {state.status === 'loading' && (
        <span className="text-xs text-muted-foreground">
          {state.progress || 0}%
        </span>
      )}
    </div>
  );
}

export default PipelineProgressIndicator;
