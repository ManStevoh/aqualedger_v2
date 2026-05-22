# AquaERP — Overall pending vs complete

Last updated: **2026-06-12** full suggested-features pass.

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Implemented in monolith |
| 🟡 | Code complete; needs production `.env` / external service |
| ⬜ | Phase 5 / separate infra (not in this repo scope) |

---

## ✅ Implemented (suggested features pass)

| Feature | Where |
|---------|--------|
| Custom domain DNS verification | TXT `_aquaerp-verify.{domain}` → `POST` domains `verify-dns` |
| Custom domain host routing | Verified domain → `x-tenant-id` in middleware |
| Stripe Billing Portal | `/dashboard/organization/billing` → `POST /api/v2/tenant/billing-portal` |
| Per-tenant feature flags | `tenant_feature_flags` + admin tenants dialog |
| Tenant-scoped module nav | `GET /api/v2/tenant/modules` + API `assertApiModuleEnabled` with `x-tenant-id` |
| M-Pesa reconciliation job | `POST /api/v2/platform/payments/reconcile` + admin Payments button |
| Scheduled GDPR exports | `tenant_data_exports` + `POST /api/v2/platform/exports` |
| Platform user invite | `POST /api/v2/platform/users/invite` + admin Users dialog |
| Tenant isolation unit tests | `lib/__tests__/tenant-isolation.test.ts` |
| Super admin suite (prior) | Command center, tenants, users, impersonation, analytics, payments, billing, broadcast, purge, settings |

---

## 🟡 Wire environment (not code gaps)

| Feature | Variables |
|---------|-----------|
| M-Pesa STK | `MPESA_*` |
| Stripe portal & cards | `STRIPE_SECRET_KEY` |
| Email outbox | `SMTP_*` |
| SMS / WhatsApp | `SMS_API_KEY`, `WHATSAPP_API_KEY` |
| FCM push | `FCM_SERVER_KEY` |
| Google OAuth | `GOOGLE_OAUTH_*` |
| OpenAI | `OPENAI_API_KEY` |
| reCAPTCHA | Platform security settings |

---

## ⬜ Phase 5 (not in monolith scope)

- NestJS microservices, PostgreSQL migration, Kafka event bus
- Keycloak enterprise SSO (Google OAuth ✅)
- Native Flutter apps (PWAs ✅)
- Blockchain traceability, data warehouse, Elasticsearch
- Full SAP/Oracle ERP connectors (stub connectors exist)
- Multi-warehouse ATP, read replicas, CDN edge

---

## Verify

```bash
node scripts/run-migrations.mjs
npm run db:verify
npm run typecheck
npm test
npm run mpesa:check
npm run smoke
```

Deploy: [`DEPLOYMENT.md`](DEPLOYMENT.md)

Migration: **`20260612_suggested_features.sql`**
