# LOS UI Overhaul Plan

## 1. Component Inventory
| Component | Current Status | Proposed Replacement | Notes |
|----------|----------------|---------------------|------|
| `GoalCard` (`frontend/src/components/goals/GoalCard.tsx`) | Uses standardized `Card` system, basic dates/status | Redesign with progress bar or compact radial, category chip, tighter mobile spacing, clear CTAs | Preserve props and handlers; keep category color mapping from `categoryUtils` |
| `ProgressGoalCard` (`frontend/src/components/progress/ProgressGoalCard.tsx`) | `Card` + `Progress` bar | Modern progress visuals with percentage label, optional radial on small screens | Keep query-driven data shape; no API changes |
| `TaskCard` (`frontend/src/components/tasks/TaskCard.tsx`) | Simple bordered div + `StatusBadge` | Convert to `Card` variant=`subtle`/`flat`, left status dot, clearer typography, trailing icon CTAs | Maintain action callbacks; 44–48px tap targets |
| `QuoteOfDay` (`frontend/src/components/dashboard/QuoteOfDay.tsx`) | `Card` variant `quoteOD` with themed tokens | Subtle soft-surface card with accent border and icon | Keep current tokens from `theme-system.css` |
| `BottomNav` (`frontend/src/components/dashboard/BottomNav.tsx`) | Mobile bottom nav with 5 items | Keep structure; refine hit areas, safe-area insets, active indicator | i18n labels under `navigation.*` |
| `BottomNavLayout` (`frontend/src/components/dashboard/BottomNavLayout.tsx`) | Provides fixed bottom nav shell | Evolve into `AppShell` with top header slot, content, bottom nav | Ensure `Outlet` remains |
| `OverviewStats`, `TaskStatus`, `Greetings` | Dashboard widgets | Migrate to `Card` primitives with consistent spacing, icons | No logic changes |
| `GoalDialog`, `TaskDialog` | Dialog forms | Keep logic; unify with `Dialog` + `Form` primitives, better mobile presentation (bottom sheet feel) | Keep payload shapes |
| `UserCard`, `ChangePasswordDialog`, `ConfirmDeleteDialog` | Profile/admin utilities | Retheme with tokens, improve affordances | Keep ARIA and keyboard flows |
| UI Primitives: `Card`, `Button`, `Select`, `Dialog`, `Form`, `Progress`, `BadgeUI`, `CategoryUI`, `TimePicker`, `theme-switcher` | Standardized and documented | Keep API; align tokens; add small motion (<200ms) | Card system already standardized (see `CARD_DOCUMENTATION.md`) |
| Routing: `MainLayoutRoutes`, `ProtectedRoute`, `AdminRoute`, `RoleBasedRedirect` | Centralized and working | Preserve; slot into new `AppShell` | Do not alter redirect/auth behavior |
| Pages: `DashboardPage`, `GoalsPage`, `TasksPage`, `ProgressPage`, `ProfilePage`, `AdminPage` | Feature-complete | Migrate UI only, keep hooks and query keys | Respect existing i18n keys |
| Styles: `theme-system.css`, `index.css` utilities | Tokens present; some legacy utilities | Consolidate to tokens + Tailwind, keep legacy for compatibility | Avoid breaking classes used in tests |
| Potentially unused/redundant | `frontend/src/components/goals/tabs/` (empty), `frontend/src/App.css` (vite boilerplate) | Remove in cleanup after migrations if confirmed unused | Verify no imports first |

---

## 2. Information Architecture & Navigation
- **Current IA:**
  - Routes (`frontend/src/App.tsx`): `/auth`, `/dashboard`, `/goals`, `/tasks`, `/progress`, `/profile`, `/admin` (guarded)
  - `MainLayoutRoutes` wraps authenticated app with `BottomNavLayout`. Admin is separate.
- **Proposed IA:**
  - Mobile-first with persistent bottom navigation: Dashboard, Goals, Tasks, Progress, Profile
  - Admin remains hidden from bottom nav; accessible via role-based redirect or deep link
  - Top header per page for title/subtitle, small actions; on desktop, optional top bar remains, no sidebar introduced

### Navigation Map (Mobile-first)
```mermaid
graph TD
    Auth[/Auth/]
    Home[/RoleBasedRedirect/]
    Home --> Dashboard
    Home --> Goals
    Home --> Tasks
    Home --> Progress
    Home --> Profile
    Admin[Admin (guarded)]
    Goals --> GoalDetail[(In-Card actions/dialogs)]
    Tasks --> TaskDetail[(In-Card actions/dialogs)]
```


## 3. Design Tokens (Draft)

Token Category | Name | Value (Draft)
---|---|---
Color | Primary | `#2563EB` (maps to `--brand-primary` / `--primary`)
Color | Secondary | `#64748B` (neutral secondary text/surfaces)
Color | Success/Warning/Error/Info | Use existing `--brand-*` tokens from `theme-system.css`
Color | Background | `var(--background)`; Surface `var(--surface)`; Card `var(--card)`
Spacing | Base scale | 4px base: 4, 8, 12, 16, 20, 24, 32
Radius | Card | 16px (`--radius: 0.5rem` already; consider `--radius-lg: 0.75rem`) 
Shadow | Card | `0 2px 6px rgba(0,0,0,0.05)` (light), `0 6px 16px rgba(0,0,0,0.12)` (hover)
Typography | Font | Inter, ui-sans-serif stack
Typography | Headings | `h1 1.5rem`, `h2 1.25rem`, `h3 1.125rem` (mobile-first)
Motion | Durations | Fast 150–200ms; Ease: `ease-in-out`; Respect reduced motion

Notes:
- Reuse existing CSS variables in `frontend/src/styles/theme-system.css` and Tailwind config (`frontend/tailwind.config.js`).
- Ensure AA contrast for light/dark via tokens; prefer text on `--surface`  and `--card`.

## 4. Page-by-Page Wireframes

- Goals List (≤ 420px):
  - Fixed header: Title + subtitle
  - Filter bar: Segmented filter (Active/Completed/All) + “New Goal”
  - Category sections with `CategoryHeader`
  - `GoalCard`: title, status chip, optional description, target date, days-left, compact actions

- Tasks List (≤ 420px):
  - Fixed header: Title + subtitle
  - Filter bar: Today/All + “New Task”
  - Group by category → goal title → list of `TaskCard`s
  - `TaskCard`: left status dot/chip, title, trailing actions (edit/toggle/delete)

- Dashboard:
  - Greeting + `QuoteOfDay`
  - `TaskStatus` quick glance (today tasks, active goals)
  - `OverviewStats` with concise metrics

- Progress:
  - Filters: status (all/active/completed) and category chips
  - Grid of `ProgressGoalCard` with clear percentage and days remaining

- Profile:
  - Top controls for theme/language
  - `UserCard` summary
  - Preferences as collapsible `Card`s with form controls

## 5. Risks & Mitigations

Risk | Potential Impact | Mitigation
---|---|---
Changing layout breaks React Query cache usage | Stale/missing data | Keep `queryKeys` unchanged (`frontend/src/lib/queryKeys.ts`); migrate UI only
Auth redirect regressions | Users stuck at `/auth` or loops | Do not modify `ProtectedRoute`, `AdminRoute`, `RoleBasedRedirect`; manual QA + test flows
WebSocket UI updates regress | Live updates break | Keep `WebSocketService` contract; verify connect/disconnect flows
i18n key/name changes | Missing translations | Reuse existing keys; do not rename keys; add new keys only if necessary
Bundle size inflation | <90 Lighthouse, >200KB JS | Code-split pages; lazy-load dialogs; avoid heavy libs; use existing primitives
Accessibility gaps | Fails WCAG 2.1 AA | Use focus-visible styles, roles, labels; verify contrast per tokens
Visual regressions on dark mode | Inconsistent surfaces | Use `--surface`/`--card` correctly; test in dark mode

## 6. Next Steps
- Finalize tokens & UI kit (Card, Button, Select, Dialog, Form, Progress, Badge, CategoryChip) with Tailwind tokens
- Implement `AppShell` layout (header slot + content + bottom nav + safe-area)
- Migrate Goals page first (cards, filters, empty/error states)
- Migrate Tasks, Dashboard, Progress, Profile sequentially
- QA: skeletons, error boundaries, motion polish (<200ms), Lighthouse ≥ 90 mobile

---

## Phase Plan
- **Phase 1:** Design tokens + primitives in `frontend/src/components/ui` + `_ui-kit-demo.tsx` (dev-only)
- **Phase 2:** AppShell/layout implementation
- **Phase 3:** Page migrations (preserve logic + query keys)
- **Phase 4:** QA, skeletons, error boundaries, finalize docs

## Implementation Rules
- No feature branch; iterate locally; one final squashed commit after QA
- Strict TypeScript; no `any`
- UI-only changes; no logic or API modifications
- Mobile-first + performance-aware design

## Tech Specifics
- React Router (stable URLs), React Query (stable keys in `queryKeys.ts`), Vitest + MSW
- Tailwind tokens in `tailwind.config.js` + `theme-system.css`
- Nginx + PM2 prod setup unchanged

## Accessibility & Performance
- Keyboard accessible; focus-visible outlines
- AA color contrast, respect reduced motion
- Lighthouse ≥ 90 mobile
- JS bundle < 200 KB gzipped, lazy-load heavy components, responsive images

## Files to Produce/Update
- `docs/ui-overhaul-plan.md` (this document)
- `frontend/tailwind.config.{js,ts}` (tokens as needed)
- `frontend/src/components/ui/*` (tokens/variants polish, `_ui-kit-demo.tsx`)
- `frontend/src/layouts/AppShell.tsx` (new)
- Updated pages under `frontend/src/pages/*` (UI-only)
- `CHANGELOG.md`

## Final Commit Template
Single squashed commit:
- Title: `feat(ui): complete LOS UI overhaul`
- Bullets: major UI changes, token summary, screenshots, passing tests, Lighthouse score

## Runbook
- Dev servers already running (no restart required)
- Tests: `cd frontend && npm run test`
- Lint: `cd frontend && npm run lint`

## Local Workflow
1. Edit components/pages under `frontend/src`
2. Verify no API or logic changes
3. Live-test in browser (auth, WS, optimistic updates)
4. Update component tests

## Review Gates
1. `ui-overhaul-plan.md` ready (this)
2. Tokens + UI kit demo
3. First migrated page (Goals list)
4. QA pass + final approval
