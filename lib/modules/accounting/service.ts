import type { Connection } from 'mysql2/promise'
import { query, queryOne, execute, generateId, buildPagination, transaction } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import type { CreateJournalEntryInput, TaxCodeCreateInput, ApInvoiceCreateInput, ArInvoiceCreateInput } from './schemas'

export interface GlAccount {
  id: string
  tenant_id: string
  code: string
  name: string
  type: string
  currency: string
  is_system: number
  created_at: string
}

export interface JournalLine {
  id: string
  journal_entry_id: string
  account_id: string
  debit: number
  credit: number
  memo: string | null
  account_code?: string
  account_name?: string
}

export interface JournalEntry {
  id: string
  tenant_id: string
  entry_number: string
  entry_date: string
  description: string
  reference_type: string | null
  reference_id: string | null
  status: string
  created_by: string | null
  created_at: string
  lines?: JournalLine[]
}

export interface LedgerSummary {
  accountCount: number
  entryCount: number
  totalDebits: number
  totalCredits: number
  revenue: number
  expenses: number
  netIncome: number
}

export async function listGlAccounts(tenantId: string): Promise<GlAccount[]> {
  return query<GlAccount>(
    `SELECT * FROM gl_accounts WHERE ${tenantWhere()} ORDER BY code ASC`,
    [tenantId],
  )
}

export async function listJournalEntries(
  tenantId: string,
  page = 1,
  limit = 50,
  opts: { status?: string; fromDate?: string; toDate?: string } = {},
): Promise<{ entries: JournalEntry[]; total: number }> {
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere()]
  const params: unknown[] = [tenantId]

  if (opts.status) {
    conditions.push('status = ?')
    params.push(opts.status)
  }
  if (opts.fromDate) {
    conditions.push('entry_date >= ?')
    params.push(opts.fromDate)
  }
  if (opts.toDate) {
    conditions.push('entry_date <= ?')
    params.push(opts.toDate)
  }

  const where = conditions.join(' AND ')
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM journal_entries WHERE ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const entries = await query<JournalEntry>(
    `SELECT * FROM journal_entries WHERE ${where}
     ORDER BY entry_date DESC, created_at DESC
     ${pagination.clause}`,
    params,
  )

  if (entries.length === 0) {
    return { entries: [], total }
  }

  const entryIds = entries.map((e) => e.id)
  const placeholders = entryIds.map(() => '?').join(', ')
  const lines = await query<JournalLine>(
    `SELECT jl.*, ga.code as account_code, ga.name as account_name
     FROM journal_lines jl
     JOIN gl_accounts ga ON jl.account_id = ga.id
     WHERE jl.journal_entry_id IN (${placeholders})
     ORDER BY jl.id ASC`,
    entryIds,
  )

  const linesByEntry = new Map<string, JournalLine[]>()
  for (const line of lines) {
    const list = linesByEntry.get(line.journal_entry_id) ?? []
    list.push(line)
    linesByEntry.set(line.journal_entry_id, list)
  }

  return {
    entries: entries.map((entry) => ({
      ...entry,
      lines: linesByEntry.get(entry.id) ?? [],
    })),
    total,
  }
}

export async function getLedgerSummary(tenantId: string): Promise<LedgerSummary> {
  const [accountsRow] = await query<{ count: number }>(
    `SELECT COUNT(*) as count FROM gl_accounts WHERE ${tenantWhere()}`,
    [tenantId],
  )
  const [entriesRow] = await query<{ count: number }>(
    `SELECT COUNT(*) as count FROM journal_entries WHERE ${tenantWhere()} AND status = 'posted'`,
    [tenantId],
  )

  const totals = await query<{ total_debit: number; total_credit: number }>(
    `SELECT COALESCE(SUM(jl.debit), 0) as total_debit, COALESCE(SUM(jl.credit), 0) as total_credit
     FROM journal_lines jl
     JOIN journal_entries je ON jl.journal_entry_id = je.id
     WHERE ${tenantWhere('je')} AND je.status = 'posted'`,
    [tenantId],
  )

  const byType = await query<{ type: string; debit: number; credit: number }>(
    `SELECT ga.type,
            COALESCE(SUM(jl.debit), 0) as debit,
            COALESCE(SUM(jl.credit), 0) as credit
     FROM journal_lines jl
     JOIN journal_entries je ON jl.journal_entry_id = je.id
     JOIN gl_accounts ga ON jl.account_id = ga.id
     WHERE ${tenantWhere('je')} AND je.status = 'posted'
     GROUP BY ga.type`,
    [tenantId],
  )

  let revenue = 0
  let expenses = 0
  for (const row of byType) {
    if (row.type === 'revenue') revenue += Number(row.credit) - Number(row.debit)
    if (row.type === 'expense') expenses += Number(row.debit) - Number(row.credit)
  }

  return {
    accountCount: accountsRow?.count ?? 0,
    entryCount: entriesRow?.count ?? 0,
    totalDebits: Number(totals[0]?.total_debit ?? 0),
    totalCredits: Number(totals[0]?.total_credit ?? 0),
    revenue,
    expenses,
    netIncome: revenue - expenses,
  }
}

function nextEntryNumber(): string {
  const d = new Date()
  const stamp = d.toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `JE-${stamp}-${suffix}`
}

export async function createJournalEntry(
  tenantId: string,
  userId: string,
  input: CreateJournalEntryInput,
): Promise<JournalEntry> {
  const accountIds = [...new Set(input.lines.map((l) => l.accountId))]
  const placeholders = accountIds.map(() => '?').join(', ')
  const accounts = await query<{ id: string }>(
    `SELECT id FROM gl_accounts WHERE ${tenantWhere()} AND id IN (${placeholders})`,
    [tenantId, ...accountIds],
  )
  if (accounts.length !== accountIds.length) {
    throw new Error('One or more accounts do not belong to this tenant')
  }

  const entryId = generateId()
  const entryNumber = nextEntryNumber()

  await transaction(async (conn: Connection) => {
    await conn.execute(
      `INSERT INTO journal_entries
       (id, tenant_id, entry_number, entry_date, description, reference_type, reference_id, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'posted', ?)`,
      [
        entryId,
        tenantId,
        entryNumber,
        input.entryDate,
        input.description,
        input.referenceType ?? null,
        input.referenceId ?? null,
        userId,
      ],
    )

    for (const line of input.lines) {
      await conn.execute(
        `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, memo)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          generateId(),
          entryId,
          line.accountId,
          line.debit,
          line.credit,
          line.memo ?? null,
        ],
      )
    }
  })

  const entry = await queryOne<JournalEntry>(
    `SELECT * FROM journal_entries WHERE id = ? AND ${tenantWhere()}`,
    [entryId, tenantId],
  )
  if (!entry) {
    throw new Error('Failed to create journal entry')
  }

  const lines = await query<JournalLine>(
    `SELECT jl.*, ga.code as account_code, ga.name as account_name
     FROM journal_lines jl
     JOIN gl_accounts ga ON jl.account_id = ga.id
     WHERE jl.journal_entry_id = ?
     ORDER BY jl.id ASC`,
    [entryId],
  )

  return { ...entry, lines }
}

export interface TaxCode {
  id: string
  tenant_id: string
  code: string
  name: string
  rate_pct: number
  type: string
  country_code: string
  active: number
  created_at?: string
}

export interface ApInvoice {
  id: string
  tenant_id: string
  supplier_id: string | null
  invoice_number: string
  invoice_date: string
  due_date: string | null
  currency: string
  subtotal: number
  tax_amount: number
  total_amount: number
  status: string
  gl_journal_id?: string | null
  created_at: string
}

export interface ArInvoice {
  id: string
  tenant_id: string
  customer_id: string | null
  order_id: string | null
  invoice_number: string
  invoice_date: string
  due_date: string | null
  currency: string
  subtotal: number
  tax_amount: number
  total_amount: number
  status: string
  gl_journal_id?: string | null
  order_number?: string | null
  customer_name?: string | null
  created_at: string
}

export interface TrialBalanceRow {
  accountId: string
  code: string
  name: string
  type: string
  totalDebit: number
  totalCredit: number
  balanceDebit: number
  balanceCredit: number
}

export interface TrialBalanceReport {
  rows: TrialBalanceRow[]
  totalDebits: number
  totalCredits: number
}

export interface AccountBalanceLine {
  accountId: string
  code: string
  name: string
  amount: number
}

export interface ProfitAndLossReport {
  revenue: AccountBalanceLine[]
  expenses: AccountBalanceLine[]
  totalRevenue: number
  totalExpenses: number
  netIncome: number
}

export interface BalanceSheetReport {
  assets: AccountBalanceLine[]
  liabilities: AccountBalanceLine[]
  equity: AccountBalanceLine[]
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  netIncome: number
  totalLiabilitiesAndEquity: number
}

interface AccountBalanceRow {
  account_id: string
  code: string
  name: string
  type: string
  total_debit: number
  total_credit: number
}

async function getAccountBalances(tenantId: string): Promise<AccountBalanceRow[]> {
  return query<AccountBalanceRow>(
    `SELECT ga.id as account_id, ga.code, ga.name, ga.type,
            COALESCE(SUM(jl.debit), 0) as total_debit,
            COALESCE(SUM(jl.credit), 0) as total_credit
     FROM gl_accounts ga
     LEFT JOIN journal_lines jl ON jl.account_id = ga.id
     LEFT JOIN journal_entries je ON jl.journal_entry_id = je.id AND je.status = 'posted'
     WHERE ${tenantWhere('ga')}
     GROUP BY ga.id, ga.code, ga.name, ga.type
     ORDER BY ga.code ASC`,
    [tenantId],
  )
}

function signedBalance(type: string, debit: number, credit: number): number {
  const d = Number(debit)
  const c = Number(credit)
  if (type === 'asset' || type === 'expense') return d - c
  return c - d
}

export async function listTaxCodes(tenantId: string): Promise<TaxCode[]> {
  return query<TaxCode>(
    `SELECT * FROM tax_codes WHERE ${tenantWhere()} ORDER BY code ASC`,
    [tenantId],
  )
}

export async function createTaxCode(
  tenantId: string,
  input: TaxCodeCreateInput,
): Promise<TaxCode> {
  const id = generateId()
  await execute(
    `INSERT INTO tax_codes (id, tenant_id, code, name, rate_pct, type, country_code, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.code,
      input.name,
      input.ratePct,
      input.type,
      input.countryCode,
      input.active ? 1 : 0,
    ],
  )
  const row = await queryOne<TaxCode>(
    `SELECT * FROM tax_codes WHERE id = ? AND ${tenantWhere()}`,
    [id, tenantId],
  )
  if (!row) throw new Error('Failed to create tax code')
  return row
}

export async function listApInvoices(
  tenantId: string,
  opts: { page?: number; limit?: number; status?: string } = {},
): Promise<{ invoices: ApInvoice[]; total: number }> {
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
    `SELECT COUNT(*) as total FROM ap_invoices WHERE ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const invoices = await query<ApInvoice>(
    `SELECT * FROM ap_invoices WHERE ${where}
     ORDER BY invoice_date DESC, created_at DESC
     ${pagination.clause}`,
    params,
  )

  return { invoices, total }
}

export async function createApInvoice(
  tenantId: string,
  input: ApInvoiceCreateInput & { purchaseOrderId?: string | null; grnId?: string | null },
): Promise<ApInvoice> {
  const id = generateId()
  await execute(
    `INSERT INTO ap_invoices
     (id, tenant_id, supplier_id, purchase_order_id, grn_id, invoice_number, invoice_date, due_date, currency,
      subtotal, tax_amount, total_amount, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.supplierId ?? null,
      input.purchaseOrderId ?? null,
      input.grnId ?? null,
      input.invoiceNumber,
      input.invoiceDate,
      input.dueDate ?? null,
      input.currency,
      input.subtotal,
      input.taxAmount,
      input.totalAmount,
      input.status,
    ],
  )
  const invoice = await queryOne<ApInvoice>(
    `SELECT * FROM ap_invoices WHERE id = ? AND ${tenantWhere()}`,
    [id, tenantId],
  )
  if (!invoice) throw new Error('Failed to create AP invoice')
  return invoice
}

export async function listArInvoices(
  tenantId: string,
  opts: { page?: number; limit?: number; status?: string; customerId?: string } = {},
): Promise<{ invoices: ArInvoice[]; total: number }> {
  const page = opts.page ?? 1
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('ar')]
  const params: unknown[] = [tenantId]

  if (opts.status) {
    conditions.push('ar.status = ?')
    params.push(opts.status)
  }

  if (opts.customerId) {
    conditions.push('ar.customer_id = ?')
    params.push(opts.customerId)
  }

  const where = conditions.join(' AND ')
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM ar_invoices ar WHERE ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const invoices = await query<ArInvoice>(
    `SELECT ar.*,
            o.order_number,
            c.name as customer_name
     FROM ar_invoices ar
     LEFT JOIN orders o ON ar.order_id = o.id
     LEFT JOIN crm_customers c ON ar.customer_id = c.id
     WHERE ${where}
     ORDER BY ar.invoice_date DESC, ar.created_at DESC
     ${pagination.clause}`,
    params,
  )

  return { invoices, total }
}

export async function createArInvoice(
  tenantId: string,
  input: ArInvoiceCreateInput,
): Promise<ArInvoice> {
  const id = generateId()
  await execute(
    `INSERT INTO ar_invoices
     (id, tenant_id, customer_id, order_id, invoice_number, invoice_date, due_date, currency,
      subtotal, tax_amount, total_amount, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.customerId ?? null,
      input.orderId ?? null,
      input.invoiceNumber,
      input.invoiceDate,
      input.dueDate ?? null,
      input.currency,
      input.subtotal,
      input.taxAmount,
      input.totalAmount,
      input.status,
    ],
  )
  const invoice = await queryOne<ArInvoice>(
    `SELECT * FROM ar_invoices WHERE id = ? AND ${tenantWhere()}`,
    [id, tenantId],
  )
  if (!invoice) throw new Error('Failed to create AR invoice')
  return invoice
}

export async function getTrialBalance(tenantId: string): Promise<TrialBalanceReport> {
  const balances = await getAccountBalances(tenantId)
  const rows: TrialBalanceRow[] = []
  let totalDebits = 0
  let totalCredits = 0

  for (const row of balances) {
    const debit = Number(row.total_debit)
    const credit = Number(row.total_credit)
    if (debit === 0 && credit === 0) continue

    const net = signedBalance(row.type, debit, credit)
    const balanceDebit = net > 0 ? net : 0
    const balanceCredit = net < 0 ? Math.abs(net) : 0

    rows.push({
      accountId: row.account_id,
      code: row.code,
      name: row.name,
      type: row.type,
      totalDebit: debit,
      totalCredit: credit,
      balanceDebit,
      balanceCredit,
    })
    totalDebits += balanceDebit
    totalCredits += balanceCredit
  }

  return { rows, totalDebits, totalCredits }
}

export async function getProfitAndLoss(tenantId: string): Promise<ProfitAndLossReport> {
  const balances = await getAccountBalances(tenantId)
  const revenue: AccountBalanceLine[] = []
  const expenses: AccountBalanceLine[] = []
  let totalRevenue = 0
  let totalExpenses = 0

  for (const row of balances) {
    const amount = signedBalance(row.type, row.total_debit, row.total_credit)
    if (amount === 0) continue

    const line: AccountBalanceLine = {
      accountId: row.account_id,
      code: row.code,
      name: row.name,
      amount,
    }

    if (row.type === 'revenue') {
      revenue.push(line)
      totalRevenue += amount
    } else if (row.type === 'expense') {
      expenses.push(line)
      totalExpenses += amount
    }
  }

  return {
    revenue,
    expenses,
    totalRevenue,
    totalExpenses,
    netIncome: totalRevenue - totalExpenses,
  }
}

export async function getBalanceSheet(tenantId: string): Promise<BalanceSheetReport> {
  const balances = await getAccountBalances(tenantId)
  const assets: AccountBalanceLine[] = []
  const liabilities: AccountBalanceLine[] = []
  const equity: AccountBalanceLine[] = []
  let totalAssets = 0
  let totalLiabilities = 0
  let totalEquity = 0
  let netIncome = 0

  for (const row of balances) {
    const amount = signedBalance(row.type, row.total_debit, row.total_credit)
    if (amount === 0) continue

    const line: AccountBalanceLine = {
      accountId: row.account_id,
      code: row.code,
      name: row.name,
      amount,
    }

    if (row.type === 'asset') {
      assets.push(line)
      totalAssets += amount
    } else if (row.type === 'liability') {
      liabilities.push(line)
      totalLiabilities += amount
    } else if (row.type === 'equity') {
      equity.push(line)
      totalEquity += amount
    } else if (row.type === 'revenue') {
      netIncome += amount
    } else if (row.type === 'expense') {
      netIncome -= amount
    }
  }

  if (netIncome !== 0) {
    equity.push({
      accountId: 'current-period-earnings',
      code: '3999',
      name: 'Current Period Earnings',
      amount: netIncome,
    })
    totalEquity += netIncome
  }

  return {
    assets,
    liabilities,
    equity,
    totalAssets,
    totalLiabilities,
    totalEquity,
    netIncome,
    totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
  }
}
