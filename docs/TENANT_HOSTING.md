# Tenant hosting — subdomains & custom domains

## Default at registration (no custom domain)

When a user registers, the platform creates a **tenant** with a unique **slug** from the organization name (or a chosen subdomain).

They immediately get:

| URL type | Example (dev) | Example (prod) |
|----------|-----------------|----------------|
| **Subdomain storefront** | `http://coastfish.localhost:3000/` → `/store/coastfish` | `https://coastfish.aquaerp.co.ke/` |
| **Platform path storefront** | `http://localhost:3000/store/coastfish` | `https://aquaerp.co.ke/store/coastfish` |

Configure production:

```env
NEXT_PUBLIC_APP_URL=https://aquaerp.co.ke
PLATFORM_HOST=aquaerp.co.ke
```

DNS: wildcard `*.aquaerp.co.ke` → your app load balancer (Vercel, etc.).

## Registration flow

1. User enters organization name → live preview of available subdomain (`GET /api/public/tenant-slug/check`).
2. Optional: customize subdomain before signup.
3. `POST /api/auth/register` creates tenant + returns `hosting.subdomainUrl`, `platformStoreUrl`.
4. Onboarding step **Go live** shows subdomain links.
5. **Organization → Domains** for custom domain requests.

## Custom domains (optional, later)

Tenants request domains at **Dashboard → Organization → Custom domains**:

1. **POST** `/api/v2/tenant/domains` with `{ domain: "shop.client.com" }`
2. Add **TXT** `_aquaerp-verify.shop.client.com` = verify token
3. Point **CNAME** `shop.client.com` → `PLATFORM_HOST` (or app host)
4. **POST** `{ action: "verify-dns", domainId }`
5. Optional: **PATCH** `{ action: "set-primary", domainId }` for primary storefront host

Verified custom domains set `x-tenant-id` in middleware and redirect `/` to `/store/{slug}`.

## APIs

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /api/public/tenant-slug/check?slug=` or `?organization=` | Public | Availability + preview URLs |
| `GET /api/v2/tenant/hosting` | Tenant | Subdomain + domain summary |
| `GET /api/v2/tenant/domains` | Tenant | Custom domains + hosting |
| `POST /api/v2/tenant/domains` | Tenant | Request domain |
| `DELETE /api/v2/tenant/domains?domainId=` | Tenant | Remove domain |

## Middleware

- Subdomain `{slug}.PLATFORM_HOST` → `x-tenant-slug`
- Custom domain → `GET /api/internal/resolve-host` → `x-tenant-id`
- `/` redirects to `/store/{slug}`

See [`docs/DEPLOYMENT.md`](DEPLOYMENT.md) for go-live checklist.
