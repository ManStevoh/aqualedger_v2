# Current codebase → AquaERP modules

Maps existing routes and tables to the target ERP module architecture.

## A. Authentication & access control

| Current | Target |
|---------|--------|
| `/login`, `/register`, `/api/auth/*` | MFA, SSO (planned), session management |
| Roles: `super_admin`, `investor`, `boat_owner`, … | Platform + tenant roles (see `docs/ROLES.md`) |
| `audit_logs`, rate limit on login | Activity logs, API tokens (planned) |

## B. Tenant & store management

| Current | Target |
|---------|--------|
| Single DB, no tenant | `tenants`, `branches`, `tenant_members` |
| — | Onboarding wizard, custom domain (planned) |

## C. E-commerce & marketplace

| Current | Target |
|---------|--------|
| `/dashboard/marketplace`, `/api/v2/marketplace` | Full catalog, variants, coupons |
| `/dashboard/orders`, `/api/v2/orders` | Checkout, delivery scheduling |
| — | Multi-vendor, commissions (planned) |

## D. Inventory management

| Current | Target |
|---------|--------|
| Catches, fish listings qty | Batch tracking, expiry, transfers |
| `fish_species` | Product master data |

## E. Cold storage

| Current | Target |
|---------|--------|
| `/dashboard/storage`, `storage_facilities` | Zones, IoT alerts (planned) |
| `storage_records` | Shelf-life, spoilage |

## F. Procurement

| Current | Target |
|---------|--------|
| — | RFQ, PO, GRN (planned) |

## G. Sales & CRM

| Current | Target |
|---------|--------|
| `/dashboard/users` | CRM leads, segmentation (planned) |
| `/api/v2/notifications` | SMS/email/WhatsApp (planned) |

## H. Accounting & finance

| Current | Target |
|---------|--------|
| `/dashboard/wallet`, `transactions` | GL, double-entry (planned) |
| `/dashboard/expenses` | AP, tax |
| `/dashboard/investments` | Capital / projects (keep as module) |
| — | Payroll, bank rec (planned) |

## I. Fishing operations (core strength)

| Current | Target |
|---------|--------|
| `/dashboard/fleet`, `/api/v2/boats` | Fleet + maintenance |
| `/dashboard/trips`, `/api/v2/trips` | Trips, fuel, zones |
| `/dashboard/catches` | Catch + grading |
| `/dashboard/bmu`, `/dashboard/licenses` | Cooperatives, compliance |
| `/dashboard/landing-sites` | Landing sites |
| `/dashboard/climate` | Weather advisories |

## J. Logistics

| Current | Target |
|---------|--------|
| — | Routes, driver app (planned) |

## K. HR

| Current | Target |
|---------|--------|
| — | Payroll, attendance (planned) |

## L. BI & reporting

| Current | Target |
|---------|--------|
| `/dashboard/analytics` | KPI warehouse (planned) |
| `/dashboard/admin` | Platform admin console |

## API surface today

All production APIs: `/api/v2/*` — see `SYSTEM_STATUS.md`.

Legacy mock `/api/*` removed.
