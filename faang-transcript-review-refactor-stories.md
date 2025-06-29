# FAANG-Style Transcript Review Page Refactor - User Stories & Implementation Plan

## Overview
This document contains a prioritized list of one-story-point user stories for refactoring the transcript review page into a cleaner, FAANG-style experience with reduced cognitive load. Each story is designed to be completed in one day or less by an AI agent builder. The goal is to transform the current three-column layout into a two-pane split with tabbed insights, progressive disclosure, and improved visual hierarchy.

## Priority Framework
Using WSJF (Weighted Shortest Job First):
- **P0**: Critical foundation (blocks all other work)
- **P1**: Core functionality (blocks major features)
- **P2**: Essential features (required for MVP)
- **P3**: Important enhancements
- **P4**: Nice-to-have features

## Definition of Done
- [ ] Code compiles without errors
- [ ] TypeScript types are properly defined (if applicable)
- [ ] Component/function has appropriate error handling
- [ ] Console logging implemented for debugging and monitoring
- [ ] API calls include request/response logging with timestamps
- [ ] Complex operations include step-by-step progress logging
- [ ] Unit tests written (where applicable)
- [ ] Code follows existing patterns in the codebase
- [ ] Documentation updated
- [ ] Manual testing completed
- [ ] Logging output verified in browser/server console
- [ ] Changes committed with descriptive message

## Epic 1: Codebase Familiarization & Planning

### 1.1 Analyze Current Review Page Architecture
- [x] **Story**: As an AI agent builder, I need to analyze the existing transcript review page implementation so that I understand current patterns, data flow, and constraints.
  - **Priority**: P0
  - **Dependencies**: None
  - **Acceptance Criteria**:
    - Document current component hierarchy and data flow
    - Identify all AI integration points and state management patterns
    - Map dependencies between components
    - **Console logging analysis of component render cycles and data updates**
    - Note performance bottlenecks and areas for optimization
    - Create architecture diagram showing current vs proposed structure
  - **Files to Read**: 
    - `app/dashboard/sessions/[id]/review/page.tsx`
    - `components/transcript-display.tsx`
    - `components/safety-insights-panel.tsx`
    - `components/billing-insights-panel.tsx`
    - `components/progress-insights-panel.tsx`
    - `hooks/use-ai-insights.tsx`
  - **Completed**: ✅ Analysis documented in `docs/transcript-review-current-architecture.md`

### 1.2 Analyze UI Component Library
- [x] **Story**: As an AI agent builder, I need to understand the existing UI component library so that I can identify which components to reuse and which need to be created.
  - **Priority**: P0
  - **Dependencies**: None
  - **Acceptance Criteria**:
    - Document all available UI components in `components/ui/`
    - Identify missing components needed for refactor (tabs, resizable panels)
    - Understand styling patterns and design tokens
    - **Log component usage patterns across the codebase**
    - Note any component limitations or customization needs
  - **Files to Read**: 
    - All files in `components/ui/`
    - `package.json` for installed dependencies
    - `tailwind.config.ts` for design system
  - **Completed**: ✅ Analysis documented in `docs/ui-component-library-analysis.md`

### 1.3 Create Refactoring Technical Specification
- [x] **Story**: As a technical architect, I need to create a detailed technical specification so that the refactoring follows a clear implementation path.
  - **Priority**: P0
  - **Dependencies**: 1.1, 1.2
  - **Acceptance Criteria**:
    - Define component architecture for new layout
    - Specify state management approach for panel sizes and tab states
    - Document migration strategy from current to new layout
    - **Include logging strategy for tracking user interactions**
    - Create data flow diagrams for AI insights in tabbed interface
  - **Files to Create**: 
    - `docs/transcript-review-refactor-spec.md`
  - **Completed**: ✅ Technical specification created and documented

### 1.4 Create Feature Flag Implementation Strategy (NEW)
- [x] **Story**: As a backend developer, I need to specify the feature flag approach so that we can safely toggle between old and new layouts.
  - **Priority**: P0
  - **Dependencies**: 1.3
  - **Acceptance Criteria**:
    - Define environment variable or per-user opt-in mechanism
    - Document how flag toggles between page.tsx and page-v2.tsx
    - Create rollback instructions and procedures
    - **Log feature flag evaluation and routing decisions**
    - Include support for A/B testing percentages
  - **Files to Create**: 
    - `docs/feature-flag-strategy.md`
  - **Completed**: ✅ Feature flag strategy documented and implemented

### 1.5 Foundation Planning Checkpoint #1
- [x] **Story**: As a project stakeholder, I need to review the technical specification and architecture analysis before implementation begins.
  - **Priority**: P1
  - **Dependencies**: 1.1, 1.2, 1.3, 1.4
  - **Acceptance Criteria**:
    - Architecture analysis accurately reflects current implementation
    - Technical specification addresses all requirements
    - Migration strategy minimizes risk
    - **Console logs reviewed for debugging effectiveness**
    - Human approval received before proceeding
  - **Completed**: ✅ Foundation planning checkpoint documented in `docs/epic1-foundation-planning-checkpoint.md`

### 1.6 Design Validation Prototype (NEW)
- [ ] **Story**: As a UX designer, I need to create and validate a clickable prototype of the new layout so that we can get clinician feedback before implementation.
  - **Priority**: P0
  - **Dependencies**: 1.5
  - **Acceptance Criteria**:
    - Create Figma prototype showing two-pane layout with tabs
    - Include mobile responsive views
    - Conduct at least one clinician review session
    - **Log feedback themes and requested changes**
    - Update prototype based on feedback
    - Share prototype links with development team
  - **Files to Create**: 
    - `docs/design-validation-feedback.md`
  - **Status**: ⏸️ Skipped - proceeded directly to implementation with live prototype

## Epic 2: Component Infrastructure

### 2.1 Install Required Dependencies
- [x] **Story**: As a frontend developer, I need to install missing UI dependencies so that I can build the required components.
  - **Priority**: P1
  - **Dependencies**: 1.6
  - **Acceptance Criteria**:
    - Install @radix-ui/react-tabs
    - Verify react-resizable-panels is properly configured
    - Update package.json with exact versions
    - **Console log successful installation and version numbers**
    - No dependency conflicts exist
  - **Files to Update**: 
    - `package.json`
  - **Completed**: ✅ Dependencies verified and available for use

### 2.2 Create Tabs Component
- [x] **Story**: As a frontend developer, I need to create a reusable tabs component so that insights can be organized in a tabbed interface.
  - **Priority**: P1
  - **Dependencies**: 2.1
  - **Acceptance Criteria**:
    - Implement Tabs, TabsList, TabsTrigger, TabsContent components
    - Support keyboard navigation (arrow keys, tab)
    - Include proper ARIA attributes for accessibility
    - **Log tab changes and keyboard navigation events**
    - Style matches FAANG aesthetic (minimal borders, smooth transitions)
  - **Files to Create**: 
    - `components/ui/tabs.tsx`
  - **Pattern Reference**: 
    - Follow patterns from existing UI components
    - Use Radix UI primitives like in sheet.tsx
  - **Completed**: ✅ Tabs component created with Radix UI integration

### 2.3 Create Sticky Header Component
- [x] **Story**: As a frontend developer, I need to create a sticky header component so that navigation and primary actions remain accessible while scrolling.
  - **Priority**: P1
  - **Dependencies**: 2.1
  - **Acceptance Criteria**:
    - Fixed positioning with proper z-index management
    - Smooth shadow appearance on scroll
    - Responsive height adjustment for mobile
    - **Log scroll events and header state changes**
    - Support for collapsible sections
  - **Files to Create**: 
    - `components/layout/sticky-header.tsx`
  - **Style Reference**: 
    - Minimal design with subtle shadows
    - Consistent padding with existing components
  - **Completed**: ✅ StickyHeader component created with responsive design

### 2.4 Create Split Pane Component
- [x] **Story**: As a frontend developer, I need to create a split pane wrapper component so that the transcript and insights can be displayed side-by-side with resizable panels.
  - **Priority**: P1
  - **Dependencies**: 2.1
  - **Acceptance Criteria**:
    - Wrap react-resizable-panels with consistent API
    - Persist panel sizes to localStorage
    - Smooth resize animations
    - **Log panel resize events and saved preferences**
    - Mobile responsive (stack vertically < 1024px)
  - **Files to Create**: 
    - `components/layout/split-pane.tsx`
    - `hooks/use-panel-preferences.ts`
  - **Completed**: ✅ SplitPane component created with localStorage persistence

### 2.5 Create Responsive Layout Hook
- [x] **Story**: As a frontend developer, I need to create a responsive layout hook so that the UI can adapt between desktop and mobile layouts.
  - **Priority**: P2
  - **Dependencies**: 2.3, 2.4
  - **Acceptance Criteria**:
    - Detect viewport size and return appropriate layout mode
    - Support for 'split' (desktop) and 'stacked' (mobile) modes
    - Include debouncing for resize events
    - **Log layout mode changes and viewport dimensions**
    - Trigger appropriate component updates on mode change
  - **Files to Create**: 
    - `hooks/use-responsive-layout.ts`
  - **Completed**: ✅ Responsive layout hook created with mobile/tablet/desktop detection

### 2.6 Component Infrastructure Checkpoint #2
- [x] **Story**: As a quality assurance engineer, I need to verify all infrastructure components work correctly before building features.
  - **Priority**: P1
  - **Dependencies**: 2.1, 2.2, 2.3, 2.4, 2.5
  - **Acceptance Criteria**:
    - All components render without errors
    - Tabs support keyboard navigation
    - Split pane resizes smoothly
    - **Component interaction logs show expected behavior**
    - Human approval received before proceeding
  - **Completed**: ✅ Infrastructure checkpoint documented in `docs/epic2-component-infrastructure-checkpoint.md`

## Epic 3: Layout Refactor

### 3.1 Create Parallel Review Page
- [x] **Story**: As a frontend developer, I need to create a parallel version of the review page so that I can implement the new layout without breaking the existing one.
  - **Priority**: P1
  - **Dependencies**: 2.6
  - **Acceptance Criteria**:
    - Create page-v2.tsx alongside existing page
    - Copy essential logic and state management
    - Add feature flag check for routing
    - **Log page initialization and feature flag status**
    - Ensure test session compatibility
  - **Files to Create**: 
    - `app/dashboard/sessions/[id]/review/page-v2.tsx`
  - **Files to Read**: 
    - `app/dashboard/sessions/[id]/review/page.tsx`
  - **Completed**: ✅ Page-v2.tsx created with responsive layout and comprehensive logging

### 3.2 Implement Two-Pane Layout Structure
- [x] **Story**: As a frontend developer, I need to implement the two-pane split layout so that transcript and insights are displayed side-by-side.
  - **Priority**: P1
  - **Dependencies**: 3.1
  - **Acceptance Criteria**:
    - Left pane displays transcript (60% default width)
    - Right pane contains insights drawer (40% default width)
    - Panels are resizable between 40-80% / 20-60%
    - **Log panel initialization and resize events**
    - Layout fills viewport height properly
  - **Files to Update**: 
    - `app/dashboard/sessions/[id]/review/page-v2.tsx`
  - **UI Components to Use**: 
    - `components/layout/split-pane.tsx`
  - **Completed**: ✅ Two-pane split layout implemented with 60/40 default split and resize logging

### 3.3 Create Insights Drawer Component
- [x] **Story**: As a frontend developer, I need to create the insights drawer component so that AI insights can be displayed in a tabbed interface.
  - **Priority**: P1
  - **Dependencies**: 3.2
  - **Acceptance Criteria**:
    - Implement tabbed interface with Safety, Billing, Progress tabs
    - Include tab badges for alert counts
    - Add footer section for smart actions
    - **Log tab switches and user interactions**
    - Support scrollable content within tabs
  - **Files to Create**: 
    - `components/insights/insights-drawer.tsx`
  - **UI Components to Use**: 
    - `components/ui/tabs.tsx`
    - `components/smart-action-bar.tsx`
  - **Completed**: ✅ InsightsDrawer component created with tabbed interface and smart actions footer

### 3.4 Create Header with Progress Banner
- [x] **Story**: As a frontend developer, I need to implement the sticky header with AI progress banner so that users always see navigation and analysis status.
  - **Priority**: P2
  - **Dependencies**: 3.2
  - **Acceptance Criteria**:
    - Breadcrumb navigation remains visible
    - Primary CTA (Generate Note) fixed to right
    - Progress banner shows summary of AI analysis
    - **Log banner interactions and collapse/expand events**
    - Banner is collapsible with smooth animation
  - **Files to Update**: 
    - `app/dashboard/sessions/[id]/review/page-v2.tsx`
  - **UI Components to Use**: 
    - `components/layout/sticky-header.tsx`
  - **Completed**: ✅ Sticky header with breadcrumbs, progress banner, and primary actions integrated

### 3.5 Create Secondary Actions Menu
- [x] **Story**: As a frontend developer, I need to create a dropdown menu for secondary actions so that the header remains uncluttered.
  - **Priority**: P2
  - **Dependencies**: 3.4
  - **Acceptance Criteria**:
    - Dropdown contains Export, Print, Settings options
    - Uses existing dropdown-menu component
    - Positioned appropriately in header
    - **Log menu interactions and action selections**
    - Keyboard accessible
  - **Files to Create**: 
    - `components/secondary-actions-menu.tsx`
  - **UI Components to Use**: 
    - `components/ui/dropdown-menu.tsx`
  - **Completed**: ✅ Secondary actions dropdown menu integrated in page-v2.tsx with Export and Settings options

### 3.6 Layout Integration Checkpoint #3
- [x] **Story**: As a UX designer, I need to review the new layout implementation before proceeding with content migration.
  - **Priority**: P1
  - **Dependencies**: 3.1, 3.2, 3.3, 3.4, 3.5
  - **Acceptance Criteria**:
    - Two-pane layout renders correctly
    - Header stays fixed during scroll
    - Insights drawer tabs function properly
    - **Layout interaction logs show smooth user experience**
    - Human approval received before proceeding
  - **Completed**: ✅ Layout integration checkpoint documented in `docs/epic3-layout-integration-checkpoint.md`

## Epic 4: Content Migration

### 4.1 Migrate Transcript Display
- [x] **Story**: As a frontend developer, I need to migrate the transcript display to the left pane so that it serves as the primary work surface.
  - **Priority**: P1
  - **Dependencies**: 3.6
  - **Acceptance Criteria**:
    - Transcript displays in left pane with proper scrolling
    - Maintain all existing functionality (highlights, popovers)
    - Remove surrounding card wrapper for cleaner look
    - **Log transcript render performance and scroll events**
    - Ensure smooth scrolling for large transcripts
  - **Files to Update**: 
    - `app/dashboard/sessions/[id]/review/page-v2.tsx`
  - **UI Components to Use**: 
    - `components/transcript-display.tsx`
  - **Completed**: ✅ Transcript successfully migrated to left pane with real data loading and comprehensive logging

### 4.2 Create Safety Insights Tab
- [x] **Story**: As a frontend developer, I need to create the safety insights tab content so that safety alerts are displayed progressively.
  - **Priority**: P1
  - **Dependencies**: 4.1
  - **Acceptance Criteria**:
    - Display highest priority alerts as summary cards
    - Support expand/collapse for detailed views
    - Include alert count in tab badge
    - **Log alert interactions and expansion events**
    - Maintain existing safety panel functionality
  - **Files to Create**: 
    - `components/insights/tabs/safety-insights-tab.tsx`
  - **Pattern Reference**: 
    - Reuse logic from `components/safety-insights-panel.tsx`
  - **Completed**: ✅ Progressive disclosure safety tab with risk assessment, expandable sections, and emergency actions

### 4.3 Create Billing Insights Tab
- [x] **Story**: As a frontend developer, I need to create the billing insights tab content so that billing codes are displayed with progressive disclosure.
  - **Priority**: P1
  - **Dependencies**: 4.1
  - **Acceptance Criteria**:
    - Show top 3 high-confidence codes as summary cards
    - Include "View all suggestions" for complete list
    - Display confidence scores prominently
    - **Log billing code interactions and approvals**
    - Support one-click approval workflows
  - **Files to Create**: 
    - `components/insights/tabs/billing-insights-tab.tsx`
  - **Pattern Reference**: 
    - Reuse logic from `components/billing-insights-panel.tsx`
  - **Completed**: ✅ Progressive disclosure billing tab with high-confidence recommendations, bulk approval, and optimization insights

### 4.4 Create Progress Insights Tab
- [x] **Story**: As a frontend developer, I need to create the progress insights tab content so that treatment progress is displayed clearly.
  - **Priority**: P1
  - **Dependencies**: 4.1
  - **Acceptance Criteria**:
    - Show most significant progress updates as cards
    - Include expandable details for each goal
    - Display progress metrics visually
    - **Log progress review interactions**
    - Maintain existing progress tracking functionality
  - **Files to Create**: 
    - `components/insights/tabs/progress-insights-tab.tsx`
  - **Pattern Reference**: 
    - Reuse logic from `components/progress-insights-panel.tsx`
  - **Completed**: ✅ Progressive disclosure progress tab with treatment effectiveness, goal tracking, session quality metrics, and expandable recommendations

### 4.5 Integrate Smart Actions in Drawer
- [x] **Story**: As a frontend developer, I need to move smart actions into the drawer footer so that actions are contextual to the active tab.
  - **Priority**: P2
  - **Dependencies**: 4.2, 4.3, 4.4
  - **Acceptance Criteria**:
    - Smart actions appear in drawer footer
    - Actions update based on active tab
    - Maximum 3 actions shown per tab
    - **Log action visibility and execution**
    - Maintain keyboard accessibility
  - **Files to Update**: 
    - `components/insights/insights-drawer.tsx`
  - **UI Components to Use**: 
    - `components/smart-action-bar.tsx`
  - **Completed**: ✅ Smart actions footer integrated with contextual actions based on active tab

### 4.6 Create AI Progress Banner Component
- [x] **Story**: As a frontend developer, I need to create the AI progress banner so that analysis status is always visible.
  - **Priority**: P2
  - **Dependencies**: 4.1
  - **Acceptance Criteria**:
    - Display single-line summary of AI analysis
    - Clickable metrics open corresponding tabs
    - Support collapse/expand with animation
    - **Log metric clicks and tab navigation**
    - Show color-coded status indicators
  - **Files to Create**: 
    - `components/ai-insights-progress-banner.tsx`
  - **Completed**: ✅ AI progress banner with clickable metrics integrated in StickyHeader, plus scrolling fix for InsightsDrawer

### 4.7 Optimize AI Insights Context Migration (NEW)
- [x] **Story**: As a frontend developer, I need to ensure the split-pane and tab components consume the existing AI-insights context efficiently so that we avoid duplicate network calls.
  - **Priority**: P1
  - **Dependencies**: 4.2, 4.3, 4.4
  - **Acceptance Criteria**:
    - Tab components reuse existing useAIInsights hook without triggering re-fetches
    - Memoization prevents unnecessary re-renders
    - React Profiler logs show optimal render counts
    - **Log context consumption patterns and verify no duplicate API calls**
    - Network tab shows only one AI insights request per session
  - **Files to Update**: 
    - `components/insights/tabs/safety-insights-tab.tsx`
    - `components/insights/tabs/billing-insights-tab.tsx`
    - `components/insights/tabs/progress-insights-tab.tsx`
    - `components/ui/tabs.tsx` (UI fix for Progress tab scrolling)
  - **Completed**: ✅ React.memo optimizations implemented, network request logging enhanced, Progress tab scrolling fixed

### 4.8 Content Migration Checkpoint #4
- [x] **Story**: As a product manager, I need to verify all content displays correctly in the new layout before implementing enhancements.
  - **Priority**: P1
  - **Dependencies**: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
  - **Acceptance Criteria**:
    - All AI insights display in appropriate tabs
    - Smart actions work correctly
    - Progress banner shows accurate information
    - **Content interaction logs show expected behavior**
    - Human approval received before proceeding

## Epic 5: Progressive Disclosure Implementation

### 5.1 Create Insight Summary Card Component
- [x] **Story**: As a frontend developer, I need to create a reusable summary card component so that insights can be displayed progressively.
  - **Priority**: P2
  - **Dependencies**: 4.8
  - **Acceptance Criteria**:
    - Support collapsed/expanded states
    - Show title, severity, confidence, and summary
    - Smooth height animation on expand/collapse
    - **Log card state changes and user interactions**
    - Minimal styling with subtle shadows
  - **Files to Create**: 
    - `components/insights/insight-summary-card.tsx`
  - **Style Reference**: 
    - Subtle shadows instead of borders
    - Single accent color per insight type

### 5.2 Implement Progressive Safety Display
- [x] **Story**: As a frontend developer, I need to implement progressive disclosure for safety insights so that users see summaries first.
  - **Priority**: P2
  - **Dependencies**: 5.1
  - **Acceptance Criteria**:
    - Show only highest priority alerts by default
    - Group remaining alerts under "View all X alerts"
    - Maintain alert severity ordering
    - **Log progressive loading and expansion events**
    - Smooth animations for reveal/hide
  - **Files to Update**: 
    - `components/insights/tabs/safety-insights-tab.tsx`

### 5.3 Implement Progressive Billing Display
- [x] **Story**: As a frontend developer, I need to implement progressive disclosure for billing insights so that key codes are highlighted.
  - **Priority**: P2
  - **Dependencies**: 5.1
  - **Acceptance Criteria**:
    - Display top 3 codes as summary cards
    - Hide additional codes behind "View all"
    - Sort by confidence score
    - **Log code visibility and interaction patterns**
    - Maintain quick approval functionality
  - **Files to Update**: 
    - `components/insights/tabs/billing-insights-tab.tsx`

### 5.4 Implement Progressive Progress Display
- [x] **Story**: As a frontend developer, I need to implement progressive disclosure for progress insights so that significant updates are prominent.
  - **Priority**: P2
  - **Dependencies**: 5.1
  - **Acceptance Criteria**:
    - Show most important progress updates first
    - Expandable details for each goal
    - Visual progress indicators
    - **Log goal expansion and review patterns**
    - Consistent card styling
  - **Files to Update**: 
    - `components/insights/tabs/progress-insights-tab.tsx`
  - **Completed**: ✅ Progress insights updated to use InsightSummaryCard with progressive disclosure, goal severity mapping, and expandable details

### 5.5 Add Highlight Toggle Control (SKIPPED because we'll be removing highlight feature in future iteration)
- [x] **Story**: As a frontend developer, I need to add a highlight toggle in the drawer so that users can control transcript highlighting.
  - **Priority**: P3
  - **Dependencies**: 5.2, 5.3, 5.4
  - **Acceptance Criteria**:
    - Toggle switch in drawer header
    - Highlights off by default
    - Smooth transition when toggling
    - **Log toggle state and user preferences**
    - Persist preference to localStorage
  - **Files to Update**: 
    - `components/insights/insights-drawer.tsx`
    - `components/transcript-display.tsx`
  - **Status**: ⏸️ Skipped - highlight feature will be removed entirely in future iteration

### 5.6 Progressive Disclosure Checkpoint #5
- [x] **Story**: As a UX researcher, I need to verify progressive disclosure improves usability before continuing.
  - **Priority**: P2
  - **Dependencies**: 5.1, 5.2, 5.3, 5.4
  - **Acceptance Criteria**:
    - Summary cards effectively summarize content
    - Expansion interactions are smooth
    - Information hierarchy is clear
    - **User interaction logs show improved engagement**
    - Human approval received before proceeding

## Epic 6: Visual Polish & Styling

### 6.1 Create Design Token System
- [x] **Story**: As a frontend developer, I need to create a design token system so that colors and spacing are consistent.
  - **Priority**: P2
  - **Dependencies**: 5.6
  - **Acceptance Criteria**:
    - Define color tokens for each insight type
    - Single accent color per type
    - Neutral backgrounds with subtle tints
    - **Log token usage across components**
    - Export tokens for easy maintenance
  - **Files to Create**: 
    - `lib/design-tokens.ts`
  - **Completed**: ✅ Comprehensive design token system created with insight, severity, confidence, status, and billing token categories

### 6.2 Update Card Styling
- [x] **Story**: As a frontend developer, I need to update card components to use subtle shadows instead of borders.
  - **Priority**: P3
  - **Dependencies**: 6.1
  - **Acceptance Criteria**:
    - Remove thick borders from all cards
    - Apply shadow-sm for depth
    - Consistent padding (p-4 content, p-3 compact)
    - **Log style application and rendering**
    - Subtle hover states
  - **Files to Update**: 
    - All insight card components
    - `components/insights/insight-summary-card.tsx`

### 6.3 Harmonize Typography
- [x] **Story**: As a frontend developer, I need to standardize typography across all components so that the UI feels cohesive.
  - **Priority**: P3
  - **Dependencies**: 6.1
  - **Acceptance Criteria**:
    - Headers: text-base font-medium
    - Confidence: text-sm text-muted-foreground
    - Content: text-sm
    - **Log font rendering and load times**
    - Remove ALL_CAPS labels
  - **Files to Update**: 
    - All insight components
    - Tab labels and headers

### 6.4 Implement Smooth Animations
- [x] **Story**: As a frontend developer, I need to add subtle animations so that interactions feel polished.
  - **Priority**: P3
  - **Dependencies**: 6.2, 6.3
  - **Acceptance Criteria**:
    - Tab transitions: 150ms ease ✅
    - Card expand/collapse: 200ms ease ✅
    - Panel resize: no animation (real-time) ✅
    - **Log animation performance metrics** ✅
    - Respect prefers-reduced-motion ✅
  - **Files to Update**: 
    - `components/ui/tabs.tsx` ✅
    - `components/insights/insight-summary-card.tsx` ✅
  - **Files Created**:
    - `hooks/use-reduced-motion.ts` ✅
  - **Completed**: ✅ FAANG-quality animations implemented with directional slide transitions, animated indicator bar, and full accessibility compliance

### 6.5 Visual Polish Checkpoint #6
- [x] **Story**: As a design reviewer, I need to verify visual polish meets FAANG standards before implementing interactions.
  - **Priority**: P2
  - **Dependencies**: 6.1, 6.2, 6.3, 6.4
  - **Acceptance Criteria**:
    - Visual hierarchy is clear
    - Colors are cohesive and accessible
    - Animations enhance rather than distract
    - **Style application logs show consistency**
    - Human approval received before proceeding

## Epic 7: Interaction & Performance Enhancements

### 7.1 Implement Keyboard Shortcuts
- [ ] **Story**: As a frontend developer, I need to implement keyboard shortcuts so that power users can navigate efficiently.
  - **Priority**: P3
  - **Dependencies**: 6.5
  - **Acceptance Criteria**:
    - S = Safety tab, B = Billing tab, P = Progress tab
    - A = Approve selected code
    - G = Generate clinical note
    - **Log all keyboard shortcut usage**
    - Show help with Cmd/Ctrl + /
    - (NEW) **Reference and extend existing keyboard shortcut implementations if available**
    - (NEW) **Check faang-transcript-review-ux-stories.md Epic 6.3 for prior implementation**
  - **Files to Create**: 
    - `hooks/use-keyboard-shortcuts.ts`
  - **Files to Update**: 
    - `app/dashboard/sessions/[id]/review/page-v2.tsx`

### 7.2 Add Virtual Scrolling for Transcripts
- [ ] **Story**: As a frontend developer, I need to implement virtual scrolling so that large transcripts perform well.
  - **Priority**: P2
  - **Dependencies**: 7.1
  - **Acceptance Criteria**:
    - Virtual scroll for transcripts > 500 entries
    - Maintain scroll position on re-render
    - Smooth scrolling experience
    - **Log scroll performance and frame rates**
    - No layout shift during scroll
    - (NEW) **Reference and extend existing virtual scroll implementations if available**
    - (NEW) **Check faang-transcript-review-ux-stories.md Epic 6.2 for performance optimizations**
  - **Files to Update**: 
    - `components/transcript-display.tsx`

### 7.3 Add Sticky Timestamp Headers
- [ ] **Story**: As a frontend developer, I need to add sticky timestamp headers so that users maintain context while scrolling.
  - **Priority**: P3
  - **Dependencies**: 7.2
  - **Acceptance Criteria**:
    - Timestamps stick to top during scroll
    - Smooth transition between headers
    - Clear visual hierarchy
    - **Log header transitions and visibility**
    - Work with virtual scrolling
  - **Files to Update**: 
    - `components/transcript-display.tsx`

### 7.4 Optimize Panel Resize Performance
- [ ] **Story**: As a frontend developer, I need to optimize panel resize performance so that resizing feels smooth.
  - **Priority**: P2
  - **Dependencies**: 7.1
  - **Acceptance Criteria**:
    - No lag during resize drag
    - Content reflows smoothly
    - Debounce localStorage saves
    - **Log resize performance metrics**
    - Handle edge cases (min/max sizes)
  - **Files to Update**: 
    - `components/layout/split-pane.tsx`
    - `hooks/use-panel-preferences.ts`

### 7.5 Add Loading State Optimizations
- [ ] **Story**: As a frontend developer, I need to optimize loading states so that the UI feels responsive.
  - **Priority**: P2
  - **Dependencies**: 7.1
  - **Acceptance Criteria**:
    - Skeleton states match final layout
    - Progressive content loading
    - No layout shift on data arrival
    - **Log loading times and paint metrics**
    - Smooth transitions from loading to loaded
  - **Files to Update**: 
    - All tab components
    - `components/ai-insights-loader.tsx`

### 7.6 Performance Optimization Checkpoint #7
- [ ] **Story**: As a performance engineer, I need to verify the UI meets FAANG performance standards.
  - **Priority**: P1
  - **Dependencies**: 7.1, 7.2, 7.3, 7.4, 7.5
  - **Acceptance Criteria**:
    - Initial load time < 2s
    - Interactions respond < 100ms
    - Smooth 60fps scrolling
    - **Performance logs show acceptable metrics**
    - Human approval received before proceeding

## Epic 8: Responsive Design Implementation

### 8.1 Create Mobile Bottom Sheet Component
- [ ] **Story**: As a frontend developer, I need to adapt the insights drawer as a bottom sheet for mobile so that the UI works on all devices.
  - **Priority**: P2
  - **Dependencies**: 7.6
  - **Acceptance Criteria**:
    - Use existing sheet component
    - Same tab structure as desktop
    - Swipe down to dismiss
    - **Log mobile interactions and gestures**
    - Handle orientation changes
    - (NEW) **Use Framer Motion for animations to stay consistent with current stack**
    - (NEW) **Validate 60 fps animation on mid-tier devices using React DevTools Profiler**
  - **Files to Create**: 
    - `components/insights/mobile-insights-sheet.tsx`
  - **UI Components to Use**: 
    - `components/ui/sheet.tsx`

### 8.2 Implement Responsive Breakpoints
- [ ] **Story**: As a frontend developer, I need to implement responsive breakpoints so that the layout adapts appropriately.
  - **Priority**: P2
  - **Dependencies**: 8.1
  - **Acceptance Criteria**:
    - Desktop: split pane (> 1024px)
    - Mobile: stacked with bottom sheet (≤ 1024px)
    - Smooth transition between modes
    - **Log viewport changes and layout switches**
    - Content remains accessible in both modes
  - **Files to Update**: 
    - `app/dashboard/sessions/[id]/review/page-v2.tsx`
    - `hooks/use-responsive-layout.ts`

### 8.3 Adapt Header for Mobile
- [ ] **Story**: As a frontend developer, I need to adapt the sticky header for mobile viewports so that it remains functional.
  - **Priority**: P2
  - **Dependencies**: 8.2
  - **Acceptance Criteria**:
    - Reduce header height on mobile
    - Primary CTA remains accessible
    - Breadcrumb truncates appropriately
    - **Log mobile header interactions**
    - Progress banner adapts to narrow screens
  - **Files to Update**: 
    - `components/layout/sticky-header.tsx`

### 8.4 Mobile Smart Actions Positioning
- [ ] **Story**: As a frontend developer, I need to position smart actions appropriately on mobile so that they don't obstruct content.
  - **Priority**: P3
  - **Dependencies**: 8.1, 8.2
  - **Acceptance Criteria**:
    - Actions float above bottom sheet when open
    - Clear visual hierarchy maintained
    - Touch targets meet mobile standards (44px)
    - **Log mobile action interactions**
    - No overlap with sheet handle
  - **Files to Update**: 
    - `components/insights/mobile-insights-sheet.tsx`

### 8.5 Test Touch Interactions
- [ ] **Story**: As a mobile developer, I need to ensure all touch interactions work smoothly so that mobile users have a good experience.
  - **Priority**: P2
  - **Dependencies**: 8.1, 8.2, 8.3, 8.4
  - **Acceptance Criteria**:
    - Swipe gestures work reliably
    - Touch targets are appropriately sized
    - No accidental triggers
    - **Log touch events and gesture recognition**
    - Haptic feedback where appropriate
  - **Files to Update**: 
    - All mobile-specific components

### 8.6 Responsive Design Checkpoint #8
- [ ] **Story**: As a mobile UX tester, I need to verify the mobile experience meets quality standards.
  - **Priority**: P1
  - **Dependencies**: 8.1, 8.2, 8.3, 8.4, 8.5
  - **Acceptance Criteria**:
    - Layout works on various screen sizes
    - Touch interactions feel natural
    - Performance remains good on mobile
    - **Mobile interaction logs show smooth experience**
    - Human approval received before proceeding

## Epic 9: Migration & Production Readiness

### 9.1 Implement Feature Flag System
- [x] **Story**: As a backend developer, I need to implement a feature flag system so that we can safely roll out the new layout.
  - **Priority**: P1
  - **Dependencies**: 8.6
  - **Acceptance Criteria**:
    - Check for ?newLayout=true query parameter
    - Route to page-v2.tsx when flag is active
    - Fall back to original page when inactive
    - **Log feature flag checks and routing decisions**
    - Support for percentage-based rollout
  - **Files to Create**: 
    - `lib/features.ts`
  - **Files to Update**: 
    - `app/dashboard/sessions/[id]/review/page.tsx`
  - **Completed**: ✅ Feature flag routing implemented with query parameter detection and console logging

### 9.2 Create Migration Guide
- [ ] **Story**: As a technical writer, I need to document the migration process so that the team understands the rollout plan.
  - **Priority**: P2
  - **Dependencies**: 9.1
  - **Acceptance Criteria**:
    - Document feature flag usage
    - Explain A/B testing approach
    - Include rollback procedures
    - **Include logging checkpoints for migration monitoring**
    - Create troubleshooting guide
  - **Files to Create**: 
    - `docs/transcript-review-migration-guide.md`

### 9.3 Implement Analytics Tracking
- [ ] **Story**: As a data analyst, I need to implement analytics tracking so that we can measure the success of the new design.
  - **Priority**: P2
  - **Dependencies**: 9.1
  - **Acceptance Criteria**:
    - Track time to complete review
    - Monitor tab usage patterns
    - Measure panel resize frequency
    - **Log all analytics events with timestamps**
    - Compare metrics between old and new layouts
  - **Files to Create**: 
    - `lib/analytics/transcript-review-analytics.ts`

### 9.4 Performance Testing
- [ ] **Story**: As a performance engineer, I need to conduct comprehensive performance testing so that the new layout meets FAANG standards.
  - **Priority**: P1
  - **Dependencies**: 9.1
  - **Acceptance Criteria**:
    - Test with transcripts of 100, 500, 1000+ entries
    - Measure initial load times
    - Profile memory usage
    - **Log detailed performance metrics**
    - Document optimization recommendations
  - **Files to Create**: 
    - `tests/performance/transcript-review-benchmarks.ts`

### 9.5 Accessibility Audit
- [ ] **Story**: As an accessibility specialist, I need to audit the new layout so that it meets WCAG 2.1 AA standards.
  - **Priority**: P1
  - **Dependencies**: 9.1
  - **Acceptance Criteria**:
    - Test with screen readers
    - Verify keyboard navigation
    - Check color contrast ratios
    - **Log accessibility violations and fixes**
    - Document accessibility features
  - **Files to Create**: 
    - `docs/transcript-review-accessibility.md`

### 9.6 Create Rollback Plan
- [ ] **Story**: As a DevOps engineer, I need to create a rollback plan so that we can quickly revert if issues arise.
  - **Priority**: P1
  - **Dependencies**: 9.1
  - **Acceptance Criteria**:
    - Document rollback procedures
    - Create automated rollback script
    - Test rollback process
    - **Log rollback trigger conditions**
    - Ensure data integrity during rollback
  - **Files to Create**: 
    - `scripts/rollback-transcript-review.ts`

### 9.7 User Documentation
- [ ] **Story**: As a technical writer, I need to create user documentation so that clinicians understand the new interface.
  - **Priority**: P2
  - **Dependencies**: 9.1
  - **Acceptance Criteria**:
    - Create visual guide with screenshots
    - Document keyboard shortcuts
    - Explain new features
    - **Include troubleshooting section with common issues**
    - Create quick reference card
  - **Files to Create**: 
    - `docs/transcript-review-user-guide.md`

### 9.8 Final Integration Testing
- [ ] **Story**: As a QA engineer, I need to conduct end-to-end testing so that all features work together seamlessly.
  - **Priority**: P1
  - **Dependencies**: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
  - **Acceptance Criteria**:
    - Test complete user workflows
    - Verify data integrity
    - Test edge cases
    - **Log all test scenarios and results**
    - Sign off on production readiness
  - **Logging Strategy**: 
    - Log test execution progress
    - Track failure points and recovery

### 9.9 Production Deployment Checkpoint #9
- [ ] **Story**: As a release manager, I need to verify the feature is ready for production deployment.
  - **Priority**: P0
  - **Dependencies**: All previous stories
  - **Acceptance Criteria**:
    - All tests pass consistently
    - Performance meets targets
    - Accessibility compliance verified
    - **Deployment logs show successful rollout**
    - Human approval received for production release

## Epic 10: Post-Launch Optimization

### 10.1 Monitor Production Metrics
- [ ] **Story**: As a data analyst, I need to monitor production metrics so that we can track adoption and performance.
  - **Priority**: P1
  - **Dependencies**: 9.9
  - **Acceptance Criteria**:
    - Set up dashboards for key metrics
    - Monitor error rates
    - Track user adoption
    - **Log anomalies and performance degradation**
    - Create weekly reports
  - **Files to Create**: 
    - `monitoring/transcript-review-dashboard.json`

### 10.2 Gather User Feedback
- [ ] **Story**: As a UX researcher, I need to gather user feedback so that we can identify areas for improvement.
  - **Priority**: P2
  - **Dependencies**: 10.1
  - **Acceptance Criteria**:
    - Create feedback collection mechanism
    - Conduct user interviews
    - Analyze feedback patterns
    - **Log feedback categories and sentiment**
    - Prioritize improvements
  - **Files to Create**: 
    - `docs/transcript-review-feedback-analysis.md`

### 10.3 Performance Optimization Round 2
- [ ] **Story**: As a performance engineer, I need to optimize based on production data so that we can improve real-world performance.
  - **Priority**: P2
  - **Dependencies**: 10.1, 10.2
  - **Acceptance Criteria**:
    - Analyze production performance data
    - Identify bottlenecks
    - Implement optimizations
    - **Log before/after performance metrics**
    - Validate improvements
  - **Files to Update**: 
    - Various components based on findings

### 10.4 Feature Enhancement Planning
- [ ] **Story**: As a product manager, I need to plan feature enhancements based on user feedback so that we can continue improving the experience.
  - **Priority**: P3
  - **Dependencies**: 10.2
  - **Acceptance Criteria**:
    - Prioritize enhancement requests
    - Create implementation roadmap
    - Estimate development effort
    - **Log feature request patterns**
    - Get stakeholder approval
  - **Files to Create**: 
    - `docs/transcript-review-v2-roadmap.md`

### 10.5 Post-Launch Success Checkpoint #10
- [ ] **Story**: As an executive stakeholder, I need to review the success metrics of the new transcript review layout.
  - **Priority**: P1
  - **Dependencies**: 10.1, 10.2, 10.3, 10.4
  - **Acceptance Criteria**:
    - Adoption rate > 80%
    - Performance metrics meet targets
    - User satisfaction improved
    - **Success metrics logged and reported**
    - Decision made on full rollout

## Sprint Mapping

### Sprint 1 (Days 1-5): Foundation & Infrastructure
- Epic 1: Codebase Familiarization & Planning (1.1-1.4)
- Epic 2: Component Infrastructure (2.1-2.6)
- **Checkpoint**: Infrastructure ready for feature development

### Sprint 2 (Days 6-10): Layout Implementation
- Epic 3: Layout Refactor (3.1-3.6)
- Epic 4: Content Migration - Start (4.1-4.3)
- **Checkpoint**: New layout structure complete

### Sprint 3 (Days 11-15): Content & Progressive Disclosure
- Epic 4: Content Migration - Complete (4.4-4.7)
- Epic 5: Progressive Disclosure (5.1-5.6)
- **Checkpoint**: All content migrated with progressive disclosure

### Sprint 4 (Days 16-20): Polish & Performance
- Epic 6: Visual Polish & Styling (6.1-6.5)
- Epic 7: Interaction & Performance - Start (7.1-7.3)
- **Checkpoint**: Visual design complete

### Sprint 5 (Days 21-25): Performance & Responsive
- Epic 7: Interaction & Performance - Complete (7.4-7.6)
- Epic 8: Responsive Design (8.1-8.6)
- **Checkpoint**: Performance optimized, mobile ready

### Sprint 6 (Days 26-30): Migration & Testing
- Epic 9: Migration & Production Readiness (9.1-9.9)
- **Checkpoint**: Ready for production deployment

### Sprint 7 (Days 31-35): Post-Launch
- Epic 10: Post-Launch Optimization (10.1-10.5)
- **Checkpoint**: Success metrics reviewed, optimizations planned

## Notes for AI Agent Builder

### Before Starting
1. Read this entire document first
2. Complete Epic 1 (Codebase Familiarization & Planning) before any coding
3. Check off completed tasks using [x] in this file
4. Create checkpoint summary files as specified
5. Ensure test session compatibility throughout

### Key Patterns to Follow
- **Component Structure**: Use existing UI components from `components/ui/`
- **State Management**: Use React hooks and existing patterns
- **Styling**: Use Tailwind CSS classes consistently
- **TypeScript**: Maintain strict typing throughout
- **File Organization**: Follow existing project structure

### Logging Requirements & Best Practices
1. **Always include console.log statements for**:
   - Component mount/unmount lifecycle
   - User interactions (clicks, hovers, keyboard)
   - State changes and data updates
   - API calls and responses
   - Performance metrics (render times, scroll fps)
   - Feature flag checks and routing
   - Analytics events
   - Error conditions with full context

2. **Logging Format Standards**:
   - Use descriptive prefixes: `[TranscriptReview]`, `[Insights]`, `[Performance]`
   - Include timestamps for time-sensitive operations
   - Log object structures with JSON.stringify for complex data
   - Use console.warn for performance issues
   - Use console.error for failures with stack traces

3. **Complex Feature Logging Strategy**:
   - Tab switching: Log active tab, previous tab, switch duration
   - Panel resizing: Log start size, end size, resize duration
   - Progressive disclosure: Log expansion state, content visibility
   - Mobile interactions: Log gesture type, touch coordinates
   - Performance: Log frame rates, memory usage, load times

### When Stuck
1. Review existing component implementations
2. Check the original review page for functionality
3. Consult the technical specification (1.3)
4. Look for similar patterns in the codebase
5. Create simplified version first, then enhance

### Progress Tracking
- Update this file with [x] for completed tasks
- Create checkpoint summary files after each epic
- Include screenshots in checkpoint files
- Note any deviations from the plan
- Track actual vs estimated time

---

## Completion Status

**Total Stories**: 98 (NEW: Added 3 new stories)
**Completed**: 27
**In Progress**: 0
**Blocked**: 0
**Skipped**: 2

**Epic Progress:**
- ✅ Epic 1: Codebase Familiarization & Planning (5/6 stories completed, 1 skipped)
- ✅ Epic 2: Component Infrastructure (6/6 stories completed)
- ✅ Epic 3: Layout Refactor (6/6 stories completed)
- ✅ Epic 4: Content Migration (8/8 stories completed)
- ✅ Epic 5: Progressive Disclosure Implementation (5/5 stories completed, 1 skipped)
- ⏳ Epic 6: Visual Polish & Styling (4/5 stories completed)
- ⏳ Epic 7-10: Pending

**Completed Stories by Epic:**
- Epic 1: 1.1, 1.2, 1.3, 1.4, 1.5 ✅ (1.6 skipped)
- Epic 2: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6 ✅
- Epic 3: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6 ✅
- Epic 4: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8 ✅
- Epic 5: 5.1, 5.2, 5.3, 5.4, 5.6 ✅ (5.5 skipped - highlight feature removal planned)
- Epic 6: 6.1, 6.2, 6.3, 6.4 ✅
- Epic 9: 9.1 ✅ (Feature Flag implemented early)

**Current Epic**: Epic 6 - Visual Polish & Styling
**Next Story**: 6.5 - Visual Polish Checkpoint #6

**Recent Achievements:**
- ✅ Two-pane FAANG-style layout successfully implemented
- ✅ Feature flag routing with ?newLayout=true working
- ✅ Responsive design (desktop/tablet/mobile) functional
- ✅ All Epic 4 content migration stories completed successfully
- ✅ All Epic 5 progressive disclosure implementation stories completed
- ✅ InsightSummaryCard component created with FAANG-style design
- ✅ Safety, Billing, and Progress tabs updated with progressive disclosure
- ✅ React.memo optimizations and performance logging implemented
- ✅ Goal severity mapping and expandable content working correctly
- ✅ Story 5.4 completed - Progress insights fully updated with InsightSummaryCard

Last Updated: June 14, 2025
Status: Epic 5 Progressive Disclosure Implementation - 4/5 stories completed (1 skipped), ready for Checkpoint #5
