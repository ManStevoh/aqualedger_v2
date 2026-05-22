# Branding — tenant & platform

How logo and primary color flow through AquaERP. Global layout and accessibility standards remain in [`RESPONSIVE_UI_STANDARDS.md`](RESPONSIVE_UI_STANDARDS.md) and [`UI_DESIGN_SYSTEM.md`](UI_DESIGN_SYSTEM.md).

## Surfaces

| Surface | Who configures | Where | Applies to |
|---------|----------------|-------|------------|
| **ERP dashboard** | Tenant owner | `/dashboard/organization` → Tax & branding | Sidebar, primary buttons, rings, gradients |
| **Platform auth** | Super admin | `/dashboard/admin/settings` → Platform branding | Login, register, marketing `/` nav |
| **Public storefront** | Tenant owner | `/dashboard/commerce/storefront` | `/store/{slug}` (14 WCAG themes) |
| **Email / reports** | Tenant | `/dashboard/communications` | Report HTML logo |

## Tenant ERP branding

1. Set **Logo URL** and **Primary color** on the Organization page.
2. Use the **live preview** before saving.
3. On save, the sidebar refreshes via `TenantBrandProvider.refresh()`.

Data is stored on `tenants.logo_url`, `tenants.primary_color`, and `settings.branding` JSON.

If a tenant leaves branding empty, the shell falls back to **platform branding** (see below).

## Platform branding

Super admin: **Admin → Platform settings → Platform branding**

- Product name (optional override of `NEXT_PUBLIC_APP_NAME`)
- Logo URL
- Primary color

Public API (no auth): `GET /api/public/platform/status` includes `brandingLogoUrl`, `brandingPrimaryColor`, `brandingAppName`.

### Environment fallbacks

```env
NEXT_PUBLIC_APP_NAME=AquaERP
NEXT_PUBLIC_APP_TAGLINE=Maritime commerce & fisheries ERP for Africa
NEXT_PUBLIC_PLATFORM_LOGO_URL=https://cdn.example.com/logo.svg
NEXT_PUBLIC_PLATFORM_PRIMARY_COLOR=#0ea5e9
```

## Technical notes

- CSS variables: `lib/branding/theme-vars.ts` — primary, ring, sidebar-primary with contrast-safe foreground.
- Injection: `ApplyBrandVariables` on `:root` / `.dark`.
- Components: `TenantBrandProvider` (dashboard), `PlatformBrandProvider` (auth/marketing).

## Database

Migration `20260613_platform_branding.sql` adds `branding` to `platform_settings`.

```bash
node scripts/run-migrations.mjs
```

## Not customized per tenant

- Typography scale (Plus Jakarta Sans)
- Breakpoints, touch targets, safe areas
- Module enablement (`platform_module_flags` + per-tenant `tenant_module_flags` + legacy feature shortcuts)
- Storefront theme presets (separate from ERP shell)
