# Pilot tenant go-live (7-day checklist)

Use this after [`DEPLOYMENT.md`](DEPLOYMENT.md) infrastructure is up.

## Day 0 — Platform

| Step | Action |
|------|--------|
| 1 | `npm run predeploy` and `npm run smoke` on production URL |
| 2 | `npm run env:check -- --strict` |
| 3 | Super admin login → **Admin → Settings** — disable maintenance, confirm announcement |
| 4 | **Admin → Modules** — enable only modules the pilot needs (fishing, commerce, cold chain, …) |

## Day 1 — Tenant provision

| Step | Action |
|------|--------|
| 1 | **Admin → Tenants → Provision** — name, slug, plan |
| 2 | Invite owner: **Admin → Users → Invite** or tenant self-register (if signup lock off) |
| 3 | Owner completes `/dashboard/onboarding` (profile → operations → go-live) |
| 4 | **Organization → Domains** (optional) — custom domain + DNS TXT verify |

## Day 2 — Commerce & payments

| Step | Action |
|------|--------|
| 1 | **Commerce → Storefront** — theme, products, publish |
| 2 | Open `/store/{slug}` and guest-add-to-cart test |
| 3 | `npm run mpesa:check` — sandbox STK from onboarding go-live step |
| 4 | Confirm callback URL reachable: `{APP_URL}/api/payments/mpesa/callback` |

## Day 3 — Operations

| Step | Action |
|------|--------|
| 1 | Log a **catch**, **trip**, **boat** (tenant-scoped) |
| 2 | Cold chain facility + one temperature reading |
| 3 | Run `npm run db:verify` on production DB (SSH/cron) |

## Day 4 — Security

| Step | Action |
|------|--------|
| 1 | Owner enrolls **Settings → Security → MFA** |
| 2 | Platform **Admin → Security** — reCAPTCHA for login/register/checkout |
| 3 | Review **Admin → Audit** after any impersonation support session |

## Day 5 — Reporting & exports

| Step | Action |
|------|--------|
| 1 | Schedule one report from **Analytics → Scheduled** |
| 2 | Queue GDPR export: **Admin → Settings → Scheduled data exports** |
| 3 | Cron: `npm run exports:process` every 30 minutes |

## Day 6–7 — Handover

| Step | Action |
|------|--------|
| 1 | **Admin → Analytics** — confirm GMV and signups |
| 2 | **Admin → Payments → Reconcile** stale M-Pesa intents |
| 3 | Document tenant slug, subdomain URL, and support contact for the pilot |

## Rollback

- **Suspend tenant** — Admin → Tenants (keeps data)
- **Maintenance mode** — Admin → Settings (blocks non–super-admin API)
- **Signup lock** — blocks new orgs during incidents

## Support commands

```bash
npm run smoke -- --base=https://your-domain.com
npm run env:check -- --strict
npm run exports:process
```
