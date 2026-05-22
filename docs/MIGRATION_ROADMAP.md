# AquaERP — Migration Roadmap

Transform **AquaLedger** (single-tenant fisheries OS) → **AquaERP** (multi-tenant vertical SaaS).

## Phase 0 — Foundation (Week 1–2) ✅ complete

- [x] Security hardening (JWT, v2 APIs, audit logs)
- [x] Forms wired to MySQL `aqualedger32`
- [x] Platform vision & architecture docs
- [x] Multi-tenant foundation tables + default tenant migration
- [x] Rebrand UI strings to AquaERP (env-driven)
- [x] Module map in sidebar (grouped by ERP domain)

## Phase 1 — Tenant SaaS core (Week 3–6) ✅ largely complete

- [ ] Tenant onboarding wizard (create org + owner)
- [x] Users belong to tenant via `tenant_members`
- [x] Add `tenant_id` to: boats, trips, catches, listings, orders, wallets, expenses, storage, BMU, licenses, etc.
- [x] All `/api/v2/*` routes use `withApiPermission`
- [x] Tenant settings: name, logo, currency, VAT/TIN (PATCH)
- [x] Branch support (landing site / cold store as branch)
- [ ] Middleware resolves tenant from subdomain or header

## Phase 2 — Commerce & inventory ✅ largely complete

- [x] Product catalog (variants, grades, weight-based SKUs)
- [x] Batch + expiry on inventory movements
- [x] Marketplace commissions & vendor payouts
- [x] M-Pesa payment intents (stub)
- [x] GRN / purchase orders (procurement)
- [x] CRM: customer profiles linked to orders

## Phase 3 — Accounting & compliance ✅ largely complete

- [x] Chart of accounts per tenant
- [x] Double-entry journal (immutable lines)
- [x] AR/AP, P&L, balance sheet exports
- [x] Tax rules (VAT Kenya seed)
- [x] Catch-to-sale traceability report

## Phase 4 — Logistics & mobile 🟡 in progress

- [x] Delivery assignments + driver status
- [x] PWA offline shell + service worker
- [x] Notification preferences
- [ ] Live push / SMS providers
- [x] IoT ingest (HTTP device keys + global gateway secret; MQTT via bridge)
- [ ] Native MQTT subscriber service (Phase 5)

## Phase 5 — Enterprise scale (Month 9–18)

- [ ] Service extraction (notifications, analytics)
- [ ] PostgreSQL evaluation / migration
- [ ] Multi-country currency + language
- [ ] SSO / OAuth enterprise
- [ ] AI demand forecasting (optional)

## What NOT to do in Phase 1

- Full microservices split
- Flutter apps before PWA works
- Blockchain traceability
- Full IFRS suite before basic GL works

## Success metrics per phase

| Phase | Metric |
|-------|--------|
| 1 | 2+ tenants isolated; zero cross-tenant data leaks |
| 2 | End-to-end: catch → listing → order → wallet |
| 3 | Trial balance matches wallet movements |
| 4 | Offline catch logged and synced |
| 5 | 99.9% uptime, &lt;200ms p95 API on core reads |
