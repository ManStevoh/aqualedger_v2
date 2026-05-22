import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import type { BankReconciliationCreateInput, BankReconciliationUpdateInput } from './schemas'

export interface BankReconciliationRow {
  id: string
  tenant_id: string
  statement_date: string
  opening_balance: number
  closing_balance: number
  status: string
  created_at: string
}

export async function listBankReconciliations(
  tenantId: string,
  opts: { status?: string; page?: number; limit?: number } = {},
): Promise<{ reconciliations: BankReconciliationRow[]; total: number }> {
  const page = opts.page ?? 1
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere()]
  const params: unknown[] = [tenantId]

  if (opts.status) {
    conditions.push('status = ?')
    params.push(opts.status)
  }

  const where = conditions.join(' AND ')
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM bank_reconciliation WHERE ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const reconciliations = await query<BankReconciliationRow>(
    `SELECT * FROM bank_reconciliation WHERE ${where}
     ORDER BY statement_date DESC, created_at DESC
     ${pagination.clause}`,
    params,
  )

  return { reconciliations, total }
}

export async function createBankReconciliation(
  tenantId: string,
  input: BankReconciliationCreateInput,
): Promise<BankReconciliationRow> {
  const id = generateId()
  await execute(
    `INSERT INTO bank_reconciliation (id, tenant_id, statement_date, opening_balance, closing_balance, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.statementDate,
      input.openingBalance,
      input.closingBalance,
      input.status,
    ],
  )

  const row = await queryOne<BankReconciliationRow>(
    `SELECT * FROM bank_reconciliation WHERE id = ? AND ${tenantWhere()}`,
    [id, tenantId],
  )
  if (!row) throw new Error('Failed to create bank reconciliation')
  return row
}

export async function updateBankReconciliation(
  tenantId: string,
  reconciliationId: string,
  input: BankReconciliationUpdateInput,
): Promise<BankReconciliationRow> {
  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM bank_reconciliation WHERE id = ? AND ${tenantWhere()}`,
    [reconciliationId, tenantId],
  )
  if (!existing) {
    throw new Error('Bank reconciliation not found')
  }

  const sets: string[] = []
  const params: unknown[] = []
  if (input.statementDate !== undefined) {
    sets.push('statement_date = ?')
    params.push(input.statementDate)
  }
  if (input.openingBalance !== undefined) {
    sets.push('opening_balance = ?')
    params.push(input.openingBalance)
  }
  if (input.closingBalance !== undefined) {
    sets.push('closing_balance = ?')
    params.push(input.closingBalance)
  }
  if (input.status !== undefined) {
    sets.push('status = ?')
    params.push(input.status)
  }

  if (sets.length > 0) {
    params.push(reconciliationId, tenantId)
    await execute(
      `UPDATE bank_reconciliation SET ${sets.join(', ')} WHERE id = ? AND ${tenantWhere()}`,
      params,
    )
  }

  const row = await queryOne<BankReconciliationRow>(
    `SELECT * FROM bank_reconciliation WHERE id = ? AND ${tenantWhere()}`,
    [reconciliationId, tenantId],
  )
  if (!row) throw new Error('Failed to update bank reconciliation')
  return row
}

export async function deleteBankReconciliation(
  tenantId: string,
  reconciliationId: string,
): Promise<void> {
  const result = await execute(
    `DELETE FROM bank_reconciliation WHERE id = ? AND ${tenantWhere()}`,
    [reconciliationId, tenantId],
  )
  if ((result as { affectedRows?: number }).affectedRows === 0) {
    throw new Error('Bank reconciliation not found')
  }
}
