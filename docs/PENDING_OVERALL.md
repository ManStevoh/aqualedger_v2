# AquaERP — Overall pending vs complete

Last updated: **2026-05-22**

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Implemented in monolith |
| 🟡 | Code complete; needs production `.env` / external service |
| 🔧 | Can implement next in this repo (no new infra) |
| ⬜ | Phase 5 / separate infra (not in this repo scope) |

---

## ✅ Recently completed (monolith)

| Feature | Where |
|---------|--------|
| Invoices hub (AP/AR, from order, print, post GL) | `/dashboard/accounting/invoices`, `GET /api/v2/accounting/{ap,ar}/[id]/document` |
| AP invoice from purchase order | `POST /api/v2/accounting/ap/from-po`, procurement 3-way match UI |
| Vendor & customer portal roles + invites | `/dashboard/settings/roles`, invite APIs on Team / CRM / Vendors |
| Platform health service rows | `healthToServiceRows` in admin health dashboard |
| Per-tenant ERP module toggles | `tenant_module_flags`, Admin → Tenants → Organization access |
| `DashboardPageLayout` shared shell | `components/dashboard/dashboard-page-layout.tsx` — **104/109 pages (95%)** |
| Responsive mobile-first shell | `useResponsiveShell`, `DataTableShell`, `filter-control` — `npm run ui:audit:responsive` |
| Tenant + platform branding | Organization + Admin settings; [`docs/BRANDING.md`](BRANDING.md) |
| Order detail page + API | `/dashboard/orders/[id]`, `GET` + `PATCH /api/v2/orders/[id]` |
| Orders list → detail link | `/dashboard/orders` “View order” |
| Edge-safe custom domains | `GET /api/internal/resolve-host` |
| Server dashboard module gate | `DashboardModuleServerGate` + `lib/platform/dashboard-access.ts` |
| GDPR export cron + download | `npm run exports:process`, download API |
| Scheduled reports cron | `npm run reports:process`, `POST /api/v2/platform/reports/run-scheduled` |
| Env / deploy tooling | `npm run preflight`, `npm run predeploy`, `npm run smoke` |

**Intentionally without `DashboardPageLayout`:** onboarding wizard, mobile PWA routes, `modules/[moduleId]` shell, `orders/[id]` (`ObjectPageShell`).

---

## 🔧 Beyond MVP (production pilots)

See **[`docs/BEYOND_MVP.md`](BEYOND_MVP.md)** — honest order: `db:verify` + E2E CI → prod DNS/Stripe → optional scheduled GDPR packs. **Do not** re-wire M-Pesa/MFA/`tenant_id` unless verify fails on a fresh DB.

| Item | Status |
|------|--------|
| Custom domain + DNS | ✅ UI + verify; ops: CNAME to app |
| Stripe plan upgrades | ✅ Portal + Checkout + webhook |
| Scheduled GDPR packs per tenant | 🔧 Next compliance pass |
| E2E tenant A ≠ B | 🟡 Spec exists; wire CI |
| SAP/Shopify / event bus | ⬜ Phase 5 |

## 🔧 Good next implementations (this repo)

| Item | Effort | Notes |
|------|--------|--------|
| ~~Scheduled report runner cron~~ | Done | `npm run reports:process` |
| Scheduled GDPR export per tenant | Medium | Monthly queue + owner download |
| E2E in CI | Medium | `e2e/tenant-isolation.spec.ts` on PR |
| Live push / SMS providers UI | Low | Admin health + `preflight` |

---

## 🟡 Wire environment (not code gaps)

| Feature | Variables | Check |
|---------|-----------|--------|
| M-Pesa STK | `MPESA_*` | `npm run mpesa:check` |
| Stripe portal & cards | `STRIPE_SECRET_KEY` | |
| Email outbox | `SMTP_*` / `RESEND_API_KEY` | |
| SMS / WhatsApp | `SMS_API_KEY`, `WHATSAPP_API_KEY` | |
| FCM push | `FCM_SERVER_KEY` | |
| Google OAuth | `GOOGLE_OAUTH_*` | |
| OpenAI | `OPENAI_API_KEY` | |
| reCAPTCHA | Platform security settings | |
| Cron jobs | `CRON_SECRET` | `npm run setup:cron` |

```bash
npm run preflight
```

---

## ⬜ Phase 5 (not in monolith scope)

**Platform / infra**

- NestJS microservices, PostgreSQL migration, Kafka event bus
- Keycloak enterprise SSO (Google OAuth ✅)
- Native Flutter apps (PWAs ✅)
- Blockchain traceability, data warehouse, Elasticsearch
- Full SAP/Oracle ERP connectors (stub connectors exist)
- Multi-warehouse ATP, read replicas, CDN edge
- Native MQTT subscriber service

**AI (not in this pass)** — full guide: [`docs/AI_ENABLEMENT.md`](AI_ENABLEMENT.md)

- RAG over documents (contracts, HACCP PDFs)
- Agent tools (create PO, post journal from chat)
- Per-tenant AI cost / usage dashboard
- Custom ML models (beyond moving average / regression)

Run migration if needed: `node scripts/run-migrations.mjs` (includes `20260605_ai_enablement.sql`).

---

## Verify

```bash
node scripts/run-migrations.mjs
npm run db:verify
npm run typecheck
npm test
npm run mpesa:check
npm run smoke
npm run preflight
```

Deploy: [`DEPLOYMENT.md`](DEPLOYMENT.md) · Safe edits: [`WORKING_SAFELY.md`](WORKING_SAFELY.md)

Migration: **`20260612_suggested_features.sql`**
