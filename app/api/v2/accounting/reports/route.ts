import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { accountingReportQuerySchema } from '@/lib/modules/accounting/schemas'
import {
  getTrialBalance,
  getProfitAndLoss,
  getBalanceSheet,
} from '@/lib/modules/accounting/service'
import { getCashFlowStatement } from '@/lib/modules/accounting/cash-flow'
import { getBudgetVsActual } from '@/lib/modules/accounting/budgets'
import { getStatementOfChangesInEquity } from '@/lib/modules/accounting/equity-statement'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.reports.read')
  const { searchParams } = new URL(request.url)
  const { report, fiscalYear } = accountingReportQuerySchema.parse({
    report: searchParams.get('report') ?? undefined,
    fiscalYear: searchParams.get('fiscalYear') ?? undefined,
  })

  if (report === 'budget_vs_actual') {
    const budgetVsActual = await getBudgetVsActual(ctx.tenantId, fiscalYear)
    return jsonOk({ report: 'budget_vs_actual', budgetVsActual })
  }

  if (report === 'trial_balance') {
    const trialBalance = await getTrialBalance(ctx.tenantId)
    return jsonOk({ report: 'trial_balance', trialBalance })
  }

  if (report === 'profit_loss') {
    const profitLoss = await getProfitAndLoss(ctx.tenantId)
    return jsonOk({ report: 'profit_loss', profitLoss })
  }

  if (report === 'cash_flow') {
    const cashFlow = await getCashFlowStatement(ctx.tenantId)
    return jsonOk({ report: 'cash_flow', cashFlow })
  }

  if (report === 'equity') {
    const equity = await getStatementOfChangesInEquity(ctx.tenantId)
    return jsonOk({ report: 'equity', equity })
  }

  const balanceSheet = await getBalanceSheet(ctx.tenantId)
  return jsonOk({ report: 'balance_sheet', balanceSheet })
}, 'v2/accounting/reports')
