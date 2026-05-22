# Beyond MVP — honest pilot roadmap

You do **not** need another monolith pass on M-Pesa STK, MFA, or `tenant_id` scoping unless something fails on a clean machine:

```bash
node scripts/setup-fresh-database.mjs   # or npm run db:docker:setup
npm run db:verify
npm run verify-tenant-isolation   # if present in package.json — else npm test
```

If `db:verify` fails, fix migrations first ([`DATABASE_SETUP.md`](DATABASE_SETUP.md)) — do not add features on a broken schema.

---

## Status of your “next pass” list

| Item | In monolith today? | Gap for production pilots |
|------|-------------------|-------------------------|
| **Custom domain + DNS** (`coop.example.com`) | ✅ | Organization → Domains: request domain, TXT verify, primary domain, middleware `resolve-host` → storefront. Needs: prod DNS (CNAME/ALIAS to app), wildcard for subdomains, optional **auto re-verify** cron. |
| **Stripe Billing / plan upgrades** | ✅ | Portal + Checkout upgrade + invoices + webhook (recent pass). Needs: `STRIPE_*_PRICE_*`, webhook URL in Stripe Dashboard, live keys. |
| **Per-tenant GDPR / data residency packs** | 🟡 | Admin can queue exports; `npm run exports:process` processes queue. **Not** yet: per-tenant schedule (e.g. monthly pack), residency region flag, owner self-service download hub. |
| **E2E tenant A ≠ tenant B** | 🟡 | Playwright [`e2e/tenant-isolation.spec.ts`](../e2e/tenant-isolation.spec.ts) + Vitest isolation tests. Needs: CI job, seeded `owner-coastfish` + second tenant, `npm run test:e2e` in predeploy optional profile. |
| **SAP / Shopify / event bus / ATP** | ⬜ | Phase 5 — separate infra ([`MIGRATION_ROADMAP.md`](MIGRATION_ROADMAP.md)). |

**Already shipped (stop re-wiring):** subdomain routing (`{slug}.{PLATFORM_HOST}`), Paystack, M-Pesa auto-reconcile cron, payment monitor, invoices hub, portal roles, AI Command Center, marketplace guest checkout.

---

## Recommended order for production pilots

### 1. Trust the foundation (1–2 days)

- Fresh DB: `node scripts/setup-fresh-database.mjs` → `npm run db:verify`
- `npm run hardening` or `npm run predeploy`
- Run `npm run test:e2e` with dev server + demo tenants ([`FORM_TESTING.md`](FORM_TESTING.md))
- Wire Playwright into CI (fail PR if tenant isolation spec fails)

**Why first:** Pilots fail on schema drift and cross-tenant leaks, not missing UI polish.

### 2. Hosting & payments in production (ops, not code)

- DNS: `PLATFORM_HOST`, wildcard `*.yourdomain.com`, custom domain CNAME to app
- Stripe: prices, webhook `https://your-domain.com/api/payments/stripe/webhook`
- M-Pesa / Paystack callbacks reachable from internet
- Cron: `CRON_SECRET` + `npm run exports:process` + `npm run reconcile:payments`

### 3. Custom domain polish (small code, if needed)

- Optional cron: re-check unverified domains / notify owner
- Docs for registrars (CNAME vs A/ALIAS) — see [`TENANT_HOSTING.md`](TENANT_HOSTING.md)

### 4. Scheduled GDPR packs (compliance pilots)

- Per-tenant `data_export_schedule` (monthly/quarterly) + cron enqueue
- Tenant owner: “Download latest compliance pack” under Organization settings
- Platform admin: retention + purge policy (separate from export)

### 5. E2E expansion (ongoing)

- Add cases: orders, wallet, storefront guest cart, `GET` with wrong `x-tenant-id`
- Keep Vitest `tenant-isolation` + `form-api-tenant-isolation` in `npm test`

### 6. Phase 5 scale (later)

Event bus, multi-warehouse ATP, SAP/Shopify connectors — **not** required for coastal ERP pilots.

---

## What to say in sales / RFP

| Claim | Accurate when |
|-------|----------------|
| Multi-tenant SaaS with subdomain storefront | ✅ `{slug}.platformhost` |
| Custom domain storefront | ✅ After DNS verify |
| M-Pesa + Paystack + Stripe commerce | ✅ With env keys (stub without) |
| AI-assisted / AI-enabled ERP | ✅ See [`AI_ENABLEMENT.md`](AI_ENABLEMENT.md) |
| Automated GDPR export | 🟡 On-demand + platform batch; scheduled packs = next |
| Enterprise SAP/Shopify tier | ⬜ Phase 5 roadmap only |

---

## Quick reference

| Task | Command / path |
|------|----------------|
| Full DB reset | `node scripts/setup-fresh-database.mjs` |
| Migrations only | `node scripts/run-migrations.mjs` |
| GDPR export processor | `npm run exports:process` |
| Payment reconcile | `npm run reconcile:payments` |
| E2E isolation | `npm run test:e2e` (needs `npm run dev`) |
| Custom domains UI | `/dashboard/organization/domains` |
| Stripe billing | `/dashboard/organization/billing` |
| Pilot checklist | [`PILOT_GO_LIVE.md`](PILOT_GO_LIVE.md) |
