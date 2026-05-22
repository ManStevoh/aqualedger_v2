# AquaERP

**Maritime commerce & fisheries ERP** — multi-tenant SaaS for fishing operations, cold chain, marketplace, and finance.

> Evolved from AquaLedger (fisheries operating system). See [docs/PLATFORM_VISION.md](docs/PLATFORM_VISION.md) for the full enterprise blueprint.

## What it is today

| Layer | Stack |
|-------|--------|
| Frontend | Next.js 16, React 19, Tailwind 4, shadcn/ui |
| API | REST `/api/v2/*` (MySQL-backed) |
| Database | MySQL `aqualedger32` |
| Auth | JWT + refresh tokens, RBAC |

**Not yet:** NestJS microservices, PostgreSQL, Flutter apps, full double-entry GL — see [docs/MIGRATION_ROADMAP.md](docs/MIGRATION_ROADMAP.md).

## Quick start

```bash
cp .env.example .env.local
# Set DB_NAME=aqualedger32, JWT_SECRET (32+ chars), DB_PASSWORD

mysql -u root -p aqualedger32 < database/schema.sql
mysql -u root -p aqualedger32 < database/migrations/20260516_audit_logs.sql
mysql -u root -p aqualedger32 < database/migrations/20260520_multi_tenant_foundation.sql

npm install
npm run dev
```

Open http://localhost:3000

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/PLATFORM_VISION.md](docs/PLATFORM_VISION.md) | Mission, modules, differentiation |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical phases, multi-tenant model |
| [docs/MIGRATION_ROADMAP.md](docs/MIGRATION_ROADMAP.md) | Week-by-week transformation plan |
| [docs/MODULE_MAP.md](docs/MODULE_MAP.md) | Current features → ERP modules |
| [docs/ROLES.md](docs/ROLES.md) | Role model evolution |
| [SYSTEM_STATUS.md](SYSTEM_STATUS.md) | API list & operational status |

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run typecheck    # TypeScript
npm test             # Vitest unit tests
```

## Environment

```env
DB_NAME=aqualedger32
JWT_SECRET=<min 32 characters>
NEXT_PUBLIC_APP_NAME=AquaERP
NEXT_PUBLIC_APP_TAGLINE=Maritime commerce & fisheries ERP
DEFAULT_TENANT_ID=tenant-default-0001
```

## License

Private — enterprise fisheries platform.
