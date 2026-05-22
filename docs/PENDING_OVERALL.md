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
| `DashboardPageLayout` shared shell | `components/dashboard/dashboard-page-layout.tsx` |
| Order detail page + API | `/dashboard/orders/[id]`, `GET /api/v2/orders/[id]` |
| Orders list → detail link | `/dashboard/orders` “View order” |
| Edge-safe custom domains | `GET /api/internal/resolve-host` |
| Server dashboard module gate | `DashboardModuleServerGate` + `lib/platform/dashboard-access.ts` |
| GDPR export cron + download | `npm run exports:process`, download API |
| Env / deploy tooling | `npm run preflight`, `npm run predeploy`, `npm run smoke` |

---

## 🔧 Good next implementations (this repo)

| Item | Effort | Notes |
|------|--------|--------|
| Migrate remaining pages to `DashboardPageLayout` | Medium | Many pages already import it; run `fix-dashboard-layout.mjs` only after `git diff` review |
| `PATCH /api/v2/orders/[id]` | Low | REST alias for status updates (PUT on collection exists) |
| Live push / SMS providers UI | Low | Wire admin health to show channel status from `preflight` |
| Multi-currency on wallet FX tab | Low | Wallet page has FX UI — ensure rates API seeded |
| E2E smoke with test DB | Medium | Vitest + optional Playwright for login → order flow |
| Scheduled report runner cron | Low | Mirror `exports:process` pattern for `reports/run-scheduled` |

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

- NestJS microservices, PostgreSQL migration, Kafka event bus
- Keycloak enterprise SSO (Google OAuth ✅)
- Native Flutter apps (PWAs ✅)
- Blockchain traceability, data warehouse, Elasticsearch
- Full SAP/Oracle ERP connectors (stub connectors exist)
- Multi-warehouse ATP, read replicas, CDN edge
- Native MQTT subscriber service

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
