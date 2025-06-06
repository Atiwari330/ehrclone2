# Clients/Patients Page - User Stories & Implementation Plan

## Overview
This document contains a prioritized list of one-story-point user stories for implementing a Clients/Patients management page in the EHR system. Each story is designed to be completed in one day or less by an AI agent builder.

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
- [ ] Unit tests written (where applicable)
- [ ] Code follows existing patterns in the codebase
- [ ] Documentation updated
- [ ] Manual testing completed
- [ ] Changes committed with descriptive message

## Epic 1: Codebase Familiarization & Planning

### 1.1 Analyze Existing Codebase Structure
- [ ] **Story**: As an AI builder, I need to understand the existing codebase architecture so that I can follow established patterns.
  - **Priority**: P0
  - **Dependencies**: None
  - **Acceptance Criteria**:
    - Read and document key architectural patterns in `ai-chatbot/codebase-analysis.md`
    - Understand routing structure in `app/dashboard/*`
    - Document component reuse patterns from existing pages
    - Create summary of UI component library usage
    - Note data fetching and state management patterns
  - **Files to Read**: 
    - `ai-chatbot/app/dashboard/billing/page.tsx`
    - `ai-chatbot/app/dashboard/today/page.tsx`
    - `ai-chatbot/components/app-sidebar.tsx`
    - `ai-chatbot/lib/db/schema.ts`

### 1.2 Study TanStack Table Implementation
- [ ] **Story**: As an AI builder, I need to understand how TanStack Table is implemented in the billing page so that I can replicate the pattern.
  - **Priority**: P0
  - **Dependencies**: 1.1
  - **Acceptance Criteria**:
    - Document TanStack Table usage patterns from billing page
    - Identify reusable table components and utilities
    - Note sorting, filtering, and pagination implementations
    - Create code snippets for reference
  - **Files to Read**: 
    - `ai-chatbot/app/dashboard/billing/page.tsx`
    - `ai-chatbot/package.json` (for dependencies)

### 1.3 Research UI Component Library
- [ ] **Story**: As an AI builder, I need to catalog available UI components so that I can build consistent interfaces.
  - **Priority**: P0
  - **Dependencies**: None
  - **Acceptance Criteria**:
    - List all shadcn/ui components available in `components/ui/*`
    - Document component APIs and usage examples
    - Identify which components to use for clients page
    - Note styling patterns and Tailwind classes
  - **Files to Read**: 
    - `ai-chatbot/components/ui/*.tsx`
    - `ai-chatbot/components/session-card.tsx`
    - `ai-chatbot/components/time-savings-banner.tsx`

### 1.4 Create Implementation Checkpoint Summary
- [x] **Story**: As an AI builder, I need to document my understanding before implementation so that assumptions can be validated.
  - **Priority**: P1
  - **Dependencies**: 1.1, 1.2, 1.3
  - **Acceptance Criteria**:
    - Create `ai-chatbot/clients-checkpoint-1-summary.md`
    - Include architectural decisions
    - List components to be created
    - Document any questions or concerns
    - Mark this story complete in clients-page-stories.md
  - **Files to Create**: 
    - `ai-chatbot/clients-checkpoint-1-summary.md`

### 1.5 Human Review Checkpoint #1
- [ ] **Story**: As a product owner, I need to review the implementation plan before coding begins.
  - **Priority**: P1
  - **Dependencies**: 1.4
  - **Acceptance Criteria**:
    - Implementation plan reviewed and approved
    - Questions answered
    - Human approval received before proceeding

## Epic 2: Navigation & Routing Setup

### 2.1 Update Sidebar Navigation
- [x] **Story**: As a provider, I need to see "Clients" in the sidebar so that I can access patient management.
  - **Priority**: P1
  - **Dependencies**: 1.5
  - **Acceptance Criteria**:
    - Add Users icon import from lucide-react
    - Add "Clients" nav item after "Today" in navItems array
    - Verify navigation link appears in sidebar
    - Test navigation to `/dashboard/clients` route
  - **Files to Update**: 
    - `ai-chatbot/components/app-sidebar.tsx`

### 2.2 Create Clients Route Directory
- [x] **Story**: As a developer, I need the proper file structure for the clients feature so that routes work correctly.
  - **Priority**: P1
  - **Dependencies**: 2.1
  - **Acceptance Criteria**:
    - Create `app/dashboard/clients/` directory
    - Create placeholder `page.tsx` file
    - Verify route loads without errors
    - Add basic page title and description
  - **Files to Create**: 
    - `ai-chatbot/app/dashboard/clients/page.tsx`

### 2.3 Create TypeScript Types for Clients
- [x] **Story**: As a developer, I need TypeScript types for client data so that the application is type-safe.
  - **Priority**: P1
  - **Dependencies**: 1.5
  - **Acceptance Criteria**:
    - Extend existing Patient type from schema
    - Add ClientListItem interface with additional fields
    - Include status, lastVisit, nextAppointment types
    - Export types for use in components
  - **Files to Create**: 
    - `ai-chatbot/lib/types/client.ts`
  - **Pattern Reference**: 
    - `ai-chatbot/lib/types/session.ts`

## Epic 3: Main Page Layout & Structure

### 3.1 Implement Basic Page Layout
- [x] **Story**: As a provider, I need to see the clients page structure so that I can understand the interface.
  - **Priority**: P2
  - **Dependencies**: 2.2, 2.3
  - **Acceptance Criteria**:
    - Add page title "Clients" and description
    - Implement responsive container layout
    - Add space for summary cards
    - Add space for filters and search
    - Add space for data table
  - **Files to Update**: 
    - `ai-chatbot/app/dashboard/clients/page.tsx`
  - **UI Components to Use**: 
    - Container divs with Tailwind classes
    - Typography components

### 3.2 Create Summary Statistics Cards
- [x] **Story**: As a provider, I need to see client statistics at a glance so that I understand my patient load.
  - **Priority**: P2
  - **Dependencies**: 3.1
  - **Acceptance Criteria**:
    - Display total patients count
    - Show active patients count
    - Show new patients this month
    - Show patients seen today
    - Use Card components with consistent styling
  - **Files to Update**: 
    - `ai-chatbot/app/dashboard/clients/page.tsx`
  - **UI Components to Use**: 
    - Card, CardHeader, CardTitle, CardContent
  - **Style Reference**: 
    - `ai-chatbot/app/dashboard/billing/page.tsx` (summary cards section)

### 3.3 Generate Mock Client Data
- [x] **Story**: As a developer, I need realistic mock data so that I can test the interface.
  - **Priority**: P2
  - **Dependencies**: 2.3
  - **Acceptance Criteria**:
    - Create 20+ mock patient records
    - Include varied statuses (active, inactive, new)
    - Add realistic names, ages, phone numbers
    - Include some with appointments, some without
    - Add insurance and condition data
  - **Files to Update**: 
    - `ai-chatbot/app/dashboard/clients/page.tsx`
  - **Pattern Reference**: 
    - `ai-chatbot/app/dashboard/billing/page.tsx` (mockBillingData)

## Epic 4: Search & Filter Implementation

### 4.1 Implement Global Search
- [x] **Story**: As a provider, I need to search for patients by name or phone so that I can find them quickly.
  - **Priority**: P2
  - **Dependencies**: 3.3
  - **Acceptance Criteria**:
    - Add search input with Search icon
    - Implement real-time filtering
    - Search across name, phone, email, MRN fields
    - Display "No results" when no matches
  - **Files to Update**: 
    - `ai-chatbot/app/dashboard/clients/page.tsx`
  - **UI Components to Use**: 
    - Input component with icon
    - Search icon from lucide-react

### 4.2 Add Status Filter Buttons
- [x] **Story**: As a provider, I need to filter patients by status so that I can focus on specific groups.
  - **Priority**: P2
  - **Dependencies**: 3.3
  - **Acceptance Criteria**:
    - Add filter buttons for All, Active, Inactive, New
    - Implement button toggle states
    - Filter data based on selected status
    - Update counts when filters change
  - **Files to Update**: 
    - `ai-chatbot/app/dashboard/clients/page.tsx`
  - **UI Components to Use**: 
    - Button component with variant states
  - **Pattern Reference**: 
    - `ai-chatbot/app/dashboard/billing/page.tsx` (status filters)

### 4.3 Create Bulk Actions Dropdown
- [ ] **Story**: As a provider, I need bulk action options so that I can manage multiple patients efficiently.
  - **Priority**: P3
  - **Dependencies**: 3.3
  - **Acceptance Criteria**:
    - Create dropdown with bulk actions
    - Include: Send Message, Export, Assign to Team
    - Show only when items are selected
    - Log actions to console (no backend implementation)
  - **Files to Create**: 
    - `ai-chatbot/components/client-actions.tsx`
  - **UI Components to Use**: 
    - DropdownMenu, DropdownMenuTrigger, DropdownMenuItem

## Epic 5: Data Table Implementation

### 5.1 Create Client Table Component
- [x] **Story**: As a developer, I need a reusable table component so that client data is displayed consistently.
  - **Priority**: P1
  - **Dependencies**: 4.1, 4.2
  - **Acceptance Criteria**:
    - Create new component file
    - Accept data and column props
    - Implement with TanStack Table
    - Export for use in main page
  - **Files to Create**: 
    - `ai-chatbot/components/client-table.tsx`
  - **Pattern Reference**: 
    - Table implementation in billing page

### 5.2 Define Table Columns
- [x] **Story**: As a provider, I need to see key patient information in table format so that I can scan quickly.
  - **Priority**: P2
  - **Dependencies**: 5.1
  - **Acceptance Criteria**:
    - Define columns: Name, DOB/Age, Phone, Last Visit, Next Appt, Status
    - Implement column headers with sort functionality
    - Format dates and phone numbers appropriately
    - Add status indicators with colored dots
  - **Files to Update**: 
    - `ai-chatbot/components/client-table.tsx`
  - **UI Components to Use**: 
    - TanStack Table column definitions
    - Custom cell renderers

### 5.3 Implement Row Selection
- [ ] **Story**: As a provider, I need to select multiple patients so that I can perform bulk actions.
  - **Priority**: P3
  - **Dependencies**: 5.2
  - **Acceptance Criteria**:
    - Add checkbox column for selection
    - Implement select all functionality
    - Track selected rows in state
    - Update bulk actions visibility based on selection
  - **Files to Update**: 
    - `ai-chatbot/components/client-table.tsx`
  - **Pattern Reference**: 
    - Standard TanStack Table selection pattern

### 5.4 Add Sorting Functionality
- [x] **Story**: As a provider, I need to sort the patient list so that I can organize by different criteria.
  - **Priority**: P2
  - **Dependencies**: 5.2
  - **Acceptance Criteria**:
    - Enable sorting on Name, Last Visit, Next Appointment columns
    - Show sort indicators (arrows) in headers
    - Implement ascending/descending toggle
    - Maintain sort state during filtering
  - **Files to Update**: 
    - `ai-chatbot/components/client-table.tsx`
  - **UI Components to Use**: 
    - ArrowUp, ArrowDown, ArrowUpDown icons
  - **Pattern Reference**: 
    - `ai-chatbot/app/dashboard/billing/page.tsx` (sorting implementation)

### 5.5 Implement Pagination
- [x] **Story**: As a provider, I need pagination so that large patient lists load efficiently.
  - **Priority**: P2
  - **Dependencies**: 5.2
  - **Acceptance Criteria**:
    - Add pagination controls at table bottom
    - Show "X to Y of Z results" text
    - Implement Previous/Next buttons
    - Default to 10 items per page
  - **Files to Update**: 
    - `ai-chatbot/components/client-table.tsx`
  - **UI Components to Use**: 
    - Button components for pagination
  - **Pattern Reference**: 
    - `ai-chatbot/app/dashboard/billing/page.tsx` (pagination section)

### 5.6 Add Row Actions
- [x] **Story**: As a provider, I need quick actions on each patient row so that I can take immediate action.
  - **Priority**: P2
  - **Dependencies**: 5.2
  - **Acceptance Criteria**:
    - Add View, Schedule, Start Session buttons
    - Implement hover states for better UX
    - View button triggers drawer (next epic)
    - Other buttons log to console for now
  - **Files to Update**: 
    - `ai-chatbot/components/client-table.tsx`
  - **UI Components to Use**: 
    - Button component with size="sm"

### 5.7 Progress Checkpoint - Update Status
- [x] **Story**: As an AI builder, I need to update progress tracking so that stakeholders know the current status.
  - **Priority**: P2
  - **Dependencies**: 5.6
  - **Acceptance Criteria**:
    - Update completion status in this file
    - Mark completed stories with [x]
    - Update story counts at bottom
    - Commit changes with descriptive message
  - **Files to Update**: 
    - `ai-chatbot/clients-page-stories.md`

## Epic 6: Client Detail Drawer

### 6.1 Create Client Drawer Component
- [ ] **Story**: As a developer, I need a drawer component for patient details so that information is accessible without navigation.
  - **Priority**: P2
  - **Dependencies**: 5.6
  - **Acceptance Criteria**:
    - Create new component file
    - Use Sheet component from shadcn/ui
    - Accept patient data as props
    - Implement open/close functionality
  - **Files to Create**: 
    - `ai-chatbot/components/client-drawer.tsx`
  - **UI Components to Use**: 
    - Sheet, SheetContent, SheetHeader, SheetTitle

### 6.2 Design Drawer Header Section
- [ ] **Story**: As a provider, I need to see patient photo and basic info so that I can identify them quickly.
  - **Priority**: P2
  - **Dependencies**: 6.1
  - **Acceptance Criteria**:
    - Display patient photo (or placeholder)
    - Show name, age, and MRN
    - Add close button (X) in corner
    - Use consistent typography and spacing
  - **Files to Update**: 
    - `ai-chatbot/components/client-drawer.tsx`
  - **UI Components to Use**: 
    - Avatar component for photo
    - Typography utilities

### 6.3 Add Contact Information Section
- [ ] **Story**: As a provider, I need patient contact details so that I can reach them if needed.
  - **Priority**: P2
  - **Dependencies**: 6.1
  - **Acceptance Criteria**:
    - Display phone with phone icon
    - Show email with email icon
    - Display address with home icon
    - Make phone/email clickable (tel: and mailto:)
  - **Files to Update**: 
    - `ai-chatbot/components/client-drawer.tsx`
  - **UI Components to Use**: 
    - Icons from lucide-react
    - Link styling

### 6.4 Add Insurance Information
- [ ] **Story**: As a provider, I need to see insurance details so that I know coverage information.
  - **Priority**: P3
  - **Dependencies**: 6.1
  - **Acceptance Criteria**:
    - Display insurance provider name
    - Show member ID
    - Add section divider
    - Handle missing insurance gracefully
  - **Files to Update**: 
    - `ai-chatbot/components/client-drawer.tsx`

### 6.5 Display Recent Visits
- [ ] **Story**: As a provider, I need to see recent visits so that I understand patient history.
  - **Priority**: P2
  - **Dependencies**: 6.1
  - **Acceptance Criteria**:
    - List last 3-5 visits
    - Show date and visit type
    - Sort by most recent first
    - Display "No recent visits" if empty
  - **Files to Update**: 
    - `ai-chatbot/components/client-drawer.tsx`

### 6.6 Add Medical Conditions
- [ ] **Story**: As a provider, I need to see active conditions so that I'm aware of patient health status.
  - **Priority**: P2
  - **Dependencies**: 6.1
  - **Acceptance Criteria**:
    - List active medical conditions
    - Use bullet points or badges
    - Handle empty conditions list
    - Limit to most important conditions
  - **Files to Update**: 
    - `ai-chatbot/components/client-drawer.tsx`
  - **UI Components to Use**: 
    - Badge component for conditions

### 6.7 Integrate Drawer with Table
- [ ] **Story**: As a provider, I need the drawer to open when I click View so that I can see patient details.
  - **Priority**: P2
  - **Dependencies**: 6.1, 5.6
  - **Acceptance Criteria**:
    - Connect View button to drawer open
    - Pass selected patient data to drawer
    - Handle drawer close events
    - Maintain drawer state properly
  - **Files to Update**: 
    - `ai-chatbot/app/dashboard/clients/page.tsx`
    - `ai-chatbot/components/client-table.tsx`

### 6.8 Human Review Checkpoint #2
- [ ] **Story**: As a product owner, I need to review the implemented UI before final polish.
  - **Priority**: P1
  - **Dependencies**: 6.7
  - **Acceptance Criteria**:
    - Full clients page with table and drawer functional
    - UI matches design specifications
    - Feedback incorporated before proceeding
    - Human approval received

## Epic 7: Visual Polish & Status Indicators

### 7.1 Implement Status Dot Indicators
- [ ] **Story**: As a provider, I need visual status indicators so that I can quickly assess patient status.
  - **Priority**: P3
  - **Dependencies**: 6.8
  - **Acceptance Criteria**:
    - Green dot for active/seen recently
    - Yellow dot for pending items
    - Red dot for urgent attention
    - Blue dot for scheduled today
    - Add legend or tooltip explaining colors
  - **Files to Update**: 
    - `ai-chatbot/components/client-table.tsx`
  - **Style Reference**: 
    - Use Tailwind color utilities

### 7.2 Add Loading States
- [ ] **Story**: As a provider, I need loading indicators so that I know data is being fetched.
  - **Priority**: P3
  - **Dependencies**: 3.1
  - **Acceptance Criteria**:
    - Add skeleton loaders for table rows
    - Show loading state for summary cards
    - Implement smooth transitions
    - Test with simulated delay
  - **Files to Update**: 
    - `ai-chatbot/app/dashboard/clients/page.tsx`
    - `ai-chatbot/components/client-table.tsx`
  - **UI Components to Use**: 
    - Skeleton component

### 7.3 Create Empty State
- [ ] **Story**: As a provider, I need a friendly empty state so that I know what to do when no patients exist.
  - **Priority**: P3
  - **Dependencies**: 3.1
  - **Acceptance Criteria**:
    - Show when no patients match filters
    - Include helpful message
    - Add illustration or icon
    - Suggest action (add first patient)
  - **Files to Update**: 
    - `ai-chatbot/components/client-table.tsx`

### 7.4 Add Hover Effects
- [ ] **Story**: As a provider, I need hover feedback so that the interface feels responsive.
  - **Priority**: P4
  - **Dependencies**: 5.2
  - **Acceptance Criteria**:
    - Add row hover highlighting
    - Implement button hover states
    - Add transition animations (150ms)
    - Ensure accessibility compliance
  - **Files to Update**: 
    - `ai-chatbot/components/client-table.tsx`
  - **Style Reference**: 
    - `hover:bg-muted/50` pattern from billing page

### 7.5 Responsive Design Check
- [ ] **Story**: As a provider, I need the page to work on different screen sizes so that I can access it anywhere.
  - **Priority**: P3
  - **Dependencies**: 7.4
  - **Acceptance Criteria**:
    - Test on desktop (1920px)
    - Test on tablet (768px)
    - Adjust table for mobile if needed
    - Ensure drawer works on all sizes
  - **Files to Update**: 
    - `ai-chatbot/app/dashboard/clients/page.tsx`
    - `ai-chatbot/components/client-table.tsx`
    - `ai-chatbot/components/client-drawer.tsx`

## Epic 8: Final Integration & Testing

### 8.1 Integration Testing
- [ ] **Story**: As a developer, I need to test all features together so that the page works correctly.
  - **Priority**: P2
  - **Dependencies**: 7.5
  - **Acceptance Criteria**:
    - Test search with various queries
    - Verify filters work with pagination
    - Ensure drawer opens/closes properly
    - Check all buttons and interactions
    - Test with 0, 1, and many patients
  - **Files to Update**: 
    - Any files needing fixes

### 8.2 Code Cleanup & Comments
- [ ] **Story**: As a developer, I need to clean up code so that it's maintainable.
  - **Priority**: P3
  - **Dependencies**: 8.1
  - **Acceptance Criteria**:
    - Remove console.log statements
    - Add JSDoc comments to components
    - Ensure consistent code formatting
    - Remove unused imports
  - **Files to Update**: 
    - All created/modified files

### 8.3 Create Feature Documentation
- [ ] **Story**: As a developer, I need to document the feature so that others understand implementation.
  - **Priority**: P3
  - **Dependencies**: 8.2
  - **Acceptance Criteria**:
    - Document component architecture
    - List all new files created
    - Note any technical decisions
    - Include screenshots of final UI
  - **Files to Create**: 
    - `ai-chatbot/clients-feature-docs.md`

### 8.4 Update Progress Summary
- [ ] **Story**: As an AI builder, I need to update the main progress summary so that it reflects new features.
  - **Priority**: P2
  - **Dependencies**: 8.3
  - **Acceptance Criteria**:
    - Add Clients page to completed features
    - Update completion metrics
    - Note what's still missing
    - Commit all changes
  - **Files to Update**: 
    - `ai-chatbot/progress-summary.md`

### 8.5 Final Progress Checkpoint
- [ ] **Story**: As an AI builder, I need to mark all completed tasks so that progress is accurately tracked.
  - **Priority**: P1
  - **Dependencies**: 8.4
  - **Acceptance Criteria**:
    - Mark all completed stories with [x]
    - Update completion counts
    - Create final commit
    - Ready for human review
  - **Files to Update**: 
    - `ai-chatbot/clients-page-stories.md`

### 8.6 Human Review Checkpoint #3
- [ ] **Story**: As a product owner, I need to do final review before feature release.
  - **Priority**: P1
  - **Dependencies**: 8.5
  - **Acceptance Criteria**:
    - Complete feature demonstration
    - All acceptance criteria met
    - Code quality approved
    - Feature ready for production

## Sprint Mapping

### Sprint 1 (Days 1-2): Foundation & Setup
- Epic 1: All stories (1.1-1.5) - Codebase familiarization
- Epic 2: All stories (2.1-2.3) - Navigation setup
- Epic 3: Stories 3.1-3.3 - Basic layout and mock data
- Checkpoint #1

### Sprint 2 (Days 3-4): Core Table Implementation  
- Epic 4: All stories (4.1-4.3) - Search and filters
- Epic 5: Stories 5.1-5.6 - Table implementation
- Progress checkpoint 5.7

### Sprint 3 (Days 5-6): Detail View & Integration
- Epic 6: All stories (6.1-6.8) - Client drawer
- Checkpoint #2

### Sprint 4 (Days 7-8): Polish & Completion
- Epic 7: All stories (7.1-7.5) - Visual polish
- Epic 8: All stories (8.1-8.6) - Testing and documentation
- Checkpoint #3

## Notes for AI Agent Builder

### Before Starting
1. Read this entire document first
2. Complete Epic 1 (Codebase Familiarization) before any coding
3. Check off completed tasks using [x] in this file
4. Create checkpoint summary files as specified

### Key Patterns to Follow
- Use TanStack Table exactly as implemented in billing page
- Follow the existing component structure (separate components for reusability)
- Use the same state management patterns (useState, useMemo)
- Maintain consistent styling with Tailwind classes
- Follow TypeScript patterns from existing code

### When Stuck
- Reference the billing page implementation for table patterns
- Check existing components in components/ui for available tools
- Look at session-card.tsx for card-based layouts
- If unsure about styling, check similar components

### Progress Tracking
- Update this file after completing each story
- Use git commits with descriptive messages
- Create checkpoint files as specified
- Keep the completion status section updated

---

## Completion Status

**Total Stories**: 54
**Completed**: 14
**In Progress**: 0
**Blocked**: 0

Last Updated: 2025-01-06
Next Task: Epic 6.1 (Create Client Drawer Component) [P2]
