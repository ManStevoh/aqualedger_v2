import { getResendEmailsUrl, getSendGridMailSendUrl } from '@/lib/config/external-apis'
import { logger } from '@/lib/logger'

export interface SendEmailInput {
  to: string
  subject: string
  body: string
  from?: string
  html?: string
  text?: string
  bcc?: string[]
  replyTo?: string
}

export interface EmailAttachment {
  filename: string
  content: string
  contentType?: string
}

export interface SendEmailWithAttachmentInput {
  to: string
  subject: string
  body?: string
  from?: string
  html?: string
  text?: string
  attachments?: EmailAttachment[]
  bcc?: string[]
  replyTo?: string
}

export interface ChannelSendResult {
  sent: boolean
  error?: string
  messageId?: string
}

type EmailProvider = 'resend' | 'sendgrid' | 'smtp' | 'stub'

function resolveProvider(): EmailProvider {
  const explicit = process.env.EMAIL_PROVIDER?.toLowerCase()
  if (explicit === 'resend' && process.env.RESEND_API_KEY) return 'resend'
  if (explicit === 'sendgrid' && process.env.SENDGRID_API_KEY) return 'sendgrid'
  if (explicit === 'smtp') return smtpConfigured() ? 'smtp' : 'stub'
  if (process.env.RESEND_API_KEY) return 'resend'
  if (process.env.SENDGRID_API_KEY) return 'sendgrid'
  if (smtpConfigured()) return 'smtp'
  return 'stub'
}

function smtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS,
  )
}

function defaultFrom(): string {
  return (
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    process.env.RESEND_FROM ||
    process.env.SENDGRID_FROM ||
    process.env.SMTP_USER ||
    'noreply@aquaerp.local'
  )
}

export async function sendEmail(input: SendEmailInput): Promise<ChannelSendResult> {
  return sendEmailWithAttachment({ ...input, attachments: undefined })
}

async function sendViaResend(input: SendEmailWithAttachmentInput): Promise<ChannelSendResult> {
  const from = input.from || defaultFrom()
  const text = input.text || input.body || ''
  const html = input.html || undefined

  const payload: Record<string, unknown> = {
    from,
    to: [input.to],
    subject: input.subject,
    text,
    html,
  }
  if (input.bcc?.length) payload.bcc = input.bcc
  if (input.replyTo) payload.reply_to = input.replyTo
  if (input.attachments?.length) {
    payload.attachments = input.attachments.map((a) => ({
      filename: a.filename,
      content: Buffer.from(a.content, 'utf8').toString('base64'),
    }))
  }

  const res = await fetch(getResendEmailsUrl(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const data = (await res.json()) as { id?: string; message?: string }
  if (res.ok && data.id) {
    return { sent: true, messageId: data.id }
  }
  return { sent: false, error: data.message || `Resend HTTP ${res.status}` }
}

async function sendViaSendGrid(input: SendEmailWithAttachmentInput): Promise<ChannelSendResult> {
  const from = input.from || defaultFrom()
  const text = input.text || input.body || ''
  const html = input.html

  const personalizations: Record<string, unknown>[] = [
    {
      to: [{ email: input.to }],
      ...(input.bcc?.length ? { bcc: input.bcc.map((e) => ({ email: e })) } : {}),
    },
  ]

  const content: { type: string; value: string }[] = [{ type: 'text/plain', value: text }]
  if (html) content.push({ type: 'text/html', value: html })

  const payload: Record<string, unknown> = {
    personalizations,
    from: { email: from },
    subject: input.subject,
    content,
  }
  if (input.replyTo) payload.reply_to = { email: input.replyTo }
  if (input.attachments?.length) {
    payload.attachments = input.attachments.map((a) => ({
      content: Buffer.from(a.content, 'utf8').toString('base64'),
      filename: a.filename,
      type: a.contentType || 'application/octet-stream',
      disposition: 'attachment',
    }))
  }

  const res = await fetch(getSendGridMailSendUrl(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (res.ok) {
    const messageId = res.headers.get('x-message-id') || `sg-${Date.now()}`
    return { sent: true, messageId }
  }
  const errText = await res.text()
  return { sent: false, error: errText.slice(0, 300) || `SendGrid HTTP ${res.status}` }
}

async function sendViaSmtp(input: SendEmailWithAttachmentInput): Promise<ChannelSendResult> {
  const from = input.from || defaultFrom()
  const text = input.text || input.body || ''
  const html = input.html || (input.body?.includes('<') ? input.body : undefined)

  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const attachments = (input.attachments || []).map((a) => ({
    filename: a.filename,
    content: a.content,
    contentType: a.contentType || 'application/octet-stream',
  }))

  const info = await transporter.sendMail({
    from,
    to: input.to,
    bcc: input.bcc?.join(', '),
    replyTo: input.replyTo,
    subject: input.subject,
    text,
    html,
    attachments: attachments.length > 0 ? attachments : undefined,
  })

  return { sent: true, messageId: info.messageId }
}

export async function sendEmailWithAttachment(
  input: SendEmailWithAttachmentInput,
): Promise<ChannelSendResult> {
  const provider = resolveProvider()

  if (provider === 'stub') {
    logger.info('Email stub: no provider configured', {
      to: input.to,
      subject: input.subject,
      bcc: input.bcc?.length ?? 0,
      attachments: input.attachments?.length ?? 0,
    })
    return { sent: true, messageId: `stub-${Date.now()}` }
  }

  try {
    if (provider === 'resend') return await sendViaResend(input)
    if (provider === 'sendgrid') return await sendViaSendGrid(input)
    return await sendViaSmtp(input)
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Email send failed'
    logger.error('Email send failed', { provider, to: input.to, error })
    return { sent: false, error }
  }
}

export function getEmailProviderStatus(): { provider: EmailProvider; configured: boolean } {
  const provider = resolveProvider()
  return { provider, configured: provider !== 'stub' }
}
