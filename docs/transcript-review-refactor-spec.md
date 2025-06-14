# FAANG-Style Transcript Review Refactor - Technical Specification

**Document Version**: 1.0  
**Created**: December 12, 2025  
**Epic**: 1.3 - Create Refactoring Technical Specification  
**Purpose**: Comprehensive technical blueprint for the refactor implementation

## Executive Summary

This specification defines the transformation of the current three-column transcript review layout into a FAANG-style two-pane interface with tabbed insights. The refactor prioritizes cognitive load reduction, progressive disclosure, and performance optimization while maintaining feature parity.

### Key Objectives
1. **Simplified Layout**: Two-pane split (60/40) replacing three-column design
2. **Tabbed Organization**: Consolidate AI insights into tabbed interface
3. **Progressive Disclosure**: Show summaries first, details on demand
4. **Performance**: <2s load time, 60fps interactions, smooth animations
5. **Mobile-First**: Touch-optimized with bottom sheet pattern

## Architecture Overview

### Current vs. Proposed Architecture

#### Current Architecture
```
┌─────────────────────────────────────────────────────────┐
│ Header (Breadcrumb + Actions)                           │
├─────────────────────────────────────────────────────────┤
│ AI Progress Bar (conditional)                           │
├─────────────────────────────────────────────────────────┤
│ AI Insights Grid (3 columns - horizontal)              │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│ │ Safety  │ │ Billing │ │Progress │                   │
│ │ Panel   │ │ Panel   │ │ Panel   │                   │
│ └─────────┘ └─────────┘ └─────────┘                   │
├─────────────────────────────────────────────────────────┤
│ Main Grid (3 columns)                                  │
│ ┌─────────────────────┐ ┌─────────────────────────────┐ │
│ │ Transcript Area     │ │ Sidebar                     │ │
│ │ (2/3 width)         │ │ - Navigation                │ │
│ │                     │ │ - Session Info              │ │
│ │                     │ │ - Statistics                │ │
│ │                     │ │ - Actions                   │ │
│ └─────────────────────┘ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Proposed Architecture
```
┌─────────────────────────────────────────────────────────┐
│ Sticky Header (Breadcrumb + Actions + Progress Banner) │
├─────────────────────────────────────────────────────────┤
│ Two-Pane Split Layout (Resizable)                      │
│ ┌─────────────────────┐ ┌─────────────────────────────┐ │
│ │ Transcript Pane     │ │ Insights Drawer             │ │
│ │ (60% default width) │ │ (40% default width)         │ │
│ │                     │ │ ┌─────────────────────────┐ │ │
│ │                     │ │ │ Tab Navigation          │ │ │
│ │                     │ │ │ [Safety][Billing][Prog] │ │ │
│ │                     │ │ ├─────────────────────────┤ │ │
│ │                     │ │ │ Active Tab Content      │ │ │
│ │                     │ │ │ (Progressive Disclosure)│ │ │
│ │                     │ │ │                         │ │ │
│ │                     │ │ ├─────────────────────────┤ │ │
│ │                     │ │ │ Smart Actions Footer    │ │ │
│ │                     │ │ └─────────────────────────┘ │ │
│ └─────────────────────┘ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. New Component Hierarchy

```typescript
// New page structure
TranscriptReviewPageV2
├── StickyHeader
│   ├── Breadcrumb Navigation
│   ├── AIProgressBanner (collapsible)
│   ├── Primary Actions (Generate Note)
│   └── SecondaryActionsMenu (Export, Settings)
├── SplitPane (resizable)
│   ├── TranscriptPane
│   │   └── TranscriptDisplay (enhanced)
│   └── InsightsDrawer
│       ├── TabsNavigation
│       │   ├── SafetyTab (with badge)
│       │   ├── BillingTab (with badge)
│       │   └── ProgressTab (with badge)
│       ├── TabContent (active tab)
│       │   ├── SafetyInsightsTab
│       │   ├── BillingInsightsTab
│       │   └── ProgressInsightsTab
│       └── SmartActionsFooter (contextual)
└── MobileInsightsSheet (< 1024px)
    └── Same tab structure as drawer
```

### 2. Core Component Specifications

#### SplitPane Component
```typescript
interface SplitPaneProps {
  defaultSizes: [number, number];           // [60, 40] default
  minSize: number;                          // 20% minimum
  maxSize: number;                          // 80% maximum
  direction: 'horizontal' | 'vertical';     // horizontal for desktop
  persistSizes: boolean;                    // Save to localStorage
  onResize: (sizes: number[]) => void;      // Callback for resize events
  className?: string;
  children: [React.ReactNode, React.ReactNode];
}

// Implementation using react-resizable-panels
export function SplitPane({ 
  defaultSizes, 
  minSize = 20, 
  maxSize = 80, 
  onResize, 
  persistSizes = true,
  children 
}: SplitPaneProps) {
  // localStorage integration for persistence
  // Smooth resize handling with debouncing
  // Mobile responsiveness (stack vertically < 1024px)
}
```

#### InsightsDrawer Component
```typescript
interface InsightsDrawerProps {
  insights: AIInsightsState;
  activeTab: 'safety' | 'billing' | 'progress';
  onTabChange: (tab: string) => void;
  onActionExecute: (action: SmartAction) => void;
  className?: string;
}

export function InsightsDrawer({
  insights,
  activeTab,
  onTabChange,
  onActionExecute
}: InsightsDrawerProps) {
  // Tab state management
  // Badge counts for each tab
  // Progressive disclosure logic
  // Smart actions filtering by active tab
}
```

#### Tabs Component (New)
```typescript
interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  badge?: number;                           // Alert/item count
  className?: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

// Radix UI implementation with custom styling
export function Tabs({ value, onValueChange, children }: TabsProps) {
  // Keyboard navigation (arrow keys)
  // Smooth transitions (150ms)
  // ARIA compliance
  // Badge support in triggers
}
```

#### StickyHeader Component (New)
```typescript
interface StickyHeaderProps {
  progress: number;                         // AI analysis progress
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  children: React.ReactNode;               // Breadcrumb content
}

export function StickyHeader({
  progress,
  isCollapsed,
  onToggleCollapse,
  primaryAction,
  secondaryActions,
  children
}: StickyHeaderProps) {
  // Fixed positioning with proper z-index
  // Smooth shadow on scroll
  // Collapsible progress banner
  // Mobile responsive height adjustment
}
```

### 3. Enhanced Component Updates

#### TranscriptDisplay Enhancements
```typescript
// Additional props for new layout
interface TranscriptDisplayProps {
  // ... existing props
  layout: 'split' | 'stacked';             // Layout mode
  highlightMode: 'summary' | 'detailed';   // Progressive highlighting
  onHighlightClick: (highlight: TranscriptHighlight) => void;
}

// Enhancements:
// - Better virtual scrolling integration
// - Progressive highlight disclosure
// - Improved mobile touch targets
// - Contextual action triggers
```

#### AI Insights Tab Components
```typescript
// Common interface for all tab components
interface InsightsTabProps<T> {
  insights: T;
  mode: 'summary' | 'detailed';            // Progressive disclosure
  onModeChange: (mode: string) => void;
  onActionTrigger: (action: SmartAction) => void;
}

// SafetyInsightsTab - Enhanced with progressive disclosure
// - Show only critical/high alerts in summary mode
// - Expand to full details in detailed mode
// - Quick action buttons for urgent items

// BillingInsightsTab - Enhanced with approval workflow
// - High-confidence codes prominently displayed
// - One-click approval for 80%+ confidence
// - Progressive disclosure of all codes

// ProgressInsightsTab - Enhanced with goal prioritization
// - Most important goals shown first
// - Visual progress indicators
// - Expandable goal details
```

## State Management Architecture

### 1. Global State Structure

```typescript
// Enhanced AI insights state for new layout
interface TabState {
  activeTab: 'safety' | 'billing' | 'progress';
  tabBadges: Record<string, number>;        // Alert/item counts
  expansionStates: Record<string, boolean>; // Progressive disclosure
}

interface LayoutState {
  panelSizes: [number, number];            // Split pane sizes
  headerCollapsed: boolean;                // Progress banner state
  highlightMode: 'summary' | 'detailed';   // Highlight visibility
  layoutMode: 'split' | 'stacked';         // Responsive layout
}

interface UIPreferences {
  panelSizes: [number, number];            // Persisted panel sizes
  defaultTab: string;                      // Last active tab
  highlightsEnabled: boolean;              // Highlight toggle state
  headerCollapsed: boolean;                // Banner collapse state
}
```

### 2. State Management Hooks

#### Panel Preferences Hook
```typescript
interface UsePanelPreferencesReturn {
  sizes: [number, number];
  setSizes: (sizes: [number, number]) => void;
  resetToDefault: () => void;
  isLoading: boolean;
}

export function usePanelPreferences(
  key: string = 'transcript-review-panels',
  defaultSizes: [number, number] = [60, 40]
): UsePanelPreferencesReturn {
  // localStorage integration
  // Debounced saves (prevent excessive writes)
  // Validation (ensure sizes are within bounds)
  // Migration from old preferences
}
```

#### Responsive Layout Hook
```typescript
interface UseResponsiveLayoutReturn {
  mode: 'split' | 'stacked';
  isMobile: boolean;
  breakpoint: number;
  triggerResize: () => void;
}

export function useResponsiveLayout(
  breakpoint: number = 1024
): UseResponsiveLayoutReturn {
  // Viewport size detection
  // Debounced resize events
  // Layout mode calculation
  // Component update triggers
}
```

#### Tab State Hook
```typescript
interface UseTabStateReturn {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  badges: Record<string, number>;
  updateBadge: (tab: string, count: number) => void;
  expansions: Record<string, boolean>;
  toggleExpansion: (key: string) => void;
}

export function useTabState(
  defaultTab: string = 'safety'
): UseTabStateReturn {
  // Tab navigation state
  // Badge count management
  // Progressive disclosure state
  // Keyboard navigation support
}
```

### 3. Context Optimization

```typescript
// Optimized context structure to prevent unnecessary re-renders
interface TranscriptReviewContextValue {
  // AI insights (cached, memoized)
  insights: AIInsightsState;
  
  // UI state (split into separate contexts)
  layout: LayoutState;
  tabs: TabState;
  
  // Actions (memoized callbacks)
  actions: {
    onTabChange: (tab: string) => void;
    onPanelResize: (sizes: [number, number]) => void;
    onActionExecute: (action: SmartAction) => void;
  };
}

// Context splitting strategy
export const LayoutContext = createContext<LayoutState>();
export const TabContext = createContext<TabState>();
export const ActionsContext = createContext<ActionCallbacks>();
```

## Data Flow Architecture

### 1. AI Insights Integration

```typescript
// Enhanced data flow for tabbed interface
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ useAIInsights   │───▶│ Transform Data  │───▶│ Tab Components  │
│ Hook            │    │ for Tabs        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Pipeline APIs   │    │ Progressive     │    │ Smart Actions   │
│ (unchanged)     │    │ Disclosure      │    │ (contextual)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘

// Data transformation for tabs
function transformInsightsForTabs(insights: AIInsightsState): TabData {
  return {
    safety: {
      summary: extractCriticalAlerts(insights.safety),
      detailed: insights.safety,
      badge: countAlerts(insights.safety, ['critical', 'high'])
    },
    billing: {
      summary: extractHighConfidenceCodes(insights.billing),
      detailed: insights.billing,
      badge: countPendingApprovals(insights.billing)
    },
    progress: {
      summary: extractKeyGoals(insights.progress),
      detailed: insights.progress,
      badge: countActiveGoals(insights.progress)
    }
  };
}
```

### 2. Progressive Disclosure Logic

```typescript
// Summary mode data extraction
interface SummaryExtractor<T> {
  extract: (data: T) => Partial<T>;
  shouldShow: (item: any) => boolean;
  priority: (item: any) => number;
}

// Safety insights summary
const safetySummaryExtractor: SummaryExtractor<SafetyInsights> = {
  extract: (data) => ({
    alerts: data.alerts
      .filter(alert => ['critical', 'high'].includes(alert.severity))
      .slice(0, 3), // Show top 3 critical/high alerts
    riskAssessment: data.riskAssessment,
    recommendations: {
      immediate: data.recommendations.immediate.slice(0, 2)
    }
  }),
  shouldShow: (alert) => alert.severity === 'critical' || alert.severity === 'high',
  priority: (alert) => alert.severity === 'critical' ? 1 : 2
};

// Similar extractors for billing and progress
```

### 3. Smart Actions Integration

```typescript
// Context-aware smart actions
interface SmartActionsContext {
  activeTab: string;
  insights: AIInsightsState;
  userPreferences: UserPreferences;
}

function getContextualActions(context: SmartActionsContext): SmartAction[] {
  const { activeTab, insights } = context;
  
  switch (activeTab) {
    case 'safety':
      return filterSafetyActions(insights.safety);
    case 'billing':
      return filterBillingActions(insights.billing);
    case 'progress':
      return filterProgressActions(insights.progress);
    default:
      return getGlobalActions(insights);
  }
}

// Maximum 3 actions per tab to avoid cognitive overload
function filterSafetyActions(safety: SafetyInsights): SmartAction[] {
  const actions: SmartAction[] = [];
  
  // High priority: Critical alerts
  if (safety.alerts.some(a => a.severity === 'critical')) {
    actions.push(createContactCrisisAction());
  }
  
  // Medium priority: Risk documentation
  if (safety.riskAssessment.overallRisk === 'high') {
    actions.push(createDocumentRiskAction());
  }
  
  // Low priority: Safety plan update
  actions.push(createUpdateSafetyPlanAction());
  
  return actions.slice(0, 3); // Limit to 3 actions
}
```

## Migration Strategy

### 1. Parallel Implementation Approach

```typescript
// Feature flag controlled migration
interface FeatureFlags {
  newTranscriptLayout: boolean;           // Main feature flag
  progressiveDisclosure: boolean;         // Progressive rollout
  mobileBottomSheet: boolean;            // Mobile-specific features
  advancedKeyboardNav: boolean;          // Power user features
}

// Route decision logic
export default function TranscriptReviewPage() {
  const { newTranscriptLayout } = useFeatureFlags();
  
  if (newTranscriptLayout) {
    return <TranscriptReviewPageV2 />;
  }
  
  return <TranscriptReviewPageV1 />; // Current implementation
}
```

### 2. Component Migration Plan

#### Phase 1: Infrastructure (Days 1-5)
1. **Install dependencies**: `@radix-ui/react-tabs`
2. **Create base components**: Tabs, SplitPane, StickyHeader
3. **Setup state management**: Panel preferences, responsive layout
4. **Create page-v2.tsx**: Parallel implementation shell

#### Phase 2: Layout Implementation (Days 6-10)
1. **Implement split pane**: Two-pane layout with resizing
2. **Create insights drawer**: Tabbed interface structure
3. **Add sticky header**: Fixed navigation with progress banner
4. **Basic tab navigation**: Without content migration

#### Phase 3: Content Migration (Days 11-15)
1. **Migrate transcript display**: Enhanced for new layout
2. **Create tab components**: Safety, Billing, Progress tabs
3. **Implement progressive disclosure**: Summary/detailed modes
4. **Integrate smart actions**: Context-aware action bar

#### Phase 4: Polish & Performance (Days 16-25)
1. **Add animations**: Smooth transitions
2. **Optimize performance**: Virtual scrolling, memoization
3. **Mobile responsive**: Bottom sheet implementation
4. **Visual polish**: Shadow-based styling, FAANG aesthetics

#### Phase 5: Testing & Deployment (Days 26-30)
1. **Feature flag rollout**: Gradual user exposure
2. **Performance monitoring**: Real-world metrics
3. **User feedback**: Collection and iteration
4. **Full deployment**: Replace original implementation

### 3. Data Compatibility Strategy

```typescript
// Backward compatibility wrapper
interface LegacyDataAdapter {
  adaptAIInsights: (legacy: any) => AIInsightsState;
  adaptUserPreferences: (legacy: any) => UIPreferences;
  migrateLocalStorage: () => void;
}

// Ensure existing sessions continue to work
function ensureDataCompatibility(sessionData: any): SessionData {
  // Validate data structure
  // Apply migrations if needed
  // Provide fallbacks for missing data
  // Log migration events for monitoring
}
```

## Performance Architecture

### 1. Loading Strategy

```typescript
// Optimized loading sequence
interface LoadingPhases {
  phase1_shell: () => Promise<void>;        // Basic layout (< 100ms)
  phase2_transcript: () => Promise<void>;   // Transcript content (< 500ms)
  phase3_insights: () => Promise<void>;     // AI insights (< 2000ms)
  phase4_enhancements: () => Promise<void>; // Progressive enhancements
}

// Progressive loading implementation
export function useProgressiveLoading(sessionId: string): LoadingPhases {
  const [phase, setPhase] = useState<keyof LoadingPhases>('phase1_shell');
  
  // Phase 1: Render layout shell immediately
  useEffect(() => {
    setPhase('phase2_transcript');
  }, []);
  
  // Phase 2: Load transcript data
  useEffect(() => {
    if (phase === 'phase2_transcript') {
      loadTranscriptData().then(() => {
        setPhase('phase3_insights');
      });
    }
  }, [phase]);
  
  // Phase 3: Start AI insights (parallel)
  // Phase 4: Add enhancements (animations, etc.)
}
```

### 2. Memoization Strategy

```typescript
// Component memoization for performance
export const TranscriptDisplay = React.memo(({ 
  entries, 
  insights, 
  highlightMode 
}: TranscriptDisplayProps) => {
  // Only re-render when essential props change
}, (prevProps, nextProps) => {
  return (
    prevProps.entries === nextProps.entries &&
    prevProps.insights === nextProps.insights &&
    prevProps.highlightMode === nextProps.highlightMode
  );
});

// Insights computation memoization
export function useMemoizedInsights(insights: AIInsightsState, activeTab: string) {
  return useMemo(() => {
    return transformInsightsForTabs(insights);
  }, [insights, activeTab]);
}

// Tab content memoization (only render active tab)
export function useTabContentMemoization(
  insights: TabData, 
  activeTab: string
) {
  return useMemo(() => {
    // Only compute content for active tab
    return insights[activeTab];
  }, [insights, activeTab]);
}
```

### 3. Virtual Scrolling Enhancement

```typescript
// Enhanced virtual scrolling for new layout
interface VirtualScrollConfig {
  itemHeight: number;                     // Fixed item height
  containerHeight: number;               // Visible container height
  overscan: number;                      // Items to render outside viewport
  highlightAware: boolean;               // Respect highlighting boundaries
}

export function useEnhancedVirtualScroll(
  items: TranscriptEntry[],
  config: VirtualScrollConfig
) {
  // Improved virtual scrolling that works with highlighting
  // Better performance for large transcripts
  // Smooth scrolling to highlighted sections
  // Maintain scroll position during layout changes
}
```

## Mobile Responsive Architecture

### 1. Responsive Breakpoints

```typescript
// Responsive design breakpoints
interface ResponsiveBreakpoints {
  mobile: 0;          // 0-767px (bottom sheet)
  tablet: 768;        // 768-1023px (stacked layout)
  desktop: 1024;      // 1024px+ (split pane)
  large: 1440;        // 1440px+ (wider panels)
}

// Layout mode calculation
function getLayoutMode(width: number): LayoutMode {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}
```

### 2. Mobile Bottom Sheet Implementation

```typescript
// Mobile-optimized insights presentation
interface MobileInsightsSheetProps {
  insights: TabData;
  isOpen: boolean;
  onClose: () => void;
  defaultTab: string;
}

export function MobileInsightsSheet({
  insights,
  isOpen,
  onClose,
  defaultTab
}: MobileInsightsSheetProps) {
  // Uses existing Sheet component
  // Swipe gestures for tab switching
  // Touch-optimized controls (44px targets)
  // Haptic feedback support
  // Handle orientation changes
}
```

### 3. Touch Interaction Optimization

```typescript
// Touch-friendly interaction patterns
interface TouchInteractionConfig {
  minTouchTarget: 44;                    // Minimum touch target size (px)
  swipeThreshold: 50;                    // Swipe distance threshold
  tapTimeout: 300;                       // Double-tap detection
  longPressTimeout: 500;                 // Long press detection
}

export function useTouchInteractions(
  ref: RefObject<HTMLElement>,
  config: TouchInteractionConfig
) {
  // Touch gesture recognition
  // Swipe for tab navigation
  // Long press for context actions
  // Prevent accidental interactions
}
```

## Logging & Analytics Architecture

### 1. User Interaction Logging

```typescript
// Comprehensive interaction tracking
interface InteractionEvent {
  type: 'tab_switch' | 'panel_resize' | 'disclosure_toggle' | 'action_execute';
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata: Record<string, any>;
}

// Tab interaction logging
export function logTabSwitch(
  fromTab: string, 
  toTab: string, 
  method: 'click' | 'keyboard' | 'swipe'
) {
  console.log('[TranscriptReview] Tab switch:', {
    fromTab,
    toTab,
    method,
    timestamp: Date.now(),
    sessionId: getCurrentSessionId()
  });
  
  // Send to analytics service
  analytics.track('transcript_review_tab_switch', {
    from_tab: fromTab,
    to_tab: toTab,
    switch_method: method
  });
}

// Panel resize logging
export function logPanelResize(
  oldSizes: [number, number],
  newSizes: [number, number],
  method: 'drag' | 'double_click' | 'keyboard'
) {
  console.log('[TranscriptReview] Panel resize:', {
    oldSizes,
    newSizes,
    method,
    timestamp: Date.now()
  });
}

// Progressive disclosure logging
export function logDisclosureToggle(
  section: string,
  expanded: boolean,
  itemCount: number
) {
  console.log('[TranscriptReview] Disclosure toggle:', {
    section,
    expanded,
    itemCount,
    timestamp: Date.now()
  });
}
```

### 2. Performance Monitoring

```typescript
// Performance metrics collection
interface PerformanceMetrics {
  initialLoadTime: number;               // Time to first content
  tabSwitchTime: number;                // Tab switching response
  panelResizeTime: number;              // Panel resize performance
  scrollPerformance: number;            // Scroll frame rate
  memoryUsage: number;                  // Memory consumption
}

export function usePerformanceMonitoring() {
  const metrics = useRef<PerformanceMetrics>({
    initialLoadTime: 0,
    tabSwitchTime: 0,
    panelResizeTime: 0,
    scrollPerformance: 0,
    memoryUsage: 0
  });
  
  // Track initial load performance
  useEffect(() => {
    const startTime = performance.now();
    
    // Measure time to interactive
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          metrics.current.initialLoadTime = entry.duration;
          console.log('[Performance] Initial load time:', entry.duration);
        }
      });
    });
    
    observer.observe({ entryTypes: ['navigation'] });
    
    return () => observer.disconnect();
  }, []);
  
  // Track tab switch performance
  const measureTabSwitch = useCallback((callback: () => void) => {
    const startTime = performance.now();
    
    callback();
    
    requestAnimationFrame(() => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      metrics.current.tabSwitchTime = duration;
      
      console.log('[Performance] Tab switch time:', duration);
      
      if (duration > 100) {
        console.warn('[Performance] Slow tab switch detected:', duration);
      }
    });
  }, []);
  
  return { metrics: metrics.current, measureTabSwitch };
}
```

### 3. Error Tracking & Recovery

```typescript
// Error boundary with recovery strategies
interface ErrorRecoveryStrategy {
  retry: () => void;
  fallback: () => void;
  reportError: (error: Error) => void;
}

export function TranscriptReviewErrorBoundary({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const recovery: ErrorRecoveryStrategy = {
    retry: () => {
      setHasError(false);
      setError(null);
      window.location.reload();
    },
    
    fallback: () => {
      // Redirect to original layout
      window.location.href = window.location.href + '?fallback=true';
    },
    
    reportError: (error: Error) => {
      console.error('[TranscriptReview] Component error:', error);
      
      // Send to error tracking service
      errorTracking.captureException(error, {
        component: 'TranscriptReviewV2',
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    }
  };
  
  // Error boundary implementation
  // Recovery UI with options
  // Graceful degradation
}
```

## Testing Strategy

### 1. Component Testing

```typescript
// Unit tests for core components
describe('InsightsDrawer', () => {
  test('should switch tabs correctly', () => {
    // Test tab navigation
    // Verify state updates
    // Check accessibility
  });
  
  test('should handle progressive disclosure', () => {
    // Test summary/detailed mode switching
    // Verify data filtering
    // Check animation states
  });
  
  test('should integrate with smart actions', () => {
    // Test action filtering by tab
    // Verify callback execution
    // Check context passing
  });
});

describe('SplitPane', () => {
  test('should persist panel sizes', () => {
    // Test localStorage integration
    // Verify size constraints
    // Check responsive behavior
  });
  
  test('should handle keyboard navigation', () => {
    // Test keyboard shortcuts
    // Verify focus management
    // Check accessibility
  });
});
```

### 2. Integration Testing

```typescript
// End-to-end workflow tests
describe('Transcript Review Workflow', () => {
  test('complete review
