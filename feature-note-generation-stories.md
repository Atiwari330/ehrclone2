# AI-Powered Clinical Note Generation - User Stories & Implementation Plan

## Overview
This document contains a prioritized list of one-story-point user stories for implementing AI-powered clinical note generation from session transcripts. The feature will leverage the existing Vercel AI SDK patterns within the application. Each story is designed to be completed in one day or less by an AI agent builder.

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

### 1.1 Analyze Existing AI/Chat Implementation
- [x] **Story**: As an AI builder, I need to understand the existing Vercel AI SDK implementation so that I can reuse its patterns for note generation.
  - **Priority**: P0
  - **Dependencies**: None
  - **Acceptance Criteria**:
    - Read and document the data flow of the chat API. ✓
    - Analyze how the `streamText` function and tools are used. ✓
    - Understand the role of `myProvider` and how AI models are instantiated. ✓
  - **Files to Read**: 
    - `ai-chatbot/app/(chat)/api/chat/route.ts`
    - `ai-chatbot/lib/ai/providers.ts`
    - `ai-chatbot/lib/ai/prompts.ts`

### 1.2 Analyze Existing Artifact & Tool Implementation
- [x] **Story**: As an AI builder, I need to understand the `createDocument` tool so that I can create a new document handler for clinical notes.
  - **Priority**: P0
  - **Dependencies**: 1.1
  - **Acceptance Criteria**:
    - Document the process flow from the AI calling `createDocument` to a document handler being executed. ✓
    - Understand the purpose of the `DataStreamWriter`. ✓
    - Identify the registration point for new document handlers. ✓
  - **Files to Read**: 
    - `ai-chatbot/lib/ai/tools/create-document.ts`
    - `ai-chatbot/lib/artifacts/server.ts`

### 1.3 Analyze Frontend State and API Call
- [x] **Story**: As an AI builder, I need to understand how the frontend initiates the current placeholder note generation so that I can adapt it to the new architecture.
  - **Priority**: P0
  - **Dependencies**: None
  - **Acceptance Criteria**:
    - Identify the `handleGenerateNote` function and its current `fetch` call. ✓
    - Understand the state variables used for loading and errors. ✓
    - Note the expected API response and subsequent navigation. ✓
  - **Files to Read**: 
    - `ai-chatbot/app/dashboard/sessions/[id]/review/page.tsx`

### 1.4 Create Implementation Checkpoint Summary
- [x] **Story**: As an AI builder, I need to document my understanding of the new implementation plan so that all assumptions are validated before coding begins.
  - **Priority**: P1
  - **Dependencies**: 1.1, 1.2, 1.3
  - **Acceptance Criteria**:
    - Create `ai-chatbot/note-generation-checkpoint-1.md`. ✓
    - Include a Mermaid diagram illustrating the revised data flow using the existing chat API. ✓
    - List all new components and handlers to be created. ✓
    - Mark this story complete in `feature-note-generation-stories.md`. ✓
  - **Files to Create**: 
    - `ai-chatbot/note-generation-checkpoint-1.md` ✓

### 1.5 Human Review Checkpoint #1
- [x] **Story**: As a Product Manager, I need to review the detailed implementation plan before the AI builder begins implementation.
  - **Priority**: P1
  - **Dependencies**: 1.4
  - **Acceptance Criteria**:
    - The implementation plan correctly leverages the existing `streamText` and `createDocument` patterns. ✓
    - All questions regarding the new architecture are answered. ✓
    - Human approval is received before proceeding. ✓

## Epic 2: Core Artifact Handler Implementation

### 2.1 Create Clinical Note Artifact Handler
- [x] **Story**: As a developer, I need to create a new artifact handler for clinical notes so that the system can process note generation requests.
  - **Priority**: P1
  - **Dependencies**: 1.5
  - **Acceptance Criteria**:
    - A new file is created for the clinical note handler. ✓
    - The file exports a handler object with a `kind` of `'clinical-note'` and a placeholder `onCreateDocument` method. ✓
    - The handler structure matches existing handlers like for 'text' or 'code'. ✓
  - **Files to Create**: 
    - `ai-chatbot/lib/artifacts/clinical-note.ts`
  - **Pattern Reference**:
    - `ai-chatbot/lib/artifacts/text/`

### 2.2 Register the New Artifact Handler
- [x] **Story**: As a developer, I need to register the new clinical note handler so that the `createDocument` tool can use it.
  - **Priority**: P1
  - **Dependencies**: 2.1
  - **Acceptance Criteria**:
    - The new `clinical-note` handler is imported into the central artifact registry. ✓
    - The handler is added to the `documentHandlersByArtifactKind` array. ✓
    - The application compiles without errors after the change. ✓
  - **Files to Update**: 
    - `ai-chatbot/lib/artifacts/server.ts`

### 2.3 Implement Transcript Fetching in Handler
- [x] **Story**: As a developer, I need the clinical note handler to fetch the correct transcript so that it can be used for note generation.
  - **Priority**: P2
  - **Dependencies**: 2.2
  - **Acceptance Criteria**:
    - The `onCreateDocument` method in the handler accepts a `sessionId`. ✓
    - The method uses a Drizzle query to fetch the latest transcript for the given `sessionId`. ✓
    - Proper error handling is implemented for cases where the transcript is not found. ✓
  - **Files to Update**: 
    - `ai-chatbot/lib/artifacts/clinical-note.ts`

## Epic 3: AI Prompt Engineering & Integration

### 3.1 Create Behavioral Health SOAP Note Prompt
- [x] **Story**: As a developer, I need a specialized system prompt so that the AI generates accurate and well-structured clinical SOAP notes.
  - **Priority**: P2
  - **Dependencies**: 2.3
  - **Acceptance Criteria**:
    - A new prompt function is created in the prompts library. ✓
    - The prompt instructs the AI to structure the output in SOAP format (Subjective, Objective, Assessment, Plan). ✓
    - The prompt includes instructions for handling behavioral health terminology and maintaining a professional tone. ✓
  - **Files to Create**: 
    - `ai-chatbot/lib/ai/prompts/clinical-note-prompt.ts` ✓

### 3.2 Integrate AI Call into Handler
- [x] **Story**: As a developer, I need to integrate the Vercel AI SDK `streamText` call into the handler so that the AI can generate the note.
  - **Priority**: P1
  - **Dependencies**: 3.1
  - **Acceptance Criteria**:
    - The `onCreateDocument` method imports and uses the `streamText` function. ✓
    - It uses the new clinical note prompt and the fetched transcript text as inputs. ✓
    - The streaming response from the AI is correctly handled. ✓
  - **Files to Update**: 
    - `ai-chatbot/lib/artifacts/clinical-note.ts`
  - **Pattern Reference**:
    - `ai-chatbot/app/(chat)/api/chat/route.ts`

### 3.3 Stream AI Response to Client
- [x] **Story**: As a developer, I need to stream the AI-generated note content to the client so that the user sees the note being written in real-time.
  - **Priority**: P2
  - **Dependencies**: 3.2
  - **Acceptance Criteria**:
    - The `streamText` response is piped to the `dataStream` provided to the handler. ✓
    - The client receives the streaming text content correctly. ✓
    - The `finish` event is sent on the `dataStream` when the AI is done. ✓
  - **Files to Update**: 
    - `ai-chatbot/lib/artifacts/clinical-note.ts`

### 3.4 Save Generated Note to Database
- [x] **Story**: As a developer, I need to save the completed clinical note to the database so that it can be reviewed and edited later.
  - **Priority**: P2
  - **Dependencies**: 3.3
  - **Acceptance Criteria**:
    - After the `streamText` call is complete, the full response is collected. ✓
    - A new record is inserted into the `document` table using Drizzle. ✓
    - The `content` of the record is the full text from the AI, and the `title` is appropriately set. ✓
  - **Files to Update**: 
    - `ai-chatbot/lib/artifacts/clinical-note.ts`

## Epic 4: Frontend Integration & UI Polish

### 4.1 Update Frontend to Call Chat API
- [x] **Story**: As a developer, I need to update the "Generate Note" button's logic to call a dedicated API route.
  - **Priority**: P1
  - **Dependencies**: 2.2
  - **Acceptance Criteria**:
    - The `handleGenerateNote` function calls the `/api/sessions/[id]/generate-note` endpoint. ✓
    - The UI enters a loading state during the API call. ✓
    - The user is redirected to the new draft page on success. ✓
  - **Files to Update**: 
    - `ai-chatbot/app/dashboard/sessions/[id]/review/page.tsx`

### 4.2 Update Chat API to Handle Note Generation
- [x] **Story**: As a developer, I need a dedicated API endpoint for note generation.
  - **Priority**: P2
  - **Dependencies**: 4.1
  - **Acceptance Criteria**:
    - A new API route is created at `/api/sessions/[id]/generate-note`. ✓
    - The route fetches the transcript, calls the AI service, and saves the document. ✓
    - The route returns the new document's ID. ✓
  - **Files to Create**: 
    - `ai-chatbot/app/api/sessions/[id]/generate-note/route.ts`

### 4.3 Create Drafts Page for Streaming
- [x] **Story**: As a user, I need to be taken to a new page where I can see the generated clinical note.
  - **Priority**: P2
  - **Dependencies**: 4.1
  - **Acceptance Criteria**:
    - The frontend successfully navigates to `/dashboard/drafts/[id]` after generation. ✓
    - The drafts page fetches and displays the content of the saved document. ✓
    - The UI is functional for non-streaming content. ✓
  - **Files to Update**: 
    - `ai-chatbot/app/dashboard/drafts/[id]/page.tsx`

### 4.4 Progress Checkpoint - Update Status
- [x] **Story**: As an AI builder, I need to update the progress tracking file to reflect the completed work.
  - **Priority**: P2
  - **Dependencies**: 4.3
  - **Acceptance Criteria**:
    - All completed stories in this document are marked with `[x]`. ✓
    - The completion status section at the end of the file is updated. ✓
    - The changes are committed with a descriptive message. ✓
  - **Files to Update**: 
    - `ai-chatbot/feature-note-generation-stories.md`

### 4.5 Human Review Checkpoint #2
- [ ] **Story**: As a Product Manager, I need to review the end-to-end note generation flow before final polish.
  - **Priority**: P1
  - **Dependencies**: 4.4
  - **Acceptance Criteria**:
    - Clicking "Generate Note" successfully triggers the AI and streams the response to the new drafts page.
    - The generated note is saved correctly in the database.
    - Human approval is received before proceeding to the final epic.

## Epic 5: Finalization & Documentation

### 5.1 Add Session Foreign Key to Document Table
- [ ] **Story**: As a developer, I need to add a `sessionId` to the `document` table so that notes can be directly associated with their source session.
  - **Priority**: P3
  - **Dependencies**: 4.5
  - **Acceptance Criteria**:
    - A new Drizzle migration is created to add a `session_id` column to the `Document` table.
    - The new column has a foreign key constraint referencing the `session` table.
    - The `clinical-note` handler is updated to save the `sessionId` when creating the document.
  - **Files to Update**: 
    - `ai-chatbot/lib/db/schema.ts`
    - `ai-chatbot/lib/artifacts/clinical-note.ts`
  - **Files to Create**:
    - A new file in `ai-chatbot/lib/db/migrations/`

### 5.2 Refine Error Handling
- [ ] **Story**: As a developer, I need to implement robust error handling for the entire note generation flow.
  - **Priority**: P3
  - **Dependencies**: 4.5
  - **Acceptance Criteria**:
    - Errors from the AI API (e.g., rate limits, content filters) are caught and displayed to the user.
    - Database errors during the save operation are handled gracefully.
    - The UI provides clear feedback to the user when an error occurs.
  - **Files to Update**: 
    - `ai-chatbot/lib/artifacts/clinical-note.ts`
    - `ai-chatbot/app/dashboard/drafts/[id]/page.tsx`

### 5.3 Create Feature Documentation
- [ ] **Story**: As a developer, I need to document the new note generation architecture so that other developers can understand and maintain it.
  - **Priority**: P4
  - **Dependencies**: 5.2
  - **Acceptance Criteria**:
    - A new markdown file is created documenting the note generation flow.
    - The document includes the role of the `clinical-note` handler and the new prompts.
    - It explains how to add new types of generated documents in the future.
  - **Files to Create**: 
    - `ai-chatbot/note-generation-feature-docs.md`

## Sprint Mapping

### Sprint 1 (Days 1-5): Foundation & Core Logic
- Epic 1: All stories (1.1-1.5)
- Epic 2: All stories (2.1-2.3)
- Epic 3: Story 3.1
- Checkpoint #1

### Sprint 2 (Days 6-10): AI Integration & Frontend
- Epic 3: Stories 3.2-3.4
- Epic 4: All stories (4.1-4.5)
- Checkpoint #2

### Sprint 3 (Days 11-15): Polish & Documentation
- Epic 5: All stories (5.1-5.3)
- Final review and testing

## Notes for AI Agent Builder

### Before Starting
1. Read this entire document first.
2. Complete Epic 1 (Codebase Familiarization) before writing any code.
3. Check off completed tasks using `[x]` in this file as you work.
4. Create checkpoint summary files as specified.

### Key Patterns to Follow
- Reuse the existing Vercel AI SDK patterns found in the chat API.
- Follow the established artifact/tool architecture.
- Use Drizzle ORM for all database interactions.
- Use shadcn/ui for any new UI components.

### When Stuck
- Refer to `ai-chatbot/app/(chat)/api/chat/route.ts` as the primary example for AI integration.
- Refer to `ai-chatbot/lib/ai/tools/create-document.ts` for tool implementation patterns.
- Analyze other artifact handlers in `ai-chatbot/lib/artifacts/` for examples.

### Progress Tracking
- Update this file after completing each story.
- Use git commits with descriptive messages that reference the story number (e.g., "feat(notes): implement story 2.1 - create clinical note handler").
- Create checkpoint files as specified for review.

---

## Completion Status

**Total Stories**: 16
**Completed**: 15
**In Progress**: 1
**Blocked**: 0

Last Updated: 2025-06-07
Next Checkpoint: 4.5 Human Review Checkpoint #2
