# AquaERP — Production deployment

Operator checklist for pilot tenants and sandbox go-lives. The app is a **Next.js monolith** on MySQL — no separate microservices required for MVP.

## 1. Prerequisites

| Requirement | Notes |
|-------------|--------|
| Node.js 20+ | `npm ci` |
| MySQL 8+ | Database `aquaerp_operating` (or `DB_NAME`) |
| HTTPS origin | Required for M-Pesa callbacks, OAuth, secure cookies |

## 2. Environment

Copy [`.env.example`](../.env.example) to `.env` (or `.env.local` on Vercel).

**Required**

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | Public app URL (emails, callbacks, sitemaps) |
| `JWT_SECRET` | Min 32 characters in production |
| `DB_*` | MySQL connection |
| `CRON_SECRET` | GDPR export cron (`npm run exports:process`) |

**Recommended for go-live**

| Variable | Purpose |
|----------|---------|
| `MPESA_*` | Daraja STK — see [`docs/MPESA_SANDBOX.md`](MPESA_SANDBOX.md) |
| `STRIPE_SECRET_KEY` | Billing portal + cards |
| `SMTP_*` or `RESEND_API_KEY` | Transactional email |
| `PLATFORM_HOST` | Apex domain for subdomain tenants (e.g. `aquaerp.co.ke`) |

Run env checks:

```bash
npm run db:verify
npm run env:check
npm run mpesa:check
npm run smoke
```

Pilot tenant checklist: [`PILOT_GO_LIVE.md`](PILOT_GO_LIVE.md)

## 3. Database

**Fresh install**

```bash
node scripts/setup-fresh-database.mjs
```

**Existing database**

```bash
node scripts/run-migrations.mjs
npm run db:verify
```

Latest migration: `database/migrations/20260612_suggested_features.sql`

## 4. Build & run

```bash
npm run predeploy   # typecheck + test + db:verify + build
npm run start
```

Or step by step:

```bash
npm run typecheck
npm test
npm run build
npm run start
```

Development: `npm run dev`

## 5. Tenant routing

| Mode | Example | Behavior |
|------|---------|----------|
| Subdomain | `acme.yourdomain.com` | `x-tenant-slug: acme`; `/` → `/store/acme` |
| Custom domain | `shop.client.com` | DNS TXT verify; `/` → tenant storefront |
| Apex | `yourdomain.com` | Platform login / marketing |

Configure **Organization → Domains** for custom domains. Point CNAME to your app host, then verify DNS.

Custom domains are resolved via `GET /api/internal/resolve-host` (Node.js) from Edge middleware — no MySQL in the middleware layer.

## 6. Cron jobs

| Job | Schedule | Command |
|-----|----------|---------|
| GDPR exports | Every 15–60 min | `npm run exports:process` |
| AI automation (optional) | Daily | `POST /api/v2/ai/automation/run` with `X-AquaERP-Cron-Secret` |

Set `CRON_SECRET` and `APP_URL` (or `NEXT_PUBLIC_APP_URL`) before scheduling.

```bash
npm run setup:cron   # generates CRON_SECRET in .env if missing
```

Example (Linux cron):

```cron
*/30 * * * * cd /app/fisheries-operating-system && npm run exports:process >> /var/log/aquaerp-exports.log 2>&1
```

## 7. Super admin first login

1. Run migrations (seed may create default super admin — check `database/schema.sql` / setup script).
2. Sign in at `/login`.
3. Open **Platform → Command center** (`/dashboard/admin`).
4. Provision tenants, toggle modules, configure M-Pesa/Stripe in **Integrations**.

## 8. Smoke test (post-deploy)

```bash
npm run smoke
# With app running and admin cookie optional for deeper checks
```

Manual:

- [ ] Register tenant (or provision from admin)
- [ ] Complete `/dashboard/onboarding`
- [ ] Enroll MFA at **Settings → Security**
- [ ] Publish storefront `/store/{slug}`
- [ ] Guest checkout + M-Pesa STK (sandbox phone)
- [ ] Impersonate user (admin) and exit banner

## 9. Vercel

See [`docs/VERCEL_DEPLOY.md`](VERCEL_DEPLOY.md) for env vars, `vercel.json` cron, and MySQL hosting.

## 10. Docker / VM notes

- Set all env vars in the hosting dashboard; never commit `.env`.
- `storage/exports/` must be writable for GDPR jobs (use persistent volume or object storage migration for multi-instance).
- Webhook URLs: M-Pesa callback → `{APP_URL}/api/payments/mpesa/callback` (see integrations module).

## 10. Phase 5 (out of scope)

NestJS services, PostgreSQL, Kafka, Flutter native apps — see [`docs/MIGRATION_ROADMAP.md`](MIGRATION_ROADMAP.md).
