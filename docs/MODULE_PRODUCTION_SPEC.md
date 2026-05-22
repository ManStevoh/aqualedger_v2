# AquaERP — Production Module Specification

International alignment: **IFRS** (finance), **ISO 22000 / HACCP** (food safety), **EU Regulation 1379/2013** (fisheries traceability), **FAO Code of Conduct** (sustainable fishing), **GDPR** (data privacy), **PCI-DSS concepts** (payments), **GS1** (batch/lot IDs).

---

## A. Authentication & Access Control

| Feature | Status | Standard |
|---------|--------|----------|
| JWT + refresh sessions | Done | OWASP |
| RBAC permission matrix | Done | — |
| Rate limiting (login) | Done | OWASP |
| Audit logs | Done | SOC2 |
| API tokens (scoped) | **Add** | OAuth2-style |
| MFA (TOTP) enrollment | **Add** | NIST 800-63B |
| Session list + revoke | **Add** | — |
| Password policy config | **Add** | — |
| Device / IP login alerts | **Add** | — |

## B. Tenant & Organization

| Feature | Status | Standard |
|---------|--------|----------|
| tenants, branches, members | Done | Multi-tenant SaaS |
| Tenant settings JSON | **Enhance** | ISO 3166 currencies |
| Subscription plans | **Add** | SaaS billing |
| Onboarding checklist | **Add** | — |
| Custom branding (logo, colors) | **Enhance** | — |
| Tax registration (VAT/TIN) | **Add** | — |

## C. Commerce & Marketplace

| Feature | Status | Standard |
|---------|--------|----------|
| Marketplace listings | Done | — |
| Orders | Done | — |
| Product catalog + variants | **Add** | GS1 SKU |
| Coupons / promotions | **Add** | — |
| Multi-vendor + commission | **Add** | — |
| Checkout tax breakdown | **Add** | — |
| Export documentation (CO, health cert) | **Add** | EU export |

## D. Inventory

| Feature | Status | Standard |
|---------|--------|----------|
| Inventory batches | Done | Lot tracking |
| Stock movements ledger | **Add** | Immutable trail |
| Inter-warehouse transfers | **Add** | — |
| FEFO expiry alerts | **Add** | ISO 22000 |
| Weight UOM conversion | **Add** | — |
| Barcode / lot QR | **Add** | GS1 |

## E. Cold Chain

| Feature | Status | Standard |
|---------|--------|----------|
| Storage facilities | Done | — |
| Temperature alerts | Done | HACCP |
| Storage zones | **Add** | — |
| Temperature readings time-series | **Add** | ISO 22000 |
| HACCP checklists | **Add** | Codex Alimentarius |
| Spoilage / quarantine | **Add** | — |

## F. Procurement

| Feature | Status | Standard |
|---------|--------|----------|
| Suppliers, POs | Done | — |
| Purchase requests (PR) | **Add** | — |
| RFQ + quotations | **Add** | — |
| Goods receipt (GRN) | **Add** | 3-way match |
| Supplier scorecards | **Add** | — |
| Incoterms on PO | **Add** | ICC Incoterms |

## G. CRM

| Feature | Status | Standard |
|---------|--------|----------|
| Customers, leads | Done | — |
| Credit scores | Done | — |
| Activity timeline | **Add** | — |
| Customer segments | **Add** | — |
| GDPR data export | **Add** | GDPR Art. 15 |
| Communication log | **Add** | — |

## H. Accounting & Finance

| Feature | Status | Standard |
|---------|--------|----------|
| GL + journal entries | Done | IFRS |
| Wallet, expenses | Done | — |
| Tax codes (VAT) | **Add** | — |
| AP / AR invoices | **Add** | — |
| Trial balance report | **Add** | IFRS |
| Balance sheet / P&L | **Add** | IFRS |
| Multi-currency rates | **Add** | IAS 21 |
| Bank reconciliation | **Add** | — |

## I. Fishing Operations

| Feature | Status | Standard |
|---------|--------|----------|
| Fleet, trips, catches | Done | FAO |
| BMU, licenses, landing sites | Done | — |
| Catch traceability lot ID | **Add** | EU 1379/2013 |
| Fish grading (A/B/C) | **Add** | — |
| Auction records | **Add** | — |
| Fuel / zone tracking | **Enhance** | — |
| MSC / sustainability flags | **Add** | MSC chain of custody |

## J. Logistics

| Feature | Status | Standard |
|---------|--------|----------|
| Deliveries | Done | — |
| Route planning | **Add** | — |
| Status history | **Add** | — |
| POD signature / photo | **Enhance** | — |
| Cold-chain delivery flag | **Add** | — |

## K. HR

| Feature | Status | Standard |
|---------|--------|----------|
| Employees, payroll runs | Done | — |
| Attendance | **Add** | ILO |
| Leave management | **Add** | — |
| Contracts | **Add** | — |

## L. Analytics & BI

| Feature | Status | Standard |
|---------|--------|----------|
| Dashboard analytics | Done | — |
| KPI catalog | **Add** | — |
| Traceability report (boat→buyer) | **Add** | EU fisheries |
| CSV export | **Add** | — |

## M–P. Mobile, Integrations, Notifications, AI

| Feature | Status |
|---------|--------|
| PWA manifest + offline shell | **Add** |
| Webhook integrations | **Add** |
| Notification templates | **Add** |
| Demand forecast (moving avg) | **Add** |

---

## Implementation priority (this release)

1. Database migration `20260523_production_enhancements.sql`
2. Extend each `lib/modules/*` service + API routes
3. Enhance dashboard UIs with tabs, filters, export
4. Migrate legacy APIs to `requirePermission`
5. Deprecate investments API (410 response)
