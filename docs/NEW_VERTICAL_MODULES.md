# New vertical modules (20260606)

Three modules added for coastal seafood operators — full stack (DB, API, UI, RBAC).

## 1. Catch quotas & compliance

**Why:** EEZ/species allocations vs actual landings; avoid fines and license suspension.

| Item | Path |
|------|------|
| UI | `/dashboard/fishing/quotas` |
| API | `GET/POST /api/v2/fishing/quotas`, `PATCH /api/v2/fishing/quotas/[id]` |
| Permissions | `fishing.quotas.read`, `fishing.quotas.write` |

Utilization is computed live from `catches` joined to `fishing_trips` (species + zone + date range).

## 2. Forward sales contracts

**Why:** Pre-sell harvest to hotels, exporters, and wholesalers at fixed KES/kg.

| Item | Path |
|------|------|
| UI | `/dashboard/commerce/contracts` |
| API | `GET/POST /api/v2/commerce/contracts`, `PATCH .../[id]` (`fulfill` or `status`) |
| Permissions | `commerce.contracts.read`, `commerce.contracts.write` |

## 3. Insurance & claims

**Why:** Hull/liability/cargo policies and incident claims — beyond boat insurance fields.

| Item | Path |
|------|------|
| UI | `/dashboard/risk/insurance` |
| API | `GET/POST /api/v2/risk/insurance`, `PATCH /api/v2/risk/insurance/claims/[id]` |
| Permissions | `risk.insurance.read`, `risk.insurance.write` |

## Migration

```bash
node scripts/run-migrations.mjs
```

File: `database/migrations/20260606_vertical_modules.sql`

## Future module ideas (not built)

| Module | Value |
|--------|--------|
| Port & bunkering | Fuel/ice/agency costs per landing |
| MSC / sustainability certs | Chain-of-custody for EU retail |
| Vessel charter & lease | Third-party boat economics |
| Buyer disputes | Formal spoilage/shortage cases |
