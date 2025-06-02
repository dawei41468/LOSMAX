# Project Structure Overview: LOS Application

The project located at `/Users/dawei/Coding/Webapp/LOS` appears to be a full-stack web application, likely built with Node.js/TypeScript for the backend and React/TypeScript for the frontend.

## Project Structure Overview

The project is organized into several top-level directories:

*   [`backend/`](../LOS/backend/): Contains the server-side application logic.
*   [`frontend/`](../LOS/frontend/): Contains the client-side application logic.
*   [`certs/`](../LOS/certs/): Stores SSL/TLS certificates, likely for local development.
*   [`docs/`](../LOS/docs/): Contains project documentation.
*   Root-level configuration files: `package.json`, `package-lock.json`, `yarn.lock`, `tailwind.config.js`, `vite.config.ts`, `.gitignore`, `LICENSE`, and various deployment scripts.

## Detailed Breakdown

### 1. Backend (`backend/`)

This directory houses the server-side application.

*   **Configuration & Build**:
    *   [`package.json`](../LOS/backend/package.json): Defines project metadata, dependencies, and scripts.
    *   [`tsconfig.json`](../LOS/backend/tsconfig.json): TypeScript configuration for the backend.
    *   [`jest.config.ts`](../LOS/backend/jest.config.ts): Jest testing framework configuration.
*   **Source Code (`backend/src/`)**:
    *   [`server.ts`](../LOS/backend/src/server.ts): Likely the main entry point for the backend application.
    *   [`controllers/`](../LOS/backend/src/controllers/): Handles incoming requests and orchestrates responses (e.g., `adminController.ts`, `auth.ts`, `tasks.ts`).
    *   [`database/`](../LOS/backend/src/database/): Contains database interaction logic (e.g., `DatabaseService.ts`).
    *   [`middleware/`](../LOS/backend/src/middleware/): Express middleware for request processing (e.g., `auth.ts`).
    *   [`models/`](../LOS/backend/src/models/): Defines data structures and interacts with the database (e.g., `Goal.ts`, `Task.ts`, `User.ts`).
    *   [`routes/`](../LOS/backend/src/routes/): Defines API endpoints and maps them to controllers (e.g., `admin.ts`, `auth.ts`, `goals.ts`).
    *   [`services/`](../LOS/backend/src/services/): Contains business logic and utility functions (e.g., `scheduler.service.ts`, `storage.service.ts`).
    *   [`types/`](../LOS/backend/src/types/): TypeScript type definitions for various entities and modules.
    *   [`utils/`](../LOS/backend/src/utils/): General utility functions (e.g., `logger.ts`, `requestUtils.ts`).
*   **Scripts (`backend/scripts/`)**:
    *   [`migrations/`](../LOS/backend/scripts/migrations/): Contains database migration scripts.
*   **Tests (`backend/tests/`)**:
    *   Unit and integration tests for backend components.

### 2. Frontend (`frontend/`)

This directory contains the client-side application, likely a React application.

*   **Configuration & Build**:
    *   [`package.json`](../LOS/frontend/package.json): Defines frontend dependencies and scripts.
    *   [`tsconfig.json`](../LOS/frontend/tsconfig.json), [`tsconfig.node.json`](../LOS/frontend/tsconfig.node.json): TypeScript configurations for the frontend.
    *   [`vite.config.ts`](../LOS/frontend/vite.config.ts): Vite build tool configuration.
    *   [`tailwind.config.js`](../LOS/frontend/tailwind.config.js): Tailwind CSS configuration.
    *   [`vitest.config.ts`](../LOS/frontend/vitest.config.ts): Vitest testing framework configuration.
    *   [`index.html`](../LOS/frontend/index.html): The main HTML entry point.
*   **Source Code (`frontend/src/`)**:
    *   [`App.tsx`](../LOS/frontend/src/App.tsx): The root component of the React application.
    *   [`index.tsx`](../LOS/frontend/src/index.tsx): Renders the React application into the DOM.
    *   [`index.css`](../LOS/frontend/src/index.css): Global CSS styles.
    *   [`i18n.ts`](../LOS/frontend/src/i18n.ts): Internationalization configuration.
    *   [`components/`](../LOS/frontend/src/components/): Reusable UI components, categorized by function (e.g., `auth/`, `Dashboard/`, `Dialogs/`, `Progress/`, `ui/`). The `ui/` directory likely contains a component library (e.g., Shadcn UI).
    *   [`hooks/`](../LOS/frontend/src/hooks/): Custom React hooks for encapsulating stateful logic (e.g., `useAuth.ts`, `useGoals.ts`).
    *   [`lib/`](../LOS/frontend/src/lib/): Core application logic and utilities, further categorized:
        *   [`api/`](../LOS/frontend/src/lib/api/): API client and related types/error handling.
        *   [`auth/`](../LOS/frontend/src/lib/auth/): Authentication services and token management.
        *   [`errors/`](../LOS/frontend/src/lib/errors/): Custom error handling.
        *   [`storage/`](../LOS/frontend/src/lib/storage/): Client-side storage utilities.
        *   [`theme/`](../LOS/frontend/src/lib/theme/): Theming related utilities (colors, icons).
        *   [`utils/`](../LOS/frontend/src/lib/utils/): General frontend utilities (e.g., `groupBy.ts`, `validation.ts`).
    *   [`locales/`](../LOS/frontend/src/locales/): Translation files (e.g., `en.json`, `zh.json`).
    *   [`pages/`](../LOS/frontend/src/pages/): Top-level components representing different application views (e.g., `AuthPage.tsx`, `DashboardPage/`, `GoalsPage/`).
    *   [`providers/`](../LOS/frontend/src/providers/): React context providers for global state management (e.g., `AuthProvider.tsx`, `ToastProvider.tsx`).
    *   [`routes/`](../LOS/frontend/src/routes/): Defines client-side routing (e.g., `index.tsx`, `userRoutes.tsx`, `adminRoutes.tsx`).
    *   [`types/`](../LOS/frontend/src/types/): TypeScript type definitions specific to the frontend.
    *   [`utils/`](../LOS/frontend/src/utils/): Frontend utility functions (e.g., `auth.ts`, `groupGoalsByCategory.ts`).

### 3. Other Important Directories/Files

*   [`certs/`](../LOS/certs/): Contains `localhost+2-key.pem` and `localhost+2.pem`, suggesting local HTTPS development setup.
*   [`docs/`](../LOS/docs/): Contains markdown documentation files like `ProgressPagePlan.md` and `websocket_auth_implementation.md`.
*   Root-level scripts: `deploy-backend.sh`, `deploy-frontend.sh`, `move-dist.sh`, `restart-servers.sh` indicate deployment and server management scripts.
*   `tailwind.config.js`, `vite.config.ts`: Global configuration files for Tailwind CSS and Vite, respectively.

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
        F2 --> F5[API Services]
        F5 --> F6[Auth Services]
        F5 --> F7[Storage Services]
        F5 --> F8[Utility Functions]
        F1 --> F9[UI Components]
        F1 --> F10[Context Providers]
        F10 --> F1[React Components]
    end

    subgraph Backend API Server
        B1[Express Server] --> B2[Routes]
        B2 --> B3[Controllers]
        B3 --> B4[Models]
        B3 --> B5[Services]
        B3 --> B6[Middleware]
        B4 --> Database
        B5 --> Database
    end

    Docs(Documentation)
    Certs(Certificates)
    DeploymentScripts(Deployment Scripts)

    style Frontend fill:#f9f,stroke:#333,stroke-width:2px
    style Backend fill:#bbf,stroke:#333,stroke-width:2px
    style Database fill:#cfc,stroke:#333,stroke-width:2px
    style Docs fill:#ffc,stroke:#333,stroke-width:2px
    style Certs fill:#ccf,stroke:#333,stroke-width:2px
    style DeploymentScripts fill:#fcf,stroke:#333,stroke-width:2px