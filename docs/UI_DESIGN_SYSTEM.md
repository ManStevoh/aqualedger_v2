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

## Patterns

- Use `ModulePageHeader` on every dashboard page (avoid raw `<h1 className="text-2xl">`).
- Avoid extra `p-6` on pages — layout already pads content.
- Cards: default shadcn `Card` with hover elevation on interactive tiles.
- Mobile: floating pill nav (`MobileNav`), sidebar drawer on small screens.

## Dark mode

Enabled globally via `ThemeProvider` in root layout. Toggle in header.
