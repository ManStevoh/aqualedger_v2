import { query, execute, generateId } from '@/lib/db'
import { enqueueNotification } from '@/lib/notifications/enqueue'
import { logger } from '@/lib/logger'

export async function runShelfLifeAlerts(tenantId?: string): Promise<{ alerted: number }> {
  const tenantFilter = tenantId ? 'AND ib.tenant_id = ?' : ''
  const params = tenantId ? [tenantId] : []

  const batches = await query<{
    id: string
    tenant_id: string
    batch_code: string
    expiry_date: string
    days_left: number
    owner_email: string | null
  }>(
    `SELECT ib.id, ib.tenant_id, ib.batch_code, ib.expiry_date,
            DATEDIFF(ib.expiry_date, CURDATE()) as days_left,
            u.email as owner_email
     FROM inventory_batches ib
     LEFT JOIN tenant_members tm ON tm.tenant_id = ib.tenant_id AND tm.role = 'tenant_owner' AND tm.status = 'active'
     LEFT JOIN users u ON u.id = tm.user_id
     WHERE ib.expiry_date IS NOT NULL
       AND DATEDIFF(ib.expiry_date, CURDATE()) BETWEEN 0 AND 7
       AND ib.quantity_kg > 0
       ${tenantFilter}
     GROUP BY ib.id, ib.tenant_id, ib.lot_code, ib.expiry_date, u.email`,
    params,
  )

  let alerted = 0
  for (const b of batches) {
    const already = await query<{ id: string }>(
      `SELECT id FROM shelf_life_alert_log
       WHERE tenant_id = ? AND batch_id = ? AND DATE(alerted_at) = CURDATE() LIMIT 1`,
      [b.tenant_id, b.id],
    )
    if (already.length) continue

    const recipient = b.owner_email
    if (recipient) {
      try {
        await enqueueNotification({
          tenantId: b.tenant_id,
          channel: 'email',
          recipient,
          subject: `Shelf-life alert: ${b.batch_code} expires in ${b.days_left} days`,
          body: `Batch ${b.batch_code} expires on ${b.expiry_date}. FEFO dispatch recommended.`,
        })
      } catch (err) {
        logger.warn('Shelf-life alert enqueue failed', { batchId: b.id, error: err })
      }
    }

    await execute(
      `INSERT INTO shelf_life_alert_log (id, tenant_id, batch_id, lot_code, days_to_expiry, channel, recipient)
       VALUES (?, ?, ?, ?, ?, 'email', ?)`,
      [generateId(), b.tenant_id, b.id, b.batch_code, b.days_left, recipient],
    )
    alerted++
  }

  return { alerted }
}
