# Project Structure Overview: LOSMAX Application

The project located at `/Users/dawei/Coding/Webapp/LOSMAX` is a full-stack web application, built with Python/FastAPI for the backend and React/TypeScript for the frontend.

## Project Structure Overview

The project is organized into several top-level directories:

*   [`backend/`](../backend/): Contains the server-side application logic.
*   [`frontend/`](../frontend/): Contains the client-side application logic.
*   [`docs/`](../docs/): Contains project documentation.
*   Root-level configuration files: `package.json`, `package-lock.json`, `.gitignore`, `LICENSE`, and various deployment scripts like `deploy-backend.sh`, `deploy-frontend.sh`, `deploy-nginx-los.sh`, `ecosystem.config.js`, `losmax-nginx.conf`.

## Detailed Breakdown

### 1. Backend (`backend/`)

This directory houses the server-side application using Python and FastAPI.

*   **Configuration & Build**:
    *   [`requirements.txt`](../backend/requirements.txt): Defines project dependencies.
    *   [`config/settings.py`](../backend/config/settings.py): Application settings and configuration.
    *   Environment selection via `APP_ENV`: loads `backend/.env.development` or `backend/.env.production` (see `config/settings.py`).
*   **Source Code**:
    *   [`main.py`](../backend/main.py): The main entry point for the FastAPI application.
    *   [`database.py`](../backend/database.py): Database connection and setup.
    *   [`models/`](../backend/models/): Defines data models (e.g., `goal.py`, `task.py`, `user.py`).
    *   [`routes/`](../backend/routes/): Defines API endpoints (e.g., `admin.py`, `auth.py`, `goals.py`, `preferences.py`, `task.py`, `websocket.py`).
    *   [`services/`](../backend/services/): Contains business logic (e.g., `admin_service.py`, `auth_service.py`, `goal_service.py`, `preferences_service.py`, `task_service.py`).
    *   [`middleware/`](../backend/middleware/): Middleware for request processing (e.g., `cors.py`).
    *   [`utils/`](../backend/utils/): Utility functions (e.g., `constants.py`).

### 2. Frontend (`frontend/`)

This directory contains the client-side application, a React application.

*   **Configuration & Build**:
    *   [`package.json`](../frontend/package.json): Defines frontend dependencies and scripts.
    *   [`tsconfig.json`](../frontend/tsconfig.json), [`tsconfig.node.json`](../frontend/tsconfig.node.json), [`tsconfig.app.json`](../frontend/tsconfig.app.json): TypeScript configurations for the frontend.
    *   [`vite.config.ts`](../frontend/vite.config.ts): Vite build tool configuration.
    *   [`tailwind.config.js`](../frontend/tailwind.config.js): Tailwind CSS configuration.
    *   [`eslint.config.js`](../frontend/eslint.config.js): ESLint configuration.
    *   [`index.html`](../frontend/index.html): The main HTML entry point.
    *   [`README.md`](../frontend/README.md): Frontend-specific documentation.
    *   [`DESIGN_SYSTEM.md`](../frontend/DESIGN_SYSTEM.md): Design system documentation.
*   **Source Code (`frontend/src/`)**:
    *   [`App.tsx`](../frontend/src/App.tsx): The root component of the React application.
    *   [`main.tsx`](../frontend/src/main.tsx): Renders the React application into the DOM.
    *   [`index.css`](../frontend/src/index.css): Global CSS styles.
    *   [`theme-system.css`](../frontend/src/styles/theme-system.css): Theme tokens and CSS variables.
    *   [`utility-system.css`](../frontend/src/styles/utility-system.css): Utility classes and helpers.
    *   [`theme-animations.css`](../frontend/src/styles/theme-animations.css): Animation tokens and presets.
    *   [`theme-transition.css`](../frontend/src/styles/theme-transition.css): Theme transition helpers.
    *   [`timepicker.css`](../frontend/src/styles/timepicker.css): Styles for the TimePicker component.
    *   [`THEME_GUIDELINES.md`](../frontend/src/styles/THEME_GUIDELINES.md): Theming guidelines.
    *   [`i18n.ts`](../frontend/src/i18n.ts): Internationalization configuration.
    *   [`components/`](../frontend/src/components/): Reusable UI components, including `ProtectedRoute.tsx`, `RoleBasedRedirect.tsx`, and subdirectories like `dashboard/`, `goals/`, `progress/`, `tasks/`, `ui/`.
    *   UI documentation: [`CARD_DOCUMENTATION.md`](../frontend/src/components/ui/CARD_DOCUMENTATION.md), [`SELECT_DOCUMENTATION.md`](../frontend/src/components/ui/SELECT_DOCUMENTATION.md)
    *   [`contexts/`](../frontend/src/contexts/): React contexts for UI-only state (e.g., `AuthContext.tsx`, `ThemeContext.tsx`).
    *   [`hooks/`](../frontend/src/hooks/): Custom React hooks. Server state is managed exclusively via React Query hooks:
        * Goals: `useGoals`, `useCreateGoal`, `useUpdateGoal`, `useDeleteGoal`, `useToggleGoalStatus`
        * Tasks: `useTasks`, `useCreateTask`, `useUpdateTask`, `useDeleteTask`, `useToggleTaskStatus`
        * Admin: `useAdminUsers`, `useDeleteAdminUser`, `useUpdateAdminUserRole`, `useAdminUserDetails`
        * Preferences: `usePreferences`, `useUpdatePreferences`, `useChangePassword`, `useUpdateName`, `useDeleteAccount`
    *   [`lib/`](../frontend/src/lib/): Shared React Query configuration
        * `queryClient.ts`: environment-tuned defaults (dev/test/prod)
        * `queryKeys.ts`: centralized, stable query keys
    *   [`locales/`](../frontend/src/locales/): Translation files (e.g., `en-new.json`, `zh-new.json`). See also [`scripts/i18n-migrate.js`](../frontend/scripts/i18n-migrate.js) and [`MIGRATION_CHECKLIST.md`](../frontend/MIGRATION_CHECKLIST.md).
    *   [`pages/`](../frontend/src/pages/): Top-level page components (e.g., `AdminPage.tsx`, `AuthPage.tsx`, `DashboardPage.tsx`, `GoalsPage.tsx`, `ProfilePage.tsx`, `ProgressPage.tsx`, `TasksPage.tsx`).
    *   [`routes/`](../frontend/src/routes/): Defines client-side routing (e.g., `MainLayoutRoutes.tsx`) and constants (e.g., `routes/constants.ts` with `AUTH_ROUTE`).
    *   [`services/`](../frontend/src/services/): Low-level services (e.g., `api.ts` for goal/task endpoints used by hooks, `auth.ts` for login/logout/refresh, `websocket.ts`). Components/pages do not call services directly; they use hooks.
    *   [`types/`](../frontend/src/types/): TypeScript type definitions (e.g., `goals.ts`).

*   **Testing (`frontend/`)**:
    *   Vitest config: `vitest.config.ts` (jsdom), setup file: `src/test/setup.ts`
    *   MSW server/handlers: `src/test/server.ts`
    *   Hook tests: `src/test/hooks/*` (e.g., `useTasks.optimistic.test.tsx`, `usePreferences.test.tsx`, `useAdmin.test.tsx`)

### 3. Other Important Directories/Files

*   [`docs/`](../docs/): Contains markdown documentation files like `smarter_goals_design.md`, `smarter_goals_migration_plan.md`, `ProjectStructureOverview.md`.
*   Root-level scripts: `deploy-backend.sh`, `deploy-frontend.sh`, `deploy-nginx-los.sh`, `ecosystem.config.js`, `losmax-nginx.conf` indicate deployment and server management configurations.
*   `.gitignore`, `LICENSE`: Standard project files.

### High-Level Architecture Diagram

```mermaid
graph TD
    User -->|HTTP/HTTPS| Frontend(Frontend Application)
    Frontend -->|API Calls| Backend(Backend API Server)
    Backend -->|Database Operations| Database(Database)

    subgraph Frontend Application
        F1[React Components] --> F2[Hooks]
        F1 --> F3[Pages]
        F3 --> F4[Routes]
        F2 --> F5[React Query (Client/Keys)]
        F2 --> F6[Services (API/Auth/WebSocket)]
        F6 --> F7[Backend API]
        F1 --> F9[UI Components]
        F1 --> F10[Contexts (UI-only)]
        F10 --> F1[React Components]
    end

    subgraph Backend API Server
        B1[FastAPI Server] --> B2[Routes]
        B2 --> B3[Services]
        B3 --> B4[Models]
        B3 --> B5[Middleware]
        B4 --> Database
    end

    Docs(Documentation)

    style Frontend fill:#f9f,stroke:#333,stroke-width:2px
    style Backend fill:#bbf,stroke:#333,stroke-width:2px
    style Database fill:#cfc,stroke:#333,stroke-width:2px
    style Docs fill:#ffc,stroke:#333,stroke-width:2px