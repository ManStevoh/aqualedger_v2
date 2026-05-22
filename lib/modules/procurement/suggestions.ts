import { query } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export interface ProcurementSuggestion {
  productSku: string
  productName: string
  suggestedQtyKg: number
  reason: string
  priority: 'high' | 'medium' | 'low'
  supplierName?: string
}

export async function getSmartProcurementSuggestions(
  tenantId: string,
): Promise<ProcurementSuggestion[]> {
  const lowStock = await query<{
    sku: string
    name: string
    batch_qty: number
    reorder_level: number
  }>(
    `SELECT pc.sku, pc.name,
            COALESCE(SUM(ib.quantity_kg), 0) as batch_qty,
            50 as reorder_level
     FROM product_catalog pc
     LEFT JOIN inventory_batches ib ON ib.sku = pc.sku AND ib.tenant_id = pc.tenant_id
       AND ib.status = 'available'
     WHERE pc.tenant_id = ? AND pc.status = 'active'
     GROUP BY pc.id, pc.sku, pc.name
     HAVING batch_qty < reorder_level
     ORDER BY batch_qty ASC
     LIMIT 10`,
    [tenantId],
  )

  const suggestions: ProcurementSuggestion[] = lowStock.map((row) => ({
    productSku: row.sku,
    productName: row.name,
    suggestedQtyKg: Math.max(Number(row.reorder_level) - Number(row.batch_qty), 10),
    reason: 'Stock below reorder level',
    priority: Number(row.batch_qty) < Number(row.reorder_level) * 0.25 ? 'high' : 'medium',
  }))

  const topSupplier = await query<{ name: string }>(
    `SELECT name FROM suppliers WHERE ${tenantWhere()} AND status = 'active'
     ORDER BY rating DESC LIMIT 1`,
    [tenantId],
  )
  const supplierName = topSupplier[0]?.name

  return suggestions.map((s) => ({ ...s, supplierName }))
}
