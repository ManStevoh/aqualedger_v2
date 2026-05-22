# AquaERP

**Maritime commerce & fisheries ERP** — multi-tenant SaaS for fishing operations, cold chain, marketplace, and finance.

> See [docs/PLATFORM_VISION.md](docs/PLATFORM_VISION.md) for the enterprise blueprint and [docs/MIGRATION_ROADMAP.md](docs/MIGRATION_ROADMAP.md) for Phase 5 (microservices, Flutter, etc.).

## What it is today

| Layer | Stack |
|-------|--------|
| Frontend | Next.js 16, React 19, Tailwind 4 |
| API | REST `/api/v2/*` (MySQL-backed) |
| Database | MySQL `aquaerp_operating` |
| Auth | JWT, MFA (TOTP), Google OAuth, super-admin platform control |

**MVP scope:** Full monolith ERP (120+ API routes, 60+ dashboard pages). Not a separate NestJS/Kafka deployment yet.

## Quick start

```bash
cp .env.example .env
# Edit DB_* and JWT_SECRET (32+ chars)

node scripts/setup-fresh-database.mjs
# Or existing DB: node scripts/run-migrations.mjs

npm install
npm run setup:cron
npm run dev
```

Open http://localhost:3000 — sign in and use `/dashboard`.

## Verify & deploy

```bash
npm run db:verify
npm run typecheck
npm test
npm run smoke
npm run env:check
npm run predeploy          # full production gate
```

| Doc | Purpose |
|-----|---------|
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production env, build, cron, routing |
| [docs/PILOT_GO_LIVE.md](docs/PILOT_GO_LIVE.md) | 7-day pilot tenant checklist |
| [SYSTEM_STATUS.md](SYSTEM_STATUS.md) | Feature status & platform admin |
| [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md) | Migrations & schema |
| [docs/MPESA_SANDBOX.md](docs/MPESA_SANDBOX.md) | Daraja STK setup |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run predeploy` | typecheck + test + db:verify + build |
| `npm run smoke` | Health & cron probes |
| `npm run env:check` | JWT, DB, URL, integrations readiness |
| `npm run setup:cron` | Generate `CRON_SECRET` in `.env` |
| `npm run exports:process` | Process GDPR export queue |
| `npm run mpesa:check` | M-Pesa Daraja credential test |

## Environment (minimum)

```env
DB_NAME=aquaerp_operating
JWT_SECRET=<min 32 characters>
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=<from npm run setup:cron>
```

Subdomain tenants: `PLATFORM_HOST=localhost` (dev) or your apex domain (prod).
