# Database setup (clean install)

## Recommended: fresh database

```bash
node scripts/setup-fresh-database.mjs
```

This will:

1. Create `DB_NAME` from `.env` (default `aquaerp_operating`)
2. Apply `database/schema.sql` (InnoDB boats + `tenant_id` + per-tenant registration unique)
3. Run all migrations through `20260610_boats_tenant_fixup.sql`

## Existing database (repair)

If migrations failed on **boats** (engine / index errors before `20260524`):

```bash
# 1. Ensure base tables exist
mysql -u root -p -e "USE aquaerp_operating; SHOW TABLES LIKE 'boats';"

# 2. If boats is missing or MyISAM, re-apply schema then migrations:
node scripts/setup-fresh-database.mjs --name=aquaerp_operating

# OR incremental repair only:
node scripts/run-migrations.mjs
node scripts/verify-database.mjs
```

### Root cause (fixed)

- `schema.sql` had a **global** `UNIQUE` on `registration_number` and index `idx_registration_number`
- `20260524` tried to `DROP INDEX registration_number` only — often the wrong name
- **`20260610_boats_tenant_fixup.sql`** converts boats to InnoDB, adds `tenant_id`, drops both legacy indexes, adds `uk_tenant_registration`

## Verify

```bash
node scripts/verify-database.mjs
```

Expect: `boats` engine `InnoDB`, column `tenant_id` NOT NULL, index `uk_tenant_registration`.

## Tenant isolation in code

- `getAuthContext()` resolves tenant from **subdomain** (`x-tenant-slug` header) or **primary membership**
- All `/api/v2/*` routes use `requirePermission` / `withApiPermission` with `ctx.tenantId`
- Super admin can access any tenant via subdomain if they are a member (or use platform admin APIs)

## Subdomain routing (Phase 2)

Set in `.env`:

```env
PLATFORM_HOST=localhost
```

- `http://acme.localhost:3000/` → redirects to `/store/acme`
- `http://acme.localhost:3000/dashboard` → session scoped to tenant `acme` (if user is a member)

Production: `PLATFORM_HOST=aquaerp.co.ke` → `https://coop.aquaerp.co.ke/dashboard`
