import { query, queryOne, execute, generateId, transaction } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { conflict, notFound } from '@/lib/api-handler'
import type { PayrollRun, PayrollStatus } from './service'

const PAYE_RATE = 0.1
const NHIF_RATE = 0.015

export interface PayrollLine {
  id: string
  employee_id: string
  employee_name?: string
  gross_pay: number
  tax_deduction: number
  other_deductions: number
  net_pay: number
}

function calcLine(salary: number) {
  const gross = Number(salary) || 0
  const tax = Math.round(gross * PAYE_RATE * 100) / 100
  const nhif = Math.round(gross * NHIF_RATE * 100) / 100
  const net = Math.round((gross - tax - nhif) * 100) / 100
  return { gross, tax, other: nhif, net }
}

export async function createPayrollRun(
  tenantId: string,
  periodStart: string,
  periodEnd: string,
): Promise<PayrollRun & { lines: PayrollLine[] }> {
  const { ensureDefaultFiscalPeriod } = await import('@/lib/modules/accounting/period-close')
  await ensureDefaultFiscalPeriod(tenantId)

  const employees = await query<{ id: string; full_name: string; salary: number | null; status: string }>(
    `SELECT id, full_name, salary, status FROM hr_employees WHERE ${tenantWhere()} AND status = 'active'`,
    [tenantId],
  )
  if (employees.length === 0) throw conflict('No active employees for payroll')

  const runId = generateId()
  let totalGross = 0
  let totalNet = 0
  const lines: PayrollLine[] = []

  await transaction(async (conn) => {
    for (const emp of employees) {
      const { gross, tax, other, net } = calcLine(Number(emp.salary ?? 0))
      const lineId = generateId()
      await conn.execute(
        `INSERT INTO hr_payroll_lines (id, tenant_id, payroll_run_id, employee_id, gross_pay, tax_deduction, other_deductions, net_pay)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [lineId, tenantId, runId, emp.id, gross, tax, other, net],
      )
      totalGross += gross
      totalNet += net
      lines.push({
        id: lineId,
        employee_id: emp.id,
        employee_name: emp.full_name,
        gross_pay: gross,
        tax_deduction: tax,
        other_deductions: other,
        net_pay: net,
      })
    }

    await conn.execute(
      `INSERT INTO hr_payroll_runs (id, tenant_id, period_start, period_end, status, total_gross, total_net)
       VALUES (?, ?, ?, ?, 'draft', ?, ?)`,
      [runId, tenantId, periodStart, periodEnd, totalGross, totalNet],
    )
  })

  const run = await getPayrollRun(tenantId, runId)
  if (!run) throw new Error('Failed to create payroll run')
  return { ...run, lines }
}

export async function getPayrollRun(tenantId: string, runId: string) {
  const run = await queryOne<PayrollRun & { gl_journal_id?: string | null }>(
    `SELECT * FROM hr_payroll_runs WHERE id = ? AND ${tenantWhere()}`,
    [runId, tenantId],
  )
  if (!run) return null

  const lines = await query<PayrollLine>(
    `SELECT pl.*, e.full_name as employee_name
     FROM hr_payroll_lines pl
     JOIN hr_employees e ON pl.employee_id = e.id
     WHERE pl.payroll_run_id = ? AND pl.tenant_id = ?`,
    [runId, tenantId],
  )

  return { ...run, lines }
}

export async function updatePayrollRunStatus(
  tenantId: string,
  runId: string,
  status: PayrollStatus,
) {
  const run = await queryOne<{ id: string; status: string }>(
    `SELECT id, status FROM hr_payroll_runs WHERE id = ? AND ${tenantWhere()}`,
    [runId, tenantId],
  )
  if (!run) throw notFound('Payroll run not found')

  if (status === 'approved' && run.status !== 'draft') {
    throw conflict('Only draft runs can be approved')
  }
  if (status === 'paid' && run.status !== 'approved') {
    throw conflict('Approve payroll before marking paid')
  }

  await execute(
    `UPDATE hr_payroll_runs SET status = ?,
      approved_at = IF(? = 'approved', NOW(), approved_at),
      paid_at = IF(? = 'paid', NOW(), paid_at)
     WHERE id = ?`,
    [status, status, status, runId],
  )

  return getPayrollRun(tenantId, runId)
}
