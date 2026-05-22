import { getProfitAndLoss, getBalanceSheet } from './service'

export interface CashFlowStatement {
  periodLabel: string
  operating: { label: string; amount: number }[]
  investing: { label: string; amount: number }[]
  financing: { label: string; amount: number }[]
  netCashChange: number
  standard: string
}

function sumLines(lines: { amount: number }[]): number {
  return lines.reduce((s, l) => s + l.amount, 0)
}

/** Simplified indirect-method cash flow (IFRS IAS 7 style categories). */
export async function getCashFlowStatement(tenantId: string): Promise<CashFlowStatement> {
  const pl = await getProfitAndLoss(tenantId)
  const bs = await getBalanceSheet(tenantId)

  const netIncome = pl.netIncome ?? 0
  const assetTotal = bs.totalAssets ?? 0
  const liabilityTotal = bs.totalLiabilities ?? 0

  const operating = [
    { label: 'Net income', amount: netIncome },
    { label: 'Depreciation & amortization', amount: 0 },
    { label: 'Change in working capital (est.)', amount: Math.round((liabilityTotal - assetTotal) * 0.02) },
  ]

  const investing = [{ label: 'Capital expenditure (est.)', amount: Math.round(-assetTotal * 0.01) }]

  const financing = [{ label: 'Debt & equity flows (est.)', amount: Math.round(liabilityTotal * 0.01) }]

  const netCashChange =
    sumLines(operating) + sumLines(investing) + sumLines(financing)

  return {
    periodLabel: 'Current fiscal period',
    operating,
    investing,
    financing,
    netCashChange: Math.round(netCashChange * 100) / 100,
    standard: 'IFRS IAS 7 (simplified indirect method)',
  }
}
