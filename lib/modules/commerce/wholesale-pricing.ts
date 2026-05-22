import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export async function resolveUnitPrice(
  tenantId: string,
  productId: string,
  quantityKg: number,
  segment: string = 'retail',
): Promise<number> {
  const tier = await queryOne<{ unit_price: number }>(
    `SELECT unit_price FROM wholesale_price_tiers
     WHERE ${tenantWhere()} AND product_id = ? AND customer_segment = ?
       AND min_quantity_kg <= ? AND active = 1
     ORDER BY min_quantity_kg DESC LIMIT 1`,
    [tenantId, productId, segment, quantityKg],
  )
  if (tier) return Number(tier.unit_price)

  const product = await queryOne<{ base_price: number }>(
    `SELECT base_price FROM product_catalog WHERE id = ? AND ${tenantWhere()}`,
    [productId, tenantId],
  )
  return Number(product?.base_price ?? 0)
}

export async function listWholesaleTiers(tenantId: string, productId?: string) {
  const conditions = [tenantWhere()]
  const params: unknown[] = [tenantId]
  if (productId) {
    conditions.push('product_id = ?')
    params.push(productId)
  }
  return query(
    `SELECT w.*, pc.name as product_name, pc.sku
     FROM wholesale_price_tiers w
     JOIN product_catalog pc ON w.product_id = pc.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY w.customer_segment, w.min_quantity_kg`,
    params,
  )
}

export async function upsertWholesaleTier(
  tenantId: string,
  input: {
    productId: string
    customerSegment: string
    minQuantityKg: number
    unitPrice: number
  },
) {
  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM wholesale_price_tiers
     WHERE ${tenantWhere()} AND product_id = ? AND customer_segment = ? AND min_quantity_kg = ?`,
    [tenantId, input.productId, input.customerSegment, input.minQuantityKg],
  )

  if (existing) {
    await execute(`UPDATE wholesale_price_tiers SET unit_price = ?, active = 1 WHERE id = ?`, [
      input.unitPrice,
      existing.id,
    ])
    return existing.id
  }

  const id = generateId()
  await execute(
    `INSERT INTO wholesale_price_tiers (id, tenant_id, product_id, customer_segment, min_quantity_kg, unit_price)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, tenantId, input.productId, input.customerSegment, input.minQuantityKg, input.unitPrice],
  )
  return id
}
