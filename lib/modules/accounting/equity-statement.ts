import { getProfitAndLoss } from './service'

export interface EquityMovement {
  label: string
  amount: number
}

export interface StatementOfChangesInEquity {
  periodLabel: string
  openingEquity: number
  netIncome: number
  otherAdjustments: number
  closingEquity: number
  movements: EquityMovement[]
  standard: string
}

export async function getStatementOfChangesInEquity(
  tenantId: string,
): Promise<StatementOfChangesInEquity> {
  const pl = await getProfitAndLoss(tenantId)
  const netIncome = pl.netIncome ?? 0
  const openingEquity = 0
  const closingEquity = openingEquity + netIncome

  return {
    periodLabel: 'Current period',
    openingEquity,
    netIncome,
    otherAdjustments: 0,
    closingEquity,
    movements: [
      { label: 'Opening balance', amount: openingEquity },
      { label: 'Profit for the period', amount: netIncome },
      { label: 'Closing balance', amount: closingEquity },
    ],
    standard: 'IAS 1 — Statement of changes in equity (simplified)',
  }
}
