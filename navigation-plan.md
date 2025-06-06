# Navigation Transformation Plan

This document outlines the plan for transforming the application's navigation from the current chat-based layout to the new EHR-focused layout as described in the product vision.

## 1. Current vs. New Navigation

-   **Current Navigation (`components/app-sidebar.tsx`)**:
    -   A single "New Chat" button.
    -   A list of previous chat sessions (`SidebarHistory`).
    -   A user profile/logout section in the footer.
    -   The primary purpose is to manage chat sessions.

-   **New Navigation (`product_vision.md`)**:
    -   A collapsible left vertical navigation bar (60px collapsed, 220px expanded).
    -   A top bar for transient actions (quick-add, search, profile, status).
    -   A main content area (`Active Workspace`).
    -   A context-sensitive right-side drawer.
    -   The navigation is role-based and mission-critical.

## 2. New Navigation Items & Icon Selection

The new sidebar will contain the following 8 items. The icons will be sourced from the `lucide-react` library to maintain a consistent and professional look. No custom icons are required for this change.

### Icon Mapping

| Label             | Route (Proposed)          | `lucide-react` Icon | Rationale                                   |
| :---------------- | :------------------------ | :------------------ | :------------------------------------------ |
| **Today**         | `/app/dashboard/today`    | `Home`              | Universally understood for the main page.   |
| **Calendar**      | `/app/dashboard/calendar` | `Calendar`          | Direct and clear representation.            |
| **Live Sessions** | `/app/dashboard/sessions` | `Radio`             | Suggests a live broadcast or stream.        |
| **Drafts**        | `/app/dashboard/drafts`   | `FileText`          | Represents text documents waiting for review. |
| **Supervisor**    | `/app/dashboard/supervisor`| `CheckSquare`       | Implies approval and oversight tasks.       |
| **Billing**       | `/app/dashboard/billing`  | `DollarSign`        | Clearly associated with financial matters.  |
| **Analytics**     | `/app/dashboard/analytics`| `BarChart2`         | A standard icon for data and analytics.     |
| **Settings**      | `/app/dashboard/settings` | `Settings`          | The universal icon for application settings.|

### Role-Based Access Control (RBAC)

| Route                       | Required Role(s)                |
| :-------------------------- | :------------------------------ |
| `/app/dashboard/today`      | All authenticated users         |
| `/app/dashboard/calendar`   | All authenticated users         |
| `/app/dashboard/sessions`   | `provider`, `supervisor`        |
| `/app/dashboard/drafts`     | `provider`, `supervisor`        |
| `/app/dashboard/supervisor` | `supervisor` only               |
| `/app/dashboard/billing`    | `provider`, `supervisor`, `admin` |
| `/app/dashboard/analytics`  | `supervisor`, `admin`           |
| `/app/dashboard/settings`   | All authenticated users         |

## 3. Implementation Plan

1.  **Create a new route structure**: A new `/app/(dashboard)` route group will be created to house all the new EHR pages. The existing `/(chat)` group will eventually be deprecated or repurposed.
2.  **Update `app-sidebar.tsx`**:
    -   Remove the existing chat history logic.
    -   Add the 8 new navigation items as a list of links, using the proposed icons and routes.
    -   Implement the collapsible behavior (60px to 220px on hover/click) using the existing `Sidebar` component's state.
    -   Add tooltips that appear on hover when the sidebar is collapsed.
3.  **Create `top-bar.tsx`**:
    -   Create a new `TopBar` component for the header.
    -   It will contain a quick-add button, a global search input, the user profile menu, and connection status indicators.
    -   This will be integrated into the main layout.
4.  **Update Layouts**:
    -   The main layout for the dashboard (`/app/(dashboard)/layout.tsx`) will be updated to include the new `AppSidebar` and the `TopBar`.
    -   The layout will also need a placeholder for the right-side context drawer (likely using the `Sheet` component).
5.  **Implement RBAC**: The visibility of navigation links will be controlled based on the user's role, which will be stored in the `user` session object.

This plan provides a clear path to transform the UI to match the product vision, starting with the core navigation structure.
