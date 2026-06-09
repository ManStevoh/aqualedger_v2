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
npm run db:setup
# Or on existing DB: npm run db:migrate
# Docker MySQL: npm run db:docker:up && node scripts/wait-for-mysql.mjs && npm run db:setup
```

Quickstart: [`docs/LOCAL_DEV_QUICKSTART.md`](docs/LOCAL_DEV_QUICKSTART.md)

Default database name: **`aquaerp_operating`** (set `DB_NAME` in `.env`).

Migrations: … → `20260610` (boats fixup) → **`20260612`** (DNS verify, tenant flags, GDPR exports). See [`docs/DATABASE_SETUP.md`](docs/DATABASE_SETUP.md), [`docs/PENDING_OVERALL.md`](docs/PENDING_OVERALL.md)

### Demo tenants (20 orgs, full module data)

```bash
npm run db:seed:demo          # skip existing slugs
npm run db:seed:demo:fresh    # wipe demo tenants/users first, then re-seed
```

- **Owners:** `owner-coastfish@demo.aquaerp.local` (Coast Fish), `owner-lamusea@demo.aquaerp.local` (Lamu Sea), `owner-aquaerp-demo@demo.aquaerp.local` (Showcase) / `Demo@123`
- **B2B Buyer (Wholesale):** `buyer-b2b@demo.aquaerp.local` / `Demo@123`
- **Storefront Buyer (Retail):** `buyer@demo.aquaerp.local` / `Demo@123`
- **Subdomains:** `{slug}.localhost:3000` (see `PLATFORM_HOST` in production)
- Script: `database/seed-demo-tenants.ts` — onboarding complete, chart of accounts, fishing, commerce, cold chain, CRM, HR, accounting, procurement, logistics, insurance, IoT, AI insights

### Super admin (full platform test data)

```bash
npm run db:seed:super-admin        # admin + demo tenants + platform layer (incremental)
npm run db:seed:super-admin:fresh  # wipe demo tenants, re-seed everything
npm run db:seed:platform           # platform layer only (requires demo tenants)
```

- **Super admin:** `admin@aqualedger.co.ke` / `Admin@123`
- **Admin hub:** `/admin` — tenants (mixed plans/status), payments (`payment_intents`), audit trail, branding/settings, module flags
- Scripts: `database/seed-super-admin-full.ts`, `database/seed-super-admin-platform.ts`

### Form & E2E tests

```bash
npm test                    # Vitest (schemas + tenant isolation)
npm run test:forms          # form-focused unit tests
npm run test:e2e            # Playwright — 6 form UIs + onboarding + cross-tenant API
```

See [`docs/FORM_TESTING.md`](docs/FORM_TESTING.md). Demo login for E2E: `owner-coastfish@demo.aquaerp.local` / `Demo@123` and `owner-lamusea@demo.aquaerp.local` / `Demo@123`.

### Responsive UI (mobile-first)

- Shell: closed sidebar on mobile, bottom nav + **Menu**, `dvh` + safe-area, `/dashboard/mobile/*` minimal chrome
- Shared: `DataTableShell`, `FilterControl` / `filter-control`, `ResponsiveFormGrid`, `StatCardGrid`
- Audit: `npm run ui:audit:responsive` — see [`docs/RESPONSIVE_UI_STANDARDS.md`](docs/RESPONSIVE_UI_STANDARDS.md)
- Branding: [`docs/BRANDING.md`](docs/BRANDING.md)

## Latest pass (enterprise final)

### Commerce (full Shopify-style flow)
- **Cart** → **Checkout** → Order + commission + domain event
- **Wishlist**, **vendor payouts**, coupon at checkout
- **14 storefront UI themes** (WCAG 2.2 AA+) — customize at `/dashboard/commerce/storefront`, publish at `/store/{slug}`
- Research: `docs/ECOMMERCE_GLOBAL_STANDARDS.md`
- **Vendor & client portal login** — invite via `POST /api/v2/commerce/vendors/invite` and `POST /api/v2/crm/customers/invite`; `tenant_members` roles `vendor` / `customer`; sign in at `/login`
- **Tenant-editable portal permissions** — Organization → Portal roles (`/dashboard/settings/roles`, `tenant_role_permissions` seeded on every new tenant)
- **Guest cart & checkout** on public store (`/api/public/store/{slug}/cart|checkout`) — coupons, **multi-vendor commissions** (`product_catalog.vendor_id`), M-Pesa STK, **Stripe card**, COD
- **Abandoned carts** — Commerce → Abandoned carts (`/dashboard/commerce/abandoned-carts`, `GET/POST /api/v2/commerce/abandoned-carts`)
- **B2B marketplace filters** — grade, species, price range, search via `/api/v2/marketplace` + dashboard filter UI
- **Storefront PDP** — `/store/{slug}/product/{id}`, traceability verifier, **public product reviews** when `show_reviews` enabled
- **M-Pesa Daraja** — live STK push, public callback, wallet deposits, **guest + dashboard cart checkout**, auto-reconcile (`npm run reconcile:payments`)
- **Paystack** — initialize + callback; guest store, commerce cart, wallet (KES)
- **Stripe SaaS billing** — portal, Checkout subscription upgrade, customer invoices, webhook (`/api/payments/stripe/webhook`)
- **Subdomain tenant routing** — `{slug}.{PLATFORM_HOST}` → `x-tenant-id` + storefront
- **Custom domain storefront** — Organization → Domains, TXT verify, `resolve-host` → `/store/{slug}` ([`docs/TENANT_HOSTING.md`](docs/TENANT_HOSTING.md))
- **CRM Kanban** — drag-and-drop pipeline at `/dashboard/crm/leads` (default board view) with `PATCH /api/v2/crm/leads/[id]`
- **Dashboard order checkout STK** — Commerce → Cart M-Pesa STK + `POST /api/v2/orders/[id]/pay/mpesa` on unpaid orders
- **Production hardening** — `npm run hardening` (preflight, db verify, test, build, smoke, M-Pesa probe)
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
- **Invoices (AP/AR)** — Finance → Invoices: create supplier & customer invoices, post to GL, **invoice from order** (`POST /api/v2/accounting/ar/from-order`); also under General Ledger AP/AR tabs
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

### Branding (tenant + platform)
- **Tenant ERP shell** — Organization → Tax & branding (logo URL, primary color) applies to sidebar, accents, and buttons; live preview on save
- **Platform auth/marketing** — Admin → Platform settings → Platform branding; login, register, and landing nav; env fallbacks in `.env.example`
- **Storefront** — Commerce → Storefront (14 WCAG themes, separate from ERP shell)

### Platform control (super admin)
- **Command center** — `/dashboard/admin` live KPIs (tenants, users, orders, catches)
- **Tenant registry** — `/dashboard/admin/tenants` provision orgs, suspend/activate, plan, GMV column, JSON export
- **Platform users** — `/dashboard/admin/users` cross-tenant directory + **support impersonation** (audited)
- **Platform analytics** — `/dashboard/admin/analytics` GMV, signups, plan mix, top tenants (30d)
- **Module enable/disable** — `/dashboard/admin/modules` toggles ERP modules for all tenants; hides nav and blocks `/api/v2/*` when off
- **Platform audit** — `/dashboard/admin/audit` cross-tenant log with tenant filter (super_admin)
- **System health** — `/dashboard/admin/health` DB, integrations, env readiness
- **Platform settings** — `/dashboard/admin/settings` maintenance mode, signup lock, global announcement, **platform branding** (login/landing)
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
npm run hardening   # full production readiness gate
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
- **Per-tenant module toggles** — `tenant_module_flags` on top of `platform_module_flags` (Admin → Tenants → module grid icon)
- **Per-tenant feature shortcuts** — legacy flags for marketplace / AI / analytics (Tenants → sliders icon)
- **Tenant module API** — `GET /api/v2/tenant/modules` merges platform toggles + tenant flags; enforced on `/api/v2/*`
- **M-Pesa reconcile** — Admin Payments → reconcile stale STK intents + sync order `paid` status
- **GDPR export jobs** — Admin Settings → queue exports to `storage/exports/` via `POST /api/v2/platform/exports`; download completed JSON; cron `npm run exports:process` (`CRON_SECRET`)
- **Scheduled reports cron** — `npm run reports:process` → `POST /api/v2/platform/reports/run-scheduled` (all tenants, `CRON_SECRET`)
- **Custom domain storefront** — verified domain `/` redirects to `/store/{slug}`
- **Invite user** — Admin Users → invite email to any tenant

## Phase 5 (future — not in this pass)

**Infra:** NestJS microservices, PostgreSQL, Redis, Elasticsearch, Flutter native apps, Keycloak at scale, blockchain traceability, read replicas, CDN edge.

**AI (roadmap):** RAG over documents (contracts, HACCP PDFs) · agent tools (create PO, post journal from chat) · per-tenant AI cost/usage dashboard · custom ML beyond moving average/regression. See [`docs/AI_ENABLEMENT.md`](docs/AI_ENABLEMENT.md). Shipped AI uses `20260605_ai_enablement.sql` — run `node scripts/run-migrations.mjs` if tables are missing.
