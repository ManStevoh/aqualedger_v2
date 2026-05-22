# AquaERP — Technical Architecture

## Current state (Phase 1 baseline)

| Layer | Today | Notes |
|-------|-------|-------|
| Frontend | Next.js 16 App Router, React 19, Tailwind 4, shadcn/Radix | Keep — strong for SaaS UI |
| API | Next.js Route Handlers `/api/v2/*` | Modular monolith pattern |
| Database | MySQL `aqualedger32` | Migrate to PostgreSQL in Phase 3 if needed |
| Auth | JWT cookies + refresh sessions | Extend with tenant claims |
| Cache / queue | None | Add Redis + job queue in Phase 2 |
| Search | SQL only | Elasticsearch optional Phase 3 |

**Do not rewrite to NestJS until Phase 2.** Extend the modular monolith first.

## Target architecture (phased)

### Phase 1 — Modular monolith (now → 3 months)

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Application                   │
│  app/          UI (dashboard modules by domain)          │
│  app/api/v2/   REST API (domain route groups)            │
│  lib/          Domain services (auth, tenant, fleet…)    │
│  components/   Shared UI                                  │
└──────────────────────────┬──────────────────────────────┘
                           │
                    MySQL aqualedger32
                    + tenant_id on rows (rolling)
```

- Introduce `tenants`, `branches`, `tenant_members`
- Default tenant for existing data (migration)
- Domain folders under `lib/modules/{fleet,marketplace,accounting,...}`
- Event table for async workflows (later worker)

### Phase 2 — Platform services (3–9 months)

- Redis (sessions, rate limits, cache)
- BullMQ or RabbitMQ (notifications, exports, webhooks)
- M-Pesa, SMS, email providers
- PWA + offline queue for coastal users
- Double-entry accounting module (immutable ledger lines)

### Phase 3 — Scale-out (9–18 months)

- Optional PostgreSQL migration
- Extract high-load services: notifications, analytics, marketplace checkout
- Read replicas, S3 for documents/images
- Kubernetes + observability (Grafana, structured logs)

## Multi-tenant model

Every business table eventually includes:

```sql
tenant_id VARCHAR(36) NOT NULL,
branch_id VARCHAR(36) NULL,  -- optional
created_by VARCHAR(36) NULL,
updated_by VARCHAR(36) NULL,
deleted_at TIMESTAMP NULL     -- soft delete
```

**Isolation rules:**

1. JWT carries `tenantId` (+ optional `branchId`)
2. All queries append `WHERE tenant_id = ?`
3. Super platform admin can cross-tenant; tenant admin cannot

## Security baseline

- OWASP-minded: parameterized SQL, CSRF-safe cookies, rate limits on auth
- RBAC per tenant (not global roles only)
- Audit logs (exists: `audit_logs`)
- Encryption at rest (DB/hosting) + TLS in transit
- PCI: use payment gateways — never store card PANs

## API standards (v2 → v3)

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 100 },
  "error": null,
  "code": null
}
```

- Version prefix: `/api/v2` → `/api/v3` when breaking
- OpenAPI spec in `docs/openapi` (planned)

## UI/UX principles

- Mobile-first dashboards
- Role-based home screens
- &lt; 3 clicks to log catch, record sale, view stock
- Dark/light mode (next-themes — wire globally)
- Inspiration: Stripe dashboard density + Shopify clarity

## Repository layout (target)

```
app/
  (marketing)/
  (auth)/
  dashboard/
    [module]/          # fleet, marketplace, accounting, ...
  api/v2/
    [module]/
lib/
  modules/
    tenant/
    fleet/
    marketplace/
    accounting/
    ...
  platform-access.ts
database/
  schema.sql
  migrations/
docs/
```
