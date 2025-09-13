# LOSMAX: Goal and Task Management Application
## 1. Project Overview

LOSMAX is a modern, full-stack web application designed to help users track their goals and daily tasks. It provides a user-friendly interface for creating, updating, and managing personal and professional objectives. The application features a real-time component using WebSockets to ensure data is always synchronized across sessions.

The tech stack consists of:
- **Frontend:** A responsive single-page application (SPA) built with React, TypeScript, Vite, and Tailwind CSS for styling.
- **Backend:** A robust API server built with Python, FastAPI, and MongoDB for data persistence.
- **Additional Features:** Internationalization (i18n), theming system, admin panel, and smarter goals functionality.

## 2. Key Features

- **Goal Management:** Create, edit, and track personal and professional goals with progress monitoring.
- **Task Management:** Organize daily tasks with status tracking and categorization.
- **Smarter Goals:** Advanced goal-setting features based on SMART criteria (see docs/smarter_goals_design.md).
- **Real-time Updates:** WebSocket integration for live synchronization across devices.
- **User Management:** Role-based access control with admin capabilities.
- **Internationalization:** Support for multiple languages (English and Chinese).
- **Theming:** Dark/light mode with customizable themes.
- **Admin Panel:** User management, system monitoring, and configuration.
- **Responsive Design:** Mobile-friendly interface with bottom navigation.

---

## 3. Development Environment

In the local development setup, the frontend and backend services run independently and communicate directly.

### Frontend
- **Framework:** React / Vite
- **URL** `http://localhost:4100`
- **API Connection:** The app reads the API base URL from `frontend/.env.development` (`VITE_API_BASE_URL`, typically `http://localhost:4000`). No dev proxy is configured in `frontend/vite.config.ts`.

### Backend
- **Framework:** FastAPI / Python
- **URL** `http://localhost:4000`
- **Execution:** The backend is typically run directly using `uvicorn` for live reloading (e.g., `uvicorn main:app --reload --host 0.0.0.0 --port 4000`).
- **Environment:** Controlled by `APP_ENV` (development/production). Loads `backend/.env.development` or `backend/.env.production` (see `backend/config/settings.py`).
- **Required vars:** `MONGODB_URL`, `SECRET_KEY`, `REFRESH_SECRET_KEY` (optional: `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS`, `REFRESH_TOKEN_ROTATION`, `ALGORITHM`).

---

## 4. Production Environment

In the production environment, the application is deployed on a single server, with Nginx acting as a reverse proxy and PM2 managing the backend process.

### Frontend
- **Service:** Nginx
- **URL** `https://los.studiodtw.net`
- **Details:** Nginx serves the static, optimized build of the React application located at `/var/www/los-frontend`. The `location /` block in the Nginx configuration (`nginx/los.studiodtw.net`) handles all non-API requests by serving the frontend's `index.html` file.
- **Build:** From `frontend/`, run `npm install && npm run build` and deploy the contents of `frontend/dist/` to `/var/www/los-frontend`.

### Backend
- **Service:** PM2 / Gunicorn / Uvicorn
- **URL** `http://127.0.0.1:4000` (not directly accessible)
- **Details:** The FastAPI backend is managed as a persistent background process by PM2, as defined in `ecosystem.config.js`. PM2 runs the application using Gunicorn as a process manager and Uvicorn as the ASGI server.

### Reverse Proxy and Routing
- **Service:** Nginx
- **Configuration:** `nginx/los.studiodtw.net` (located in nginx/ directory)
- **HTTP API:** All incoming requests to `https://los.studiodtw.net/api/` are proxied by Nginx to the backend service running at `http://127.0.0.1:4000/`. The `/api/` prefix is stripped from the request path before it is sent to the backend.
- **WebSocket API:** All WebSocket connections to `wss://los.studiodtw.net/ws/` are proxied by Nginx to the backend's WebSocket endpoint at `http://127.0.0.1:4000/ws/`.

## 5. Documentation

- [Project Structure Overview](docs/ProjectStructureOverview.md)
- [Smarter Goals Design](docs/smarter_goals_design.md)
- [Smarter Goals Migration Plan](docs/smarter_goals_migration_plan.md)
- [I18N Migration Guide](I18N_MIGRATION_GUIDE.md)
- [Frontend Design System](frontend/DESIGN_SYSTEM.md)
- [Migration Checklist](frontend/MIGRATION_CHECKLIST.md)

## 6. How to Run Locally

### Frontend
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server (runs at `http://localhost:4100`): `npm run dev`

### Backend
1. Navigate to the backend directory: `cd backend`
2. Create and activate a virtual environment: `python -m venv venv && source venv/bin/activate` (Linux/Mac). On Windows, create and activate a venv accordingly.
3. Install dependencies: `pip install -r requirements.txt`
4. Run the server on port 4000: `uvicorn main:app --reload --host 0.0.0.0 --port 4000`

### Additional Setup
- Ensure MongoDB is running locally or configure the connection string in `backend/.env.development`.
- For frontend, ensure Node.js is installed.
- For internationalization, locales are in `frontend/src/locales/`.

### Environment Files
- **Frontend (Vite)**
  - Development: `frontend/.env.development` (e.g., `VITE_API_BASE_URL=http://localhost:4000`)
  - Production: `frontend/.env.production` (e.g., `VITE_API_BASE_URL=https://los.studiodtw.net/api`)
- **Backend (FastAPI)**
  - Development: `backend/.env.development` (used when `APP_ENV` is not `production`)
  - Production: `backend/.env.production` (used when `APP_ENV=production`)

---

## 7. React Query Migration (Server State)

The frontend has been refactored to use React Query for all backend server state.

- **Hooks-first usage** (components/pages should not call `services/api.ts` directly):
  - Goals: `useGoals`, `useCreateGoal`, `useUpdateGoal`, `useDeleteGoal`, `useToggleGoalStatus`
  - Tasks: `useTasks`, `useCreateTask`, `useUpdateTask`, `useDeleteTask`, `useToggleTaskStatus` (optimistic)
  - Admin: `useAdminUsers`, `useDeleteAdminUser`, `useUpdateAdminUserRole`, `useAdminUserDetails`
  - Preferences: `usePreferences`, `useUpdatePreferences`, `useChangePassword`, `useUpdateName`, `useDeleteAccount`
- **Centralized config/keys**:
  - `src/lib/queryClient.ts`: environment-tuned defaults (dev/test/prod)
  - `src/lib/queryKeys.ts`: stable query keys
- **Auth redirect**: centralized `AUTH_ROUTE` (`src/routes/constants.ts`), 401 redirect with `returnTo` via axios interceptor.
- **Optimistic updates**: used for toggling task status with rollback on error.

### Testing Setup

- **Runner**: Vitest (jsdom)
- **MSW**: `src/test/server.ts` for API mocking
- **Hook tests**:
  - `src/test/hooks/useTasks.optimistic.test.tsx`
  - `src/test/hooks/usePreferences.test.tsx`
  - `src/test/hooks/useAdmin.test.tsx`

Run tests:

```bash
cd frontend
npm run test
```

---

## 8. Dev Commands

```bash
# Frontend
cd frontend
npm run dev     # start app
npm run build   # build
npm run lint    # lint
npm run test    # tests (Vitest)