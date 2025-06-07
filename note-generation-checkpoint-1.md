# Note Generation Feature - Implementation Checkpoint #1

## 1. Revised Implementation Plan

After a thorough analysis of the existing codebase, the implementation plan has been revised to leverage the application's existing architecture for generating AI content via tools and streaming responses. Instead of creating a standalone API endpoint for note generation, we will integrate it into the existing chat and artifact system.

This approach ensures consistency, reusability, and maintainability.

## 2. Revised Data Flow

The following diagram illustrates the new data flow for generating a clinical note.

```mermaid
sequenceDiagram
    actor User
    participant ReviewPage as "Transcript Review Page (Frontend)"
    participant ChatAPI as "/api/chat (Backend)"
    participant CreateDocumentTool as "createDocument Tool"
    participant ClinicalNoteHandler as "Clinical Note Handler"
    participant Database
    participant AIService as "AI Language Model"

    User->>ReviewPage: 1. Click "Generate Clinical Note"
    activate ReviewPage
    ReviewPage->>ChatAPI: 2. append("Create clinical note for session {id}")
    deactivate ReviewPage
    activate ChatAPI

    ChatAPI->>AIService: 3. streamText with user message and tools
    activate AIService
    AIService->>ChatAPI: 4. AI decides to call createDocument tool
    deactivate AIService
    
    ChatAPI->>CreateDocumentTool: 5. Execute tool({ kind: 'clinical-note', ... })
    activate CreateDocumentTool
    CreateDocumentTool->>ClinicalNoteHandler: 6. Invoke registered handler for 'clinical-note'
    deactivate CreateDocumentTool
    activate ClinicalNoteHandler

    ClinicalNoteHandler->>Database: 7. Fetch transcript for session {id}
    activate Database
    Database-->>ClinicalNoteHandler: 8. Return transcript
    deactivate Database

    ClinicalNoteHandler->>AIService: 9. streamText with SOAP prompt and transcript
    activate AIService
    AIService-->>ClinicalNoteHandler: 10. Stream back generated note
    
    ClinicalNoteHandler->>ChatAPI: 11. Pipe response to DataStream
    deactivate AIService
    
    ChatAPI-->>ReviewPage: 12. Stream data back to client
    activate ReviewPage

    ClinicalNoteHandler->>Database: 13. Save final note to 'document' table
    activate Database
    Database-->>ClinicalNoteHandler: 14. Confirm save
    deactivate Database
    deactivate ClinicalNoteHandler
    deactivate ChatAPI
    
    ReviewPage->>ReviewPage: 15. Navigate to /drafts/{new_id} to show streaming note
    deactivate ReviewPage
```

## 3. New Components & Handlers to be Created

*   **`ai-chatbot/lib/artifacts/clinical-note.ts`**: A new artifact handler responsible for the core logic of fetching transcripts, prompting the AI, and saving the result.
*   **`ai-chatbot/lib/ai/prompts/clinical-note-prompt.ts`**: A new, specialized prompt file to instruct the LLM on how to create a well-structured behavioral health SOAP note.
*   **Drizzle Migration File**: A new migration file will be created to add a `sessionId` foreign key to the `document` table, properly linking notes to sessions.

## 4. Files to be Modified

*   **`ai-chatbot/lib/artifacts/server.ts`**: To register the new `clinical-note` handler.
*   **`ai-chatbot/app/dashboard/sessions/[id]/review/page.tsx`**: To change the "Generate Note" button to use the `useChat` hook and call the main chat API.
*   **`ai-chatbot/app/(chat)/api/chat/route.ts`**: To ensure the system prompt and tool parameters can handle the note generation request.
*   **`ai-chatbot/app/dashboard/drafts/[id]/page.tsx`**: To handle the real-time streaming of the generated note.
*   **`ai-chatbot/lib/db/schema.ts`**: To add the `sessionId` to the `document` table schema.
