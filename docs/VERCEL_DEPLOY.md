# Deploy on Vercel

## 1. Import project

Connect the Git repo in Vercel. Framework preset: **Next.js**.

## 2. Environment variables

Set in **Project → Settings → Environment Variables** (Production + Preview):

| Variable | Required | Notes |
|----------|----------|--------|
| `JWT_SECRET` | Yes | Min 32 characters |
| `NEXT_PUBLIC_APP_URL` | Yes | `https://your-app.vercel.app` or custom domain |
| `DB_HOST` | Yes | Use hosted MySQL (PlanetScale, Railway, Aiven, etc.) |
| `DB_USER` | Yes | |
| `DB_PASSWORD` | Yes | |
| `DB_NAME` | Yes | `aquaerp_operating` |
| `CRON_SECRET` | Yes | Same value enables Vercel Cron auth (`Authorization: Bearer`) |
| `PLATFORM_HOST` | Prod | Apex domain for subdomain tenants, e.g. `aquaerp.co.ke` |

Optional: `MPESA_*`, `STRIPE_SECRET_KEY`, `SMTP_*`, `OPENAI_API_KEY` — see [`.env.example`](../.env.example).

Generate cron secret locally:

```bash
npm run setup:cron
```

## 3. Database

Vercel does not host MySQL. Run migrations against your cloud DB:

```bash
# From CI or local with DB_* pointing at production
node scripts/run-migrations.mjs
npm run db:verify
```

## 4. Build

Build command: `npm run build` (default)  
Install command: `npm install`

Optional CI gate: `npm run predeploy` (includes tests + build).

## 5. Cron (GDPR exports)

[`vercel.json`](../vercel.json) schedules export processing every 30 minutes:

```
GET /api/v2/platform/exports/process
```

Vercel sends `Authorization: Bearer <CRON_SECRET>` when `CRON_SECRET` is set in the project.

Manual trigger:

```bash
npm run exports:process
```

## 6. Custom domain & tenants

1. Add domain in Vercel → assign to Production.
2. Set `NEXT_PUBLIC_APP_URL` and `PLATFORM_HOST` to your apex domain.
3. Tenant custom domains: CNAME to Vercel, then verify in **Organization → Domains**.

## 7. M-Pesa callbacks

Daraja must reach a public URL:

```
https://your-domain.com/api/payments/mpesa/callback
```

Local wiring:

```bash
npm run mpesa:wire
# Add Daraja keys, then npm run mpesa:check
```

For local dev use ngrok and set `MPESA_CALLBACK_URL` to the ngrok URL.

## 8. Post-deploy

```bash
npm run smoke -- --base=https://your-domain.com
npm run env:check -- --strict
```

Pilot checklist: [`PILOT_GO_LIVE.md`](PILOT_GO_LIVE.md)

## Limitations

- `storage/exports/` on Vercel is ephemeral — use S3 or DB blobs for long-term GDPR archives at scale.
- Edge middleware cannot use MySQL; custom domains use `api/internal/resolve-host` (Node).
