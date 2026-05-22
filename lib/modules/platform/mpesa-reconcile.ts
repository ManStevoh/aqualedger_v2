import { execute } from '@/lib/db'

export interface MpesaReconcileResult {
  reconciled: number
  failed: number
  matched: number
}

/** Mark stale pending M-Pesa intents failed; sync succeeded intents to order payment_status */
export async function reconcileStaleMpesaIntents(): Promise<MpesaReconcileResult> {
  const failResult = await execute(
    `UPDATE payment_intents SET status = 'failed', updated_at = NOW()
     WHERE provider = 'mpesa' AND status IN ('pending', 'processing')
       AND created_at < DATE_SUB(NOW(), INTERVAL 2 HOUR)`,
  )
  const failed = failResult.affectedRows

  const matchResult = await execute(
    `UPDATE orders o
     INNER JOIN payment_intents pi ON pi.order_id = o.id AND pi.tenant_id = o.tenant_id
     SET o.payment_status = 'paid', o.updated_at = NOW()
     WHERE pi.provider = 'mpesa'
       AND pi.status IN ('succeeded', 'completed')
       AND pi.order_id IS NOT NULL
       AND o.payment_status != 'paid'`,
  )
  const matched = matchResult.affectedRows

  return { reconciled: failed + matched, failed, matched }
}
