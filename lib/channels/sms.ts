import { getAfricasTalkingSmsUrl, getTwilioMessagesUrl } from '@/lib/config/external-apis'
import { logger } from '@/lib/logger'
import type { ChannelSendResult } from './email'

export interface SendSmsInput {
  to: string
  body: string
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return `254${digits.slice(1)}`
  if (digits.startsWith('254')) return digits
  if (digits.startsWith('7')) return `254${digits}`
  return digits
}

export async function sendSms(input: SendSmsInput): Promise<ChannelSendResult> {
  const apiKey = process.env.SMS_API_KEY
  const username = process.env.AFRICASTALKING_USERNAME
  const to = normalizePhone(input.to)

  if (username && apiKey) {
    try {
      const params = new URLSearchParams({
        username,
        to,
        message: input.body.slice(0, 480),
      })
      const res = await fetch(getAfricasTalkingSmsUrl(), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          apiKey,
        },
        body: params.toString(),
      })
      const data = (await res.json()) as { SMSMessageData?: { Recipients?: { status: string; messageId?: string }[] } }
      const recipient = data.SMSMessageData?.Recipients?.[0]
      if (res.ok && recipient?.status === 'Success') {
        return { sent: true, messageId: recipient.messageId || `at-${Date.now()}` }
      }
      logger.error('Africa\'s Talking SMS failed', { status: res.status, data })
    } catch (err) {
      logger.error('SMS gateway error', { error: err })
    }
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) {
    try {
      const auth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`,
      ).toString('base64')
      const params = new URLSearchParams({
        To: `+${to}`,
        From: process.env.TWILIO_FROM,
        Body: input.body.slice(0, 1600),
      })
      const res = await fetch(getTwilioMessagesUrl(process.env.TWILIO_ACCOUNT_SID), {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        },
      )
      const data = (await res.json()) as { sid?: string }
      if (res.ok && data.sid) {
        return { sent: true, messageId: data.sid }
      }
    } catch (err) {
      logger.error('Twilio SMS error', { error: err })
    }
  }

  if (!apiKey && !username) {
    logger.info('SMS stub: no gateway configured', { to, bodyPreview: input.body.slice(0, 80) })
    return { sent: true, messageId: `sms-stub-${Date.now()}` }
  }

  return { sent: false, error: 'SMS gateway configured but delivery failed' }
}
