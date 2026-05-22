import type { MetadataRoute } from 'next'
import { getAppBaseUrl, storePath } from '@/lib/config/urls'
import { query } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getAppBaseUrl()
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/login`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/register`, changeFrequency: 'monthly', priority: 0.6 },
  ]

  try {
    const stores = await query<{ slug: string; updated_at: string }>(
      `SELECT t.slug, s.updated_at
       FROM tenant_storefront_settings s
       JOIN tenants t ON s.tenant_id = t.id
       WHERE s.published = 1 AND t.status = 'active'`,
    )
    for (const store of stores) {
      staticRoutes.push({
        url: `${base}${storePath(store.slug)}`,
        lastModified: new Date(store.updated_at),
        changeFrequency: 'daily',
        priority: 0.9,
      })
      staticRoutes.push({
        url: `${base}${storePath(store.slug, '/traceability')}`,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  } catch {
    /* DB optional at build */
  }

  return staticRoutes
}
