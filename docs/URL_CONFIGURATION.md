# URL configuration (no hardcoded hosts)

All application and third-party API URLs are resolved through:

- [`lib/config/urls.ts`](../lib/config/urls.ts) — app origin, API paths, storefront links
- [`lib/config/external-apis.ts`](../lib/config/external-apis.ts) — Stripe, M-Pesa, OpenAI, Google OAuth, SMS, FCM, etc.
- [`lib/client-api.ts`](../lib/client-api.ts) — browser `fetch` helpers

## Required in production

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | Public site URL (emails, OAuth redirect, sitemap, share links) |

If unset, the server derives the origin from `x-forwarded-host` / request origin, then `VERCEL_URL`, then `HOST` + `PORT`.

## Optional split API host

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Prefix for client `fetch` when API runs on another domain |
| `API_ROOT` | Change `/api` mount (default `/api`) |

## Third-party overrides

Every external integration URL can be overridden — see [`.env.example`](../.env.example). Defaults live only in `lib/config/external-apis.ts`.

## Usage in code

```ts
import { appUrl, apiPath, absolutePublicApiUrl, storeUrl } from '@/lib/config/urls'
import { getStripePaymentIntentsUrl } from '@/lib/config/external-apis'
import { apiFetch, publicApiFetch } from '@/lib/client-api'

// Server: absolute callback
const callback = absolutePublicApiUrl('/payments/mpesa/callback')

// Client
const res = await apiFetch('/v2/orders')
const cart = await publicApiFetch(`/store/${slug}/cart`, { method: 'POST', body: '...' })
```

Do **not** embed `http://localhost:3000` or vendor API hosts in module code — use the helpers above.
