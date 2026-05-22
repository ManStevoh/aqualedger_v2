import { query } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { enqueueNotification } from '@/lib/notifications/enqueue'

export interface BroadcastToTenantOwnersInput {
  subject: string
  body: string
  channel: 'email'
}

export interface BroadcastToTenantOwnersResult {
  enqueued: number
  recipients: string[]
}

export async function broadcastToTenantOwners(
  input: BroadcastToTenantOwnersInput,
  opts?: { userId?: string; ipAddress?: string; userAgent?: string },
): Promise<BroadcastToTenantOwnersResult> {
  const rows = await query<{ tenant_id: string; email: string }>(
    `SELECT DISTINCT t.id AS tenant_id, u.email
     FROM tenants t
     INNER JOIN tenant_members tm
       ON tm.tenant_id = t.id AND tm.role = 'tenant_owner' AND tm.status = 'active'
     INNER JOIN users u ON u.id = tm.user_id
     WHERE t.status = 'active' AND u.email IS NOT NULL AND TRIM(u.email) != ''`,
  )

  const recipients: string[] = []
  let enqueued = 0

  for (const row of rows) {
    await enqueueNotification({
      tenantId: row.tenant_id,
      channel: input.channel,
      recipient: row.email,
      subject: input.subject,
      body: input.body,
    })
    recipients.push(row.email)
    enqueued++
  }

  await logAudit({
    userId: opts?.userId,
    action: 'platform.broadcast',
    resourceType: 'broadcast',
    metadata: {
      subject: input.subject,
      channel: input.channel,
      enqueued,
      recipientCount: recipients.length,
    },
    ipAddress: opts?.ipAddress,
    userAgent: opts?.userAgent,
  })

  return { enqueued, recipients }
}
