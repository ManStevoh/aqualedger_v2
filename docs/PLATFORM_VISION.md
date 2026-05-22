# AquaERP — Platform Vision

**AquaERP** is a multi-tenant vertical SaaS for the global fishing and seafood industry — combining ERP, supply chain, fish markets, cold chain, multi-vendor e-commerce, accounting, CRM, and business intelligence in one industry-specific platform.

## Positioning

| Generic ERP | AquaERP |
|-------------|---------|
| One-size-fits-all modules | Catch, grading, auctions, landing sites, EU traceability |
| Bolt-on e-commerce | Native storefront + marketplace + guest checkout |
| Weak cold chain | HACCP, IoT ingest, spoilage → inventory |
| Paper / WhatsApp ops | Mobile driver PWA, barcode scan, outbox notifications |

**Inspiration:** Shopify + SAP + NetSuite + Odoo — **built for seafood**.

## Architecture (Phase 1 — shipped)

- **Modular monolith:** Next.js 16 App Router, 120+ `/api/v2/*` routes
- **Multi-tenant:** `tenant_id` on core tables, RBAC (50+ permissions)
- **Event-driven:** `domain_events` + `workflow_rules` processor
- **MySQL:** `aqualedger32` with migrations through `20260528`

## Target users

- Small: fishermen, stalls, beach operators  
- Medium: processors, distributors, cold storage  
- Large: exporters, chains, logistics, government fisheries  

## Revenue model

SaaS subscriptions · marketplace commissions · delivery fees · premium analytics · white-label stores · API access · enterprise licensing  

## Phase 5 (separate repos / infra)

NestJS microservices · PostgreSQL · Redis · Elasticsearch · Flutter native apps · Keycloak SSO at scale · blockchain traceability · data warehouse  

## Documentation index

- [`MODULE_COMPLETE_CHECKLIST.md`](MODULE_COMPLETE_CHECKLIST.md) — feature status  
- [`ECOMMERCE_GLOBAL_STANDARDS.md`](ECOMMERCE_GLOBAL_STANDARDS.md) — storefront compliance  
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — technical design  
- [`MIGRATION_ROADMAP.md`](MIGRATION_ROADMAP.md) — phase plan  
