import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export async function listTaxReturns(tenantId: string) {
  return query(
    `SELECT * FROM tax_returns WHERE ${tenantWhere()} ORDER BY created_at DESC`,
    [tenantId],
  )
}

export async function createTaxReturn(
  tenantId: string,
  input: {
    returnType: string
    periodLabel: string
    taxableAmount?: number
    taxAmount?: number
  },
) {
  const id = generateId()
  await execute(
    `INSERT INTO tax_returns (id, tenant_id, return_type, period_label, taxable_amount, tax_amount, status)
     VALUES (?, ?, ?, ?, ?, ?, 'draft')`,
    [
      id,
      tenantId,
      input.returnType,
      input.periodLabel,
      input.taxableAmount ?? 0,
      input.taxAmount ?? 0,
    ],
  )
  return queryOne(`SELECT * FROM tax_returns WHERE id = ?`, [id])
}

export async function fileTaxReturn(tenantId: string, returnId: string) {
  await execute(
    `UPDATE tax_returns SET status = 'filed', filed_at = NOW() WHERE id = ? AND ${tenantWhere()}`,
    [returnId, tenantId],
  )
  return queryOne(`SELECT * FROM tax_returns WHERE id = ?`, [returnId])
}
