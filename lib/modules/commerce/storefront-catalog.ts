import { listProductCatalog } from './service'

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

  const mapped = filtered.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    price: Number(p.base_price),
    unit: p.unit,
    category: p.category,
  }))

  return { products: mapped, categories }
}
