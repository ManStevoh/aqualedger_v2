import { queryOne } from '@/lib/db'
import { listProductCatalog } from './service'
import {
  getStorefrontSettingsBySlug,
  resolveThemeCssVars,
} from './storefront-settings'
import type { StorefrontProduct } from '@/components/storefront/storefront-shell'

export async function loadPublicStorefront(slug: string) {
  const settings = await getStorefrontSettingsBySlug(slug)
  if (!settings) return null

  const { theme, cssVars } = resolveThemeCssVars(settings.theme_id, settings.custom_tokens)
  const catalog = await listProductCatalog(settings.tenant_id, { status: 'active', limit: 24 })

  const products: StorefrontProduct[] = catalog.products.map((p) => {
    let grade: string | undefined
    let traceable = false
    if (p.metadata) {
      try {
        const meta = typeof p.metadata === 'string' ? JSON.parse(p.metadata) : p.metadata
        grade = meta.grade
        traceable = Boolean(meta.traceable || meta.lotCode)
      } catch {
        /* ignore */
      }
    }
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: Number(p.base_price),
      unit: p.unit,
      category: p.category || undefined,
      grade,
      traceable,
    }
  })

  const tenantSlug = settings.tenant_slug

  return {
    settings,
    theme,
    cssVars,
    products,
    storeBasePath: `/store/${tenantSlug}`,
  }
}

export async function getTenantSlugById(tenantId: string): Promise<string | null> {
  const row = await queryOne<{ slug: string }>(`SELECT slug FROM tenants WHERE id = ?`, [tenantId])
  return row?.slug ?? null
}
