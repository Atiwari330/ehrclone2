# Video Integration Plan for EHR System

## Overview
This document outlines the approach for integrating video conferencing capabilities into the EHR system to enable live session recording and transcription.

## Requirements
- Support for Zoom, Google Meet, and Microsoft Teams
- Real-time audio capture for transcription
- Participant management (provider and patient)
- Recording capabilities with HIPAA compliance
- Session metadata tracking

## Integration Approach

### Option 1: Zoom SDK Integration (Recommended)
**Pros:**
- Robust SDK with healthcare-specific features
- HIPAA-compliant BAA available
- Built-in recording and transcription APIs
- WebRTC support for browser-based access

**Implementation:**
1. Use Zoom Meeting SDK for Web
2. OAuth 2.0 for authentication
3. Server-to-server OAuth for backend operations
4. Webhook integration for real-time events

**Required Scopes:**
- `meeting:read`
- `meeting:write`
- `recording:read`
- `cloud_recording:read`

### Option 2: Agnostic WebRTC Solution
**Pros:**
- Platform independent
- Full control over implementation
- No vendor lock-in

**Cons:**
- More complex implementation
- Need separate transcription service
- Recording infrastructure required

## MVP Implementation Plan

### Phase 1: Basic Integration
1. **Mock Video Interface**
   - Placeholder video area
   - Simulated "join meeting" flow
   - Mock participant indicators

2. **Session State Management**
   - Session lifecycle (scheduled → active → ended)
   - Participant tracking
   - Recording status

3. **Transcript Simulation**
   - Mock real-time transcript feed
   - Speaker identification
   - Timestamp tracking

### Phase 2: Zoom SDK Integration
1. **Authentication Setup**
   - OAuth flow implementation
   - Token management
   - Secure credential storage

2. **Meeting Controls**
   - Start/join meeting
   - Mute/unmute
   - End session
   - Recording controls

3. **Real-time Events**
   - Participant join/leave
   - Recording status
   - Meeting ended

## Security Considerations
- All video streams encrypted end-to-end
- PHI data handling compliance
- Audit logging for all session activities
- Secure storage of recordings
- Access control for session data

## API Keys/Configs Required
```javascript
// Environment variables needed
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_WEBHOOK_SECRET=
ZOOM_OAUTH_REDIRECT_URI=

// Optional for other platforms
GOOGLE_MEET_API_KEY=
TEAMS_APP_ID=
```

## Data Flow
1. Provider initiates session from Today view
2. System creates Zoom meeting via API
3. Both participants join via embedded SDK
4. Audio stream sent to transcription service
5. Real-time transcript displayed in UI
6. Session ends, recording processed
7. Transcript attached to session record

## UI/UX Considerations
- Minimize cognitive load during sessions
- Clear visual indicators for recording status
- Easy access to session controls
- Responsive layout for video + transcript
- Accessibility features (captions, high contrast)

## Next Steps
1. Set up mock video interface (Phase 1)
2. Implement session state management
3. Create transcript component with mock data
4. Plan Phase 2 Zoom SDK integration timeline
