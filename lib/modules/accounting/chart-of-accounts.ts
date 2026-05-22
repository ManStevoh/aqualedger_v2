import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export type GlAccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'

export interface ChartAccountTemplate {
  code: string
  name: string
  type: GlAccountType
  /** Industry hint for onboarding copy */
  category?: string
}

/**
 * Default chart of accounts for every tenant (IFRS-style numbering, fisheries vertical).
 * Used at tenant creation, backfill, and lazy account resolution.
 */
export const DEFAULT_CHART_OF_ACCOUNTS: ChartAccountTemplate[] = [
  // Assets
  { code: '1000', name: 'Cash on Hand', type: 'asset', category: 'cash' },
  { code: '1010', name: 'Petty Cash', type: 'asset', category: 'cash' },
  { code: '1100', name: 'Accounts Receivable', type: 'asset', category: 'receivables' },
  { code: '1200', name: 'Inventory — Fresh Fish', type: 'asset', category: 'inventory' },
  { code: '1210', name: 'Inventory — Frozen & Processed', type: 'asset', category: 'inventory' },
  { code: '1300', name: 'Prepaid Expenses', type: 'asset', category: 'prepaid' },
  { code: '1400', name: 'M-Pesa / Mobile Money Clearing', type: 'asset', category: 'cash' },
  { code: '1500', name: 'Fixed Assets', type: 'asset', category: 'fixed_assets' },
  { code: '1510', name: 'Accumulated Depreciation', type: 'asset', category: 'fixed_assets' },
  // Liabilities
  { code: '2000', name: 'Accounts Payable', type: 'liability', category: 'payables' },
  { code: '2100', name: 'Salaries Payable', type: 'liability', category: 'payroll' },
  { code: '2110', name: 'PAYE Payable', type: 'liability', category: 'payroll' },
  { code: '2120', name: 'NHIF Payable', type: 'liability', category: 'payroll' },
  { code: '2200', name: 'VAT Payable', type: 'liability', category: 'tax' },
  { code: '2300', name: 'Accrued Expenses', type: 'liability', category: 'accruals' },
  // Equity
  { code: '3000', name: "Owner's Equity", type: 'equity', category: 'equity' },
  { code: '3100', name: 'Retained Earnings', type: 'equity', category: 'equity' },
  // Revenue
  { code: '4000', name: 'Sales Revenue — Seafood', type: 'revenue', category: 'sales' },
  { code: '4010', name: 'Sales Revenue — Processed Products', type: 'revenue', category: 'sales' },
  { code: '4020', name: 'Marketplace Commission Income', type: 'revenue', category: 'sales' },
  { code: '4100', name: 'Other Operating Income', type: 'revenue', category: 'other_income' },
  // Expenses
  { code: '5000', name: 'Cost of Goods Sold', type: 'expense', category: 'cogs' },
  { code: '5100', name: 'Payroll Expense', type: 'expense', category: 'payroll' },
  { code: '5200', name: 'Fuel & Vessel Operations', type: 'expense', category: 'operations' },
  { code: '5300', name: 'Cold Chain & Storage', type: 'expense', category: 'operations' },
  { code: '5400', name: 'Logistics & Delivery', type: 'expense', category: 'operations' },
  { code: '5500', name: 'Marketing & Sales', type: 'expense', category: 'admin' },
  { code: '5600', name: 'Repairs & Maintenance', type: 'expense', category: 'operations' },
  { code: '5700', name: 'Licenses & Compliance', type: 'expense', category: 'admin' },
  { code: '6100', name: 'Depreciation Expense', type: 'expense', category: 'fixed_assets' },
  { code: '6200', name: 'Bank & Payment Fees', type: 'expense', category: 'admin' },
  { code: '6900', name: 'Miscellaneous Expense', type: 'expense', category: 'admin' },
]

export const CHART_BY_CODE: Record<string, ChartAccountTemplate> = Object.fromEntries(
  DEFAULT_CHART_OF_ACCOUNTS.map((a) => [a.code, a]),
)

export interface SeedChartResult {
  tenantId: string
  created: number
  skipped: number
  total: number
  alreadyHadAccounts: boolean
}

export async function countGlAccounts(tenantId: string): Promise<number> {
  const row = await queryOne<{ total: number }>(
    `SELECT COUNT(*) as total FROM gl_accounts WHERE ${tenantWhere()}`,
    [tenantId],
  )
  return row?.total ?? 0
}

/**
 * Seed the standard chart for a tenant.
 * @param missingOnly — only insert accounts whose codes are not present (safe for backfill)
 */
export async function seedDefaultChartOfAccounts(
  tenantId: string,
  options?: { missingOnly?: boolean },
): Promise<SeedChartResult> {
  const missingOnly = options?.missingOnly ?? true
  const existingCount = await countGlAccounts(tenantId)

  if (!missingOnly && existingCount > 0) {
    return {
      tenantId,
      created: 0,
      skipped: DEFAULT_CHART_OF_ACCOUNTS.length,
      total: existingCount,
      alreadyHadAccounts: true,
    }
  }

  let created = 0
  let skipped = 0

  for (const account of DEFAULT_CHART_OF_ACCOUNTS) {
    const exists = await queryOne<{ id: string }>(
      `SELECT id FROM gl_accounts WHERE ${tenantWhere()} AND code = ?`,
      [tenantId, account.code],
    )
    if (exists) {
      skipped++
      continue
    }

    await execute(
      `INSERT INTO gl_accounts (id, tenant_id, code, name, type, is_system)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [generateId(), tenantId, account.code, account.name, account.type],
    )
    created++
  }

  return {
    tenantId,
    created,
    skipped,
    total: await countGlAccounts(tenantId),
    alreadyHadAccounts: existingCount > 0 && created === 0,
  }
}

/** Backfill all tenants missing any standard account codes */
export async function seedChartForAllTenants(): Promise<{ tenants: number; accountsCreated: number }> {
  const tenants = await query<{ id: string }>(`SELECT id FROM tenants WHERE status = 'active'`)
  let accountsCreated = 0
  for (const t of tenants) {
    const result = await seedDefaultChartOfAccounts(t.id, { missingOnly: true })
    accountsCreated += result.created
  }
  return { tenants: tenants.length, accountsCreated }
}
