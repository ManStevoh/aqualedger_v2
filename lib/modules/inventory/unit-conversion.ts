import { query, queryOne } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

const DEFAULT_FACTORS: Record<string, number> = {
  'kg:lb': 2.20462,
  'lb:kg': 0.453592,
  'kg:g': 1000,
  'g:kg': 0.001,
  'ton:kg': 1000,
  'kg:ton': 0.001,
}

export async function convertWeight(
  tenantId: string,
  quantity: number,
  fromUnit: string,
  toUnit: string,
): Promise<{ quantity: number; factor: number }> {
  const from = fromUnit.toLowerCase()
  const to = toUnit.toLowerCase()
  if (from === to) return { quantity, factor: 1 }

  const row = await queryOne<{ factor: number }>(
    `SELECT factor FROM unit_conversions
     WHERE ${tenantWhere()} AND from_unit = ? AND to_unit = ?`,
    [tenantId, from, to],
  )
  const factor = row ? Number(row.factor) : DEFAULT_FACTORS[`${from}:${to}`]
  if (!factor) throw new Error(`No conversion from ${from} to ${to}`)
  return { quantity: Math.round(quantity * factor * 1000) / 1000, factor }
}

export async function listUnitConversions(tenantId: string) {
  return query(
    `SELECT * FROM unit_conversions WHERE ${tenantWhere()} ORDER BY from_unit, to_unit`,
    [tenantId],
  )
}
