import { queryOne } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { notFound, conflict } from '@/lib/api-handler'
import { deliverReport } from './report-delivery'
import type { DeliveryChannel } from './report-registry'

export async function retryReportDelivery(tenantId: string, deliveryId: string) {
  const delivery = await queryOne<{
    id: string
    status: string
    channel: string
    recipient: string
    snapshot_id: string | null
    scheduled_report_id: string | null
  }>(
    `SELECT * FROM report_deliveries WHERE id = ? AND ${tenantWhere()}`,
    [deliveryId, tenantId],
  )
  if (!delivery) throw notFound('Delivery not found')
  if (delivery.status === 'sent') throw conflict('Delivery already succeeded')

  if (!delivery.snapshot_id) {
    throw conflict('Cannot retry — no snapshot linked; send report again from Reports hub')
  }

  const snap = await queryOne<{
    report_type: string
    tenant_id: string
  }>(
    `SELECT report_type, tenant_id FROM report_snapshots WHERE id = ?`,
    [delivery.snapshot_id],
  )
  if (!snap) throw notFound('Report snapshot not found')

  const channels: DeliveryChannel[] = [delivery.channel as DeliveryChannel]
  const emailRecipients = delivery.channel === 'email' ? [delivery.recipient] : []
  const phoneRecipients =
    delivery.channel === 'sms' || delivery.channel === 'whatsapp' ? [delivery.recipient] : []

  return deliverReport({
    tenantId,
    reportType: snap.report_type,
    channels,
    emailRecipients,
    phoneRecipients,
    scheduledReportId: delivery.scheduled_report_id,
    saveSnapshot: false,
  })
}
