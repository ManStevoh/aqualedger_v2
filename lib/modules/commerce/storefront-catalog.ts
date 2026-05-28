import { queryOne } from '@/lib/db'
import { notFound } from '@/lib/api-handler'
import { listProductCatalog } from './service'
import type { ProductCatalogRow } from './service'

export async function searchPublicProducts(
  tenantId: string,
  opts: { q?: string; category?: string; limit?: number },
) {
  const { products } = await listProductCatalog(tenantId, {
    status: 'active',
    limit: opts.limit ?? 48,
  })

  let filtered = products

  if (opts.category) {
    const cat = opts.category.toLowerCase()
    filtered = filtered.filter((p) => (p.category || '').toLowerCase() === cat)
  }

  if (opts.q) {
    const q = opts.q.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q),
    )
  }

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[]

  const mapped = filtered.map((p) => {
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
      category: p.category,
      imageUrl: p.image_url || undefined,
      grade,
      traceable,
    }
  })

  return { products: mapped, categories }
}

export async function getPublicProductById(tenantId: string, productId: string) {
  const row = await queryOne<ProductCatalogRow>(
    `SELECT * FROM product_catalog WHERE id = ? AND tenant_id = ? AND status = 'active'`,
    [productId, tenantId],
  )
  if (!row) throw notFound('Product not found')

  let grade: string | undefined
  let traceable = false
  let lotCode: string | undefined
  let description: string | undefined
  if (row.metadata) {
    try {
      const meta = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
      grade = meta.grade
      traceable = Boolean(meta.traceable || meta.lotCode)
      lotCode = meta.lotCode
      description = meta.description
    } catch {
      /* ignore */
    }
  }

  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    price: Number(row.base_price),
    unit: row.unit,
    category: row.category || undefined,
    description,
    imageUrl: row.image_url || undefined,
    grade,
    traceable,
    lotCode,
  }
}
