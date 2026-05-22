import { query, execute, generateId } from '@/lib/db'
import { reconcileStaleMpesaIntents, type MpesaReconcileResult } from './mpesa-reconcile'

export interface ReconcileRunRow {
  id: string
  trigger_source: string
  reconciled: number
  failed: number
  matched: number
  pending_stale: number
  created_at: string
}

export async function runPlatformPaymentReconcile(
  triggerSource: 'manual' | 'cron' = 'manual',
): Promise<MpesaReconcileResult & { runId: string; pendingStale: number }> {
  const [pendingRow] = await query<{ c: number }>(
    `SELECT COUNT(*) AS c FROM payment_intents
     WHERE provider = 'mpesa' AND status IN ('pending', 'processing')
       AND created_at < DATE_SUB(NOW(), INTERVAL 2 HOUR)`,
  )
  const pendingStale = pendingRow?.c ?? 0

  const result = await reconcileStaleMpesaIntents()
  const runId = generateId()

  await execute(
    `INSERT INTO platform_payment_reconcile_runs
     (id, trigger_source, reconciled, failed, matched, pending_stale)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [runId, triggerSource, result.reconciled, result.failed, result.matched, pendingStale],
  )

  return { ...result, runId, pendingStale }
}

export async function listReconcileRuns(limit = 20): Promise<ReconcileRunRow[]> {
  return query<ReconcileRunRow>(
    `SELECT id, trigger_source, reconciled, failed, matched, pending_stale, created_at
     FROM platform_payment_reconcile_runs
     ORDER BY created_at DESC
     LIMIT ?`,
    [Math.min(limit, 100)],
  )
}

export async function getPaymentMonitorSummary() {
  const [mpesaPending] = await query<{ c: number }>(
    `SELECT COUNT(*) AS c FROM payment_intents
     WHERE provider = 'mpesa' AND status IN ('pending', 'processing')`,
  )
  const [webhooks24h] = await query<{ c: number }>(
    `SELECT COUNT(*) AS c FROM platform_webhook_events
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
  )
  const [webhooksFailed] = await query<{ c: number }>(
    `SELECT COUNT(*) AS c FROM platform_webhook_events
     WHERE status = 'failed' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
  )
  const lastRun = await query<ReconcileRunRow>(
    `SELECT id, trigger_source, reconciled, failed, matched, pending_stale, created_at
     FROM platform_payment_reconcile_runs ORDER BY created_at DESC LIMIT 1`,
  )

  return {
    mpesaPending: mpesaPending?.c ?? 0,
    webhooks24h: webhooks24h?.c ?? 0,
    webhooksFailed: webhooksFailed?.c ?? 0,
    lastRun: lastRun[0] ?? null,
  }
}
