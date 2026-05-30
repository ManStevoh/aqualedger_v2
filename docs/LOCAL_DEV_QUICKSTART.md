# Local dev quickstart (DB + tests + E2E)

## Option A — Docker MySQL (recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```powershell
# 1. Align DB credentials (docker uses root/root)
#    Merge .env.docker.example into .env or .env.local:
#    DB_PASSWORD=root

npm run db:docker:up
node scripts/wait-for-mysql.mjs
npm run db:setup
npm run db:seed:super-admin:fresh

npm run dev
npm run test:e2e:preflight
npx playwright install chromium
npm run test:e2e
```

One-liner after Docker is installed:

```powershell
npm run db:docker:setup
```

## Option B — Existing MySQL (XAMPP / MariaDB / local install)

1. Start MySQL service on port `3306`.
2. Set `.env`: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=aquaerp_operating`.
3. Run:

```powershell
npm run db:setup
npm run db:seed:demo
npm run dev
```

## Verify stack

```powershell
npm run db:verify
npm test
npm run test:forms
npm run smoke
npm run test:e2e:preflight
npm run test:e2e
```

## Demo logins

| Role | Email | Password |
|------|-------|----------|
| Super admin | admin@aqualedger.co.ke | Admin@123 |
| Tenant owner (Coast Fish) | owner-coastfish@demo.aquaerp.local | Demo@123 |
| Tenant owner (Lamu Sea) | owner-lamusea@demo.aquaerp.local | Demo@123 |
| Marketplace Buyer | buyer@demo.aquaerp.local | Demo@123 |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `ECONNREFUSED :3306` | Start MySQL or `npm run db:docker:up` |
| E2E login fails | `npm run db:seed:demo` |
| `load-env.mjs` missing | Pull latest; file is `scripts/lib/load-env.mjs` |
| Chromium download slow | `npx playwright install chromium` (retry on slow network) |
| Dev server timeout | `npm run dev` in a separate terminal |

See also [`docs/FORM_TESTING.md`](FORM_TESTING.md), [`SYSTEM_STATUS.md`](../SYSTEM_STATUS.md).
