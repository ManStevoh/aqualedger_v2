# AquaERP UI Design System

Premium maritime SaaS aesthetic — inspired by Linear, Stripe, and Shopify Admin.

## Typography

- **Sans:** Plus Jakarta Sans (`--font-sans-app`)
- **Mono:** Geist Mono (`--font-mono-app`)

## Color

- **Primary:** Ocean teal (`oklch` hue ~200) — buttons, links, active nav
- **Background:** Soft cool white (light) / deep navy (dark)
- **Mesh:** `.bg-mesh-dashboard` on app shell

## Layout

| Layer | Component |
|-------|-----------|
| Shell | `app/dashboard/layout.tsx` — mesh bg, padding, `DashboardPageShell` |
| Page header | `ModulePageHeader` — title, breadcrumbs, actions |
| KPIs | `KpiStrip` / `StatCard` |
| Empty | `EmptyState` |
| Onboarding prompt | `SetupChecklist` — command center only when setup incomplete |

## Patterns

- Use `ModulePageHeader` on every dashboard page (avoid raw `<h1 className="text-2xl">`).
- Avoid extra `p-6` on pages — layout already pads content.
- Cards: default shadcn `Card` with hover elevation on interactive tiles.
- **Mobile-first:** closed sidebar drawer on `<lg`, bottom nav + Menu tab, `min-h-dvh`, safe-area insets. See [`RESPONSIVE_UI_STANDARDS.md`](RESPONSIVE_UI_STANDARDS.md).
- Mobile: floating pill nav (`MobileNav`), sidebar drawer on small screens.
- List pages: `ListPageToolbar` (search, filters, views, actions) above the table.
- Tables: `TablePagination` for page size and prev/next controls.
- Status columns: `StatusBadge` (maps status strings to semantic badge variants).

## Components

### `StatusBadge`

`components/dashboard/status-badge.tsx` — semantic badge for entity status strings (orders, invoices, etc.). Uses `getStatusBadgeProps` from `lib/ui/status-colors`.

### `ListPageToolbar`

`components/dashboard/list-page-toolbar.tsx` — consistent toolbar row: optional search input, filter slot, view toggle slot, primary actions.

### `TablePagination`

`components/dashboard/table-pagination.tsx` — page controls with optional page-size select (`PAGE_SIZE_OPTIONS`: 25, 50, 100).

### `WorkspaceNav`

`components/dashboard/workspace-nav.tsx` — horizontal scroll sub-nav for workspaces (Commerce, Accounting, etc.). Export preset arrays like `COMMERCE_WORKSPACE_NAV`.

### `DataTableShell`

`components/dashboard/data-table-shell.tsx` — mobile-safe horizontal scroll wrapper for wide tables.

### `ResponsiveFormGrid` / `FilterControl`

`components/dashboard/responsive-form-grid.tsx` — stack form fields on mobile; full-width filters in toolbars.

### `CommandPalette` (⌘K)

`components/dashboard/command-palette.tsx` — global command dialog mounted in `DashboardChrome`. **⌘K** / **Ctrl+K** opens quick navigation and actions across enabled modules.

### `SetupChecklist`

`components/dashboard/setup-checklist.tsx` — progress card linking to `/dashboard/onboarding`. Props: `completedSteps`, `totalSteps`. Shown on the command center when tenant onboarding is incomplete.

### `useDashboardPageMeta`

`lib/hooks/use-dashboard-page.ts` — derives `title`, `description`, `breadcrumbs`, and module context from the current pathname via `resolvePageContext`, with optional overrides.

### `page-context`

`lib/platform/page-context.ts` — `resolvePageContext(pathname)` maps routes to titles, subtitles, breadcrumbs, and module labels. Extend when adding new dashboard routes.

### Focused onboarding layout

`DashboardChrome` detects `/dashboard/onboarding` and renders a **focused setup** shell: no sidebar, no header chrome, full-width content — so new tenants complete profile → operations → go-live without distraction. `CommandPalette` remains available.

## Dark mode

Enabled globally via `ThemeProvider` in root layout. Toggle in header.

## Global CSS

Use **`app/globals.css`** only (imported from `app/layout.tsx`). Do not add a duplicate `styles/globals.css`.
