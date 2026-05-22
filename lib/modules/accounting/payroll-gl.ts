import { execute, query, queryOne } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { conflict, notFound } from '@/lib/api-handler'
import { createJournalEntry } from './service'
import { getGlAccountByCode } from './gl-accounts'

export async function postPayrollRunToGl(
  tenantId: string,
  runId: string,
  userId: string,
) {
  const run = await queryOne<{
    id: string
    status: string
    total_gross: number
    total_net: number
    gl_journal_id: string | null
    period_end: string
  }>(`SELECT * FROM hr_payroll_runs WHERE id = ? AND ${tenantWhere()}`, [runId, tenantId])
  if (!run) throw notFound('Payroll run not found')
  if (run.status !== 'approved' && run.status !== 'paid') {
    throw conflict('Approve payroll before posting to GL')
  }
  if (run.gl_journal_id) throw conflict('Payroll already posted to GL')

  const lines = await query<{ tax_deduction: number; other_deductions: number }>(
    `SELECT tax_deduction, other_deductions FROM hr_payroll_lines WHERE payroll_run_id = ?`,
    [runId],
  )
  const totalTax = lines.reduce((s, l) => s + Number(l.tax_deduction) + Number(l.other_deductions), 0)
  const gross = Number(run.total_gross)
  const net = Number(run.total_net)

  const expense = await getGlAccountByCode(tenantId, '5100')
  const payable = await getGlAccountByCode(tenantId, '2100')
  const taxPayable = await getGlAccountByCode(tenantId, '2110')
  if (!expense || !payable) throw conflict('GL accounts not configured')

  const entry = await createJournalEntry(tenantId, userId, {
    entryDate: String(run.period_end).slice(0, 10),
    description: `Payroll run ${runId.slice(0, 8)}`,
    referenceType: 'payroll',
    referenceId: runId,
    lines: [
      { accountId: expense.id, debit: gross, credit: 0, memo: 'Gross payroll' },
      { accountId: payable.id, debit: 0, credit: net, memo: 'Net salaries payable' },
      ...(totalTax > 0 && taxPayable
        ? [{ accountId: taxPayable.id, debit: 0, credit: totalTax, memo: 'Statutory deductions' }]
        : []),
    ],
  })

  await execute(`UPDATE hr_payroll_runs SET gl_journal_id = ? WHERE id = ?`, [
    entry.id,
    runId,
  ])

  return { journalEntryId: entry.id, entryNumber: entry.entry_number }
}
