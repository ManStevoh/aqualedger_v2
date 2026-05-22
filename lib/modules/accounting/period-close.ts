import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { conflict, notFound } from '@/lib/api-handler'

export async function ensureDefaultFiscalPeriod(tenantId: string) {
  const open = await queryOne<{ id: string }>(
    `SELECT id FROM fiscal_periods WHERE ${tenantWhere()} AND status = 'open' LIMIT 1`,
    [tenantId],
  )
  if (open) return open

  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const start = `${y}-${String(m + 1).padStart(2, '0')}-01`
  const lastDay = new Date(y, m + 1, 0).getDate()
  const end = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  const name = `${now.toLocaleString('en', { month: 'long' })} ${y}`

  return createFiscalPeriod(tenantId, { name, periodStart: start, periodEnd: end })
}

export async function listFiscalPeriods(tenantId: string) {
  return query(
    `SELECT * FROM fiscal_periods WHERE ${tenantWhere()} ORDER BY period_start DESC`,
    [tenantId],
  )
}

export async function createFiscalPeriod(
  tenantId: string,
  input: { name: string; periodStart: string; periodEnd: string },
) {
  const id = generateId()
  await execute(
    `INSERT INTO fiscal_periods (id, tenant_id, name, period_start, period_end, status)
     VALUES (?, ?, ?, ?, ?, 'open')`,
    [id, tenantId, input.name, input.periodStart, input.periodEnd],
  )
  return queryOne(`SELECT * FROM fiscal_periods WHERE id = ?`, [id])
}

export async function closeFiscalPeriod(
  tenantId: string,
  periodId: string,
  userId: string,
) {
  const period = await queryOne<{ id: string; status: string }>(
    `SELECT id, status FROM fiscal_periods WHERE id = ? AND ${tenantWhere()}`,
    [periodId, tenantId],
  )
  if (!period) throw notFound('Period not found')
  if (period.status === 'closed') throw conflict('Period already closed')

  const draftPayroll = await queryOne<{ c: number }>(
    `SELECT COUNT(*) as c FROM hr_payroll_runs WHERE ${tenantWhere()} AND status = 'draft'`,
    [tenantId],
  )
  if (Number(draftPayroll?.c) > 0) {
    throw conflict('Close draft payroll runs before period close')
  }

  await execute(
    `UPDATE fiscal_periods SET status = 'closed', closed_at = NOW(), closed_by = ? WHERE id = ?`,
    [userId, periodId],
  )
  return queryOne(`SELECT * FROM fiscal_periods WHERE id = ?`, [periodId])
}

export async function assertPeriodOpen(tenantId: string, entryDate: string) {
  const closed = await queryOne<{ id: string }>(
    `SELECT id FROM fiscal_periods
     WHERE ${tenantWhere()} AND status = 'closed'
       AND ? BETWEEN period_start AND period_end LIMIT 1`,
    [tenantId, entryDate],
  )
  if (closed) {
    throw conflict('Fiscal period is closed for this date')
  }
}
