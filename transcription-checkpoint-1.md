# Transcription Integration Checkpoint 1

**Date**: 2025-01-06  
**Epic**: 1 - Codebase Familiarization & Planning  
**Status**: Ready for Human Review

## Executive Summary

I've completed the analysis of the existing codebase and AssemblyAI integration patterns. The current architecture is well-suited for real-time transcription integration with minimal changes needed. The session management system already has the necessary hooks and data structures in place.

## Architectural Decisions

### 1. Integration Strategy
- **Use existing session context**: The `addTranscriptEntry` method in session context is perfectly designed for real-time transcripts
- **Preserve backward compatibility**: Keep `addMockTranscript` for testing purposes
- **Minimal UI changes**: Replace the "Add Test Transcript" button with real recording controls
- **Token-based authentication**: Follow AssemblyAI's secure pattern with server-side token generation

### 2. Component Architecture
```
┌─────────────────────────────────────────┐
│     Live Session Page Component         │
│  ┌─────────────────────────────────┐   │
│  │   useSessionTranscription Hook   │   │
│  │  ┌───────────────────────────┐  │   │
│  │  │  useRealtimeTranscription │  │   │
│  │  │  └──────────┬────────────┘  │   │
│  │  │             │                │   │
│  │  │  ┌──────────▼────────────┐  │   │
│  │  │  │   useAudioCapture     │  │   │
│  │  │  └───────────────────────┘  │   │
│  │  └─────────────────────────────┘   │
│  └─────────────────────────────────┐   │
│                                    │   │
│         Session Context            │   │
│         (existing)                 │   │
└────────────────────────────────────┘
```

### 3. Data Flow
1. Browser captures audio at 16kHz mono
2. Audio converted from Float32Array to Int16Array
3. Sent via WebSocket to AssemblyAI
4. Transcripts received (partial & final)
5. Added to session context via `addTranscriptEntry`
6. UI updates automatically via existing hooks

## Components to be Created

### Infrastructure (Epic 2)
1. **`/app/api/assemblyai-token/route.ts`**
   - POST endpoint for temporary token generation
   - 1-hour expiry tokens
   - Server-side API key security

2. **`/lib/types/transcription.ts`**
   - `SessionTranscript` interface
   - `TranscriptEntry` extensions
   - Audio configuration types
   - Error types

3. **`/lib/transcription/behavioral-health-vocab.ts`**
   - Medical terminology array
   - Common medications
   - Assessment tools (PHQ-9, GAD-7)

### Core Hooks (Epics 4-5)
4. **`/hooks/use-audio-capture.tsx`**
   - Browser getUserMedia management
   - Audio format conversion
   - Stream lifecycle management

5. **`/hooks/use-realtime-transcription.tsx`**
   - WebSocket connection management
   - Event handling (partial/final transcripts)
   - Error recovery
   - Connection state tracking

6. **`/hooks/use-session-transcription.tsx`**
   - Combines audio capture & transcription
   - Integrates with session context
   - Simplified API for components

### Utilities
7. **`/utils/get-assembly-token.ts`**
   - Token fetching helper
   - Error handling
   - Type safety

## Integration Points

### Session Context Updates
- Add transcription-specific actions (minimal changes)
- Maintain existing `addTranscriptEntry` method
- Add connection state tracking

### UI Changes
- Replace "Add Test Transcript" with real controls
- Add connection status indicator
- Show confidence levels for transcripts
- Add "Save & Review" button when transcript exists

## Questions & Concerns

1. **API Key Security**: Confirmed we'll use server-side token generation - API key never exposed
2. **Browser Compatibility**: Will need to handle getUserMedia permission errors gracefully
3. **Mobile Support**: WebSocket connections may be unstable on mobile - need reconnection logic
4. **Speaker Identification**: AssemblyAI doesn't identify speakers in single-channel audio - will default to "Provider" for now

## Testing Strategy

1. **Unit Tests**: Mock WebSocket for transcription hooks
2. **Integration Tests**: Test full audio → transcript flow
3. **Error Cases**: Network failures, permission denials, API errors
4. **Performance**: Long session handling (1+ hour recordings)

## Next Steps

Upon approval:
1. Install AssemblyAI SDK and dependencies
2. Configure environment variables
3. Create TypeScript types
4. Implement token authentication
5. Build audio capture hook
6. Create transcription hook
7. Integrate with session UI

## Risk Mitigation

- **Fallback**: Keep mock transcript functionality for demos/testing
- **Error Boundaries**: Wrap transcription components to prevent app crashes
- **Graceful Degradation**: Sessions work without transcription if errors occur
- **Monitoring**: Log WebSocket events for debugging

---

**Ready for human review and approval to proceed with Epic 2 implementation.**
