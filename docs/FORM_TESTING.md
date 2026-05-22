# Form testing

## Unit & static (no server)

```bash
npm test                 # 98 tests — schemas, tenant isolation, permissions
npm run test:forms       # form schema + API isolation subset
```

Covers Zod validation for dashboard create payloads and static checks that POST handlers bind `ctx.tenantId` (not `body.tenantId`).

## E2E (Playwright)

Requires:

1. MySQL running with demo data: `npm run db:seed:demo` (or `db:seed:super-admin:fresh`)
2. App reachable at `http://localhost:3000` (Playwright can start `npm run dev` automatically)

```bash
npm run test:e2e:preflight        # health + demo login checks
npx playwright install chromium   # first time only
npm run test:e2e
npm run test:e2e:ui               # debug UI
PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e   # if dev is already running
```

### Suites

| File | What it tests |
|------|----------------|
| `e2e/auth.setup.ts` | Login `owner-coastfish@demo.aquaerp.local` / `Demo@123` |
| `e2e/forms/insurance.spec.ts` | Add policy dialog → table row |
| `e2e/forms/expenses.spec.ts` | Add expense dialog → list |
| `e2e/forms/crm-leads.spec.ts` | Add lead dialog → pipeline |
| `e2e/forms/procurement-suppliers.spec.ts` | Add supplier dialog → table |
| `e2e/forms/hr-employees.spec.ts` | Add employee dialog → table |
| `e2e/forms/onboarding.spec.ts` | Completed tenant redirect + API `isComplete` |
| `e2e/tenant-isolation.spec.ts` | Cross-tenant CRM, insurance, expenses isolation |

### Demo credentials

- **Tenant A:** `owner-coastfish@demo.aquaerp.local` / `Demo@123`
- **Tenant B:** `owner-mombasamarine@demo.aquaerp.local` / `Demo@123`

## Full verify stack

```bash
npm run typecheck
npm test
npm run db:verify          # needs MySQL
npm run test:e2e           # needs MySQL + dev
npm run smoke              # HTTP probes
```
