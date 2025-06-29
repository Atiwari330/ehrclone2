# Tab Component Patterns Analysis
**Story 1.2 Completion Document**
*Generated: December 29, 2025*

## Executive Summary
Comprehensive analysis of existing tab component architecture for implementing consistent note tab component. All tab components follow established patterns for loading states, progressive disclosure, and user interactions.

## Component Architecture Patterns

### 1. Core Component Structure

**Universal Pattern:**
```typescript
interface TabProps {
  data: InsightsType | null;
  isLoading?: boolean;
  error?: Error | null;
  onAction?: (...args) => void;
  className?: string;
}

export function TabComponent({
  data: insights,
  isLoading = false,
  error = null,
  onAction,
  className
}: TabProps) {
  // 1. State management
  // 2. Lifecycle logging
  // 3. Conditional rendering
  // 4. Main content with progressive disclosure
}
```

### 2. State Management Patterns

**Consistent State Variables:**
- `expandedSections: Set<string>` - Track expanded collapsible sections
- `showAllItems: boolean` - Progressive disclosure toggle
- `localState: Set<string>` - Component-specific state (e.g., approved codes)

**State Update Patterns:**
```typescript
const toggleSection = React.useCallback((sectionId: string) => {
  setExpandedSections(prev => {
    const newSet = new Set(prev);
    if (newSet.has(sectionId)) {
      newSet.delete(sectionId);
    } else {
      newSet.add(sectionId);
    }
    
    console.log('[TabComponent] Section toggled:', {
      sectionId,
      expanded: newSet.has(sectionId),
      timestamp: Date.now()
    });
    
    return newSet;
  });
}, []);
```

### 3. Progressive Disclosure Strategy

**Three-Tier Information Architecture:**

1. **Primary Content (Always Visible):**
   - High-priority/confidence items (top 3)
   - Overall summary metrics
   - Critical alerts or recommendations

2. **Secondary Content (Collapsible):**
   - Medium-priority items
   - Detailed breakdowns
   - Historical data

3. **Tertiary Content (Expandable Cards):**
   - Individual item details
   - Action buttons
   - Supporting documentation

**Implementation Pattern:**
```typescript
// Show top N items by default
const displayedItems = showAllItems ? allItems : allItems.slice(0, 3);
const hiddenItemsCount = allItems.length - displayedItems.length;

// Collapsible sections with toggle buttons
<Button
  variant="ghost"
  size="sm"
  onClick={() => toggleSection('section-id')}
  className="w-full justify-between p-3 h-auto"
>
  <div className="flex items-center space-x-2">
    <Icon className="h-4 w-4" />
    <span>Section Title</span>
    <Badge>{itemCount}</Badge>
  </div>
  {expandedSections.has('section-id') ? <ChevronUp /> : <ChevronDown />}
</Button>
```

### 4. Loading/Error/Empty State Patterns

**Consistent State Components:**
```typescript
// Loading State
function TabLoading({ className }: { className?: string }) {
  return (
    <div className={cn('h-full flex items-center justify-center', className)}>
      <div className="text-center space-y-2">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-muted-foreground">Analyzing [domain]...</p>
      </div>
    </div>
  );
}

// Error State
function TabError({ error, className }: { error: Error; className?: string }) {
  return (
    <div className={cn('h-full flex items-center justify-center', className)}>
      <div className="text-center space-y-2">
        <Icon className="h-8 w-8 text-destructive mx-auto" />
        <p className="text-sm font-medium">[Domain] Analysis Failed</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    </div>
  );
}

// Empty State
function TabEmpty({ className }: { className?: string }) {
  return (
    <div className={cn('h-full flex items-center justify-center', className)}>
      <div className="text-center space-y-2">
        <Icon className="h-8 w-8 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">No [domain] analysis available</p>
      </div>
    </div>
  );
}
```

### 5. UI Component Library Usage

**Consistent Components:**
- `ScrollArea` - Main content container with overflow handling
- `InsightSummaryCard` - Expandable cards for complex items
- `Badge` - Status indicators and counters
- `Button` - Actions and toggles
- `Progress` - Percentage indicators
- Icons from `lucide-react` - Consistent iconography

**Card Pattern (InsightSummaryCard):**
```typescript
<InsightSummaryCard
  key={item.id}
  id={item.id}
  title={item.title}
  description={item.description}
  severity={item.severity}
  confidence={item.confidence * 100}
  badges={[
    { label: item.category, variant: 'outline' },
    { label: 'Status', variant: 'default' }
  ]}
  expanded={expandedSections.has(item.id)}
  onToggleExpanded={(expanded) => toggleSection(item.id)}
>
  <ExpandedContent item={item} onAction={onAction} />
</InsightSummaryCard>
```

### 6. Logging Strategy Patterns

**Component Lifecycle Logging:**
```typescript
React.useEffect(() => {
  console.log('[TabComponent] Tab mounted:', {
    hasData: !!insights,
    isLoading,
    hasError: !!error,
    timestamp: Date.now()
  });

  return () => {
    console.log('[TabComponent] Tab unmounted:', {
      timestamp: Date.now()
    });
  };
}, [insights, isLoading, error]);
```

**User Interaction Logging:**
```typescript
const handleAction = React.useCallback((actionData) => {
  console.log('[TabComponent] User action:', {
    action: 'actionType',
    data: actionData,
    timestamp: Date.now()
  });
  
  onAction?.(actionData);
}, [onAction]);
```

**Performance Logging (React.memo):**
```typescript
const MemoizedTabComponent = React.memo(TabComponent, (prevProps, nextProps) => {
  const shouldSkipRender = (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.error === nextProps.error &&
    prevProps.data === nextProps.data
  );

  console.log('[TabComponent] React.memo comparison:', {
    shouldSkipRender,
    dataChanged: prevProps.data !== nextProps.data,
    timestamp: Date.now()
  });

  return shouldSkipRender;
});
```

## Tab-Specific Implementation Patterns

### 1. Safety Tab (`safety-insights-tab.tsx`)

**Unique Features:**
- Risk assessment scoring with color-coded progress bars
- Urgent response footer with emergency actions
- Risk factor categorization (risk vs protective factors)
- Alert severity filtering with progressive disclosure

**Key Patterns:**
- Severity-based styling: `critical` → red, `high` → orange, `medium` → yellow, `low` → green
- Emergency contact integration
- Risk score visualization (0-100 scale)

### 2. Billing Tab (`billing-insights-tab.tsx`)

**Unique Features:**
- Code approval workflow with bulk actions
- Confidence-based grouping (high/medium/low confidence)
- Session type detection with confidence indicators
- Billing optimization recommendations

**Key Patterns:**
- Confidence thresholds: `≥80%` high, `60-79%` medium, `<60%` low
- Approval state tracking with visual indicators
- Revenue opportunity highlighting

### 3. Progress Tab (`progress-insights-tab.tsx`)

**Unique Features:**
- Goal progress tracking with percentage indicators
- Treatment effectiveness rating (1-10 scale)
- Session quality metrics (engagement, rapport, progress)
- Goal status categorization (active, achieved, other)

**Key Patterns:**
- Progress bars for visual completion status
- Trend indicators (improving, stable, declining, mixed)
- Evidence vs barriers categorization

## InsightsDrawer Integration Patterns

### 1. Tab Registration Pattern

**TabsList Structure:**
```typescript
<TabsList className="grid w-full grid-cols-3"> {/* HARDCODED - NEEDS FIX */}
  <TabsTrigger 
    value="safety" 
    badge={badges.safety}
    badgeVariant={badges.safety > 0 ? "destructive" : "outline"}
  >
    <AlertTriangle className="h-3 w-3" />
    <span>Safety</span>
  </TabsTrigger>
  
  <TabsTrigger value="billing" badge={badges.billing}>
    <DollarSign className="h-3 w-3" />
    <span>Billing</span>
  </TabsTrigger>
  
  <TabsTrigger value="progress" badge={badges.progress}>
    <TrendingUp className="h-3 w-3" />
    <span>Progress</span>
  </TabsTrigger>
</TabsList>
```

### 2. Badge Calculation Pattern

**Badge Logic:**
```typescript
const badges = React.useMemo(() => {
  const safety = insights.safety?.data?.alerts?.filter(
    alert => ['critical', 'high'].includes(alert.severity)
  ).length || 0;

  const billing = insights.billing?.data?.cptCodes?.filter(
    code => code.status === 'pending'
  ).length || 0;

  const progress = insights.progress?.data?.goalProgress?.filter(
    goal => goal.status === 'active'
  ).length || 0;

  return { safety, billing, progress };
}, [insights]);
```

### 3. Tab Content Integration

**Content Structure:**
```typescript
<TabsContent value="tab-name" className="h-full m-0">
  <TabComponent 
    data={insights.tabName?.data}
    isLoading={insights.tabName?.status === 'loading'}
    error={insights.tabName?.error}
    onAction={handleAction}
  />
</TabsContent>
```

## Clinical Note Tab Requirements

### 1. Required Props Interface

```typescript
interface NoteInsightsTabProps {
  data: NoteGenerationInsights | null;
  isLoading?: boolean;
  error?: Error | null;
  onEditSection?: (sectionId: string) => void;
  onRegenerateNote?: () => void;
  onExportNote?: () => void;
  className?: string;
}
```

### 2. Expected Data Structure

```typescript
interface NoteGenerationInsights {
  sections: NoteSection[];
  confidence: InsightConfidence;
}

interface NoteSection {
  type: 'subjective' | 'objective' | 'assessment' | 'plan';
  title: string;
  content: string;
  confidence: number;
}
```

### 3. Progressive Disclosure Strategy

**Tier 1 (Always Visible):**
- Chief Complaint (Subjective section excerpt)
- Overall note confidence
- Quick actions (Edit, Regenerate, Export)

**Tier 2 (Expandable Sections):**
- Full Subjective section
- Objective section
- Assessment section  
- Plan section

**Tier 3 (Section Details):**
- Individual section editing
- Confidence scores per section
- Source transcript references

### 4. Required Icon

**FileText Icon:** `<FileText className="h-3 w-3" />`
- Consistent with other tab iconography
- Represents document/note content appropriately

### 5. Badge Calculation

**Note Tab Badge Logic:**
```typescript
const note = insights.note?.data?.sections?.filter(
  section => section.confidence < 0.8  // Low confidence sections need review
).length || 0;
```

## Key Files Updated for Note Tab

### 1. New File Required:
- `ai-chatbot/components/insights/tabs/note-insights-tab.tsx`

### 2. Files to Modify:
- `ai-chatbot/components/insights/insights-drawer.tsx` - Add 4th tab
- Update grid layout from `grid-cols-3` to dynamic calculation

### 3. Integration Points:
- Tab trigger with FileText icon
- Badge calculation for low-confidence sections
- Content area with ScrollArea container
- Loading/error/empty states following established patterns

## Performance Considerations

### 1. React.memo Optimization

**Memoization Pattern:**
```typescript
const MemoizedNoteInsightsTab = React.memo(NoteInsightsTab, (prevProps, nextProps) => {
  return (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.error === nextProps.error &&
    prevProps.data === nextProps.data &&
    prevProps.className === nextProps.className
  );
});
```

### 2. State Management Optimization

**Minimize Re-renders:**
- Use `useCallback` for event handlers
- Memoize expensive calculations with `useMemo`
- Avoid inline object creation in render

## Accessibility Patterns

### 1. Keyboard Navigation
- Proper `tabIndex` management
- `aria-expanded` for collapsible sections
- Screen reader friendly labels

### 2. Color Contrast
- Sufficient contrast ratios for all text
- Color + text indicators (not color alone)
- High contrast mode compatibility

## Summary

All tab components follow consistent patterns for:
1. **State Management** - Progressive disclosure with expandable sections
2. **UI Structure** - Loading/error/empty states with main content area
3. **Performance** - React.memo optimization and useCallback handlers
4. **Logging** - Comprehensive lifecycle and interaction tracking
5. **Styling** - Badge-based indicators with severity color coding

The note tab implementation should follow these exact patterns for consistency with the existing codebase.

---
**Story 1.2 Status**: ✅ COMPLETE
**Pattern Analysis**: All tab component patterns documented and ready for note tab implementation
**Key Discovery**: InsightsDrawer uses hardcoded `grid-cols-3` requiring dynamic calculation
**Integration Strategy**: Follow SafetyInsightsTab pattern with FileText icon and SOAP section structure
