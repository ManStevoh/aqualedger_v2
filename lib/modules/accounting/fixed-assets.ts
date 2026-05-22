import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export async function listFixedAssets(tenantId: string) {
  return query(
    `SELECT *, (purchase_cost - accumulated_depreciation) as book_value
     FROM fixed_assets WHERE ${tenantWhere()} ORDER BY purchase_date DESC`,
    [tenantId],
  )
}

export async function createFixedAsset(
  tenantId: string,
  input: {
    assetCode: string
    name: string
    category: string
    purchaseDate: string
    purchaseCost: number
    salvageValue?: number
    usefulLifeMonths?: number
  },
) {
  const id = generateId()
  await execute(
    `INSERT INTO fixed_assets (id, tenant_id, asset_code, name, category, purchase_date, purchase_cost, salvage_value, useful_life_months)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.assetCode,
      input.name,
      input.category,
      input.purchaseDate,
      input.purchaseCost,
      input.salvageValue ?? 0,
      input.usefulLifeMonths ?? 60,
    ],
  )
  return queryOne(`SELECT * FROM fixed_assets WHERE id = ?`, [id])
}

export async function runMonthlyDepreciation(tenantId: string) {
  const assets = await query<{
    id: string
    purchase_cost: number
    salvage_value: number
    useful_life_months: number
    accumulated_depreciation: number
  }>(
    `SELECT id, purchase_cost, salvage_value, useful_life_months, accumulated_depreciation
     FROM fixed_assets WHERE ${tenantWhere()} AND status = 'active'`,
    [tenantId],
  )

  let updated = 0
  for (const a of assets) {
    const depreciable = Number(a.purchase_cost) - Number(a.salvage_value)
    const monthly = depreciable / Math.max(Number(a.useful_life_months), 1)
    const newAcc = Math.min(
      Number(a.accumulated_depreciation) + monthly,
      depreciable,
    )
    if (newAcc > Number(a.accumulated_depreciation)) {
      await execute(`UPDATE fixed_assets SET accumulated_depreciation = ? WHERE id = ?`, [
        Math.round(newAcc * 100) / 100,
        a.id,
      ])
      updated++
    }
  }
  return { assetsProcessed: assets.length, updated }
}
