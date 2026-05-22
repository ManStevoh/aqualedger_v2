# AquaERP — Enterprise Platform Status

## Scale (latest)

| Metric | Value |
|--------|------:|
| API routes | **120+** |
| Dashboard pages | **60+** |
| ERP modules A–P | **Complete in monolith** |
| Event-driven workflows | **Yes** |
| Multi-tenant | **Yes** (`tenant_id` on all core tables) |

## Apply database

```bash
node scripts/setup-fresh-database.mjs
# Or on existing DB: node scripts/run-migrations.mjs
```

Default database name: **`aquaerp_operating`** (set `DB_NAME` in `.env`).

Migrations: … → `20260606` (vertical modules) → **`20260607`** (module flags) → **`20260608`** (platform settings)

## Latest pass (enterprise final)

### Commerce (full Shopify-style flow)
- **Cart** → **Checkout** → Order + commission + domain event
- **Wishlist**, **vendor payouts**, coupon at checkout
- **14 storefront UI themes** (WCAG 2.2 AA+) — customize at `/dashboard/commerce/storefront`, publish at `/store/{slug}`
- Research: `docs/ECOMMERCE_GLOBAL_STANDARDS.md`
- **Guest cart & checkout** on public store (`/api/public/store/{slug}/cart|checkout`)
- **M-Pesa Daraja** — live STK push, public callback, wallet deposits, **guest storefront checkout**, integrations sandbox test
- **CRM Kanban** — drag-and-drop pipeline at `/dashboard/crm/leads` with `PATCH /api/v2/crm/leads/[id]`
- **New vertical modules** — catch quotas, forward sales contracts, insurance & claims (`docs/NEW_VERTICAL_MODULES.md`)
- **MFA at login** — TOTP challenge after password when MFA enabled (Security settings enrollment)
- **Tenant isolation** — `tenant_id` enforced in analytics, boats/trips/catches SQL (not only post-fetch checks)
- **Stripe** when env configured
- **Google OAuth** (`/api/auth/oauth/google`)
- **SEO sitemap**, driver PWA, barcode scan, smart procurement, tenant analytics
- **AI Command Center** — demand/price/fraud/inventory models, daily business brief, cold-chain & inventory reviews, grounded LLM chat, report email narratives (`docs/AI_ENABLEMENT.md`, `OPENAI_API_KEY`)
- **LLM chat** when `OPENAI_API_KEY` set · **FCM push** when `FCM_SERVER_KEY` set
- **Fisheries government API** connector (local + external fallback)
- **Enterprise reporting hub** — 10 report types, CSV/HTML/JSON download, email+SMS+webhook delivery, share links, scheduled runner (`docs/REPORTING_STANDARDS.md`)
- **Industry gap modules** — delivery slots, returns, B2B wholesale, quality inspection, co-op revenue share, offline sync, public traceability verify, vendor hub, audit trail (`docs/INDUSTRY_GAP_FEATURES.md`)
- **Full ERP enhancements** — 3-way match, RFM segmentation, sales/catch/inventory forecasts, cash flow, supplier scorecards, custom domains, ERP/shipping connectors, storefront search, guest order portal (`docs/MODULE_COMPLETE_CHECKLIST.md` §R)
- **Accounting & HR enterprise** — payroll runs with line items (PAYE/NHIF), approve/pay/post-to-GL, fiscal period close, AP/AR subledger GL posting, bank reconciliation UI, budgets, tax returns, fixed assets + depreciation, cash flow & equity report tabs
- **Default chart of accounts** — 30 GL accounts per tenant at signup + backfill migration; seed API `POST /api/v2/accounting/chart-of-accounts`
- **HR extensions** — benefits plans, recruitment pipeline, org chart, mobile clock-in
- **Reporting & communications** — Resend/SendGrid/SMTP email, branded report templates, tenant BCC/reply-to, Communications hub, delivery retry, WhatsApp channel, CRM campaign send (`docs/COMMUNICATIONS.md`)
- **Module dashboards** — Dedicated KPI command center per ERP module at `/dashboard/modules/{id}` (14 modules: fishing, commerce, inventory, cold chain, procurement, CRM, finance, logistics, HR, analytics, notifications, integrations, AI, organization) with live SQL aggregates, trends, alerts, and quick links

### Compliance & export
- **Export documents**: CO, health certificate, catch certificate, customs
- **Multi-currency** (KES/USD/EUR/TZS) with converter

### Operations
- **Crew management** per boat
- **Live auction bidding**
- **Workflow automation** (`workflow_rules` + `domain_events` processor)
- **Hardware & IoT** — device registry, machine ingest (device key + global secret), cold-chain/door/power alerts, GPS telemetry, scale weigh-ins, camera barcode scan (`docs/HARDWARE_IOT.md`)

### Platform control (super admin)
- **Command center** — `/dashboard/admin` live KPIs (tenants, users, orders, catches)
- **Tenant registry** — `/dashboard/admin/tenants` provision orgs, suspend/activate, plan, GMV column, JSON export
- **Platform users** — `/dashboard/admin/users` cross-tenant directory + **support impersonation** (audited)
- **Platform analytics** — `/dashboard/admin/analytics` GMV, signups, plan mix, top tenants (30d)
- **Module enable/disable** — `/dashboard/admin/modules` toggles ERP modules for all tenants; hides nav and blocks `/api/v2/*` when off
- **Platform audit** — `/dashboard/admin/audit` cross-tenant log with tenant filter (super_admin)
- **System health** — `/dashboard/admin/health` DB, integrations, env readiness
- **Platform settings** — `/dashboard/admin/settings` maintenance mode, signup lock, global announcement banner
- **APIs** — `overview`, `tenants` (GET/POST/PATCH), `tenants/[id]`, `tenants/[id]/export`, `users`, `analytics`, `impersonate` (POST/DELETE), `settings`, `health`

### Auth & security
- **MFA login gate** — `/api/auth/login` → `/api/auth/login/mfa` when TOTP enabled
- **Google reCAPTCHA** — super admin configures at `/dashboard/admin/security` (v3 invisible or v2 checkbox); protects login/register when enabled; server-side `siteverify`
- **Session management** (revoke devices)
- **Login alerts** on new sign-in
- **Test script** — `node scripts/test-recaptcha-flow.mjs` (with `npm run dev` running)

### HR enterprise
- **Performance reviews**, **training records** (HACCP/safety)

### Notifications
- **Email/SMS/WhatsApp outbox** + process queue (SMTP via `.env`)

### UX
- **Mobile bottom nav**, **customizable dashboard widgets**
- **AI chatbot** assistant panel

## UI / UX (premium design system)

- **Plus Jakarta Sans** typography, ocean-teal tokens, mesh backgrounds
- Glass header, refined sidebar, floating mobile nav
- Shared `ModulePageHeader`, `StatCard`, `DashboardPageShell`
- See [`docs/UI_DESIGN_SYSTEM.md`](docs/UI_DESIGN_SYSTEM.md)

## URL configuration

All app and external API URLs are env-driven — see [`docs/URL_CONFIGURATION.md`](docs/URL_CONFIGURATION.md) and [`.env.example`](.env.example). No hardcoded `localhost` in business logic.

## Documentation

- [`docs/MODULE_COMPLETE_CHECKLIST.md`](docs/MODULE_COMPLETE_CHECKLIST.md) — per-feature status
- [`docs/MODULE_PRODUCTION_SPEC.md`](docs/MODULE_PRODUCTION_SPEC.md) — standards alignment
- [`docs/MIGRATION_ROADMAP.md`](docs/MIGRATION_ROADMAP.md) — Phase 5 (Flutter, SSO, Kafka)

## Verify

```bash
npm run typecheck
npm test
npm run dev
```

## Phase 5 (future infra)

NestJS microservices, PostgreSQL, Redis, Elasticsearch, **Flutter native apps**, Keycloak at scale, blockchain traceability, read replicas, CDN edge.
