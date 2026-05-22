# Responsive UI & global standards

Mobile-first layout for AquaERP dashboard and storefront. Aligns with **WCAG 2.2 Level AA** (touch targets, focus, contrast) and common PWA practices.

## Breakpoints (Tailwind)

| Token | Min width | Use |
|-------|-----------|-----|
| default | 0 | Single column, stacked toolbars, drawer sidebar |
| `sm` | 640px | 2-column grids, inline toolbars |
| `md` | 768px | Table-heavy layouts acceptable |
| `lg` | 1024px | Persistent sidebar, hide bottom nav |
| `xl` | 1280px | 4-column KPI grids |

**Rule:** Design at 320px width first, then enhance at `sm` / `lg`.

## App shell (all dashboard pages)

| Piece | Behavior |
|-------|----------|
| Sidebar | Closed on `<lg`; drawer + backdrop; opens on `lg+` |
| Bottom nav | Fixed pill, `lg:hidden`, safe-area inset |
| Menu tab | Opens sidebar on mobile |
| Main | `min-h-dvh`, `pb` clears bottom nav on mobile |
| `/dashboard/mobile/*` | No sidebar/header/bottom nav |
| `/dashboard/onboarding` | Focused full-width setup |

Hook: `useResponsiveShell()` in `DashboardChrome`.

## Required patterns for new pages

1. **`DashboardPageLayout`** — title, breadcrumbs, workspace nav
2. **`StatCardGrid`** — KPIs (1 → 2 → 4 columns)
3. **`ListPageToolbar`** — search full width on mobile
4. **`DataTableShell`** — wrap `<Table>` for horizontal scroll
5. **`FilterControl`** or class `filter-control` — never `w-[160px]` on filters (table cells may use `max-w-[200px] truncate` for long text)
6. **`ResponsiveFormGrid`** — dialogs/forms stack on mobile
7. **Actions** — `flex-col gap-1 sm:flex-row` in table cells

## WCAG 2.2 checklist (dashboard)

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.4.4 Resize text | 200% zoom usable | `rem` typography, no fixed heights on text |
| 1.4.10 Reflow | 320px without horizontal scroll on page | `overflow-x-hidden` on main; tables in `DataTableShell` |
| 2.4.3 Focus order | Logical tab order | Radix primitives + `focus-ring-premium` |
| 2.5.8 Target size (AA) | 24×24 min; **44×44** recommended | `.touch-target` on header/mobile nav |
| 4.1.2 Name, role, value | Buttons labeled | `sr-only` on icon-only controls |

Storefront: see `docs/ECOMMERCE_GLOBAL_STANDARDS.md`.

## Audit & fix commands

```bash
npm run ui:audit:responsive   # Check shell, viewport, filter widths
npm run ui:fix:filters        # Batch-apply filter-control class
npm run ui:fix:tables         # Wrap <Table> in DataTableShell (review diff first)
```

Exits non-zero if core shell/viewport checks fail. Warnings list pages with fixed filter widths.

## Manual test matrix

| Viewport | Device class | Verify |
|----------|--------------|--------|
| 320×568 | iPhone SE | Sidebar closed, bottom nav, tables scroll |
| 390×844 | iPhone 14 | Header title visible, search usable |
| 768×1024 | iPad | Sidebar persistent at `lg` only |
| 1280×800 | Laptop | Full grid, no bottom nav |

Also test: dark mode, landscape phone, `prefers-reduced-motion`.

## Migration backlog

- Replace `w-[Npx]` on `SelectTrigger` / filters with `filter-control`
- Wrap remaining raw `<Table>` in `DataTableShell`
- Adopt `DashboardPageLayout` on pages still using raw `<h1>`
