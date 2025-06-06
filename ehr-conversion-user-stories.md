# EHR System Conversion - User Stories & Implementation Plan

## Overview
This document contains a prioritized list of one-story-point user stories for converting the existing Next.js chatbot application into a healthcare EHR system with AI-powered medical documentation. Each story is designed to be completed in one day or less by an AI agent builder.

## Priority Framework
Using WSJF (Weighted Shortest Job First):
- **P0**: Critical foundation (blocks all other work)
- **P1**: Core functionality (blocks major features)
- **P2**: Essential features (required for MVP)
- **P3**: Important enhancements
- **P4**: Nice-to-have features

## Definition of Done
- [ ] Code compiles without errors
- [ ] TypeScript types are properly defined
- [ ] Component/function has appropriate error handling
- [ ] Unit tests written (where applicable)
- [ ] Code follows existing patterns in the codebase
- [ ] Documentation updated
- [ ] Manual testing completed
- [ ] Changes committed with descriptive message

---

## Epic 1: Codebase Familiarization & Planning

### 1.1 Initial Codebase Analysis
- [x] **Story**: As an AI builder, I need to understand the existing codebase structure so that I can make informed implementation decisions.
  - **Priority**: P0
  - **Acceptance Criteria**:
    - Document the current folder structure in a `codebase-analysis.md` file
    - List all major dependencies from `package.json` with their purposes
    - Identify and document the authentication flow
    - Map out the current routing structure
    - Document the existing database schema
  - **Files to Read**:
    - `/ai-chatbot/package.json`
    - `/ai-chatbot/app/layout.tsx`
    - `/ai-chatbot/app/(chat)/layout.tsx`
    - `/ai-chatbot/lib/db/schema.ts`
    - `/ai-chatbot/app/(auth)/auth.ts`
    - `/ai-chatbot/middleware.ts`

### 1.2 Component Inventory
- [x] **Story**: As an AI builder, I need to catalog all reusable UI components so that I can maintain consistency.
  - **Priority**: P0
  - **Acceptance Criteria**:
    - Create `component-inventory.md` listing all components in `/components/ui/`
    - Document props and usage examples for each component
    - Identify shadcn/ui components already integrated
    - Note any custom styling patterns
  - **Files to Read**:
    - All files in `/ai-chatbot/components/ui/`
    - `/ai-chatbot/components.json`
    - `/ai-chatbot/tailwind.config.ts`

### 1.3 AI Integration Analysis
- [x] **Story**: As an AI builder, I need to understand the current AI implementation so that I can extend it for medical use.
  - **Priority**: P0
  - **Acceptance Criteria**:
    - Document current AI providers and models used
    - Map out the chat flow and message handling
    - Identify streaming implementation patterns
    - Document any custom AI tools already implemented
  - **Files to Read**:
    - `/ai-chatbot/lib/ai/models.ts`
    - `/ai-chatbot/lib/ai/providers.ts`
    - `/ai-chatbot/app/(chat)/api/chat/route.ts`
    - `/ai-chatbot/components/chat.tsx`

### 1.4 Progress Checkpoint #1
- [x] **Story**: As an AI builder, I need to mark completed analysis tasks and create a summary.
  - **Priority**: P0
  - **Acceptance Criteria**:
    - Update this file marking completed tasks with [x]
    - Create `checkpoint-1-summary.md` with key findings
    - List any blockers or concerns discovered
    - Commit all documentation files

---

## Epic 2: Database Schema Evolution

### 2.1 Healthcare Schema Design
- [x] **Story**: As a developer, I need to design the healthcare-specific database schema so that we can store medical data properly.
  - **Priority**: P0
  - **Dependencies**: 1.1, 1.3
  - **Acceptance Criteria**:
    - Create `db-schema-design.md` with proposed schema
    - Include all tables from the conversion plan
    - Define relationships and constraints
    - Consider HIPAA compliance requirements
  - **Context**: Read `/ai-chatbot/lib/db/schema.ts` first

### 2.2 Migration File Creation
- [x] **Story**: As a developer, I need to create database migration files for new healthcare tables.
  - **Priority**: P1
  - **Dependencies**: 2.1
  - **Acceptance Criteria**:
    - Create migration file for Patient table
    - Create migration file for Provider table
    - Create migration file for Session table
    - Use Drizzle migration patterns from existing files
  - **Files to Reference**:
    - `/ai-chatbot/drizzle.config.ts`
    - `/ai-chatbot/lib/db/migrations/` (all existing migrations)
    - `/ai-chatbot/lib/db/migrate.ts`

### 2.3 Schema Type Definitions
- [x] **Story**: As a developer, I need to update TypeScript types for the new schema.
  - **Priority**: P1
  - **Dependencies**: 2.2
  - **Acceptance Criteria**:
    - Add new table definitions to `schema.ts`
    - Export TypeScript types for each table
    - Maintain consistency with existing patterns
  - **Files to Update**:
    - `/ai-chatbot/lib/db/schema.ts`

### 2.4 Human Testing Checkpoint #2
- [x] **Story**: As a product owner, I need to review the database schema before implementation.
  - **Priority**: P1
  - **Dependencies**: 2.1-2.3
  - **Acceptance Criteria**:
    - Schema documentation is complete and clear
    - All healthcare entities are properly modeled
    - Relationships make logical sense
    - Human approval received before proceeding

---

## Epic 3: Navigation & Layout Transformation

### 3.1 Navigation Planning
- [x] **Story**: As an AI builder, I need to understand the new navigation requirements.
  - **Priority**: P1
  - **Dependencies**: 1.2
  - **Acceptance Criteria**:
    - Create `navigation-plan.md` mapping old nav to new
    - List all 8 navigation items with icons and routes
    - Document required role-based access for each
  - **Files to Read**:
    - `/ai-chatbot/components/app-sidebar.tsx`
    - `/ai-chatbot/product_vision.md` (navigation section)

### 3.2 Icon Selection
- [x] **Story**: As a developer, I need to identify or import appropriate medical icons.
  - **Priority**: P2
  - **Dependencies**: 3.1
  - **Acceptance Criteria**:
    - Document which lucide-react icons to use
    - List any custom icons needed
    - Create icon mapping for all nav items
  - **Files to Reference**:
    - `/ai-chatbot/components/icons.tsx`

### 3.3 Sidebar Component Update
- [x] **Story**: As a developer, I need to update the sidebar with healthcare navigation.
  - **Priority**: P2
  - **Dependencies**: 3.1, 3.2
  - **Acceptance Criteria**:
    - Replace chat navigation with healthcare items
    - Implement collapsible sidebar (60px → 220px)
    - Add tooltips for collapsed state
    - Maintain existing sidebar patterns
  - **Files to Update**:
    - `/ai-chatbot/components/app-sidebar.tsx`

### 3.4 Top Bar Creation
- [x] **Story**: As a developer, I need to create the top bar component.
  - **Priority**: P2
  - **Dependencies**: 3.2
  - **Acceptance Criteria**:
    - Create `TopBar` component with quick-add, search, profile, status
    - Implement using existing UI components
    - Add connection status indicators
    - Style consistently with existing theme
  - **Files to Create**:
    - `/ai-chatbot/components/top-bar.tsx`

### 3.5 Layout Integration
- [x] **Story**: As a developer, I need to integrate the new navigation into layouts.
  - **Priority**: P2
  - **Dependencies**: 3.3, 3.4
  - **Acceptance Criteria**:
    - Update main layout with top bar
    - Ensure sidebar works with new structure
    - Add right-side drawer container
    - Test responsive behavior
  - **Files to Update**:
    - `/ai-chatbot/app/(chat)/layout.tsx`

### 3.6 Progress Checkpoint #3
- [x] **Story**: As an AI builder, I need to test navigation and document progress.
  - **Priority**: P2
  - **Dependencies**: 3.1-3.5
  - **Acceptance Criteria**:
    - Run `npm run dev` and test navigation
    - Take screenshots of new layout
    - Update this file with completed tasks
    - Document any issues in `checkpoint-3-issues.md`

---

## Epic 4: Today View Implementation

### 4.1 Route Setup
- [x] **Story**: As a developer, I need to create the Today view route.
  - **Priority**: P2
  - **Dependencies**: 3.5
  - **Acceptance Criteria**:
    - Create new route at `/app/(dashboard)/today/page.tsx`
    - Set up proper folder structure
    - Add route to navigation
  - **Pattern Reference**:
    - `/ai-chatbot/app/(chat)/page.tsx`

### 4.2 Session Card Component
- [x] **Story**: As a developer, I need to create a reusable session card component.
  - **Priority**: P2
  - **Dependencies**: 1.2
  - **Acceptance Criteria**:
    - Create `SessionCard` component
    - Display patient photo, name, service type
    - Add location icon (office/virtual)
    - Include "Start Session" button
  - **UI Components to Use**:
    - Card from `/components/ui/card.tsx`
    - Button from `/components/ui/button.tsx`

### 4.3 Time Savings Banner
- [x] **Story**: As a developer, I need to implement the time savings hero banner.
  - **Priority**: P3
  - **Dependencies**: 4.1
  - **Acceptance Criteria**:
    - Create banner showing weekly time saved
    - Use existing card component styling
    - Add animation for number changes
    - Pull mock data for now
  - **Style Reference**:
    - Review existing toast/banner patterns

### 4.4 Session List Implementation
- [x] **Story**: As a developer, I need to display the daily session list.
  - **Priority**: P2
  - **Dependencies**: 4.2
  - **Acceptance Criteria**:
    - Fetch and display sessions chronologically
    - Use SessionCard component
    - Add empty state for no sessions
    - Implement loading skeleton
  - **Pattern Reference**:
    - `/ai-chatbot/components/sidebar-history.tsx` for list patterns

### 4.5 Human Testing Checkpoint #4
- [x] **Story**: As a product owner, I need to review the Today view UI.
  - **Priority**: P2
  - **Dependencies**: 4.1-4.4
  - **Acceptance Criteria**:
    - Today view matches product vision
    - Navigation works correctly
    - UI is responsive
    - Feedback documented and incorporated

---

## Epic 5: Live Session Foundation

### 5.1 Session Context Setup
- [x] **Story**: As an AI builder, I need to understand video integration requirements.
  - **Priority**: P2
  - **Dependencies**: 1.3
  - **Acceptance Criteria**:
    - Research Zoom SDK requirements
    - Document integration approach
    - Create `video-integration-plan.md`
    - List required API keys/configs

### 5.2 Session State Management
- [x] **Story**: As a developer, I need to create session state management.
  - **Priority**: P2
  - **Dependencies**: 5.1
  - **Acceptance Criteria**:
    - Create session context/store
    - Handle session lifecycle states
    - Implement using existing patterns
  - **Pattern Reference**:
    - `/ai-chatbot/hooks/use-chat.tsx` for state patterns

### 5.3 Live Session Route
- [x] **Story**: As a developer, I need to create the live session view.
  - **Priority**: P2
  - **Dependencies**: 5.2
  - **Acceptance Criteria**:
    - Create `/app/(dashboard)/sessions/[id]/page.tsx`
    - Add basic session UI structure
    - Include placeholder for video
    - Add transcript panel area

### 5.4 Transcript Component
- [ ] **Story**: As a developer, I need to create the live transcript component.
  - **Priority**: P2
  - **Dependencies**: 1.2
  - **Acceptance Criteria**:
    - Create scrollable transcript view
    - Add speaker labels
    - Implement auto-scroll
    - Style with existing patterns
  - **Reference**:
    - `/ai-chatbot/components/messages.tsx` for scroll patterns

### 5.5 Progress Checkpoint #5
- [ ] **Story**: As an AI builder, I need to verify session foundation.
  - **Priority**: P2
  - **Dependencies**: 5.1-5.4
  - **Acceptance Criteria**:
    - Update completed tasks
    - Test route navigation
    - Document integration blockers
    - Create `checkpoint-5-summary.md`

---

## Epic 6: Draft Review Workspace

### 6.1 Draft Review Route
- [x] **Story**: As a developer, I need to create the draft review interface.
  - **Priority**: P2
  - **Dependencies**: 5.4
  - **Acceptance Criteria**:
    - Create `/app/(dashboard)/drafts/[id]/page.tsx`
    - Implement two-pane layout
    - Add to navigation
  - **Layout Reference**:
    - `/ai-chatbot/components/artifact.tsx` for split view

### 6.2 Note Editor Component
- [x] **Story**: As a developer, I need to adapt the editor for medical notes.
  - **Priority**: P2
  - **Dependencies**: 1.2
  - **Acceptance Criteria**:
    - Extend existing editor components
    - Add medical note sections
    - Include word count
    - Add compliance indicators
  - **Files to Extend**:
    - `/ai-chatbot/components/text-editor.tsx`
    - `/ai-chatbot/lib/editor/config.ts`

### 6.3 Transcript Sync
- [x] **Story**: As a developer, I need to link transcript to note sections.
  - **Priority**: P3
  - **Dependencies**: 6.2
  - **Acceptance Criteria**:
    - Highlight relevant transcript portions
    - Allow jumping between sections
    - Sync scroll positions
    - Add citation links

### 6.4 Submit for Review Flow
- [x] **Story**: As a developer, I need to implement the submission workflow.
  - **Priority**: P2
  - **Dependencies**: 6.2
  - **Acceptance Criteria**:
    - Add submit button with validation
    - Create submission confirmation
    - Update note status in database
    - Show success feedback
  - **Pattern Reference**:
    - Existing form submission patterns

---

## Epic 7: Supervisor Board

### 7.1 Kanban Board Setup
- [x] **Story**: As a developer, I need to create the supervisor kanban board.
  - **Priority**: P3
  - **Dependencies**: 2.3
  - **Acceptance Criteria**:
    - Create `/app/(dashboard)/supervisor/page.tsx`
    - Implement three columns: Waiting, Reviewing, Signed
    - Add drag-and-drop capability
    - Use existing card components

### 7.2 Review Card Component
- [x] **Story**: As a developer, I need to create supervisor review cards.
  - **Priority**: P3
  - **Dependencies**: 7.1
  - **Acceptance Criteria**:
    - Show clinician name, patient info
    - Display submission time
    - Add risk indicators
    - Include quick actions

### 7.3 Diff View Modal
- [x] **Story**: As a developer, I need to implement the diff view for edits.
  - **Priority**: P3
  - **Dependencies**: 7.2
  - **Acceptance Criteria**:
    - Create modal showing changes
    - Use existing diff components
    - Highlight additions/deletions
    - Add approval buttons
  - **Reference**:
    - `/ai-chatbot/components/diffview.tsx`

### 7.4 Human Testing Checkpoint #6
- [x] **Story**: As a clinical supervisor, I need to test the review workflow.
  - **Priority**: P3
  - **Dependencies**: 7.1-7.3
  - **Acceptance Criteria**:
    - Workflow is intuitive
    - All information is visible
    - Actions work correctly
    - Feedback incorporated

---

## Epic 8: Billing Console Foundation

### 8.1 Billing Route Setup
- [x] **Story**: As a developer, I need to create the billing console route.
  - **Priority**: P3
  - **Dependencies**: 3.5
  - **Acceptance Criteria**:
    - Create `/app/(dashboard)/billing/page.tsx`
    - Set up data table structure
    - Add to navigation

### 8.2 Install TanStack Table
- [x] **Story**: As a developer, I need to integrate TanStack Table.
  - **Priority**: P3
  - **Dependencies**: 8.1
  - **Acceptance Criteria**:
    - Install @tanstack/react-table ✓
    - Create base table component
    - Add sorting, filtering capabilities
    - Style to match existing UI

### 8.3 Billing Table Columns
- [ ] **Story**: As a developer, I need to define billing table columns.
  - **Priority**: P3
  - **Dependencies**: 8.2
  - **Acceptance Criteria**:
    - Add CPT, ICD-10, modifier columns
    - Include fee and status columns
    - Add confidence badges
    - Implement frozen header

### 8.4 Code Justification Drawer
- [ ] **Story**: As a developer, I need to create the justification drawer.
  - **Priority**: P4
  - **Dependencies**: 8.3
  - **Acceptance Criteria**:
    - Use existing drawer/sheet component
    - Show relevant transcript excerpts
    - Display AI reasoning
    - Add approval actions
  - **Reference**:
    - `/ai-chatbot/components/ui/sheet.tsx`

---

## Epic 9: Integration Preparation

### 9.1 Calendar Integration Research
- [ ] **Story**: As an AI builder, I need to plan calendar integration.
  - **Priority**: P3
  - **Acceptance Criteria**:
    - Research Google Calendar API
    - Document OAuth flow requirements
    - Create `calendar-integration-plan.md`
    - List required scopes

### 9.2 Medical Coding API Research
- [ ] **Story**: As an AI builder, I need to identify coding resources.
  - **Priority**: P3
  - **Acceptance Criteria**:
    - Research CPT/ICD-10 APIs
    - Document pricing and limits
    - Create integration approach
    - List alternatives

### 9.3 Progress Checkpoint #7
- [ ] **Story**: As an AI builder, I need to prepare integration summary.
  - **Priority**: P3
  - **Dependencies**: 9.1, 9.2
  - **Acceptance Criteria**:
    - Document all integration requirements
    - List required API keys
    - Create timeline for integrations
    - Update task completion status

---

## Epic 10: Security & Compliance Foundation

### 10.1 HIPAA Compliance Audit
- [ ] **Story**: As a developer, I need to audit current security measures.
  - **Priority**: P2
  - **Acceptance Criteria**:
    - Review authentication implementation
    - Check data encryption status
    - Document security gaps
    - Create `hipaa-compliance-checklist.md`

### 10.2 Audit Logging Setup
- [ ] **Story**: As a developer, I need to implement audit logging.
  - **Priority**: P2
  - **Dependencies**: 2.3
  - **Acceptance Criteria**:
    - Create audit log table/schema
    - Add logging middleware
    - Track all data access
    - Include user actions

### 10.3 Role-Based Access Control
- [ ] **Story**: As a developer, I need to implement RBAC.
  - **Priority**: P2
  - **Dependencies**: 10.2
  - **Acceptance Criteria**:
    - Define role types (provider, supervisor, admin)
    - Create permission system
    - Update auth checks
    - Test access controls

---

## Epic 11: Final Integration & Polish

### 11.1 Component Integration Test
- [ ] **Story**: As a developer, I need to ensure all components work together.
  - **Priority**: P1
  - **Dependencies**: All previous epics
  - **Acceptance Criteria**:
    - Test full user flow
    - Verify navigation works
    - Check data persistence
    - Document any issues

### 11.2 Performance Optimization
- [ ] **Story**: As a developer, I need to optimize application performance.
  - **Priority**: P3
  - **Acceptance Criteria**:
    - Run Lighthouse audit
    - Optimize bundle size
    - Implement lazy loading
    - Add loading states

### 11.3 Final Human Review
- [ ] **Story**: As a product owner, I need to approve the MVP.
  - **Priority**: P1
  - **Dependencies**: 11.1, 11.2
  - **Acceptance Criteria**:
    - All core features working
    - UI matches vision
    - Performance acceptable
    - Ready for pilot testing

### 11.4 Deployment Preparation
- [ ] **Story**: As a developer, I need to prepare for deployment.
  - **Priority**: P1
  - **Dependencies**: 11.3
  - **Acceptance Criteria**:
    - Update environment variables
    - Configure production database
    - Set up monitoring
    - Create deployment guide

---

## Sprint Mapping

### Sprint 1 (Days 1-5): Foundation
- Epic 1: Codebase Familiarization (All stories)
- Epic 2: Database Schema (Stories 2.1-2.3)
- Human Testing Checkpoint #2

### Sprint 2 (Days 6-10): Navigation & Layout
- Epic 2: Complete migration (Story 2.4)
- Epic 3: Navigation Transformation (All stories)
- Epic 4: Today View (Stories 4.1-4.3)

### Sprint 3 (Days 11-15): Core Features
- Epic 4: Complete Today View (Stories 4.4-4.5)
- Epic 5: Live Session Foundation (All stories)
- Epic 6: Draft Review (Stories 6.1-6.2)

### Sprint 4 (Days 16-20): Workflows
- Epic 6: Complete Draft Review (Stories 6.3-6.4)
- Epic 7: Supervisor Board (All stories)
- Epic 8: Billing Console (Stories 8.1-8.3)

### Sprint 5 (Days 21-25): Integration & Security
- Epic 8: Complete Billing (Story 8.4)
- Epic 9: Integration Preparation (All stories)
- Epic 10: Security Foundation (All stories)

### Sprint 6 (Days 26-30): Polish & Deploy
- Epic 11: Final Integration (All stories)
- Documentation updates
- Deployment preparation

---

## Notes for AI Agent Builder

### Before Starting
1. Read this entire document first
2. Complete Epic 1 (Codebase Familiarization) before any coding
3. Check off completed tasks using [x] in this file
4. Create checkpoint summary files as specified

### Key Patterns to Follow
1. Use existing UI components from `/components/ui/`
2. Follow TypeScript patterns from current codebase
3. Maintain consistent styling with Tailwind classes
4. Use existing authentication and data fetching patterns

### When Stuck
1. Reference similar implementations in the codebase
2. Document blockers in checkpoint files
3. Mark story as blocked and continue with non-dependent stories
4. Return to blocked stories after gathering more context

### Progress Tracking
1. Update this file after completing each story
2. Commit changes with descriptive messages
3. Create checkpoint summaries at designated points
4. Include screenshots where specified

---

## Completion Status

**Total Stories**: 66
**Completed**: 32
**In Progress**: 0
**Blocked**: 0

Last Updated: 6/6/2025
Next Checkpoint: #4 (After Today View Review)
