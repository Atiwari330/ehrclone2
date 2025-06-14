# Feature Flag Implementation Strategy

**Document Version**: 1.0  
**Created**: December 12, 2025  
**Epic**: 1.4 - Create Feature Flag Implementation Strategy  
**Purpose**: Define safe rollout and rollback strategy for transcript review refactor

## Overview

This document outlines the feature flag strategy for safely migrating users from the current three-column transcript review layout to the new FAANG-style two-pane interface. The strategy prioritizes safety, gradual rollout, and immediate rollback capabilities.

## Feature Flag Architecture

### 1. Primary Feature Flag Structure

```typescript
interface TranscriptReviewFlags {
  // Main layout toggle
  newTranscriptLayout: boolean;           // Master switch for new layout
  
  // Progressive rollout flags
  progressiveDisclosure: boolean;         // Enhanced progressive disclosure
  mobileBottomSheet: boolean;            // Mobile-specific enhancements
  advancedKeyboardNav: boolean;          // Power user keyboard shortcuts
  enhancedAnimations: boolean;           // FAANG-style animations
  
  // Performance flags
  virtualScrollingV2: boolean;           // Enhanced virtual scrolling
  smartActionOptimization: boolean;      // Optimized smart actions
  
  // A/B testing flags
  splitPaneDefaultSizes: '60-40' | '70-30' | '50-50';  // Panel size variants
  defaultActiveTab: 'safety' | 'billing' | 'progress'; // Default tab
  highlightMode: 'summary' | 'detailed' | 'off';      // Default highlight mode
}
```

### 2. Implementation Layers

#### Environment-Based Configuration
```typescript
// Environment variable configuration
interface EnvironmentFlags {
  // Development environment (full access)
  NEXT_PUBLIC_TRANSCRIPT_V2_ENABLED: 'true' | 'false';
  NEXT_PUBLIC_TRANSCRIPT_V2_PERCENTAGE: '0-100';        // Percentage rollout
  NEXT_PUBLIC_TRANSCRIPT_V2_USER_WHITELIST: string;     // Comma-separated emails
  NEXT_PUBLIC_TRANSCRIPT_V2_FORCE_FLAG: string;         // Override query param
  
  // Feature-specific toggles
  NEXT_PUBLIC_PROGRESSIVE_DISCLOSURE: 'true' | 'false';
  NEXT_PUBLIC_MOBILE_ENHANCEMENTS: 'true' | 'false';
  NEXT_PUBLIC_KEYBOARD_SHORTCUTS: 'true' | 'false';
}

// .env.local example
NEXT_PUBLIC_TRANSCRIPT_V2_ENABLED=true
NEXT_PUBLIC_TRANSCRIPT_V2_PERCENTAGE=10
NEXT_PUBLIC_TRANSCRIPT_V2_USER_WHITELIST=admin@company.com,beta@company.com
NEXT_PUBLIC_TRANSCRIPT_V2_FORCE_FLAG=newLayout
```

#### Database-Driven Configuration
```typescript
// Dynamic feature flag storage
interface FeatureFlagRecord {
  id: string;
  flagName: string;
  enabled: boolean;
  percentage: number;                     // 0-100 for gradual rollout
  userWhitelist: string[];               // Specific users always included
  userBlacklist: string[];               // Specific users always excluded
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;                     // Admin who created flag
  description: string;
}

// Feature flag service
export class FeatureFlagService {
  async getFlag(flagName: string, userId?: string): Promise<boolean> {
    // Check environment override first
    // Check user whitelist/blacklist
    // Apply percentage rollout
    // Log flag evaluation
  }
  
  async updateFlag(flagName: string, updates: Partial<FeatureFlagRecord>): Promise<void> {
    // Admin-only flag updates
    // Audit logging
    // Real-time flag propagation
  }
}
```

#### User Preference Override
```typescript
// User-level opt-in/opt-out
interface UserTranscriptPreferences {
  userId: string;
  optIntoNewLayout: boolean | null;       // null = follow flag, true/false = override
  feedbackProvided: boolean;
  lastLayoutVersion: 'v1' | 'v2';
  migrationDate?: Date;
}

// User preference hook
export function useTranscriptLayoutPreference(): {
  hasOptedIn: boolean | null;
  optIn: () => void;
  optOut: () => void;
  resetToDefault: () => void;
} {
  // localStorage + database sync
  // Preference persistence
  // Analytics tracking
}
```

## Routing Strategy

### 1. Page Component Decision Logic

```typescript
// Main routing component
export default function TranscriptReviewPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const { data: session } = useSession();
  
  // Feature flag evaluation
  const flags = useFeatureFlags();
  const userPrefs = useTranscriptLayoutPreference();
  const shouldUseNewLayout = useMemo(() => {
    return evaluateLayoutFlag(flags, session?.user, userPrefs);
  }, [flags, session?.user, userPrefs]);
  
  // Logging for analytics
  useEffect(() => {
    console.log('[FeatureFlag] Layout decision:', {
      sessionId,
      userId: session?.user?.id,
      shouldUseNewLayout,
      flagEnabled: flags.newTranscriptLayout,
      userOptIn: userPrefs.hasOptedIn,
      timestamp: Date.now()
    });
    
    // Analytics tracking
    analytics.track('transcript_layout_decision', {
      layout_version: shouldUseNewLayout ? 'v2' : 'v1',
      user_id: session?.user?.id,
      session_id: sessionId,
      flag_enabled: flags.newTranscriptLayout,
      user_preference: userPrefs.hasOptedIn
    });
  }, [shouldUseNewLayout, sessionId, session?.user?.id]);
  
  // Route to appropriate component
  if (shouldUseNewLayout) {
    return <TranscriptReviewPageV2 sessionId={sessionId} />;
  }
  
  return <TranscriptReviewPageV1 sessionId={sessionId} />;
}

// Flag evaluation logic
function evaluateLayoutFlag(
  flags: TranscriptReviewFlags,
  user?: User,
  prefs?: UserTranscriptPreferences
): boolean {
  // 1. Check for URL override (for testing)
  const urlParams = new URLSearchParams(window.location.search);
  const forceFlag = urlParams.get('newLayout');
  if (forceFlag === 'true') return true;
  if (forceFlag === 'false') return false;
  
  // 2. Check user preference override
  if (prefs?.optIntoNewLayout !== null) {
    return prefs.optIntoNewLayout;
  }
  
  // 3. Check if feature is globally disabled
  if (!flags.newTranscriptLayout) return false;
  
  // 4. Check whitelist (always included users)
  if (user?.email && isUserWhitelisted(user.email)) return true;
  
  // 5. Check blacklist (always excluded users)
  if (user?.email && isUserBlacklisted(user.email)) return false;
  
  // 6. Apply percentage rollout
  return isUserInPercentageRollout(user?.id, flags.percentage);
}
```

### 2. URL Structure Strategy

```typescript
// Keep existing URLs unchanged for seamless migration
const TRANSCRIPT_ROUTES = {
  // Current URL structure (unchanged)
  review: '/dashboard/sessions/[id]/review',
  
  // Optional explicit version URLs for testing
  reviewV1: '/dashboard/sessions/[id]/review?version=v1',
  reviewV2: '/dashboard/sessions/[id]/review?version=v2',
  
  // Admin testing URLs
  adminPreview: '/dashboard/sessions/[id]/review?newLayout=true',
  adminFallback: '/dashboard/sessions/[id]/review?newLayout=false'
};

// URL parameter handling
export function useLayoutVersionFromUrl(): 'v1' | 'v2' | null {
  const searchParams = useSearchParams();
  const version = searchParams.get('version');
  const newLayout = searchParams.get('newLayout');
  
  if (version === 'v1' || newLayout === 'false') return 'v1';
  if (version === 'v2' || newLayout === 'true') return 'v2';
  
  return null; // Follow feature flag logic
}
```

### 3. Fallback Mechanism

```typescript
// Error boundary with automatic fallback
export function TranscriptReviewErrorBoundary({ 
  children, 
  sessionId 
}: { 
  children: React.ReactNode;
  sessionId: string;
}) {
  const [hasError, setHasError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [lastErrorTime, setLastErrorTime] = useState<number | null>(null);
  
  // Automatic fallback on repeated errors
  useEffect(() => {
    if (hasError && errorCount >= 2) {
      console.warn('[FeatureFlag] Multiple errors detected, falling back to v1');
      
      // Force fallback to v1
      const url = new URL(window.location.href);
      url.searchParams.set('newLayout', 'false');
      window.location.href = url.toString();
    }
  }, [hasError, errorCount]);
  
  const handleError = useCallback((error: Error, errorInfo: any) => {
    const now = Date.now();
    setErrorCount(prev => prev + 1);
    setLastErrorTime(now);
    setHasError(true);
    
    console.error('[FeatureFlag] Layout error:', {
      error: error.message,
      errorInfo,
      sessionId,
      errorCount: errorCount + 1,
      timestamp: now
    });
    
    // Report error to monitoring service
    errorTracking.captureException(error, {
      tags: {
        component: 'TranscriptReviewV2',
        sessionId,
        errorCount: errorCount + 1
      },
      extra: errorInfo
    });
  }, [sessionId, errorCount]);
  
  if (hasError) {
    return (
      <FallbackErrorUI 
        onRetry={() => {
          setHasError(false);
          window.location.reload();
        }}
        onFallback={() => {
          const url = new URL(window.location.href);
          url.searchParams.set('newLayout', 'false');
          window.location.href = url.toString();
        }}
      />
    );
  }
  
  return children;
}
```

## Gradual Rollout Strategy

### 1. Rollout Phases

```typescript
interface RolloutPhase {
  name: string;
  percentage: number;
  duration: string;
  criteria: string[];
  successMetrics: string[];
  rollbackTriggers: string[];
}

const ROLLOUT_PHASES: RolloutPhase[] = [
  {
    name: 'Internal Testing',
    percentage: 0,                        // Whitelist only
    duration: '1 week',
    criteria: [
      'Internal team members only',
      'QA team testing',
      'Stakeholder demos'
    ],
    successMetrics: [
      'No critical bugs reported',
      'Basic functionality working',
      'Performance within targets'
    ],
    rollbackTriggers: [
      'Any critical bugs',
      'Performance degradation > 20%',
      'Data corruption'
    ]
  },
  
  {
    name: 'Alpha Testing',
    percentage: 5,
    duration: '1 week',
    criteria: [
      'Power users who opt-in',
      'Users with high engagement',
      'Beta program participants'
    ],
    successMetrics: [
      'User satisfaction > 80%',
      'Task completion rate maintained',
      'No increase in support tickets'
    ],
    rollbackTriggers: [
      'User satisfaction < 60%',
      'Task completion rate drops > 10%',
      'Support ticket increase > 50%'
    ]
  },
  
  {
    name: 'Beta Testing',
    percentage: 15,
    duration: '2 weeks',
    criteria: [
      'Broader user base',
      'Mix of user types',
      'Different usage patterns'
    ],
    successMetrics: [
      'Performance metrics stable',
      'User adoption increasing',
      'Positive feedback trends'
    ],
    rollbackTriggers: [
      'Performance regression',
      'Widespread user complaints',
      'Business metric impact'
    ]
  },
  
  {
    name: 'Limited Release',
    percentage: 50,
    duration: '1 week',
    criteria: [
      'Half of user base',
      'Random distribution',
      'All user segments represented'
    ],
    successMetrics: [
      'All metrics positive',
      'No scalability issues',
      'Support load manageable'
    ],
    rollbackTriggers: [
      'Any negative trend',
      'Infrastructure issues',
      'Support overload'
    ]
  },
  
  {
    name: 'Full Rollout',
    percentage: 100,
    duration: 'Ongoing',
    criteria: [
      'All users on new layout',
      'Old layout deprecated',
      'Feature flag cleanup'
    ],
    successMetrics: [
      'Migration complete',
      'User satisfaction maintained',
      'Performance targets met'
    ],
    rollbackTriggers: [
      'Major issues discovered',
      'Business impact detected'
    ]
  }
];
```

### 2. Automated Rollout Control

```typescript
// Automated percentage adjustment based on metrics
export class AutomatedRolloutController {
  private readonly metricsThresholds = {
    errorRate: 0.02,                      // 2% error rate max
    performanceDegradation: 0.15,         // 15% performance loss max
    userSatisfaction: 0.7,                // 70% satisfaction min
    taskCompletionRate: 0.9               // 90% completion rate min
  };
  
  async evaluateRolloutHealth(): Promise<RolloutHealthStatus> {
    const metrics = await this.collectMetrics();
    
    const health: RolloutHealthStatus = {
      overall: 'healthy',
      details: {
        errorRate: metrics.errorRate,
        performance: metrics.averageLoadTime,
        satisfaction: metrics.userSatisfaction,
        completion: metrics.taskCompletionRate
      },
      recommendation: 'continue'
    };
    
    // Check each threshold
    if (metrics.errorRate > this.metricsThresholds.errorRate) {
      health.overall = 'unhealthy';
      health.recommendation = 'rollback';
    }
    
    if (metrics.performanceRegression > this.metricsThresholds.performanceDegradation) {
      health.overall = 'degraded';
      health.recommendation = 'pause';
    }
    
    if (metrics.userSatisfaction < this.metricsThresholds.userSatisfaction) {
      health.overall = 'concerning';
      health.recommendation = 'investigate';
    }
    
    return health;
  }
  
  async adjustRolloutPercentage(currentPhase: RolloutPhase): Promise<number> {
    const health = await this.evaluateRolloutHealth();
    
    switch (health.recommendation) {
      case 'rollback':
        console.warn('[RolloutController] Initiating automatic rollback');
        return 0; // Full rollback
        
      case 'pause':
        console.warn('[RolloutController] Pausing rollout');
        return currentPhase.percentage; // Maintain current level
        
      case 'continue':
        console.log('[RolloutController] Proceeding with rollout');
        return Math.min(currentPhase.percentage + 5, 100); // Gradual increase
        
      default:
        return currentPhase.percentage;
    }
  }
}
```

### 3. Metrics Collection & Monitoring

```typescript
// Real-time metrics collection
interface RolloutMetrics {
  // Performance metrics
  averageLoadTime: number;
  errorRate: number;
  performanceRegression: number;
  
  // User behavior metrics
  userSatisfaction: number;
  taskCompletionRate: number;
  featureAdoption: number;
  
  // Business metrics
  sessionDuration: number;
  actionCompletionRate: number;
  supportTicketVolume: number;
  
  // Technical metrics
  serverResponseTime: number;
  memoryUsage: number;
  clientErrors: number;
}

export function useRolloutMetricsCollection(userId?: string, layoutVersion?: string) {
  useEffect(() => {
    if (!userId || !layoutVersion) return;
    
    // Track session start
    analytics.track('transcript_session_start', {
      user_id: userId,
      layout_version: layoutVersion,
      timestamp: Date.now()
    });
    
    // Performance monitoring
    const performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        analytics.track('transcript_performance', {
          user_id: userId,
          layout_version: layoutVersion,
          metric_type: entry.entryType,
          duration: entry.duration,
          timestamp: Date.now()
        });
      });
    });
    
    performanceObserver.observe({ entryTypes: ['navigation', 'measure'] });
    
    // Error tracking
    const errorHandler = (event: ErrorEvent) => {
      analytics.track('transcript_error', {
        user_id: userId,
        layout_version: layoutVersion,
        error_message: event.message,
        error_filename: event.filename,
        error_line: event.lineno,
        timestamp: Date.now()
      });
    };
    
    window.addEventListener('error', errorHandler);
    
    return () => {
      performanceObserver.disconnect();
      window.removeEventListener('error', errorHandler);
      
      // Track session end
      analytics.track('transcript_session_end', {
        user_id: userId,
        layout_version: layoutVersion,
        timestamp: Date.now()
      });
    };
  }, [userId, layoutVersion]);
}
```

## A/B Testing Integration

### 1. Experiment Configuration

```typescript
interface ABTestExperiment {
  name: string;
  hypothesis: string;
  variants: ABTestVariant[];
  allocation: Record<string, number>;     // Percentage per variant
  metrics: string[];
  duration: number;                       // Days
  significance: number;                   // Statistical significance threshold
}

interface ABTestVariant {
  name: string;
  description: string;
  config: Partial<TranscriptReviewFlags>;
}

// Example A/B test configurations
const AB_TESTS: ABTestExperiment[] = [
  {
    name: 'panel_size_optimization',
    hypothesis: 'Different default panel sizes affect user productivity',
    variants: [
      {
        name: 'control',
        description: '60/40 split (current)',
        config: { splitPaneDefaultSizes: '60-40' }
      },
      {
        name: 'wider_transcript',
        description: '70/30 split (more transcript space)',
        config: { splitPaneDefaultSizes: '70-30' }
      },
      {
        name: 'balanced',
        description: '50/50 split (equal space)',
        config: { splitPaneDefaultSizes: '50-50' }
      }
    ],
    allocation: { control: 34, wider_transcript: 33, balanced: 33 },
    metrics: ['task_completion_time', 'panel_resize_frequency', 'user_satisfaction'],
    duration: 14,
    significance: 0.05
  },
  
  {
    name: 'default_tab_selection',
    hypothesis: 'Starting with different tabs affects user workflow',
    variants: [
      {
        name: 'safety_first',
        description: 'Default to Safety tab',
        config: { defaultActiveTab: 'safety' }
      },
      {
        name: 'billing_first',
        description: 'Default to Billing tab',
        config: { defaultActiveTab: 'billing' }
      },
      {
        name: 'progress_first',
        description: 'Default to Progress tab',
        config: { defaultActiveTab: 'progress' }
      }
    ],
    allocation: { safety_first: 34, billing_first: 33, progress_first: 33 },
    metrics: ['tab_switch_frequency', 'time_to_first_action', 'workflow_completion'],
    duration: 21,
    significance: 0.05
  }
];
```

### 2. Experiment Assignment

```typescript
// A/B test assignment logic
export function useABTestAssignment(
  experimentName: string,
  userId: string
): ABTestVariant | null {
  return useMemo(() => {
    const experiment = AB_TESTS.find(exp => exp.name === experimentName);
    if (!experiment) return null;
    
    // Stable hash-based assignment
    const hash = hashUserForExperiment(userId, experimentName);
    const variants = Object.entries(experiment.allocation);
    
    let cumulative = 0;
    for (const [variantName, percentage] of variants) {
      cumulative += percentage;
      if (hash < cumulative) {
        const variant = experiment.variants.find(v => v.name === variantName);
        
        // Log assignment
        console.log('[ABTest] User assigned to variant:', {
          userId,
          experiment: experimentName,
          variant: variantName,
          hash,
          timestamp: Date.now()
        });
        
        return variant || null;
      }
    }
    
    return null;
  }, [experimentName, userId]);
}

// Stable hash function for consistent assignment
function hashUserForExperiment(userId: string, experimentName: string): number {
  const input = `${userId}-${experimentName}`;
  let hash = 0;
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash) % 100; // Return 0-99
}
```

### 3. Results Collection

```typescript
// A/B test metrics collection
export function useABTestMetrics(experimentName: string, variantName: string) {
  const metricsRef = useRef<Record<string, any>>({});
  
  const recordMetric = useCallback((metricName: string, value: any) => {
    metricsRef.current[metricName] = value;
    
    // Send to analytics
    analytics.track('ab_test_metric', {
      experiment: experimentName,
      variant: variantName,
      metric: metricName,
      value,
      timestamp: Date.now()
    });
    
    console.log('[ABTest] Metric recorded:', {
      experiment: experimentName,
      variant: variantName,
      metric: metricName,
      value
    });
  }, [experimentName, variantName]);
  
  const recordEvent = useCallback((eventName: string, properties: Record<string, any> = {}) => {
    analytics.track('ab_test_event', {
      experiment: experimentName,
      variant: variantName,
      event: eventName,
      properties,
      timestamp: Date.now()
    });
  }, [experimentName, variantName]);
  
  return { recordMetric, recordEvent, metrics: metricsRef.current };
}
```

## Rollback Procedures

### 1. Emergency Rollback

```typescript
// Immediate rollback triggers
interface EmergencyRollbackTriggers {
  errorRateSpike: number;                 // > 5% error rate
  performanceDegradation: number;         // > 30% performance loss
  userComplaintVolume: number;            // > 10 complaints/hour
  businessMetricImpact: number;           // > 15% negative impact
  securityIssue: boolean;                 // Any security concern
}

// Emergency rollback execution
export async function executeEmergencyRollback(
  reason: string,
  triggeredBy: string
): Promise<void> {
  console.error('[Emergency] Initiating rollback:', {
    reason,
    triggeredBy,
    timestamp: Date.now()
  });
  
  // 1. Disable feature flag immediately
  await FeatureFlagService.updateFlag('newTranscriptLayout', {
    enabled: false,
    percentage: 0,
    updatedBy: `emergency-rollback-${triggeredBy}`
  });
  
  // 2. Clear user preferences to force old layout
  await clearAllUserLayoutPreferences();
  
  // 3. Invalidate CDN cache if needed
  await invalidateLayoutAssets();
  
  // 4. Send alerts to monitoring systems
  await sendEmergencyAlert({
    type: 'FEATURE_ROLLBACK',
    feature: 'transcript-review-v2',
    reason,
    triggeredBy,
    timestamp: new Date()
  });
  
  // 5. Log detailed rollback information
  console.log('[Emergency] Rollback completed:', {
    reason,
    triggeredBy,
    timestamp: Date.now(),
    affectedUsers: await getActiveUserCount()
  });
}
```

### 2. Planned Rollback

```typescript
// Gradual rollback for planned scenarios
export async function executePlannedRollback(
  rollbackPlan: RollbackPlan
): Promise<void> {
  console.log('[Rollback] Starting planned rollback:', rollbackPlan);
  
  const phases = rollbackPlan.phases;
  
  for (const phase of phases) {
    console.log(`[Rollback] Executing phase: ${phase.name}`);
    
    // Gradually reduce percentage
    await FeatureFlagService.updateFlag('newTranscriptLayout', {
      percentage: phase.targetPercentage,
      updatedBy: `planned-rollback-${phase.name}`
    });
    
    // Wait for phase duration
    await new Promise(resolve => setTimeout(resolve, phase.duration * 1000));
    
    // Monitor metrics during rollback
    const metrics = await collectRollbackMetrics();
    if (metrics.anomaliesDetected) {
      console.warn('[Rollback] Anomalies detected, accelerating rollback');
      break;
    }
  }
  
  console.log('[Rollback] Planned rollback completed');
}

interface RollbackPlan {
  reason: string;
  phases: RollbackPhase[];
  monitoring: string[];
  completionCriteria: string[];
}

interface RollbackPhase {
  name: string;
  targetPercentage: number;
  duration: number;                       // Seconds
  checkpoints: string[];
}
```

### 3. Rollback Validation

```typescript
// Validate rollback success
export async function validateRollbackSuccess(): Promise<RollbackValidation> {
  console.log('[Rollback] Validating rollback success...');
  
  const validation: RollbackValidation = {
    flagStatus: await checkFeatureFlagStatus(),
    userMigration: await checkUserMigrationStatus(),
    performanceRecovery: await checkPerformanceRecovery(),
    errorRateNormalization: await checkErrorRateNormalization(),
    overallSuccess: false
  };
  
  // Check all criteria
  validation.overallSuccess = (
    !validation.flagStatus.newLayoutEnabled &&
    validation.userMigration.allUsersOnV1 &&
    validation.performanceRecovery.metricsNormal &&
    validation.errorRateNormalization.rateAcceptable
  );
  
  if (validation.overallSuccess) {
    console.log('[Rollback] Validation successful - rollback complete');
  } else {
    console.error('[Rollback] Validation failed:', validation);
  }
  
  return validation;
}

interface RollbackValidation {
  flagStatus: {
    newLayoutEnabled: boolean;
    currentPercentage: number;
  };
  userMigration: {
    allUsersOnV1: boolean;
    v2UserCount: number;
  };
  performanceRecovery: {
    metricsNormal: boolean;
    currentLoadTime: number;
    baselineLoadTime: number;
  };
  errorRateNormalization: {
    rateAcceptable: boolean;
    currentErrorRate: number;
    baselineErrorRate: number;
  };
  overallSuccess: boolean;
}
```

## Development & Testing Support

### 1. Local Development Setup

```typescript
// Development environment configuration
interface DevEnvironmentConfig {
  // Local overrides
  FORCE_NEW_LAYOUT: boolean;              // Always use new layout
  FORCE_OLD_LAYOUT: boolean;              // Always use old layout
  ENABLE_DEBUG_MODE: boolean;             // Show debug information
  MOCK_FEATURE_FLAGS: boolean;            // Use mock flag service
  
  // Testing flags
  ENABLE_ERROR_SIMULATION: boolean;       // Simulate errors
  PERFORMANCE_THROTTLING: number;         // Simulate slow performance
  USER_SIMULATION_MODE: string;           // Simulate different user types
}

// Development feature flag hook
export function useDevFeatureFlags(): TranscriptReviewFlags & DevFlags {
  const [flags, setFlags] = useState<TranscriptReviewFlags>({
    newTranscriptLayout: false,
    progressiveDisclosure: true,
    mobileBottomSheet: true,
    advancedKeyboardNav: false,
    enhancedAnimations: true,
    virtualScrollingV2: false,
    smartActionOptimization: true,
    splitPaneDefaultSizes: '60-40',
    defaultActiveTab: 'safety',
    highlightMode: 'summary'
  });
  
  // Development overrides
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const devFlags = {
        ...flags,
        newTranscriptLayout: process.env.NEXT_PUBLIC_FORCE_NEW_LAYOUT === 'true',
        // ... other dev overrides
      };
      setFlags(devFlags);
    }
  }, []);
  
  return flags;
}
```

### 2. Testing Utilities

```typescript
// Testing helper functions
export class FeatureFlagTestUtils {
  static mockFlags(overrides: Partial<TranscriptReviewFlags>): void {
    // Mock feature flag responses for testing
    jest.spyOn(FeatureFlagService.prototype, 'getFlag')
      .mockImplementation((flagName: string) => {
        return Promise.resolve(overrides[flagName] ?? false);
      });
  }
  
  static simulateRolloutPercentage(percentage: number): void {
    // Mock percentage rollout for testing
    jest.spyOn(Math, 'random').mockReturnValue(percentage / 100);
  }
  
  static async simulateUserMigration(userId: string, toLayout: 'v1' | 'v2'): Promise<void> {
    // Simulate user migration for testing
    const flags = toLayout === 'v2' ? { newTranscriptLayout: true } : { newTranscriptLayout: false };
    FeatureFlagTestUtils.mockFlags(
