import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import type { BudgetCreateInput, BudgetUpdateInput } from './schemas'

export interface BudgetRow {
  id: string
  tenant_id: string
  fiscal_year: number
  account_id: string
  amount: number
  period: string
  account_code?: string
  account_name?: string
}

export interface BudgetVsActualRow {
  accountId: string
  accountCode: string
  accountName: string
  accountType: string
  budgetAmount: number
  actualAmount: number
  variance: number
  variancePct: number | null
}

export async function listBudgets(
  tenantId: string,
  opts: { fiscalYear?: number; page?: number; limit?: number } = {},
): Promise<{ budgets: BudgetRow[]; total: number }> {
  const page = opts.page ?? 1
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('b')]
  const params: unknown[] = [tenantId]

  if (opts.fiscalYear) {
    conditions.push('b.fiscal_year = ?')
    params.push(opts.fiscalYear)
  }

  const where = conditions.join(' AND ')
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM budgets b WHERE ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const budgets = await query<BudgetRow>(
    `SELECT b.*, ga.code as account_code, ga.name as account_name
     FROM budgets b
     JOIN gl_accounts ga ON b.account_id = ga.id
     WHERE ${where}
     ORDER BY b.fiscal_year DESC, ga.code ASC
     ${pagination.clause}`,
    params,
  )

  return { budgets, total }
}

export async function createBudget(
  tenantId: string,
  input: BudgetCreateInput,
): Promise<BudgetRow> {
  const account = await queryOne<{ id: string }>(
    `SELECT id FROM gl_accounts WHERE id = ? AND ${tenantWhere()}`,
    [input.accountId, tenantId],
  )
  if (!account) {
    throw new Error('GL account not found for this tenant')
  }

  const id = generateId()
  await execute(
    `INSERT INTO budgets (id, tenant_id, fiscal_year, account_id, amount, period)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, tenantId, input.fiscalYear, input.accountId, input.amount, input.period],
  )

  const row = await queryOne<BudgetRow>(
    `SELECT b.*, ga.code as account_code, ga.name as account_name
     FROM budgets b
     JOIN gl_accounts ga ON b.account_id = ga.id
     WHERE b.id = ? AND ${tenantWhere('b')}`,
    [id, tenantId],
  )
  if (!row) throw new Error('Failed to create budget')
  return row
}

export async function updateBudget(
  tenantId: string,
  budgetId: string,
  input: BudgetUpdateInput,
): Promise<BudgetRow> {
  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM budgets WHERE id = ? AND ${tenantWhere()}`,
    [budgetId, tenantId],
  )
  if (!existing) {
    throw new Error('Budget not found')
  }

  if (input.accountId) {
    const account = await queryOne<{ id: string }>(
      `SELECT id FROM gl_accounts WHERE id = ? AND ${tenantWhere()}`,
      [input.accountId, tenantId],
    )
    if (!account) throw new Error('GL account not found for this tenant')
  }

  const sets: string[] = []
  const params: unknown[] = []
  if (input.fiscalYear !== undefined) {
    sets.push('fiscal_year = ?')
    params.push(input.fiscalYear)
  }
  if (input.accountId !== undefined) {
    sets.push('account_id = ?')
    params.push(input.accountId)
  }
  if (input.amount !== undefined) {
    sets.push('amount = ?')
    params.push(input.amount)
  }
  if (input.period !== undefined) {
    sets.push('period = ?')
    params.push(input.period)
  }

  if (sets.length > 0) {
    params.push(budgetId, tenantId)
    await execute(`UPDATE budgets SET ${sets.join(', ')} WHERE id = ? AND ${tenantWhere()}`, params)
  }

  const row = await queryOne<BudgetRow>(
    `SELECT b.*, ga.code as account_code, ga.name as account_name
     FROM budgets b
     JOIN gl_accounts ga ON b.account_id = ga.id
     WHERE b.id = ? AND ${tenantWhere('b')}`,
    [budgetId, tenantId],
  )
  if (!row) throw new Error('Failed to update budget')
  return row
}

export async function deleteBudget(tenantId: string, budgetId: string): Promise<void> {
  const result = await execute(
    `DELETE FROM budgets WHERE id = ? AND ${tenantWhere()}`,
    [budgetId, tenantId],
  )
  if ((result as { affectedRows?: number }).affectedRows === 0) {
    throw new Error('Budget not found')
  }
}

export async function getBudgetVsActual(
  tenantId: string,
  fiscalYear?: number,
): Promise<{ rows: BudgetVsActualRow[]; totalBudget: number; totalActual: number; totalVariance: number }> {
  const year = fiscalYear ?? new Date().getFullYear()
  const budgets = await query<{
    account_id: string
    code: string
    name: string
    type: string
    amount: number
  }>(
    `SELECT b.account_id, ga.code, ga.name, ga.type, b.amount
     FROM budgets b
     JOIN gl_accounts ga ON b.account_id = ga.id
     WHERE ${tenantWhere('b')} AND b.fiscal_year = ?`,
    [tenantId, year],
  )

  const actuals = await query<{
    account_id: string
    code: string
    name: string
    type: string
    total_debit: number
    total_credit: number
  }>(
    `SELECT ga.id as account_id, ga.code, ga.name, ga.type,
            COALESCE(SUM(jl.debit), 0) as total_debit,
            COALESCE(SUM(jl.credit), 0) as total_credit
     FROM gl_accounts ga
     LEFT JOIN journal_lines jl ON jl.account_id = ga.id
     LEFT JOIN journal_entries je ON jl.journal_entry_id = je.id
       AND je.status = 'posted'
       AND YEAR(je.entry_date) = ?
     WHERE ${tenantWhere('ga')}
     GROUP BY ga.id, ga.code, ga.name, ga.type`,
    [year, tenantId],
  )

  const actualByAccount = new Map<string, number>()
  for (const row of actuals) {
    const d = Number(row.total_debit)
    const c = Number(row.total_credit)
    let amount = 0
    if (row.type === 'asset' || row.type === 'expense') amount = d - c
    else amount = c - d
    actualByAccount.set(row.account_id, amount)
  }

  const seen = new Set<string>()
  const rows: BudgetVsActualRow[] = []
  let totalBudget = 0
  let totalActual = 0

  for (const b of budgets) {
    seen.add(b.account_id)
    const actual = actualByAccount.get(b.account_id) ?? 0
    const budgetAmount = Number(b.amount)
    const variance = budgetAmount - actual
    const variancePct = budgetAmount !== 0 ? (variance / budgetAmount) * 100 : null
    rows.push({
      accountId: b.account_id,
      accountCode: b.code,
      accountName: b.name,
      accountType: b.type,
      budgetAmount,
      actualAmount: actual,
      variance,
      variancePct,
    })
    totalBudget += budgetAmount
    totalActual += actual
  }

  return {
    rows: rows.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
    totalBudget,
    totalActual,
    totalVariance: totalBudget - totalActual,
  }
}
