# Role model — current vs AquaERP target

## Current roles (single-tenant)

| Role | Purpose today |
|------|----------------|
| `super_admin` | Full platform access |
| `investor` | Platform operator + full data visibility |
| `boat_owner` | Own fleet, trips, catches |
| `fisherman` | Trips, catches, credit |
| `fish_buyer` | Marketplace buyer |
| `bmu_official` | BMU, licenses, landing sites |

## Target roles (multi-tenant)

### Platform level (AquaERP staff)

| Role | Scope |
|------|-------|
| `platform_super_admin` | All tenants, billing, support |
| `platform_support` | Read-only cross-tenant support |

### Tenant level (per company)

| Role | Maps from | Permissions |
|------|-----------|-------------|
| `tenant_owner` | new | Billing, branding, all modules |
| `branch_manager` | boat_owner / bmu | Branch operations |
| `accountant` | new | Finance modules only |
| `procurement_officer` | new | PO, suppliers |
| `warehouse_staff` | new | Inventory, cold storage |
| `fisherman` | fisherman | Catch, trips (assigned) |
| `vendor` | boat_owner / seller | Marketplace listings |
| `delivery_staff` | new | Logistics app |
| `customer` | fish_buyer | Storefront only |
| `hr_officer` | new | HR module |

## Migration strategy

1. Keep existing `users.role` enum during Phase 1
2. Add `tenant_members.role` for per-tenant permissions
3. Map `investor` → `tenant_owner` or `platform_operator` explicitly
4. Deprecate global cross-tenant visibility except platform roles
