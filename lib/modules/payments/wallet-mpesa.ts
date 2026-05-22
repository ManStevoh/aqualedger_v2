import type { Connection } from 'mysql2/promise'
import { queryOne, execute, generateId, transaction } from '@/lib/db'

function parseMetadata(raw: string | Record<string, unknown> | null): Record<string, unknown> {
  if (!raw) return {}
  if (typeof raw === 'object') return raw
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return {}
  }
}

export async function creditWalletFromMpesaIntent(
  paymentIntentId: string,
  tenantId: string,
): Promise<void> {
  const intent = await queryOne<{
    id: string
    status: string
    amount: number
    metadata: string | Record<string, unknown> | null
  }>(
    `SELECT id, status, amount, metadata FROM payment_intents
     WHERE id = ? AND tenant_id = ? AND provider = 'mpesa'`,
    [paymentIntentId, tenantId],
  )
  if (!intent || intent.status !== 'completed') return

  const meta = parseMetadata(intent.metadata)
  if (meta.purpose !== 'wallet_deposit' || meta.wallet_credited) return

  const userId = String(meta.user_id ?? '')
  if (!userId) return

  const amount = Number(meta.paid_amount ?? intent.amount)
  if (!amount || amount <= 0) return

  await transaction(async (conn: Connection) => {
    const [walletRows] = await conn.execute(
      'SELECT * FROM wallets WHERE user_id = ? AND tenant_id = ? FOR UPDATE',
      [userId, tenantId],
    )
    const wallet = (walletRows as { id: string; balance: number }[])[0]
    if (!wallet) throw new Error('Wallet not found')

    const balanceAfter = wallet.balance + amount
    const txnId = generateId()
    const txnReference = `MPESA-${paymentIntentId.slice(0, 8).toUpperCase()}`

    await conn.execute(
      `INSERT INTO transactions (
        id, wallet_id, type, amount, fee, balance_before, balance_after,
        status, reference, description
      ) VALUES (?, ?, 'deposit', ?, 0, ?, ?, 'completed', ?, ?)`,
      [
        txnId,
        wallet.id,
        amount,
        wallet.balance,
        balanceAfter,
        txnReference,
        `M-Pesa deposit (${txnReference})`,
      ],
    )

    await conn.execute('UPDATE wallets SET balance = ?, last_transaction_at = NOW() WHERE id = ?', [
      balanceAfter,
      wallet.id,
    ])
  })

  await execute(
    `UPDATE payment_intents SET metadata = JSON_MERGE_PATCH(COALESCE(metadata, '{}'), ?), updated_at = NOW()
     WHERE id = ?`,
    [JSON.stringify({ wallet_credited: true }), paymentIntentId],
  )
}
