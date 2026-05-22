import { query } from '@/lib/db'

export interface FraudAlert {
  transaction_id: string
  wallet_id: string
  user_id: string
  amount: number
  type: string
  reference: string
  created_at: string
  reason: string
  severity: 'warning' | 'critical'
  z_score: number
}

interface WalletTxnRow {
  id: string
  wallet_id: string
  user_id: string
  amount: number
  type: string
  reference: string
  created_at: string
}

const UNUSUAL_Z_THRESHOLD = 2.5
const ABSOLUTE_THRESHOLD_KES = 500_000

function computeStats(values: number[]): { mean: number; stddev: number } {
  if (values.length === 0) return { mean: 0, stddev: 0 }
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  if (values.length === 1) return { mean, stddev: mean * 0.5 || 1 }
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1)
  return { mean, stddev: Math.sqrt(variance) || 1 }
}

export async function detectWalletFraud(tenantId: string): Promise<FraudAlert[]> {
  const txns = await query<WalletTxnRow>(
    `SELECT t.id, t.wallet_id, w.user_id, t.amount, t.type, t.reference, t.created_at
     FROM transactions t
     INNER JOIN wallets w ON t.wallet_id = w.id
     WHERE w.tenant_id = ?
       AND t.status = 'completed'
       AND t.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
     ORDER BY t.created_at DESC
     LIMIT 200`,
    [tenantId],
  )

  if (txns.length === 0) return []

  const amounts = txns.map((t) => Number(t.amount))
  const { mean, stddev } = computeStats(amounts)
  const alerts: FraudAlert[] = []

  for (const txn of txns.slice(0, 50)) {
    const amount = Number(txn.amount)
    const zScore = (amount - mean) / stddev
    const unusuallyHigh = zScore >= UNUSUAL_Z_THRESHOLD || amount >= ABSOLUTE_THRESHOLD_KES

    if (!unusuallyHigh) continue

    alerts.push({
      transaction_id: txn.id,
      wallet_id: txn.wallet_id,
      user_id: txn.user_id,
      amount,
      type: txn.type,
      reference: txn.reference,
      created_at: String(txn.created_at),
      reason:
        amount >= ABSOLUTE_THRESHOLD_KES
          ? `Amount exceeds KES ${ABSOLUTE_THRESHOLD_KES.toLocaleString()} threshold`
          : `Amount is ${zScore.toFixed(1)}σ above recent wallet average (KES ${Math.round(mean).toLocaleString()})`,
      severity: zScore >= 3.5 || amount >= ABSOLUTE_THRESHOLD_KES * 2 ? 'critical' : 'warning',
      z_score: Math.round(zScore * 100) / 100,
    })
  }

  return alerts
}
