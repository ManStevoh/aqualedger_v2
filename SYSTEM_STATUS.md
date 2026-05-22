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

Migrations: … → `20260610` (boats fixup) → **`20260612`** (DNS verify, tenant flags, GDPR exports). See [`docs/DATABASE_SETUP.md`](docs/DATABASE_SETUP.md), [`docs/PENDING_OVERALL.md`](docs/PENDING_OVERALL.md)

### Demo tenants (20 orgs, full module data)

```bash
npm run db:seed:demo          # skip existing slugs
npm run db:seed:demo:fresh    # wipe demo tenants/users first, then re-seed
```

- **Owners:** `owner-{slug}@demo.aquaerp.local` / `Demo@123`
- **Buyer (orders):** `buyer@demo.aquaerp.local` / `Demo@123`
- **Subdomains:** `{slug}.localhost:3000` (see `PLATFORM_HOST` in production)
- Script: `database/seed-demo-tenants.ts` — onboarding complete, chart of accounts, fishing, commerce, cold chain, CRM, HR, accounting, procurement, logistics, insurance, IoT, AI insights

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
- **Payments monitor** — `/dashboard/admin/payments` (cross-tenant M-Pesa/Stripe intents)
- **Billing & plan usage** — `/dashboard/admin/billing` (limits vs usage per tenant)
- **Email broadcast** — notify all tenant owners from platform settings
- **Tenant purge (GDPR)** — permanent delete with slug confirmation on tenants page
- **Signup lock** — enforced on `/api/auth/register` and `/register` when enabled
- **APIs** — `overview`, `tenants`, `tenants/[id]`, `export`, `purge`, `users`, `analytics`, `payments`, `billing`, `broadcast`, `impersonate`, `settings`, `health`
- See [`docs/PENDING_OVERALL.md`](docs/PENDING_OVERALL.md) for Phase 5 and env-only items

### Auth & security
- **MFA login gate** — `/api/auth/login` → `/api/auth/login/mfa` when TOTP enabled
- **Google reCAPTCHA** — `/dashboard/admin/security` (v3/v2); protects login, register, **guest storefront checkout**; audit log + rate limits; OAuth respects signup lock
- **Security headers** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` via `next.config.mjs`
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
npm run db:verify
npm run smoke
npm run predeploy   # typecheck + test + db + production build
npm run dev
```

Production checklist: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

**Edge-safe routing:** Custom domains resolve via `GET /api/internal/resolve-host` (Node); dashboard modules enforced in server layout + `apiHandler`.

## MVP positioning (coastal seafood vertical SaaS)

Credible **operator MVP** — multi-tenant ERP, commerce, cold chain, M-Pesa, MFA, super-admin platform control. Not yet a full Shopify+SAP replacement; suitable for pilot tenants and sandbox go-lives.

| Pillar | Status |
|--------|--------|
| Multi-tenant isolation | DB `tenant_id` on legacy tables + API `pushTenantCondition` / `assertTenantMatch` |
| M-Pesa | Daraja when `MPESA_*` set; stub otherwise — `npm run mpesa:check` |
| MFA | Enroll at `/dashboard/settings/security`; login gate via `/api/auth/login/mfa` |
| Onboarding | `/dashboard/onboarding` (profile → ops → go-live + M-Pesa/MFA prompts) |

Verify: `npm run db:verify`

## Phase 2 (tenant SaaS routing)

- **Subdomain at signup** — every registration gets `{slug}.PLATFORM_HOST` (slug from org name or chosen at register); preview via `GET /api/public/tenant-slug/check`
- **Subdomain tenants** — `{slug}.localhost` / `{slug}.PLATFORM_HOST` sets `x-tenant-slug`; `/` → `/store/{slug}`
- **Custom domains** — tenants request at Organization → Domains; TXT verify + CNAME to platform; optional primary domain
- Docs: [`docs/TENANT_HOSTING.md`](docs/TENANT_HOSTING.md)
- **Onboarding wizard** — `/dashboard/onboarding` with M-Pesa sandbox STK test on go-live step
- **DB repair** — `npm run db:verify` after `schema.sql` + migrations

## Suggested-features pass (2026-06-12)

- **Stripe Billing Portal** — `/dashboard/organization/billing` (self-serve plan/payment method when `STRIPE_SECRET_KEY` set)
- **Per-tenant feature flags** — disable marketplace / AI / advanced analytics per org (admin Tenants → flags)
- **Tenant module API** — `GET /api/v2/tenant/modules` merges platform toggles + tenant flags; enforced on `/api/v2/*`
- **M-Pesa reconcile** — Admin Payments → reconcile stale STK intents + sync order `paid` status
- **GDPR export jobs** — Admin Settings → queue exports to `storage/exports/` via `POST /api/v2/platform/exports`; download completed JSON; cron `npm run exports:process` (`CRON_SECRET`)
- **Custom domain storefront** — verified domain `/` redirects to `/store/{slug}`
- **Invite user** — Admin Users → invite email to any tenant

## Phase 5 (future infra)

NestJS microservices, PostgreSQL, Redis, Elasticsearch, **Flutter native apps**, Keycloak at scale, blockchain traceability, read replicas, CDN edge.
