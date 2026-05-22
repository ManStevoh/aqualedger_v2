import { query } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export interface InventoryPredictionRow {
  productId: string
  productName: string
  sku: string
  currentKg: number
  avgDailyOut: number
  daysOfStock: number
  reorderKg: number
  urgency: 'critical' | 'low' | 'ok'
}

export async function predictInventoryReorder(tenantId: string): Promise<InventoryPredictionRow[]> {
  const stock = await query<{
    product_id: string
    name: string
    sku: string
    qty: number
  }>(
    `SELECT pc.id as product_id, pc.name, pc.sku, COALESCE(SUM(ib.quantity_kg), 0) as qty
     FROM product_catalog pc
     LEFT JOIN inventory_batches ib ON ib.sku = pc.sku AND ib.tenant_id = pc.tenant_id AND ib.status = 'available'
     WHERE pc.tenant_id = ? AND pc.status = 'active'
     GROUP BY pc.id, pc.name, pc.sku`,
    [tenantId],
  )

  const movements = await query<{ sku: string; out_kg: number }>(
    `SELECT ib.sku, SUM(ABS(im.quantity_kg)) as out_kg
     FROM inventory_movements im
     JOIN inventory_batches ib ON im.batch_id = ib.id
     WHERE im.tenant_id = ? AND im.movement_type IN ('out', 'transfer', 'spoilage')
       AND im.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY ib.sku`,
    [tenantId],
  )
  const outMap = new Map(movements.map((m) => [m.sku, Number(m.out_kg) / 30]))

  return stock.map((s) => {
    const currentKg = Number(s.qty)
    const avgDailyOut = outMap.get(s.sku) ?? 0.5
    const daysOfStock = avgDailyOut > 0 ? Math.round(currentKg / avgDailyOut) : 999
    const reorderKg = Math.max(0, Math.round(avgDailyOut * 14 - currentKg))
    const urgency: InventoryPredictionRow['urgency'] =
      daysOfStock <= 3 ? 'critical' : daysOfStock <= 7 ? 'low' : 'ok'
    return {
      productId: s.product_id,
      productName: s.name,
      sku: s.sku,
      currentKg,
      avgDailyOut: Math.round(avgDailyOut * 100) / 100,
      daysOfStock,
      reorderKg,
      urgency,
    }
  })
}
