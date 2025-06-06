# Codebase Analysis

This document provides an analysis of the existing codebase to inform the conversion of the Next.js chatbot application into a healthcare EHR system.

## 1. Folder Structure

The project follows a standard Next.js `app` directory structure.

-   **/app**: Contains the application's routes and layouts.
    -   **/(auth)**: Authentication-related pages and API routes (`login`, `register`, `auth.ts`).
    -   **/(chat)**: The main chat interface, including layouts, pages, and API routes for chat functionality.
-   **/components**: Reusable React components.
    -   **/ui**: UI components, likely from a library like shadcn/ui.
-   **/lib**: Core logic, utilities, and external service integrations.
    -   **/ai**: AI-related logic, including models, providers, and tools.
    -   **/db**: Database-related files, including the schema (`schema.ts`), migrations, and queries.
-   **/artifacts**: Components and logic for handling different types of "artifacts" (code, images, sheets, text).
-   **/hooks**: Custom React hooks.
-   **/tests**: End-to-end and other tests.
-   **/public**: Static assets.

## 2. Major Dependencies

Based on `package.json`, the key dependencies are:

-   **Framework**: `next@15.3.0-canary.31`
-   **React**: `react@19.0.0-rc`
-   **AI/LLM**:
    -   `@ai-sdk/openai`: OpenAI provider for the AI SDK.
    -   `@ai-sdk/react`: React hooks and components for the AI SDK.
    -   `ai`: Vercel AI SDK for building chat interfaces.
-   **Database/ORM**:
    -   `drizzle-orm`: TypeScript ORM for the database.
    -   `drizzle-kit`: Tooling for Drizzle ORM (migrations, studio).
    -   `@vercel/postgres`: Vercel's Postgres client.
    -   `postgres`: Node.js PostgreSQL client.
-   **Authentication**: `next-auth@5.0.0-beta.25`
-   **UI Components & Styling**:
    -   `@radix-ui/*`: Primitives for building accessible UI components.
    -   `lucide-react`: Icon library.
    -   `tailwind-merge`, `tailwindcss-animate`: Utilities for Tailwind CSS.
    -   `sonner`: Toast notifications.
    -   `react-resizable-panels`: Resizable panel components.
-   **Code Editor/Diff**:
    -   `codemirror`, `@codemirror/*`: Code editor components.
    -   `diff-match-patch`: For viewing differences in text.
-   **Form/Schema Validation**: `zod`
-   **Linting/Formatting**: `biomejs`, `eslint`, `prettier`

## 3. Authentication Flow

The authentication is handled by `next-auth`.

1.  **Middleware (`middleware.ts`)**:
    -   It intercepts requests to protected routes.
    -   If a user is not authenticated (no valid JWT), it redirects them to a guest authentication endpoint (`/api/auth/guest`).
    -   This creates a temporary guest user, allowing access to the application without registration.
    -   It prevents authenticated, non-guest users from accessing `/login` or `/register`.

2.  **Providers (`app/(auth)/auth.ts`)**:
    -   **Credentials (Standard)**: Handles login for registered users by comparing a hashed password from the database.
    -   **Credentials (Guest)**: A separate provider with the `id: 'guest'` creates a new guest user in the database and signs them in.

3.  **Session Management**:
    -   The `jwt` and `session` callbacks in `next-auth` are used to add the user's `id` and `type` ('guest' or 'regular') to the session object, making it available throughout the application.

## 4. Routing Structure

-   **Root Layout (`app/layout.tsx`)**: The main layout for the entire application. It sets up the `ThemeProvider`, `SessionProvider`, and `Toaster`.
-   **Chat Layout (`app/(chat)/layout.tsx`)**: This layout wraps the core chat interface. It includes the `AppSidebar` and a `SidebarInset` for the main content.
-   **Auth Routes (`app/(auth)/*`)**: Handles user login and registration pages.
-   **API Routes (`app/api/*`)**:
    -   `/api/auth/[...nextauth]`: The catch-all route for `next-auth`.
    -   `/api/chat`: Handles chat message creation and streaming.
    -   `/api/document`: For creating and managing documents/artifacts.
-   **Middleware (`middleware.ts`)**: The `matcher` config specifies which routes are protected and require authentication (either guest or regular). It covers the root, chat, and API routes.

## 5. Database Schema (`lib/db/schema.ts`)

The current schema is designed for a chatbot application.

-   **`user`**: Stores user information (id, email, password).
-   **`chat`**: Represents a single chat conversation, linked to a user.
-   **`message_v2`**: Stores individual messages within a chat, including their role and content `parts`.
-   **`vote_v2`**: Tracks user votes (up/down) on messages.
-   **`document`**: A generic table for different kinds of artifacts (text, code, image, sheet) created by the user.
-   **`suggestion`**: For suggesting changes to documents.
-   **`stream`**: Appears to be related to streaming data for chats.

There are also deprecated tables (`Message`, `Vote`) that are being replaced by newer versions (`Message_v2`, `Vote_v2`). This indicates an evolving schema.
