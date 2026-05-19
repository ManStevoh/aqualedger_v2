# AquaLedger — System Status (v2.1)

## Architecture

- **Frontend:** Next.js 16 App Router, React 19, Tailwind 4, shadcn/Radix
- **API:** `/api/v2/*` (MySQL-backed, authenticated)
- **Auth:** JWT access cookies (15m) + refresh tokens in `sessions` table
- **Database:** MySQL `aqualedger32`

Legacy mock `/api/*` routes (v1) have been **removed**. All dashboard modules use v2 APIs.

## Security

| Control | Status |
|---------|--------|
| JWT verification in middleware (dashboard + `/api/v2`) | ✅ |
| `JWT_SECRET` required in production (min 32 chars) | ✅ |
| Rate limiting on login/register | ✅ |
| Role-based API access (`requireAuth` / `requireRole`) | ✅ |
| Audit logging (`audit_logs` table) | ✅ |
| TypeScript build errors enforced | ✅ |

## API Surface (`/api/v2`)

| Module | Route |
|--------|-------|
| Analytics | `/api/v2/analytics` |
| BMU | `/api/v2/bmu` |
| Boats | `/api/v2/boats` |
| Catches | `/api/v2/catches` |
| Climate | `/api/v2/climate` |
| Credit score | `/api/v2/credit-score` |
| Digital identity (KYC) | `/api/v2/digital-identity` |
| Expenses | `/api/v2/expenses` |
| Fish species | `/api/v2/fish-species` |
| Investments | `/api/v2/investments` |
| Investment packages | `/api/v2/investment-packages` |
| Landing sites | `/api/v2/landing-sites` |
| Licenses | `/api/v2/licenses` |
| Maintenance | `/api/v2/maintenance` |
| Marketplace | `/api/v2/marketplace` |
| Notifications | `/api/v2/notifications` |
| Orders | `/api/v2/orders` |
| Storage | `/api/v2/storage` |
| Trips | `/api/v2/trips` |
| Users | `/api/v2/users` |
| Wallet | `/api/v2/wallet` |

**Public:** `/api/health`, `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`

## Roles & data access

- **super_admin / investor:** Full platform visibility (`hasFullSystemAccess`)
- **boat_owner, fisherman, fish_buyer, bmu_official:** Scoped to own records
- **Admin console:** `/dashboard/admin` (super_admin, investor)

## Setup

```bash
mysql -u root -p aqualedger32 < database/schema.sql
mysql -u root -p aqualedger32 < database/migrations/20260516_audit_logs.sql
cp .env.example .env.local
# Set JWT_SECRET (32+ chars) and DB_PASSWORD
npm install
npm run dev
```

## Quality

- **Tests:** `npm test` (Vitest — validation, API errors, platform access)
- **CI:** GitHub Actions — typecheck, test, build
- **Validation:** Zod schemas in `lib/validation/schemas.ts`

## Optional integrations (not yet wired)

M-Pesa, SMS, S3, OpenWeather — placeholders removed from `.env.example` until implemented.
