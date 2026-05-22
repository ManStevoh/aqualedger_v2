import { getFcmSendUrl } from '@/lib/config/external-apis'
import { logger } from '@/lib/logger'

export interface SendPushInput {
  to: string
  title: string
  body: string
}

export interface ChannelSendResult {
  sent: boolean
  error?: string
  messageId?: string
}

export async function sendPush(input: SendPushInput): Promise<ChannelSendResult> {
  if (process.env.FCM_SERVER_KEY) {
    try {
      const res = await fetch(getFcmSendUrl(), {
        method: 'POST',
        headers: {
          Authorization: `key=${process.env.FCM_SERVER_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: input.to,
          notification: { title: input.title, body: input.body },
        }),
      })
      if (res.ok) {
        const data = (await res.json()) as { message_id?: number }
        return { sent: true, messageId: String(data.message_id ?? Date.now()) }
      }
    } catch (err) {
      logger.error('FCM push failed', { error: err })
    }
  }

  logger.info('Push stub: FCM not configured', { to: input.to, title: input.title })
  return { sent: true, messageId: `push-stub-${Date.now()}` }
}
