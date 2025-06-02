# Architecture for LOSMAX Application

This document outlines the architecture for the LOSMAX application, a full-stack web application built with Python (FastAPI) for the backend, React with TypeScript for the frontend, and MongoDB as the database. It includes email/password authentication with CORS and CSRF protection, token management via httpOnly cookies, WebSocket-based auth state management, and i18n support for English and Chinese translations. The architecture supports local development and production environments with `.env` files and follows best practices for file structure, naming conventions, and state management.

## File and Folder Structure

The project is organized into the following top-level directories and files:

```
LOSMAX/
├── backend/                    # Backend application (FastAPI)
├── frontend/                   # Frontend application (React with TypeScript)
├── docs/                       # Documentation files
├── certs/                      # SSL/TLS certificates for local development
├── .gitignore                  # Git ignore file
├── LICENSE                     # License file
├── deploy-backend.sh           # Deployment script for backend
├── deploy-frontend.sh          # Deployment script for frontend
└── README.md                   # Project README
```

### Backend Structure

The `backend/` directory contains the FastAPI application with the following structure:

```
backend/
├── main.py                     # Entry point for the FastAPI application
├── config/                     # Configuration files
│   ├── __init__.py
│   ├── settings.py             # Application settings
│   ├── .env                    # Environment variables (not committed)
│   ├── .env.development        # Development environment variables
│   └── .env.production         # Production environment variables
├── controllers/                # Optional request handlers (routes can call services directly)
│   ├── __init__.py
│   ├── auth_controller.py
│   ├── user_controller.py
│   ├── task_controller.py
│   ├── goals_controller.py
│   ├── progress_controller.py
│   ├── settings_controller.py
│   └── admin_controller.py
├── models/                     # Data models for MongoDB
│   ├── __init__.py
│   ├── user.py
│   ├── task.py
│   ├── goal.py
│   ├── progress.py
│   └── settings.py
├── routes/                     # API route definitions
│   ├── __init__.py
│   ├── auth.py
│   ├── user.py
│   ├── task.py
│   ├── goals.py
│   ├── progress.py
│   ├── settings.py
│   └── admin.py
├── services/                   # Business logic and utility functions
│   ├── __init__.py
│   ├── auth_service.py
│   ├── user_service.py
│   ├── task_service.py
│   ├── goals_service.py
│   ├── progress_service.py
│   ├── settings_service.py
│   ├── admin_service.py
│   └── websocket_service.py
├── middleware/                 # Custom middleware
│   ├── __init__.py
│   ├── cors.py
│   └── csrf.py
├── utils/                      # General utility functions
│   ├── __init__.py
│   ├── logger.py
│   └── helpers.py
└── tests/                      # Unit and integration tests
    ├── __init__.py
    ├── test_auth.py
    └── test_user.py
```

### Frontend Structure

The `frontend/` directory contains the React application with the following structure:

```
frontend/
├── src/
│   ├── App.tsx                 # Root component
│   ├── index.tsx               # Renders the React application
│   ├── index.css               # Global CSS styles
│   ├── i18n.ts                 # Internationalization configuration
│   ├── components/             # Reusable UI components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── dialogs/
│   │   ├── goals/
│   │   ├── progress/
│   │   ├── settings/
│   │   ├── admin/
│   │   └── ui/                 # UI component library (e.g., Shadcn UI)
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useTasks.ts
│   ├── pages/                  # Top-level components for different views
│   │   ├── AuthPage.tsx
│   │   ├── DashboardPage/
│   │   ├── TasksPage/
│   │   ├── GoalsPage/
│   │   ├── ProgressPage/
│   │   ├── SettingsPage/
│   │   └── AdminPage/
│   ├── routes/                 # Client-side routing
│   │   ├── index.tsx
│   │   ├── userRoutes.tsx
│   │   └── adminRoutes.tsx
│   ├── services/               # API client and related services
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── websocket.ts
│   ├── utils/                  # Utility functions
│   │   ├── auth.ts
│   │   └── validation.ts
│   ├── locales/                # Translation files
│   │   ├── en.json
│   │   └── zh.json
│   └── types/                  # TypeScript type definitions
│       ├── index.ts
│       └── auth.ts
├── package.json                # Frontend dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tsconfig.node.json          # TypeScript configuration for Node
├── vite.config.ts              # Vite build tool configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── vitest.config.ts            # Vitest testing framework configuration
└── index.html                  # Main HTML entry point
```

## Architecture Components

### Frontend (Mobile-First Approach)

- **React Application**: Built with TypeScript using Vite, with mobile-first responsive design principles
- **Responsive Design**: All components built mobile-first with progressive enhancement for larger screens
- **Touch Optimization**: UI elements sized for touch interaction (minimum 48x48px touch targets)
- **Performance**: Optimized bundle size and lazy loading for mobile networks
- **Components**: Organized into categories such as `auth`, `dashboard`, `dialogs`, `goals`, `progress`, `settings`, `admin`, and a `ui` library for reusable components.
- **Hooks**: Custom hooks like `useAuth` and `useTasks` manage state and side effects.
- **Pages**: Top-level components for views, e.g., `AuthPage`, `DashboardPage`, `TasksPage`, `GoalsPage`, `ProgressPage`, `SettingsPage`, and `AdminPage`.
- **Routes**: Client-side routing to navigate between pages.
- **Services**: API client for HTTP requests to the backend and WebSocket service for real-time updates.
- **Utils**: Utility functions for authentication, validation, etc.
- **i18n**: Internationalization with `en.json` and `zh.json` translation files.

### Backend

- **FastAPI Server**: Manages API requests, WebSocket connections, and serves as the backend.
- **Services**: Contain business logic for authentication, user management, task management, goals tracking, progress monitoring, settings configuration, admin functions, and WebSocket handling. Routes call services directly.
- **Models**: Define MongoDB data structures for users, tasks, goals, progress tracking, and settings.
- **Routes**: Map API endpoints to controllers.
- **Services**: Contain business logic for authentication, user management, task management, goals tracking, progress monitoring, settings configuration, admin functions, and WebSocket handling.
- **Middleware**: Implement CORS and CSRF protection.
- **Utils**: General utility functions like logging and helpers.
- **Database**: MongoDB stores persistent data such as users and tasks.

### Authentication

- **Login**: Users submit email and password to the backend.
- **Token Management**: Backend verifies credentials, generates a token, and stores it in an httpOnly cookie.
- **WebSocket**: Real-time auth state updates are pushed to the client.

### i18n

- **Translation Files**: `en.json` and `zh.json` for English and Chinese.
- **Library**: `react-i18next` handles translations in the frontend.

### Environment Management

- **Backend**: `python-dotenv` loads environment variables from `.env`, `.env.development`, or `.env.production`.
- **Frontend**: Vite manages environment variables from `.env` files.

## State Management and Services Connection

### State Management

- **Frontend**:
  - **Global State**: Managed with React Context or Redux for shared data like authentication status.
  - **Component State**: Local state within components for UI-specific data.
  - **WebSocket State**: Real-time auth updates received via WebSocket.

- **Backend**:
  - **Stateless API**: FastAPI processes requests without maintaining state.
  - **Database State**: Persistent data stored in MongoDB.

### Services Connection

- **Frontend to Backend**:
  - **HTTP Requests**: Handle CRUD operations and authentication.
  - **WebSocket**: Provides real-time auth state updates.

- **Backend to Database**:
  - **MongoDB Driver**: `pymongo` or an ORM like `MongoEngine` facilitates database interactions.

## Best Practices

- **File Naming**: Descriptive and consistent (e.g., `auth_service.py`, `AuthPage.tsx`).
- **Function Naming**: Clear and concise (e.g., `login_user`, `fetch_tasks`).
- **Code Organization**: Related files grouped in directories (e.g., `controllers/`, `components/`).
- **Error Handling**: Try-except blocks in the backend, error boundaries in the frontend.
- **API Route Standardization**:
  - All endpoints must use response_model for consistent responses
  - Include user_id in responses where relevant
  - Use HTTPException with status codes from status module
  - Log all operations (success/error) with relevant context
  - Broadcast state changes via WebSocket where applicable
  - Follow consistent endpoint organization:
    - POST /items - Create
    - GET /items - List
    - GET /items/{id} - Retrieve
    - PUT /items/{id} - Update
    - DELETE /items/{id} - Delete
- **Security**:
  - CORS enabled with specific origins.
  - CSRF protection for forms.
  - httpOnly and secure flags on cookies.
  - Input validation and sanitization.

## Mobile-First Implementation

The application follows strict mobile-first design principles with these key implementations:

### Responsive Design
- **Tailwind CSS Setup** (Phase 5, tasks.md)
  - Installed via `npm install -D tailwindcss postcss autoprefixer`
  - Initialized with `npx tailwindcss init -p`
  - Configured in `tailwind.config.js` and `index.css`

### Component Optimization
- **Lazy Loading**: Components loaded dynamically using `React.lazy`
- **Memoization**: List items optimized with `React.memo`
- **Performance Testing**: Verified on mobile emulators

### Touch Optimization
- Minimum 48x48px touch targets
- Gesture support for key interactions
- Mobile-friendly form controls

### Performance
- Code splitting for reduced bundle size
- Optimized asset delivery
- Efficient state management
- Mobile network performance testing

## Feature-Specific Architecture

### Goals Management System
- **Frontend**:
  - `GoalsPage` component handles goal creation/editing
  - Category selection dropdown with validation
  - Error handling for category limits (max 3 active goals per category)
  - `goals/` components for UI elements like goal cards, forms
  - Custom hooks for goal state management
- **Backend**:
  - `goals_controller.py` handles API requests
  - `goal.py` model with fields:
    - `id`, `user_id`, `title`, `description`
    - `category` (validated against CATEGORIES constant)
    - `status` (active/completed)
    - `created_at`, `updated_at`
  - `goals_service.py` business logic:
    - Category validation
    - Active goal limits enforcement
    - Status transitions
  - Dedicated routes in `goals.py`

### Task Management System
- **Frontend**:
  - `TasksPage` component for task management
  - Goal association via dropdown
  - Status workflow visualization (todo/in_progress/done)
  - Integration with GoalsPage
- **Backend**:
  - `task_controller.py` handles API requests
  - `task.py` model with fields:
    - `id`, `user_id`, `goal_id`
    - `title`, `description`
    - `status` (todo/in_progress/done)
    - `created_at`, `updated_at`
  - `task_service.py` business logic:
    - Goal validation (must belong to user)
    - Status transitions
  - Dedicated routes in `task.py`

### Progress Tracking
- **Frontend**:
  - `ProgressPage` displays progress metrics
  - `progress/` components for charts/visualizations
  - Integration with goals system
- **Backend**:
  - `progress_controller.py` handles tracking requests
  - `progress.py` model stores progress data
  - `progress_service.py` calculates metrics
  - Routes in `progress.py`

### Settings Management
- **Frontend**:
  - `SettingsPage` for user preferences
  - `settings/` components for forms/controls
  - Persists to backend via API
- **Backend**:
  - `settings_controller.py` handles settings CRUD
  - `settings.py` model stores preferences
  - `settings_service.py` applies settings
  - Routes in `settings.py`

### Admin/User Management
- **Frontend**:
  - `AdminPage` for admin dashboard
  - `admin/` components for user management
  - Restricted to admin users only
- **Backend**:
  - `admin_controller.py` handles admin functions
  - Extended `user.py` model for admin fields
  - `admin_service.py` contains admin logic
  - Protected routes in `admin.py`

This architecture provides a scalable, maintainable foundation for the LOSMAX application, meeting all specified requirements and adhering to best practices.