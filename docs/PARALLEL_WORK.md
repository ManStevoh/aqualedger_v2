# Parallel agent work — avoid conflicts

When multiple agents (or developers) work on this repo at once, stay in separate zones.

## UI / dashboard agent (active)

**Owns — do not edit without coordination:**

| Area | Examples |
|------|----------|
| Dashboard pages | `app/dashboard/**/*.tsx` |
| Dashboard UI | `components/dashboard/**` (chrome, sidebar, headers, module pages) |
| Design tokens | `lib/ui/**`, `app/globals.css`, `docs/UI_DESIGN_SYSTEM.md` |
| Auth UX | `app/login/**`, `app/register/**`, `components/auth-provider.tsx` |
| Storefront UI | `app/store/**`, `components/storefront/**` |

## Platform / infra agent (this track)

**Owns — safe to continue in parallel:**

| Area | Examples |
|------|----------|
| APIs | `app/api/**` (except coordinating on shared auth routes) |
| Business logic | `lib/**` (modules, platform, tenant-scope, auth core) |
| Middleware | `middleware.ts` |
| Database | `database/**`, `scripts/run-migrations.mjs`, `scripts/verify-*.mjs` |
| Ops scripts | `scripts/smoke-platform.mjs`, `scripts/env-check.mjs`, `scripts/predeploy.mjs`, `scripts/lib/load-env.mjs` |
| Docs | `docs/DEPLOYMENT.md`, `docs/PILOT_GO_LIVE.md`, `SYSTEM_STATUS.md`, this file |

## Shared touchpoints (coordinate before changing)

| File | Why |
|------|-----|
| `app/dashboard/layout.tsx` | Wraps `DashboardModuleServerGate` (server module enforcement) — UI agent: keep the gate wrapper when editing layout |
| `components/dashboard/dashboard-chrome.tsx` | Contains `ModuleDisabledNotice` (infra) + chrome (UI) |
| `app/api/auth/me/route.ts` | Session payload — both auth UX and impersonation |
| `lib/auth-fetch.ts`, `lib/store.ts` | Client API + nav state |
| `package.json` | Scripts and dependencies |

## Current note (2026-05-22)

The **UI agent** is refactoring dashboard pages (`DashboardPageLayout`, etc.). Expect temporary `npm run typecheck` errors under `app/dashboard/**` until that pass completes. The **infra agent** does not edit those files during that pass.

## Merge tips

1. Prefer **small, focused commits** per agent zone.
2. Run `npm run typecheck` and `npm test` before merge; UI agent runs visual smoke on key pages.
3. Infra agent runs `npm run smoke` and `npm run db:verify` — no need to rebuild every dashboard page.
4. If `app/dashboard/layout.tsx` conflicts, keep **both** `DashboardModuleServerGate` and UI chrome changes.

## Quick commands by zone

```bash
# Infra
npm run env:check && npm run smoke && npm run db:verify

# UI (after edits)
npm run typecheck
npm run dev
```
