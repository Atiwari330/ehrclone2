# Transcription Integration Analysis

## Date: 2025-01-06

## Key Session-Related Patterns

### 1. Session Context Structure (`/contexts/session-context.tsx`)
- **Pattern**: Context + Reducer pattern for state management
- **Key Methods**:
  - `addTranscriptEntry`: Adds transcript entries with full metadata
  - State management for session status (scheduled/active/paused/ended)
  - AI state tracking for processing status
- **Integration Point**: Will use existing `addTranscriptEntry` method for real-time transcripts

### 2. Session Types (`/lib/types/session.ts`)
- **TranscriptEntry Interface**:
  ```typescript
  {
    id: string;
    timestamp: Date;
    speaker: string;
    speakerId: string;
    text: string;
    confidence?: number;
    aiProcessed?: boolean;
  }
  ```
- **Key Observation**: Already has `confidence` field for AssemblyAI confidence scores
- **Session Status Flow**: scheduled → active → paused/ended

### 3. Live Session UI (`/app/dashboard/sessions/[id]/page.tsx`)
- **Current Mock Functionality**:
  - "Add Test Transcript" button for testing
  - Live transcript display with auto-scroll
  - Recording state indicators
  - AI suggestions panel
- **UI Components Used**:
  - Card, Button, Separator from shadcn/ui
  - Lucide icons for controls
- **Key Integration Points**:
  - Replace `addTestTranscript` with real recording
  - Use existing transcript display logic
  - Maintain session duration tracking

### 4. Session Hooks (`/hooks/use-session.tsx`)
- **useSessionManager Hook**:
  - Manages recording state
  - Provides `addMockTranscript` method
  - Tracks session duration
  - Handles AI state updates
- **useTranscriptScroll Hook**:
  - Auto-scroll functionality
  - Already handles real-time updates

## Architecture Decisions

1. **Preserve Existing Structure**: The current architecture is well-designed for real-time transcription
2. **Minimal Changes**: Use existing `addTranscriptEntry` method instead of creating new ones
3. **Backward Compatibility**: Keep `addMockTranscript` for testing purposes
4. **Token-Based Auth**: Follow AssemblyAI docs pattern for secure client-side authentication

## Integration Approach

1. **Audio Capture**: Create new hook for browser audio capture
2. **AssemblyAI Connection**: Create transcription hook using WebSocket
3. **Session Integration**: Update session page to use real transcription
4. **State Management**: Use existing session context without major modifications

## UI Components Analysis

### Button Component (`/components/ui/button.tsx`)
- **Variants**: default, destructive, outline, secondary, ghost, link
- **Sizes**: default, sm, lg, icon
- **Pattern**: Uses class-variance-authority (cva) for variant management
- **Integration**: Will use for Start/Stop Recording controls

### Card Component (`/components/ui/card.tsx`)
- **Structure**: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **Styling**: Consistent with app theme (rounded-lg, border, shadow-sm)
- **Usage**: For transcript display sections and status indicators

### Skeleton Component (`/components/ui/skeleton.tsx`)
- **Purpose**: Loading states
- **Animation**: animate-pulse with bg-muted
- **Usage**: Will use while establishing WebSocket connection

### Loading Patterns
- Existing app uses Loader2 icon with animate-spin
- Skeleton loaders for content areas
- Consistent loading state patterns across app

## AssemblyAI Integration Patterns Review

### Authentication Pattern
- Server-side API route generates temporary tokens (1-hour expiry)
- Client fetches token via `/api/assemblyai-token` endpoint  
- Tokens used for WebSocket authentication
- API key never exposed to client

### Audio Capture Requirements
- Sample rate: 16kHz (required by AssemblyAI)
- Format: PCM 16-bit little-endian (pcm_s16le)
- Channel: Mono
- Conversion: Float32Array → Int16Array

### WebSocket Implementation
- Uses official `assemblyai` npm package
- RealtimeTranscriber class manages connection
- Event handlers: 'open', 'close', 'error', 'transcript'
- Separate events for partial vs final transcripts

### TypeScript Interfaces
- RealtimeTranscript type from SDK
- Custom interfaces for audio capture options
- Session metadata tracking
- Error handling types

### Environment Variables
- `ASSEMBLYAI_API_KEY` stored in `.env.local`
- Must have upgraded AssemblyAI account (paid)

### Key Implementation Files to Create
1. `/app/api/assemblyai-token/route.ts` - Token generation
2. `/utils/get-assembly-token.ts` - Token fetching utility
3. `/hooks/use-audio-capture.tsx` - Browser audio capture
4. `/hooks/use-realtime-transcription.tsx` - WebSocket management
5. `/lib/types/transcription.ts` - TypeScript types

## Next Steps

- Create implementation checkpoint summary
- Get human review before proceeding with implementation
