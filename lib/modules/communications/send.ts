import { execute, generateId } from '@/lib/db'
import { sendEmailWithAttachment, type EmailAttachment } from '@/lib/channels/email'
import { sendSms } from '@/lib/channels/sms'
import { sendWhatsApp } from '@/lib/channels/whatsapp'
import { getCommunicationSettings } from './settings'

export type CommunicationChannel = 'email' | 'sms' | 'whatsapp'

export interface SendCommunicationInput {
  tenantId: string
  channel: CommunicationChannel
  recipient: string
  subject?: string
  body: string
  html?: string
  messageType?: string
  referenceType?: string
  referenceId?: string
  bcc?: string[]
  attachments?: EmailAttachment[]
  replyTo?: string
}

export interface SendCommunicationResult {
  messageId: string
  sent: boolean
  error?: string
  externalRef?: string
}

export async function logCommunicationMessage(
  input: SendCommunicationInput & {
    status: 'sent' | 'failed' | 'pending'
    externalRef?: string | null
    error?: string | null
  },
): Promise<string> {
  const id = generateId()
  await execute(
    `INSERT INTO communication_messages (
      id, tenant_id, channel, message_type, recipient, subject, body_preview,
      status, external_ref, error_message, reference_type, reference_id, sent_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.tenantId,
      input.channel,
      input.messageType || 'transactional',
      input.recipient,
      input.subject ?? null,
      input.body.slice(0, 500),
      input.status,
      input.externalRef ?? null,
      input.error?.slice(0, 500) ?? null,
      input.referenceType ?? null,
      input.referenceId ?? null,
      input.status === 'sent' ? new Date() : null,
    ],
  )
  return id
}

export async function sendCommunication(
  input: SendCommunicationInput,
): Promise<SendCommunicationResult> {
  const settings = await getCommunicationSettings(input.tenantId)
  const replyTo = input.replyTo || settings.reply_to_email || undefined
  const fromBrand = settings.brand_name || 'AquaERP'

  let result: { sent: boolean; error?: string; messageId?: string }

  if (input.channel === 'email') {
    result = await sendEmailWithAttachment({
      to: input.recipient,
      subject: input.subject || `${fromBrand} notification`,
      html: input.html || input.body,
      text: input.body,
      attachments: input.attachments,
      bcc: input.bcc,
      replyTo,
    })
  } else if (input.channel === 'sms') {
    result = await sendSms({ to: input.recipient, body: input.body })
  } else {
    result = await sendWhatsApp({ to: input.recipient, body: input.body })
  }

  const logId = await logCommunicationMessage({
    ...input,
    status: result.sent ? 'sent' : 'failed',
    externalRef: result.messageId,
    error: result.error,
  })

  return {
    messageId: logId,
    sent: result.sent,
    error: result.error,
    externalRef: result.messageId,
  }
}

export async function sendBulkEmail(
  tenantId: string,
  recipients: string[],
  subject: string,
  body: string,
  html?: string,
  opts?: { messageType?: string; referenceType?: string; referenceId?: string; bcc?: string[] },
): Promise<{ sent: number; failed: number; results: SendCommunicationResult[] }> {
  const settings = await getCommunicationSettings(tenantId)
  const bcc = [...(opts?.bcc ?? []), ...(settings.default_bcc_emails ?? [])]
  const results: SendCommunicationResult[] = []
  let sent = 0
  let failed = 0

  for (const to of recipients) {
    const r = await sendCommunication({
      tenantId,
      channel: 'email',
      recipient: to,
      subject,
      body,
      html,
      bcc: bcc.length ? bcc : undefined,
      messageType: opts?.messageType,
      referenceType: opts?.referenceType,
      referenceId: opts?.referenceId,
    })
    results.push(r)
    if (r.sent) sent++
    else failed++
  }

  return { sent, failed, results }
}
