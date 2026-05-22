import { getWhatsAppApiUrl } from '@/lib/config/external-apis'
import { logger } from '@/lib/logger'
import type { ChannelSendResult } from './email'

export interface SendWhatsAppInput {
  to: string
  body: string
}

export async function sendWhatsApp(input: SendWhatsAppInput): Promise<ChannelSendResult> {
  const apiKey = process.env.WHATSAPP_API_KEY

  const apiUrl = getWhatsAppApiUrl()
  if (!apiKey || !apiUrl) {
    logger.info('WhatsApp stub: WHATSAPP_API_KEY / WHATSAPP_API_URL not configured', {
      to: input.to,
      bodyPreview: input.body.slice(0, 80),
    })
    return { sent: true, messageId: `wa-stub-${Date.now()}` }
  }

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: input.to, body: input.body }),
    })
    if (res.ok) {
      const data = (await res.json()) as { id?: string; messageId?: string }
      return { sent: true, messageId: data.messageId || data.id || `wa-${Date.now()}` }
    }
    logger.error('WhatsApp API failed', { status: res.status })
  } catch (err) {
    logger.error('WhatsApp gateway error', { error: err })
  }

  return { sent: false, error: 'WhatsApp delivery failed' }
}
