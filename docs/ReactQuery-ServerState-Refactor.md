# React Query Server-State Refactor Plan (LOS App)

This document captures the agreed plan to migrate LOS frontend server data to React Query, while reserving React Context for UI-only concerns.

Last updated: 2025-09-13

## Goals

- Centralize all backend/server state in React Query (queries + mutations).
- Use React Context only for UI state (theme, language UI, modals, small cross-cutting flags).
- Keep axios client with JWT injection and refresh flow; align 401 redirects to `/auth` consistently.
- Provide stable query keys, predictable cache behavior, and clear invalidation rules.
- Add tests for hooks, especially optimistic updates.

## Current Findings (as of refactor start)

- `frontend/src/pages/GoalsPage.tsx` and `frontend/src/pages/TasksPage.tsx` fetch imperatively via `frontend/src/services/api.ts`, manage server data with `useState`, and handle refetch after mutations manually.
- `frontend/src/services/api.ts` defines `api` (axios) with token injection and refresh via `refreshToken()` in `frontend/src/services/auth.ts`. On refresh failure, it redirects to `/login` (mismatch with app route).
- `frontend/src/components/ProtectedRoute.tsx` redirects unauthenticated users to `/auth` (canonical route).
- `frontend/src/components/ui/language-toggle.tsx` is a good example of UI-only context usage plus API call to persist preferences when authenticated.
- No React Query provider or hooks exist yet.

## Step-by-step Implementation Plan

1) Align auth redirect path and constants (Step 0)
- Create `frontend/src/routes/constants.ts` with `export const AUTH_ROUTE = '/auth'`.
- Update `frontend/src/services/api.ts` interceptor to redirect to `AUTH_ROUTE` instead of `/login`.
- Add a guard: if already on `/auth`, do not redirect again.
- Optional: append `returnTo` query param to preserve the attempted path: `/auth?returnTo=<encoded>`.
- Use the same `AUTH_ROUTE` in `frontend/src/components/ProtectedRoute.tsx`.
- In `frontend/src/services/auth.ts`, after successful login/register, if a `returnTo` exists, navigate there instead of dashboard/admin default.

2) Add React Query provider at app root (Step 1)
- Create `frontend/src/lib/queryClient.ts` that exports a configured `queryClient`.
  - Suggested defaults: `staleTime: 15_000`, `refetchOnWindowFocus: false`, `retry: 1` (tune per env).
  - Global error handling to show toast only if not handled locally.
- Wrap the app with `QueryClientProvider` in `frontend/src/main.tsx` (or root file used).

3) Introduce query keys and shared utils (Step 2)
- Create `frontend/src/lib/queryKeys.ts` with stable keys:
  - `goals.list = (params: { status?: GoalStatus }) => ['goals', params]`
  - `goals.detail = (id: string) => ['goal', id]`
  - `tasks.list = (params: { status?: 'completed'|'incomplete'; filter?: 'today'|'all' }) => ['tasks', params]`
  - `tasks.detail = (id: string) => ['task', id]`
  - `user.self = () => ['user']`
  - `admin.users = (params: { page: number; limit: number }) => ['admin','users', params]`

4) Implement Goals hooks (Step 3)
- New hooks in `frontend/src/hooks/`:
  - `useGoals({ status })` (query)
  - `useCreateGoal()` (mutation)
  - `useUpdateGoal()` (mutation)
  - `useDeleteGoal()` (mutation)
  - `useToggleGoalStatus()` (mutation, internally calls update)
- Start simple: on success, invalidate affected lists (e.g., `queryClient.invalidateQueries(queryKeys.goals.list({ status }))`).

5) Refactor `GoalsPage.tsx` to hooks (Step 4)
- Replace imperative fetch + `useState` with `useGoals` for data and loading/error states.
- Replace `create/update/delete/toggle` calls with mutations from hooks.
- Keep UI state local (dialog open, selected filter).

6) Implement Tasks hooks (Step 5)
- New hooks in `frontend/src/hooks/`:
  - `useTasks({ status, filter })` (query)
  - `useCreateTask()` (mutation)
  - `useUpdateTask()` (mutation)
  - `useDeleteTask()` (mutation)
  - `useToggleTaskStatus()` (mutation) with optimistic updates:
    - Optimistically flip `status` for the item in `tasks.list` cache.
    - Roll back on error, show toast.
- Invalidate lists if necessary after success (especially for cross-list consistency).

7) Refactor `TasksPage.tsx` to hooks (Step 6)
- Remove `fetchUserTasks`, `tasks`/`goals` server-state `useState`, and manual loading flags.
- Use `useTasks` for tasks and `useGoals` for goals if needed, or create a `useGoals` with `status: 'active'` specifically.
- Use `useToggleTaskStatus` for instant UX with rollback.

8) Migrate remaining pages (Step 7)
- Admin users: `useAdminUsers({ page, limit })`, `useDeleteUser()`.
- Profile/Preferences: `useUser()`, `usePreferences()` (read/update).
- Dashboard/Progress: add hooks per data needs and refactor pages.

9) Tests for hooks with MSW (Step 8)
- Add tests covering query success/error states.
- Add tests for optimistic updates (success and error rollback).
- Keep MSW mocks in test-only scope (never in dev/prod per coding preferences).

10) Env-specific defaults (Step 9)
- Use `import.meta.env` to set React Query defaults per environment:
  - dev: shorter `staleTime`, maybe `retry: 0`, no focus refetch.
  - test: controlled timings for deterministic tests.
  - prod: conservative retries for idempotent GETs, `staleTime` tuned per resource.

11) Cleanup (Step 10)
- Remove obsolete page-level service calls (pages should import only hooks).
- Ensure no server-state remains in contexts.
- Delete dead code and logs in `services/api.ts` if no longer needed by pages.

## Architectural Guidelines

- Keep `frontend/src/services/api.ts` as the HTTP layer only (axios + raw fetchers). Do not import it directly in pages after migration; pages should use hooks.
- Hooks live in `frontend/src/hooks/` and own data flow, cache keys, and invalidation rules.
- Context remains for UI concerns only (Theme, I18n UI, UI layout state, etc.).
- Prefer `invalidateQueries` for correctness; use optimistic updates only where UX demands (e.g., task status toggle).

## Redirect and Auth Flow Notes

- Canonical auth route is `/auth` (the app uses `AuthPage.tsx`).
- Interceptor redirects to `/auth` on 401 refresh failure, with an optional `returnTo` param.
- `ProtectedRoute` also redirects to `/auth`.
- After login/register in `services/auth.ts`, navigate to `returnTo` if present; otherwise go to default (admin/dashboard by role).

## Risks and Mitigation

- Temporary mixed patterns during migration: mitigate by doing feature-by-feature refactors (Goals, then Tasks, then others).
- Optimistic updates require careful rollback: localize logic in hooks, add tests.
- Query key drift: centralize keys in `queryKeys.ts` and reuse everywhere.

## Success Criteria

- No page performs direct server calls; all use React Query hooks.
- Cache behavior is predictable; user actions reflect quickly (optimistic where needed).
- 401s consistently land on `/auth`, with a smooth return flow after login.
- Tests cover core flows and regressions are easy to catch.
