/**
 * Pipeline Status Type Definitions
 * 
 * Comprehensive status tracking and coordination types for AI pipeline execution
 */

// Core pipeline status enumeration
export enum PipelineStatusCode {
  IDLE = 'idle',
  INITIALIZING = 'initializing', 
  LOADING = 'loading',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled',
  RETRYING = 'retrying',
  PARTIAL_SUCCESS = 'partial_success'
}

// Pipeline phases for detailed progress tracking
export enum PipelinePhase {
  VALIDATION = 'validation',
  PREPROCESSING = 'preprocessing',
  AI_ANALYSIS = 'ai_analysis',
  POSTPROCESSING = 'postprocessing',
  CACHING = 'caching',
  COMPLETE = 'complete'
}

// Pipeline execution context
export interface PipelineExecutionContext {
  sessionId: string;
  patientId: string;
  userId: string;
  organizationId?: string;
  transcriptLength: number;
  startTime: number;
  estimatedDuration?: number;
  priority: number;
  retryAttempt: number;
  maxRetries: number;
}

// Detailed pipeline status with phase tracking
export interface DetailedPipelineStatus {
  code: PipelineStatusCode;
  phase: PipelinePhase;
  progress: number; // 0-100
  message: string;
  details?: string;
  timestamp: number;
  context: PipelineExecutionContext;
  
  // Performance metrics
  performance: {
    cpuUsage?: number;
    memoryUsage?: number;
    networkLatency?: number;
    cacheHitRate?: number;
  };
  
  // Error information
  error?: {
    code: string;
    message: string;
    stack?: string;
    retryable: boolean;
    context?: Record<string, any>;
  };
  
  // Success metrics
  result?: {
    confidence: number;
    dataPoints: number;
    processingTime: number;
    cacheUsed: boolean;
  };
}

// Pipeline coordination status
export interface PipelineCoordinationStatus {
  overallStatus: PipelineStatusCode;
  overallProgress: number; // 0-100
  estimatedCompletion?: number; // timestamp
  
  pipelines: {
    safety: DetailedPipelineStatus;
    billing: DetailedPipelineStatus;
    progress: DetailedPipelineStatus;
  };
  
  coordination: {
    startTime: number;
    parallelExecution: boolean;
    completedCount: number;
    errorCount: number;
    retryCount: number;
  };
  
  performance: {
    totalExecutionTime?: number;
    averageResponseTime: number;
    peakMemoryUsage?: number;
    cacheEfficiency: number; // 0-1
  };
}

// Pipeline transition events
export interface PipelineTransition {
  pipelineType: 'safety' | 'billing' | 'progress';
  from: PipelineStatusCode;
  to: PipelineStatusCode;
  timestamp: number;
  duration: number; // time in previous state
  trigger: 'user' | 'system' | 'timeout' | 'error' | 'retry';
  context?: Record<string, any>;
}

// Pipeline health check result
export interface PipelineHealthStatus {
  healthy: boolean;
  lastCheck: number;
  
  individual: {
    safety: {
      healthy: boolean;
      latencyMs: number;
      errorRate: number; // 0-1
      availability: number; // 0-1
      lastError?: string;
    };
    billing: {
      healthy: boolean;
      latencyMs: number;
      errorRate: number;
      availability: number;
      lastError?: string;
    };
    progress: {
      healthy: boolean;
      latencyMs: number;
      errorRate: number;
      availability: number;
      lastError?: string;
    };
  };
  
  overall: {
    averageLatency: number;
    overallErrorRate: number;
    systemLoad: number; // 0-1
    recommendedActions: string[];
  };
}

// Pipeline retry configuration and status
export interface PipelineRetryStatus {
  enabled: boolean;
  currentAttempt: number;
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  jitter: boolean;
  
  history: {
    attempt: number;
    timestamp: number;
    error: string;
    delay: number;
  }[];
  
  nextRetryAt?: number; // timestamp
}

// Real-time status update interface
export interface PipelineStatusUpdate {
  sessionId: string;
  timestamp: number;
  
  // What changed
  changes: {
    pipeline?: 'safety' | 'billing' | 'progress';
    statusCode?: PipelineStatusCode;
    phase?: PipelinePhase;
    progress?: number;
    error?: any;
    result?: any;
  };
  
  // Current complete status
  currentStatus: PipelineCoordinationStatus;
  
  // Transition information
  transition?: PipelineTransition;
}

// Status subscription interface
export interface PipelineStatusSubscription {
  sessionId: string;
  callback: (update: PipelineStatusUpdate) => void;
  filters?: {
    pipelines?: ('safety' | 'billing' | 'progress')[];
    statusCodes?: PipelineStatusCode[];
    phases?: PipelinePhase[];
    errorOnly?: boolean;
    successOnly?: boolean;
  };
  
  // Subscription metadata
  subscribedAt: number;
  lastUpdate?: number;
  updateCount: number;
}

// Pipeline analytics and monitoring
export interface PipelineAnalytics {
  sessionId: string;
  timeRange: {
    start: number;
    end: number;
  };
  
  execution: {
    totalRuns: number;
    successRate: number; // 0-1
    averageExecutionTime: number;
    p95ExecutionTime: number;
    p99ExecutionTime: number;
  };
  
  byPipeline: {
    safety: PipelinePerformanceMetrics;
    billing: PipelinePerformanceMetrics;
    progress: PipelinePerformanceMetrics;
  };
  
  errors: {
    total: number;
    byType: Record<string, number>;
    byPipeline: Record<string, number>;
    recentErrors: {
      timestamp: number;
      pipeline: string;
      error: string;
      context?: Record<string, any>;
    }[];
  };
  
  cache: {
    hitRate: number; // 0-1
    byPipeline: Record<string, number>;
    totalSize: number;
    evictionCount: number;
  };
}

export interface PipelinePerformanceMetrics {
  executionCount: number;
  successRate: number;
  averageLatency: number;
  medianLatency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number;
  timeoutRate: number;
  retryRate: number;
  cacheHitRate: number;
  
  trends: {
    latencyTrend: 'improving' | 'stable' | 'degrading';
    errorTrend: 'improving' | 'stable' | 'degrading';
    throughputTrend: 'improving' | 'stable' | 'degrading';
  };
}

// Utility functions for status management
export class PipelineStatusManager {
  private subscriptions = new Map<string, PipelineStatusSubscription[]>();
  private statusHistory = new Map<string, PipelineStatusUpdate[]>();
  
  // Subscribe to status updates
  subscribe(subscription: PipelineStatusSubscription): () => void {
    const sessionSubs = this.subscriptions.get(subscription.sessionId) || [];
    sessionSubs.push(subscription);
    this.subscriptions.set(subscription.sessionId, sessionSubs);
    
    console.log('[PipelineStatus] New subscription:', {
      sessionId: subscription.sessionId,
      filters: subscription.filters,
      totalSubscriptions: sessionSubs.length
    });
    
    // Return unsubscribe function
    return () => {
      const updated = sessionSubs.filter(s => s !== subscription);
      if (updated.length === 0) {
        this.subscriptions.delete(subscription.sessionId);
      } else {
        this.subscriptions.set(subscription.sessionId, updated);
      }
      
      console.log('[PipelineStatus] Unsubscribed:', {
        sessionId: subscription.sessionId,
        remainingSubscriptions: updated.length
      });
    };
  }
  
  // Publish status update
  publish(update: PipelineStatusUpdate): void {
    console.log('[PipelineStatus] Publishing update:', {
      sessionId: update.sessionId,
      pipeline: update.changes.pipeline,
      statusCode: update.changes.statusCode,
      phase: update.changes.phase,
      progress: update.changes.progress
    });
    
    // Store in history
    const history = this.statusHistory.get(update.sessionId) || [];
    history.push(update);
    // Keep only last 100 updates per session
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    this.statusHistory.set(update.sessionId, history);
    
    // Notify subscribers
    const subscribers = this.subscriptions.get(update.sessionId) || [];
    let notifiedCount = 0;
    
    for (const subscription of subscribers) {
      if (this.matchesFilter(update, subscription.filters)) {
        try {
          subscription.callback(update);
          subscription.lastUpdate = Date.now();
          subscription.updateCount++;
          notifiedCount++;
        } catch (error) {
          console.error('[PipelineStatus] Subscription callback error:', error);
        }
      }
    }
    
    console.log('[PipelineStatus] Update published:', {
      sessionId: update.sessionId,
      totalSubscribers: subscribers.length,
      notifiedSubscribers: notifiedCount
    });
  }
  
  // Get status history
  getHistory(sessionId: string, limit?: number): PipelineStatusUpdate[] {
    const history = this.statusHistory.get(sessionId) || [];
    return limit ? history.slice(-limit) : history;
  }
  
  // Clear status history
  clearHistory(sessionId: string): void {
    this.statusHistory.delete(sessionId);
    console.log('[PipelineStatus] History cleared for session:', sessionId);
  }
  
  // Check if update matches subscription filters
  private matchesFilter(
    update: PipelineStatusUpdate, 
    filters?: PipelineStatusSubscription['filters']
  ): boolean {
    if (!filters) return true;
    
    // Pipeline filter
    if (filters.pipelines && update.changes.pipeline) {
      if (!filters.pipelines.includes(update.changes.pipeline)) {
        return false;
      }
    }
    
    // Status code filter
    if (filters.statusCodes && update.changes.statusCode) {
      if (!filters.statusCodes.includes(update.changes.statusCode)) {
        return false;
      }
    }
    
    // Phase filter
    if (filters.phases && update.changes.phase) {
      if (!filters.phases.includes(update.changes.phase)) {
        return false;
      }
    }
    
    // Error/success only filters
    if (filters.errorOnly && !update.changes.error) {
      return false;
    }
    
    if (filters.successOnly && update.changes.statusCode !== PipelineStatusCode.SUCCESS) {
      return false;
    }
    
    return true;
  }
}

// Export singleton instance
export const pipelineStatusManager = new PipelineStatusManager();

// Helper functions
export function createInitialPipelineStatus(
  context: PipelineExecutionContext
): DetailedPipelineStatus {
  return {
    code: PipelineStatusCode.IDLE,
    phase: PipelinePhase.VALIDATION,
    progress: 0,
    message: 'Pipeline initialized',
    timestamp: Date.now(),
    context,
    performance: {},
  };
}

export function createInitialCoordinationStatus(
  context: PipelineExecutionContext
): PipelineCoordinationStatus {
  const initialStatus = createInitialPipelineStatus(context);
  
  return {
    overallStatus: PipelineStatusCode.IDLE,
    overallProgress: 0,
    pipelines: {
      safety: { ...initialStatus },
      billing: { ...initialStatus },
      progress: { ...initialStatus },
    },
    coordination: {
      startTime: Date.now(),
      parallelExecution: true,
      completedCount: 0,
      errorCount: 0,
      retryCount: 0,
    },
    performance: {
      averageResponseTime: 0,
      cacheEfficiency: 0,
    },
  };
}

export function calculateOverallProgress(status: PipelineCoordinationStatus): number {
  const { safety, billing, progress } = status.pipelines;
  return Math.round((safety.progress + billing.progress + progress.progress) / 3);
}

export function isTerminalStatus(code: PipelineStatusCode): boolean {
  return [
    PipelineStatusCode.SUCCESS,
    PipelineStatusCode.ERROR,
    PipelineStatusCode.TIMEOUT,
    PipelineStatusCode.CANCELLED,
    PipelineStatusCode.PARTIAL_SUCCESS
  ].includes(code);
}

export function isErrorStatus(code: PipelineStatusCode): boolean {
  return [
    PipelineStatusCode.ERROR,
    PipelineStatusCode.TIMEOUT,
    PipelineStatusCode.CANCELLED
  ].includes(code);
}

export function getStatusDisplayInfo(code: PipelineStatusCode): {
  label: string;
  color: string;
  icon: string;
} {
  switch (code) {
    case PipelineStatusCode.IDLE:
      return { label: 'Idle', color: 'gray', icon: 'clock' };
    case PipelineStatusCode.INITIALIZING:
      return { label: 'Initializing', color: 'blue', icon: 'settings' };
    case PipelineStatusCode.LOADING:
      return { label: 'Loading', color: 'blue', icon: 'loader' };
    case PipelineStatusCode.PROCESSING:
      return { label: 'Processing', color: 'blue', icon: 'activity' };
    case PipelineStatusCode.SUCCESS:
      return { label: 'Complete', color: 'green', icon: 'check-circle' };
    case PipelineStatusCode.ERROR:
      return { label: 'Error', color: 'red', icon: 'alert-circle' };
    case PipelineStatusCode.TIMEOUT:
      return { label: 'Timeout', color: 'orange', icon: 'clock' };
    case PipelineStatusCode.CANCELLED:
      return { label: 'Cancelled', color: 'gray', icon: 'x-circle' };
    case PipelineStatusCode.RETRYING:
      return { label: 'Retrying', color: 'yellow', icon: 'refresh-cw' };
    case PipelineStatusCode.PARTIAL_SUCCESS:
      return { label: 'Partial Success', color: 'yellow', icon: 'alert-triangle' };
    default:
      return { label: 'Unknown', color: 'gray', icon: 'help-circle' };
  }
}
