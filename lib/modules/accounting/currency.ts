import { query, queryOne } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export interface CurrencyRate {
  id: string
  tenant_id: string | null
  base_currency: string
  quote_currency: string
  rate: number
  effective_date: string
  source: string
  created_at: string
}

export interface ConvertAmountResult {
  amount: number
  fromCurrency: string
  toCurrency: string
  rate: number
  convertedAmount: number
  effectiveDate: string
}

export async function listCurrencyRates(
  tenantId: string,
  baseCurrency = 'KES',
): Promise<CurrencyRate[]> {
  return query<CurrencyRate>(
    `SELECT * FROM currency_rates
     WHERE (${tenantWhere()} OR tenant_id IS NULL)
       AND base_currency = ?
     ORDER BY effective_date DESC, quote_currency ASC`,
    [tenantId, baseCurrency],
  )
}

export async function getLatestRate(
  tenantId: string,
  fromCurrency: string,
  toCurrency: string,
): Promise<CurrencyRate | null> {
  if (fromCurrency === toCurrency) {
    return {
      id: 'identity',
      tenant_id: tenantId,
      base_currency: fromCurrency,
      quote_currency: toCurrency,
      rate: 1,
      effective_date: new Date().toISOString().slice(0, 10),
      source: 'identity',
      created_at: new Date().toISOString(),
    }
  }

  const direct = await queryOne<CurrencyRate>(
    `SELECT * FROM currency_rates
     WHERE (${tenantWhere()} OR tenant_id IS NULL)
       AND base_currency = ? AND quote_currency = ?
     ORDER BY effective_date DESC
     LIMIT 1`,
    [tenantId, fromCurrency, toCurrency],
  )
  if (direct) return direct

  const inverse = await queryOne<CurrencyRate>(
    `SELECT * FROM currency_rates
     WHERE (${tenantWhere()} OR tenant_id IS NULL)
       AND base_currency = ? AND quote_currency = ?
     ORDER BY effective_date DESC
     LIMIT 1`,
    [tenantId, toCurrency, fromCurrency],
  )
  if (inverse && Number(inverse.rate) !== 0) {
    return {
      ...inverse,
      base_currency: fromCurrency,
      quote_currency: toCurrency,
      rate: 1 / Number(inverse.rate),
    }
  }

  return null
}

export async function convertAmount(
  tenantId: string,
  amount: number,
  fromCurrency: string,
  toCurrency: string,
): Promise<ConvertAmountResult> {
  const from = fromCurrency.toUpperCase()
  const to = toCurrency.toUpperCase()

  if (from === to) {
    const today = new Date().toISOString().slice(0, 10)
    return {
      amount,
      fromCurrency: from,
      toCurrency: to,
      rate: 1,
      convertedAmount: amount,
      effectiveDate: today,
    }
  }

  const rateRow = await getLatestRate(tenantId, from, to)
  if (!rateRow) {
    throw new Error(`No exchange rate found for ${from} → ${to}`)
  }

  const rate = Number(rateRow.rate)
  return {
    amount,
    fromCurrency: from,
    toCurrency: to,
    rate,
    convertedAmount: amount * rate,
    effectiveDate: rateRow.effective_date,
  }
}
